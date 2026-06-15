# Admin Panel

The admin lives at the URL set in `NEXT_PUBLIC_ADMIN_ROUTE` (default `/configure-deafult-here`). Visiting `/admin` directly redirects to `/`. The full authentication flow, the rate limit, the honeypot, the session revocation, and the audit log are all on the backend — see [backend/AUTH-AND-SECURITY.md](../backend/AUTH-AND-SECURITY.md). This doc is just about the frontend.

## Files

```
app/admin/
├── layout.tsx                   # Auth guard + sidebar nav with icons
├── page.tsx                     # Dashboard
├── settings/page.tsx            # Change password / username
├── security/page.tsx            # Security log + audit viewer
├── subscribers/page.tsx         # Newsletter subscriber list with filters
├── contacts/page.tsx            # Contact form submissions with reply
├── newsletter/
│   └── send/
│       ├── page.tsx             # Compose and send orchestrator
│       └── _components/
│           ├── ui.tsx            # Shared: Field, Pill, constants, extractTags
│           ├── templates.ts      # 8 pre-built email templates
│           ├── TemplatePicker.tsx
│           ├── ColorSidebar.tsx  # 12-color palette sidebar
│           ├── PreviewPane.tsx   # Step 02: render and preview
│           ├── RecipientSelector.tsx  # Step 03: filter and pick recipients
│           └── JobProgress.tsx   # Post-send progress with polling
└── login/
    ├── page.tsx                 # Step orchestrator
    └── _components/
        ├── CredentialsStep.tsx
        ├── OtpStep.tsx
        ├── ChangePasswordStep.tsx
        ├── ForgotStep.tsx
        ├── ResetStep.tsx
        └── ui.tsx               # Field, TextInput, PasswordInput, ErrorBox,
                                 #   InfoBox, SubmitButton, BackLink, HoneypotField
```

## Auth guard

`app/admin/layout.tsx` is a client component that runs a single effect on mount:

```tsx
const [mounted, setMounted] = useState(false);
const [authed, setAuthed] = useState(false);

useEffect(() => {
  setMounted(true);
  setAuthed(!!getToken());
}, []);
```

Until `mounted` is `true` the layout renders a neutral spinner. This avoids a "Redirecting to login..." flash on the first paint of the dashboard (the SSR pass has no `localStorage`, so without the `mounted` flag every refresh briefly showed the redirect message). After mount, if there's no token the layout pushes to `${ADMIN_ROUTE}/login` via Next's `router.replace()`.

## Sidebar navigation

The `layout.tsx` renders a fixed sidebar on desktop (sticky, with expand-on-hover behaviour when collapsed) and a slide-in drawer on mobile. The sidebar stores collapse and pin preferences in `localStorage`. Navigation entries:

| Label | Route | Icon |
|---|---|---|
| Dashboard | `${ADMIN_ROUTE}` | Grid |
| Subscribers | `${ADMIN_ROUTE}/subscribers` | Users |
| Contacts | `${ADMIN_ROUTE}/contacts` | Inbox |
| Send | `${ADMIN_ROUTE}/newsletter/send` | Mail |
| Settings | `${ADMIN_ROUTE}/settings` | Gear |
| Security Log | `${ADMIN_ROUTE}/security` | Shield |

## Step state (login)

The login page holds a discriminated step:

```ts
type Step = "credentials" | "otp" | "change-password" | "forgot" | "reset";
```

Plus the form values (`username`, `password`, `otp`, `newPassword`, `confirmPassword`, `resetEmail`, `resetToken`), the single `honeypot` value shared by every step, and the usual `loading` / `error` / `info` flags.

Each handler is short: validate the honeypot, set `loading`, call the matching `admin-api` function, on success either advance the step or `window.location.href` to `ADMIN_ROUTE`, on error set `friendlyError(err, "<context>")`.

## Honeypot

`HoneypotField` is a hidden `<input name="website" />` placed inside every form. It uses `position: absolute; left: -10000px` (not `display: none`, which some bots detect), `tabIndex={-1}`, `autoComplete="off"`, and `aria-hidden="true"` on the wrapping `<div>`. The form's value is always sent to the server (`website: honeypot` in the POST body) so the backend can reject a non-empty value with 400.

The frontend also short-circuits if the field is filled — it shows a friendly error and never makes the API call. The server check is the real defense; the frontend check is just for snappier UX.

## Friendly errors

Every catch block uses `friendlyError(err, context)` instead of `err.message`. The helper picks a random line from a per-context bucket so:

- Bad password → "Wrong combo. The bouncer isn't letting you in." (or one of two siblings)
- Expired OTP → "That code didn't work. Maybe try a fresh one?"
- Real network failure (TypeError from fetch) → "Connection is being shy right now." (or one of two siblings)
- Anything else → "Plot twist: that didn't work." (or one of two siblings)

No "we / us / our" anywhere — the messages are in third person because the site is a personal portfolio, not a SaaS.

## Settings page

`app/admin/settings/page.tsx` is a small form for changing the password from inside the dashboard. It uses the same shared `HoneypotField` + `friendlyError` + the `changePassword` API call. On success it shows a success line and clears the inputs.

## Subscribers page

`app/admin/subscribers/page.tsx` lists newsletter subscribers in a filterable table. Calls `GET /api/community/newsletter` and `GET /api/community/newsletter/stats`.

Features:
- Four stat tiles (Total, Active, Inactive, Top Tag)
- Interest tag breakdown with colour-coded chips
- Filter bar: search by email or name, filter by active/inactive status
- Per-row actions: enable/disable subscription, delete subscriber (with confirmation)
- Export button (downloads JSON)
- Direct link to the Send page

Every destructive action shows a confirmation modal before executing.

## Contacts page

`app/admin/contacts/page.tsx` lists contact form submissions. Calls `GET /api/community/contacts` and `GET /api/community/contacts/stats`.

Features:
- Four stat tiles (Total, Unreplied, Replied, Spam)
- Filter bar: full-text search (name, email, subject, message), spam status filter
- Expandable rows — click to read the full message body
- Status badges: spam (sienna), replied (teal), unreplied (ink)
- Per-row actions: Reply, toggle replied/unreplied, toggle spam/not-spam, delete
- All actions trigger a `ConfirmationModal` with context-specific copy before executing
- Reply opens a `ReplyModal` with the original message quoted, an HTML compose textarea, and an optional file attachment input

**Reply flow:**
1. Click Reply → `ReplyModal` opens showing the original message
2. Compose a reply in HTML (plain text auto-derived on the backend)
3. Optionally attach a file — selected locally, encoded as base64, sent as `attachment: {filename, content_base64}` in the POST body
4. Sends via `POST /api/community/contacts/<id>/reply` — backend dispatches through SMTP from `contact@lusansapkota.com.np` with an auto-appended signature
5. On success the contact is marked `is_replied=true` and the table reloads

## Newsletter Compose and Send

`app/admin/newsletter/send/page.tsx` is a three-step workflow (compose → preview → recipients → send). Calls `GET /api/community/newsletter/stats`, `GET /api/community/newsletter?active=1`, `POST /api/community/newsletter/preview`, `POST /api/community/newsletter/send`, and `GET /api/community/newsletter/send/status/<job_id>`.

**Step 01 — Message:**
- 8 pre-built HTML templates selectable via a `TemplatePicker` button bar (Quick Update, Project Launch, Tutorial Drop, Monthly Roundup, Welcome, Event Invite, Featured Work, Store Release)
- Each template includes the platform logo and uses brand colours (sienna, teal, yellow, cream)
- Editable subject line and HTML body textarea
- `{name}` and `{unsubscribe_url}` placeholders are substituted per recipient at send time

**Step 02 — Preview:**
- Renders the composed HTML via the backend preview endpoint with a sample recipient
- Preview pane with `max-height: 500px` and scroll for long content
- Read-only — no emails are sent during preview

**Step 03 — Recipients:**
- Four filter modes: active only, all (with optional inactive toggle), by interest tag, by hand (checkbox list with search)
- Live receipt count updated via `useMemo`
- Interest tags appear as toggle buttons with subscriber counts

**Sending:**
- Send button opens a confirmation modal with the subject and recipient count
- On confirmation, the body is POSTed to the backend which spawns a background thread
- The UI transitions to `JobProgress` which polls `/send/status/<job_id>` every 1.5 seconds
- Progress bar, sent/failed/total counters update in real time
- On completion, links to the Subscribers page or "Compose another"

**Color sidebar:** A floating palette button (bottom-right) opens a slide-in sidebar listing all 12 brand colours with hex values, CSS variable names, and usage descriptions. Intended as a quick reference while writing HTML templates.

## Token storage

The bearer token is stored in `localStorage` under `admin_token`. The `authFetch` wrapper in `admin-api.ts` reads it on every call, sends `Authorization: Bearer <token>`, and on a 401 it clears the token and hard-redirects to `${ADMIN_ROUTE}/login`.

## Build

`npm run build` produces a Turbopack output. If the build fails on a null byte in one of the step components, it means an Edit tool round-trip introduced a `\0` somewhere — rewrite the file with `Write` and the build passes.

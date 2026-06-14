# Admin Panel

The admin lives at the URL set in `NEXT_PUBLIC_ADMIN_ROUTE` (default `/configure-deafult-here`). Visiting `/admin` directly redirects to `/`. The full authentication flow, the rate limit, the honeypot, the session revocation, and the audit log are all on the backend — see [backend/AUTH-AND-SECURITY.md](../backend/AUTH-AND-SECURITY.md). This doc is just about the frontend.

## Files

```
app/admin/
├── layout.tsx                # Auth guard
├── page.tsx                  # Dashboard
├── settings/page.tsx         # Change password
└── login/
    ├── page.tsx              # Step orchestrator
    └── _components/
        ├── CredentialsStep.tsx
        ├── OtpStep.tsx
        ├── ChangePasswordStep.tsx
        ├── ForgotStep.tsx
        ├── ResetStep.tsx
        └── ui.tsx            # Field, TextInput, PasswordInput, ErrorBox,
                              #   InfoBox, SubmitButton, BackLink, HoneypotField
```

The `_components` folder is a Next.js App Router convention — files starting with `_` are private to the route and not exposed as routes.

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

## Step state

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

## Token storage

The bearer token is stored in `localStorage` under `admin_token`. The `authFetch` wrapper in `admin-api.ts` reads it on every call, sends `Authorization: Bearer <token>`, and on a 401 it clears the token and hard-redirects to `${ADMIN_ROUTE}/login`.

> **Known limitation**: `localStorage` is readable by any JS running in the same origin. The admin panel itself has no third-party scripts and the Content-Security-Policy from the backend is `default-src 'none'`, so a malicious script would have to come from the frontend build. A future improvement is to move the token to an `httpOnly` cookie issued by the backend (the server would then set the cookie on `verify-otp` success and clear it on `/logout`); see [backend/AUTH-AND-SECURITY.md](../backend/AUTH-AND-SECURITY.md#what-we-explicitly-do-not-do) for the open items.

## Build

`npm run build` produces a Turbopack output. If the build fails on a null byte in one of the step components, it means an Edit tool round-trip introduced a `\0` somewhere — rewrite the file with `Write` and the build passes.

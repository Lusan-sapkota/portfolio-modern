# Frontend Architecture

Next.js 16 App Router. The "pages" are React Server Components by default, with `"use client"` opt-ins for anything interactive.

## Tree

```
frontend/
├── next.config.ts              # Rewrites + redirects (hides /admin)
├── app/
│   ├── layout.tsx              # Root <html> + global CSS
│   ├── page.tsx                # /  → <HomeShell>
│   ├── globals.css             # CSS variables, base styles, book shadows
│   │
│   ├── components/             # All UI (client + server)
│   │   ├── HomeShell.tsx       # Owns ActiveSectionContext
│   │   ├── Nav.tsx
│   │   ├── Hero.tsx
│   │   ├── BookSection.tsx     # Sticky stage, scroll progress owner
│   │   ├── BookPage.tsx        # 3D page-flip wrapper
│   │   ├── BookContext.tsx     # Progress + section context
│   │   ├── ActiveSectionContext.tsx
│   │   ├── LenisProvider.tsx
│   │   ├── useColorScheme.ts
│   │   ├── About.tsx
│   │   ├── Experience.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Skills.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Education.tsx
│   │   ├── Contact.tsx
│   │   └── Platforms.tsx
│   │
│   ├── admin/                  # The hidden admin panel
│   │   ├── layout.tsx          # Auth guard (client component)
│   │   ├── page.tsx            # Dashboard
│   │   ├── settings/page.tsx   # Change password
│   │   └── login/
│   │       ├── page.tsx        # Orchestrates the step components
│   │       └── _components/
│   │           ├── CredentialsStep.tsx
│   │           ├── OtpStep.tsx
│   │           ├── ChangePasswordStep.tsx
│   │           ├── ForgotStep.tsx
│   │           ├── ResetStep.tsx
│   │           └── ui.tsx      # Field, TextInput, PasswordInput, ErrorBox,
│   │                           #   InfoBox, SubmitButton, BackLink, HoneypotField
│   │
│   └── lib/
│       ├── admin-api.ts        # Token storage + auth fetch wrapper
│       ├── friendly-errors.ts  # Playful error message bucket per context
│       └── motion.ts           # Shared Framer Motion presets
│
└── public/                     # Static assets (logos, hero photos)
```

## Hidden admin route

The admin panel is hidden behind a `NEXT_PUBLIC_ADMIN_ROUTE` prefix. `next.config.ts`:

```ts
const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: `${ADMIN_ROUTE}/:path*`, destination: "/admin/:path*" },
      { source: `${ADMIN_ROUTE}`,          destination: "/admin" },
    ];
  },
  async redirects() {
    return [
      { source: "/admin",         destination: "/", permanent: false },
      { source: "/admin/:path*",  destination: "/", permanent: false },
    ];
  },
};
```

The result:
- Visiting `/configure-deafult-here` (or whatever you set) → serves the admin panel.
- Visiting `/admin` directly → 307 redirect to `/`.

The app's own internal links never mention `/admin`. Everything in the admin section uses `ADMIN_ROUTE` (imported from the env).

## Data flow

Public homepage uses static data from `HomeShell` and its child components — no API calls. The data is hand-curated and lives in the same files as the components.

The admin panel is the only consumer of the backend API. It uses a single thin wrapper in `app/lib/admin-api.ts`:

```ts
const API = process.env.NEXT_PUBLIC_API_URL;

export async function login(username, password, website = "") { ... }
export async function verifyOtp(otp, username = "admin", website = "") { ... }
export async function changePassword(current, next, website = "") { ... }
export async function forgotPassword(email, website = "") { ... }
export async function resetPassword(token, next, website = "") { ... }
```

The token is stored in `localStorage` under `admin_token`. `authFetch()` adds `Authorization: Bearer <token>` to every authenticated request and clears the token + redirects to `/login` on 401.

## Error UX

Errors are not shown raw. The `friendlyError(err, context)` helper in `app/lib/friendly-errors.ts` maps a thrown `Error` to a randomly-picked line from a per-context bucket (`login`, `otp`, `changePassword`, `forgot`, `reset`, `logout`, `network`, `generic`). All messages are written in third person — no "we / us / our" — and avoid leaking server error text to the client.

A thrown `TypeError` (which is what `fetch` throws on a real network or CORS-blocked read) routes to the `network` bucket. Anything else routes to the named context.

## Component-split login

The login flow has five discrete steps and a small set of shared inputs. To keep the page file readable, each step is its own component under `app/admin/login/_components/`:

- `CredentialsStep` — username + password
- `OtpStep` — 6-digit OTP
- `ChangePasswordStep` — forced on first login
- `ForgotStep` — request a reset token
- `ResetStep` — paste the token + new password

`page.tsx` owns the step state (`"credentials" | "otp" | "change-password" | "forgot" | "reset"`), the form values, the loading/error/info flags, and the single `honeypot` value shared across every form.

## Styling

- Tailwind for utility classes (`flex`, `gap-5`, `text-xs`, etc.)
- CSS variables for the palette (`var(--color-ink)`, `var(--color-sienna)`)
- Inline `style={{ ... }}` only when the value is dynamic (motion variants, palette references) or when a CSS variable needs to be read at runtime

Inline `style` is used for color references in the admin login page because the variables invert in dark mode and we want the brand to stay readable in both modes.

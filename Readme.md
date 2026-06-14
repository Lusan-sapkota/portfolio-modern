# Portfolio Modern

A modern rewrite of the personal portfolio at [lusansapkota.com.np](https://lusansapkota.com.np), replacing the older Flask app ([../portfolio-prod](../portfolio-prod)). The new stack keeps the original three-platform structure (wiki, git, store) and adds a fully-featured admin panel.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | [Lcore 0.0.4](https://lcore.lusansapkota.com.np) + PostgreSQL + SQLAlchemy 2.0 + Alembic | Tiny WSGI framework, sync typed ORM, no service/repo scaffolding. Postgres for dev too — no SQLite. |
| Frontend | Next.js 16 + TypeScript + Tailwind | App Router, RSC by default, `localStorage` for token state. |
| Auth | HMAC-SHA256 session tokens + SMTP OTP + PBKDF2 600k | See [docs/backend/AUTH-AND-SECURITY.md](./docs/backend/AUTH-AND-SECURITY.md) for the full threat model. |

## Repo layout

```
.
├── backend/                 # Lcore + Postgres
├── frontend/                # Next.js 16
├── deploy/                  # Dockerfile + compose scaffolds
├── docs/                    # All documentation
└── Readme.md                # this file
```

## Quick start (dev)

```bash
# Backend
cd backend
cp .env.example .env                     # set DATABASE_URL + ADMIN_SECRET_KEY
pip install -r requirements.tzt
make upgrade                             # apply migrations
make seed                                # creates the single admin, prints a one-time password
make run                                 # http://localhost:8080

# Frontend (in a second terminal)
cd frontend
cp .env.example .env.local               # set NEXT_PUBLIC_API_URL
npm install
npm run dev                              # http://localhost:3000
```

The default admin URL is `http://localhost:3000/configure-deafult-here` — change `ADMIN_ROUTE` / `NEXT_PUBLIC_ADMIN_ROUTE` to the same value on both sides to keep it hidden.

## Documentation

All docs live under `docs/`. Each topic is its own file with a focused scope.

### Backend

| Doc | Covers |
|---|---|
| [SETUP.md](./docs/backend/SETUP.md) | Install, env vars, Postgres, migrations, seed, Makefile targets |
| [ARCHITECTURE.md](./docs/backend/ARCHITECTURE.md) | Lcore mount structure, response helpers, data model, single-admin constraint |
| [AUTH-AND-SECURITY.md](./docs/backend/AUTH-AND-SECURITY.md) | Threat model, password storage, token format, session revocation, OTP, rate limit, CORS, security headers, honeypot, audit log |
| [API-REFERENCE.md](./docs/backend/API-REFERENCE.md) | Every admin route, request/response shape, error codes |

### Frontend

| Doc | Covers |
|---|---|
| [SETUP.md](./docs/frontend/SETUP.md) | Install, env vars, scripts, theme |
| [ARCHITECTURE.md](./docs/frontend/ARCHITECTURE.md) | App Router tree, hidden admin route, data flow, error UX, component-split login |
| [ADMIN-PANEL.md](./docs/frontend/ADMIN-PANEL.md) | Auth guard, step state, honeypot, friendly errors, token storage |
| [BOOK-EFFECT.md](./docs/frontend/BOOK-EFFECT.md) | The 3D page-flip scroll effect on the homepage |

### Deploy

| Doc | Covers |
|---|---|
| [DEPLOY.md](./docs/deploy/DEPLOY.md) | Reverse proxy, env, DB, backup, hardening checklist, rollback |

## Notes on the rewrite vs `portfolio-prod`

- The Flask app exposed only one public surface (the portfolio itself). The new stack adds an authenticated admin so the same single deployment can write to the DB.
- The platform sub-apps (`/wiki`, `/git`, `/store`) are intentionally simple read-only wrappers around the local data — no third-party auth, no per-user state.
- The admin route is hidden behind a configurable prefix (default `/configure-deafult-here`) plus a Next.js rewrite, so the URL isn't a fixed target.
- OTP is a real flow (not a dev print), but the SMTP send is silent — if mail isn't configured, login returns 400 with no OTP fallback.

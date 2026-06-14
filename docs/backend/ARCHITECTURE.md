# Backend Architecture

Lcore is a tiny WSGI framework — `Lcore()` is the app, `app.mount(prefix, sub_app)` nests a sub-app under a URL prefix, and `app.use(MiddlewareClass(...))` registers middleware on the pipeline. There is **no** "controller / service / repository" scaffolding — the framework is closer to Flask, and the code follows that shape on purpose.

## Tree

```
backend/
├── main.py                # Root app. CORSMiddleware, mounts sub-apps.
├── seed.py                # One-time admin seeder. Refuses duplicates.
├── Makefile
├── alembic.ini
├── pyproject.toml
├── requirements.tzt
├── .env.example
│
├── admin/                 # Sub-app: hidden admin panel
│   ├── __init__.py        # App instance, CORS, auth guard, rate limit, all routes
│   ├── auth.py            # HMAC tokens, OTP, password hashing, change/reset
│   ├── audit.py           # log_action() writes to audit_logs
│   ├── rate_limit.py      # Sliding-window in-memory limiter (proxy-trust aware)
│   ├── db_helper.py       # session_scope() context manager
│   ├── helpers.py         # ok / created / not_found / bad_request / unauthorized / conflict
│   ├── dashboard.py       # GET /api/dashboard/
│   ├── projects.py        # /api/projects/*
│   ├── categories.py      # /api/categories/*
│   ├── content.py         # /api/content/* (skills, experience, education, …)
│   ├── community.py       # /api/community/* (contacts, newsletter)
│   ├── wiki.py            # /api/wiki/* (articles, categories)
│   └── cli.py             # `make reset-admin`
│
├── platforms/             # Sub-apps mounted at /wiki, /git, /store
│   ├── wiki.py
│   ├── git.py
│   └── store.py
│
├── db/
│   ├── session.py         # engine, SessionLocal, Base. Validates DATABASE_URL.
│   └── models.py          # All ORM models (Mapped[…] typed, SQLAlchemy 2.0)
│
└── migrations/
    ├── env.py
    ├── script.py.mako
    └── versions/          # 0001_initial → 0004_audit_logs
```

## Mount order

`main.py` mounts in this order:

```python
app = Lcore()
app.use(CORSMiddleware(...))    # pre-routing, sees Origin, returns 204 for OPTIONS
app.mount("/wiki", wiki)
app.mount("/git",   git)
app.mount("/store", store)
app.mount(ADMIN_ROUTE, admin)   # default /configure-deafult-here
```

When a request arrives, the pre-routing middleware runs first. For an OPTIONS preflight, the middleware short-circuits with 204 + CORS headers and the route handler is never called. For actual GET/POST/etc, routing matches the registered route, fires any module-scoped `before_request` hooks, runs the handler, then runs `after_request` hooks.

## Module hooks vs. app hooks

Lcore distinguishes **app** hooks (run on every request to the app) and **module** hooks (run only for routes registered under a mount prefix). The admin sub-app uses module hooks for its auth guard so platform routes (`/wiki`, `/git`, `/store`) never trigger admin rate limits or CORS for the admin origin.

## Sub-app isolation

Each sub-app has its own `before_request` / `after_request` registration. The CORS configuration in `admin/__init__.py` is **only** for the admin sub-app. If you later need CORS for `/wiki` or `/git`, register it on those sub-apps too — don't reach into the parent from the sub-app.

## Response shape

All admin endpoints return JSON. Status codes follow HTTP conventions:

| Code | When |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (e.g. successful DELETE) |
| 400 | Validation error |
| 401 | Auth required or invalid |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate) |
| 429 | Rate limited |
| 500 | Unhandled exception |

The `helpers.py` module exposes one function per status — `ok(data)`, `created(data)`, `bad_request(msg)`, etc. They set `response.status` and return the payload as a dict (Lcore serializes dicts to JSON). **Do not return tuples** like `(data, 401)` — Lcore will treat that as the body and you'll get a 200 with `null` in the body.

## Data model

`db/models.py` contains 16 typed ORM models. The current set:

| Model | Purpose |
|---|---|
| `User` | The single admin. Holds password hash, OTP/reset tokens, session-revocation timestamp. |
| `Project` | Portfolio project (title, slug, GitHub URL, stars, forks, status). |
| `Category` | Project category (name, slug, color). |
| `Skill` | Skill chip (name, level, category). |
| `Experience` | Work / freelance / open-source entries. |
| `Education` | Degrees / certifications. |
| `Testimonial` | Quoted testimonials with avatar / company. |
| `SocialLink` | One row per social profile. |
| `Personal` | Singleton row holding name, tagline, hero copy, about text. |
| `SEOSetting` | Per-page SEO overrides. |
| `Contact` | Contact-form submissions (with spam flag, read flag). |
| `Newsletter` | Newsletter subscribers. |
| `WikiArticle` | Wiki content with markdown body. |
| `WikiCategory` | Wiki category with color. |
| `DonationProject` | Donation campaign (goal, currency). |
| `Donation` | Individual donation record. |
| `AuditLog` | Append-only log of auth events and admin actions. |

A partial unique index (`one_admin_only`) on `users` enforces "at most one admin" at the database layer:

```sql
CREATE UNIQUE INDEX one_admin_only ON users ((TRUE)) WHERE is_admin = TRUE
```

The seeder checks this in application code too (`admin_count > 0 → refuse`), so a misconfigured second seed attempt fails fast with a clear message instead of an opaque constraint violation.

## Why no service / repository layer

Lcore's request flow is a single function call. Splitting things into `Services` and `Repositories` for a 16-table CRUD API adds files without adding value — the route handler is small, the ORM session is right there, and a transaction is the unit of work. If a particular endpoint grows complex logic (e.g. the GitHub sync), that logic lives as a helper function in the route's own module, not in a separate `services/github.py`. This keeps the call chain short and the diff small.

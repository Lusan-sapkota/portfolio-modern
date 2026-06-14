# Lcore Backend

Built with [Lcore](https://lcore.lusansapkota.com.np) (v0.0.4+), a lightweight Python web framework.

## Stack

- **[Lcore](https://lcore.lusansapkota.com.np)** — WSGI framework, zero-dep
- **PostgreSQL** — production DB (no SQLite, even in dev)
- **SQLAlchemy 2.0** — sync ORM (the Python equivalent of Prisma)
- **Alembic** — versioned migrations
- **psycopg2** — Postgres driver
- **python-dotenv** — env management
- **smtplib** — OTP email delivery
- **requests** — GitHub API proxy

## Database Setup

**No SQLite, even in development.** Use a real Postgres server.

The project ships with two env templates:
- **`.env.development`** — for Neon.tech free tier (or any cloud Postgres)
- **`.env.production`** — for self-hosted Postgres on your VPS

```bash
# 1. Create a free Neon project at https://neon.tech
# 2. Copy the connection string from Neon dashboard
# 3. Set DATABASE_URL in .env
make dev                              # copies .env.development to .env
# Edit .env and paste your Neon connection string

# 4. Run migrations
make upgrade                          # applies all pending migrations

# 5. Start the server
make run                              # starts on :8080
```

The server reads `.env` on startup and creates tables if they don't exist.

## Environment Workflow

| Stage | Database | Source |
|---|---|---|
| Local dev | Neon.tech free tier | `.env.development` → `.env` |
| Production | Self-hosted Postgres on VPS | `.env.production` → `.env` |

The `DATABASE_URL` format is identical for both, so the same code works everywhere. Just swap the connection string.

### Switching environments

```bash
# Use Neon (dev)
cp .env.development .env

# Use self-hosted (prod)
cp .env.production .env
```

## Running

```bash
cd backend
pip install -r requirements.tzt  # or: uv sync
python main.py
```

Server starts on `http://0.0.0.0:8080`.

## Migrations

```bash
# After changing db/models.py
alembic revision --autogenerate -m "describe change"
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Architecture


```
main.py              — root app, mounts platform sub-apps and admin
platforms/
  wiki.py            — wiki sub-app (articles, search, categories)
  git.py             — git sub-app (projects, GitHub API proxy)
  store.py           — store redirect
admin/
  __init__.py        — admin app, auth guard, mounts all sub-apps
  auth.py            — HMAC token auth + OTP via SMTP
  db_helper.py       — SQLAlchemy session context manager
  dashboard.py       — stats endpoint (Postgres queries)
  projects.py        — projects + GitHub refresh (Postgres CRUD)
  categories.py      — categories CRUD (Postgres)
  content.py         — skills, experience, education, testimonials, social, personal, seo, donations CRUD
  wiki.py            — wiki articles + categories CRUD
  community.py       — contacts, newsletter CRUD
  helpers.py         — response helpers (created, not_found, bad_request, etc.)
db/
  session.py         — SQLAlchemy engine, session factory
  models.py          — ORM models (projects, categories, skills, ...)
migrations/          — Alembic migrations
  versions/0001_initial.py
bootstrap.py         — env loader, DB readiness check
alembic.ini
```

## Platform Routes

### Wiki (`/wiki`)

| Route | Method | Description |
|---|---|---|
| `/wiki/` | GET | Wiki index |
| `/wiki/search` | GET | Search articles |
| `/wiki/article/<id>` | GET | Article detail |
| `/wiki/random` | GET | Random article |
| `/wiki/explore` | GET | Explore articles |
| `/wiki/categories` | GET | List categories |

### Git (`/git`)

| Route | Method | Description |
|---|---|---|
| `/git/` | GET | Git index (projects) |
| `/git/search` | GET | Search projects |
| `/git/project/<id>` | GET | Project detail |
| `/git/api/projects` | GET | List all projects |
| `/git/api/repos` | GET | Live GitHub repos (user: Lusan-sapkota) |
| `/git/api/repo/<user>/<repo>` | GET | Single GitHub repo detail |

### Store (`/store`)

| Route | Method | Description |
|---|---|---|
| `/store/` | GET | Redirects to store.lusansapkota.com.np |
| `/store/info` | GET | Store metadata |

### Root

| Route | Method | Description |
|---|---|---|
| `/hello` | GET | Health check |
| `/platforms` | GET | List all connected platforms |

## Platforms (3)

As in the original Flask portfolio (`portfolio-prod`), three platforms are connected:

1. **Wiki** (`wiki.lusansapkota.com.np`) — knowledge base, articles, categories
2. **Git** (`git.lusansapkota.com.np`) — project showcase with live GitHub data
3. **Store** (`store.lusansapkota.com.np`) — external store redirect

## Admin Panel

The admin panel is mounted on a configurable route to keep it hidden from crawlers.

**Default route**: `/configure-deafult-here`  
**Override**: set `ADMIN_ROUTE` in `.env` (e.g. `ADMIN_ROUTE=/my-secret-dashboard`)

### Authentication

```
POST /configure-deafult-here/login  {"username": "admin", "password": "admin"}  -> {token: "..."}
```

All other admin endpoints require `Authorization: Bearer <token>`. Tokens expire after 2 hours.

### Admin API Routes

All routes require auth unless noted otherwise.

#### Dashboard
| Route | Method | Description |
|---|---|---|
| `api/dashboard/` | GET | Overview stats across all entities |

#### Projects
| Route | Method | Description |
|---|---|---|
| `api/projects/` | GET, POST | List / create projects |
| `api/projects/<id>` | GET, PUT, DELETE | CRUD single project |
| `api/projects/<id>/refresh-github` | POST | Refresh GitHub stars/forks |

#### Categories
| Route | Method | Description |
|---|---|---|
| `api/categories/` | GET, POST | List / create categories |
| `api/categories/<id>` | GET, PUT, DELETE | CRUD single category |

#### Content (Skills, Experience, Education, Testimonials, Social, SEO, Donations)
| Route | Method | Description |
|---|---|---|
| `api/content/skills` | GET, POST | CRUD skills |
| `api/content/skills/<id>` | GET, PUT, DELETE | CRUD single skill |
| `api/content/experiences` | GET, POST | CRUD experiences |
| `api/content/education` | GET, POST | CRUD education |
| `api/content/testimonials` | GET, POST | CRUD testimonials |
| `api/content/social` | GET, POST | CRUD social links |
| `api/content/seo` | GET, POST | CRUD SEO settings |
| `api/content/donation-projects` | GET, POST | CRUD donation projects |
| `api/content/donations` | GET, POST | CRUD donations |
| `api/content/personal` | GET, PUT | Read/update personal info (singleton) |

#### Wiki Admin
| Route | Method | Description |
|---|---|---|
| `api/wiki/articles` | GET, POST | CRUD wiki articles |
| `api/wiki/articles/<id>` | GET, PUT, DELETE | CRUD single article |
| `api/wiki/articles/random` | GET | Random article |
| `api/wiki/categories` | GET, POST | CRUD wiki categories |
| `api/wiki/categories/<id>` | GET, PUT, DELETE | CRUD single category |

#### Community
| Route | Method | Description |
|---|---|---|
| `api/community/contacts` | GET | List contacts (filters: spam, search) |
| `api/community/contacts/submit` | POST | Submit contact form |
| `api/community/contacts/<id>` | GET, PUT, DELETE | CRUD single contact |
| `api/community/newsletter` | GET | List subscribers (filters: active, search) |
| `api/community/newsletter/subscribe` | POST | Subscribe to newsletter |
| `api/community/newsletter/<id>` | PUT, DELETE | Manage subscriber |

#### Data Export/Import
| Route | Method | Description |
|---|---|---|
| `api/data/export` | GET | Download all data as zip |
| `api/data/import` | POST | Upload zip to restore data |

# Backend Setup

Lcore 0.0.4 + PostgreSQL + SQLAlchemy 2.0 + Alembic. No SQLite — Postgres everywhere, even in dev.

## Stack

| Layer | Tech |
|---|---|
| Framework | [Lcore](https://lcore.lusansapkota.com.np) 0.0.4 (WSGI, zero-dep) |
| ORM | SQLAlchemy 2.0 (sync, typed `Mapped[...]`) |
| Migrations | Alembic |
| DB | PostgreSQL 14+ |
| Driver | psycopg2-binary |
| OTP email | smtplib (stdlib) |
| GitHub proxy | requests |

## Install

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.tzt
```

Or with [uv](https://docs.astral.sh/uv/):

```bash
uv sync
```

## Database

You need a Postgres URL. Two common options:

- **Dev** — free tier at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
- **Prod** — self-hosted Postgres on your VPS

The connection string looks like:

```
postgresql://user:password@host:5432/dbname?sslmode=require
```

## Environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `ADMIN_SECRET_KEY` | yes | 32+ random bytes, hex or base64. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ADMIN_ROUTE` | no | Hidden admin URL prefix. Default: `/configure-deafult-here` |
| `MAIL_SERVER` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | yes (for OTP) | SMTP creds for OTP delivery |
| `ADMIN_EMAIL` | yes | Where OTPs and reset tokens get sent |
| `CORS_ALLOWED_ORIGINS` | yes | Comma-separated list of browser origins |
| `TRUSTED_PROXIES` | no | Comma-separated list of reverse-proxy IPs that may set `X-Forwarded-For`. Empty = use real TCP peer. |

> The server **refuses to boot** if `ADMIN_SECRET_KEY` is the framework default.
> `ADMIN_PASSWORD` is only used by `make seed` / `make reset-admin`. If unset, the seed generates a one-time 24-character password and prints it.

## Migrations

```bash
make upgrade          # apply all pending migrations
make downgrade        # roll back one step
make status           # show current head
```

After editing `db/models.py`:

```bash
alembic revision --autogenerate -m "describe change"
make upgrade
```

Migrations are stored in `migrations/versions/`. The current sequence is:

| Rev | Adds |
|---|---|
| `0001_initial` | All non-user tables |
| `0002_users` | `users` table + `one_admin_only` partial unique index |
| `0003_tokens_valid_after` | `users.tokens_valid_after` for session revocation |
| `0004_audit_logs` | `audit_logs` table |

## Seed the admin

```bash
make seed
```

This creates exactly one admin. If `ADMIN_PASSWORD` is empty or `admin`, a 24-character one-time password is generated and printed. **Save it.** The first login forces a password change.

Re-running on a populated database is a no-op (refuses with a clear error).

## Run

```bash
make run               # python main.py, default 0.0.0.0:8080
make dev               # alias for run with extra logging
```

Override the port with `PORT=9000 make run`.

## Makefile targets

| Target | What it does |
|---|---|
| `install` | Install dependencies via `uv sync` |
| `setup` | Copy `.env.example` to `.env` (skipped if `.env` exists) |
| `migrate` | `alembic upgrade head` |
| `upgrade` | Same as `migrate` |
| `downgrade` | `alembic downgrade -1` |
| `db-reset` | Drop and recreate the public schema (DESTRUCTIVE) |
| `run` | `python main.py` |
| `seed` | Create the single admin user |
| `reset-admin` | Rotate the admin password (uses `ADMIN_PASSWORD` from env, or generates a one-time password) |
| `status` | Current Alembic head + pending revisions |
| `clean` | Remove `__pycache__/` and `.pyc` files |

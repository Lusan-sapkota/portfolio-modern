from lcore import Lcore, CORSMiddleware
from platforms.wiki import wiki
from platforms.git import git
from platforms.store import store
from admin import admin
import os
import sys

ADMIN_ROUTE = os.getenv("ADMIN_ROUTE", "/configure-deafult-here")

DEFAULT_SECRET = "dev-secret-change-in-production"
if os.getenv("ADMIN_SECRET_KEY", DEFAULT_SECRET) == DEFAULT_SECRET:
    sys.exit("FATAL: ADMIN_SECRET_KEY is unset or still the default. Set it in .env.")

CORS_ORIGINS = [
    o.strip() for o in os.getenv(
        "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",") if o.strip()
]

app = Lcore()

app.use(CORSMiddleware(
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
    allow_credentials=True,
    max_age=86400,
))

app.mount("/wiki", wiki)
app.mount("/git", git)
app.mount("/store", store)
app.mount(ADMIN_ROUTE, admin)


@app.route("/hello")
def hello():
    return {"message": "Hello, World!"}


@app.route("/platforms")
def list_platforms():
    return {
        "platforms": [
            {"name": "wiki", "url": "https://wiki.lusansapkota.com.np"},
            {"name": "git", "url": "https://git.lusansapkota.com.np"},
            {"name": "store", "url": "https://store.lusansapkota.com.np"},
        ]
    }


@app.route("/health")
def health():
    from db import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "db": "connected"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

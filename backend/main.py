from lcore import Lcore
from platforms.wiki import wiki
from platforms.git import git
from platforms.store import store
from admin import admin
import os

ADMIN_ROUTE = os.getenv("ADMIN_ROUTE", "/configure-deafult-here")

app = Lcore()

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

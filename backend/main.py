from lcore import Lcore
from platforms.wiki import wiki
from platforms.git import git
from platforms.store import store

app = Lcore()

app.mount("/wiki", wiki)
app.mount("/git", git)
app.mount("/store", store)


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

from lcore import Lcore
from lcore import redirect

store = Lcore()


@store.route("/")
def store_index():
    redirect("https://store.lusansapkota.com.np")


@store.route("/info")
def store_info():
    return {
        "platform": "store",
        "url": "https://store.lusansapkota.com.np",
        "status": "external",
    }

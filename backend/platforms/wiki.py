from lcore import Lcore

wiki = Lcore()


@wiki.route("/")
def wiki_index():
    return {"platform": "wiki", "endpoint": "index"}


@wiki.route("/search")
def wiki_search():
    return {"platform": "wiki", "endpoint": "search"}


@wiki.route("/article/<article_id:int>")
def wiki_article(article_id):
    return {"platform": "wiki", "endpoint": "article", "article_id": article_id}


@wiki.route("/random")
def wiki_random():
    return {"platform": "wiki", "endpoint": "random"}


@wiki.route("/explore")
def wiki_explore():
    return {"platform": "wiki", "endpoint": "explore"}


@wiki.route("/categories")
def wiki_categories():
    return {"platform": "wiki", "endpoint": "categories"}

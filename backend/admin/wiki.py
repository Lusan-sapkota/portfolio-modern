from lcore import Lcore, request
from .store import store
from .helpers import ok, created, not_found, bad_request

wiki = Lcore()


@wiki.route("/articles", method=["GET", "POST"])
def article_list():
    if request.method == "POST":
        data = request.json
        a = {
            "id": store._id(),
            "title": data.get("title", ""),
            "content": data.get("content"),
            "summary": data.get("summary"),
            "category_id": data.get("category_id"),
            "tags": data.get("tags"),
            "views": 0,
            "created_at": store._now(),
            "updated_at": store._now(),
        }
        store.wiki_articles.append(a)
        return created(a)

    category = request.query.get("category")
    search = request.query.get("search")
    sort = request.query.get("sort", "date")
    result = store.wiki_articles[:]
    if category:
        result = store._filter(result, category_id=int(category))
    if search:
        result = store._search(result, ["title", "content", "summary", "tags"], search)
    rev = sort != "title"
    key = {"title": "title", "views": "views", "date": "created_at"}.get(sort, "created_at")
    result.sort(key=lambda x: x.get(key, ""), reverse=rev)
    return {"articles": result, "count": len(result)}


@wiki.route("/articles/<article_id:int>", method=["GET", "PUT", "DELETE"])
def article_detail(article_id):
    idx = store._find_idx(store.wiki_articles, article_id)
    if idx == -1:
        return not_found()
    if request.method == "GET":
        a = store.wiki_articles[idx]
        a["views"] = a.get("views", 0) + 1
        return ok(a)
    if request.method == "DELETE":
        store.wiki_articles.pop(idx)
        return ok({"message": "Article deleted"})
    data = request.json
    a = store.wiki_articles[idx]
    for f in ("title", "content", "summary", "category_id", "tags"):
        if f in data:
            a[f] = data[f]
    a["updated_at"] = store._now()
    return ok(a)


@wiki.route("/articles/random")
def random_article():
    if store.wiki_articles:
        return ok(store.wiki_articles[-1])
    return not_found("No articles")


@wiki.route("/categories", method=["GET", "POST"])
def category_list():
    if request.method == "POST":
        data = request.json
        c = {
            "id": store._id(),
            "name": data.get("name", ""),
            "description": data.get("description"),
            "parent_id": data.get("parent_id"),
            "created_at": store._now(),
        }
        store.wiki_categories.append(c)
        return created(c)
    return {"categories": store.wiki_categories[:], "count": len(store.wiki_categories)}


@wiki.route("/categories/<cat_id:int>", method=["GET", "PUT", "DELETE"])
def category_detail(cat_id):
    idx = store._find_idx(store.wiki_categories, cat_id)
    if idx == -1:
        return not_found()
    if request.method == "GET":
        c = dict(store.wiki_categories[idx])
        c["article_count"] = len(store._filter(store.wiki_articles, category_id=cat_id))
        return ok(c)
    if request.method == "DELETE":
        if store._filter(store.wiki_articles, category_id=cat_id):
            return bad_request("Cannot delete category with articles")
        store.wiki_categories.pop(idx)
        return ok({"message": "Category deleted"})
    data = request.json
    c = store.wiki_categories[idx]
    for f in ("name", "description", "parent_id"):
        if f in data:
            c[f] = data[f]
    return ok(c)

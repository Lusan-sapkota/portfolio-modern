from lcore import Lcore, request
from .store import store
from .helpers import ok, created, not_found, bad_request

categories = Lcore()


@categories.route("/", method=["GET", "POST"])
def category_list():
    if request.method == "POST":
        data = request.json
        c = {
            "id": store._id(),
            "name": data.get("name", ""),
            "description": data.get("description"),
            "icon": data.get("icon"),
            "color": data.get("color"),
            "created_at": store._now(),
        }
        store.categories.append(c)
        return created(c)
    return {"categories": store.categories[:], "count": len(store.categories)}


@categories.route("/<category_id:int>", method=["GET", "PUT", "DELETE"])
def category_detail(category_id):
    idx = store._find_idx(store.categories, category_id)
    if idx == -1:
        return not_found()
    if request.method == "GET":
        return ok(store.categories[idx])
    if request.method == "DELETE":
        has_projects = any(p.get("category_id") == category_id for p in store.projects)
        if has_projects:
            return bad_request("Cannot delete category with projects")
        store.categories.pop(idx)
        return ok({"message": "Category deleted"})
    data = request.json
    c = store.categories[idx]
    for field in ("name", "description", "icon", "color"):
        if field in data:
            c[field] = data[field]
    return ok(c)

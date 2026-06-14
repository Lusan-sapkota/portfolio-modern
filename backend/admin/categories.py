from lcore import Lcore, request
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found, bad_request

categories = Lcore()


def _serialize(c: models.Category) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "icon": c.icon,
        "color": c.color,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@categories.route("/", method=["GET", "POST"])
def category_list():
    if request.method == "POST":
        data = request.json
        with session_scope() as s:
            c = models.Category(
                name=data.get("name", ""),
                description=data.get("description"),
                icon=data.get("icon"),
                color=data.get("color"),
            )
            s.add(c)
            s.flush()
            return created(_serialize(c))
    with session_scope() as s:
        items = [_serialize(c) for c in s.query(models.Category).all()]
    return {"categories": items, "count": len(items)}


@categories.route("/<category_id:int>", method=["GET", "PUT", "DELETE"])
def category_detail(category_id):
    with session_scope() as s:
        c = s.get(models.Category, category_id)
        if not c:
            return not_found()
        if request.method == "GET":
            return ok(_serialize(c))
        if request.method == "DELETE":
            has_projects = s.query(models.Project).filter_by(category_id=category_id).first() is not None
            if has_projects:
                return bad_request("Cannot delete category with projects")
            s.delete(c)
            return ok({"message": "Category deleted"})
        data = request.json
        for field in ("name", "description", "icon", "color"):
            if field in data:
                setattr(c, field, data[field])
        s.flush()
        return ok(_serialize(c))

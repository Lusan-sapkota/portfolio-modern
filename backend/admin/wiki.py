from lcore import Lcore, request
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found, bad_request

wiki = Lcore()


def _serialize_article(a: models.WikiArticle) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "content": a.content,
        "summary": a.summary,
        "category_id": a.category_id,
        "tags": a.tags,
        "views": a.views,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None,
    }


def _serialize_cat(c: models.WikiCategory, article_count: int = 0) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "parent_id": c.parent_id,
        "article_count": article_count,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@wiki.route("/articles", method=["GET", "POST"])
def article_list():
    if request.method == "POST":
        data = request.json
        with session_scope() as s:
            a = models.WikiArticle(
                title=data.get("title", ""),
                content=data.get("content"),
                summary=data.get("summary"),
                category_id=data.get("category_id"),
                tags=data.get("tags"),
            )
            s.add(a)
            s.flush()
            return created(_serialize_article(a))
    with session_scope() as s:
        q = s.query(models.WikiArticle)
        category = request.query.get("category")
        search = request.query.get("search")
        sort = request.query.get("sort", "date")
        if category:
            q = q.filter(models.WikiArticle.category_id == int(category))
        if search:
            term = f"%{search}%"
            from sqlalchemy import or_
            q = q.filter(or_(
                models.WikiArticle.title.ilike(term),
                models.WikiArticle.content.ilike(term),
                models.WikiArticle.summary.ilike(term),
                models.WikiArticle.tags.ilike(term),
            ))
        key = {"title": models.WikiArticle.title, "views": models.WikiArticle.views, "date": models.WikiArticle.created_at}.get(sort, models.WikiArticle.created_at)
        items = [_serialize_article(a) for a in q.order_by(key.desc() if sort != "title" else key.asc()).all()]
    return {"articles": items, "count": len(items)}


@wiki.route("/articles/<article_id:int>", method=["GET", "PUT", "DELETE"])
def article_detail(article_id):
    with session_scope() as s:
        a = s.get(models.WikiArticle, article_id)
        if not a:
            return not_found()
        if request.method == "GET":
            a.views = (a.views or 0) + 1
            s.flush()
            return ok(_serialize_article(a))
        if request.method == "DELETE":
            s.delete(a)
            return ok({"message": "Article deleted"})
        data = request.json
        for f in ("title", "content", "summary", "category_id", "tags"):
            if f in data:
                setattr(a, f, data[f])
        s.flush()
        return ok(_serialize_article(a))


@wiki.route("/articles/random")
def random_article():
    with session_scope() as s:
        a = s.query(models.WikiArticle).order_by(models.WikiArticle.id.desc()).first()
        if not a:
            return not_found("No articles")
        return ok(_serialize_article(a))


@wiki.route("/categories", method=["GET", "POST"])
def category_list():
    if request.method == "POST":
        data = request.json
        with session_scope() as s:
            c = models.WikiCategory(
                name=data.get("name", ""),
                description=data.get("description"),
                parent_id=data.get("parent_id"),
            )
            s.add(c)
            s.flush()
            return created(_serialize_cat(c))
    with session_scope() as s:
        items = []
        for c in s.query(models.WikiCategory).all():
            count = s.query(models.WikiArticle).filter_by(category_id=c.id).count()
            items.append(_serialize_cat(c, count))
    return {"categories": items, "count": len(items)}


@wiki.route("/categories/<cat_id:int>", method=["GET", "PUT", "DELETE"])
def category_detail(cat_id):
    with session_scope() as s:
        c = s.get(models.WikiCategory, cat_id)
        if not c:
            return not_found()
        if request.method == "GET":
            count = s.query(models.WikiArticle).filter_by(category_id=cat_id).count()
            return ok(_serialize_cat(c, count))
        if request.method == "DELETE":
            if s.query(models.WikiArticle).filter_by(category_id=cat_id).first():
                return bad_request("Cannot delete category with articles")
            s.delete(c)
            return ok({"message": "Category deleted"})
        data = request.json
        for f in ("name", "description", "parent_id"):
            if f in data:
                setattr(c, f, data[f])
        s.flush()
        return ok(_serialize_cat(c))

from lcore import Lcore, request
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found

content = Lcore()

ENTITY_MAP = {
    "skills": (models.Skill, ["name", "category", "proficiency", "icon", "description", "years_experience", "is_featured", "sort_order"], ["name", "description", "category"]),
    "experiences": (models.Experience, ["company", "position", "description", "start_date", "end_date", "location", "company_url", "logo_url", "technologies", "achievements"], ["company", "position", "description", "technologies"]),
    "education": (models.Education, ["institution", "degree", "field_of_study", "start_date", "end_date", "description", "logo_url"], ["institution", "degree", "field_of_study"]),
    "testimonials": (models.Testimonial, ["client_name", "client_title", "company", "content", "rating", "is_featured", "sort_order"], ["client_name", "company", "content"]),
    "social": (models.SocialLink, ["platform", "url", "icon", "display_name", "is_active", "sort_order"], ["platform", "display_name"]),
    "donation-projects": (models.DonationProject, ["title", "description", "short_description", "goal_amount", "current_amount", "image_url", "github_url", "demo_url", "is_active", "is_featured"], ["title", "description"]),
    "donations": (models.Donation, ["project_id", "donor_name", "donor_email", "donor_phone", "amount", "currency", "message", "is_anonymous", "payment_method", "payment_id", "status", "verified_amount", "admin_notes"], ["donor_name", "donor_email", "message"]),
}

SEO_FIELDS = ["page_name", "title", "meta_description", "meta_keywords", "og_title", "og_description", "og_image", "og_url", "og_type", "twitter_title", "twitter_description", "twitter_image", "twitter_url", "twitter_card", "canonical_url", "robots", "focus_keywords", "is_active"]


def _make_crud(app, base_path, model_cls, fields, search_fields):
    @app.route(base_path, method=["GET", "POST"])
    def _list_create():
        if request.method == "POST":
            data = request.json
            with session_scope() as s:
                item = model_cls(**{f: data[f] for f in fields if f in data})
                s.add(item)
                s.flush()
                return created(_to_dict(item, fields))
        with session_scope() as s:
            q = s.query(model_cls)
            search = request.query.get("search")
            if search and search_fields:
                term = f"%{search}%"
                q = q.filter(s.query(model_cls).filter(*[getattr(model_cls, f).ilike(term) for f in search_fields]).statement.whereclause)
                from sqlalchemy import or_
                q = s.query(model_cls).filter(or_(*[getattr(model_cls, f).ilike(term) for f in search_fields]))
            items = [_to_dict(item, fields) for item in q.all()]
        return {"items": items, "count": len(items)}

    @app.route(base_path + "/<item_id:int>", method=["GET", "PUT", "DELETE"])
    def _detail(item_id):
        with session_scope() as s:
            item = s.get(model_cls, item_id)
            if not item:
                return not_found()
            if request.method == "GET":
                return ok(_to_dict(item, fields))
            if request.method == "DELETE":
                s.delete(item)
                return ok({"message": "Deleted"})
            data = request.json
            for f in fields:
                if f in data:
                    setattr(item, f, data[f])
            s.flush()
            return ok(_to_dict(item, fields))


def _to_dict(obj, fields) -> dict:
    out = {"id": obj.id}
    for f in fields:
        v = getattr(obj, f, None)
        if hasattr(v, "isoformat"):
            v = v.isoformat()
        out[f] = v
    return out


for path, (model_cls, fields, search_fields) in ENTITY_MAP.items():
    _make_crud(content, "/" + path, model_cls, fields, search_fields)

_make_crud(content, "/seo", models.SEOSetting, SEO_FIELDS, ["page_name", "title", "meta_description"])


@content.route("/personal", method=["GET", "PUT"])
def personal_info():
    with session_scope() as s:
        p = s.query(models.Personal).first()
        if request.method == "GET":
            if not p:
                p = models.Personal()
                s.add(p)
                s.flush()
            return _to_dict_personal(p)
        data = request.json
        if not p:
            p = models.Personal()
            s.add(p)
        for f in ("name", "title", "bio", "email", "phone", "address",
                  "profile_image", "resume_url", "location", "tagline",
                  "years_experience", "projects_completed", "clients_served"):
            if f in data:
                setattr(p, f, data[f])
        s.flush()
        return _to_dict_personal(p)


def _to_dict_personal(p: models.Personal) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "title": p.title,
        "bio": p.bio,
        "email": p.email,
        "phone": p.phone,
        "address": p.address,
        "profile_image": p.profile_image,
        "resume_url": p.resume_url,
        "location": p.location,
        "tagline": p.tagline,
        "years_experience": p.years_experience,
        "projects_completed": p.projects_completed,
        "clients_served": p.clients_served,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }

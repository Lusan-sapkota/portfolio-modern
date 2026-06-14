from lcore import Lcore, request
from .store import store
from .helpers import ok, created, not_found

content = Lcore()


def _make_crud(app, collection, base_path, fields, search_fields=None):
    @app.route(base_path, method=["GET", "POST"])
    def _list_create():
        if request.method == "POST":
            item = {"id": store._id(), "created_at": store._now(), "updated_at": store._now()}
            for f in fields:
                if f in request.json:
                    item[f] = request.json[f]
            collection.append(item)
            return created(item)
        search = request.query.get("search")
        result = collection[:]
        if search and search_fields:
            result = store._search(result, search_fields, search)
        return {"items": result, "count": len(result)}

    @app.route(base_path + "/<item_id:int>", method=["GET", "PUT", "DELETE"])
    def _detail(item_id):
        idx = store._find_idx(collection, item_id)
        if idx == -1:
            return not_found()
        if request.method == "GET":
            return ok(collection[idx])
        if request.method == "DELETE":
            collection.pop(idx)
            return ok({"message": "Deleted"})
        item = collection[idx]
        for f in fields:
            if f in request.json:
                item[f] = request.json[f]
        item["updated_at"] = store._now()
        return ok(item)


_make_crud(content, store.skills, "/skills", ["name", "category", "proficiency", "icon", "description", "years_experience", "is_featured", "sort_order"], ["name", "description", "category"])
_make_crud(content, store.experiences, "/experiences", ["company", "position", "description", "start_date", "end_date", "location", "company_url", "logo_url", "technologies", "achievements"], ["company", "position", "description", "technologies"])
_make_crud(content, store.educations, "/education", ["institution", "degree", "field_of_study", "start_date", "end_date", "description", "logo_url"], ["institution", "degree", "field_of_study"])
_make_crud(content, store.testimonials, "/testimonials", ["client_name", "client_title", "company", "content", "rating", "is_featured", "sort_order"], ["client_name", "company", "content"])
_make_crud(content, store.social_links, "/social", ["platform", "url", "icon", "display_name", "is_active", "sort_order"], ["platform", "display_name"])
_make_crud(content, store.seo_settings, "/seo", ["page_name", "title", "meta_description", "meta_keywords", "og_title", "og_description", "og_image", "og_url", "og_type", "twitter_title", "twitter_description", "twitter_image", "twitter_url", "twitter_card", "canonical_url", "robots", "focus_keywords", "is_active"], ["page_name", "title", "meta_description"])

_make_crud(content, store.donation_projects, "/donation-projects", ["title", "description", "short_description", "goal_amount", "current_amount", "image_url", "github_url", "demo_url", "is_active", "is_featured"], ["title", "description"])
_make_crud(content, store.donations, "/donations", ["project_id", "donor_name", "donor_email", "donor_phone", "amount", "currency", "message", "is_anonymous", "payment_method", "payment_id", "status", "verified_amount", "admin_notes"], ["donor_name", "donor_email", "message"])


@content.route("/personal", method=["GET", "PUT"])
def personal_info():
    if request.method == "GET":
        if not store.personal:
            store.personal = {
                "id": store._id(),
                "name": "", "title": "", "bio": "", "email": "",
                "phone": "", "address": "", "profile_image": "",
                "resume_url": "", "location": "", "tagline": "",
                "years_experience": 0, "projects_completed": 0,
                "clients_served": 0, "updated_at": store._now(),
            }
        return store.personal
    data = request.json
    if not store.personal:
        store.personal = {"id": store._id()}
    for f in ("name", "title", "bio", "email", "phone", "address",
              "profile_image", "resume_url", "location", "tagline",
              "years_experience", "projects_completed", "clients_served"):
        if f in data:
            store.personal[f] = data[f]
    store.personal["updated_at"] = store._now()
    return store.personal

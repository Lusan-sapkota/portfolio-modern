from lcore import Lcore, request, response as lcore_response
from .store import store
from .helpers import bad_request


data = Lcore()


@data.route("/export")
def export_all():
    import json, io, zipfile
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        collections = {
            "projects": store.projects,
            "categories": store.categories,
            "skills": store.skills,
            "experiences": store.experiences,
            "education": store.educations,
            "testimonials": store.testimonials,
            "social_links": store.social_links,
            "personal": store.personal,
            "seo_settings": store.seo_settings,
            "contacts": store.contacts,
            "newsletter": store.newsletter,
            "wiki_articles": store.wiki_articles,
            "wiki_categories": store.wiki_categories,
            "donations": store.donations,
            "donation_projects": store.donation_projects,
        }
        for name, coll in collections.items():
            zf.writestr(f"{name}.json", json.dumps(coll, indent=2, default=str))
    buf.seek(0)
    lcore_response.content_type = "application/zip"
    lcore_response.set_header("Content-Disposition", "attachment; filename=backup.zip")
    return buf.read()


@data.route("/import", method="POST")
def import_all():
    import json, zipfile, io
    if "file" not in request.files:
        return bad_request("No file uploaded")
    upload = request.files["file"]
    buf = io.BytesIO(upload.file.read())
    with zipfile.ZipFile(buf, "r") as zf:
        mapping = {
            "projects.json": store.projects,
            "categories.json": store.categories,
            "skills.json": store.skills,
            "experiences.json": store.experiences,
            "education.json": store.educations,
            "testimonials.json": store.testimonials,
            "social_links.json": store.social_links,
            "seo_settings.json": store.seo_settings,
            "contacts.json": store.contacts,
            "newsletter.json": store.newsletter,
            "wiki_articles.json": store.wiki_articles,
            "wiki_categories.json": store.wiki_categories,
            "donations.json": store.donations,
            "donation_projects.json": store.donation_projects,
        }
        for fname, coll in mapping.items():
            if fname in zf.namelist():
                coll.clear()
                coll.extend(json.loads(zf.read(fname)))
        if "personal.json" in zf.namelist():
            store.personal = json.loads(zf.read("personal.json"))
    return {"message": "Data imported successfully"}

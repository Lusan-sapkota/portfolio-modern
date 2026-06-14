from lcore import Lcore, request, response
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found, bad_request

projects = Lcore()


@projects.route("/", method=["GET", "POST"])
def project_list():
    if request.method == "POST":
        data = request.json
        with session_scope() as s:
            p = models.Project(
                title=data.get("title", ""),
                description=data.get("description"),
                image_url=data.get("image_url"),
                github_url=data.get("github_url"),
                live_url=data.get("live_url"),
                commercial_url=data.get("commercial_url"),
                technologies=data.get("technologies"),
                category_id=data.get("category_id"),
                is_featured=bool(data.get("is_featured")),
                is_opensource=bool(data.get("is_opensource", True)),
                show_on_homepage=bool(data.get("show_on_homepage")),
                status=data.get("status", "completed"),
            )
            s.add(p)
            s.flush()
            return created(_serialize_project(p))

    with session_scope() as s:
        q = s.query(models.Project)
        category = request.query.get("category")
        status = request.query.get("status")
        search = request.query.get("search")
        if category:
            q = q.filter(models.Project.category_id == int(category))
        if status:
            q = q.filter(models.Project.status == status)
        if search:
            term = f"%{search}%"
            q = q.filter(
                (models.Project.title.ilike(term))
                | (models.Project.description.ilike(term))
                | (models.Project.technologies.ilike(term))
            )
        items = [_serialize_project(p) for p in q.all()]
    return {"projects": items, "count": len(items)}


@projects.route("/<project_id:int>", method=["GET", "PUT", "DELETE"])
def project_detail(project_id):
    with session_scope() as s:
        p = s.get(models.Project, project_id)
        if not p:
            return not_found()
        if request.method == "GET":
            return ok(_serialize_project(p))
        if request.method == "DELETE":
            s.delete(p)
            return ok({"message": "Project deleted"})
        data = request.json
        for field in ("title", "description", "image_url", "github_url", "live_url",
                      "commercial_url", "technologies", "is_featured", "is_opensource",
                      "show_on_homepage", "status"):
            if field in data:
                setattr(p, field, bool(data[field]) if field.startswith("is_") or field == "show_on_homepage" else data[field])
        if "category_id" in data:
            p.category_id = data["category_id"]
        s.flush()
        return ok(_serialize_project(p))


@projects.route("/<project_id:int>/refresh-github", method="POST")
def project_refresh_github(project_id):
    with session_scope() as s:
        p = s.get(models.Project, project_id)
        if not p:
            return not_found()
        github_url = p.github_url
        if not github_url:
            return bad_request("No GitHub URL set")
        import re, requests, os
        m = re.search(r"github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$", github_url)
        if not m:
            return bad_request("Invalid GitHub URL")
        username, repo = m.groups()
        headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Portfolio-v2"}
        token = os.getenv("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"token {token}"
        try:
            resp = requests.get(f"https://api.github.com/repos/{username}/{repo}", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                p.stars = data.get("stargazers_count", 0)
                p.forks = data.get("forks_count", 0)
                s.flush()
                return ok({"stars": p.stars, "forks": p.forks})
        except Exception:
            pass
    response.status = 502
    return {"error": "GitHub API unavailable"}


def _serialize_project(p: models.Project) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "image_url": p.image_url,
        "github_url": p.github_url,
        "live_url": p.live_url,
        "commercial_url": p.commercial_url,
        "technologies": p.technologies,
        "category_id": p.category_id,
        "is_featured": p.is_featured,
        "is_opensource": p.is_opensource,
        "show_on_homepage": p.show_on_homepage,
        "status": p.status,
        "stars": p.stars,
        "forks": p.forks,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }

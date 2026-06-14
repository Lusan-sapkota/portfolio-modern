from lcore import Lcore, request, response
from .store import store
from .helpers import ok, created, not_found, bad_request

projects = Lcore()


@projects.route("/", method=["GET", "POST"])
def project_list():
    if request.method == "POST":
        data = request.json
        p = {
            "id": store._id(),
            "title": data.get("title", ""),
            "description": data.get("description"),
            "image_url": data.get("image_url"),
            "github_url": data.get("github_url"),
            "live_url": data.get("live_url"),
            "commercial_url": data.get("commercial_url"),
            "technologies": data.get("technologies"),
            "category_id": data.get("category_id"),
            "is_featured": bool(data.get("is_featured")),
            "is_opensource": bool(data.get("is_opensource", True)),
            "show_on_homepage": bool(data.get("show_on_homepage")),
            "status": data.get("status", "completed"),
            "stars": 0,
            "forks": 0,
            "created_at": store._now(),
            "updated_at": store._now(),
        }
        store.projects.append(p)
        return created(p)

    category = request.query.get("category")
    status = request.query.get("status")
    search = request.query.get("search")
    result = store.projects[:]
    if category:
        result = store._filter(result, category_id=int(category))
    if status:
        result = store._filter(result, status=status)
    if search:
        result = store._search(result, ["title", "description", "technologies"], search)
    return {"projects": result, "count": len(result)}


@projects.route("/<project_id:int>", method=["GET", "PUT", "DELETE"])
def project_detail(project_id):
    idx = store._find_idx(store.projects, project_id)
    if idx == -1:
        return not_found()
    if request.method == "GET":
        return ok(store.projects[idx])
    if request.method == "DELETE":
        store.projects.pop(idx)
        return ok({"message": "Project deleted"})
    data = request.json
    p = store.projects[idx]
    for field in ("title", "description", "image_url", "github_url", "live_url",
                  "commercial_url", "technologies", "is_featured", "is_opensource",
                  "show_on_homepage", "status"):
        if field in data:
            if field.startswith("is_") or field == "show_on_homepage":
                p[field] = bool(data[field])
            else:
                p[field] = data[field]
    if "category_id" in data:
        p["category_id"] = data["category_id"]
    p["updated_at"] = store._now()
    return ok(p)


@projects.route("/<project_id:int>/refresh-github", method="POST")
def project_refresh_github(project_id):
    p = store._find(store.projects, project_id)
    if not p:
        return not_found()
    github_url = p.get("github_url")
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
            p["stars"] = data.get("stargazers_count", 0)
            p["forks"] = data.get("forks_count", 0)
            p["updated_at"] = store._now()
            return ok({"stars": p["stars"], "forks": p["forks"]})
    except Exception:
        pass
    response.status = 502
    return {"error": "GitHub API unavailable"}

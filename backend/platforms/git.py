from lcore import Lcore
import os
import requests
from datetime import datetime, timedelta

git = Lcore()

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Portfolio-v2",
}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_TOKEN}"

CACHE = {}
CACHE_DURATION = timedelta(hours=1)


def github_get(endpoint, params=None):
    cache_key = f"{endpoint}:{str(params)}"
    now = datetime.utcnow()
    if cache_key in CACHE and now - CACHE[cache_key]["ts"] < CACHE_DURATION:
        return CACHE[cache_key]["data"]
    try:
        resp = requests.get(
            f"{GITHUB_API}{endpoint}", headers=HEADERS, params=params, timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            CACHE[cache_key] = {"data": data, "ts": now}
            return data
    except Exception:
        pass
    return None


@git.route("/")
def git_index():
    return {"platform": "git", "endpoint": "index"}


@git.route("/search")
def git_search():
    return {"platform": "git", "endpoint": "search"}


@git.route("/project/<project_id:int>")
def git_project(project_id):
    return {"platform": "git", "endpoint": "project", "project_id": project_id}


@git.route("/api/projects")
def git_api_projects():
    return {"platform": "git", "endpoint": "api_projects"}


@git.route("/api/repos")
def github_repos():
    data = github_get("/users/Lusan-sapkota/repos?sort=updated&per_page=30")
    if data is None:
        return {"error": "GitHub API unavailable"}, 503
    return {
        "repos": [
            {
                "name": r["name"],
                "full_name": r["full_name"],
                "description": r.get("description"),
                "stars": r.get("stargazers_count", 0),
                "forks": r.get("forks_count", 0),
                "language": r.get("language"),
                "html_url": r["html_url"],
                "updated_at": r["updated_at"],
            }
            for r in data
        ]
    }


@git.route("/api/repo/<username>/<repo_name>")
def github_repo_detail(username, repo_name):
    data = github_get(f"/repos/{username}/{repo_name}")
    if data is None:
        return {"error": "Repository not found"}, 404
    return {
        "name": data["name"],
        "full_name": data["full_name"],
        "description": data.get("description"),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "language": data.get("language"),
        "topics": data.get("topics", []),
        "html_url": data["html_url"],
        "homepage": data.get("homepage"),
        "updated_at": data["updated_at"],
    }

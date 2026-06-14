from lcore import Lcore, request, HTTPError
from .auth import create_token, verify_token
from .dashboard import dashboard
from .data import data
from .projects import projects
from .categories import categories
from .content import content
from .community import community
from .wiki import wiki
from .helpers import unauthorized

admin = Lcore()

@admin.hook("before_request")
def auth_check():
    if request.path == "/login" or request.path == "/logout" or request.method == "OPTIONS":
        return
    auth = request.get_header("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPError(401, {"error": "Authorization header required"})
    if not verify_token(auth[7:]):
        raise HTTPError(401, {"error": "Invalid or expired token"})


@admin.route("/login", method="POST")
def login():
    data = request.json
    username = data.get("username", "")
    password = data.get("password", "")
    if username == "admin" and password == "admin":
        return {"token": create_token(username)}
    return unauthorized()


@admin.route("/logout", method="POST")
def logout():
    return {"message": "Logged out"}


admin.mount("/api/dashboard", dashboard)
admin.mount("/api/projects", projects)
admin.mount("/api/categories", categories)
admin.mount("/api/content", content)
admin.mount("/api/community", community)
admin.mount("/api/wiki", wiki)
admin.mount("/api/data", data)

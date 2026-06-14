from lcore import Lcore, request, HTTPError
from .auth import (
    create_token,
    verify_token,
    send_otp,
    verify_otp,
    ADMIN_EMAIL,
)
from .dashboard import dashboard
from .data import data
from .projects import projects
from .categories import categories
from .content import content
from .community import community
from .wiki import wiki
from .helpers import unauthorized, bad_request

admin = Lcore()

PUBLIC_ROUTES = {"/login", "/verify-otp", "/logout"}


@admin.hook("before_request")
def auth_check():
    if request.path in PUBLIC_ROUTES or request.method == "OPTIONS":
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
    if username != "admin" or password != "admin":
        return unauthorized()
    otp = send_otp(ADMIN_EMAIL, username)
    if not otp:
        return bad_request("Failed to send OTP email")
    return {"requires_otp": True, "email": ADMIN_EMAIL, "message": "OTP sent"}


@admin.route("/verify-otp", method="POST")
def verify_otp_endpoint():
    data = request.json
    otp = data.get("otp", "")
    if not verify_otp(ADMIN_EMAIL, otp):
        return unauthorized("Invalid or expired OTP")
    return {"token": create_token("admin")}


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

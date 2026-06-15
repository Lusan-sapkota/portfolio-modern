from lcore import Lcore, request, HTTPError, response
from .auth import (
    create_token,
    verify_token,
    send_otp,
    verify_otp,
    authenticate,
    change_password,
    change_username,
    request_password_reset,
    reset_password_with_token,
    revoke_all_sessions,
    ADMIN_EMAIL,
)
from .dashboard import dashboard
from .projects import projects
from .categories import categories
from .content import content
from .community import community
from .wiki import wiki
from .security_logs import security_logs
from .helpers import unauthorized, bad_request
from .rate_limit import check as rate_check, client_key
from .audit import log_action
import os

admin = Lcore()

CORS_ORIGINS = frozenset(
    o.strip() for o in os.getenv(
        "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",") if o.strip()
)

PUBLIC_ROUTES = {"/login", "/verify-otp", "/logout", "/forgot-password", "/reset-password"}

RATE_LIMITS = {
    "/login": (5, 60),
    "/verify-otp": (5, 60),
    "/forgot-password": (3, 300),
    "/reset-password": (5, 60),
    "/change-password": (5, 60),
    "/change-username": (5, 60),
}

USERNAME_LIMITS = {"/login": (10, 60), "/forgot-password": (3, 300)}


def _honeypot_ok(data) -> bool:
    if not isinstance(data, dict):
        return True
    val = data.get("website", "")
    return not val


@admin.hook("before_request")
def cors_preflight():
    if request.method == "OPTIONS":
        origin = request.get_header("Origin", "")
        if origin in CORS_ORIGINS:
            response.set_header("Access-Control-Allow-Origin", origin)
            response.set_header("Access-Control-Allow-Credentials", "true")
            response.set_header("Vary", "Origin")
            response.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
            response.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            response.set_header("Access-Control-Max-Age", "86400")
        response.status = 204
        return ""


@admin.hook("after_request")
def cors_actual():
    origin = request.get_header("Origin", "")
    if origin in CORS_ORIGINS:
        response.set_header("Access-Control-Allow-Origin", origin)
        response.set_header("Access-Control-Allow-Credentials", "true")
        response.set_header("Vary", "Origin")
        response.set_header(
            "Access-Control-Expose-Headers",
            "X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After",
        )


@admin.hook("after_request")
def security_headers():
    response.set_header("X-Content-Type-Options", "nosniff")
    response.set_header("X-Frame-Options", "DENY")
    response.set_header("Referrer-Policy", "strict-origin-when-cross-origin")
    response.set_header("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
    response.set_header(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    )
    if os.getenv("ADMIN_HSTS", "true").lower() == "true":
        response.set_header(
            "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
        )


@admin.hook("before_request")
def auth_check():
    if request.method == "OPTIONS":
        return
    if request.path in RATE_LIMITS:
        limit, window = RATE_LIMITS[request.path]
        key = client_key(request, request.path)
        allowed, remaining, retry_after = rate_check(key, limit, window)
        response.set_header("X-RateLimit-Limit", str(limit))
        response.set_header("X-RateLimit-Remaining", str(remaining))
        if not allowed:
            response.set_header("Retry-After", str(retry_after))
            response.status = 429
            return {"error": f"Too many requests. Try again in {retry_after}s."}
    if request.path in PUBLIC_ROUTES:
        return
    auth = request.get_header("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPError(401, {"error": "Authorization header required"})
    if not verify_token(auth[7:]):
        raise HTTPError(401, {"error": "Invalid or expired token"})


@admin.route("/login", method="POST")
def login():
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "login", status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    username = str(data.get("username", ""))[:100]
    password = str(data.get("password", ""))
    if username and USERNAME_LIMITS.get("/login"):
        limit, window = USERNAME_LIMITS["/login"]
        u_key = f"u:{username.lower()}:/login"
        allowed, _remaining, retry_after = rate_check(u_key, limit, window)
        if not allowed:
            log_action(request, "login", username=username, status="rate_limited")
            return bad_request(f"Too many attempts. Try again in {retry_after}s.")
    user = authenticate(username, password)
    if not user:
        log_action(request, "login", username=username, status="invalid")
        return unauthorized()
    otp = send_otp(ADMIN_EMAIL, username)
    if not otp:
        log_action(request, "login", username=username, status="otp_send_failed")
        return bad_request("Failed to send OTP email")
    log_action(request, "login", username=username, status="success")
    return {
        "requires_otp": True,
        "email": ADMIN_EMAIL,
        "must_change_password": user.must_change_password,
        "message": "OTP sent",
    }


@admin.route("/verify-otp", method="POST")
def verify_otp_endpoint():
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "verify-otp", status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    otp = str(data.get("otp", ""))
    username = str(data.get("username", "admin"))[:100]
    if not verify_otp(ADMIN_EMAIL, otp):
        log_action(request, "verify-otp", username=username, status="invalid")
        return unauthorized("Invalid or expired OTP")
    log_action(request, "verify-otp", username=username, status="success")
    return {"token": create_token(username)}


@admin.route("/change-password", method="POST")
def change_password_endpoint():
    auth = request.get_header("Authorization", "")
    if not auth.startswith("Bearer "):
        return unauthorized()
    username = verify_token(auth[7:])
    if not username:
        return unauthorized()
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "change-password", username=username, status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    current = str(data.get("current_password", ""))
    new_pw = str(data.get("new_password", ""))
    user = authenticate(username, current)
    if not user:
        log_action(request, "change-password", username=username, status="invalid_current")
        return unauthorized("Current password incorrect")
    if not change_password(username, new_pw):
        log_action(request, "change-password", username=username, status="weak_password")
        return bad_request("Password must be at least 8 characters")
    log_action(request, "change-password", username=username, status="success")
    return {"message": "Password changed"}


@admin.route("/change-username", method="POST")
def change_username_endpoint():
    auth = request.get_header("Authorization", "")
    if not auth.startswith("Bearer "):
        return unauthorized()
    username = verify_token(auth[7:])
    if not username:
        return unauthorized()
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "change-username", username=username, status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    new_username = str(data.get("new_username", ""))
    current_pw = str(data.get("current_password", ""))
    ok, result = change_username(username, new_username, current_pw)
    if not ok:
        if "password" in result.lower():
            log_action(request, "change-username", username=username, status="invalid_current")
            return unauthorized(result)
        if "taken" in result.lower():
            log_action(request, "change-username", username=username, status="conflict")
            response.status = 409
            return {"error": result}
        log_action(request, "change-username", username=username, status="invalid")
        return bad_request(result)
    log_action(request, "change-username", username=username, status="success", detail=f"to:{result}")
    return {"message": "Username changed", "username": result}


@admin.route("/forgot-password", method="POST")
def forgot_password_endpoint():
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "forgot-password", status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    email = str(data.get("email", ""))[:200]
    if email and USERNAME_LIMITS.get("/forgot-password"):
        limit, window = USERNAME_LIMITS["/forgot-password"]
        u_key = f"u:{email.lower()}:/forgot-password"
        allowed, _remaining, retry_after = rate_check(u_key, limit, window)
        if not allowed:
            log_action(request, "forgot-password", status="rate_limited")
            return bad_request(f"Too many attempts. Try again in {retry_after}s.")
    request_password_reset(email)
    log_action(request, "forgot-password", status="requested")
    return {"message": "If the email exists, a reset token has been sent"}


@admin.route("/reset-password", method="POST")
def reset_password_endpoint():
    data = request.json or {}
    if not _honeypot_ok(data):
        log_action(request, "reset-password", status="rejected", detail="honeypot")
        return bad_request("Invalid request")
    token = str(data.get("token", ""))
    new_pw = str(data.get("new_password", ""))
    if not reset_password_with_token(token, new_pw):
        log_action(request, "reset-password", status="invalid")
        return bad_request("Invalid or expired token, or password too short")
    log_action(request, "reset-password", status="success")
    return {"message": "Password reset"}


@admin.route("/logout", method="POST")
def logout():
    auth = request.get_header("Authorization", "")
    username = None
    if auth.startswith("Bearer "):
        username = verify_token(auth[7:])
        if username:
            revoke_all_sessions(username)
    log_action(request, "logout", username=username, status="success")
    return {"message": "Logged out"}


admin.mount("/api/dashboard", dashboard)
admin.mount("/api/projects", projects)
admin.mount("/api/categories", categories)
admin.mount("/api/content", content)
admin.mount("/api/community", community)
admin.mount("/api/wiki", wiki)
admin.mount("/api/security-logs", security_logs)

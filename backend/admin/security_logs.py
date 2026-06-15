import csv
import io
from lcore import Lcore, request, response
from db import models
from admin.db_helper import session_scope

security_logs = Lcore()


ACTIONS = {
    "login", "verify-otp", "change-password", "change-username",
    "forgot-password", "reset-password", "logout",
}


def _parse_int(value, default, min_v=None, max_v=None):
    try:
        n = int(value) if value is not None else default
    except (TypeError, ValueError):
        return default
    if min_v is not None:
        n = max(n, min_v)
    if max_v is not None:
        n = min(n, max_v)
    return n


@security_logs.route("/")
def list_logs():
    action = request.query.get("action")
    status = request.query.get("status")
    username = request.query.get("username")
    limit = _parse_int(request.query.get("limit"), 200, min_v=1, max_v=1000)
    offset = _parse_int(request.query.get("offset"), 0, min_v=0)

    with session_scope() as s:
        q = s.query(models.AuditLog)
        if action and action in ACTIONS:
            q = q.filter(models.AuditLog.action == action)
        if status in ("success", "rejected", "invalid", "rate_limited",
                      "invalid_current", "conflict", "requested", "otp_send_failed"):
            q = q.filter(models.AuditLog.status == status)
        if username:
            q = q.filter(models.AuditLog.username.ilike(f"%{username}%"))

        total = q.count()
        rows = (
            q.order_by(models.AuditLog.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        items = [_serialize(r) for r in rows]

    return {
        "logs": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "actions": sorted(ACTIONS),
    }


@security_logs.route("/stats", method="GET")
def stats():
    with session_scope() as s:
        total = s.query(models.AuditLog).count()
        logins = s.query(models.AuditLog).filter(models.AuditLog.action == "login").count()
        failed = (
            s.query(models.AuditLog)
            .filter(models.AuditLog.action == "login",
                    models.AuditLog.status != "success")
            .count()
        )
        last_24h = (
            s.query(models.AuditLog)
            .filter(models.AuditLog.action == "login",
                    models.AuditLog.status == "success")
            .order_by(models.AuditLog.created_at.desc())
            .limit(10)
            .all()
        )
    return {
        "total_events": total,
        "total_logins": logins,
        "failed_logins": failed,
        "recent_logins": [_serialize(r) for r in last_24h],
    }


@security_logs.route("/export", method="GET")
def export():
    action = request.query.get("action")
    status = request.query.get("status")
    username = request.query.get("username")
    limit = _parse_int(request.query.get("limit"), 5000, min_v=1, max_v=50000)

    with session_scope() as s:
        q = s.query(models.AuditLog)
        if action and action in ACTIONS:
            q = q.filter(models.AuditLog.action == action)
        if status:
            q = q.filter(models.AuditLog.status == status)
        if username:
            q = q.filter(models.AuditLog.username.ilike(f"%{username}%"))
        rows = q.order_by(models.AuditLog.created_at.desc()).limit(limit).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "created_at", "action", "status", "username", "ip",
        "user_agent", "detail",
    ])
    for r in rows:
        writer.writerow([
            r.id,
            r.created_at.isoformat() if r.created_at else "",
            r.action,
            r.status,
            r.username or "",
            r.ip or "",
            r.user_agent or "",
            r.detail or "",
        ])

    csv_text = buf.getvalue()
    response.set_header("Content-Type", "text/csv; charset=utf-8")
    response.set_header(
        "Content-Disposition",
        'attachment; filename="security-log.csv"',
    )
    return csv_text


def _serialize(r: models.AuditLog) -> dict:
    return {
        "id": r.id,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "action": r.action,
        "status": r.status,
        "username": r.username,
        "ip": r.ip,
        "user_agent": r.user_agent,
        "detail": r.detail,
    }

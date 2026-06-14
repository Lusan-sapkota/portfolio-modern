from db import SessionLocal
from db.models import AuditLog, User
from datetime import datetime, timezone


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _request_meta(request) -> tuple[str | None, str | None]:
    ip = request.get_header("X-Forwarded-For", "").split(",")[0].strip() or None
    if not ip:
        ip = getattr(request, "remote_addr", None) or None
    ua = request.get_header("User-Agent", "")[:500] or None
    return ip, ua


def log_action(
    request,
    action: str,
    *,
    username: str | None = None,
    target: str | None = None,
    status: str = "success",
    detail: str | None = None,
) -> None:
    ip, ua = _request_meta(request)
    s = SessionLocal()
    try:
        user_id = None
        if username:
            u = s.query(User).filter_by(username=username).first()
            if u:
                user_id = u.id
        s.add(AuditLog(
            user_id=user_id,
            username=username,
            action=action,
            target=target,
            ip=ip,
            user_agent=ua,
            status=status,
            detail=detail,
        ))
        s.commit()
    except Exception:
        s.rollback()
    finally:
        s.close()

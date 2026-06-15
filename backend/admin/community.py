from lcore import Lcore, request
import os
import base64
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found, conflict, bad_request
from admin.email import send_email, mail_configured
from datetime import datetime, timezone
import threading
import logging
import re

community = Lcore()
_logger = logging.getLogger(__name__)


def _serialize_contact(c: models.Contact) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "subject": c.subject,
        "message": c.message,
        "is_spam": c.is_spam,
        "is_replied": c.is_replied,
        "submitted_at": c.submitted_at.isoformat() if c.submitted_at else None,
        "replied_at": c.replied_at.isoformat() if c.replied_at else None,
    }


def _serialize_sub(n: models.Newsletter) -> dict:
    return {
        "id": n.id,
        "email": n.email,
        "name": n.name,
        "is_active": n.is_active,
        "interests": n.interests,
        "subscribed_at": n.subscribed_at.isoformat() if n.subscribed_at else None,
        "last_email_sent": n.last_email_sent.isoformat() if n.last_email_sent else None,
    }


@community.route("/contacts", method=["GET"])
def contact_list():
    with session_scope() as s:
        q = s.query(models.Contact)
        spam = request.query.get("spam")
        search = request.query.get("search")
        if spam == "1":
            q = q.filter(models.Contact.is_spam == True)
        elif spam == "0":
            q = q.filter(models.Contact.is_spam == False)
        if search:
            term = f"%{search}%"
            from sqlalchemy import or_
            q = q.filter(or_(
                models.Contact.name.ilike(term),
                models.Contact.email.ilike(term),
                models.Contact.subject.ilike(term),
                models.Contact.message.ilike(term),
            ))
        items = [_serialize_contact(c) for c in q.order_by(models.Contact.submitted_at.desc()).all()]
    return {"contacts": items, "count": len(items)}


@community.route("/contacts/stats", method=["GET"])
def contact_stats():
    with session_scope() as s:
        total = s.query(models.Contact).count()
        spam = s.query(models.Contact).filter_by(is_spam=True).count()
        replied = s.query(models.Contact).filter_by(is_replied=True).count()
        unreplied = s.query(models.Contact).filter_by(is_replied=False, is_spam=False).count()
    return {"total": total, "spam": spam, "replied": replied, "unreplied": unreplied}


@community.route("/contacts/<contact_id:int>/reply", method="POST")
def contact_reply(contact_id):
    """Reply to a contact via email from contact@lusansapkota.com.np.

    Body: {body_html: str, body_text?: str, attachment?: {filename: str, content_base64: str}}.
    Marks is_replied=True on success.
    """
    data = request.json
    body_html = (data.get("body_html") or "").strip()
    if not body_html:
        return bad_request("body_html is required")
    if not mail_configured():
        return bad_request("Email service is not configured")
    attachment = None
    att = data.get("attachment")
    if att and isinstance(att, dict):
        filename = att.get("filename")
        b64 = att.get("content_base64")
        if filename and b64:
            try:
                attachment = (str(filename), base64.b64decode(b64))
            except Exception:
                return bad_request("Invalid attachment base64 data")
    with session_scope() as s:
        c = s.get(models.Contact, contact_id)
        if not c:
            return not_found()
        subject = f"Re: {c.subject or 'Your message'}"
        from_name = os.getenv("FROM_NAME", "Lusan Sapkota")
        signature = f'<p style="margin-top:28px;color:#6b5b54">{from_name}<br/>contact@lusansapkota.com.np</p>'
        full_html = body_html + signature
        text_body = (data.get("body_text") or "").strip() or None
        ok_sent = send_email(c.email, subject, full_html, text_body, attachment)
        if not ok_sent:
            return bad_request("Email send failed. Check SMTP configuration.")
        c.is_replied = True
        c.replied_at = datetime.now(timezone.utc)
        s.flush()
        return ok({"message": "Reply sent", "contact": _serialize_contact(c)})


@community.route("/contacts/<contact_id:int>", method=["GET", "PUT", "DELETE"])
def contact_detail(contact_id):
    with session_scope() as s:
        c = s.get(models.Contact, contact_id)
        if not c:
            return not_found()
        if request.method == "GET":
            return ok(_serialize_contact(c))
        if request.method == "DELETE":
            s.delete(c)
            return ok({"message": "Contact deleted"})
        data = request.json
        if "is_spam" in data:
            c.is_spam = bool(data["is_spam"])
        if "is_replied" in data:
            c.is_replied = bool(data["is_replied"])
            if c.is_replied:
                from datetime import datetime, timezone
                c.replied_at = datetime.now(timezone.utc)
        s.flush()
        return ok(_serialize_contact(c))


@community.route("/contacts/submit", method="POST")
def contact_submit():
    data = request.json
    with session_scope() as s:
        c = models.Contact(
            name=data.get("name", ""),
            email=data.get("email", ""),
            subject=data.get("subject"),
            message=data.get("message", ""),
        )
        s.add(c)
        s.flush()
        return created(_serialize_contact(c))


@community.route("/newsletter", method=["GET"])
@community.route("/newsletter/", method=["GET"])
def newsletter_list():
    with session_scope() as s:
        q = s.query(models.Newsletter)
        active = request.query.get("active")
        search = request.query.get("search")
        if active == "1":
            q = q.filter(models.Newsletter.is_active == True)
        elif active == "0":
            q = q.filter(models.Newsletter.is_active == False)
        if search:
            term = f"%{search}%"
            from sqlalchemy import or_
            q = q.filter(or_(
                models.Newsletter.email.ilike(term),
                models.Newsletter.name.ilike(term),
            ))
        items = [_serialize_sub(n) for n in q.order_by(models.Newsletter.subscribed_at.desc()).all()]
    return {"subscribers": items, "count": len(items)}


@community.route("/newsletter/subscribe", method="POST")
def newsletter_subscribe():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    if not email:
        return bad_request("Email is required")
    with session_scope() as s:
        existing = s.query(models.Newsletter).filter_by(email=email).first()
        if existing:
            if existing.is_active:
                return conflict("Already subscribed")
            existing.is_active = True
            existing.name = data.get("name") or existing.name
            existing.interests = data.get("interests") or existing.interests
            s.flush()
            return ok(_serialize_sub(existing))
        sub = models.Newsletter(
            email=email,
            name=data.get("name"),
            is_active=True,
            interests=data.get("interests"),
        )
        s.add(sub)
        s.flush()
        return created(_serialize_sub(sub))


@community.route("/newsletter/unsubscribe", method="POST")
def newsletter_unsubscribe():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    if not email:
        return bad_request("Email is required")
    with session_scope() as s:
        sub = s.query(models.Newsletter).filter_by(email=email).first()
        if not sub:
            return not_found("Email not found in subscription list")
        if not sub.is_active:
            return ok({"message": "Already unsubscribed", "email": email})
        sub.is_active = False
        s.flush()
        return ok({"message": "Unsubscribed successfully", "email": email})


@community.route("/newsletter/<sub_id:int>", method=["PUT", "DELETE"])
def newsletter_detail(sub_id):
    with session_scope() as s:
        sub = s.get(models.Newsletter, sub_id)
        if not sub:
            return not_found()
        if request.method == "DELETE":
            s.delete(sub)
            return ok({"message": "Unsubscribed"})
        data = request.json
        for f in ("is_active", "name", "interests"):
            if f in data:
                setattr(sub, f, data[f])
        s.flush()
        return ok(_serialize_sub(sub))


@community.route("/newsletter/stats", method=["GET"])
def newsletter_stats():
    """Aggregate stats: totals + interest tag breakdown."""
    with session_scope() as s:
        total = s.query(models.Newsletter).count()
        active = s.query(models.Newsletter).filter_by(is_active=True).count()
        inactive = total - active
        rows = s.query(models.Newsletter.interests).all()
        tag_counts: dict[str, int] = {}
        for (interests,) in rows:
            if not interests:
                continue
            if isinstance(interests, dict):
                tags = interests.get("tags") or []
            elif isinstance(interests, list):
                tags = interests
            else:
                continue
            for t in tags:
                tag_counts[str(t)] = tag_counts.get(str(t), 0) + 1
    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "interests": sorted(
            ({"tag": k, "count": v} for k, v in tag_counts.items()),
            key=lambda x: -x["count"],
        ),
    }


@community.route("/newsletter/preview", method="POST")
def newsletter_preview():
    """Render the email with a sample recipient. No side effects."""
    data = request.json
    subject = (data.get("subject") or "").strip()
    body_html = (data.get("body_html") or "").strip()
    if not subject or not body_html:
        return bad_request("subject and body_html are required")
    sample = data.get("sample") or {
        "name": "Friend",
        "email": "you@example.com",
        "unsubscribe_url": f"{data.get('site_url', 'https://lusansapkota.com.np')}/newsletter/unsubscribe",
    }
    rendered = _render_email(body_html, sample)
    return ok({"subject": subject, "html": rendered, "sample": sample})


@community.route("/newsletter/send", method="POST")
def newsletter_send():
    """Send a newsletter to a filtered set of subscribers.

    Body:
      subject: str (required)
      body_html: str (required, may contain {name}, {unsubscribe_url})
      body_text: str (optional)
      recipient_filter: "all" | "active" | "by_ids" | "by_interests" (default "active")
      subscriber_ids: list[int] (when filter=by_ids)
      interests: list[str] (when filter=by_interests)
      include_inactive: bool (default false; ignored when filter=by_ids)
      site_url: str (default https://lusansapkota.com.np)

    Returns the count of recipients and a job id. The actual send runs in
    a background thread so the admin can move on immediately.
    """
    data = request.json
    subject = (data.get("subject") or "").strip()
    body_html = (data.get("body_html") or "").strip()
    body_text = (data.get("body_text") or "").strip() or None
    if not subject or not body_html:
        return bad_request("subject and body_html are required")
    if not mail_configured():
        return bad_request("Email service is not configured (MAIL_* env vars missing)")

    recipient_filter = (data.get("recipient_filter") or "active").lower()
    if recipient_filter not in {"all", "active", "by_ids", "by_interests"}:
        return bad_request("recipient_filter must be all|active|by_ids|by_interests")
    include_inactive = bool(data.get("include_inactive", False))
    site_url = (data.get("site_url") or "https://lusansapkota.com.np").rstrip("/")

    with session_scope() as s:
        q = s.query(models.Newsletter)
        if recipient_filter == "active":
            q = q.filter(models.Newsletter.is_active == True)
        elif recipient_filter == "by_ids":
            ids = data.get("subscriber_ids") or []
            if not isinstance(ids, list) or not ids:
                return bad_request("subscriber_ids must be a non-empty list")
            q = q.filter(models.Newsletter.id.in_([int(i) for i in ids]))
        elif recipient_filter == "by_interests":
            tags = data.get("interests") or []
            if not isinstance(tags, list) or not tags:
                return bad_request("interests must be a non-empty list")
            terms = [t.strip() for t in tags if isinstance(t, str) and t.strip()]
            if not terms:
                return bad_request("interests must be a non-empty list")
            from sqlalchemy import or_, cast, String
            clauses = []
            for t in terms:
                like = f"%{t}%"
                clauses.append(cast(models.Newsletter.interests, String).ilike(like))
            q = q.filter(or_(*clauses))
            if not include_inactive:
                q = q.filter(models.Newsletter.is_active == True)
        elif recipient_filter == "all" and not include_inactive:
            q = q.filter(models.Newsletter.is_active == True)

        recipients = [
            {"id": r.id, "email": r.email, "name": r.name or ""}
            for r in q.all()
        ]

    if not recipients:
        return bad_request("No subscribers match the selected filter")

    job_id = _new_send_id()
    t = threading.Thread(
        target=_send_newsletter_job,
        args=(job_id, subject, body_html, body_text, recipients, site_url),
        daemon=True,
    )
    t.start()
    return created({
        "job_id": job_id,
        "queued": len(recipients),
        "filter": recipient_filter,
        "started_at": datetime.now(timezone.utc).isoformat(),
    })


@community.route("/newsletter/send/status/<job_id>", method=["GET"])
def newsletter_send_status(job_id):
    """Inspect a background send job."""
    job = _SEND_JOBS.get(job_id)
    if not job:
        return not_found("Job not found")
    return ok(job)


_SEND_JOBS: dict[str, dict] = {}
_JOB_COUNTER = 0
_JOB_LOCK = threading.Lock()


def _new_send_id() -> str:
    global _JOB_COUNTER
    with _JOB_LOCK:
        _JOB_COUNTER += 1
        return f"nl-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{_JOB_COUNTER:04d}"


def _render_email(body_html: str, recipient: dict) -> str:
    """Substitute {name} and {unsubscribe_url} in the body."""
    name = (recipient.get("name") or "Friend").strip() or "Friend"
    unsub = recipient.get("unsubscribe_url") or "https://lusansapkota.com.np/newsletter/unsubscribe"
    rendered = body_html.replace("{name}", name).replace("{unsubscribe_url}", unsub)
    if "{unsubscribe_url}" in rendered or "{name}" in body_html:
        return rendered
    footer = (
        f'<hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>'
        f'<p style="font-size:12px;color:#6b5b54;text-align:center">'
        f'You are receiving this because you subscribed at lusansapkota.com.np. '
        f'<a href="{unsub}" style="color:#d84315">Unsubscribe</a>.'
        f'</p>'
    )
    return rendered + footer


def _send_newsletter_job(job_id, subject, body_html, body_text, recipients, site_url):
    """Background loop. Updates _SEND_JOBS[job_id] with progress."""
    job = {
        "id": job_id,
        "status": "running",
        "total": len(recipients),
        "sent": 0,
        "failed": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "finished_at": None,
        "errors": [],
    }
    _SEND_JOBS[job_id] = job
    for r in recipients:
        unsub_url = f"{site_url}/newsletter/unsubscribe"
        rendered_html = _render_email(body_html, {**r, "unsubscribe_url": unsub_url})
        text_body = body_text
        if not text_body:
            text_body = re.sub(r"<[^>]+>", "", rendered_html).strip()
        ok = send_email(r["email"], subject, rendered_html, text_body)
        if ok:
            job["sent"] += 1
            with session_scope() as s:
                sub = s.get(models.Newsletter, r["id"])
                if sub:
                    sub.last_email_sent = datetime.now(timezone.utc)
        else:
            job["failed"] += 1
            job["errors"].append({"id": r["id"], "email": r["email"]})
    job["status"] = "completed"
    job["finished_at"] = datetime.now(timezone.utc).isoformat()
    _logger.info(
        "Newsletter job %s done: sent=%d failed=%d",
        job_id, job["sent"], job["failed"],
    )

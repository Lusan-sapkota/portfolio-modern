from lcore import Lcore, request
from db import models
from admin.db_helper import session_scope
from admin.helpers import ok, created, not_found, conflict

community = Lcore()


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
    email = data.get("email", "")
    with session_scope() as s:
        if s.query(models.Newsletter).filter_by(email=email).first():
            return conflict("Already subscribed")
        sub = models.Newsletter(
            email=email,
            name=data.get("name"),
            is_active=True,
            interests=data.get("interests"),
        )
        s.add(sub)
        s.flush()
        return created(_serialize_sub(sub))


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

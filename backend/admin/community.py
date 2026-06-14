from lcore import Lcore, request
from .store import store
from .helpers import ok, created, not_found, conflict

community = Lcore()


@community.route("/contacts", method=["GET"])
def contact_list():
    spam = request.query.get("spam")
    search = request.query.get("search")
    result = store.contacts[:]
    if spam == "1":
        result = store._filter(result, is_spam=True)
    elif spam == "0":
        result = store._filter(result, is_spam=False)
    if search:
        result = store._search(result, ["name", "email", "subject", "message"], search)
    result.sort(key=lambda x: x.get("submitted_at", ""), reverse=True)
    return ok({"contacts": result, "count": len(result)})


@community.route("/contacts/<contact_id:int>", method=["GET", "PUT", "DELETE"])
def contact_detail(contact_id):
    idx = store._find_idx(store.contacts, contact_id)
    if idx == -1:
        return not_found()
    if request.method == "GET":
        return ok(store.contacts[idx])
    if request.method == "DELETE":
        store.contacts.pop(idx)
        return ok({"message": "Contact deleted"})
    data = request.json
    c = store.contacts[idx]
    for f in ("is_spam", "is_replied"):
        if f in data:
            c[f] = bool(data[f])
    if data.get("is_replied"):
        c["replied_at"] = store._now()
    return ok(c)


@community.route("/contacts/submit", method="POST")
def contact_submit():
    data = request.json
    entry = {
        "id": store._id(),
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "subject": data.get("subject"),
        "message": data.get("message", ""),
        "is_spam": False,
        "is_replied": False,
        "submitted_at": store._now(),
        "replied_at": None,
    }
    store.contacts.append(entry)
    return created(entry)


@community.route("/newsletter", method=["GET"])
def newsletter_list():
    active = request.query.get("active")
    search = request.query.get("search")
    result = store.newsletter[:]
    if active == "1":
        result = store._filter(result, is_active=True)
    elif active == "0":
        result = store._filter(result, is_active=False)
    if search:
        result = store._search(result, ["email", "name"], search)
    result.sort(key=lambda x: x.get("subscribed_at", ""), reverse=True)
    return ok({"subscribers": result, "count": len(result)})


@community.route("/newsletter/subscribe", method="POST")
def newsletter_subscribe():
    data = request.json
    email = data.get("email", "")
    if store._filter(store.newsletter, email=email):
        return conflict("Already subscribed")
    sub = {
        "id": store._id(),
        "email": email,
        "name": data.get("name"),
        "is_active": True,
        "interests": data.get("interests"),
        "subscribed_at": store._now(),
        "last_email_sent": None,
    }
    store.newsletter.append(sub)
    return created(sub)


@community.route("/newsletter/<sub_id:int>", method=["PUT", "DELETE"])
def newsletter_detail(sub_id):
    idx = store._find_idx(store.newsletter, sub_id)
    if idx == -1:
        return not_found()
    if request.method == "DELETE":
        store.newsletter.pop(idx)
        return ok({"message": "Unsubscribed"})
    data = request.json
    s = store.newsletter[idx]
    for f in ("is_active", "name", "interests"):
        if f in data:
            s[f] = data[f]
    return ok(s)

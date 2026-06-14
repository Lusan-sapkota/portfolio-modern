from lcore import response


def ok(data):
    return data


def created(data):
    response.status = 201
    return data


def not_found(msg="Not found"):
    response.status = 404
    return {"error": msg}


def bad_request(msg):
    response.status = 400
    return {"error": msg}


def conflict(msg):
    response.status = 409
    return {"error": msg}


def unauthorized(msg="Invalid credentials"):
    response.status = 401
    return {"error": msg}

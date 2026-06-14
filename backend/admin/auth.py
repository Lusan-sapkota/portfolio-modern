import os
import time
import hashlib
import hmac

SECRET = os.getenv("ADMIN_SECRET_KEY", "dev-secret-change-in-production").encode()
TOKEN_EXPIRY = 7200  # 2 hours


def create_token(username: str) -> str:
    ts = str(int(time.time()))
    payload = f"{username}:{ts}"
    sig = hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def verify_token(token: str) -> str | None:
    try:
        parts = token.rsplit(":", 2)
        if len(parts) != 3:
            return None
        username, ts, sig = parts
        expected = hmac.new(SECRET, f"{username}:{ts}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return None
        if int(time.time()) - int(ts) > TOKEN_EXPIRY:
            return None
        return username
    except Exception:
        return None


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    return salt + ":" + hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()


def check_password(password: str, stored: str) -> bool:
    try:
        salt, pwhash = stored.split(":", 1)
        return hmac.compare_digest(
            hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex(),
            pwhash,
        )
    except Exception:
        return False

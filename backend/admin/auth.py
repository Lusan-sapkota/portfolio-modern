import os
import smtplib
import secrets
import time
import hashlib
import hmac
from email.mime.text import MIMEText
from datetime import datetime, timezone

from db import SessionLocal
from db.models import User

SECRET = os.getenv("ADMIN_SECRET_KEY", "dev-secret-change-in-production").encode()
SESSION_EXPIRY = int(os.getenv("ADMIN_SESSION_EXPIRY", 43200))
OTP_EXPIRY = 600

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "contact@lusansapkota.com.np")

MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
FROM_NAME = os.getenv("FROM_NAME", "Portfolio Admin")

PASSWORD_ALGO_VERSION = "v2"
PASSWORD_ITERATIONS = 600_000

_pending_otp: dict[str, tuple[str, float]] = {}


def _gen_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _send_email(to: str, subject: str, body: str) -> bool:
    if not MAIL_SERVER or not MAIL_USERNAME or not MAIL_PASSWORD:
        return False
    try:
        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{MAIL_FROM}>"
        msg["To"] = to
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=10) as server:
            if MAIL_USE_TLS:
                server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception:
        return False


def send_otp(email: str, username: str) -> str | None:
    otp = _gen_otp()
    _pending_otp[email] = (otp, time.time())
    body = f"""
    <h2>Portfolio Admin Login Verification</h2>
    <p>Hello {username},</p>
    <p>Your one-time password (OTP) is:</p>
    <h1 style="font-family:monospace;letter-spacing:0.3em;color:#d84315">{otp}</h1>
    <p>This code expires in 10 minutes. If you did not request this, please ignore.</p>
    """
    if _send_email(email, "Your Admin Login OTP", body):
        return otp
    return None


def verify_otp(email: str, otp: str) -> bool:
    record = _pending_otp.get(email)
    if not record:
        return False
    stored, ts = record
    if time.time() - ts > OTP_EXPIRY:
        del _pending_otp[email]
        return False
    if hmac.compare_digest(stored, otp.strip()):
        del _pending_otp[email]
        return True
    return False


def authenticate(username: str, password: str) -> User | None:
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(username=username, is_active=True).first()
        if not user:
            return None
        if not check_password(password, user.password_hash):
            return None
        if needs_rehash(user.password_hash):
            user.password_hash = hash_password(password)
        user.last_login_at = datetime.now(timezone.utc)
        s.commit()
        return user
    finally:
        s.close()


def change_password(username: str, new_password: str) -> bool:
    if len(new_password) < 8:
        return False
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(username=username).first()
        if not user:
            return False
        user.password_hash = hash_password(new_password)
        user.must_change_password = False
        user.password_reset_token = None
        user.password_reset_expires = None
        user.tokens_valid_after = datetime.now(timezone.utc)
        s.commit()
        return True
    finally:
        s.close()


def revoke_all_sessions(username: str) -> None:
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(username=username).first()
        if user:
            user.tokens_valid_after = datetime.now(timezone.utc)
            s.commit()
    finally:
        s.close()


def request_password_reset(email: str) -> str | None:
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(email=email, is_active=True).first()
        if not user:
            return None
        token = secrets.token_urlsafe(32)
        user.password_reset_token = hashlib.sha256(token.encode()).hexdigest()
        user.password_reset_expires = datetime.now(timezone.utc).timestamp() + 1800
        s.commit()
        body = f"""
        <h2>Password Reset Request</h2>
        <p>Hello {user.username},</p>
        <p>Use this token to reset your password. It expires in 30 minutes:</p>
        <h1 style="font-family:monospace;letter-spacing:0.1em;color:#d84315">{token}</h1>
        <p>If you did not request this, please ignore this email.</p>
        """
        if _send_email(email, "Password Reset Token", body):
            return token
        return None
    finally:
        s.close()


def reset_password_with_token(token: str, new_password: str) -> bool:
    if len(new_password) < 8:
        return False
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(password_reset_token=token_hash).first()
        if not user:
            return False
        import datetime as dt
        if user.password_reset_expires and dt.datetime.fromtimestamp(
            user.password_reset_expires, tz=timezone.utc
        ) < datetime.now(timezone.utc):
            return False
        user.password_hash = hash_password(new_password)
        user.must_change_password = False
        user.password_reset_token = None
        user.password_reset_expires = None
        user.tokens_valid_after = datetime.now(timezone.utc)
        s.commit()
        return True
    finally:
        s.close()


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
        if int(time.time()) - int(ts) > SESSION_EXPIRY:
            return None
        if not _is_token_current(username, int(ts)):
            return None
        return username
    except Exception:
        return None


def _is_token_current(username: str, issued_at: int) -> bool:
    s = SessionLocal()
    try:
        user = s.query(User).filter_by(username=username).first()
        if not user:
            return False
        if user.tokens_valid_after is None:
            return True
        return issued_at >= int(user.tokens_valid_after.timestamp())
    finally:
        s.close()


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), PASSWORD_ITERATIONS
    ).hex()
    return f"{PASSWORD_ALGO_VERSION}:{PASSWORD_ITERATIONS}:{salt}:{digest}"


def needs_rehash(stored: str) -> bool:
    if not stored or ":" not in stored:
        return True
    parts = stored.split(":", 1)[0]
    if not parts.startswith("v"):
        return True
    return stored.split(":", 2)[1] != str(PASSWORD_ITERATIONS)


def check_password(password: str, stored: str) -> bool:
    try:
        if stored.startswith(PASSWORD_ALGO_VERSION + ":"):
            _, _, salt, pwhash = stored.split(":", 3)
            return hmac.compare_digest(
                hashlib.pbkdf2_hmac(
                    "sha256", password.encode(), salt.encode(), PASSWORD_ITERATIONS
                ).hex(),
                pwhash,
            )
        salt, pwhash = stored.split(":", 1)
        return hmac.compare_digest(
            hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex(),
            pwhash,
        )
    except Exception:
        return False

import os
import smtplib
import random
import time
import hashlib
import hmac
from email.mime.text import MIMEText

SECRET = os.getenv("ADMIN_SECRET_KEY", "dev-secret-change-in-production").encode()
SESSION_EXPIRY = int(os.getenv("ADMIN_SESSION_EXPIRY", 43200))  # 12 hours
OTP_EXPIRY = 600  # 10 minutes

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "contact@lusansapkota.com.np")

MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
FROM_NAME = os.getenv("FROM_NAME", "Portfolio Admin")

_pending_otp: dict[str, tuple[str, float]] = {}


def _gen_otp() -> str:
    return f"{random.randint(100000, 999999)}"


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
        return username
    except Exception:
        return None

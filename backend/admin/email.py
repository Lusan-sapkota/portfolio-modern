"""Shared email helper. Used by OTP, password reset, and newsletter send."""
import os
import smtplib
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders

MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
FROM_NAME = os.getenv("FROM_NAME", "Portfolio Admin")


def mail_configured() -> bool:
    return bool(MAIL_SERVER and MAIL_USERNAME and MAIL_PASSWORD)


def send_email(
    to: str | list[str],
    subject: str,
    body_html: str,
    body_text: str | None = None,
    attachment: tuple[str, bytes] | None = None,
) -> bool:
    """Send a single message. `to` can be a string or a list of recipients.

    `attachment` is an optional (filename, raw_bytes) tuple.

    Returns True on success, False on any failure (caller decides how to log).
    """
    if not mail_configured():
        return False
    recipients = [to] if isinstance(to, str) else list(to)
    try:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{MAIL_FROM}>"
        msg["To"] = ", ".join(recipients)
        if body_text:
            msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))
        if attachment:
            filename, data = attachment
            part = MIMEBase("application", "octet-stream")
            part.set_payload(data)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
            msg.attach(part)
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=10) as server:
            if MAIL_USE_TLS:
                server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, recipients, msg.as_string())
        return True
    except Exception:
        return False

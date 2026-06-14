"""Seed the single admin user. Enforces: only one admin can ever exist in DB.

Behavior:
  - If zero admin users exist: creates one from ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_EMAIL.
  - ADMIN_PASSWORD must NOT be the default "admin". If it is unset or still "admin",
    a random 24-character password is generated and printed once.
  - If exactly one admin exists: refuses to create another. Exits non-zero.
  - Re-running with the same creds is a no-op.

To rotate the password, use the API or `make reset-admin` (and set a real value in .env).
"""
import os
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from lcore import load_dotenv
load_dotenv(str(Path(__file__).parent / ".env"))

from db import SessionLocal
from db.models import User
from admin.auth import hash_password

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "contact@lusansapkota.com.np")

DEFAULT_PASSWORD = "admin"
_env_password = os.getenv("ADMIN_PASSWORD", "")

if _env_password and _env_password != DEFAULT_PASSWORD:
    ADMIN_PASSWORD = _env_password
    _generated_password = False
else:
    alphabet = string.ascii_letters + string.digits
    ADMIN_PASSWORD = "".join(secrets.choice(alphabet) for _ in range(24))
    _generated_password = True


def seed():
    s = SessionLocal()
    try:
        admin_count = s.query(User).filter_by(is_admin=True).count()
        if admin_count > 0:
            existing = s.query(User).filter_by(is_admin=True).first()
            print(f"Admin already exists: '{existing.username}' (id={existing.id}).", file=sys.stderr)
            print("Only one admin is allowed. To change credentials, use the admin API or `make reset-admin`.", file=sys.stderr)
            sys.exit(1)

        user = User(
            username=ADMIN_USERNAME,
            password_hash=hash_password(ADMIN_PASSWORD),
            email=ADMIN_EMAIL,
            is_active=True,
            is_admin=True,
            must_change_password=True,
        )
        s.add(user)
        s.commit()
        print(f"Created admin user '{ADMIN_USERNAME}' (id={user.id}).")
        if _generated_password:
            print("")
            print("================================================================")
            print(" A one-time admin password was generated.")
            print(f"   username : {ADMIN_USERNAME}")
            print(f"   password : {ADMIN_PASSWORD}")
            print(" Save it now. It will NOT be shown again.")
            print(" Sign in and change it from the Settings page right away.")
            print("================================================================")
    finally:
        s.close()


if __name__ == "__main__":
    seed()

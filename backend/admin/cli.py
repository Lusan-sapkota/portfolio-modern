"""Admin CLI utilities (used by Makefile)."""
import os
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from lcore import load_dotenv
load_dotenv(str(Path(__file__).parent.parent / ".env"))

from db import SessionLocal
from db.models import User
from .auth import hash_password


def reset_admin():
    DEFAULT_PASSWORD = "admin"
    _env = os.getenv("ADMIN_PASSWORD", "")
    if _env and _env != DEFAULT_PASSWORD:
        new_password = _env
        generated = False
    else:
        alphabet = string.ascii_letters + string.digits
        new_password = "".join(secrets.choice(alphabet) for _ in range(24))
        generated = True

    s = SessionLocal()
    try:
        admin = s.query(User).filter_by(is_admin=True).first()
        if not admin:
            print("No admin exists yet. Run: make seed", file=sys.stderr)
            sys.exit(1)
        admin.password_hash = hash_password(new_password)
        admin.must_change_password = True
        admin.tokens_valid_after = None
        s.commit()
        print(f"Password reset for admin: {admin.username}")
        if generated:
            print("")
            print("================================================================")
            print(" A one-time admin password was generated.")
            print(f"   username : {admin.username}")
            print(f"   password : {new_password}")
            print(" Save it now. It will NOT be shown again.")
            print("================================================================")
    finally:
        s.close()


if __name__ == "__main__":
    reset_admin()

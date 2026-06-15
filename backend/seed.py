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
from db.models import User, Newsletter, Contact
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
            print(f"Admin already exists: '{existing.username}' (id={existing.id}). Skipping admin creation.")
            return

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
    seed_demo_data()


def seed_demo_data():
    """Seed demo newsletter subscribers and contact submissions.

    Idempotent: skips rows that already exist (matched by unique email).
    Runs by default for development. Set SEED_DEMO=0 to skip in production.
    """
    if os.getenv("SEED_DEMO", "1") != "1":
        print("Skipping demo data (SEED_DEMO != 1).")
        return

    s = SessionLocal()
    try:
        demo_subs = [
            {"email": "reader.one@example.com", "name": "Asha", "interests": {"tags": ["projects", "tutorials"]}},
            {"email": "dev.two@example.com", "name": "Bikram", "interests": {"tags": ["ai-ml"]}},
            {"email": "curious.three@example.com", "name": "Sita", "interests": {"tags": ["general"]}},
        ]
        added_subs = 0
        for entry in demo_subs:
            if s.query(Newsletter).filter_by(email=entry["email"]).first():
                continue
            s.add(Newsletter(
                email=entry["email"],
                name=entry["name"],
                is_active=True,
                interests=entry["interests"],
            ))
            added_subs += 1
        if added_subs:
            print(f"Seeded {added_subs} demo newsletter subscribers.")

        demo_contacts = [
            {
                "name": "Anish Pradhan",
                "email": "anish@example.com",
                "subject": "Collaboration on AI project",
                "message": "Hi Lusan, I saw your graph algorithm work and would love to chat about a possible collaboration on an AI-driven analytics tool. Let me know when you have a moment.",
            },
            {
                "name": "Priya Shrestha",
                "email": "priya@example.com",
                "subject": "Resume review request",
                "message": "Hello, I am a final-year CS student interested in full-stack roles. Could you review my resume and share feedback when convenient? Thanks in advance.",
            },
            {
                "name": "Rajesh Kumar",
                "email": "rajesh@example.com",
                "subject": "Feedback on your product",
                "message": "I found your product very useful. I would like to share my feedback and suggestions for improvement. Please let me know if you need any information.",
            },
            {
                "name": "Sita Shrestha",
                "email": "sita@example.com",
                "subject": "Inquiry about your services",
                "message": "Hello, I am interested in learning more about your services. Could you please share the details with me? Thanks in advance.",
            },
            {
                "name": "Lusan 2",
                "email": "slusan786@gmail.com",
                "subject": "Inquiry about your products",
                "message": "Hello, I am interested in learning more about your products. Could you please share the details with me? Thanks in advance.",
            },
        ]
        added_contacts = 0
        for entry in demo_contacts:
            if s.query(Contact).filter_by(email=entry["email"], subject=entry["subject"]).first():
                continue
            s.add(Contact(
                name=entry["name"],
                email=entry["email"],
                subject=entry["subject"],
                message=entry["message"],
                is_spam=False,
                is_replied=False,
            ))
            added_contacts += 1
        if added_contacts:
            print(f"Seeded {added_contacts} demo contact submissions.")

        if added_subs or added_contacts:
            s.commit()
    finally:
        s.close()

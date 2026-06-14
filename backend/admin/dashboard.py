from lcore import Lcore
from sqlalchemy import func
from db import models
from admin.db_helper import session_scope

dashboard = Lcore()


@dashboard.route("/")
def get_dashboard():
    with session_scope() as s:
        usd_total = s.query(func.coalesce(func.sum(models.Donation.amount), 0)).filter(
            models.Donation.status == "completed",
            models.Donation.currency == "USD",
        ).scalar()
        npr_total = s.query(func.coalesce(func.sum(models.Donation.amount), 0)).filter(
            models.Donation.status == "completed",
            models.Donation.currency == "NPR",
        ).scalar()
        return {
            "projects": s.query(models.Project).count(),
            "categories": s.query(models.Category).count(),
            "skills": s.query(models.Skill).count(),
            "experiences": s.query(models.Experience).count(),
            "education": s.query(models.Education).count(),
            "testimonials": s.query(models.Testimonial).count(),
            "social_links": s.query(models.SocialLink).count(),
            "contacts": s.query(models.Contact).count(),
            "newsletter_active": s.query(models.Newsletter).filter_by(is_active=True).count(),
            "wiki_articles": s.query(models.WikiArticle).count(),
            "wiki_categories": s.query(models.WikiCategory).count(),
            "donation_projects": s.query(models.DonationProject).count(),
            "donations": s.query(models.Donation).count(),
            "total_donations_usd": float(usd_total or 0),
            "total_donations_npr": float(npr_total or 0),
        }

from lcore import Lcore, request
from .store import store
from .helpers import ok, created, not_found

dashboard = Lcore()


@dashboard.route("/")
def get_dashboard():
    return {
        "projects": len(store.projects),
        "categories": len(store.categories),
        "skills": len(store.skills),
        "experiences": len(store.experiences),
        "education": len(store.educations),
        "testimonials": len(store.testimonials),
        "social_links": len(store.social_links),
        "contacts": len(store.contacts),
        "newsletter_active": len(store._filter(store.newsletter, is_active=True)),
        "wiki_articles": len(store.wiki_articles),
        "wiki_categories": len(store.wiki_categories),
        "donation_projects": len(store.donation_projects),
        "donations": len(store.donations),
        "total_donations_usd": sum(
            d.get("amount", 0) for d in store._filter(store.donations, status="completed", currency="USD")
        ),
        "total_donations_npr": sum(
            d.get("amount", 0) for d in store._filter(store.donations, status="completed", currency="NPR")
        ),
    }

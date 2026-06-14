from datetime import datetime, timezone
from typing import Any


class InMemoryStore:
    def __init__(self):
        self._next_id = 1
        self.users: list[dict] = []
        self.projects: list[dict] = []
        self.categories: list[dict] = []
        self.skills: list[dict] = []
        self.experiences: list[dict] = []
        self.educations: list[dict] = []
        self.testimonials: list[dict] = []
        self.social_links: list[dict] = []
        self.personal: dict | None = None
        self.seo_settings: list[dict] = []
        self.contacts: list[dict] = []
        self.newsletter: list[dict] = []
        self.wiki_articles: list[dict] = []
        self.wiki_categories: list[dict] = []
        self.donations: list[dict] = []
        self.donation_projects: list[dict] = []

    def _id(self) -> int:
        nid = self._next_id
        self._next_id += 1
        return nid

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _find(self, collection: list[dict], item_id: int) -> dict | None:
        return next((i for i in collection if i["id"] == item_id), None)

    def _find_idx(self, collection: list[dict], item_id: int) -> int:
        return next((idx for idx, i in enumerate(collection) if i["id"] == item_id), -1)

    def _filter(self, collection: list[dict], **kwargs) -> list[dict]:
        return [i for i in collection if all(i.get(k) == v for k, v in kwargs.items())]

    def _search(self, collection: list[dict], fields: list[str], query: str) -> list[dict]:
        q = query.lower()
        return [i for i in collection if any(q in str(i.get(f, "")).lower() for f in fields)]


store = InMemoryStore()

# API Reference

All admin routes are mounted under `ADMIN_ROUTE` (default `/configure-deafult-here`). This doc uses `{admin}` as a placeholder for that prefix.

Public read-only platform routes (`/wiki/*`, `/git/*`, `/store/*`) are listed in [ARCHITECTURE.md](./ARCHITECTURE.md) and aren't included here.

## Auth flow (cheat sheet)

| Step | Endpoint | Body | Returns |
|---|---|---|---|
| 1. Begin | `POST {admin}/login` | `{username, password, website}` | `{requires_otp, email, must_change_password}` or `401` |
| 2. Verify | `POST {admin}/verify-otp` | `{otp, username, website}` | `{token}` or `401` |
| 3a. Change | `POST {admin}/change-password` | `{current_password, new_password, website}` | `{message}` or `401/400` |
| 3b. Forgot | `POST {admin}/forgot-password` | `{email, website}` | always `200 {message}` |
| 3c. Reset | `POST {admin}/reset-password` | `{token, new_password, website}` | `{message}` or `400` |
| — | `POST {admin}/logout` | — | `{message}` (also revokes the calling token) |

All subsequent calls include `Authorization: Bearer <token>`. The token expires after `ADMIN_SESSION_EXPIRY` (default 12h) and is invalidated the moment a password change or `/logout` succeeds.

Every body that has `website` is the honeypot. Always send it (`website: ""` from the React form), and the server rejects any non-empty value with `400`.

## Status codes used here

`200` OK · `201` Created · `204` Deleted · `400` Validation · `401` Auth · `404` Not Found · `409` Conflict · `429` Rate limited

## Dashboard

| Method | Path | Notes |
|---|---|---|
| `GET` | `{admin}/api/dashboard/` | Counts across every entity + donation totals (USD / NPR) |

Response shape:
```json
{
  "projects": 12, "categories": 4, "skills": 18, "experiences": 5,
  "education": 2, "testimonials": 3, "social_links": 6,
  "contacts": 0, "newsletter_active": 14,
  "wiki_articles": 7, "wiki_categories": 3,
  "donation_projects": 2, "donations": 5,
  "total_donations_usd": 240.0, "total_donations_npr": 12000.0
}
```

## Projects

| Method | Path | Notes |
|---|---|---|
| `GET` | `{admin}/api/projects/` | List. Filters: `?category=<id>&status=<status>&search=<q>` |
| `POST` | `{admin}/api/projects/` | Create |
| `GET` | `{admin}/api/projects/<id>` | Read one |
| `PUT` | `{admin}/api/projects/<id>` | Update |
| `DELETE` | `{admin}/api/projects/<id>` | Delete |
| `POST` | `{admin}/api/projects/<id>/refresh-github` | Re-pull stars/forks from GitHub |

Project body fields: `title`, `description`, `image_url`, `github_url`, `live_url`, `commercial_url`, `technologies` (string), `category_id` (int), `is_featured` (bool), `is_opensource` (bool, default true), `show_on_homepage` (bool), `status` (`completed` / `in_progress` / `archived`, default `completed`).

## Categories

| Method | Path | Notes |
|---|---|---|
| `GET` | `{admin}/api/categories/` | List |
| `POST` | `{admin}/api/categories/` | Create |
| `GET` / `PUT` / `DELETE` | `{admin}/api/categories/<id>` | CRUD |

Body: `name`, `slug`, `color` (hex), `description`.

## Content (skills / experience / education / testimonials / social / SEO / donations / personal)

All under `{admin}/api/content/`.

| Resource | Endpoints | Body fields |
|---|---|---|
| Skills | `skills` (GET, POST), `skills/<id>` (GET, PUT, DELETE) | `name`, `level` (0–100), `category`, `icon` |
| Experiences | `experiences` (GET, POST), `experiences/<id>` (GET, PUT, DELETE) | `company`, `role`, `start_date`, `end_date`, `description`, `location`, `is_current` |
| Education | `education` (GET, POST), `education/<id>` (GET, PUT, DELETE) | `institution`, `degree`, `field`, `start_year`, `end_year`, `description` |
| Testimonials | `testimonials` (GET, POST), `testimonials/<id>` (GET, PUT, DELETE) | `name`, `role`, `company`, `quote`, `avatar_url` |
| Social links | `social` (GET, POST), `social/<id>` (GET, PUT, DELETE) | `platform`, `url`, `icon`, `order` |
| SEO | `seo` (GET, POST), `seo/<id>` (GET, PUT, DELETE) | `page`, `title`, `description`, `keywords`, `og_image` |
| Donation projects | `donation-projects` (GET, POST), `donation-projects/<id>` (GET, PUT, DELETE) | `title`, `description`, `goal_amount`, `currency`, `is_active` |
| Donations | `donations` (GET, POST), `donations/<id>` (GET, PUT, DELETE) | `project_id`, `donor_name`, `donor_email`, `amount`, `currency`, `status`, `message` |
| Personal | `personal` (GET, PUT) — singleton | `name`, `tagline`, `hero_title`, `hero_subtitle`, `about_text`, `location`, `avatar_url` |

## Wiki admin

| Method | Path |
|---|---|
| `GET` / `POST` | `{admin}/api/wiki/articles` |
| `GET` / `PUT` / `DELETE` | `{admin}/api/wiki/articles/<id>` |
| `GET` | `{admin}/api/wiki/articles/random` |
| `GET` / `POST` | `{admin}/api/wiki/categories` |
| `GET` / `PUT` / `DELETE` | `{admin}/api/wiki/categories/<id>` |

Article body: `title`, `slug`, `body` (markdown), `category_id`, `tags` (string list), `is_published`, `cover_image`.

## Community

| Method | Path | Notes |
|---|---|---|
| `GET` | `{admin}/api/community/contacts` | List. Filters: `?spam=true&search=<q>` |
| `GET` | `{admin}/api/community/contacts/stats` | `{total, spam, replied, unreplied}` — aggregate counts |
| `POST` | `{admin}/api/community/contacts/submit` | Public — no auth, used by the contact form |
| `GET` / `PUT` / `DELETE` | `{admin}/api/community/contacts/<id>` | Mark spam, read, delete |
| `POST` | `{admin}/api/community/contacts/<id>/reply` | Sends an email from `contact@lusansapkota.com.np`. Body: `{body_html, body_text?, attachment?: {filename, content_base64}}`. The attachment is optional — when present, it is decoded from base64 and attached to the outgoing email. Marks `is_replied=true` on success |
| `GET` | `{admin}/api/community/newsletter` | Filters: `?active=true&search=<q>` |
| `POST` | `{admin}/api/community/newsletter/subscribe` | Public — no auth. Body: `{email, name?, interests?}` |
| `POST` | `{admin}/api/community/newsletter/unsubscribe` | Public — no auth. Body: `{email}`. Returns `200 {message, email}` or `404` if the email is not in the list |
| `PUT` / `DELETE` | `{admin}/api/community/newsletter/<id>` | Manage subscriber |
| `GET` | `{admin}/api/community/newsletter/stats` | `{total, active, inactive, interests: [{tag, count}]}` — interest tag breakdown across all subscribers |
| `POST` | `{admin}/api/community/newsletter/preview` | Body: `{subject, body_html, site_url?}`. Renders the body with a sample recipient and returns `{html, sample}` — no side effects |
| `POST` | `{admin}/api/community/newsletter/send` | Body: `{subject, body_html, body_text?, recipient_filter, subscriber_ids?, interests?, include_inactive?, site_url?}`. Queues a background job and returns `{job_id, queued, filter, started_at}`. Filters: `all` / `active` / `by_ids` / `by_interests`. `body_html` may use `{name}` and `{unsubscribe_url}` placeholders |
| `GET` | `{admin}/api/community/newsletter/send/status/<job_id>` | Returns `{id, status, total, sent, failed, started_at, finished_at, errors: [{id, email}]}` |

## Data export / import

| Method | Path | Notes |
|---|---|---|
| `GET` | `{admin}/api/data/export` | Returns a zip of all tables as JSON |
| `POST` | `{admin}/api/data/import` | Accepts the same zip, wipes and restores |

## Error shape

```json
{ "error": "Invalid or expired OTP" }
```

`429` responses also include `Retry-After` (seconds) and the standard `X-RateLimit-Limit` / `X-RateLimit-Remaining` headers.

## Audit log

`audit_logs` is read through the same DB connection — there's no HTTP endpoint for it. Query directly with the SQL client of your choice. See [AUTH-AND-SECURITY.md](./AUTH-AND-SECURITY.md#audit-log).

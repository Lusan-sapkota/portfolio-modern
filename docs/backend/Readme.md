# Lcore Backend

Built with [Lcore](https://lcore.lusansapkota.com.np) (v0.0.4+), a lightweight Python web framework.

## Running

```bash
cd backend
pip install -r requirements.tzt
python main.py
```

Server starts on `http://0.0.0.0:8080`.

## Architecture

```
main.py              — root app, mounts platform sub-apps and admin
platforms/
  wiki.py            — wiki sub-app (articles, search, categories)
  git.py             — git sub-app (projects, GitHub API proxy)
  store.py           — store redirect
admin/
  __init__.py        — admin app, auth guard, mounts all sub-apps
  store.py           — in-memory data store (mirrors all reference models)
  auth.py            — JWT-like token auth (HMAC-SHA256)
  dashboard.py       — stats endpoint
  projects.py        — projects + categories CRUD + GitHub refresh
  content.py         — skills, experience, education, testimonials, social, personal, seo CRUD
  wiki.py            — wiki articles + categories CRUD
  community.py       — contacts, newsletter CRUD
  data.py            — full data export/import (zip of JSON)
  helpers.py         — response helpers (created, not_found, bad_request, etc.)
```

## Platform Routes

### Wiki (`/wiki`)

| Route | Method | Description |
|---|---|---|
| `/wiki/` | GET | Wiki index |
| `/wiki/search` | GET | Search articles |
| `/wiki/article/<id>` | GET | Article detail |
| `/wiki/random` | GET | Random article |
| `/wiki/explore` | GET | Explore articles |
| `/wiki/categories` | GET | List categories |

### Git (`/git`)

| Route | Method | Description |
|---|---|---|
| `/git/` | GET | Git index (projects) |
| `/git/search` | GET | Search projects |
| `/git/project/<id>` | GET | Project detail |
| `/git/api/projects` | GET | List all projects |
| `/git/api/repos` | GET | Live GitHub repos (user: Lusan-sapkota) |
| `/git/api/repo/<user>/<repo>` | GET | Single GitHub repo detail |

### Store (`/store`)

| Route | Method | Description |
|---|---|---|
| `/store/` | GET | Redirects to store.lusansapkota.com.np |
| `/store/info` | GET | Store metadata |

### Root

| Route | Method | Description |
|---|---|---|
| `/hello` | GET | Health check |
| `/platforms` | GET | List all connected platforms |

## Platforms (3)

As in the original Flask portfolio (`portfolio-prod`), three platforms are connected:

1. **Wiki** (`wiki.lusansapkota.com.np`) — knowledge base, articles, categories
2. **Git** (`git.lusansapkota.com.np`) — project showcase with live GitHub data
3. **Store** (`store.lusansapkota.com.np`) — external store redirect

## Admin Panel

The admin panel is mounted on a configurable route to keep it hidden from crawlers.

**Default route**: `/configure-deafult-here`  
**Override**: set `ADMIN_ROUTE` in `.env` (e.g. `ADMIN_ROUTE=/my-secret-dashboard`)

### Authentication

```
POST /configure-deafult-here/login  {"username": "admin", "password": "admin"}  -> {token: "..."}
```

All other admin endpoints require `Authorization: Bearer <token>`. Tokens expire after 2 hours.

### Admin API Routes

All routes require auth unless noted otherwise.

#### Dashboard
| Route | Method | Description |
|---|---|---|
| `api/dashboard/` | GET | Overview stats across all entities |

#### Projects
| Route | Method | Description |
|---|---|---|
| `api/projects/` | GET, POST | List / create projects |
| `api/projects/<id>` | GET, PUT, DELETE | CRUD single project |
| `api/projects/<id>/refresh-github` | POST | Refresh GitHub stars/forks |

#### Categories
| Route | Method | Description |
|---|---|---|
| `api/categories/` | GET, POST | List / create categories |
| `api/categories/<id>` | GET, PUT, DELETE | CRUD single category |

#### Content (Skills, Experience, Education, Testimonials, Social, SEO, Donations)
| Route | Method | Description |
|---|---|---|
| `api/content/skills` | GET, POST | CRUD skills |
| `api/content/skills/<id>` | GET, PUT, DELETE | CRUD single skill |
| `api/content/experiences` | GET, POST | CRUD experiences |
| `api/content/education` | GET, POST | CRUD education |
| `api/content/testimonials` | GET, POST | CRUD testimonials |
| `api/content/social` | GET, POST | CRUD social links |
| `api/content/seo` | GET, POST | CRUD SEO settings |
| `api/content/donation-projects` | GET, POST | CRUD donation projects |
| `api/content/donations` | GET, POST | CRUD donations |
| `api/content/personal` | GET, PUT | Read/update personal info (singleton) |

#### Wiki Admin
| Route | Method | Description |
|---|---|---|
| `api/wiki/articles` | GET, POST | CRUD wiki articles |
| `api/wiki/articles/<id>` | GET, PUT, DELETE | CRUD single article |
| `api/wiki/articles/random` | GET | Random article |
| `api/wiki/categories` | GET, POST | CRUD wiki categories |
| `api/wiki/categories/<id>` | GET, PUT, DELETE | CRUD single category |

#### Community
| Route | Method | Description |
|---|---|---|
| `api/community/contacts` | GET | List contacts (filters: spam, search) |
| `api/community/contacts/submit` | POST | Submit contact form |
| `api/community/contacts/<id>` | GET, PUT, DELETE | CRUD single contact |
| `api/community/newsletter` | GET | List subscribers (filters: active, search) |
| `api/community/newsletter/subscribe` | POST | Subscribe to newsletter |
| `api/community/newsletter/<id>` | PUT, DELETE | Manage subscriber |

#### Data Export/Import
| Route | Method | Description |
|---|---|---|
| `api/data/export` | GET | Download all data as zip |
| `api/data/import` | POST | Upload zip to restore data |

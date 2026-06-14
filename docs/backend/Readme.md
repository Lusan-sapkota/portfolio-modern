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
main.py              — root app, mounts platform sub-apps
platforms/
  wiki.py            — wiki sub-app (articles, search, categories)
  git.py             — git sub-app (projects, GitHub API proxy)
  store.py           — store redirect
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

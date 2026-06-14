# Frontend Setup

Next.js 16 App Router + TypeScript + Tailwind. No external state management — React Context is enough for the section-aware UI.

## Install

```bash
cd frontend
npm install
```

Requires Node 20+.

## Environment

```bash
cp .env.example .env.local
```

| Var | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend base URL. The frontend hits this directly for `/login`, `/wiki/*`, `/git/*`, etc. |
| `NEXT_PUBLIC_ADMIN_ROUTE` | `/configure-deafult-here` | Hidden admin URL prefix. **Must match** the backend's `ADMIN_ROUTE` env var. |

The admin route is hidden behind a rewrite (see [ARCHITECTURE.md](./ARCHITECTURE.md#hidden-admin-route)), so changing the env var on both sides is the only setup step.

## Run

```bash
npm run dev              # http://localhost:3000
npm run build && npm start
```

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Dev server with Turbopack, hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Tech

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS variables + Tailwind utility classes (see `app/globals.css`) |
| Animation | Framer Motion (for the book-flip effect) |
| Smooth scroll | Lenis |
| Auth state | `localStorage` + a thin wrapper in `app/lib/admin-api.ts` |

## Theme

The portfolio uses a warm "paper-and-ink" palette. CSS variables in `app/globals.css`:

```css
--color-ink:    #1a1a1a;     /* primary text */
--color-paper:  #fff8e1;     /* page background */
--color-sienna: #b07d5b;     /* accent */
--color-ink-soft: #6b5b54;   /* muted text */
```

Dark mode is OS-driven via `@media (prefers-color-scheme: dark)` overrides on the same variables. No manual toggle. The book shadow depth in `BookPage` also adapts to the color scheme.

# Book Page-Flip Effect

Each portfolio section behaves like a rigid book page that tilts in 3D space as you scroll, producing a stacked sweep reminiscent of flipping through pages.

## Architecture

```
page.tsx
  └── <HomeShell>                — owns active-section state
       ├── <Nav />               — sticky header, adapts to OS + hero/page
       ├── <Hero />              — 100vh golden splash (no 3D)
       └── <BookSection>         — sticky stage, shared scroll progress
            ├── <About /><BookPage id="about"    bg="#b07d5b" .../>
            ├── <Experience /><BookPage id="experience"  bg="#006064" .../>
            ├── <Portfolio /><BookPage id="portfolio"   bg="#004d40" .../>
            ├── <Skills /><BookPage id="skills"     bg="#00838f" .../>
            ├── <Testimonials /><BookPage id="testimonials" bg="#b71c1c".../>
            ├── <Education /><BookPage id="education"   bg="#3e2723" .../>
            ├── <Contact /><BookPage id="contact"     bg="#fff8e1" .../>
            └── <Platforms /><BookPage id="platforms"   bg="#d84315" .../>
```

### `BookSection`
- A `<div>` that is `count × 100svh` tall, creating the scrollable room.
- A sticky inner `<div>` (`h-[100svh]`) acts as the **stage** with `perspective: 2400px`.
- Owns a single `useScroll` hook (`offset: ["start start", "end end"]`).
- Exposes `scrollYProgress` to children via `BookProgressContext`.
- On every scroll change, it reads the current page index from the progress, looks up the child's `id`/`bg`/`textColor` props, and publishes them to `ActiveSectionContext`.
- Resets to the Hero state (`"top"`) when `scrollYProgress ≤ 0.005`.
- Pins scroll to `0,0` and sets `scrollRestoration = "manual"` on mount so refreshes don't glitch.

### `BookPage`
- Absolutely positioned inside the sticky stage (all 8 pages stack on top of each other).
- Each page maps its own slice `[index/total, (index+1)/total]` of the shared progress to 3D transforms:

| Transform | Entering (start) | Center (mid) | Leaving (end) |
|-----------|-------------------|--------------|---------------|
| `rotateX` | 22° | 0° | -22° |
| `rotateY` | -12° | 0° | 12° |
| `scale` | 0.9 | 1.0 | 0.9 |
| `translateZ` | -500px | 0 | 500px |
| `opacity` | 0 | 1 | 0 |
| `boxShadow` | deep (0.45) | soft (0.18) | deep (0.45) |

- Inner content receives a **parallax** counter-motion (`y: 80→0→-80, x: -30→0→30`) to add depth.
- Shadow depth is adaptive: in light OS mode the shadows are lighter (`0.18 / 0.10`), in dark mode they are deeper (`0.45 / 0.22`).
- Book-print details: a `book-gutter` shadow on the left, a `book-corner` gradient on the bottom-right, and a `book-page-num` label in the bottom-right corner.

### Contexts

| Context | Purpose |
|---------|---------|
| `BookProgressContext` | Framer Motion `MotionValue<number>` (0 → 1) shared across all pages |
| `ActiveSectionContext` | Current `{ id, bg, textColor }` for the Nav to read |
| `HomeShell` | Wraps both in a single client component that owns the state |

## 8-Section Color Palette

| # | Section | BG | Text |
|---|---------|----|------|
| 1 | About | `#b07d5b` (tan) | `#1a1a1a` |
| 2 | Experience | `#006064` (teal dark) | `#fff8e1` |
| 3 | Portfolio | `#004d40` (teal deep) | `#fff8e1` |
| 4 | Skills | `#00838f` (teal bright) | `#fff8e1` |
| 5 | Testimonials | `#b71c1c` (crimson) | `#fff8e1` |
| 6 | Education | `#3e2723` (espresso) | `#fff8e1` |
| 7 | Contact | `#fff8e1` (cream) | `#3e2723` |
| 8 | Platforms | `#d84315` (burnt sienna) | `#fff8e1` |

## Nav Adaptation

The sticky header is transparent until the user scrolls past 40px, then gains `backdrop-filter: blur(14px)` with a tinted background.

**Palette rules** (in order of priority):
1. **Hero section** (`active.id === "top"`) — black logo chip, black text, gold hamburger icon
2. **Book + dark OS** — `#1a1a1a` chip, `#fff8e1` text, dark-tinted bar
3. **Book + light OS** — white chip, `#1a1a1a` text, white-tinted bar

Active page highlighting uses **bold weight (700) + a small dot** underneath (no pill background). In the Hero, all items are bold.

## Scrollbar

Hidden globally via `scrollbar-width: none` (Firefox), `-ms-overflow-style: none` (IE), `html::-webkit-scrollbar { display: none }` (Chrome/Safari). Scrolling still works through Lenis (smooth scroll) and the browser's native scroll engine.

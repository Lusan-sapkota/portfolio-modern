"use client";

import Lenis from "lenis";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);

/**
 * LenisProvider sets up a global smooth scroll instance and intercepts
 * anchor clicks to scroll to the target. Book pages (positioned inside
 * a sticky stage) need a calculated scroll position based on the page
 * index, so we resolve those via data-page-index.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(instance);

    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      if (href === "#top") {
        instance.scrollTo(0, { offset: 0 });
        return;
      }

      const el = document.querySelector(href) as HTMLElement | null;
      if (!el) return;

      const pageIndex = el.dataset.pageIndex;
      const pageTotal = el.dataset.pageTotal;
      if (pageIndex !== undefined && pageTotal !== undefined) {
        const idx = Number(pageIndex);
        const total = Number(pageTotal);
        const book = el.closest(".book-section") as HTMLElement | null;
        if (book) {
          const bookTop = book.getBoundingClientRect().top + window.scrollY;
          const bookHeight = book.offsetHeight;
          const vh = window.innerHeight;
          const scrollable = Math.max(1, bookHeight - vh);
          const mid = (idx + 0.5) / total;
          const target = bookTop + mid * scrollable - 20;
          instance.scrollTo(target, { offset: 0 });
          return;
        }
      }

      instance.scrollTo(el as HTMLElement, { offset: -20 });
    };

    document.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleClick);
      instance.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

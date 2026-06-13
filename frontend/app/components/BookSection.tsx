"use client";

import { useScroll } from "framer-motion";
import { Children, ReactNode, useEffect, useRef } from "react";
import { useActiveSection } from "./ActiveSectionContext";
import { BookProgressContext } from "./BookContext";

const HERO: { id: string; bg: string; textColor: string } = {
  id: "top",
  bg: "#ffd700",
  textColor: "#1a1a1a",
};

export function BookSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const { active, setActive } = useActiveSection();
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    lastId.current = null;
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v <= 0.005) {
        lastId.current = null;
        if (active.id !== HERO.id) setActive(HERO);
        return;
      }
      if (v >= 0.995) {
        lastId.current = null;
        return;
      }
      const idx = Math.max(0, Math.min(count - 1, Math.round(v * count - 0.5)));
      const child = Children.toArray(children)[idx] as
        | { props?: { id?: string; bg?: string; textColor?: string } }
        | undefined;
      const id = child?.props?.id;
      const bg = child?.props?.bg;
      const textColor = child?.props?.textColor;
      if (id && bg && textColor && id !== lastId.current) {
        lastId.current = id;
        setActive({ id, bg, textColor });
      }
    });
    return unsubscribe;
  }, [scrollYProgress, count, children, setActive, active.id]);

  return (
    <div
      ref={ref}
      className="book-section relative w-full"
      style={{ height: `${count * 100}svh` }}
    >
      <div
        className="book-stage sticky top-0 w-full h-[100svh] overflow-hidden"
        style={{ perspective: "2400px", perspectiveOrigin: "50% 50%" }}
      >
        <BookProgressContext.Provider value={scrollYProgress}>
          {children}
        </BookProgressContext.Provider>
      </div>
    </div>
  );
}

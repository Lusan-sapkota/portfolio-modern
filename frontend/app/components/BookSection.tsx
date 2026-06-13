"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { Children, ReactNode, useRef } from "react";
import { useActiveSection } from "./ActiveSectionContext";
import { BookProgressContext } from "./BookContext";

/**
 * BookSection is the sticky shell that holds every <BookPage>.
 * It owns the single scroll progress, exposes it to children
 * through context, and publishes the current section ID so
 * the Nav can highlight the page in view.
 */
export function BookSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const { active, setActive } = useActiveSection();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v <= 0.001 || v >= 0.999) return;
    const idx = Math.max(0, Math.min(count - 1, Math.round(v * count - 0.5)));
    const child = Children.toArray(children)[idx] as
      | { props?: { id?: string } }
      | undefined;
    const id = child?.props?.id;
    if (id && id !== active) setActive(id);
  });

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

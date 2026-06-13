"use client";

import { motion, useTransform } from "framer-motion";
import { ReactNode } from "react";
import { useBookProgress } from "./BookContext";
import { useColorScheme } from "./useColorScheme";

const SHADOWS = {
  light: {
    edge: "0 30px 60px rgba(0,0,0,0.18)",
    flat: "0 10px 24px rgba(0,0,0,0.10)",
  },
  dark: {
    edge: "0 40px 80px rgba(0,0,0,0.45)",
    flat: "0 14px 36px rgba(0,0,0,0.22)",
  },
} as const;

export function BookPage({
  children,
  bg,
  textColor = "#ffffff",
  id,
  page,
  label,
  index,
  total,
}: {
  children: ReactNode;
  bg: string;
  textColor?: string;
  id?: string;
  page?: string;
  label?: string;
  index: number;
  total: number;
}) {
  const progress = useBookProgress();
  const scheme = useColorScheme();
  const palette = SHADOWS[scheme];
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;

  const rotateX = useTransform(progress, [start, mid, end], [22, 0, -22]);
  const rotateY = useTransform(progress, [start, mid, end], [-12, 0, 12]);
  const scale = useTransform(progress, [start, mid, end], [0.9, 1, 0.9]);
  const translateZ = useTransform(progress, [start, mid, end], [-500, 0, 500]);
  const opacity = useTransform(progress, [start, mid, end], [0, 1, 0]);
  const parallaxY = useTransform(progress, [start, mid, end], [80, 0, -80]);
  const parallaxX = useTransform(progress, [start, mid, end], [-30, 0, 30]);
  const zIndex = useTransform(progress, (v) => {
    const dist = Math.abs(v - mid);
    if (dist < 0.5 / total) return 10;
    return 1;
  });
  const shadow = useTransform(
    progress,
    [start, mid, end],
    [palette.edge, palette.flat, palette.edge]
  );

  return (
    <motion.div
      id={id}
      data-page-index={index}
      data-page-total={total}
      aria-label={label}
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundColor: bg,
        color: textColor,
        rotateX,
        rotateY,
        scale,
        translateZ,
        opacity,
        zIndex,
        boxShadow: shadow,
        transformOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.div
        className="relative w-full h-full will-change-transform"
        style={{ y: parallaxY, x: parallaxX }}
      >
        {children}
      </motion.div>
      <div className="book-gutter" aria-hidden />
      <div className="book-corner" aria-hidden />
      {page && <span className="book-page-num">{page}</span>}
    </motion.div>
  );
}

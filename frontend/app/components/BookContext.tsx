"use client";

import { MotionValue } from "framer-motion";
import { createContext, useContext } from "react";

export const BookProgressContext = createContext<MotionValue<number> | null>(null);

export function useBookProgress(): MotionValue<number> {
  const ctx = useContext(BookProgressContext);
  if (!ctx) {
    throw new Error("useBookProgress must be used inside <BookSection>");
  }
  return ctx;
}

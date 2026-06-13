"use client";

import { createContext, useContext } from "react";

export const ActiveSectionContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

export function useActiveSection() {
  const ctx = useContext(ActiveSectionContext);
  if (!ctx) {
    throw new Error("useActiveSection must be used inside <ActiveSectionProvider>");
  }
  return ctx;
}

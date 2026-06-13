"use client";

import { createContext, useContext } from "react";

export type ActiveSection = {
  id: string;
  bg: string;
  textColor: string;
};

export const ActiveSectionContext = createContext<{
  active: ActiveSection;
  setActive: (next: ActiveSection) => void;
} | null>(null);

export function useActiveSection() {
  const ctx = useContext(ActiveSectionContext);
  if (!ctx) {
    throw new Error("useActiveSection must be used inside <HomeShell>");
  }
  return ctx;
}

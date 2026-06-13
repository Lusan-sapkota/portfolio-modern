"use client";

import { ReactNode, useCallback, useState } from "react";
import { ActiveSection, ActiveSectionContext } from "./ActiveSectionContext";

const INITIAL: ActiveSection = { id: "top", bg: "#ffd700", textColor: "#1a1a1a" };

export function HomeShell({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ActiveSection>(INITIAL);
  const setActive = useCallback((next: ActiveSection) => setActiveState(next), []);

  return (
    <ActiveSectionContext.Provider value={{ active, setActive }}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

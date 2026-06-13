"use client";

import { ReactNode, useCallback, useState } from "react";
import { ActiveSectionContext } from "./ActiveSectionContext";

/**
 * HomeShell owns the active section state so the BookSection
 * can publish scroll-driven changes and the Nav can subscribe.
 */
export function HomeShell({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<string>("about");
  const setActive = useCallback((id: string) => setActiveState(id), []);

  return (
    <ActiveSectionContext.Provider value={{ active, setActive }}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

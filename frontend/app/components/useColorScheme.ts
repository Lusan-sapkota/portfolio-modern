"use client";

import { useEffect, useState } from "react";

export function useColorScheme(): "light" | "dark" {
  const [scheme, setScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
    const lightMQ = window.matchMedia("(prefers-color-scheme: light)");

    const update = () => {
      if (darkMQ.matches) setScheme("dark");
      else if (lightMQ.matches) setScheme("light");
      else setScheme("light");
    };

    update();
    darkMQ.addEventListener("change", update);
    lightMQ.addEventListener("change", update);
    return () => {
      darkMQ.removeEventListener("change", update);
      lightMQ.removeEventListener("change", update);
    };
  }, []);

  return scheme;
}

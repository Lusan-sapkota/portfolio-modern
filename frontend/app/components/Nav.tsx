"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useActiveSection } from "./ActiveSectionContext";
import { useColorScheme } from "./useColorScheme";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Skills", href: "#skills" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
  { label: "Platforms", href: "#platforms" },
];

export function Nav() {
  const scheme = useColorScheme();
  const { active } = useActiveSection();
  const isLightMode = scheme === "light";
  const inHero = active.id === "top";
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ink = inHero
    ? "#000000"
    : isLightMode
      ? "#1a1a1a"
      : "#fff8e1";
  const inkSoft = inHero
    ? "rgba(0,0,0,0.62)"
    : isLightMode
      ? "rgba(0,0,0,0.62)"
      : "rgba(255,248,225,0.72)";
  const chipBg = inHero
    ? "#000000"
    : isLightMode
      ? "#ffffff"
      : "#1a1a1a";
  const chipText = inHero ? "#ffd700" : ink;
  const chipBorder = inHero
    ? "rgba(0,0,0,0.5)"
    : isLightMode
      ? "rgba(0,0,0,0.08)"
      : "rgba(255,255,255,0.08)";
  const barBg = scrolled
    ? inHero
      ? "rgba(0,0,0,0.08)"
      : isLightMode
        ? "rgba(255,255,255,0.72)"
        : "rgba(10,10,10,0.55)"
    : "transparent";
  const mobileBarBg = inHero
    ? "rgba(0,0,0,0.92)"
    : isLightMode
      ? "rgba(255,255,255,0.92)"
      : "rgba(10,10,10,0.92)";
  const mobileBorder = inHero
    ? "rgba(0,0,0,0.4)"
    : isLightMode
      ? "rgba(0,0,0,0.08)"
      : "rgba(255,255,255,0.10)";

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-[background-color,backdrop-filter,color] duration-500"
      style={{
        backgroundColor: barBg,
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        color: ink,
      }}
    >
      <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-14">
        <a
          href="#top"
          aria-label="Lusan Sapkota — Home"
          className="inline-flex items-center shrink-0 rounded-[8px] px-2.5 sm:px-3 py-1 sm:py-1.5 hover:scale-[1.02] transition-transform shadow-md"
          style={{
            backgroundColor: chipBg,
            color: ink,
            border: `1px solid ${chipBorder}`,
          }}
        >
          <Image
            src="/logo/logo.png"
            alt="Lusan Sapkota"
            width={140}
            height={32}
            className="h-5 sm:h-7 w-auto"
            priority
          />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-1 text-[0.9rem] font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = active.id === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative px-3 py-1.5 rounded-full transition-colors duration-300 whitespace-nowrap"
                  style={{
                    color: inHero || isActive ? ink : inkSoft,
                    fontWeight: inHero || isActive ? 550 : 500,
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: ink }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] shadow-md shrink-0"
            style={{
              backgroundColor: chipBg,
              color: inHero ? chipText : ink,
              border: `1px solid ${chipBorder}`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="lg:hidden border-t transition-colors duration-300"
          style={{
            borderColor: mobileBorder,
            backgroundColor: mobileBarBg,
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            color: ink,
          }}
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = active.id === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-5 sm:px-8 py-2.5 text-sm transition-colors duration-300"
                    style={{
                      color: inHero || isActive ? ink : inkSoft,
                      fontWeight: inHero || isActive ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

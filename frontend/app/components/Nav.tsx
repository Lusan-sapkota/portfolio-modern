"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useActiveSection } from "./ActiveSectionContext";

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

/**
 * Nav — sticky top navigation that highlights the section in view.
 * Mobile uses a slide-down menu. Active item is driven by the
 * shared ActiveSectionContext published from the BookSection.
 */
export function Nav() {
  const { active } = useActiveSection();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [solid, setSolid] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setSolid(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/10"
          : scrolled
            ? "bg-[#0a0a0a]/55 backdrop-blur-sm"
            : "bg-transparent"
      }`}
    >
      <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-14">
        <a
          href="#top"
          aria-label="Lusan Sapkota — Home"
          className="inline-flex items-center shrink-0 rounded-[8px] bg-[#1a1a1a] px-2.5 sm:px-3 py-1 sm:py-1.5 hover:scale-[1.02] transition-transform shadow-md"
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
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    isActive
                      ? "text-[#fff8e1] bg-white/15"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#fff8e1]" />
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
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-[#1a1a1a] text-[#ffd700] shadow-md shrink-0"
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
          className="lg:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-5 sm:px-8 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "text-[#fff8e1] bg-white/10"
                        : "text-white/80 hover:bg-white/5"
                    }`}
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

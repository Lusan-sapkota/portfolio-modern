"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero — clean magazine layout, fully responsive
 * 100vh · watermark behind · toggleable portrait · mobile menu.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const waterTextRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showFront, setShowFront] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waterSize, setWaterSize] = useState<number>(320);

  // Subtle mouse parallax on the character only
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setPos({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Dynamically size the LUSAN watermark to fit its container
  useEffect(() => {
    const container = waterRef.current;
    const text = waterTextRef.current;
    if (!container || !text) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth === 0) return;

      // Measure text width at a known font-size, then scale
      const testSize = 100;
      const prev = text.style.fontSize;
      text.style.fontSize = `${testSize}px`;
      const measured = text.scrollWidth;
      text.style.fontSize = prev;

      if (measured === 0) return;

      // 0.96 leaves a small breathing margin so letters aren't flush with the edge
      const target = (testSize * containerWidth) / measured * 0.96;
      setWaterSize(target);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const charX = pos.x * 10;
  const charY = pos.y * 6;

  const mainSrc = showFront ? "/assests/frontangle.png" : "/assests/sideangle.png";
  const thumbSrc = showFront ? "/assests/sideangle.png" : "/assests/frontangle.png";
  const thumbLabel = showFront ? "Side" : "Front";
  const thumbKicker = showFront ? "See the" : "Meet the";

  const navItems = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Skills", href: "#skills" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Education", href: "#education" },
    { label: "Contact", href: "#contact" },
    { label: "Platforms", href: "#platforms" },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[100svh] sm:h-screen overflow-hidden isolate bg-[#ffd700] flex flex-col"
      aria-label="Hero — Lusan Sapkota"
    >
      {/* Yellow radial glow */}
      <div className="hero-glow absolute inset-0 -z-10" aria-hidden />
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden />

      {/* Top bar — h-14 desktop, h-12 mobile */}
      <header className="relative z-30 shrink-0 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-14">
        {/* Logo */}
        <a
          href="#top"
          aria-label="Lusan Sapkota — Home"
          className="rise-in inline-flex items-center shrink-0 rounded-[8px] bg-[#1a1a1a] px-2.5 sm:px-3 py-1 sm:py-1.5 hover:scale-[1.02] transition-transform shadow-md"
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

        {/* Right cluster: Contact + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-7 text-[1rem] font-medium text-[#1a1a1a]/80 rise-in delay-1">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#1a1a1a] transition whitespace-nowrap">
                {item.label}
              </a>
            ))}
          </nav>

          {/* Hamburger — mobile/tablet only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-[#1a1a1a] text-[#ffd700] shadow-md shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
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
      </header>

      {/* Mobile menu — slides down from header */}
      {menuOpen && (
        <nav
          className="lg:hidden relative z-30 shrink-0 border-b border-[#1a1a1a]/15 bg-[#1a1a1a] text-[#ffd700] rise-in"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 sm:px-8 py-2.5 text-sm font-medium hover:bg-[#ffd700] hover:text-[#1a1a1a] transition"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main area */}
      <div className="relative flex-1 min-h-0 px-4 sm:px-8 lg:px-14 flex flex-col">
        {/* Character stage — responsive height, smaller on mobile */}
        <div className="relative min-h-0 flex items-end justify-center h-[48vh] min-[480px]:h-[55vh] sm:h-[68vh] md:h-[72vh] lg:h-[76vh]">
          {/* LUSAN watermark — hidden on smallest mobile, dynamically sized to fit */}
          <div
            ref={waterRef}
            className="pointer-events-none absolute inset-0 hidden min-[480px]:flex items-center justify-center select-none overflow-hidden"
            aria-hidden
          >
            <span
              ref={waterTextRef}
              className="font-sans font-black tracking-[-0.06em] leading-none fade-in whitespace-nowrap"
              style={{
                fontSize: `${waterSize}px`,
                color: "rgba(0, 96, 100, 0.32)",
                textShadow: "0 0 30px rgba(0, 96, 100, 0.10)",
              }}
            >
              LUSAN
            </span>
          </div>

          {/* Character */}
          <div
            className="relative h-full w-auto aspect-[2/3] max-w-[80vw] sm:max-w-[70vw] will-change-transform char-fade-bottom"
            style={{
              transform: `translate3d(${charX}px, ${charY}px, 0)`,
              transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <Image
              key={mainSrc}
              src={mainSrc}
              alt="3D cartoon portrait of Lusan Sapkota"
              fill
              priority
              sizes="(min-width: 1024px) 50vh, (min-width: 768px) 60vw, 70vw"
              className="object-contain transition-opacity duration-500"
            />
          </div>
        </div>

        {/* Bottom info — column on mobile, row on sm+ */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6 pt-1.5 sm:pt-2 pb-3 sm:pb-4 lg:pb-5 rise-in delay-3">
          {/* Left: name + description + meta */}
          <div className="flex flex-col items-start gap-2 sm:gap-2.5 min-w-0">
            <h2 className="font-sans font-black text-[#1a1a1a] leading-[0.95] tracking-[-0.04em] text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-1">
              <span>Lusan Sapkota</span>
              <span className="text-[#1a1a1a]/40 text-xs sm:text-sm md:text-base font-mono font-medium tracking-[0.2em]">
                /ˈluːsæn ˈsɑːpkɔtɑː/
              </span>
            </h2>
            <p className="max-w-md text-xs sm:text-sm md:text-base leading-snug text-[#1a1a1a]/75">
              Full-stack developer with 4+ years of experience building scalable web, mobile, and backend systems, delivering end-to-end solutions from architecture to deployment.
            </p>

            {/* Meta row — wraps cleanly on small screens */}
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#1a1a1a]/75">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006064]" />
                Available for work
              </span>
              <span className="hidden sm:inline text-[#1a1a1a]/30">·</span>
              <span>Nepal</span>
              <span className="hidden md:inline text-[#1a1a1a]/30">·</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#006064] transition">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#006064] transition">LinkedIn</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#006064] transition">X</a>
            </div>
          </div>

          {/* Right: Meet the Character — clickable, swaps main image */}
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 rise-in delay-4">
            <button
              type="button"
              onClick={() => setShowFront((v) => !v)}
              aria-label={`Switch to ${thumbLabel.toLowerCase()} angle`}
              className="group inline-flex items-center gap-3 sm:gap-4"
            >
              <div className="text-right leading-tight hidden min-[480px]:block">
                <div className="text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.22em] text-[#1a1a1a]/70">
                  {thumbKicker}
                </div>
                <div className="text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.22em] text-[#1a1a1a] font-semibold">
                  Character · {thumbLabel}
                </div>
              </div>
              <div className="relative w-14 h-16 sm:w-16 sm:h-18 md:w-20 md:h-22 rounded-xl sm:rounded-2xl overflow-hidden ring-2 ring-[#1a1a1a]/15 shadow-md bg-[#ffd700] shrink-0 group-hover:scale-105 group-hover:ring-[#006064] transition-all">
                <Image
                  src={thumbSrc}
                  alt="Switch portrait angle"
                  fill
                  sizes="(min-width: 768px) 80px, 64px"
                  className="object-cover"
                />
                {/* swap hint */}
                <span className="absolute inset-0 grid place-items-center bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/40 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden
                  >
                    <path
                      d="M7.5 7.5L4 11l3.5 3.5M4 11h12a4 4 0 010 8h-1M16.5 16.5L20 13l-3.5-3.5M20 13H8a4 4 0 010-8h1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </button>

            {/* Below thumb — angle counter (hidden on mobile to save space) */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#1a1a1a]/60">
              <span className={showFront ? "text-[#1a1a1a]/30" : "text-[#1a1a1a]"}>·</span>
              <span className={showFront ? "text-[#1a1a1a]/40" : "font-semibold"}>01 Side</span>
              <span className="text-[#1a1a1a]/30">/</span>
              <span className={showFront ? "font-semibold" : "text-[#1a1a1a]/40"}>02 Front</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

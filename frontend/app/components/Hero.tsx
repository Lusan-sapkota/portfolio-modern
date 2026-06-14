"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { swipeChild, swipeGroup, swipeSection } from "../lib/motion";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const waterTextRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showFront, setShowFront] = useState(false);
  const [waterSize, setWaterSize] = useState<number>(320);

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

  useEffect(() => {
    const container = waterRef.current;
    const text = waterTextRef.current;
    if (!container || !text) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth === 0) return;

      const testSize = 100;
      const prev = text.style.fontSize;
      text.style.fontSize = `${testSize}px`;
      const measured = text.scrollWidth;
      text.style.fontSize = prev;

      if (measured === 0) return;

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

  return (
    <motion.section
      id="top"
      ref={ref}
      variants={swipeSection}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="relative w-full min-h-[100svh] sm:h-screen overflow-hidden isolate bg-[#ffd700] flex flex-col"
      aria-label="Hero — Lusan Sapkota"
    >
      <div className="hero-glow absolute inset-0 -z-10" aria-hidden />
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden />

      <motion.div
        variants={swipeGroup}
        className="relative flex-1 min-h-0 px-4 sm:px-8 lg:px-14 pt-16 sm:pt-20 flex flex-col"
      >
        <motion.div
          variants={swipeChild}
          className="relative min-h-0 flex items-end justify-center h-[48vh] min-[480px]:h-[55vh] sm:h-[68vh] md:h-[72vh] lg:h-[76vh]"
        >
          <div
            ref={waterRef}
            className="pointer-events-none absolute inset-0 hidden min-[480px]:flex items-center justify-center select-none overflow-hidden"
            aria-hidden
          >
            <span
              ref={waterTextRef}
              className="font-sans font-black tracking-[-0.06em] leading-none whitespace-nowrap"
              style={{
                fontSize: `${waterSize}px`,
                color: "rgba(0, 96, 100, 0.32)",
                textShadow: "0 0 30px rgba(0, 96, 100, 0.10)",
              }}
            >
              LUSAN
            </span>
          </div>

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
        </motion.div>

        <motion.div
          variants={swipeChild}
          className="relative z-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6 pt-1.5 sm:pt-2 pb-3 sm:pb-4 lg:pb-5"
        >
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

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
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

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#1a1a1a]/60">
              <span className={showFront ? "text-[#1a1a1a]/30" : "text-[#1a1a1a]"}>·</span>
              <span className={showFront ? "text-[#1a1a1a]/40" : "font-semibold"}>01 Side</span>
              <span className="text-[#1a1a1a]/30">/</span>
              <span className={showFront ? "font-semibold" : "text-[#1a1a1a]/40"}>02 Front</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

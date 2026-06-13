"use client";

import { BookPage } from "./BookPage";

/**
 * About — full-viewport section introducing Lusan
 * Two-column layout: bio on the left, quick-facts grid on the right.
 */
export function About({ index, total }: { index: number; total: number }) {
  return (
    <BookPage
      id="about"
      bg="#b07d5b"
      textColor="#1a1a1a"
      page="01 — About"
      label="About — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex items-center justify-center px-6 sm:px-12 lg:px-20 py-20 sm:py-24">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div className="flex flex-col gap-5">
            <div>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#1a1a1a]/70">
                01 — About
              </span>
              <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl leading-[0.95] tracking-[-0.04em] mt-2">
                About me
              </h2>
            </div>

            <h3 className="font-sans text-lg sm:text-xl lg:text-2xl font-semibold text-[#1a1a1a]/90 leading-tight">
              Full Stack Developer · 4+ Years Building Production Systems
            </h3>

            <div className="flex flex-col gap-3 text-sm sm:text-base leading-relaxed text-[#1a1a1a]/80">
              <p>
                I design and ship software that works at scale. With 4+ years of hands-on experience across backend architecture, frontend systems, and cross-platform mobile development, I focus on building reliable, maintainable solutions that solve real problems.
              </p>
              <p>
                Through Icepeak Tech, I deliver end-to-end development services: REST APIs, database design, VPS deployments, CI/CD pipelines, and React/React Native applications. I also work with AI/ML integrations, particularly graph-based models and algorithmic systems.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-1 text-xs sm:text-sm font-mono">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#1a1a1a]/75">
                <span>
                  <span className="text-[#1a1a1a] font-semibold">Phone</span> · Available upon request
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[#1a1a1a] font-semibold">Email</span>
                <a href="mailto:sapkotalusan@gmail.com" className="text-[#1a1a1a]/80 hover:text-[#1a1a1a] underline-offset-4 hover:underline transition">
                  sapkotalusan@gmail.com
                </a>
                <span className="text-[#1a1a1a]/30">/</span>
                <a href="mailto:contact@lusansapkota.com.np" className="text-[#1a1a1a]/80 hover:text-[#1a1a1a] underline-offset-4 hover:underline transition">
                  contact@lusansapkota.com.np
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <SocialLink href="https://github.com/Lusan-sapkota" label="GitHub" />
                <SocialLink href="https://x.com/LusanSapkota" label="X" />
                <SocialLink href="https://www.linkedin.com/in/lusan-sapkota-aa087b39b" label="LinkedIn" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <FactCard value="4+" label="Years of experience" />
            <FactCard value="30+" label="Projects shipped" />
            <FactCard value="20+" label="Technologies" />
            <FactCard value="100%" label="Production-ready" />
          </div>
        </div>
      </div>
    </BookPage>
  );
}

function FactCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="group relative flex flex-col gap-1 p-4 sm:p-5 rounded-2xl bg-[#1a1a1a]/[0.08] border border-[#1a1a1a]/15 hover:border-[#1a1a1a]/45 hover:bg-[#1a1a1a]/[0.12] transition">
      <span className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-[-0.04em] text-[#1a1a1a]">
        {value}
      </span>
      <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.16em] text-[#1a1a1a]/65">
        {label}
      </span>
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] text-[#1a1a1a]/85 border border-[#1a1a1a]/25 hover:bg-[#1a1a1a] hover:text-[#fff8e1] hover:border-[#1a1a1a] transition"
    >
      {label}
    </a>
  );
}

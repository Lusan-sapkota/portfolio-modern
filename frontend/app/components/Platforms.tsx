"use client";

import { BookPage } from "./BookPage";

/**
 * Platforms — where to find Lusan online.
 */
export function Platforms({ index, total }: { index: number; total: number }) {
  const platforms = [
    { name: "GitHub", handle: "Lusan-sapkota", href: "https://github.com/Lusan-sapkota" },
    { name: "LinkedIn", handle: "Lusan Sapkota", href: "https://www.linkedin.com/in/lusan-sapkota-aa087b39b" },
    { name: "X", handle: "@LusanSapkota", href: "https://x.com/LusanSapkota" },
    { name: "Portfolio", handle: "lusansapkota.com.np", href: "https://lusansapkota.com.np" },
    { name: "Lcore", handle: "lcore.lusansapkota.com.np", href: "https://lcore.lusansapkota.com.np" },
    { name: "Email", handle: "sapkotalusan@gmail.com", href: "mailto:sapkotalusan@gmail.com" },
  ];

  return (
    <BookPage
      id="platforms"
      bg="#d84315"
      textColor="#fff8e1"
      page="08 — Platforms"
      label="Platforms — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/75">
              08 — Platforms
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            Find me around the web.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target={p.href.startsWith("http") ? "_blank" : undefined}
                rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex flex-col gap-2 p-5 rounded-2xl border border-[#fff8e1]/25 bg-[#fff8e1]/[0.05] hover:bg-[#fff8e1]/[0.12] hover:border-[#fff8e1]/50 transition"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#fff8e1]/65">
                  {p.name}
                </span>
                <span className="font-sans font-semibold text-lg sm:text-xl break-all">
                  {p.handle}
                </span>
                <span className="mt-1 font-mono text-xs text-[#fff8e1]/60 group-hover:translate-x-1 transition-transform">
                  Visit &rarr;
                </span>
              </a>
            ))}
          </div>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.28em] text-[#fff8e1]/60">
            &copy; {new Date().getFullYear()} Lusan Sapkota &middot; End of book
          </p>
        </div>
      </div>
    </BookPage>
  );
}

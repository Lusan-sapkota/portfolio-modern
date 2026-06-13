"use client";

import { BookPage } from "./BookPage";

export function Contact({
  index,
  total,
  id,
  bg,
  textColor,
}: {
  index: number;
  total: number;
  id: string;
  bg: string;
  textColor: string;
}) {
  const channels = [
    {
      label: "Email",
      primary: "sapkotalusan@gmail.com",
      href: "mailto:sapkotalusan@gmail.com",
    },
    {
      label: "Email",
      primary: "contact@lusansapkota.com.np",
      href: "mailto:contact@lusansapkota.com.np",
    },
    {
      label: "GitHub",
      primary: "Lusan-sapkota",
      href: "https://github.com/Lusan-sapkota",
    },
    {
      label: "LinkedIn",
      primary: "Lusan Sapkota",
      href: "https://www.linkedin.com/in/lusan-sapkota-aa087b39b",
    },
  ];

  return (
    <BookPage
      id={id}
      bg={bg}
      textColor={textColor}
      page="07 — Contact"
      label="Contact — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#3e2723]/70">
              07 — Contact
            </span>
            <span className="h-px flex-1 bg-[#3e2723]/25" />
          </div>

          <h2 className="font-sans font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.92] tracking-[-0.045em] mb-4">
            Let&rsquo;s build<br />something real.
          </h2>
          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[#3e2723]/75 mb-10">
            Open to full-time roles, contract work and interesting collaborations. The fastest way in is email.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {channels.map((c) => (
              <a
                key={c.primary}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-[#3e2723]/20 bg-white/40 hover:bg-white/70 hover:border-[#3e2723]/45 transition"
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#3e2723]/60">
                    {c.label}
                  </div>
                  <div className="mt-1 font-sans font-semibold text-base sm:text-lg break-all">
                    {c.primary}
                  </div>
                </div>
                <span className="font-mono text-xl text-[#3e2723]/50 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </BookPage>
  );
}

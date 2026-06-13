"use client";

import { BookPage } from "./BookPage";

/**
 * Testimonials — quotes from collaborators and clients.
 */
export function Testimonials({ index, total }: { index: number; total: number }) {
  const quotes = [
    {
      quote:
        "Lusan ships. Rare combination of clean architecture, strong product sense and a knack for making hard things look easy.",
      name: "Product Lead",
      role: "Icepeak Tech · Client",
    },
    {
      quote:
        "Owns the full stack end to end. From the database schema to the last CSS polish, everything just works.",
      name: "Engineering Manager",
      role: "Mobile Platform · Partner",
    },
    {
      quote:
        "Calm, fast and reliable. The kind of engineer you want in the room when the timeline is tight.",
      name: "Founder",
      role: "SaaS Startup · Client",
    },
  ];

  return (
    <BookPage
      id="testimonials"
      bg="#b71c1c"
      textColor="#fff8e1"
      page="05 — Testimonials"
      label="Testimonials — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/70">
              05 — Testimonials
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            Words from the room.
          </h2>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
            {quotes.map((q) => (
              <figure
                key={q.name}
                className="flex flex-col gap-5 p-6 rounded-2xl border border-[#fff8e1]/20 bg-[#fff8e1]/[0.05]"
              >
                <span className="font-sans text-5xl leading-none text-[#fff8e1]/30">
                  &ldquo;
                </span>
                <blockquote className="text-base sm:text-[1.05rem] leading-relaxed text-[#fff8e1]/90">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-auto pt-3 border-t border-[#fff8e1]/20">
                  <div className="font-sans font-semibold text-sm">{q.name}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#fff8e1]/65">
                    {q.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </BookPage>
  );
}

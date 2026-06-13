"use client";

import { BookPage } from "./BookPage";

export function Education({
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
  const items = [
    {
      year: "2024",
      title: "AWS Cloud Practitioner",
      org: "Amazon Web Services",
      kind: "Certification",
    },
    {
      year: "2019 — 2023",
      title: "B.Sc. Computer Science",
      org: "Tribhuvan University",
      kind: "Degree",
    },
    {
      year: "Ongoing",
      title: "Systems & Distributed Computing",
      org: "Self-directed study",
      kind: "Learning",
    },
  ];

  return (
    <BookPage
      id={id}
      bg={bg}
      textColor={textColor}
      page="06 — Education"
      label="Education — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/70">
              06 — Education
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            Formative years.
          </h2>

          <ul className="flex flex-col">
            {items.map((it) => (
              <li
                key={it.title}
                className="grid sm:grid-cols-[140px_120px_1fr] gap-2 sm:gap-8 py-6 border-t border-[#fff8e1]/20 last:border-b"
              >
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#fff8e1]/70 pt-1">
                  {it.year}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#fff8e1]/60 pt-1">
                  {it.kind}
                </span>
                <div>
                  <h3 className="font-sans font-bold text-lg sm:text-xl">{it.title}</h3>
                  <p className="mt-1 text-sm text-[#fff8e1]/75">{it.org}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BookPage>
  );
}

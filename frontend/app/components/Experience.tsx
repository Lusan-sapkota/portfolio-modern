"use client";

import { BookPage } from "./BookPage";

/**
 * Experience — roles, companies and a timeline of impact.
 */
export function Experience({ index, total }: { index: number; total: number }) {
  const roles = [
    {
      year: "2023 — Present",
      company: "Icepeak Tech",
      title: "Founder · Full-Stack Engineer",
      blurb:
        "Delivering end-to-end web, mobile and backend systems for clients. Owns architecture, CI/CD and infra.",
    },
    {
      year: "2022 — 2023",
      company: "Freelance",
      title: "Full-Stack Developer",
      blurb:
        "Shipped production REST APIs, React dashboards and React Native apps for small teams across the region.",
    },
    {
      year: "2021 — 2022",
      company: "Open Source",
      title: "Contributor · Maintainer",
      blurb:
        "Built graph-based tooling and AI integrations, contributed to community libraries in the JS and Python ecosystems.",
    },
  ];

  return (
    <BookPage
      id="experience"
      bg="#006064"
      textColor="#fff8e1"
      page="02 — Experience"
      label="Experience — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/70">
              02 — Experience
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            Where the work<br />has lived.
          </h2>

          <ul className="flex flex-col gap-5 sm:gap-6">
            {roles.map((role) => (
              <li
                key={role.company}
                className="grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-8 py-5 border-t border-[#fff8e1]/20"
              >
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#fff8e1]/70 pt-1">
                  {role.year}
                </span>
                <div>
                  <h3 className="font-sans font-bold text-lg sm:text-xl">
                    {role.title} · {role.company}
                  </h3>
                  <p className="mt-1.5 text-sm sm:text-[0.95rem] leading-relaxed text-[#fff8e1]/80 max-w-2xl">
                    {role.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BookPage>
  );
}

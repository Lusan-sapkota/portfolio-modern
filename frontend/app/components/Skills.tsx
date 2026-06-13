"use client";

import { BookPage } from "./BookPage";

export function Skills({
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
  const groups = [
    {
      title: "Frontend",
      items: ["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion"],
    },
    {
      title: "Backend",
      items: ["Node.js", "Python", "Postgres", "Redis", "REST · tRPC"],
    },
    {
      title: "Mobile",
      items: ["React Native", "Expo", "Native Modules", "Offline Sync"],
    },
    {
      title: "DevOps & AI",
      items: ["Docker", "CI/CD", "VPS · Linux", "Graph Models", "LLM APIs"],
    },
  ];

  return (
    <BookPage
      id={id}
      bg={bg}
      textColor={textColor}
      page="04 — Skills"
      label="Skills — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/70">
              04 — Skills
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            The stack I reach for.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {groups.map((g) => (
              <div
                key={g.title}
                className="flex flex-col gap-3 p-5 rounded-2xl border border-[#fff8e1]/20 bg-[#fff8e1]/[0.05]"
              >
                <h3 className="font-sans font-bold text-lg tracking-[-0.01em]">
                  {g.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#fff8e1]/85"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fff8e1]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BookPage>
  );
}

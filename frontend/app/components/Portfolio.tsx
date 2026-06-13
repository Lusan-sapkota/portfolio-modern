"use client";

import { BookPage } from "./BookPage";

/**
 * Portfolio — selected projects across web, mobile and AI.
 */
export function Portfolio({ index, total }: { index: number; total: number }) {
  const projects = [
    {
      tag: "Web · SaaS",
      title: "Icepeak Dashboard",
      blurb: "Multi-tenant admin panel with realtime metrics, RBAC and audit logs.",
      stack: "Next.js · Postgres · tRPC",
    },
    {
      tag: "Mobile · RN",
      title: "Field Reports",
      blurb: "Offline-first React Native app for field teams to capture and sync reports.",
      stack: "React Native · SQLite · Sync",
    },
    {
      tag: "AI · Graphs",
      title: "Graph Reasoning Kit",
      blurb: "Python toolkit for graph-based reasoning models and algorithmic search.",
      stack: "Python · NetworkX · FastAPI",
    },
    {
      tag: "Backend · API",
      title: "Lcore",
      blurb: "Personal backend portfolio serving as a headless content + auth layer.",
      stack: "lcore · REST · VPS",
    },
  ];

  return (
    <BookPage
      id="portfolio"
      bg="#004d40"
      textColor="#fff8e1"
      page="03 — Portfolio"
      label="Portfolio — Lusan Sapkota"
      index={index}
      total={total}
    >
      <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#fff8e1]/70">
              03 — Portfolio
            </span>
            <span className="h-px flex-1 bg-[#fff8e1]/25" />
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] mb-10">
            Selected work.
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {projects.map((p) => (
              <article
                key={p.title}
                className="group relative flex flex-col gap-3 p-5 sm:p-6 rounded-2xl border border-[#fff8e1]/15 bg-[#fff8e1]/[0.04] hover:bg-[#fff8e1]/[0.08] hover:border-[#fff8e1]/40 transition"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#fff8e1]/60">
                  {p.tag}
                </span>
                <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-[-0.02em]">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#fff8e1]/80">{p.blurb}</p>
                <span className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#fff8e1]/55">
                  {p.stack}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </BookPage>
  );
}

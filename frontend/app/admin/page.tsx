"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type DashboardStats } from "@/app/lib/admin-api";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const BORDER = "rgba(26, 26, 26, 0.15)";

type Stat = { label: string; value: number | string; tone?: "ink" | "paper" | "sienna" };

const ZERO_STATS: DashboardStats = {
  projects: 0,
  categories: 0,
  skills: 0,
  experiences: 0,
  education: 0,
  testimonials: 0,
  social_links: 0,
  contacts: 0,
  newsletter_active: 0,
  wiki_articles: 0,
  wiki_categories: 0,
  donation_projects: 0,
  donations: 0,
  total_donations_usd: 0,
  total_donations_npr: 0,
};

const REQUEST_TIMEOUT_MS = 10_000;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setLoading(true);
    setError("");
    try {
      const data = (await api.get("/api/dashboard/", { signal: controller.signal })) as DashboardStats;
      if (controller.signal.aborted) return;
      setStats({ ...ZERO_STATS, ...data });
      setUpdatedAt(new Date());
    } catch (e) {
      if (controller.signal.aborted) return;
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.toLowerCase().includes("aborted")) return;
      setError(msg);
    } finally {
      window.clearTimeout(timeoutId);
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-md">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.4em] mb-3"
            style={{ color: SIENNA }}
          >
            Error
          </p>
          <p className="text-2xl font-black tracking-[-0.02em] mb-2" style={{ color: INK }}>
            {error}
          </p>
          <p className="text-xs font-mono mt-3 mb-6" style={{ color: "#6b5b54" }}>
            Make sure the backend is running on port 8080
          </p>
          <button
            onClick={load}
            className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-6 rounded-full cursor-pointer transition-transform hover:-translate-y-0.5"
            style={{ background: INK, color: PAPER, boxShadow: `3px 3px 0 ${SIENNA}` }}
          >
            Retry &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return <EmptyState onRefresh={load} />;
  }

  const contentStats: Stat[] = [
    { label: "Projects", value: stats.projects, tone: "sienna" },
    { label: "Categories", value: stats.categories },
    { label: "Skills", value: stats.skills },
    { label: "Experience", value: stats.experiences },
    { label: "Education", value: stats.education },
    { label: "Testimonials", value: stats.testimonials },
    { label: "Social Links", value: stats.social_links },
    { label: "Contacts", value: stats.contacts },
    { label: "Newsletter", value: stats.newsletter_active },
  ];

  const wikiStats: Stat[] = [
    { label: "Articles", value: stats.wiki_articles },
    { label: "Categories", value: stats.wiki_categories },
  ];

  const donationStats: Stat[] = [
    { label: "Projects", value: stats.donation_projects },
    { label: "Donations", value: stats.donations },
  ];

  const totalDonations = [
    { label: "Total USD", value: `$${stats.total_donations_usd.toFixed(2)}` },
    { label: "Total NPR", value: `Rs.${stats.total_donations_npr.toFixed(2)}` },
  ];

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8" style={{ borderBottom: `2px solid ${INK}` }}>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-block w-8 h-8 rounded-full"
              style={{ background: SIENNA }}
            />
            <p
              className="font-mono text-[10px] uppercase tracking-[0.4em]"
              style={{ color: SIENNA }}
            >
              Overview
            </p>
          </div>
          <h1
            className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]"
            style={{ color: INK }}
          >
            Dashboard
          </h1>
        </div>
        <div className="lg:text-right">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2"
            style={{ color: "#6b5b54" }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-sm font-medium" style={{ color: INK }}>
            Content statistics at a glance
          </p>
        </div>
      </header>

      <Section label="01" title="Content" count={contentStats.length}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contentStats.map((s) => (
            <StatCard key={s.label} stat={s} size="lg" />
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-10">
        <Group label="02" title="Wiki">
          <div className="grid grid-cols-2 gap-3">
            {wikiStats.map((s) => (
              <StatCard key={s.label} stat={s} size="md" />
            ))}
          </div>
        </Group>

        <Group label="03" title="Donations">
          <div className="grid grid-cols-2 gap-3">
            {donationStats.map((s) => (
              <StatCard key={s.label} stat={s} size="md" />
            ))}
          </div>
        </Group>
      </div>

      <Section label="04" title="Totals">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {totalDonations.map((t, i) => (
            <div
              key={t.label}
              className="rounded-2xl p-6 lg:p-8 flex flex-col gap-3 transition-transform hover:-translate-y-1"
              style={{
                background: i === 0 ? INK : PAPER,
                color: i === 0 ? PAPER : INK,
                border: `2px solid ${INK}`,
                boxShadow: i === 0 ? `6px 6px 0 ${SIENNA}` : `6px 6px 0 ${INK}`,
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: i === 0 ? SIENNA : "#6b5b54" }}
                >
                  {t.label}
                </p>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: i === 0 ? SIENNA : SIENNA }}
                >
                  Live
                </span>
              </div>
              <p
                className="text-5xl lg:text-6xl font-black tabular-nums tracking-[-0.04em]"
                style={{ color: i === 0 ? PAPER : INK }}
              >
                {t.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <footer className="mt-12 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "#6b5b54" }}
        >
          Lusan Sapkota &mdash; {new Date().getFullYear()}
          {updatedAt && (
            <span className="ml-3" style={{ color: INK }}>
              Updated {updatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          )}
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70 disabled:opacity-50 cursor-pointer"
          style={{ color: SIENNA }}
        >
          {loading ? "Refreshing..." : "Refresh \u2192"}
        </button>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header className="mb-10 pb-8" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-block w-8 h-8 rounded-full"
            style={{ background: SIENNA, animation: "pulse 1.4s ease-in-out infinite" }}
          />
          <div className="h-3 w-24 rounded" style={{ background: "rgba(26,26,26,0.1)", animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
        <div className="h-14 w-72 rounded" style={{ background: "rgba(26,26,26,0.1)", animation: "pulse 1.4s ease-in-out infinite" }} />
      </header>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-3 w-8 rounded" style={{ background: "rgba(26,26,26,0.1)", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div className="h-6 w-32 rounded" style={{ background: "rgba(26,26,26,0.15)", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div className="flex-1 h-[2px]" style={{ background: INK }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 lg:p-6 h-28"
              style={{ background: PAPER, border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
            >
              <div className="h-3 w-20 rounded mb-3" style={{ background: "rgba(26,26,26,0.1)", animation: "pulse 1.4s ease-in-out infinite" }} />
              <div className="h-10 w-24 rounded" style={{ background: "rgba(26,26,26,0.15)", animation: "pulse 1.4s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.4em] mb-3"
          style={{ color: SIENNA }}
        >
          No Data
        </p>
        <h2
          className="font-black text-3xl tracking-[-0.03em] leading-tight mb-3"
          style={{ color: INK }}
        >
          Nothing to show yet
        </h2>
        <p className="text-sm mb-6" style={{ color: "#6b5b54" }}>
          The dashboard came back empty. Add some content from the corresponding sections to see stats here.
        </p>
        <button
          onClick={onRefresh}
          className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-6 rounded-full cursor-pointer transition-transform hover:-translate-y-0.5"
          style={{ background: INK, color: PAPER, boxShadow: `3px 3px 0 ${SIENNA}` }}
        >
          Refresh \u2192
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  title,
  count,
  children,
}: {
  label: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: SIENNA }}
        >
          {label}
        </span>
        <h2
          className="font-black text-xl tracking-[-0.02em]"
          style={{ color: INK }}
        >
          {title}
        </h2>
        {count !== undefined && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
            style={{ background: INK, color: PAPER }}
          >
            {count}
          </span>
        )}
        <div className="flex-1 h-[2px]" style={{ background: INK }} />
      </div>
      {children}
    </section>
  );
}

function Group({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: PAPER, border: `2px solid ${INK}` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: SIENNA }}
        >
          {label}
        </span>
        <h3
          className="font-black text-lg tracking-[-0.02em]"
          style={{ color: INK }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  stat,
  size = "md",
}: {
  stat: Stat;
  size?: "md" | "lg";
}) {
  const isSienna = stat.tone === "sienna";
  const isInk = stat.tone === "ink";

  const bg = isSienna ? SIENNA : isInk ? INK : PAPER;
  const fg = isSienna || isInk ? PAPER : INK;
  const labelColor = isSienna ? "rgba(255, 253, 245, 0.85)" : isInk ? SIENNA : "#6b5b54";
  const border = `2px solid ${INK}`;
  const shadow = isSienna
    ? `4px 4px 0 ${INK}`
    : isInk
    ? `4px 4px 0 ${SIENNA}`
    : `4px 4px 0 ${INK}`;

  return (
    <div
      className={`rounded-2xl flex flex-col gap-2 transition-transform hover:-translate-y-0.5 ${
        size === "lg" ? "p-5 lg:p-6" : "p-4"
      }`}
      style={{
        background: bg,
        color: fg,
        border,
        boxShadow: shadow,
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] font-semibold"
        style={{ color: labelColor }}
      >
        {stat.label}
      </p>
      <p
        className={`font-black tabular-nums tracking-[-0.04em] leading-none ${
          size === "lg" ? "text-4xl lg:text-5xl" : "text-3xl lg:text-4xl"
        }`}
        style={{ color: fg }}
      >
        {stat.value}
      </p>
    </div>
  );
}

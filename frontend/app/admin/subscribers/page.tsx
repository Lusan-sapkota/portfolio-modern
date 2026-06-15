"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/admin-api";

const ADMIN_ROUTE =
  process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const INK_SOFT = "#6b5b54";
const BORDER = `2px solid ${INK}`;

type Subscriber = {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  interests: Record<string, unknown> | null;
  subscribed_at: string | null;
  last_email_sent: string | null;
};

type Stats = {
  total: number;
  active: number;
  inactive: number;
  interests: { tag: string; count: number }[];
};

type ListResponse = { subscribers: Subscriber[]; count: number };

const selectClass =
  "w-full bg-transparent border-0 border-b-2 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer appearance-none";

const selectStyle: React.CSSProperties = {
  borderColor: INK,
  color: INK,
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231a1a1a' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.25rem center",
  paddingRight: "1.5rem",
};

export default function SubscribersPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ search: "", active: "" });
  const [applied, setApplied] = useState({ search: "", active: "" });
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function buildQuery() {
    const p = new URLSearchParams();
    if (applied.search) p.set("search", applied.search);
    if (applied.active === "1") p.set("active", "1");
    if (applied.active === "0") p.set("active", "0");
    return p.toString();
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery();
      const suffix = qs ? `?${qs}` : "";
      const [list, s] = await Promise.all([
        api.get(`/api/community/newsletter${suffix}`) as Promise<ListResponse>,
        api.get("/api/community/newsletter/stats") as Promise<Stats>,
      ]);
      setData(list);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]);

  function apply() {
    setApplied({ ...filter });
  }

  function clear() {
    const empty = { search: "", active: "" };
    setFilter(empty);
    setApplied(empty);
  }

  async function toggleActive(sub: Subscriber) {
    setTogglingId(sub.id);
    try {
      await api.put(`/api/community/newsletter/${sub.id}`, {
        is_active: !sub.is_active,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteOne(sub: Subscriber) {
    if (!window.confirm(`Delete ${sub.email}? This cannot be undone.`)) return;
    setDeletingId(sub.id);
    try {
      await api.delete(`/api/community/newsletter/${sub.id}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function exportCsv() {
    const qs = buildQuery();
    const url = `/api/community/newsletter${qs ? `?${qs}&` : "?"}format=csv`;
    const res = await api.get(url).catch(() => null);
    if (!res) return;
    const blob = new Blob([JSON.stringify(res, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subscribers-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header
        className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8"
        style={{ borderBottom: BORDER }}
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-8 h-8 rounded-full" style={{ background: SIENNA }} />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: SIENNA }}>
              Newsletter
            </p>
          </div>
          <h1 className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]" style={{ color: INK }}>
            Subscribers
          </h1>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex gap-2">
            <Link
              href={`${ADMIN_ROUTE}/newsletter/send`}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ background: SIENNA, color: PAPER, boxShadow: `3px 3px 0 ${INK}` }}
            >
              <MailIcon />
              <span>Send Newsletter</span>
            </Link>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full transition-transform hover:-translate-y-0.5 cursor-pointer"
              style={{ background: INK, color: PAPER, boxShadow: `3px 3px 0 ${SIENNA}` }}
            >
              <DownloadIcon />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatTile label="Total" value={stats?.total ?? "—"} tone="paper" />
        <StatTile label="Active" value={stats?.active ?? "—"} tone="sienna" />
        <StatTile label="Inactive" value={stats?.inactive ?? "—"} tone="ink" />
        <StatTile
          label="Top Tag"
          value={stats?.interests[0]?.tag ?? "—"}
          tone="paper"
        />
      </div>

      {stats && stats.interests.length > 0 && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
              style={{ background: SIENNA, color: PAPER }}
            >
              Interests
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
              {stats.interests.length} tag{stats.interests.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.interests.map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full"
                style={{ background: INK, color: PAPER }}
              >
                <span>{t.tag}</span>
                <span style={{ color: SIENNA }}>·</span>
                <span style={{ color: SIENNA }}>{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
            style={{ background: SIENNA, color: PAPER }}
          >
            Filter
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
            Narrow the list
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Field label="Search">
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="email or name"
              className={selectClass}
              style={selectStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
              }}
            />
          </Field>
          <Field label="Status">
            <select
              value={filter.active}
              onChange={(e) => setFilter({ ...filter, active: e.target.value })}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">All</option>
              <option value="1">Active only</option>
              <option value="0">Inactive only</option>
            </select>
          </Field>
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={apply}
              className="flex-1 font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-4 rounded-full cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: INK, color: PAPER }}
            >
              Apply
            </button>
            <button
              onClick={clear}
              className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-4 rounded-full cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: PAPER, color: INK, border: BORDER }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="text-xs font-mono py-2 px-3 border-l-2 mb-4"
          style={{ color: SIENNA, borderColor: SIENNA, background: "rgba(216, 67, 21, 0.08)" }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: INK, color: PAPER }}>
                <Th>Email</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Interests</Th>
                <Th>Subscribed</Th>
                <Th>Last Sent</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    Loading subscribers...
                  </td>
                </tr>
              )}
              {data?.subscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    No subscribers match these filters.
                  </td>
                </tr>
              )}
              {data?.subscribers.map((sub) => (
                <Row
                  key={sub.id}
                  sub={sub}
                  onToggle={() => toggleActive(sub)}
                  onDelete={() => deleteOne(sub)}
                  busy={togglingId === sub.id || deletingId === sub.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({
  sub,
  onToggle,
  onDelete,
  busy,
}: {
  sub: Subscriber;
  onToggle: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const tags = extractTags(sub.interests);
  return (
    <tr style={{ borderTop: `1px solid rgba(26,26,26,0.08)` }} className="hover:bg-[rgba(216,67,21,0.04)]">
      <td className="px-4 py-3 font-mono text-xs" style={{ color: INK }}>
        {sub.email}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: INK }}>
        {sub.name || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded"
          style={{ background: sub.is_active ? SIENNA : "#6b5b54", color: PAPER }}
        >
          {sub.is_active ? "active" : "inactive"}
        </span>
      </td>
      <td className="px-4 py-3">
        {tags.length === 0 ? (
          <span className="font-mono text-xs" style={{ color: INK_SOFT }}>—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="font-mono text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
                style={{ background: INK, color: PAPER }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: INK_SOFT }}>
        {formatTime(sub.subscribed_at)}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: INK_SOFT }}>
        {formatTime(sub.last_email_sent)}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            disabled={busy}
            className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
            style={{ background: PAPER, color: INK, border: BORDER }}
          >
            {sub.is_active ? "Disable" : "Enable"}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
            style={{ background: SIENNA, color: PAPER }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function extractTags(interests: Subscriber["interests"]): string[] {
  if (!interests) return [];
  if (Array.isArray(interests)) return interests.map(String);
  if (typeof interests === "object") {
    const tags = (interests as Record<string, unknown>).tags;
    if (Array.isArray(tags)) return tags.map(String);
  }
  return [];
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-3 font-semibold">
      {children}
    </th>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "ink" | "sienna" | "paper";
}) {
  const bg = tone === "sienna" ? SIENNA : tone === "ink" ? INK : PAPER;
  const fg = tone === "paper" ? INK : PAPER;
  const labelColor =
    tone === "sienna" ? "rgba(255,253,245,0.85)" : tone === "ink" ? SIENNA : INK_SOFT;
  const border = BORDER;
  const shadow =
    tone === "sienna" ? `4px 4px 0 ${INK}` : tone === "ink" ? `4px 4px 0 ${SIENNA}` : `4px 4px 0 ${INK}`;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: bg, color: fg, border, boxShadow: shadow }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: labelColor }}>
        {label}
      </p>
      <p className="text-2xl lg:text-3xl font-black tabular-nums tracking-[-0.04em] leading-none truncate" style={{ color: fg }}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: INK }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function MailIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

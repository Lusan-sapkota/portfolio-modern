"use client";

import { useEffect, useState } from "react";
import {
  api,
  getToken,
  type SecurityLog,
  type SecurityLogResponse,
  type SecurityLogStats,
} from "@/app/lib/admin-api";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const INK_SOFT = "#6b5b54";
const BORDER = `2px solid ${INK}`;

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const STATUS_TONES: Record<string, { bg: string; fg: string }> = {
  success: { bg: "#1a1a1a", fg: PAPER },
  rejected: { bg: SIENNA, fg: PAPER },
  invalid: { bg: SIENNA, fg: PAPER },
  invalid_current: { bg: SIENNA, fg: PAPER },
  rate_limited: { bg: SIENNA, fg: PAPER },
  conflict: { bg: SIENNA, fg: PAPER },
  otp_send_failed: { bg: SIENNA, fg: PAPER },
  requested: { bg: "#6b5b54", fg: PAPER },
};

type Filter = { action: string; status: string; username: string };

export default function SecurityPage() {
  const [data, setData] = useState<SecurityLogResponse | null>(null);
  const [stats, setStats] = useState<SecurityLogStats | null>(null);
  const [filter, setFilter] = useState<Filter>({ action: "", status: "", username: "" });
  const [applied, setApplied] = useState<Filter>({ action: "", status: "", username: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function buildQuery(f: Filter) {
    const params = new URLSearchParams();
    if (f.action) params.set("action", f.action);
    if (f.status) params.set("status", f.status);
    if (f.username) params.set("username", f.username);
    return params.toString();
  }

  async function load(f: Filter) {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery(f);
      const suffix = qs ? `/?${qs}` : "/";
      const [list, s] = await Promise.all([
        api.get(`/api/security-logs${suffix}`) as Promise<SecurityLogResponse>,
        api.get("/api/security-logs/stats") as Promise<SecurityLogStats>,
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
    load(applied);
  }, [applied]);

  function applyFilters() {
    setApplied({ ...filter });
  }

  function clearFilters() {
    const empty = { action: "", status: "", username: "" };
    setFilter(empty);
    setApplied(empty);
  }

  function exportCsv() {
    const qs = buildQuery(applied);
    const url = `${API}${ADMIN_ROUTE}/api/security-logs/export${qs ? `?${qs}` : ""}`;
    fetch(url, { headers: { Authorization: `Bearer ${getToken() ?? ""}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Export failed");
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "security-log.csv";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => setError(e.message));
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
            <p
              className="font-mono text-[10px] uppercase tracking-[0.4em]"
              style={{ color: SIENNA }}
            >
              Audit
            </p>
          </div>
          <h1
            className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]"
            style={{ color: INK }}
          >
            Security Log
          </h1>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <button
            onClick={exportCsv}
            className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full transition-transform hover:-translate-y-0.5 cursor-pointer"
            style={{ background: INK, color: PAPER, boxShadow: `3px 3px 0 ${SIENNA}` }}
          >
            <DownloadIcon />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatTile
          label="Total Events"
          value={stats?.total_events ?? "—"}
          tone="paper"
        />
        <StatTile
          label="Total Logins"
          value={stats?.total_logins ?? "—"}
          tone="sienna"
        />
        <StatTile
          label="Failed Logins"
          value={stats?.failed_logins ?? "—"}
          tone="ink"
        />
        <StatTile
          label="Showing"
          value={`${data?.logs.length ?? 0} / ${data?.total ?? 0}`}
          tone="paper"
        />
      </div>

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
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: INK_SOFT }}
          >
            Narrow the log
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <FilterField label="Action">
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">All actions</option>
              {(data?.actions ?? []).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Status">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">All statuses</option>
              <option value="success">success</option>
              <option value="rejected">rejected</option>
              <option value="invalid">invalid</option>
              <option value="invalid_current">invalid_current</option>
              <option value="rate_limited">rate_limited</option>
              <option value="conflict">conflict</option>
              <option value="otp_send_failed">otp_send_failed</option>
              <option value="requested">requested</option>
            </select>
          </FilterField>
          <FilterField label="Username">
            <input
              type="text"
              value={filter.username}
              onChange={(e) => setFilter({ ...filter, username: e.target.value })}
              placeholder="admin"
              className={selectClass}
              style={selectStyle}
            />
          </FilterField>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-4 rounded-full cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: INK, color: PAPER }}
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
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
                <Th>Time</Th>
                <Th>Action</Th>
                <Th>Status</Th>
                <Th>User</Th>
                <Th>IP</Th>
                <Th>Detail</Th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    Loading log entries...
                  </td>
                </tr>
              )}
              {data?.logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    No log entries match these filters.
                  </td>
                </tr>
              )}
              {data?.logs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogRow({ log }: { log: SecurityLog }) {
  const tone = STATUS_TONES[log.status] ?? { bg: "#6b5b54", fg: PAPER };
  return (
    <tr style={{ borderTop: `1px solid rgba(26,26,26,0.08)` }} className="hover:bg-[rgba(216,67,21,0.04)]">
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: INK }}>
        {formatTime(log.created_at)}
      </td>
      <td className="px-4 py-3 font-mono text-xs uppercase tracking-wider" style={{ color: INK }}>
        {log.action}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {log.status}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: INK }}>
        {log.username ?? "—"}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: INK_SOFT }}>
        {log.ip ?? "—"}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: INK_SOFT }}>
        {log.detail ?? "—"}
      </td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-3 font-semibold"
    >
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
  const shadow = tone === "sienna" ? `4px 4px 0 ${INK}` : tone === "ink" ? `4px 4px 0 ${SIENNA}` : `4px 4px 0 ${INK}`;
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: bg, color: fg, border, boxShadow: shadow }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: labelColor }}>
        {label}
      </p>
      <p className="text-3xl lg:text-4xl font-black tabular-nums tracking-[-0.04em] leading-none" style={{ color: fg }}>
        {value}
      </p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
        style={{ color: INK }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const selectClass =
  "w-full bg-transparent border-0 border-b-2 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer appearance-none";

const selectStyle: React.CSSProperties = {
  borderColor: INK,
  color: INK,
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231a1a1a' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.25rem center",
  paddingRight: "1.5rem",
};

function formatTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
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

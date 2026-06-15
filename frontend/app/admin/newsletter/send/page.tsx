"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/admin-api";
import { INK, PAPER, SIENNA, INK_SOFT, BORDER, Field } from "./_components/ui";
import { TEMPLATES, DEFAULT_TEMPLATE, type Template } from "./_components/templates";
import { TemplatePicker } from "./_components/TemplatePicker";
import { ColorSidebar } from "./_components/ColorSidebar";
import { PreviewPane } from "./_components/PreviewPane";
import { RecipientSelector } from "./_components/RecipientSelector";
import { JobProgress } from "./_components/JobProgress";

const ADMIN_ROUTE =
  process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

type Subscriber = {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  interests: Record<string, unknown> | null;
};

type Stats = {
  total: number;
  active: number;
  inactive: number;
  interests: { tag: string; count: number }[];
};

type ListResponse = { subscribers: Subscriber[]; count: number };
type SendResponse = {
  job_id: string;
  queued: number;
  filter: string;
  started_at: string;
};
type JobStatus = {
  id: string;
  status: "running" | "completed";
  total: number;
  sent: number;
  failed: number;
  started_at: string;
  finished_at: string | null;
  errors: { id: number; email: string }[];
};
type Filter = "active" | "all" | "by_interests" | "by_ids";

export default function NewsletterSendPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState("");

  const [subject, setSubject] = useState(DEFAULT_TEMPLATE.subject);
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_TEMPLATE.html);
  const [currentTemplate, setCurrentTemplate] = useState(DEFAULT_TEMPLATE.id);
  const [showColors, setShowColors] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState<SendResponse | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/community/newsletter/stats") as Promise<Stats>,
      api.get("/api/community/newsletter?active=1") as Promise<ListResponse>,
    ])
      .then(([s, l]) => {
        setStats(s);
        setSubscribers(l.subscribers);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function loadSubscribers(query: string) {
    setLoadingSubs(true);
    try {
      const qs = query ? `?search=${encodeURIComponent(query)}` : "?active=1";
      const res = (await api.get(`/api/community/newsletter${qs}`)) as ListResponse;
      setSubscribers(res.subscribers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoadingSubs(false);
    }
  }

  const recipientCount = useMemo(() => {
    if (filter === "active") return subscribers.filter((s) => s.is_active).length;
    if (filter === "all") {
      return includeInactive ? subscribers.length : subscribers.filter((s) => s.is_active).length;
    }
    if (filter === "by_interests") {
      return subscribers.filter((s) => {
        if (!s.is_active && !includeInactive) return false;
        const tags = extractTags(s.interests);
        return selectedInterests.some((t) => tags.includes(t));
      }).length;
    }
    return selectedIds.length;
  }, [filter, subscribers, includeInactive, selectedInterests, selectedIds]);

  function selectTemplate(t: Template) {
    setCurrentTemplate(t.id);
    setSubject(t.subject);
    setBodyHtml(t.html);
  }

  async function preview() {
    if (!subject.trim() || !bodyHtml.trim()) return;
    setPreviewing(true);
    setError("");
    try {
      const res = (await api.post("/api/community/newsletter/preview", {
        subject,
        body_html: bodyHtml,
      })) as { html: string };
      setPreviewHtml(res.html);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  }

  function requestSend() {
    if (!subject.trim() || !bodyHtml.trim()) {
      setError("Subject and body are required");
      return;
    }
    if (filter === "by_interests" && selectedInterests.length === 0) {
      setError("Pick at least one interest tag");
      return;
    }
    if (filter === "by_ids" && selectedIds.length === 0) {
      setError("Pick at least one subscriber");
      return;
    }
    if (recipientCount === 0) {
      setError("No recipients match the current filter");
      return;
    }
    setConfirmation(
      `Send "${subject}" to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}?`,
    );
  }

  async function confirmSend() {
    setSending(true);
    setError("");
    setConfirmation("");
    try {
      const body: Record<string, unknown> = {
        subject,
        body_html: bodyHtml,
        recipient_filter: filter,
        include_inactive: includeInactive,
      };
      if (filter === "by_interests") body.interests = selectedInterests;
      if (filter === "by_ids") body.subscriber_ids = selectedIds;
      const res = (await api.post("/api/community/newsletter/send", body)) as SendResponse;
      setJob(res);
      setJobStatus(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const s = (await api.get(
          `/api/community/newsletter/send/status/${job.job_id}`,
        )) as JobStatus;
        if (!cancelled) {
          setJobStatus(s);
          if (s.status !== "completed") setTimeout(poll, 1500);
        }
      } catch {
        if (!cancelled) setTimeout(poll, 3000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [job]);

  function reset() {
    setJob(null);
    setJobStatus(null);
    setConfirmation("");
  }

  function toggleTag(tag: string) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function toggleId(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (job) {
    return <JobProgress job={job} jobStatus={jobStatus} onReset={reset} />;
  }

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header
        className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8"
        style={{ borderBottom: BORDER }}
      >
        <div>
          <Link
            href={`${ADMIN_ROUTE}/subscribers`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] inline-block mb-3"
            style={{ color: INK_SOFT }}
          >
            Subscribers
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-8 h-8 rounded-full" style={{ background: SIENNA }} />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: SIENNA }}>
              Newsletter
            </p>
          </div>
          <h1
            className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]"
            style={{ color: INK }}
          >
            Compose and Send
          </h1>
        </div>
        <div className="lg:text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: INK_SOFT }}>
            Recipients
          </p>
          <p className="font-black text-4xl tabular-nums tracking-[-0.04em] leading-none" style={{ color: INK }}>
            {recipientCount}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          className="rounded-2xl p-6"
          style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
              style={{ background: SIENNA, color: PAPER }}
            >
              Step 01
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
              Message
            </p>
          </div>
          <TemplatePicker currentId={currentTemplate} onSelect={selectTemplate} />
          <Field label="Subject">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A quick update from the workshop"
              className="w-full px-3 py-2 text-sm border-0 border-b-2 focus:outline-none bg-transparent"
              style={{ borderColor: INK, color: INK }}
            />
          </Field>
          <Field label="Body (HTML)">
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 text-xs font-mono border-2 rounded-xl focus:outline-none resize-y"
              style={{ borderColor: INK, color: INK, background: PAPER }}
            />
          </Field>
          <p className="text-[11px] font-mono" style={{ color: INK_SOFT }}>
            Use <code className="px-1 rounded" style={{ background: "rgba(26,26,26,0.08)" }}>{`{name}`}</code> and{" "}
            <code className="px-1 rounded" style={{ background: "rgba(26,26,26,0.08)" }}>{`{unsubscribe_url}`}</code> for
            personalisation. An unsubscribe footer is appended automatically.
          </p>
        </div>

        <PreviewPane
          subject={subject}
          bodyHtml={bodyHtml}
          previewing={previewing}
          previewHtml={previewHtml}
          onPreview={preview}
        />
      </div>

      <RecipientSelector
        filter={filter}
        includeInactive={includeInactive}
        selectedInterests={selectedInterests}
        selectedIds={selectedIds}
        search={search}
        recipientCount={recipientCount}
        stats={stats}
        subscribers={subscribers}
        loadingSubs={loadingSubs}
        onFilterChange={setFilter}
        onIncludeInactive={setIncludeInactive}
        onToggleTag={toggleTag}
        onToggleId={toggleId}
        onSearch={(q) => {
          setSearch(q);
          loadSubscribers(q);
        }}
      />

      {error && (
        <div
          className="text-xs font-mono py-2 px-3 border-l-2 mb-4"
          style={{ color: SIENNA, borderColor: SIENNA, background: "rgba(216, 67, 21, 0.08)" }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs font-mono" style={{ color: INK_SOFT }}>
          {recipientCount === 0
            ? "Pick recipients to enable send."
            : `Will send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"} via SMTP.`}
        </p>
        <button
          onClick={requestSend}
          disabled={sending || recipientCount === 0}
          className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-6 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
          style={{ background: SIENNA, color: PAPER, boxShadow: `3px 3px 0 ${INK}` }}
        >
          {sending ? "Queueing..." : "Send newsletter"}
        </button>
      </div>

      <ColorSidebar open={showColors} onClose={() => setShowColors(false)} />

      <button
        onClick={() => setShowColors((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-0.5 shadow-lg"
        style={{ background: SIENNA, color: PAPER, boxShadow: `3px 3px 0 ${INK}` }}
        title="Color palette"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
          <path d="M12 2a10 10 0 0 0 0 20" />
        </svg>
      </button>

      {confirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(10,10,10,0.55)" }}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{ background: PAPER, border: BORDER, boxShadow: `6px 6px 0 ${INK}` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: SIENNA }}>
              Confirm
            </p>
            <p className="text-base mb-6" style={{ color: INK }}>
              {confirmation}
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmSend}
                disabled={sending}
                className="flex-1 font-mono text-[10px] uppercase tracking-[0.3em] py-3 rounded-full cursor-pointer"
                style={{ background: SIENNA, color: PAPER }}
              >
                {sending ? "Queueing..." : "Yes, send"}
              </button>
              <button
                onClick={() => setConfirmation("")}
                className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full cursor-pointer"
                style={{ background: PAPER, color: INK, border: BORDER }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

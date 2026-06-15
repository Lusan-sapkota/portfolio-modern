"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/admin-api";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const INK_SOFT = "#6b5b54";
const TEAL = "#006064";
const BORDER = `2px solid ${INK}`;

type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_spam: boolean;
  is_replied: boolean;
  submitted_at: string | null;
  replied_at: string | null;
};

type ListResponse = { contacts: Contact[]; count: number };
type Stats = { total: number; spam: number; replied: number; unreplied: number };

type PendingAction =
  | { type: "spam"; contact: Contact }
  | { type: "replied"; contact: Contact }
  | { type: "delete"; contact: Contact }
  | { type: "reply"; contact: Contact }
  | null;

type ActionType = NonNullable<PendingAction>["type"];

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

export default function ContactsPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ search: "", spam: "" });
  const [applied, setApplied] = useState({ search: "", spam: "" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [replySending, setReplySending] = useState(false);

  function buildQuery() {
    const p = new URLSearchParams();
    if (applied.search) p.set("search", applied.search);
    if (applied.spam === "1") p.set("spam", "1");
    if (applied.spam === "0") p.set("spam", "0");
    return p.toString();
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery();
      const suffix = qs ? `?${qs}` : "";
      const [list, s] = await Promise.all([
        api.get(`/api/community/contacts${suffix}`) as Promise<ListResponse>,
        api.get("/api/community/contacts/stats") as Promise<Stats>,
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
    const empty = { search: "", spam: "" };
    setFilter(empty);
    setApplied(empty);
  }

  function confirmAction(type: ActionType, contact: Contact) {
    if (type === "reply") {
      setReplyBody("");
      setReplyAttachment(null);
      setPending({ type, contact });
      return;
    }
    setPending({ type, contact });
  }

  async function executeAction() {
    if (!pending) return;
    const { type, contact } = pending;
    setRunningId(contact.id);
    setPending(null);
    setError("");
    try {
      if (type === "delete") {
        await api.delete(`/api/community/contacts/${contact.id}`);
      } else if (type === "spam") {
        await api.put(`/api/community/contacts/${contact.id}`, {
          is_spam: !contact.is_spam,
        });
      } else if (type === "replied") {
        await api.put(`/api/community/contacts/${contact.id}`, {
          is_replied: !contact.is_replied,
        });
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setRunningId(null);
    }
  }

  async function sendReply() {
    if (!pending || pending.type !== "reply" || !replyBody.trim()) return;
    setReplySending(true);
    setError("");
    try {
      const body: Record<string, unknown> = { body_html: replyBody.trim() };
      if (replyAttachment) {
        const b64 = await fileToBase64(replyAttachment);
        body.attachment = {
          filename: replyAttachment.name,
          content_base64: b64,
        };
      }
      await api.post(`/api/community/contacts/${pending.contact.id}/reply`, body);
      setPending(null);
      setReplyBody("");
      setReplyAttachment(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reply failed");
    } finally {
      setReplySending(false);
    }
  }

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header
        className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8"
        style={{ borderBottom: BORDER }}
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-8 h-8 rounded-full" style={{ background: TEAL }} />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: TEAL }}>
              Community
            </p>
          </div>
          <h1 className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]" style={{ color: INK }}>
            Contacts
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatTile label="Total" value={stats?.total ?? "-"} tone="paper" />
        <StatTile label="Unreplied" value={stats?.unreplied ?? "-"} tone="sienna" />
        <StatTile label="Replied" value={stats?.replied ?? "-"} tone="ink" />
        <StatTile label="Spam" value={stats?.spam ?? "-"} tone="paper" />
      </div>

      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
            style={{ background: TEAL, color: PAPER }}
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
              placeholder="name, email, subject"
              className={selectClass}
              style={selectStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
              }}
            />
          </Field>
          <Field label="Spam">
            <select
              value={filter.spam}
              onChange={(e) => setFilter({ ...filter, spam: e.target.value })}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">All</option>
              <option value="1">Spam only</option>
              <option value="0">Non-spam only</option>
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
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Subject</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    Loading contacts...
                  </td>
                </tr>
              )}
              {data?.contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-mono text-xs" style={{ color: INK_SOFT }}>
                    No contacts match these filters.
                  </td>
                </tr>
              )}
              {data?.contacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  expanded={expandedId === c.id}
                  onToggleExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onToggleSpam={() => confirmAction("spam", c)}
                  onToggleReplied={() => confirmAction("replied", c)}
                  onReply={() => confirmAction("reply", c)}
                  onDelete={() => confirmAction("delete", c)}
                  busy={runningId === c.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        pending={pending}
        onConfirm={executeAction}
        onCancel={() => setPending(null)}
      />

      <ReplyModal
        pending={pending && pending.type === "reply" ? pending : null}
        body={replyBody}
        onChangeBody={setReplyBody}
        attachment={replyAttachment}
        onChangeAttachment={setReplyAttachment}
        sending={replySending}
        onSend={sendReply}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function ConfirmationModal({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!pending || pending.type === "reply") return null;
  const { type, contact } = pending;
  const labels: Record<string, { title: string; msg: string; confirm: string }> = {
    spam: {
      title: contact.is_spam ? "Mark as not spam?" : "Mark as spam?",
      msg: contact.is_spam
        ? `Restore "${contact.email}" to the inbox.`
        : `Hide "${contact.email}" in the spam folder.`,
      confirm: contact.is_spam ? "Not spam" : "Mark spam",
    },
    replied: {
      title: contact.is_replied ? "Unmark replied?" : "Mark as replied?",
      msg: contact.is_replied
        ? `Mark this message as not yet replied.`
        : `Mark that you have replied to "${contact.email}".`,
      confirm: contact.is_replied ? "Unmark" : "Mark replied",
    },
    delete: {
      title: `Delete contact from ${contact.email}?`,
      msg: "This cannot be undone.",
      confirm: "Delete",
    },
  };
  const info = labels[type];
  if (!info) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "rgba(10,10,10,0.55)" }}>
      <div
        className="rounded-2xl p-6 max-w-md w-full"
        style={{ background: PAPER, border: BORDER, boxShadow: `6px 6px 0 ${INK}` }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: type === "delete" ? SIENNA : TEAL }}>
          {type === "delete" ? "Danger" : "Confirm"}
        </p>
        <p className="text-base font-semibold mb-1" style={{ color: INK }}>{info.title}</p>
        <p className="text-sm mb-6" style={{ color: INK_SOFT }}>{info.msg}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 font-mono text-[10px] uppercase tracking-[0.3em] py-3 rounded-full cursor-pointer"
            style={{ background: type === "delete" ? SIENNA : INK, color: PAPER }}
          >
            {info.confirm}
          </button>
          <button
            onClick={onCancel}
            className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full cursor-pointer"
            style={{ background: PAPER, color: INK, border: BORDER }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReplyModal({
  pending,
  body,
  onChangeBody,
  attachment,
  onChangeAttachment,
  sending,
  onSend,
  onCancel,
}: {
  pending: PendingAction;
  body: string;
  onChangeBody: (v: string) => void;
  attachment: File | null;
  onChangeAttachment: (f: File | null) => void;
  sending: boolean;
  onSend: () => void;
  onCancel: () => void;
}) {
  if (!pending || pending.type !== "reply") return null;
  const { contact } = pending;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "rgba(10,10,10,0.55)" }}>
      <div
        className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col"
        style={{ background: PAPER, border: BORDER, boxShadow: `6px 6px 0 ${INK}` }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: TEAL }}>
          Reply
        </p>
        <p className="text-sm mb-4" style={{ color: INK_SOFT }}>
          Sending as <span className="font-mono">contact@lusansapkota.com.np</span> to{" "}
          <span className="font-mono font-semibold" style={{ color: INK }}>{contact.email}</span>
        </p>
        <div className="rounded-xl p-4 mb-4 text-xs" style={{ background: "rgba(0,96,100,0.06)", border: `1px solid ${TEAL}22` }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: INK_SOFT }}>
            Original message
          </p>
          <p className="text-sm" style={{ color: INK }}>
            {contact.subject ? <><strong>{contact.subject}</strong><br /></> : null}
            {contact.message}
          </p>
        </div>
        <Field label="Your reply (HTML)">
          <textarea
            value={body}
            onChange={(e) => onChangeBody(e.target.value)}
            rows={8}
            placeholder={`Hi ${contact.name || "there"},\n\nThank you for reaching out. ...`}
            className="w-full px-3 py-2 text-xs font-mono border-2 rounded-xl focus:outline-none resize-y"
            style={{ borderColor: INK, color: INK, background: PAPER }}
          />
        </Field>
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              onChange={(e) => onChangeAttachment(e.target.files?.[0] ?? null)}
              className="hidden"
              id="reply-attachment"
            />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-2.5 rounded-full"
              style={{ background: PAPER, color: INK, border: BORDER }}
            >
              {attachment ? attachment.name : "Attach file (optional)"}
            </span>
            {attachment && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onChangeAttachment(null);
                }}
                className="font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-1 rounded-full cursor-pointer"
                style={{ background: SIENNA, color: PAPER }}
              >
                Clear
              </button>
            )}
          </label>
        </div>
        <p className="text-[11px] font-mono mb-4" style={{ color: INK_SOFT }}>
          A signature with your name and contact@lusansapkota.com.np will be appended automatically.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onSend}
            disabled={sending || !body.trim()}
            className="flex-1 font-mono text-[10px] uppercase tracking-[0.3em] py-3 rounded-full cursor-pointer disabled:opacity-50"
            style={{ background: TEAL, color: PAPER }}
          >
            {sending ? "Sending..." : "Send reply"}
          </button>
          <button
            onClick={onCancel}
            className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full cursor-pointer"
            style={{ background: PAPER, color: INK, border: BORDER }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  contact,
  expanded,
  onToggleExpand,
  onToggleSpam,
  onToggleReplied,
  onReply,
  onDelete,
  busy,
}: {
  contact: Contact;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleSpam: () => void;
  onToggleReplied: () => void;
  onReply: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-[rgba(0,96,100,0.04)]"
        style={{ borderTop: `1px solid rgba(26,26,26,0.08)` }}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3 text-sm font-semibold" style={{ color: INK }}>
          {contact.name || "Anonymous"}
        </td>
        <td className="px-4 py-3 font-mono text-xs" style={{ color: INK }}>
          {contact.email}
        </td>
        <td className="px-4 py-3 text-sm max-w-[200px] truncate" style={{ color: INK_SOFT }}>
          {contact.subject || "-"}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <span
            className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded"
            style={{
              background: contact.is_replied ? TEAL : contact.is_spam ? SIENNA : INK,
              color: PAPER,
            }}
          >
            {contact.is_spam ? "spam" : contact.is_replied ? "replied" : "unreplied"}
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-xs" style={{ color: INK_SOFT }}>
          {formatTime(contact.submitted_at)}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1.5">
            {!contact.is_spam && (
              <button
                onClick={onReply}
                disabled={busy}
                className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                style={{ background: TEAL, color: PAPER }}
              >
                Reply
              </button>
            )}
            {!contact.is_spam && (
              <button
                onClick={onToggleReplied}
                disabled={busy}
                className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                style={{
                  background: PAPER,
                  color: contact.is_replied ? INK_SOFT : TEAL,
                  border: `1.5px solid ${contact.is_replied ? INK_SOFT : TEAL}`,
                }}
              >
                {contact.is_replied ? "Unmark" : "Done"}
              </button>
            )}
            <button
              onClick={onToggleSpam}
              disabled={busy}
              className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
              style={{
                background: PAPER,
                color: contact.is_spam ? INK_SOFT : SIENNA,
                border: `1.5px solid ${contact.is_spam ? INK_SOFT : SIENNA}`,
              }}
            >
              {contact.is_spam ? "Not spam" : "Spam"}
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
              style={{ background: SIENNA, color: PAPER }}
            >
              Del
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderTop: `1px solid rgba(26,26,26,0.08)` }}>
          <td colSpan={6} className="px-6 py-5" style={{ background: "rgba(0,96,100,0.04)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: TEAL }}>
                  Subject
                </p>
                <p className="text-sm font-semibold" style={{ color: INK }}>
                  {contact.subject || "No subject"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: INK_SOFT }}>
                  Details
                </p>
                <p className="font-mono text-xs" style={{ color: INK_SOFT }}>
                  {contact.name} &middot; {contact.email}
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: INK_SOFT }}>
                  Submitted {formatTime(contact.submitted_at)}
                  {contact.replied_at && ` · Replied ${formatTime(contact.replied_at)}`}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: INK_SOFT }}>
                  Message
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>
                  {contact.message || "No message body."}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
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
  if (!iso) return "-";
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

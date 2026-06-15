"use client";

import { useState, type FormEvent } from "react";
import { changePassword, changeUsername } from "@/app/lib/admin-api";
import { friendlyError } from "@/app/lib/friendly-errors";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const INK_SOFT = "#6b5b54";
const BORDER = `2px solid ${INK}`;

export default function SettingsPage() {
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
              Account
            </p>
          </div>
          <h1
            className="font-black text-5xl lg:text-6xl tracking-[-0.04em] leading-[0.9]"
            style={{ color: INK }}
          >
            Settings
          </h1>
        </div>
        <div className="lg:text-right max-w-sm">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2"
            style={{ color: INK_SOFT }}
          >
            Security
          </p>
          <p className="text-sm font-medium" style={{ color: INK }}>
            Update your username and password. Both require your current password.
          </p>
        </div>
      </header>

      <SectionHeader label="01" title="Identity" count={2} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
        <UsernameCard />
        <PasswordCard />
      </div>

      <SectionHeader label="02" title="Info" />
      <InfoCard />
    </div>
  );
}

function SectionHeader({
  label,
  title,
  count,
}: {
  label: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold"
        style={{ color: SIENNA }}
      >
        {label}
      </span>
      <h2 className="font-black text-xl tracking-[-0.02em]" style={{ color: INK }}>
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
  );
}

function CardShell({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 lg:p-7 transition-transform"
      style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
          style={{ background: SIENNA, color: PAPER }}
        >
          {number}
        </span>
        <div>
          <p
            className="font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{ color: INK_SOFT }}
          >
            {label}
          </p>
          <h3 className="font-black text-lg tracking-[-0.02em]" style={{ color: INK }}>
            {title}
          </h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function UsernameCard() {
  const [newUsername, setNewUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "changeUsername"));
      return;
    }
    if (newUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await changeUsername(newUsername, currentPw, honeypot);
      setSuccess(`Username updated to "${res.username}". You will be signed out shortly.`);
      setNewUsername("");
      setCurrentPw("");
    } catch (err) {
      setError(friendlyError(err, "changeUsername"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <CardShell number="01" label="Identity" title="Change Username">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <HoneypotField value={honeypot} onChange={setHoneypot} />

        <Field
          label="New Username"
          hint="3-100 chars. Letters, numbers, _, -, ."
        >
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="new-admin"
            autoComplete="off"
            autoFocus
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Confirm With Password" hint="Your current password">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className={`${inputClass} pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
              style={{ color: INK }}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <StatusLine error={error} success={success} />

        <SubmitButton loading={loading} text="Update Username" />
      </form>
    </CardShell>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "changePassword"));
      return;
    }
    if (newPw.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPw !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, newPw, honeypot);
      setSuccess("Password changed. Other sessions have been signed out.");
      setCurrent("");
      setNewPw("");
      setConfirm("");
    } catch (err) {
      setError(friendlyError(err, "changePassword"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <CardShell number="02" label="Security" title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <HoneypotField value={honeypot} onChange={setHoneypot} />

        <Field label="Current Password">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              autoFocus
              className={`${inputClass} pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
              style={{ color: INK }}
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="New Password" hint="Minimum 8 characters">
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className={`${inputClass} pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
              style={{ color: INK }}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="Confirm New Password">
          <input
            type={showNew ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <StatusLine error={error} success={success} />

        <SubmitButton loading={loading} text="Update Password" />
      </form>
    </CardShell>
  );
}

function InfoCard() {
  return (
    <div
      className="rounded-2xl p-6 lg:p-7"
      style={{ background: INK, color: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${SIENNA}` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
          style={{ background: SIENNA, color: PAPER }}
        >
          Note
        </span>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: SIENNA }}
        >
          Security Notice
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {[
          "Changing your username or password signs out every other active session.",
          "Your current password is required for any account change. It is never stored in plaintext.",
          "Usernames are 3-100 chars and may use letters, numbers, underscore, dash, or dot.",
        ].map((line) => (
          <li key={line} className="flex items-start gap-3">
            <span
              className="mt-2 inline-block w-2 h-2 rounded-full shrink-0"
              style={{ background: SIENNA }}
            />
            <span className="text-sm leading-relaxed">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border-0 border-b-2 py-3 text-base focus:outline-none transition-colors";

const inputStyle: React.CSSProperties = {
  borderColor: INK,
  color: INK,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
        style={{ color: INK }}
      >
        <span>{label}</span>
        {hint && (
          <span className="normal-case tracking-normal text-[10px]" style={{ color: INK_SOFT }}>
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function StatusLine({ error, success }: { error: string; success: string }) {
  if (error) {
    return (
      <div
        className="text-xs font-mono py-2 px-3 border-l-2"
        style={{ color: SIENNA, borderColor: SIENNA, background: "rgba(216, 67, 21, 0.08)" }}
      >
        {error}
      </div>
    );
  }
  if (success) {
    return (
      <div
        className="text-xs font-mono py-2 px-3 border-l-2"
        style={{ color: INK, borderColor: INK, background: "rgba(26, 26, 26, 0.06)" }}
      >
        {success}
      </div>
    );
  }
  return null;
}

function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 group flex items-center justify-between w-full font-sans font-bold text-sm uppercase tracking-[0.2em] py-4 px-6 rounded-full transition-all disabled:opacity-50 cursor-pointer"
      style={{ background: INK, color: PAPER }}
    >
      <span>{loading ? "Saving..." : text}</span>
      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
    </button>
  );
}

function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

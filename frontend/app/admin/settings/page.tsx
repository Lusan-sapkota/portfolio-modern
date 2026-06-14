"use client";

import { useState } from "react";
import { changePassword } from "@/app/lib/admin-api";
import { friendlyError } from "@/app/lib/friendly-errors";

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
      setSuccess("Password changed successfully");
      setCurrent("");
      setNewPw("");
      setConfirm("");
    } catch (err) {
      setError(friendlyError(err, "changePassword"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b-2 py-3 text-base focus:outline-none transition-colors";

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--color-sienna, #c84a23)" }}>
          Settings
        </h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft, #6b5b54)" }}>
          Change your admin password
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border rounded-2xl p-8 relative"
        style={{ background: "#fffdf5", borderColor: "rgba(176, 125, 91, 0.2)" }}
      >
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}
        >
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>
        <Field label="Current Password">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={`${inputClass} pr-10`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
              style={{ color: "var(--color-ink, #2b1d1a)" }}
            >
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="New Password">
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
              style={{ color: "var(--color-ink, #2b1d1a)" }}
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
            className={inputClass}
          />
        </Field>

        {error && (
          <div
            className="text-xs font-mono py-2 px-3 border-l-2 mt-2"
            style={{
              color: "var(--color-sienna, #c84a23)",
              borderColor: "var(--color-sienna, #c84a23)",
              background: "rgba(200, 74, 35, 0.06)",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="text-xs font-mono py-2 px-3 border-l-2 mt-2"
            style={{
              color: "var(--color-ink, #2b1d1a)",
              borderColor: "var(--color-ink, #2b1d1a)",
              background: "rgba(62, 39, 35, 0.06)",
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 group flex items-center justify-between w-full font-sans font-bold text-sm uppercase tracking-[0.2em] py-4 px-6 rounded-full transition-all disabled:opacity-50"
          style={{ background: "var(--color-ink, #2b1d1a)", color: "var(--color-paper, #f7f1e3)" }}
        >
          <span>{loading ? "Saving..." : "Change Password"}</span>
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label
        className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
        style={{ color: "var(--color-ink-soft, #6b5b54)" }}
      >
        {label}
      </label>
      <div
        className="border-b-2"
        style={{ borderColor: "var(--color-ink, #2b1d1a)", color: "var(--color-ink, #2b1d1a)" }}
      >
        {children}
      </div>
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

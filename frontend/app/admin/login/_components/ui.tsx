"use client";

import React from "react";

const inputClass =
  "w-full bg-transparent border-0 border-b-2 py-3 text-base focus:outline-none transition-colors";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
        style={{ color: "var(--color-ink-soft, #6b5b54)" }}
      >
        {label}
      </label>
      <div className="border-b-2" style={{ borderColor: "var(--color-ink, #2b1d1a)" }}>
        <div style={{ color: "var(--color-ink, #2b1d1a)" }}>{children}</div>
      </div>
    </div>
  );
}

export function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 py-2 pr-10 text-base focus:outline-none"
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-70"
        style={{ color: "var(--color-ink, #2b1d1a)" }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  className = "",
  style,
  inputMode,
  pattern,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${className}`}
      style={style}
      placeholder={placeholder}
      autoFocus={autoFocus}
      inputMode={inputMode}
      pattern={pattern}
      maxLength={maxLength}
    />
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="text-xs font-mono py-2 px-3 border-l-2"
      style={{
        color: "var(--color-sienna, #c84a23)",
        borderColor: "var(--color-sienna, #c84a23)",
        background: "rgba(200, 74, 35, 0.06)",
      }}
    >
      {message}
    </div>
  );
}

export function InfoBox({ message }: { message: string }) {
  return (
    <div
      className="text-xs font-mono py-2 px-3 border-l-2"
      style={{
        color: "var(--color-ink, #2b1d1a)",
        borderColor: "var(--color-sienna, #c84a23)",
        background: "rgba(200, 74, 35, 0.06)",
      }}
    >
      {message}
    </div>
  );
}

export function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-4 group flex items-center justify-between w-full font-sans font-bold text-sm uppercase tracking-[0.2em] py-4 px-6 rounded-full transition-all disabled:opacity-50"
      style={{ background: "var(--color-ink, #2b1d1a)", color: "var(--color-paper, #f7f1e3)" }}
    >
      <span>{loading ? "Working..." : text}</span>
      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
    </button>
  );
}

export function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-mono uppercase tracking-[0.2em] self-start"
      style={{ color: "var(--color-ink-soft, #6b5b54)" }}
    >
      {children}
    </button>
  );
}

export function HoneypotField({
  value,
  onChange,
  name = "website",
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
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
          name={name}
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

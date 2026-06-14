"use client";

import { Field, PasswordInput, TextInput, SubmitButton, ErrorBox, BackLink, HoneypotField } from "./ui";

export function CredentialsStep({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  honeypot,
  setHoneypot,
  onSubmit,
  onForgot,
}: {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  loading: boolean;
  error: string;
  honeypot: string;
  setHoneypot: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgot: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <Field label="Username">
        <TextInput
          value={username}
          onChange={setUsername}
          placeholder="admin"
          autoFocus
        />
      </Field>

      <Field label="Password">
        <PasswordInput
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          placeholder="••••••••"
        />
      </Field>

      <button
        type="button"
        onClick={onForgot}
        className="text-xs font-mono uppercase tracking-[0.2em] self-end"
        style={{ color: "var(--color-ink-soft, #6b5b54)" }}
      >
        Forgot password?
      </button>

      {error && <ErrorBox message={error} />}

      <SubmitButton loading={loading} text="Continue" />
    </form>
  );
}

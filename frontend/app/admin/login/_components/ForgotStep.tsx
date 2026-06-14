"use client";

import { Field, TextInput, SubmitButton, ErrorBox, InfoBox, BackLink, HoneypotField } from "./ui";

export function ForgotStep({
  email,
  setEmail,
  loading,
  error,
  info,
  honeypot,
  setHoneypot,
  onSubmit,
  onBack,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  info: string;
  honeypot: string;
  setHoneypot: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <Field label="Email">
        <TextInput
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoFocus
        />
      </Field>

      {error && <ErrorBox message={error} />}
      {info && <InfoBox message={info} />}

      <SubmitButton loading={loading} text="Send Reset Token" />

      <BackLink onClick={onBack}>&larr; Back to sign in</BackLink>
    </form>
  );
}

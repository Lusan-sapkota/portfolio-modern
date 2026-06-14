"use client";

import { Field, TextInput, PasswordInput, SubmitButton, ErrorBox, InfoBox, BackLink, HoneypotField } from "./ui";

export function ResetStep({
  token,
  setToken,
  newPassword,
  setNewPassword,
  showNew,
  setShowNew,
  loading,
  error,
  info,
  honeypot,
  setHoneypot,
  onSubmit,
  onBack,
}: {
  token: string;
  setToken: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
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

      <Field label="Reset Token">
        <TextInput
          value={token}
          onChange={setToken}
          placeholder="Paste token from email"
          autoFocus
        />
      </Field>

      <Field label="New Password">
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          placeholder="At least 8 characters"
        />
      </Field>

      {error && <ErrorBox message={error} />}
      {info && <InfoBox message={info} />}

      <SubmitButton loading={loading} text="Reset Password" />

      <BackLink onClick={onBack}>&larr; Back to sign in</BackLink>
    </form>
  );
}

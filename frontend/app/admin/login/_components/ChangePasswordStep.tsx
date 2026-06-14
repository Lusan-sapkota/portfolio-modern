"use client";

import { Field, PasswordInput, SubmitButton, ErrorBox, HoneypotField } from "./ui";

export function ChangePasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNew,
  setShowNew,
  loading,
  error,
  honeypot,
  setHoneypot,
  onSubmit,
}: {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  loading: boolean;
  error: string;
  honeypot: string;
  setHoneypot: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <Field label="New Password">
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          placeholder="At least 8 characters"
          autoFocus
        />
      </Field>

      <Field label="Confirm New Password">
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          placeholder="Re-enter new password"
        />
      </Field>

      {error && <ErrorBox message={error} />}

      <SubmitButton loading={loading} text="Set Password & Sign In" />
    </form>
  );
}

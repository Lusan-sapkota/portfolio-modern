"use client";

import { Field, TextInput, SubmitButton, ErrorBox, BackLink, HoneypotField } from "./ui";

export function OtpStep({
  otp,
  setOtp,
  mustChange,
  loading,
  error,
  honeypot,
  setHoneypot,
  onSubmit,
  onBack,
}: {
  otp: string;
  setOtp: (v: string) => void;
  mustChange: boolean;
  loading: boolean;
  error: string;
  honeypot: string;
  setHoneypot: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <Field label="One-Time Password">
        <TextInput
          value={otp}
          onChange={(v) => setOtp(v.replace(/\D/g, ""))}
          placeholder="000000"
          autoFocus
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          className="text-2xl"
          style={{ letterSpacing: "0.4em" }}
        />
      </Field>

      {error && <ErrorBox message={error} />}

      <SubmitButton
        loading={loading}
        text={mustChange ? "Verify & Set Password" : "Verify & Sign In"}
      />

      <BackLink onClick={onBack}>&larr; Back</BackLink>
    </form>
  );
}

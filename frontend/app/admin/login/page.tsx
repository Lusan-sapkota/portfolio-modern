"use client";

import { useState } from "react";
import { login, verifyOtp, changePassword, forgotPassword, resetPassword } from "@/app/lib/admin-api";
import { friendlyError } from "@/app/lib/friendly-errors";
import { CredentialsStep } from "./_components/CredentialsStep";
import { OtpStep } from "./_components/OtpStep";
import { ChangePasswordStep } from "./_components/ChangePasswordStep";
import { ForgotStep } from "./_components/ForgotStep";
import { ResetStep } from "./_components/ResetStep";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

type Step = "credentials" | "otp" | "change-password" | "forgot" | "reset";

const STEP_HEADING: Record<Step, { title: string; subtitle: (email: string) => string }> = {
  credentials: {
    title: "Welcome back.",
    subtitle: () => "Enter your credentials to receive a verification code.",
  },
  otp: {
    title: "Check your email.",
    subtitle: (email) => `A 6-digit code was sent to ${email}`,
  },
  "change-password": {
    title: "Set a new password.",
    subtitle: () => "Choose a strong password you haven't used before.",
  },
  forgot: {
    title: "Forgot your password?",
    subtitle: () => "Enter your email and we'll send you a reset token.",
  },
  reset: {
    title: "Enter the reset token.",
    subtitle: () => "Paste the token from your email and choose a new password.",
  },
};

const STEP_LABEL: Record<Step, string> = {
  credentials: "01",
  otp: "02",
  "change-password": "03",
  forgot: "01",
  reset: "02",
};

export default function LoginPage() {
  const [step, setStep] = useState<Step>("credentials");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [honeypot, setHoneypot] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [mustChange, setMustChange] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "login"));
      return;
    }
    setLoading(true);
    try {
      const res = await login(username, password, honeypot);
      if (res.requires_otp) {
        setEmail(res.email);
        setMustChange(res.must_change_password);
        setStep("otp");
      }
    } catch (err) {
      setError(friendlyError(err, "login"));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "otp"));
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(otp, username, honeypot);
      if (mustChange) {
        setStep("change-password");
      } else {
        window.location.href = ADMIN_ROUTE;
      }
    } catch (err) {
      setError(friendlyError(err, "otp"));
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "changePassword"));
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePassword(password, newPassword, honeypot);
      window.location.href = ADMIN_ROUTE;
    } catch (err) {
      setError(friendlyError(err, "changePassword"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "forgot"));
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(resetEmail, honeypot);
    } catch (err) {
      setError(friendlyError(err, "forgot"));
    } finally {
      setInfo("If the email exists, a reset token has been sent. Check your inbox.");
      setStep("reset");
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (honeypot) {
      setError(friendlyError(new Error("bot"), "reset"));
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword, honeypot);
      setInfo("Password reset successfully. You can now sign in.");
      setStep("credentials");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    } catch (err) {
      setError(friendlyError(err, "reset"));
    } finally {
      setLoading(false);
    }
  }

  const heading = STEP_HEADING[step];

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--color-paper, #f7f1e3)",
        fontFamily: "var(--font-sans, system-ui)",
      }}
    >
      <aside
        className="hidden lg:flex flex-col justify-between p-12 w-2/5 relative overflow-hidden"
        style={{ background: "var(--color-ink, #1a1a1a)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/assests/frontangle.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26, 26, 26, 0.3) 0%, rgba(26, 26, 26, 0.5) 50%, rgba(26, 26, 26, 0.85) 100%)",
          }}
        />

        <div className="relative z-10">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: "var(--color-sienna, #d84315)" }}
          >
            Step {STEP_LABEL[step]} / 03
          </div>
          <h1
            className="font-black text-5xl tracking-[-0.04em] mt-3 leading-[0.95]"
            style={{ color: "var(--color-paper, #fffdf5)" }}
          >
            Portfolio
            <br />
            Admin
            <br />
            <span style={{ color: "var(--color-sienna, #d84315)" }}>Console</span>
          </h1>
        </div>

        <div className="relative z-10 max-w-xs" style={{ color: "#fff8e1" }}>
          <p className="text-sm leading-relaxed opacity-90">
            Manage portfolio content from one place, control access like a boss.
          </p>
          <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
            Lusan Sapkota - {new Date().getFullYear()}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2
              className="font-sans font-bold text-2xl tracking-[-0.02em] leading-tight"
              style={{ color: "var(--color-ink, #2b1d1a)" }}
            >
              {heading.title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft, #6b5b54)" }}>
              {heading.subtitle(email)}
            </p>
          </div>

          {step === "credentials" && (
            <CredentialsStep
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              error={error}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              onSubmit={handleCredentials}
              onForgot={() => {
                setStep("forgot");
                setError("");
                setInfo("");
              }}
            />
          )}

          {step === "otp" && (
            <OtpStep
              otp={otp}
              setOtp={setOtp}
              mustChange={mustChange}
              loading={loading}
              error={error}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              onSubmit={handleOtp}
              onBack={() => {
                setStep("credentials");
                setOtp("");
                setError("");
              }}
            />
          )}

          {step === "change-password" && (
            <ChangePasswordStep
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showNew={showNew}
              setShowNew={setShowNew}
              loading={loading}
              error={error}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              onSubmit={handleChangePassword}
            />
          )}

          {step === "forgot" && (
            <ForgotStep
              email={resetEmail}
              setEmail={setResetEmail}
              loading={loading}
              error={error}
              info={info}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              onSubmit={handleForgot}
              onBack={() => {
                setStep("credentials");
                setError("");
                setInfo("");
              }}
            />
          )}

          {step === "reset" && (
            <ResetStep
              token={resetToken}
              setToken={setResetToken}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              showNew={showNew}
              setShowNew={setShowNew}
              loading={loading}
              error={error}
              info={info}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              onSubmit={handleReset}
              onBack={() => {
                setStep("credentials");
                setError("");
                setInfo("");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

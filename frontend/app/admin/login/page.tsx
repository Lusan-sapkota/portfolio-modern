"use client";

import { useState } from "react";
import { login, verifyOtp } from "@/app/lib/admin-api";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.requires_otp) {
        setEmail(res.email);
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await verifyOtp(otp);
      if (token) {
        window.location.href = ADMIN_ROUTE;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

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
        style={{
          background: "var(--color-ink, #1a1a1a)",
        }}
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
            Step {step === "credentials" ? "01" : "02"} / 02
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

        <div
          className="relative z-10 max-w-xs"
          style={{ color: "#fff8e1" }}
        >
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
          <div className="mb-8 lg:hidden">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.4em] inline-block px-3 py-1 rounded-full"
              style={{
                background: "var(--color-ink, #2b1d1a)",
                color: "var(--color-paper, #f7f1e3)",
              }}
            >
              Step {step === "credentials" ? "01" : "02"} / 02
            </div>
            <h1
              className="font-black text-3xl tracking-[-0.04em] mt-4 leading-[0.95]"
              style={{ color: "var(--color-ink, #2b1d1a)" }}
            >
              Portfolio <span style={{ color: "var(--color-sienna, #c84a23)" }}>Admin</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2
              className="font-sans font-bold text-2xl tracking-[-0.02em] leading-tight"
              style={{ color: "var(--color-ink, #2b1d1a)" }}
            >
              {step === "credentials" ? "Welcome back." : "Check your email."}
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-ink-soft, #6b5b54)" }}
            >
              {step === "credentials"
                ? "Enter your credentials to receive a verification code."
                : `A 6-digit code was sent to ${email}`}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="flex flex-col gap-5">
              <div>
                <label
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: "var(--color-ink-soft, #6b5b54)" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 py-3 text-base focus:outline-none transition-colors"
                  style={{
                    borderColor: "var(--color-ink, #2b1d1a)",
                    color: "var(--color-ink, #2b1d1a)",
                  }}
                  placeholder="admin"
                  autoFocus
                />
              </div>

              <div>
                <label
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: "var(--color-ink-soft, #6b5b54)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 py-3 pr-10 text-base focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-ink, #2b1d1a)",
                      color: "var(--color-ink, #2b1d1a)",
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-ink, #2b1d1a)" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="text-xs font-mono py-2 px-3 border-l-2"
                  style={{
                    color: "var(--color-sienna, #c84a23)",
                    borderColor: "var(--color-sienna, #c84a23)",
                    background: "rgba(200, 74, 35, 0.06)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 group flex items-center justify-between w-full font-sans font-bold text-sm uppercase tracking-[0.2em] py-4 px-6 rounded-full transition-all disabled:opacity-50"
                style={{
                  background: "var(--color-ink, #2b1d1a)",
                  color: "var(--color-paper, #f7f1e3)",
                }}
              >
                <span>{loading ? "Sending code..." : "Continue"}</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="flex flex-col gap-5">
              <div>
                <label
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: "var(--color-ink-soft, #6b5b54)" }}
                >
                  One-Time Password
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-transparent border-0 border-b-2 py-3 text-2xl font-mono focus:outline-none transition-colors"
                  style={{
                    borderColor: "var(--color-ink, #2b1d1a)",
                    color: "var(--color-ink, #2b1d1a)",
                    letterSpacing: "0.4em",
                  }}
                  placeholder="000000"
                  autoFocus
                />
              </div>

              {error && (
                <div
                  className="text-xs font-mono py-2 px-3 border-l-2"
                  style={{
                    color: "var(--color-sienna, #c84a23)",
                    borderColor: "var(--color-sienna, #c84a23)",
                    background: "rgba(200, 74, 35, 0.06)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-4 group flex items-center justify-between w-full font-sans font-bold text-sm uppercase tracking-[0.2em] py-4 px-6 rounded-full transition-all disabled:opacity-50"
                style={{
                  background: "var(--color-ink, #2b1d1a)",
                  color: "var(--color-paper, #f7f1e3)",
                }}
              >
                <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError("");
                }}
                className="text-xs font-mono uppercase tracking-[0.2em] self-start"
                style={{ color: "var(--color-ink-soft, #6b5b54)" }}
              >
                &larr; Back
              </button>
            </form>
          )}
        </div>
      </main>
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

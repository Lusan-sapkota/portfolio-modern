"use client";

import { useState } from "react";
import Link from "next/link";
import { friendlyError } from "@/app/lib/friendly-errors";
import { unsubscribe } from "@/app/lib/newsletter";

const INK = "#1a1a1a";
const PAPER = "#fffdf5";
const SIENNA = "#d84315";
const INK_SOFT = "#6b5b54";

type FormState = "idle" | "loading" | "success" | "error";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    if (!confirm) {
      setState("error");
      setMessage("Please confirm you want to unsubscribe.");
      return;
    }
    setState("loading");
    setMessage("");
    try {
      const result = await unsubscribe(email.trim().toLowerCase());
      if (result.status === "success") {
        setState("success");
        setMessage(result.message);
      } else {
        setState("error");
        setMessage(result.message);
      }
    } catch (err) {
      setState("error");
      setMessage(friendlyError(err, "generic"));
    }
  }

  return (
    <main
      className="min-h-full flex-1 flex items-center justify-center px-4 py-16"
      style={{
        background:
          "linear-gradient(135deg, rgba(216,67,21,0.08) 0%, rgba(255,248,225,0.6) 100%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: PAPER,
          border: `1px solid ${INK}1a`,
        }}
      >
        <header
          className="px-7 py-6 text-center"
          style={{ background: SIENNA, color: PAPER }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] opacity-80">
            Newsletter
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl tracking-[-0.03em] mt-1">
            Unsubscribe
          </h1>
        </header>

        <div className="p-7">
          {state === "success" ? (
            <div className="text-center">
              <div
                className="rounded-2xl px-5 py-6 mb-6 text-center font-semibold"
                style={{ background: INK, color: PAPER }}
              >
                <p className="text-xs font-mono uppercase tracking-[0.24em] opacity-80 mb-2">
                  Done
                </p>
                <p className="text-base">{message}</p>
              </div>
              <p className="text-sm text-ink-soft mb-6">
                Sorry to see you go. The inbox can always be re-opened from the homepage.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-5 py-2.5 rounded-full hover:bg-teal transition-colors"
              >
                ← Return to Portfolio
              </Link>
            </div>
          ) : state === "error" && message ? (
            <div
              className="rounded-2xl px-5 py-4 mb-5 text-sm font-semibold text-center"
              style={{ background: SIENNA, color: PAPER }}
            >
              {message}
            </div>
          ) : null}

          {state !== "success" && (
            <>
              <p className="text-center text-ink mb-6">
                Sorry to see you go. Enter the email used for the newsletter to unsubscribe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-mono uppercase tracking-[0.18em] mb-2"
                    style={{ color: INK_SOFT }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    disabled={state === "loading"}
                    className="w-full rounded-full px-5 py-3 outline-none transition focus:ring-2 focus:ring-sienna"
                    style={{
                      background: PAPER,
                      color: INK,
                      border: `1.5px solid ${INK}33`,
                    }}
                  />
                </div>

                <label className="flex items-start gap-3 text-sm text-ink-soft cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                    disabled={state === "loading"}
                    className="mt-0.5 h-4 w-4 accent-sienna"
                  />
                  <span>I confirm that I want to unsubscribe from the newsletter.</span>
                </label>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={state === "loading" || !email}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{ background: SIENNA, color: PAPER }}
                  >
                    {state === "loading" ? "Unsubscribing…" : "Unsubscribe"}
                  </button>
                  <Link
                    href="/"
                    className="w-full text-center inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold border transition hover:bg-ink/5"
                    style={{ color: INK, borderColor: `${INK}33` }}
                  >
                    Keep Subscription
                  </Link>
                </div>
              </form>

              <p className="text-center text-xs text-ink-soft mt-5">
                Re-subscribe anytime from the homepage.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

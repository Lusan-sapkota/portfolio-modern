"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/app/lib/admin-api";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const hasToken = !!getToken();
    setAuthed(hasToken);
    if (!hasToken && !isLogin) {
      router.replace(`${ADMIN_ROUTE}/login`);
    }
  }, [isLogin, router]);

  if (authed === null) return null;

  if (isLogin || !authed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fffdf5", color: "var(--color-ink)" }}>
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 backdrop-blur-sm"
        style={{ background: "rgba(255, 253, 245, 0.85)", borderBottom: "1px solid rgba(176, 125, 91, 0.2)" }}
      >
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-mono transition-colors" style={{ color: "var(--color-ink-soft)" }}>
            &larr; Site
          </a>
          <h1 className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: "var(--color-ink-soft)" }}>
            Portfolio Admin
          </h1>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href={ADMIN_ROUTE}
            className="font-mono text-xs uppercase tracking-wider transition-colors"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Dashboard
          </a>
          <a
            href={`${ADMIN_ROUTE}/settings`}
            className="font-mono text-xs uppercase tracking-wider transition-colors"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Settings
          </a>
          <button
            onClick={() => { clearToken(); router.push(`${ADMIN_ROUTE}/login`); }}
            className="font-mono text-xs uppercase tracking-wider transition-colors"
            style={{ color: "var(--color-sienna)" }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

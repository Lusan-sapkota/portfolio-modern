"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/app/lib/admin-api";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

const NAV = [
  { label: "Dashboard", href: ADMIN_ROUTE, icon: DashboardIcon },
  { label: "Settings", href: `${ADMIN_ROUTE}/settings`, icon: SettingsIcon },
];

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

  function isActive(href: string) {
    if (href === ADMIN_ROUTE) return pathname === ADMIN_ROUTE;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#fffdf5", color: "#1a1a1a" }}>
      <aside
        className="w-64 shrink-0 hidden md:flex flex-col justify-between p-6 sticky top-0 h-screen"
        style={{ background: "#1a1a1a", color: "#fffdf5" }}
      >
        <div>
          <div className="mb-10">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.4em] mb-2"
              style={{ color: "#d84315" }}
            >
              Admin
            </p>
            <h1
              className="font-black text-2xl tracking-[-0.03em] leading-[0.95]"
              style={{ color: "#fffdf5" }}
            >
              Portfolio
              <br />
              <span style={{ color: "#d84315" }}>Console</span>
            </h1>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                  style={{
                    background: active ? "rgba(216, 67, 21, 0.15)" : "transparent",
                    color: active ? "#d84315" : "#fffdf5",
                    borderLeft: active ? "2px solid #d84315" : "2px solid transparent",
                  }}
                >
                  <Icon active={active} />
                  <span className="font-mono text-xs uppercase tracking-[0.15em]">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70"
            style={{ color: "rgba(255, 253, 245, 0.6)" }}
          >
            <span>&larr;</span>
            <span>Back to Site</span>
          </a>
          <button
            onClick={() => {
              clearToken();
              router.push(`${ADMIN_ROUTE}/login`);
            }}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70 text-left"
            style={{ color: "#d84315" }}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
          <p
            className="font-mono text-[9px] uppercase tracking-[0.3em] mt-2 pt-3"
            style={{ color: "rgba(255, 253, 245, 0.4)", borderTop: "1px solid rgba(255, 253, 245, 0.1)" }}
          >
            Lusan Sapkota
            <br />
            {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ background: "#1a1a1a", color: "#fffdf5" }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#d84315" }}>
          Admin
        </span>
        <div className="flex items-center gap-4">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isActive(n.href) ? "#d84315" : "#fffdf5" }}
            >
              {n.label}
            </a>
          ))}
          <button
            onClick={() => {
              clearToken();
              router.push(`${ADMIN_ROUTE}/login`);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "#d84315" }}
          >
            Out
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0" style={{ background: "#fffdf5" }}>
        {children}
      </main>
    </div>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.7)";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.7)";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

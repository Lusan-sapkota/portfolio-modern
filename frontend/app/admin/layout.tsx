"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getToken, clearToken } from "@/app/lib/admin-api";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";
const COLLAPSE_KEY = "admin_sidebar_collapsed";
const PIN_KEY = "admin_sidebar_pinned";

const SIDEBAR_TRANSITION: React.CSSProperties = {
  transitionProperty: "width, transform, padding, background-color",
  transitionDuration: "320ms",
  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
};

const NAV = [
  { label: "Dashboard", href: ADMIN_ROUTE, icon: DashboardIcon },
  { label: "Subscribers", href: `${ADMIN_ROUTE}/subscribers`, icon: UsersIcon },
  { label: "Contacts", href: `${ADMIN_ROUTE}/contacts`, icon: InboxIcon },
  { label: "Send", href: `${ADMIN_ROUTE}/newsletter/send`, icon: MailIcon },
  { label: "Settings", href: `${ADMIN_ROUTE}/settings`, icon: SettingsIcon },
  { label: "Security Log", href: `${ADMIN_ROUTE}/security`, icon: ShieldIcon },
];

const LABEL_CLASS =
  "font-mono text-xs uppercase tracking-[0.15em] whitespace-nowrap animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_120ms_backwards]";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === `${ADMIN_ROUTE}/login`;
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  const expanded = (!collapsed && !pinned) || hoverExpanded;
  const mainPad = expanded ? "md:pl-64" : "md:pl-16";

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored === "1") setCollapsed(true);
    const storedPin = localStorage.getItem(PIN_KEY);
    if (storedPin === "1") setPinned(true);
  }, []);

  useEffect(() => {
    if (isLogin || !authed) return;
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed, isLogin, authed]);

  useEffect(() => {
    if (isLogin || !authed) return;
    localStorage.setItem(PIN_KEY, pinned ? "1" : "0");
  }, [pinned, isLogin, authed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const hasToken = !!getToken();
    setAuthed(hasToken);
    if (!hasToken && !isLogin) {
      router.replace(`${ADMIN_ROUTE}/login`);
    }
  }, [isLogin, router]);

  function handleSidebarEnter() {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (collapsed && !pinned) setHoverExpanded(true);
  }

  function handleSidebarLeave() {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      setHoverExpanded(false);
      leaveTimer.current = null;
    }, 120);
  }

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

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
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        className={`fixed md:sticky top-0 left-0 h-screen shrink-0 z-50 md:z-auto flex flex-col justify-between p-4 md:p-6 overflow-hidden ${
          expanded ? "md:w-64" : "md:w-16"
        } w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: "#1a1a1a", color: "#fffdf5", ...SIDEBAR_TRANSITION }}
      >
        <div>
          <div className={`mb-8 flex items-center ${!expanded ? "justify-center" : "justify-between gap-2"}`}>
            {expanded ? (
              <a href={ADMIN_ROUTE} className="flex items-center gap-2.5 min-w-0">
                <span
                  className="inline-block w-9 h-9 rounded-lg shrink-0"
                >
                  <img
                    src="/logo/logo.png"
                    alt="Logo"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-lg object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <p
                    className={`font-mono text-[9px] uppercase tracking-[0.3em] mb-0.5 whitespace-nowrap animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_120ms_backwards]`}
                    style={{ color: "#d84315" }}
                  >
                    Admin
                  </p>
                  <h1
                    className={`font-black text-base tracking-[-0.02em] leading-[0.95] whitespace-nowrap animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_160ms_backwards]`}
                    style={{ color: "#fffdf5" }}
                  >
                    Portfolio
                    <span style={{ color: "#d84315" }}> Console</span>
                  </h1>
                </div>
              </a>
            ) : (
              <a
                href={ADMIN_ROUTE}
                title="Portfolio Admin"
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              >
                <img
                  src="/logo/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded object-contain"
                />
              </a>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  title={!expanded ? item.label : undefined}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    !expanded ? "md:justify-center" : ""
                  }`}
                  style={{
                    background: active ? "rgba(216, 67, 21, 0.18)" : "transparent",
                    color: active ? "#d84315" : "#fffdf5",
                    borderLeft: active ? "2px solid #d84315" : "2px solid transparent",
                    borderRight: "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "rgba(255, 253, 245, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon active={active} />
                  <span
                    className={`${LABEL_CLASS} ${
                      !expanded ? "md:hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          {expanded && (
            <a
              href="/"
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70 whitespace-nowrap animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_120ms_backwards]"
              style={{ color: "rgba(255, 253, 245, 0.6)" }}
            >
              <span>&larr;</span>
              <span>Back to Site</span>
            </a>
          )}
          <button
            onClick={() => {
              clearToken();
              router.push(`${ADMIN_ROUTE}/login`);
            }}
            title={!expanded ? "Logout" : undefined}
            className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70 text-left ${
              !expanded ? "md:justify-center" : ""
            } cursor-pointer`}
            style={{ color: "#d84315" }}
          >
            <LogoutIcon />
            <span className={`whitespace-nowrap ${LABEL_CLASS} ${!expanded ? "md:hidden" : ""}`}>Logout</span>
          </button>
          {expanded && (
            <p
              className="font-mono text-[9px] uppercase tracking-[0.3em] mt-2 pt-3 whitespace-nowrap animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_180ms_backwards]"
              style={{
                color: "rgba(255, 253, 245, 0.4)",
                borderTop: "1px solid rgba(255, 253, 245, 0.1)",
              }}
            >
              Lusan Sapkota
              <br />
              {new Date().getFullYear()}
            </p>
          )}
          {!expanded && (
            <button
              onClick={() => {
                setCollapsed(false);
                setPinned(false);
              }}
              title={pinned ? "Unpin and expand" : "Expand sidebar"}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-[rgba(255,253,245,0.1)] cursor-pointer mt-2 mx-auto"
              style={{ color: pinned ? "#d84315" : "rgba(255, 253, 245, 0.6)" }}
              aria-label={pinned ? "Unpin and expand" : "Expand sidebar"}
            >
              {pinned ? <PinFilledIcon /> : <ChevronRightIcon />}
            </button>
          )}
          {expanded && (
            <div
              className="flex items-center gap-1 mt-2 pt-3 animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_200ms_backwards]"
              style={{ borderTop: "1px solid rgba(255, 253, 245, 0.1)" }}
            >
              <button
                onClick={() => {
                  if (hoverExpanded) setHoverExpanded(false);
                  setPinned((p) => !p);
                  if (!pinned) setCollapsed(true);
                }}
                title={pinned ? "Unpin sidebar" : "Pin sidebar collapsed"}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[rgba(255,253,245,0.1)] cursor-pointer"
                style={{ color: pinned ? "#d84315" : "rgba(255, 253, 245, 0.7)" }}
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar collapsed"}
              >
                {pinned ? <PinFilledIcon /> : <PinIcon />}
              </button>
              <button
                onClick={() => {
                  if (hoverExpanded) setHoverExpanded(false);
                  setCollapsed(true);
                }}
                title="Collapse sidebar"
                className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[rgba(255,253,245,0.1)] cursor-pointer"
                style={{ color: "rgba(255, 253, 245, 0.7)" }}
                aria-label="Collapse sidebar"
              >
                <ChevronLeftIcon />
              </button>
              <span
                className="ml-auto font-mono text-[9px] uppercase tracking-[0.3em] animate-[fadeSlide_220ms_cubic-bezier(0.22,1,0.36,1)_240ms_backwards]"
                style={{ color: "rgba(255, 253, 245, 0.4)" }}
              >
                View
              </span>
            </div>
          )}
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ background: "#1a1a1a", color: "#fffdf5" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer"
            style={{ color: "#fffdf5" }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#d84315" }}>
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isActive(n.href) ? "#d84315" : "#fffdf5" }}
            >
              {n.label.split(" ")[0]}
            </a>
          ))}
          <button
            onClick={() => {
              clearToken();
              router.push(`${ADMIN_ROUTE}/login`);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] cursor-pointer"
            style={{ color: "#d84315" }}
          >
            Out
          </button>
        </div>
      </div>

      <main
        className={`flex-1 min-w-0 pt-14 md:pt-0 transition-[padding] duration-200 ease-out ${mainPad}`}
        style={{ background: "#fffdf5" }}
      >
        {children}
      </main>
    </div>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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

function ShieldIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  const color = active ? "#d84315" : "rgba(255, 253, 245, 0.85)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z" />
    </svg>
  );
}

function PinFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getToken, clearToken } from "@/app/lib/admin-api";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && !getToken()) {
      window.location.href = `${ADMIN_ROUTE}/login`;
    }
  }, [isLogin]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!getToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm font-mono transition-colors">
            &larr; Site
          </a>
          <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            Portfolio Admin
          </h1>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a href={ADMIN_ROUTE} className="text-zinc-400 hover:text-white transition-colors font-mono text-xs uppercase tracking-wider">
            Dashboard
          </a>
          <button
            onClick={() => { clearToken(); window.location.href = `${ADMIN_ROUTE}/login`; }}
            className="text-zinc-600 hover:text-red-400 transition-colors font-mono text-xs uppercase tracking-wider"
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

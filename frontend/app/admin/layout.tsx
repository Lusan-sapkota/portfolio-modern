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
            onClick={() => { clearToken(); router.push(`${ADMIN_ROUTE}/login`); }}
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

"use client";

import { useEffect, useState } from "react";
import { api, type DashboardStats } from "@/app/lib/admin-api";

const cardStyle: React.CSSProperties = {
  background: "#fffdf5",
  borderColor: "rgba(176, 125, 91, 0.2)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/dashboard/")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="font-mono text-sm mb-4" style={{ color: "var(--color-sienna)" }}>{error}</p>
          <p className="text-xs font-mono" style={{ color: "var(--color-ink-soft)" }}>
            Make sure the backend is running on port 8080
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-mono text-sm" style={{ color: "var(--color-ink-soft)" }}>Loading dashboard...</p>
      </div>
    );
  }

  const cards = [
    { label: "Projects", value: stats.projects },
    { label: "Categories", value: stats.categories },
    { label: "Skills", value: stats.skills },
    { label: "Experience", value: stats.experiences },
    { label: "Education", value: stats.education },
    { label: "Testimonials", value: stats.testimonials },
    { label: "Social Links", value: stats.social_links },
    { label: "Contacts", value: stats.contacts },
    { label: "Newsletter", value: stats.newsletter_active },
    { label: "Wiki Articles", value: stats.wiki_articles },
    { label: "Wiki Categories", value: stats.wiki_categories },
    { label: "Donation Projects", value: stats.donation_projects },
    { label: "Donations", value: stats.donations },
  ];

  const totals = [
    { label: "Total Donations (USD)", value: `$${stats.total_donations_usd.toFixed(2)}` },
    { label: "Total Donations (NPR)", value: `Rs.${stats.total_donations_npr.toFixed(2)}` },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--color-sienna)" }}>
          Overview
        </h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>Content statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-xl p-4 transition-colors" style={cardStyle}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--color-ink-soft)" }}>
              {c.label}
            </p>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--color-ink)" }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--color-sienna)" }}>
          Donations
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {totals.map((t) => (
          <div key={t.label} className="border rounded-xl p-4" style={cardStyle}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--color-ink-soft)" }}>
              {t.label}
            </p>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--color-ink)" }}>
              {t.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

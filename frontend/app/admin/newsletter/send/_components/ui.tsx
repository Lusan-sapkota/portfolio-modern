import type { CSSProperties } from "react";

export const INK = "#1a1a1a";
export const PAPER = "#fffdf5";
export const SIENNA = "#d84315";
export const INK_SOFT = "#6b5b54";
export const TEAL = "#006064";
export const YELLOW = "#f39c12";
export const WARM_YELLOW = "#ffd700";
export const CREAM = "#fff8e1";
export const BORDER = `2px solid ${INK}`;

export const selectClass =
  "w-full bg-transparent border-0 border-b-2 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer appearance-none";

export const selectStyle: CSSProperties = {
  borderColor: INK,
  color: INK,
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231a1a1a' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.25rem center",
  paddingRight: "1.5rem",
};

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: INK }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Pill({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: PAPER, border: `1px solid ${INK}33` }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: INK_SOFT }}>
        {label}
      </p>
      <p className="font-black text-2xl tabular-nums mt-1" style={{ color: INK }}>
        {value}
      </p>
    </div>
  );
}

export function extractTags(interests: Record<string, unknown> | null): string[] {
  if (!interests) return [];
  if (Array.isArray(interests)) return interests.map(String);
  if (typeof interests === "object") {
    const tags = (interests as Record<string, unknown>).tags;
    if (Array.isArray(tags)) return tags.map(String);
  }
  return [];
}

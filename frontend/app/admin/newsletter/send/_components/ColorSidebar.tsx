"use client";

import { INK, PAPER, INK_SOFT, BORDER } from "./ui";

const PALETTE: { name: string; hex: string; css: string; desc: string }[] = [
  { name: "Sienna", hex: "#d84315", css: "--color-sienna", desc: "Primary CTA, buttons, badges" },
  { name: "Yellow", hex: "#f39c12", css: "--primary-yellow", desc: "Brand accent, featured cards" },
  { name: "Warm Yellow", hex: "#ffd700", css: "--warm-yellow", desc: "Glow center, highlights" },
  { name: "Teal", hex: "#006064", css: "--color-teal", desc: "Secondary accent, links" },
  { name: "Teal Deep", hex: "#004d40", css: "--color-teal-deep", desc: "Dark accent" },
  { name: "Tan", hex: "#b07d5b", css: "--color-tan", desc: "Warm neutral" },
  { name: "Crimson", hex: "#b71c1c", css: "--color-crimson", desc: "Errors, warnings" },
  { name: "Espresso", hex: "#3e2723", css: "--color-espresso", desc: "Deep brown" },
  { name: "Cream", hex: "#fff8e1", css: "--color-cream", desc: "Soft background" },
  { name: "Ink", hex: "#1a1a1a", css: "--color-ink", desc: "Body text, borders" },
  { name: "Ink Soft", hex: "#6b5b54", css: "--ink-soft", desc: "Secondary text" },
  { name: "Paper", hex: "#fffdf5", css: "--color-paper", desc: "Page background" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ColorSidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-45" onClick={onClose} style={{ background: "transparent" }} />
      )}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-72 transition-transform duration-250 overflow-y-auto"
        style={{
          background: PAPER,
          borderLeft: BORDER,
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: BORDER }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>
            Color Palette
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer font-mono text-lg"
            style={{ background: INK, color: PAPER }}
          >
            x
          </button>
        </div>
        <div className="p-4 space-y-3">
          {PALETTE.map((c) => (
            <div
              key={c.name}
              className="rounded-xl p-3"
              style={{ background: PAPER, border: `1px solid ${INK}1a` }}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ background: c.hex, border: `1.5px solid ${INK}33` }}
                />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold truncate" style={{ color: INK }}>
                    {c.name}
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.1em]" style={{ color: INK_SOFT }}>
                    {c.hex}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono" style={{ color: INK_SOFT }}>
                <span className="px-1.5 py-0.5 rounded" style={{ background: `${INK}0d`, color: INK_SOFT }}>
                  {c.css}
                </span>
                <span className="truncate">{c.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4" style={{ borderTop: BORDER }}>
          <p className="font-mono text-[9px] leading-relaxed" style={{ color: INK_SOFT }}>
            Hex values for use in HTML email templates. Consistent with the main site palette defined in globals.css.
          </p>
        </div>
      </aside>
    </>
  );
}

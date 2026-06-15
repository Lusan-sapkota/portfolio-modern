"use client";

import { INK, PAPER, SIENNA, INK_SOFT, BORDER } from "./ui";

type Props = {
  subject: string;
  bodyHtml: string;
  previewing: boolean;
  previewHtml: string;
  onPreview: () => void;
};

export function PreviewPane({ subject, bodyHtml, previewing, previewHtml, onPreview }: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
          style={{ background: SIENNA, color: PAPER }}
        >
          Step 02
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
          Preview
        </p>
      </div>
      <button
        onClick={onPreview}
        disabled={previewing || !subject.trim() || !bodyHtml.trim()}
        className="w-full font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-4 rounded-full cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 mb-4"
        style={{ background: INK, color: PAPER }}
      >
        {previewing ? "Rendering..." : "Render preview"}
      </button>
      <div
        className="rounded-xl p-4 min-h-[280px] text-sm overflow-auto"
        style={{ background: PAPER, border: `1px solid ${INK}33`, color: INK, maxHeight: "500px" }}
        dangerouslySetInnerHTML={{
          __html:
            previewHtml ||
            `<p style="color:#6b5b54;font-style:italic">Preview will appear here once rendered.</p>`,
        }}
      />
    </div>
  );
}

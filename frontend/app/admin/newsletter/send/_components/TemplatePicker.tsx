"use client";

import { INK, PAPER, SIENNA, BORDER } from "./ui";
import { TEMPLATES, type Template } from "./templates";

type Props = {
  currentId: string;
  onSelect: (t: Template) => void;
};

export function TemplatePicker({ currentId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded-full cursor-pointer transition-transform hover:-translate-y-0.5"
          style={{
            background: currentId === t.id ? SIENNA : PAPER,
            color: currentId === t.id ? PAPER : INK,
            border: BORDER,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

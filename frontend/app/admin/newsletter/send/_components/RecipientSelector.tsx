"use client";

import { INK, PAPER, SIENNA, INK_SOFT, BORDER, selectClass, selectStyle, Field, extractTags } from "./ui";

type Subscriber = {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  interests: Record<string, unknown> | null;
};

type Stats = {
  total: number;
  active: number;
  inactive: number;
  interests: { tag: string; count: number }[];
};

type Filter = "active" | "all" | "by_interests" | "by_ids";

type Props = {
  filter: Filter;
  includeInactive: boolean;
  selectedInterests: string[];
  selectedIds: number[];
  search: string;
  recipientCount: number;
  stats: Stats | null;
  subscribers: Subscriber[];
  loadingSubs: boolean;
  onFilterChange: (v: Filter) => void;
  onIncludeInactive: (v: boolean) => void;
  onToggleTag: (tag: string) => void;
  onToggleId: (id: number) => void;
  onSearch: (q: string) => void;
};

export function RecipientSelector({
  filter,
  includeInactive,
  selectedInterests,
  selectedIds,
  search,
  recipientCount,
  stats,
  subscribers,
  loadingSubs,
  onFilterChange,
  onIncludeInactive,
  onToggleTag,
  onToggleId,
  onSearch,
}: Props) {
  return (
    <div
      className="rounded-2xl p-6 mb-8"
      style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold px-2 py-1 rounded"
          style={{ background: SIENNA, color: PAPER }}
        >
          Step 03
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
          Recipients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-5">
        <Field label="Filter">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as Filter)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="active">Active only</option>
            <option value="all">All (with inactive option)</option>
            <option value="by_interests">By interest tag</option>
            <option value="by_ids">Pick by hand</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] cursor-pointer select-none pb-3">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => onIncludeInactive(e.target.checked)}
            className="h-4 w-4 accent-sienna"
          />
          <span style={{ color: INK }}>Include inactive</span>
        </label>
        <div className="text-right text-xs font-mono" style={{ color: INK_SOFT }}>
          {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
        </div>
      </div>

      {filter === "by_interests" && (
        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: INK }}>
            Pick tags
          </p>
          {stats && stats.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.interests.map((t) => {
                const on = selectedInterests.includes(t.tag);
                return (
                  <button
                    key={t.tag}
                    onClick={() => onToggleTag(t.tag)}
                    className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full cursor-pointer"
                    style={{
                      background: on ? SIENNA : PAPER,
                      color: on ? PAPER : INK,
                      border: BORDER,
                    }}
                  >
                    <span>{t.tag}</span>
                    <span style={{ opacity: 0.7 }}>{t.count}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-mono" style={{ color: INK_SOFT }}>
              No tagged subscribers yet.
            </p>
          )}
        </div>
      )}

      {filter === "by_ids" && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: INK }}>
              Pick recipients
            </p>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="search email or name"
              className="flex-1 px-2 py-1 text-xs border-b focus:outline-none bg-transparent"
              style={{ borderColor: INK, color: INK }}
            />
          </div>
          <div className="rounded-xl max-h-72 overflow-y-auto" style={{ border: `1px solid ${INK}33` }}>
            {loadingSubs ? (
              <p className="p-3 text-xs font-mono" style={{ color: INK_SOFT }}>Loading...</p>
            ) : subscribers.length === 0 ? (
              <p className="p-3 text-xs font-mono" style={{ color: INK_SOFT }}>No subscribers.</p>
            ) : (
              subscribers.map((s) => {
                const on = selectedIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[rgba(216,67,21,0.04)]"
                    style={{ borderTop: `1px solid ${INK}11` }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onToggleId(s.id)}
                      className="h-4 w-4 accent-sienna"
                    />
                    <span className="font-mono text-xs flex-1 truncate" style={{ color: INK }}>
                      {s.email}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: INK_SOFT }}>
                      {s.name || "-"}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

import { proofHelperText } from "@/lib/platform-catalog";

type FixChecklistProps = {
  pagePath: string;
  pageTitle: string;
  breadcrumb: string;
  items: string[];
  initialChecked: number[];
};

export function FixChecklist({ pagePath, pageTitle, breadcrumb, items, initialChecked }: FixChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set(initialChecked));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The final row is the proof confirmation; everything persists to the
  // member's lesson_progress row in D1.
  const rows = [...items, "I saved proof for this section (screenshot, PDF, or record)."];
  const proofIndex = rows.length - 1;
  const proofSaved = checked.has(proofIndex);

  function toggle(index: number) {
    const next = new Set(checked);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setChecked(next);
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/member/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pagePath, pageTitle, breadcrumb, completedIndexes: [...next].sort((a, b) => a - b) }),
        });
        setSaveState(response.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, 500);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-vfText-strong">Action checklist</h2>
        <span className="text-xs font-bold text-vfText-muted" role="status">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Progress saved" : saveState === "error" ? "Couldn't save — check your connection and try again" : `${checked.size} of ${rows.length} checked`}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((item, index) => {
          const isChecked = checked.has(index);
          return (
            <label key={item} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${isChecked ? "border-ready-border bg-ready-surface" : "border-vfBorder bg-white hover:border-brand-blue"}`}>
              <input type="checkbox" checked={isChecked} onChange={() => toggle(index)} className="mt-0.5 size-5 shrink-0 accent-[#15803D]" />
              <span className={`text-sm font-bold leading-6 ${isChecked ? "text-ready" : "text-vfText-body"}`}>{item}</span>
            </label>
          );
        })}
      </div>
      {proofSaved ? (
        <div className="mt-4 rounded-2xl bg-ready-surface p-4 text-sm font-bold text-ready">Proof saved — you can move to the next section with confidence.</div>
      ) : (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-brand-blue">{proofHelperText}</div>
      )}
    </div>
  );
}

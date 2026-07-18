"use client";

import { useRef, useState } from "react";

type FixChecklistProps = {
  pagePath: string;
  pageTitle: string;
  breadcrumb: string;
  items: string[];
  proofItems?: string[];
  initialChecked: number[];
};

const privateProofHelperText = "Verge Five does not store your private documents. Keep EIN letters, bank statements, screenshots, PDFs, and other proof in your own private records. Check the proof items below only after you have saved them privately.";

export function FixChecklist({ pagePath, pageTitle, breadcrumb, items, proofItems = [], initialChecked }: FixChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set(initialChecked));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rows = [
    ...items.map((label) => ({ label, kind: "action" as const })),
    ...proofItems.map((label) => ({ label: `I saved this privately: ${label}`, kind: "proof" as const })),
  ];
  const proofStart = items.length;
  const proofTotal = proofItems.length;
  const proofSaved = proofItems.filter((_, index) => checked.has(proofStart + index)).length;

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
        <h2 className="font-display text-lg font-bold text-vfText-strong">Action and private proof checklist</h2>
        <span className="text-xs font-bold text-vfText-muted" role="status">
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Progress saved" : saveState === "error" ? "Couldn't save - check your connection and try again" : `${checked.size} of ${rows.length} checked`}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((item, index) => {
          const isChecked = checked.has(index);
          return (
            <label key={`${item.kind}-${item.label}`} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${isChecked ? "border-ready-border bg-ready-surface" : "border-vfBorder bg-white hover:border-brand-blue"}`}>
              <input type="checkbox" checked={isChecked} onChange={() => toggle(index)} className="mt-0.5 size-5 shrink-0 accent-[#15803D]" />
              <span className={`text-sm font-bold leading-6 ${isChecked ? "text-ready" : "text-vfText-body"}`}>
                {item.kind === "proof" ? <span className="mr-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-blue">Private proof</span> : null}
                {item.label}
              </span>
            </label>
          );
        })}
      </div>
      {proofTotal && proofSaved === proofTotal ? (
        <div className="mt-4 rounded-2xl bg-ready-surface p-4 text-sm font-bold text-ready">Private proof checklist complete. Verge Five stored only the checkmarks, not your documents.</div>
      ) : (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-brand-blue">
          {privateProofHelperText}
          {proofTotal ? <span className="mt-2 block text-ready">{proofSaved} of {proofTotal} private proof items checked.</span> : null}
        </div>
      )}
    </div>
  );
}

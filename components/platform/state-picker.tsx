"use client";

import { useState } from "react";

import { STATE_SITES } from "@/lib/state-sites";

export function StatePicker() {
  const [selected, setSelected] = useState("");
  const url = selected ? STATE_SITES[selected] : "";

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-vfText-strong">Find your state&apos;s official filing office</h2>
      <p className="mt-1 text-sm leading-6 text-vfText-body">Pick the state where the business is registered — always use the official Secretary of State site, never a lookalike filing service.</p>
      <label className="mt-4 block max-w-sm text-sm font-bold text-vfText-strong">
        State
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-vfBorder bg-white px-3 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select a state…</option>
          {Object.keys(STATE_SITES).map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </label>
      {selected ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-vfBorder bg-surface-muted p-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Official filing office</p>
            <p className="mt-1 font-display text-base font-bold text-vfText-strong">{selected} business entity search</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]">
            Open official site ↗
          </a>
        </div>
      ) : null}
    </div>
  );
}

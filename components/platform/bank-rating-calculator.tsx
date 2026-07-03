"use client";

import { useEffect, useState } from "react";

type RatingForm = { balance: string; age: string; deposits: string; nsf: string; review: string };
type RatingResult = { label: string; tone: "warn" | "mid" | "good"; text: string; tips: string[] };

const EMPTY_FORM: RatingForm = { balance: "", age: "", deposits: "", nsf: "", review: "" };
const STORAGE_KEY = "vf-bank-rating";

const FIELDS: { key: keyof RatingForm; label: string; options: [string, string][] }[] = [
  { key: "balance", label: "Average balance", options: [["u2500", "Under $2,500"], ["mid", "$2,500 – $9,999"], ["high", "$10,000 – $24,999"], ["top", "$25,000+"]] },
  { key: "age", label: "Account age", options: [["d30", "Under 30 days"], ["m1", "1 – 3 months"], ["m3", "3 – 6 months"], ["m6", "6 – 12 months"], ["y1", "Over a year"]] },
  { key: "deposits", label: "Monthly deposits", options: [["none", "No regular deposits"], ["some", "Some deposits"], ["steady", "Steady monthly deposits"], ["strong", "Strong, frequent deposits"]] },
  { key: "nsf", label: "NSF / overdrafts", options: [["none", "None"], ["past", "Some, over 90 days ago"], ["recent", "Recent NSF or overdrafts"]] },
];

function calcRating(form: RatingForm): RatingResult {
  if (!form.balance || !form.age) {
    return { label: "Add more detail", tone: "warn", text: "Select at least your current average balance and account age to calculate a status.", tips: [] };
  }
  let score = 0;
  score += ({ u2500: 0, mid: 1, high: 2, top: 3 } as Record<string, number>)[form.balance] ?? 0;
  score += ({ d30: 0, m1: 1, m3: 2, m6: 3, y1: 4 } as Record<string, number>)[form.age] ?? 0;
  score += ({ none: 0, some: 1, steady: 2, strong: 3 } as Record<string, number>)[form.deposits] ?? 0;
  if (form.nsf === "recent" || score <= 2) {
    return { label: "Build more history", tone: "warn", text: "Focus on a steady balance and clean activity before applying. Recent overdrafts or a thin balance will work against you.", tips: ["Grow and hold your average balance.", "Avoid NSF / overdrafts entirely.", "Give it at least 90 days of clean activity."] };
  }
  if (score <= 5) {
    return { label: "Getting close", tone: "mid", text: "You are building a usable banking foundation. Hold this pattern and set a review date before stronger credit requests.", tips: ["Keep deposits consistent.", "Aim for a low five-figure average balance.", "Set a next review date and recheck."] };
  }
  return { label: "Looks ready", tone: "good", text: "Your banking foundation looks strong enough to support stronger credit conversations. Save this result as proof you reviewed readiness.", tips: ["Maintain the balance and clean activity.", "Save a 90-day statement as proof.", "You can move toward vendor, card, and funding steps."] };
}

const toneStyles: Record<RatingResult["tone"], string> = {
  warn: "bg-unlock-surface text-unlock",
  mid: "bg-blue-50 text-brand-blue",
  good: "bg-ready-surface text-ready",
};

export function BankRatingCalculator() {
  const [form, setForm] = useState<RatingForm>(EMPTY_FORM);
  const [result, setResult] = useState<RatingResult | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.form) setForm({ ...EMPTY_FORM, ...saved.form });
      if (saved?.result) setResult(saved.result);
    } catch { /* fresh start */ }
  }, []);

  function update(key: keyof RatingForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function calculate() {
    const next = calcRating(form);
    setResult(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, result: next })); } catch { /* private mode */ }
  }

  function reset() {
    setForm(EMPTY_FORM);
    setResult(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-vfText-strong">Bank rating tracker</h2>
      <p className="mt-1 text-sm leading-6 text-vfText-body">Estimate where the banking signal stands today. This is a readiness guide, not a lender decision.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((field) => (
          <label key={field.key} className="text-sm font-bold text-vfText-strong">
            {field.label}
            <select
              value={form[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-vfBorder bg-white px-3 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select…</option>
              {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ))}
        <label className="text-sm font-bold text-vfText-strong">
          Next review date
          <input
            type="date"
            value={form.review}
            onChange={(event) => update("review", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-vfBorder bg-white px-3 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={calculate} className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]">Calculate status</button>
        <button type="button" onClick={reset} className="rounded-xl border border-vfBorder bg-white px-5 py-2.5 text-sm font-bold text-vfText-body transition hover:border-brand-blue">Reset</button>
      </div>
      <div className="mt-4 rounded-2xl border border-vfBorder bg-surface-muted p-5">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${result ? toneStyles[result.tone] : "bg-[#EEF1F6] text-vfText-body"}`}>{result?.label ?? "Not calculated"}</span>
        <p className="mt-3 text-sm leading-6 text-vfText-body">{result?.text ?? "This will show whether the business should wait, build more bank history, or prepare for stronger credit conversations."}</p>
        {(result?.tips.length ? result.tips : ["Average balance matters.", "Clean account handling matters.", "Account age and deposits matter."]).map((tip) => (
          <p key={tip} className="mt-2 text-sm font-bold text-vfText-strong">• {tip}</p>
        ))}
      </div>
    </div>
  );
}

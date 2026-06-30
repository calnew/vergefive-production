"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

type ReportActionsProps = {
  reportText: string;
  reportHtml: string;
  readinessStage: string;
  snapshot: Record<string, unknown>;
};

export function ReportDownloadButton({ reportText, reportHtml, readinessStage, snapshot }: ReportActionsProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function downloadText() {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "verge-five-readiness-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadHtml() {
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "verge-five-member-progress-report.html";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const win = window.open("", "vf-progress-report", "width=900,height=920");
    if (!win) {
      setMessage("Popup was blocked. Use Download HTML instead.");
      return;
    }
    win.document.open();
    win.document.write(reportHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  async function saveSnapshot() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/member/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportType: "readiness-report-card", readinessStage, summary: snapshot }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save report snapshot.");
      setMessage("Report snapshot saved to the live backend.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save report snapshot.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Button type="button" onClick={printReport}>Print report</Button>
      <Button type="button" variant="outline" onClick={downloadHtml}>Download HTML</Button>
      <Button type="button" variant="outline" onClick={downloadText}>Download text</Button>
      <Button type="button" variant="outline" onClick={saveSnapshot} disabled={saving}>{saving ? "Saving..." : "Save snapshot"}</Button>
      {message ? <p className="sm:col-span-2 lg:col-span-4 rounded-xl bg-surface-muted p-3 text-sm font-bold text-vfText-body">{message}</p> : null}
    </div>
  );
}
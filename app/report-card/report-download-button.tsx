"use client";

import { Button } from "@/components/ui";

export function ReportDownloadButton({ report }: { report: string }) {
  function download() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "verge-five-readiness-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <Button onClick={download}>Download report</Button>;
}

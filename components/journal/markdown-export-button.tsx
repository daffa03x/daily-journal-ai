"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { splitTags } from "@/lib/journal";

type MarkdownExportButtonProps = {
  title: string;
  content: string;
  mood: string;
  moodScore: number;
  journalDate: string;
  tags?: string | null;
  aiSummary?: string | null;
  sentimentLabel?: string | null;
  sentimentScore?: number | null;
  keywords?: string | null;
};

function getMarkdown(entry: MarkdownExportButtonProps) {
  const tags = splitTags(entry.tags);
  const lines = [
    `# ${entry.title}`,
    "",
    `Tanggal: ${entry.journalDate}`,
    `Mood: ${entry.mood} (${entry.moodScore})`,
    tags.length > 0 ? `Tags: ${tags.join(", ")}` : null,
    "",
    entry.content,
  ].filter(Boolean);

  if (entry.aiSummary) {
    lines.push(
      "",
      "## Ringkasan AI",
      "",
      entry.aiSummary,
      "",
      `Sentiment: ${entry.sentimentLabel ?? "-"}${
        typeof entry.sentimentScore === "number"
          ? ` (${entry.sentimentScore.toFixed(2)})`
          : ""
      }`,
      entry.keywords ? `Keywords: ${entry.keywords}` : "",
    );
  }

  return lines.join("\n");
}

function getFileName(entry: MarkdownExportButtonProps) {
  const date = entry.journalDate;
  const safeTitle = entry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${date}-${safeTitle || "journal"}.md`;
}

export function MarkdownExportButton(entry: MarkdownExportButtonProps) {
  return (
    <Button
      onClick={() => {
        const blob = new Blob([getMarkdown(entry)], {
          type: "text/markdown;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = getFileName(entry);
        link.click();
        URL.revokeObjectURL(url);

        window.dispatchEvent(
          new CustomEvent("journal-toast", {
            detail: {
              message: "Export Markdown siap diunduh.",
              variant: "success",
            },
          }),
        );
      }}
      type="button"
      variant="outline"
    >
      <Download data-icon="inline-start" aria-hidden="true" />
      Export MD
    </Button>
  );
}

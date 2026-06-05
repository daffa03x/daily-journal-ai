import type { JournalEntry } from "@prisma/client";
import Link from "next/link";

import { AiSummaryCard } from "@/components/ai/ai-summary-card";
import { DeleteEntryForm } from "@/components/journal/delete-entry-form";
import { MarkdownExportButton } from "@/components/journal/markdown-export-button";
import { MarkdownContent } from "@/components/journal/markdown-content";
import { buttonVariants } from "@/components/ui/button";
import { splitTags } from "@/lib/journal";

type JournalDetailProps = {
  entry: JournalEntry;
};

export function JournalDetail({ entry }: JournalDetailProps) {
  const tags = splitTags(entry.tags);

  return (
    <article className="space-y-8">
      <header className="space-y-4 border-b pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {entry.journalDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {entry.title}
            </h1>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">
            {entry.mood} / {entry.moodScore}
          </div>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <MarkdownContent content={entry.content} />

      <AiSummaryCard
        entryId={entry.id}
        keywords={entry.keywords}
        sentimentLabel={entry.sentimentLabel}
        sentimentScore={entry.sentimentScore}
        summary={entry.aiSummary}
      />

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Link className={buttonVariants({ variant: "outline" })} href="/journal">
          Kembali
        </Link>
        <Link className={buttonVariants()} href={`/journal/${entry.id}/edit`}>
          Edit
        </Link>
        <MarkdownExportButton
          aiSummary={entry.aiSummary}
          content={entry.content}
          journalDate={entry.journalDate.toISOString().slice(0, 10)}
          keywords={entry.keywords}
          mood={entry.mood}
          moodScore={entry.moodScore}
          sentimentLabel={entry.sentimentLabel}
          sentimentScore={entry.sentimentScore}
          tags={entry.tags}
          title={entry.title}
        />
        <DeleteEntryForm entryId={entry.id} />
      </div>
    </article>
  );
}

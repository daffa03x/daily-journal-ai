import type { JournalEntry } from "@prisma/client";
import Link from "next/link";

import { splitTags } from "@/lib/journal";

type JournalCardProps = {
  entry: JournalEntry;
};

export function JournalCard({ entry }: JournalCardProps) {
  const tags = splitTags(entry.tags);

  return (
    <article className="rounded-lg border bg-card p-5 transition hover:border-ring/60">
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
          <h2 className="text-lg font-semibold">
            <Link href={`/journal/${entry.id}`}>{entry.title}</Link>
          </h2>
          <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {entry.content}
          </p>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">
          {entry.mood} / {entry.moodScore}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
    </article>
  );
}

import type { JournalEntry } from "@prisma/client";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MOOD_OPTIONS } from "@/lib/constants";

type RecentEntriesProps = {
  entries: JournalEntry[];
};

function getMoodLabel(mood: JournalEntry["mood"]) {
  return MOOD_OPTIONS.find((option) => option.value === mood)?.label ?? mood;
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Entry terbaru</h2>
          <p className="text-sm text-muted-foreground">
            Lima catatan terakhir untuk kembali refleksi dengan cepat.
          </p>
        </div>
        <Link className={buttonVariants({ variant: "outline" })} href="/journal">
          Lihat semua
        </Link>
      </div>

      {entries.length > 0 ? (
        <div className="mt-5 divide-y">
          {entries.map((entry) => (
            <article
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              key={entry.id}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {entry.journalDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="font-medium">
                  <Link href={`/journal/${entry.id}`}>{entry.title}</Link>
                </h3>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {entry.aiSummary ?? entry.content}
                </p>
              </div>
              <span className="inline-flex w-fit shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {getMoodLabel(entry.mood)} / {entry.moodScore}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada entry. Mulai dari satu catatan singkat hari ini.
          </p>
          <Link className={buttonVariants({ className: "mt-4" })} href="/journal/new">
            Tulis Entry
          </Link>
        </div>
      )}
    </section>
  );
}

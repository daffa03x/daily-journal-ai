import Link from "next/link";

import { JournalEditor } from "@/components/journal/journal-editor";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

export default async function NewJournalPage() {
  await requireUser();

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Entry baru</p>
            <h1 className="text-2xl font-semibold">Tulis Journal Hari Ini</h1>
          </div>
          <Link className={buttonVariants({ variant: "outline" })} href="/journal">
            Batal
          </Link>
        </header>

        <section className="rounded-lg border bg-card p-6">
          <JournalEditor />
        </section>
      </div>
    </main>
  );
}

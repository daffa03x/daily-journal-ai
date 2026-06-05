import Link from "next/link";
import { notFound } from "next/navigation";

import { JournalEditor } from "@/components/journal/journal-editor";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditJournalPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditJournalPage({ params }: EditJournalPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const entry = await prisma.journalEntry.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!entry) {
    notFound();
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Edit entry</p>
            <h1 className="text-2xl font-semibold">{entry.title}</h1>
          </div>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/journal/${entry.id}`}
          >
            Batal
          </Link>
        </header>

        <section className="rounded-lg border bg-card p-6">
          <JournalEditor entry={entry} />
        </section>
      </div>
    </main>
  );
}

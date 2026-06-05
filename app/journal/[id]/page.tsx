import { notFound } from "next/navigation";

import { JournalDetail } from "@/components/journal/journal-detail";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type JournalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JournalDetailPage({
  params,
}: JournalDetailPageProps) {
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
      <div className="mx-auto max-w-4xl">
        <JournalDetail entry={entry} />
      </div>
    </main>
  );
}

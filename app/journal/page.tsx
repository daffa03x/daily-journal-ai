import Link from "next/link";

import { JournalCard } from "@/components/journal/journal-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MOOD_OPTIONS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { buildJournalWhere } from "@/lib/journal";
import { prisma } from "@/lib/prisma";
import { journalListQuerySchema } from "@/lib/validators";

type JournalPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const parsed = journalListQuerySchema.safeParse({
    page: getParam(params, "page"),
    limit: getParam(params, "limit"),
    mood: getParam(params, "mood") || undefined,
    startDate: getParam(params, "startDate") || undefined,
    endDate: getParam(params, "endDate") || undefined,
    search: getParam(params, "search") || undefined,
    tag: getParam(params, "tag") || undefined,
  });
  const query = parsed.success
    ? parsed.data
    : journalListQuerySchema.parse({});
  const where = buildJournalWhere(user.id, query);
  const skip = (query.page - 1) * query.limit;
  const [entries, total, tagRows] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: [{ journalDate: "desc" }, { createdAt: "desc" }],
      skip,
      take: query.limit,
    }),
    prisma.journalEntry.count({ where }),
    prisma.journalEntry.findMany({
      where: {
        userId: user.id,
        tags: {
          not: null,
        },
      },
      select: {
        tags: true,
      },
      take: 200,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const tagOptions = [
    ...new Set(
      tagRows.flatMap((entry) =>
        (entry.tags ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ),
  ].slice(0, 12);
  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const nextParams = new URLSearchParams();
    const values = {
      page: query.page,
      mood: query.mood,
      startDate: query.startDate,
      endDate: query.endDate,
      search: query.search,
      tag: query.tag,
      ...overrides,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        nextParams.set(key, String(value));
      }
    }

    return `/journal?${nextParams.toString()}`;
  };

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <h1 className="text-2xl font-semibold">Journal</h1>
          </div>
          <Link className={buttonVariants({ className: "sm:hidden" })} href="/journal/new">
            Entry Baru
          </Link>
        </header>

        <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_150px_130px_130px_130px_auto]">
          <input
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={query.search}
            name="search"
            placeholder="Cari judul atau isi..."
          />
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={query.mood ?? ""}
            name="mood"
          >
            <option value="">Semua mood</option>
            {MOOD_OPTIONS.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
          <input
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={query.tag}
            name="tag"
            placeholder="Tag"
          />
          <input
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={query.startDate?.slice(0, 10)}
            name="startDate"
            type="date"
          />
          <input
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={query.endDate?.slice(0, 10)}
            name="endDate"
            type="date"
          />
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>

        {tagOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <Link
                className={
                  query.tag === tag
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-muted"
                }
                href={buildHref({ page: 1, tag })}
                key={tag}
              >
                {tag}
              </Link>
            ))}
            {query.tag ? (
              <Link
                className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                href={buildHref({ page: 1, tag: undefined })}
              >
                Reset tag
              </Link>
            ) : null}
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalCard entry={entry} key={entry.id} />
            ))}
          </div>
        ) : (
          <section className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-lg font-medium">Belum ada entry</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Mulai tulis journal pertama kamu, lalu data mood dan ringkasan AI
              akan muncul di fase berikutnya.
            </p>
            <Link className={buttonVariants({ className: "mt-5" })} href="/journal/new">
              Tulis Entry
            </Link>
          </section>
        )}

        <nav className="flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">
            Halaman {query.page} dari {totalPages} - {total} entry
          </span>
          <div className="flex gap-2">
            <Link
              aria-disabled={query.page <= 1}
              className={buttonVariants({
                variant: "outline",
                className:
                  query.page <= 1 ? "pointer-events-none opacity-50" : "",
              })}
              href={buildHref({ page: Math.max(1, query.page - 1) })}
            >
              Sebelumnya
            </Link>
            <Link
              aria-disabled={query.page >= totalPages}
              className={buttonVariants({
                variant: "outline",
                className:
                  query.page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "",
              })}
              href={buildHref({ page: Math.min(totalPages, query.page + 1) })}
            >
              Berikutnya
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

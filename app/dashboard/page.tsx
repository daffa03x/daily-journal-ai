import Link from "next/link";

import { MoodChart } from "@/components/dashboard/mood-chart";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { requireUser } from "@/lib/auth";
import { getDashboardMoodChart } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { dashboardMoodChartQuerySchema } from "@/lib/validators";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const RANGE_OPTIONS = [7, 14, 30] as const;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const parsed = dashboardMoodChartQuerySchema.safeParse({
    days: getParam(params, "days"),
  });
  const query = parsed.success
    ? parsed.data
    : dashboardMoodChartQuerySchema.parse({});
  const [dashboardData, recentEntries] = await Promise.all([
    getDashboardMoodChart(user.id, query.days),
    prisma.journalEntry.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ journalDate: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Halo, {user.name ?? user.email}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau kebiasaan menulis, perubahan mood, dan entry terbaru dari
              journal pribadimu.
            </p>
          </div>
        </header>

        <StatsCards summary={dashboardData.summary} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Tren mood</h2>
                <p className="text-sm text-muted-foreground">
                  Hari tanpa entry dibiarkan kosong agar grafik tidak
                  memalsukan data.
                </p>
              </div>

              <nav className="flex rounded-lg border bg-background p-1">
                {RANGE_OPTIONS.map((days) => (
                  <Link
                    className={
                      query.days === days
                        ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                        : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                    href={`/dashboard?days=${days}`}
                    key={days}
                  >
                    {days} hari
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              <MoodChart data={dashboardData.data} />
            </div>
          </section>

          <StreakCounter streak={dashboardData.summary.streak} />
        </div>

        <RecentEntries entries={recentEntries} />
      </div>
    </main>
  );
}

import { BookOpenText, CalendarDays, TrendingUp, Trophy } from "lucide-react";

import { formatMoodName, type DashboardSummary } from "@/lib/dashboard";

type StatsCardsProps = {
  summary: DashboardSummary;
};

const numberFormat = new Intl.NumberFormat("id-ID");

export function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      label: "Total entry",
      value: numberFormat.format(summary.totalEntries),
      helper: "Semua journal yang tersimpan",
      icon: BookOpenText,
      tone: "text-sky-700 bg-sky-50 border-sky-100",
    },
    {
      label: "Bulan ini",
      value: numberFormat.format(summary.entriesThisMonth),
      helper: "Entry pada bulan berjalan",
      icon: CalendarDays,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Rata-rata mood",
      value: summary.avgMood === null ? "-" : summary.avgMood.toFixed(1),
      helper: "Dari rentang grafik aktif",
      icon: TrendingUp,
      tone: "text-violet-700 bg-violet-50 border-violet-100",
    },
    {
      label: "Mood dominan",
      value: formatMoodName(summary.dominantMood),
      helper: "Mood paling sering di rentang ini",
      icon: Trophy,
      tone: "text-amber-700 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="rounded-lg border bg-card p-4" key={stat.label}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="truncate text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg border p-2 ${stat.tone}`}>
                <Icon className="size-4" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {stat.helper}
            </p>
          </article>
        );
      })}
    </section>
  );
}

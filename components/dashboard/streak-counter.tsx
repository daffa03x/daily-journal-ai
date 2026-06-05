import { Flame, PenLine } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

type StreakCounterProps = {
  streak: number;
};

export function StreakCounter({ streak }: StreakCounterProps) {
  const activeDays = Math.min(streak, 7);

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Writing streak</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            {streak} hari
          </h2>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-700">
          <Flame className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            className={
              index < activeDays
                ? "h-2 rounded-full bg-emerald-500"
                : "h-2 rounded-full bg-muted"
            }
            key={index}
          />
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Streak dihitung dari tanggal journal yang berurutan, bukan waktu entry
        dibuat.
      </p>

      <Link className={buttonVariants({ className: "mt-5" })} href="/journal/new">
        <PenLine data-icon="inline-start" aria-hidden="true" />
        Tulis hari ini
      </Link>
    </section>
  );
}

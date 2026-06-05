import {
  BarChart3,
  BookOpen,
  Brain,
  Lock,
  LogIn,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const features = [
  {
    title: "Jurnal pribadi",
    description: "Entry tersimpan per akun dengan batas privasi yang jelas.",
    icon: BookOpen,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    title: "Mood harian",
    description: "Lima mood konsisten untuk membaca perubahan emosi.",
    icon: TrendingUp,
    accent: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    title: "Insight AI",
    description: "Gemini merangkum isi jurnal, sentiment, dan keywords.",
    icon: Brain,
    accent: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
  },
  {
    title: "Grafik mingguan",
    description: "Dashboard menampilkan tren mood, streak, dan entry terbaru.",
    icon: BarChart3,
    accent: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  },
] as const;

const moodBars = [
  { label: "Sen", height: "h-16", color: "bg-emerald-500" },
  { label: "Sel", height: "h-10", color: "bg-amber-500" },
  { label: "Rab", height: "h-12", color: "bg-orange-500" },
  { label: "Kam", height: "h-20", color: "bg-violet-500" },
  { label: "Jum", height: "h-14", color: "bg-sky-500" },
] as const;

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <section className="relative min-h-dvh border-b bg-[linear-gradient(180deg,var(--background),var(--muted))]">
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden opacity-45 dark:opacity-25"
        >
          <div className="absolute left-1/2 top-24 w-[min(1040px,92vw)] -translate-x-1/2 rounded-lg border bg-card p-4 shadow-sm md:top-16">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-2">
                <div className="h-2 w-32 rounded-sm bg-foreground/20" />
                <div className="h-2 w-52 rounded-sm bg-foreground/10" />
              </div>
              <div className="h-8 w-24 rounded-md bg-foreground/10" />
            </div>
            <div className="grid gap-4 pt-4 md:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-4 flex items-end gap-3">
                  {moodBars.map((bar) => (
                    <div
                      className="flex flex-1 flex-col items-center gap-2"
                      key={bar.label}
                    >
                      <div
                        className={cn(
                          "w-full max-w-14 rounded-t-md",
                          bar.height,
                          bar.color,
                        )}
                      />
                      <div className="h-2 w-7 rounded-sm bg-foreground/10" />
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border bg-card p-3">
                    <div className="h-2 w-16 rounded-sm bg-foreground/10" />
                    <div className="mt-3 h-5 w-20 rounded-sm bg-foreground/20" />
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <div className="h-2 w-16 rounded-sm bg-foreground/10" />
                    <div className="mt-3 h-5 w-24 rounded-sm bg-foreground/20" />
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <div className="h-2 w-16 rounded-sm bg-foreground/10" />
                    <div className="mt-3 h-5 w-14 rounded-sm bg-foreground/20" />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-4 h-3 w-28 rounded-sm bg-foreground/20" />
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <div className="h-2 w-20 rounded-sm bg-foreground/20" />
                    <div className="mt-3 h-2 w-full rounded-sm bg-foreground/10" />
                    <div className="mt-2 h-2 w-4/5 rounded-sm bg-foreground/10" />
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="h-2 w-24 rounded-sm bg-foreground/20" />
                    <div className="mt-3 h-2 w-full rounded-sm bg-foreground/10" />
                    <div className="mt-2 h-2 w-2/3 rounded-sm bg-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-8">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <PenLine className="size-4" aria-hidden="true" />
            </span>
            Daily Journal
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/login"
            >
              <LogIn data-icon="inline-start" aria-hidden="true" />
              Masuk
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-88px)] w-full max-w-6xl flex-col justify-end px-4 pb-8 pt-16 md:px-8 md:pb-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-background/85 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-violet-600" aria-hidden="true" />
              Jurnal harian privat dengan insight AI
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Daily Journal + Mood Tracker
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Ruang pribadi untuk menulis harian, mencatat mood, dan memahami
              pola emosi lewat ringkasan AI.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonVariants({
                  className: "h-11 px-4 text-base",
                })}
                href="/register"
              >
                <PenLine data-icon="inline-start" aria-hidden="true" />
                Mulai menulis
              </Link>
              <Link
                className={buttonVariants({
                  className: "h-11 px-4 text-base",
                  variant: "outline",
                })}
                href="/login"
              >
                <LogIn data-icon="inline-start" aria-hidden="true" />
                Masuk
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                className="rounded-lg border bg-background/90 p-4 shadow-sm backdrop-blur"
                key={feature.title}
              >
                <div
                  className={cn(
                    "mb-4 flex size-9 items-center justify-center rounded-lg border",
                    feature.accent,
                  )}
                >
                  <feature.icon className="size-4" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 flex max-w-2xl items-start gap-2 text-sm leading-6 text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Tulisanmu hanya ditampilkan untuk akunmu. Analisis AI diproses dari
            server.
          </p>
        </div>
      </section>
    </main>
  );
}

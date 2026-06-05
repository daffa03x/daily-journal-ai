"use client";

import { LogOut, PenLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";

const ROUTE_TITLES = [
  {
    match: (pathname: string) => pathname === "/dashboard",
    title: "Dashboard",
    description: "Ringkasan mood, streak, dan entry terbaru.",
  },
  {
    match: (pathname: string) => pathname === "/journal/new",
    title: "Entry Baru",
    description: "Tulis refleksi harian dengan ruang yang tenang.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/journal"),
    title: "Journal",
    description: "Kelola catatan pribadi dan hasil analisis AI.",
  },
] as const;

export function Header() {
  const pathname = usePathname();
  const route =
    ROUTE_TITLES.find((item) => item.match(pathname)) ?? ROUTE_TITLES[0];

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold md:text-base">
            {route.title}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {route.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            className={buttonVariants({
              className: "hidden sm:inline-flex",
            })}
            href="/journal/new"
          >
            <PenLine data-icon="inline-start" aria-hidden="true" />
            Entry Baru
          </Link>
          <ThemeToggle />
          <form action={logoutUser}>
            <Button aria-label="Keluar" size="icon" title="Keluar" type="submit" variant="outline">
              <LogOut aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

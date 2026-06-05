"use client";

import { BarChart3, BookOpenText, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    label: "Journal",
    href: "/journal",
    icon: BookOpenText,
    match: (pathname: string) =>
      pathname === "/journal" ||
      (pathname.startsWith("/journal/") && pathname !== "/journal/new"),
  },
  {
    label: "Entry Baru",
    href: "/journal/new",
    icon: PenLine,
    match: (pathname: string) => pathname === "/journal/new",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <Link className="flex h-16 items-center gap-3 border-b px-5" href="/dashboard">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            Daily Journal
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Mood Tracker
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);

          return (
            <Link
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs leading-5 text-muted-foreground">
        Ruang privat untuk menulis, mengenali mood, dan melihat pola emosimu
        dari waktu ke waktu.
      </div>
    </aside>
  );
}

export { NAV_ITEMS };

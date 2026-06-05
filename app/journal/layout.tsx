import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";

export default async function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return <AppShell>{children}</AppShell>;
}

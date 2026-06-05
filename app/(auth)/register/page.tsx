import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Buat Akun Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            Simpan tulisan harian secara privat dan mulai lihat pola mood.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const initialState = {
  errors: {},
  message: undefined,
};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Nama
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        {state.errors?.name ? (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        {state.errors?.email ? (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        {state.errors?.password ? (
          <p className="text-sm text-destructive">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Membuat akun..." : "Daftar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link className="font-medium text-foreground underline" href="/login">
          Masuk
        </Link>
      </p>
    </form>
  );
}

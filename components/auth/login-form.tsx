"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const initialState = {
  errors: {},
  message: undefined,
};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initialState);

  return (
    <form action={action} className="space-y-5">
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
          autoComplete="current-password"
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
        {pending ? "Memproses..." : "Masuk"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link className="font-medium text-foreground underline" href="/register">
          Daftar
        </Link>
      </p>
    </form>
  );
}

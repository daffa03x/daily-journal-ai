"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

const QUERY_TOASTS: Record<string, Omit<ToastItem, "id">> = {
  "journal-created": {
    message: "Entry berhasil disimpan.",
    variant: "success",
  },
  "journal-updated": {
    message: "Perubahan entry berhasil disimpan.",
    variant: "success",
  },
  "journal-deleted": {
    message: "Entry berhasil dihapus.",
    variant: "success",
  },
};

function getIcon(variant: ToastVariant) {
  if (variant === "success") {
    return CheckCircle2;
  }

  if (variant === "error") {
    return XCircle;
  }

  return Info;
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryToast = searchParams.get("toast");
  const toastFromQuery = queryToast ? QUERY_TOASTS[queryToast] : undefined;

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<Omit<ToastItem, "id">>).detail;

      if (!detail?.message) {
        return;
      }

      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...detail, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3600);
    }

    window.addEventListener("journal-toast", handleToast);

    return () => {
      window.removeEventListener("journal-toast", handleToast);
    };
  }, []);

  useEffect(() => {
    if (!toastFromQuery) {
      return;
    }

    const id = crypto.randomUUID();
    const showTimeout = window.setTimeout(() => {
      setToasts((current) => [...current, { ...toastFromQuery, id }]);
    }, 0);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    const nextUrl = nextParams.size
      ? `${pathname}?${nextParams.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });

    const hideTimeout = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [pathname, router, searchParams, toastFromQuery]);

  const renderedToasts = useMemo(() => toasts.slice(-3), [toasts]);

  if (renderedToasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {renderedToasts.map((toast) => {
        const Icon = getIcon(toast.variant);

        return (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg",
              toast.variant === "success" && "border-emerald-200",
              toast.variant === "error" && "border-destructive/30",
            )}
            key={toast.id}
            role="status"
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                toast.variant === "success" && "text-emerald-600",
                toast.variant === "error" && "text-destructive",
                toast.variant === "info" && "text-sky-600",
              )}
              aria-hidden="true"
            />
            <p className="leading-6">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}

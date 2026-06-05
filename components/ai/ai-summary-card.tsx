"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  generateAiSummary,
  type AiSummaryActionState,
} from "@/actions/ai";
import { SentimentBadge } from "@/components/ai/sentiment-badge";
import { Button } from "@/components/ui/button";

type AiSummaryCardProps = {
  entryId: string;
  summary?: string | null;
  sentimentLabel?: string | null;
  sentimentScore?: number | null;
  keywords?: string | null;
};

const initialState: AiSummaryActionState = {
  status: "idle",
};

function splitKeywords(keywords?: string | null) {
  if (!keywords) {
    return [];
  }

  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function AiSummaryCard({
  entryId,
  summary,
  sentimentLabel,
  sentimentScore,
  keywords,
}: AiSummaryCardProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    generateAiSummary,
    initialState,
  );
  const parsedKeywords = splitKeywords(keywords);
  const hasAnalysis = Boolean(summary);

  useEffect(() => {
    if (state.status === "success") {
      window.dispatchEvent(
        new CustomEvent("journal-toast", {
          detail: {
            message: state.message ?? "Analisis AI berhasil disimpan.",
            variant: "success",
          },
        }),
      );
      router.refresh();
    }
  }, [router, state.message, state.status]);

  useEffect(() => {
    if (state.status === "error" && state.message) {
      window.dispatchEvent(
        new CustomEvent("journal-toast", {
          detail: {
            message: state.message,
            variant: "error",
          },
        }),
      );
    }
  }, [state.message, state.status]);

  return (
    <section className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-violet-600" aria-hidden="true" />
            Ringkasan AI
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasAnalysis
              ? "Analisis tersimpan untuk membantu refleksi entry ini."
              : "Belum ada analisis AI untuk entry ini."}
          </p>
        </div>

        <form action={formAction}>
          <input name="entryId" type="hidden" value={entryId} />
          <Button
            disabled={pending}
            size="sm"
            type="submit"
            variant={hasAnalysis ? "outline" : "default"}
          >
            <RefreshCw
              className={pending ? "animate-spin" : ""}
              data-icon="inline-start"
              aria-hidden="true"
            />
            {pending
              ? "Memproses"
              : hasAnalysis
                ? "Analisis ulang"
                : "Buat analisis"}
          </Button>
        </form>
      </div>

      {hasAnalysis ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-7 text-foreground">{summary}</p>

          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge label={sentimentLabel} score={sentimentScore} />
            {parsedKeywords.map((keyword) => (
              <span
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                key={keyword}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Entry utama sudah aman tersimpan. Jika Gemini gagal, kamu tetap bisa
          menekan tombol ini lagi tanpa mengubah isi journal.
        </p>
      )}

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "mt-4 text-sm text-destructive"
              : "mt-4 text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}

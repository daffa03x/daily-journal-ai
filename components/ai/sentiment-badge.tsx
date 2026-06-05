import { cn } from "@/lib/utils";

type SentimentBadgeProps = {
  label?: string | null;
  score?: number | null;
};

const SENTIMENT_COPY = {
  positive: "Positif",
  neutral: "Netral",
  negative: "Negatif",
} as const;

const SENTIMENT_CLASSES = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-yellow-200 bg-yellow-50 text-yellow-700",
  negative: "border-red-200 bg-red-50 text-red-700",
} as const;

function isKnownSentiment(
  label?: string | null,
): label is keyof typeof SENTIMENT_COPY {
  return label === "positive" || label === "neutral" || label === "negative";
}

export function SentimentBadge({ label, score }: SentimentBadgeProps) {
  const sentiment = isKnownSentiment(label) ? label : "neutral";
  const formattedScore =
    typeof score === "number" ? ` (${score.toFixed(2)})` : "";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        SENTIMENT_CLASSES[sentiment],
      )}
    >
      {SENTIMENT_COPY[sentiment]}
      {formattedScore}
    </span>
  );
}

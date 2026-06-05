import type { Mood } from "@prisma/client";

import { MOOD_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MoodSelectorProps = {
  defaultValue?: Mood;
  error?: string;
};

const moodStyles: Record<Mood, string> = {
  TERRIBLE: "peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-700",
  BAD: "peer-checked:border-orange-400 peer-checked:bg-orange-50 peer-checked:text-orange-700",
  NEUTRAL: "peer-checked:border-yellow-400 peer-checked:bg-yellow-50 peer-checked:text-yellow-800",
  GOOD: "peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:text-emerald-700",
  AMAZING: "peer-checked:border-violet-400 peer-checked:bg-violet-50 peer-checked:text-violet-700",
};

const moodIcon: Record<Mood, string> = {
  TERRIBLE: ":(",
  BAD: ":/",
  NEUTRAL: ":|",
  GOOD: ":)",
  AMAZING: ":D",
};

export function MoodSelector({ defaultValue, error }: MoodSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Bagaimana perasaanmu?</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {MOOD_OPTIONS.map((mood) => (
          <label key={mood.value} className="relative">
            <input
              className="peer sr-only"
              defaultChecked={defaultValue === mood.value}
              name="mood"
              required
              type="radio"
              value={mood.value}
            />
            <span
              className={cn(
                "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-background px-3 py-4 text-center text-sm transition hover:bg-muted",
                moodStyles[mood.value],
              )}
            >
              <span className="font-mono text-xl">{moodIcon[mood.value]}</span>
              <span className="font-medium">{mood.label}</span>
              <span className="text-xs text-muted-foreground">
                Skor {mood.score}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}

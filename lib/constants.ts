import type { Mood } from "@prisma/client";

export const MOOD_SCORES = {
  TERRIBLE: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  AMAZING: 5,
} as const satisfies Record<Mood, number>;

export const MOOD_OPTIONS = [
  {
    value: "TERRIBLE",
    label: "Sangat buruk",
    score: MOOD_SCORES.TERRIBLE,
    color: "red",
  },
  {
    value: "BAD",
    label: "Buruk",
    score: MOOD_SCORES.BAD,
    color: "orange",
  },
  {
    value: "NEUTRAL",
    label: "Biasa saja",
    score: MOOD_SCORES.NEUTRAL,
    color: "yellow",
  },
  {
    value: "GOOD",
    label: "Baik",
    score: MOOD_SCORES.GOOD,
    color: "emerald",
  },
  {
    value: "AMAZING",
    label: "Luar biasa",
    score: MOOD_SCORES.AMAZING,
    color: "violet",
  },
] as const satisfies Array<{
  value: Mood;
  label: string;
  score: number;
  color: string;
}>;

export const MOOD_VALUES = [
  "TERRIBLE",
  "BAD",
  "NEUTRAL",
  "GOOD",
  "AMAZING",
] as const satisfies readonly [Mood, ...Mood[]];

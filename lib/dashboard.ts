import "server-only";

import type { Mood } from "@prisma/client";

import { MOOD_OPTIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type MoodChartPoint = {
  date: string;
  label: string;
  avgMood: number | null;
  entries: number;
};

export type DashboardSummary = {
  avgMood: number | null;
  totalEntries: number;
  entriesThisMonth: number;
  streak: number;
  dominantMood: Mood | null;
};

export type DashboardMoodChartResponse = {
  data: MoodChartPoint[];
  summary: DashboardSummary;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addDaysToKey(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));

  return [
    next.getUTCFullYear(),
    pad(next.getUTCMonth() + 1),
    pad(next.getUTCDate()),
  ].join("-");
}

function formatChartLabel(dateKey: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(dateFromKey(dateKey));
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function getMoodLabel(mood: Mood | null) {
  return MOOD_OPTIONS.find((option) => option.value === mood)?.label ?? null;
}

function calculateStreak(journalDates: Date[], todayKey: string) {
  const dateKeys = new Set(journalDates.map((date) => date.toISOString().slice(0, 10)));
  let cursorKey = dateKeys.has(todayKey) ? todayKey : addDaysToKey(todayKey, -1);
  let streak = 0;

  while (dateKeys.has(cursorKey)) {
    streak += 1;
    cursorKey = addDaysToKey(cursorKey, -1);
  }

  return streak;
}

export function formatMoodName(mood: Mood | null) {
  return getMoodLabel(mood) ?? "Belum ada";
}

export async function getDashboardMoodChart(
  userId: string,
  days = 7,
): Promise<DashboardMoodChartResponse> {
  const safeDays = Math.min(Math.max(days, 1), 90);
  const todayKey = getLocalDateKey(new Date());
  const startKey = addDaysToKey(todayKey, -(safeDays - 1));
  const [year, month] = todayKey.split("-").map(Number);
  const monthStart = dateFromKey(`${year}-${pad(month)}-01`);
  const nextMonthStart = new Date(Date.UTC(year, month, 1));

  const dateKeys = Array.from({ length: safeDays }, (_, index) =>
    addDaysToKey(startKey, index),
  );
  const startDate = dateFromKey(startKey);
  const endDateExclusive = dateFromKey(addDaysToKey(todayKey, 1));

  const [rangeEntries, totalEntries, entriesThisMonth, streakEntries] =
    await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          userId,
          journalDate: {
            gte: startDate,
            lt: endDateExclusive,
          },
        },
        select: {
          journalDate: true,
          mood: true,
          moodScore: true,
        },
      }),
      prisma.journalEntry.count({
        where: {
          userId,
        },
      }),
      prisma.journalEntry.count({
        where: {
          userId,
          journalDate: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
      }),
      prisma.journalEntry.findMany({
        where: {
          userId,
          journalDate: {
            lt: endDateExclusive,
          },
        },
        orderBy: {
          journalDate: "desc",
        },
        select: {
          journalDate: true,
        },
      }),
    ]);

  const bucketByDate = new Map<
    string,
    { entries: number; moodScoreSum: number }
  >();
  const moodCounts = new Map<Mood, number>();
  let moodScoreSum = 0;
  let moodScoreCount = 0;

  for (const entry of rangeEntries) {
    const dateKey = entry.journalDate.toISOString().slice(0, 10);
    const bucket = bucketByDate.get(dateKey) ?? {
      entries: 0,
      moodScoreSum: 0,
    };

    bucket.entries += 1;
    bucket.moodScoreSum += entry.moodScore;
    bucketByDate.set(dateKey, bucket);
    moodCounts.set(entry.mood, (moodCounts.get(entry.mood) ?? 0) + 1);
    moodScoreSum += entry.moodScore;
    moodScoreCount += 1;
  }

  const data = dateKeys.map((dateKey) => {
    const bucket = bucketByDate.get(dateKey);

    return {
      date: dateKey,
      label: formatChartLabel(dateKey),
      avgMood: bucket ? roundOneDecimal(bucket.moodScoreSum / bucket.entries) : null,
      entries: bucket?.entries ?? 0,
    };
  });
  const dominantMood =
    [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    data,
    summary: {
      avgMood:
        moodScoreCount > 0 ? roundOneDecimal(moodScoreSum / moodScoreCount) : null,
      totalEntries,
      entriesThisMonth,
      streak: calculateStreak(
        streakEntries.map((entry) => entry.journalDate),
        todayKey,
      ),
      dominantMood,
    },
  };
}

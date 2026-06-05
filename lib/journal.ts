import type { Prisma } from "@prisma/client";

import { MOOD_SCORES } from "@/lib/constants";
import type { CreateEntryInput, JournalListQuery } from "@/lib/validators";

export function getMoodScore(mood: CreateEntryInput["mood"]) {
  return MOOD_SCORES[mood];
}

export function parseJournalDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  return new Date(value);
}

export function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function normalizeTags(tags?: string | null) {
  if (!tags) {
    return null;
  }

  const normalized = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(",");

  return normalized || null;
}

export function splitTags(tags?: string | null) {
  if (!tags) {
    return [];
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function buildJournalWhere(userId: string, query: JournalListQuery) {
  const where: Prisma.JournalEntryWhereInput = {
    userId,
  };

  if (query.mood) {
    where.mood = query.mood;
  }

  if (query.startDate || query.endDate) {
    where.journalDate = {
      ...(query.startDate ? { gte: parseJournalDate(query.startDate) } : {}),
      ...(query.endDate ? { lte: parseJournalDate(query.endDate) } : {}),
    };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { content: { contains: query.search } },
    ];
  }

  if (query.tag) {
    where.tags = {
      contains: query.tag,
    };
  }

  return where;
}

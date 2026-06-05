import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateAndSaveJournalAnalysis } from "@/lib/ai-journal";
import {
  buildJournalWhere,
  getMoodScore,
  normalizeTags,
  parseJournalDate,
} from "@/lib/journal";
import { prisma } from "@/lib/prisma";
import { createEntrySchema, journalListQuerySchema } from "@/lib/validators";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = journalListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    mood: searchParams.get("mood") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const where = buildJournalWhere(userId, parsed.data);
  const skip = (parsed.data.page - 1) * parsed.data.limit;
  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: [{ journalDate: "desc" }, { createdAt: "desc" }],
      skip,
      take: parsed.data.limit,
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return NextResponse.json({
    entries,
    pagination: {
      total,
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalPages: Math.ceil(total / parsed.data.limit),
    },
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const entry = await prisma.journalEntry.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      mood: parsed.data.mood,
      moodScore: getMoodScore(parsed.data.mood),
      tags: normalizeTags(parsed.data.tags),
      journalDate: parseJournalDate(parsed.data.journalDate),
      userId,
    },
  });

  const analysis = await generateAndSaveJournalAnalysis({
    entryId: entry.id,
    userId,
  }).catch(() => null);

  if (analysis) {
    const analyzedEntry = await prisma.journalEntry.findUnique({
      where: {
        id: entry.id,
      },
    });

    return NextResponse.json(analyzedEntry ?? entry, { status: 201 });
  }

  return NextResponse.json(entry, { status: 201 });
}

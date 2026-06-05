import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getMoodScore,
  normalizeTags,
  parseJournalDate,
} from "@/lib/journal";
import { prisma } from "@/lib/prisma";
import { updateEntrySchema } from "@/lib/validators";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const entry = await prisma.journalEntry.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateEntrySchema.safeParse({
    ...(body ?? {}),
    id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existingEntry = await prisma.journalEntry.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!existingEntry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentChanged =
    parsed.data.content !== undefined &&
    parsed.data.content !== existingEntry.content;

  const entry = await prisma.journalEntry.update({
    where: {
      id: existingEntry.id,
    },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      mood: parsed.data.mood,
      moodScore: parsed.data.mood ? getMoodScore(parsed.data.mood) : undefined,
      tags: parsed.data.tags === undefined ? undefined : normalizeTags(parsed.data.tags),
      journalDate: parsed.data.journalDate
        ? parseJournalDate(parsed.data.journalDate)
        : undefined,
      aiSummary: contentChanged ? null : undefined,
      sentimentScore: contentChanged ? null : undefined,
      sentimentLabel: contentChanged ? null : undefined,
      keywords: contentChanged ? null : undefined,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await prisma.journalEntry.deleteMany({
    where: {
      id,
      userId,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

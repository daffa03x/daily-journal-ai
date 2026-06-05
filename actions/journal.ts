"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateAndSaveJournalAnalysis } from "@/lib/ai-journal";
import { requireUser } from "@/lib/auth";
import {
  getMoodScore,
  normalizeTags,
  parseJournalDate,
} from "@/lib/journal";
import { prisma } from "@/lib/prisma";
import { createEntrySchema, updateEntrySchema } from "@/lib/validators";

type JournalActionState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createJournalEntry(
  _state: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const user = await requireUser();
  const parsed = createEntrySchema.safeParse({
    title: getFormValue(formData, "title"),
    content: getFormValue(formData, "content"),
    mood: getFormValue(formData, "mood"),
    tags: getFormValue(formData, "tags"),
    journalDate: getFormValue(formData, "journalDate"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const entry = await prisma.journalEntry.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      mood: parsed.data.mood,
      moodScore: getMoodScore(parsed.data.mood),
      tags: normalizeTags(parsed.data.tags),
      journalDate: parseJournalDate(parsed.data.journalDate),
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  await generateAndSaveJournalAnalysis({
    entryId: entry.id,
    userId: user.id,
  }).catch(() => undefined);

  revalidatePath("/journal");
  revalidatePath(`/journal/${entry.id}`);
  revalidatePath("/dashboard");
  redirect(`/journal/${entry.id}?toast=journal-created`);
}

export async function updateJournalEntry(
  _state: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const user = await requireUser();
  const parsed = updateEntrySchema.safeParse({
    id: getFormValue(formData, "id"),
    title: getFormValue(formData, "title"),
    content: getFormValue(formData, "content"),
    mood: getFormValue(formData, "mood"),
    tags: getFormValue(formData, "tags"),
    journalDate: getFormValue(formData, "journalDate"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingEntry = await prisma.journalEntry.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!existingEntry) {
    return {
      message: "Entry tidak ditemukan",
    };
  }

  const contentChanged =
    parsed.data.content !== undefined &&
    parsed.data.content !== existingEntry.content;

  await prisma.journalEntry.update({
    where: {
      id: existingEntry.id,
    },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      mood: parsed.data.mood,
      moodScore: parsed.data.mood ? getMoodScore(parsed.data.mood) : undefined,
      tags: normalizeTags(parsed.data.tags),
      journalDate: parsed.data.journalDate
        ? parseJournalDate(parsed.data.journalDate)
        : undefined,
      aiSummary: contentChanged ? null : undefined,
      sentimentScore: contentChanged ? null : undefined,
      sentimentLabel: contentChanged ? null : undefined,
      keywords: contentChanged ? null : undefined,
    },
  });

  revalidatePath("/journal");
  revalidatePath(`/journal/${existingEntry.id}`);
  revalidatePath("/dashboard");
  redirect(`/journal/${existingEntry.id}?toast=journal-updated`);
}

export async function deleteJournalEntry(formData: FormData) {
  const user = await requireUser();
  const id = getFormValue(formData, "id");

  if (!id) {
    return;
  }

  await prisma.journalEntry.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  redirect("/journal?toast=journal-deleted");
}

"use client";

import type { Mood } from "@prisma/client";
import { useActionState } from "react";

import {
  createJournalEntry,
  updateJournalEntry,
} from "@/actions/journal";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/journal/mood-selector";
import { formatDateInput } from "@/lib/journal";

type JournalEditorProps = {
  entry?: {
    id: string;
    title: string;
    content: string;
    mood: Mood;
    tags: string | null;
    journalDate: Date;
  };
};

const initialState = {
  errors: {},
  message: undefined,
};

export function JournalEditor({ entry }: JournalEditorProps) {
  const action = entry ? updateJournalEntry : createJournalEntry;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {entry ? <input name="id" type="hidden" value={entry.id} /> : null}

      <MoodSelector
        defaultValue={entry?.mood}
        error={state.errors?.mood?.[0]}
      />

      <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Judul
          </label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={entry?.title}
            id="title"
            maxLength={200}
            name="title"
            placeholder="Hari yang produktif"
            required
          />
          {state.errors?.title ? (
            <p className="text-sm text-destructive">{state.errors.title[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="journalDate">
            Tanggal
          </label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={
              entry ? formatDateInput(entry.journalDate) : formatDateInput(new Date())
            }
            id="journalDate"
            name="journalDate"
            required
            type="date"
          />
          {state.errors?.journalDate ? (
            <p className="text-sm text-destructive">
              {state.errors.journalDate[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="content">
          Cerita hari ini
        </label>
        <textarea
          className="min-h-72 w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm leading-6 outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          defaultValue={entry?.content}
          id="content"
          maxLength={10000}
          name="content"
          placeholder="Tulis apa yang terjadi, apa yang kamu rasakan, dan hal kecil yang ingin kamu ingat..."
          required
        />
        {state.errors?.content ? (
          <p className="text-sm text-destructive">{state.errors.content[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="tags">
          Tags
        </label>
        <input
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          defaultValue={entry?.tags ?? ""}
          id="tags"
          maxLength={500}
          name="tags"
          placeholder="kerja, keluarga, olahraga"
        />
        {state.errors?.tags ? (
          <p className="text-sm text-destructive">{state.errors.tags[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending
          ? "Menyimpan..."
          : entry
            ? "Simpan Perubahan"
            : "Simpan Journal"}
      </Button>
    </form>
  );
}

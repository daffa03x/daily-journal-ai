"use client";

import { Trash2 } from "lucide-react";

import { deleteJournalEntry } from "@/actions/journal";
import { Button } from "@/components/ui/button";

type DeleteEntryFormProps = {
  entryId: string;
};

export function DeleteEntryForm({ entryId }: DeleteEntryFormProps) {
  return (
    <form
      action={deleteJournalEntry}
      onSubmit={(event) => {
        if (!window.confirm("Hapus entry ini? Tindakan ini tidak bisa dibatalkan.")) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={entryId} />
      <Button type="submit" variant="destructive">
        <Trash2 data-icon="inline-start" aria-hidden="true" />
        Hapus
      </Button>
    </form>
  );
}

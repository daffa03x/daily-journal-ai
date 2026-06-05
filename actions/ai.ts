"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { generateAndSaveJournalAnalysis } from "@/lib/ai-journal";
import { getAiErrorMessage } from "@/lib/ai-safety";
import { aiSummarizeRequestSchema } from "@/lib/validators";

export type AiSummaryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function generateAiSummary(
  _state: AiSummaryActionState,
  formData: FormData,
): Promise<AiSummaryActionState> {
  const user = await requireUser();
  const parsed = aiSummarizeRequestSchema.safeParse({
    entryId: formData.get("entryId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Entry tidak valid untuk dianalisis.",
    };
  }

  try {
    await generateAndSaveJournalAnalysis({
      entryId: parsed.data.entryId,
      userId: user.id,
    });
  } catch (error) {
    return {
      status: "error",
      message: getAiErrorMessage(error),
    };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${parsed.data.entryId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Analisis AI berhasil disimpan.",
  };
}

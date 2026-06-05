import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateAndSaveJournalAnalysis } from "@/lib/ai-journal";
import {
  AiContentTooLargeError,
  AiRateLimitError,
  getAiErrorMessage,
} from "@/lib/ai-safety";
import { aiSummarizeRequestSchema } from "@/lib/validators";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = aiSummarizeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const analysis = await generateAndSaveJournalAnalysis({
      entryId: parsed.data.entryId,
      userId,
    });

    revalidatePath("/journal");
    revalidatePath(`/journal/${parsed.data.entryId}`);
    revalidatePath("/dashboard");

    return NextResponse.json({
      entryId: parsed.data.entryId,
      analysis,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Journal entry not found"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (error instanceof AiRateLimitError) {
      return NextResponse.json(
        { error: getAiErrorMessage(error) },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    if (error instanceof AiContentTooLargeError) {
      return NextResponse.json(
        { error: getAiErrorMessage(error) },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { error: getAiErrorMessage(error) },
      { status: 502 },
    );
  }
}

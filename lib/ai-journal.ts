import "server-only";

import { analyzeJournalEntry } from "@/lib/ai";
import {
  AI_ANALYSIS_MAX_CONTENT_CHARS,
  AI_ANALYSIS_RATE_LIMIT,
  AiContentTooLargeError,
  AiRateLimitError,
} from "@/lib/ai-safety";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

type GenerateAndSaveJournalAnalysisInput = {
  entryId: string;
  userId: string;
};

export async function generateAndSaveJournalAnalysis({
  entryId,
  userId,
}: GenerateAndSaveJournalAnalysisInput) {
  const entry = await prisma.journalEntry.findFirst({
    where: {
      id: entryId,
      userId,
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!entry) {
    throw new Error("Journal entry not found");
  }

  if (entry.content.length > AI_ANALYSIS_MAX_CONTENT_CHARS) {
    throw new AiContentTooLargeError(
      AI_ANALYSIS_MAX_CONTENT_CHARS,
      entry.content.length,
    );
  }

  const rateLimit = checkRateLimit(`ai-analysis:${userId}`, {
    limit: AI_ANALYSIS_RATE_LIMIT.limit,
    windowMs: AI_ANALYSIS_RATE_LIMIT.windowMs,
  });

  if (!rateLimit.allowed) {
    throw new AiRateLimitError(rateLimit.retryAfterSeconds);
  }

  const analysis = await analyzeJournalEntry(entry.content);

  await prisma.journalEntry.update({
    where: {
      id: entry.id,
    },
    data: {
      aiSummary: analysis.summary,
      sentimentScore: analysis.sentimentScore,
      sentimentLabel: analysis.sentimentLabel,
      keywords: analysis.keywords.join(","),
    },
  });

  return analysis;
}

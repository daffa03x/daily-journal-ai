import "server-only";

import { GoogleGenAI } from "@google/genai";

import { aiAnalysisSchema, type AiAnalysis } from "@/lib/validators";

const GEMINI_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.API_KEY_GEMINI;

  if (!apiKey) {
    throw new Error("API_KEY_GEMINI is not configured");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function normalizeAiPayload(value: unknown) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const payload = value as Record<string, unknown>;

  return {
    summary: payload.summary,
    sentimentScore:
      typeof payload.sentimentScore === "number"
        ? payload.sentimentScore
        : Number(payload.sentimentScore),
    sentimentLabel:
      typeof payload.sentimentLabel === "string"
        ? payload.sentimentLabel.toLowerCase()
        : payload.sentimentLabel,
    keywords: Array.isArray(payload.keywords)
      ? payload.keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
      : payload.keywords,
  };
}

export async function analyzeJournalEntry(content: string): Promise<AiAnalysis> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      "Analisis journal pribadi berikut untuk membantu refleksi diri.",
      "Balas dengan JSON valid saja, tanpa markdown, tanpa penjelasan tambahan.",
      "Gunakan bahasa ringkasan yang sama dengan bahasa entry.",
      "Format wajib:",
      '{"summary":"2-3 kalimat ringkas","sentimentScore":0,"sentimentLabel":"positive|neutral|negative","keywords":["tema 1","tema 2","tema 3"]}',
      "Aturan sentimentScore: angka -1.0 sampai 1.0.",
      "Aturan keywords: 3-5 tema penting, singkat, tidak duplikat.",
      "",
      "Entry journal:",
      content,
    ].join("\n"),
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsedJson = JSON.parse(extractJson(text));
  const parsed = aiAnalysisSchema.safeParse(normalizeAiPayload(parsedJson));

  if (!parsed.success) {
    throw new Error("Gemini returned an invalid analysis payload");
  }

  return parsed.data;
}

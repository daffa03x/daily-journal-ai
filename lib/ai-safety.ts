import "server-only";

export const AI_ANALYSIS_RATE_LIMIT = {
  limit: 10,
  windowMs: 60 * 60 * 1000,
} as const;

export const AI_ANALYSIS_MAX_CONTENT_CHARS = 6000;

export class AiRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("AI analysis rate limit exceeded");
    this.name = "AiRateLimitError";
  }
}

export class AiContentTooLargeError extends Error {
  constructor(
    public readonly maxChars: number,
    public readonly actualChars: number,
  ) {
    super("AI analysis content is too large");
    this.name = "AiContentTooLargeError";
  }
}

export function getAiErrorMessage(error: unknown) {
  if (error instanceof AiRateLimitError) {
    return `Batas analisis AI tercapai. Coba lagi sekitar ${Math.max(
      1,
      Math.ceil(error.retryAfterSeconds / 60),
    )} menit lagi.`;
  }

  if (error instanceof AiContentTooLargeError) {
    return `Entry terlalu panjang untuk analisis AI otomatis. Batas saat ini ${error.maxChars} karakter.`;
  }

  if (error instanceof Error && error.message.includes("API_KEY_GEMINI")) {
    return "Key Gemini belum dikonfigurasi. Tambahkan key di environment server lalu coba lagi.";
  }

  return "Analisis AI gagal dibuat. Coba ulang beberapa saat lagi.";
}

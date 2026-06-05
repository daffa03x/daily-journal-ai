import { z } from "zod";

import { MOOD_VALUES } from "@/lib/constants";

const dateStringSchema = z.string().refine(
  (value) => {
    const timestamp = Date.parse(value);
    return !Number.isNaN(timestamp);
  },
  {
    message: "Tanggal journal tidak valid",
  },
);

export const sentimentLabelSchema = z.enum([
  "positive",
  "neutral",
  "negative",
]);

export const createEntrySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .trim()
    .min(1, "Konten wajib diisi")
    .max(10000, "Konten maksimal 10000 karakter"),
  mood: z.enum(MOOD_VALUES, {
    message: "Pilih mood yang valid",
  }),
  tags: z
    .string()
    .trim()
    .max(500, "Tags maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  journalDate: dateStringSchema,
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.email("Email tidak valid").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
});

export const loginSchema = z.object({
  email: z.email("Email tidak valid").trim().toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const updateEntrySchema = createEntrySchema.partial().extend({
  id: z.string().min(1, "ID entry wajib diisi"),
});

export const journalListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  mood: z.enum(MOOD_VALUES).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  search: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(80).optional(),
});

export const dashboardMoodChartQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .catch(7)
    .transform((days) => Math.min(Math.max(days, 1), 90)),
});

export const aiSummarizeRequestSchema = z.object({
  entryId: z.string().trim().min(1, "ID entry wajib diisi"),
});

export const aiAnalysisSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  sentimentScore: z.number().min(-1).max(1),
  sentimentLabel: sentimentLabelSchema,
  keywords: z.array(z.string().trim().min(1).max(50)).min(1).max(5),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type JournalListQuery = z.infer<typeof journalListQuerySchema>;
export type DashboardMoodChartQuery = z.infer<
  typeof dashboardMoodChartQuerySchema
>;
export type AiSummarizeRequest = z.infer<typeof aiSummarizeRequestSchema>;
export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

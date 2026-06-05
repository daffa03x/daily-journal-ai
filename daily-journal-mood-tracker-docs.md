# Daily Journal + Mood Tracker — Implementation Plan & Documentation

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · SQLite · Anthropic Claude API  
> **Tujuan:** Aplikasi journaling harian dengan mood tracking, AI-powered summary, dan visualisasi emosi mingguan.

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Browser)               │
│  Next.js App Router + React Server Components    │
│  Tailwind CSS + shadcn/ui                        │
├─────────────────────────────────────────────────┤
│                  NEXT.JS SERVER                  │
│  API Routes (Route Handlers)                     │
│  Server Actions                                  │
│  Middleware (Auth)                                │
├─────────────────────────────────────────────────┤
│              DATA & SERVICES LAYER               │
│  Prisma ORM ──► SQLite (dev) / PostgreSQL (prod) │
│  Anthropic Claude API (AI Summary & Sentiment)   │
└─────────────────────────────────────────────────┘
```

### Alur Data Utama

1. User menulis journal entry + memilih mood → disimpan via Server Action ke database
2. Setelah entry tersimpan, trigger AI summary & sentiment analysis via Claude API
3. Hasil AI disimpan kembali ke database (field `aiSummary`, `sentimentScore`)
4. Dashboard menampilkan grafik emosi mingguan dari data yang telah diproses

---

## 2. Struktur Folder Proyek

```
daily-journal/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (opsional)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, ThemeProvider)
│   │   ├── page.tsx           # Landing / redirect ke dashboard
│   │   ├── globals.css        # Tailwind directives + CSS variables
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Dashboard utama (mood chart + recent entries)
│   │   │   └── loading.tsx    # Skeleton loading
│   │   │
│   │   ├── journal/
│   │   │   ├── page.tsx       # List semua entries
│   │   │   ├── new/page.tsx   # Form buat entry baru
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Detail entry + AI summary
│   │   │       └── edit/page.tsx
│   │   │
│   │   └── api/
│   │       ├── journal/
│   │       │   ├── route.ts          # GET (list), POST (create)
│   │       │   └── [id]/route.ts     # GET, PUT, DELETE single entry
│   │       ├── ai/
│   │       │   └── summarize/route.ts # AI summary endpoint
│   │       └── auth/
│   │           └── [...nextauth]/route.ts
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (auto-generated)
│   │   ├── journal/
│   │   │   ├── journal-editor.tsx     # Rich text / markdown editor
│   │   │   ├── journal-card.tsx       # Card preview di list
│   │   │   ├── journal-detail.tsx     # Full entry view
│   │   │   └── mood-selector.tsx      # Mood picker (emoji-based)
│   │   ├── dashboard/
│   │   │   ├── mood-chart.tsx         # Grafik emosi mingguan (Recharts)
│   │   │   ├── streak-counter.tsx     # Writing streak
│   │   │   └── stats-cards.tsx        # Summary statistics
│   │   ├── ai/
│   │   │   ├── ai-summary-card.tsx    # Display AI summary
│   │   │   └── sentiment-badge.tsx    # Sentiment indicator
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── theme-toggle.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── ai.ts              # Claude API wrapper
│   │   ├── utils.ts           # shadcn/ui cn() utility
│   │   └── validators.ts     # Zod schemas
│   │
│   ├── actions/
│   │   ├── journal.ts         # Server Actions: create, update, delete
│   │   └── ai.ts              # Server Actions: generate summary
│   │
│   ├── hooks/
│   │   ├── use-journal.ts     # Custom hook untuk journal operations
│   │   └── use-mood-data.ts   # Custom hook untuk chart data
│   │
│   └── types/
│       └── index.ts           # TypeScript type definitions
│
├── public/
│   └── icons/                 # Mood emoji SVGs
│
├── .env.local                 # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json            # shadcn/ui config
└── package.json
```

---

## 3. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"       // Ganti "postgresql" untuk production
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  passwordHash  String
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  entries       JournalEntry[]
}

model JournalEntry {
  id              String    @id @default(cuid())
  title           String
  content         String    // Markdown / plain text
  mood            Mood
  moodScore       Int       // 1-5 numeric mapping
  tags            String?   // Comma-separated tags

  // AI-generated fields
  aiSummary       String?
  sentimentScore  Float?    // -1.0 (sangat negatif) to 1.0 (sangat positif)
  sentimentLabel  String?   // "positive", "neutral", "negative"
  keywords        String?   // AI-extracted keywords, comma-separated

  // Relations
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timestamps
  journalDate     DateTime  @default(now())  // Tanggal entry (bisa beda dari createdAt)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, journalDate])
  @@index([userId, mood])
}

enum Mood {
  TERRIBLE    // 😢 Score: 1
  BAD         // 😟 Score: 2
  NEUTRAL     // 😐 Score: 3
  GOOD        // 😊 Score: 4
  AMAZING     // 🤩 Score: 5
}
```

### Mapping Mood ke Score

| Mood     | Emoji | Score | Warna (Tailwind)     |
|----------|-------|-------|----------------------|
| TERRIBLE | 😢    | 1     | `red-500`            |
| BAD      | 😟    | 2     | `orange-400`         |
| NEUTRAL  | 😐    | 3     | `yellow-400`         |
| GOOD     | 😊    | 4     | `emerald-400`        |
| AMAZING  | 🤩    | 5     | `violet-500`         |

---

## 4. API Design

### 4.1 Journal API Routes

#### `GET /api/journal`

Query Parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `mood` (filter by mood)
- `startDate`, `endDate` (date range)
- `search` (full-text search pada title/content)

Response:
```json
{
  "entries": [
    {
      "id": "clx...",
      "title": "Hari yang Produktif",
      "content": "Hari ini saya berhasil...",
      "mood": "GOOD",
      "moodScore": 4,
      "aiSummary": "User had a productive day...",
      "sentimentScore": 0.78,
      "sentimentLabel": "positive",
      "journalDate": "2026-05-25T00:00:00.000Z",
      "createdAt": "2026-05-25T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### `POST /api/journal`

Request Body:
```json
{
  "title": "Hari yang Produktif",
  "content": "Hari ini saya berhasil menyelesaikan...",
  "mood": "GOOD",
  "tags": "kerja,produktif",
  "journalDate": "2026-05-25"
}
```

#### `GET /api/journal/[id]`
#### `PUT /api/journal/[id]`
#### `DELETE /api/journal/[id]`

### 4.2 AI Summary Endpoint

#### `POST /api/ai/summarize`

Request Body:
```json
{
  "entryId": "clx...",
  "content": "Hari ini saya merasa sangat senang karena..."
}
```

Response:
```json
{
  "summary": "Pengguna mengalami hari yang positif...",
  "sentimentScore": 0.85,
  "sentimentLabel": "positive",
  "keywords": ["senang", "produktif", "teman"]
}
```

### 4.3 Dashboard Data

#### `GET /api/dashboard/mood-chart`

Query: `?days=7` (default 7, max 90)

Response:
```json
{
  "data": [
    { "date": "2026-05-19", "avgMood": 3.5, "entries": 2 },
    { "date": "2026-05-20", "avgMood": 4.0, "entries": 1 },
    { "date": "2026-05-21", "avgMood": null, "entries": 0 }
  ],
  "summary": {
    "avgMood": 3.8,
    "totalEntries": 12,
    "streak": 5,
    "dominantMood": "GOOD"
  }
}
```

---

## 5. Implementasi Komponen Utama

### 5.1 Mood Selector Component

```tsx
// src/components/journal/mood-selector.tsx
"use client";

import { cn } from "@/lib/utils";
import { Mood } from "@prisma/client";

const MOODS = [
  { value: "TERRIBLE" as Mood, emoji: "😢", label: "Terrible", color: "bg-red-100 border-red-400 text-red-700" },
  { value: "BAD" as Mood, emoji: "😟", label: "Bad", color: "bg-orange-100 border-orange-400 text-orange-700" },
  { value: "NEUTRAL" as Mood, emoji: "😐", label: "Neutral", color: "bg-yellow-100 border-yellow-400 text-yellow-700" },
  { value: "GOOD" as Mood, emoji: "😊", label: "Good", color: "bg-emerald-100 border-emerald-400 text-emerald-700" },
  { value: "AMAZING" as Mood, emoji: "🤩", label: "Amazing", color: "bg-violet-100 border-violet-400 text-violet-700" },
];

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-3">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all",
            "hover:scale-110 hover:shadow-md",
            value === mood.value ? mood.color : "border-transparent bg-muted/50"
          )}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
```

### 5.2 Journal Editor (Form)

```tsx
// src/components/journal/journal-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mood } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodSelector } from "./mood-selector";
import { createJournalEntry } from "@/actions/journal";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";

export function JournalEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | undefined>();
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title || !content || !mood) return;
    setIsSubmitting(true);

    try {
      const entry = await createJournalEntry({
        title,
        content,
        mood,
        tags,
        journalDate: new Date().toISOString(),
      });
      router.push(`/journal/${entry.id}`);
    } catch (error) {
      console.error("Failed to create entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Tulis Journal Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Bagaimana perasaanmu hari ini?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Title */}
        <Input
          placeholder="Judul entry..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
        />

        {/* Content */}
        <Textarea
          placeholder="Ceritakan harimu... (mendukung Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="resize-none leading-relaxed"
        />

        {/* Tags */}
        <Input
          placeholder="Tags (pisahkan dengan koma): kerja, olahraga, keluarga"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!title || !content || !mood || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Simpan & Generate AI Summary
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 5.3 AI Summary Card

```tsx
// src/components/ai/ai-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSummaryCardProps {
  summary: string;
  sentimentScore: number;
  sentimentLabel: string;
  keywords: string[];
}

const sentimentConfig = {
  positive: { color: "bg-emerald-100 text-emerald-800", icon: "✨" },
  neutral:  { color: "bg-yellow-100 text-yellow-800", icon: "💭" },
  negative: { color: "bg-red-100 text-red-800", icon: "🌧️" },
};

export function AiSummaryCard({ summary, sentimentScore, sentimentLabel, keywords }: AiSummaryCardProps) {
  const config = sentimentConfig[sentimentLabel as keyof typeof sentimentConfig];

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Summary
          <Badge variant="outline" className={cn("ml-auto", config.color)}>
            {config.icon} {sentimentLabel} ({(sentimentScore * 100).toFixed(0)}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 5.4 Mood Chart (Grafik Emosi Mingguan)

```tsx
// src/components/dashboard/mood-chart.tsx
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoodDataPoint {
  date: string;
  avgMood: number | null;
  entries: number;
}

const moodLabels: Record<number, string> = {
  1: "😢",
  2: "😟",
  3: "😐",
  4: "😊",
  5: "🤩",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl">{moodLabels[Math.round(value)]}</p>
      <p className="text-xs text-muted-foreground">
        Skor: {value.toFixed(1)} / 5.0
      </p>
    </div>
  );
}

export function MoodChart({ data }: { data: MoodDataPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Mingguan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="displayDate" className="text-xs" />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v) => moodLabels[v] || ""} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="avgMood" connectNulls
              stroke="hsl(var(--primary))" strokeWidth={2.5}
              fill="url(#moodGradient)"
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Integrasi AI (Claude API)

### 6.1 AI Utility Module

```typescript
// src/lib/ai.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface SentimentResult {
  summary: string;
  sentimentScore: number;   // -1.0 to 1.0
  sentimentLabel: "positive" | "neutral" | "negative";
  keywords: string[];
}

export async function analyzeJournalEntry(content: string): Promise<SentimentResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this journal entry and return a JSON response with:
1. "summary": A concise 2-3 sentence summary in the same language as the entry
2. "sentimentScore": A float from -1.0 (very negative) to 1.0 (very positive)
3. "sentimentLabel": One of "positive", "neutral", "negative"
4. "keywords": An array of 3-5 key themes/topics mentioned

Journal Entry:
"""
${content}
"""

Respond ONLY with valid JSON, no markdown formatting.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
```

### 6.2 Server Action untuk AI

```typescript
// src/actions/ai.ts
"use server";

import { analyzeJournalEntry } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateAiSummary(entryId: string) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) throw new Error("Entry not found");

  const analysis = await analyzeJournalEntry(entry.content);

  await prisma.journalEntry.update({
    where: { id: entryId },
    data: {
      aiSummary: analysis.summary,
      sentimentScore: analysis.sentimentScore,
      sentimentLabel: analysis.sentimentLabel,
      keywords: analysis.keywords.join(","),
    },
  });

  revalidatePath(`/journal/${entryId}`);
  revalidatePath("/dashboard");

  return analysis;
}
```

---

## 7. Setup & Installation

### 7.1 Inisialisasi Proyek

```bash
# 1. Create Next.js project
npx create-next-app@latest daily-journal \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*"

cd daily-journal

# 2. Install shadcn/ui
npx shadcn@latest init
# Pilih: New York style, Slate color, CSS variables: yes

# 3. Install shadcn components yang diperlukan
npx shadcn@latest add button card input textarea badge
npx shadcn@latest add dialog dropdown-menu avatar separator
npx shadcn@latest add tabs tooltip calendar popover select

# 4. Install dependencies
npm install prisma @prisma/client           # Database ORM
npm install @anthropic-ai/sdk               # Claude AI
npm install recharts                         # Charts
npm install zod                              # Validation
npm install bcryptjs                         # Password hashing
npm install next-auth @auth/prisma-adapter   # Authentication
npm install date-fns                         # Date utilities
npm install lucide-react                     # Icons (biasanya sudah ada)
npm install framer-motion                    # Animations

# Dev dependencies
npm install -D @types/bcryptjs

# 5. Initialize Prisma
npx prisma init --datasource-provider sqlite

# 6. Setelah menulis schema.prisma:
npx prisma db push
npx prisma generate
```

### 7.2 Environment Variables

```env
# .env.local

# Database
DATABASE_URL="file:./dev.db"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-..."

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 7.3 shadcn/ui Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 8. Halaman-Halaman Utama

### 8.1 Dashboard (`/dashboard`)

Konten:
- **Stats Cards** — total entries, streak, rata-rata mood, entries bulan ini
- **Mood Chart** — grafik emosi 7 hari terakhir (AreaChart dari Recharts)
- **Recent Entries** — 5 entry terakhir dalam card format
- **Quick Add Button** — floating action button untuk entry baru

### 8.2 New Entry (`/journal/new`)

Konten:
- **Mood Selector** — 5 emoji interaktif
- **Title Input** — judul entry
- **Content Textarea** — area menulis (besar, nyaman)
- **Tags Input** — tag opsional
- **Date Picker** — defaultnya hari ini, bisa pilih tanggal lain
- **Submit Button** — simpan + generate AI summary

### 8.3 Entry Detail (`/journal/[id]`)

Konten:
- **Header** — judul, tanggal, mood badge
- **Content** — render markdown
- **AI Summary Card** — summary, sentiment badge, keywords
- **Actions** — edit, delete

### 8.4 Journal List (`/journal`)

Konten:
- **Search & Filter Bar** — search by keyword, filter by mood, date range
- **Entry Cards** — list entries dengan preview, mood emoji, tanggal
- **Pagination** — atau infinite scroll

---

## 9. Styling & Theming

### 9.1 Global CSS Setup

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 262 83% 58%;        /* Purple accent */
    --primary-foreground: 0 0% 98%;
    --secondary: 240 5% 96%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;
    --accent: 262 83% 58%;
    --border: 240 6% 90%;
    --ring: 262 83% 58%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 6%;
    --card-foreground: 0 0% 98%;
    --primary: 262 83% 68%;
    --secondary: 240 4% 16%;
    --muted: 240 4% 16%;
    --muted-foreground: 240 5% 65%;
    --border: 240 4% 16%;
  }
}
```

### 9.2 Prinsip Desain

- **Font Pair:** "DM Sans" (heading) + "DM Mono" (body/timestamps) — clean, modern, humanist
- **Color Palette:** Purple-based primary, warm grays, mood-specific accent colors
- **Layout:** Sidebar navigation (desktop), bottom nav (mobile)
- **Spacing:** Generous whitespace, 8px grid system
- **Animations:** Page transitions via Framer Motion, micro-interactions pada mood selector dan submit
- **Dark Mode:** Full dark mode support via next-themes + shadcn CSS variables

---

## 10. Roadmap Pengembangan

### Phase 1 — Foundation (Minggu 1)

- [ ] Setup proyek Next.js + Tailwind + shadcn
- [ ] Definisi database schema + Prisma setup
- [ ] Auth system (NextAuth + credentials provider)
- [ ] Layout (sidebar, header, theme toggle)
- [ ] CRUD journal entries (form, list, detail, edit, delete)

### Phase 2 — Core Features (Minggu 2)

- [ ] Mood selector component
- [ ] Journal editor dengan markdown support
- [ ] Integrasi Claude API untuk AI summary
- [ ] Sentiment analysis pada setiap entry
- [ ] Entry detail page dengan AI summary card

### Phase 3 — Visualization & Polish (Minggu 3)

- [ ] Dashboard page dengan stats cards
- [ ] Mood chart (Recharts AreaChart) — 7/14/30 hari
- [ ] Writing streak counter
- [ ] Search & filter functionality
- [ ] Loading states & skeletons
- [ ] Error handling & toast notifications

### Phase 4 — Enhancement (Minggu 4)

- [ ] Dark mode toggle + persistence
- [ ] Mobile responsive optimization
- [ ] Page transitions (Framer Motion)
- [ ] Tags system + filter by tags
- [ ] Export journal entries (PDF / Markdown)
- [ ] Calendar view untuk melihat mood per hari

### Phase 5 — Production (Opsional)

- [ ] Migrasi database ke PostgreSQL (Supabase / Neon)
- [ ] Deploy ke Vercel
- [ ] Rate limiting pada AI endpoints
- [ ] Caching strategy (React Query / SWR)
- [ ] PWA support untuk mobile

---

## 11. Key Dependencies

| Package                 | Versi   | Fungsi                            |
|------------------------|---------|-----------------------------------|
| next                   | 14.x    | Framework                         |
| react                  | 18.x    | UI Library                        |
| typescript             | 5.x     | Type safety                       |
| tailwindcss            | 3.x     | Styling                           |
| @shadcn/ui             | latest  | Component library                 |
| prisma                 | 5.x     | Database ORM                      |
| @anthropic-ai/sdk      | latest  | Claude API                        |
| recharts               | 2.x     | Data visualization                |
| next-auth              | 4.x     | Authentication                    |
| zod                    | 3.x     | Schema validation                 |
| framer-motion          | 11.x    | Animations                        |
| date-fns               | 3.x     | Date manipulation                 |
| lucide-react           | latest  | Icon library                      |

---

## 12. Tips Implementasi

**Prisma Singleton** — penting untuk development agar tidak membuat banyak connection:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Server Actions Pattern** — gunakan Server Actions untuk mutations, Route Handlers untuk data fetching yang kompleks:

```typescript
// src/actions/journal.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAiSummary } from "./ai";

const MOOD_SCORES: Record<string, number> = {
  TERRIBLE: 1, BAD: 2, NEUTRAL: 3, GOOD: 4, AMAZING: 5,
};

export async function createJournalEntry(data: {
  title: string;
  content: string;
  mood: string;
  tags: string;
  journalDate: string;
}) {
  const entry = await prisma.journalEntry.create({
    data: {
      title: data.title,
      content: data.content,
      mood: data.mood as any,
      moodScore: MOOD_SCORES[data.mood],
      tags: data.tags || null,
      journalDate: new Date(data.journalDate),
      userId: "current-user-id", // dari session
    },
  });

  // Fire-and-forget AI analysis
  generateAiSummary(entry.id).catch(console.error);

  revalidatePath("/journal");
  revalidatePath("/dashboard");

  return entry;
}
```

**Zod Validation** — selalu validasi input:

```typescript
// src/lib/validators.ts
import { z } from "zod";

export const createEntrySchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  content: z.string().min(1, "Konten wajib diisi").max(10000),
  mood: z.enum(["TERRIBLE", "BAD", "NEUTRAL", "GOOD", "AMAZING"]),
  tags: z.string().max(500).optional(),
  journalDate: z.string().datetime(),
});
```

---

*Dokumen ini mencakup keseluruhan arsitektur, schema, API design, komponen utama, dan roadmap pengembangan. Gunakan sebagai referensi utama selama development.*

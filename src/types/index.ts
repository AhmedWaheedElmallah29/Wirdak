// ─── Surah Catalogue (Library) ─────────────────────────────────────────────

export type SurahStatus = 'memorized' | 'reviewing' | 'not_started';

export interface Surah {
  id: number;
  number: number;
  name: string;
  arabicName: string;
  totalVerses: number;
  status: SurahStatus;
  progressPercentage: number;
  nextReviewDate: string | null; // ISO date string e.g. "2026-04-28"
  lastReviewDate: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  juz: number;
}

// ─── Chunk (the atomic unit of memorization) ───────────────────────────────

/** The granularity of the chunk */
export type ChunkType = 'ayah_range' | 'page' | 'surah';

/**
 * 'learning' = brand-new; sits in "Today's Target" until marked memorized
 * 'review'   = already memorized once; due for spaced-repetition review
 */
export type ChunkStatus = 'learning' | 'review';

export interface Chunk {
  id: string;               // e.g. "chunk-baqarah-1-5"
  surahId: number;          // Foreign key into Surah catalogue
  surahName: string;
  surahArabicName: string;
  surahNumber: number;
  type: ChunkType;
  /** Human-readable label, e.g. "Ayahs 1–5" | "Page 3" | "Full Surah" */
  rangeInfo: string;
  /** For ayah_range chunks only — used by merge logic */
  startAyah?: number;
  endAyah?: number;
  /** For page chunks only */
  pageNumber?: number;
  status: ChunkStatus;
  nextReviewDate: string | null; // ISO date
  lastReviewDate: string | null;
  createdAt: string; // ISO date
}

// ─── Review session ──────────────────────────────────────────────────────────

export interface ReviewSession {
  chunkId: string;
  rating: 'hard' | 'good' | 'easy';
  reviewedAt: string;
}

// ─── Activity Log (drives the Calendar heatmap) ───────────────────────────────

export type ActivityAction = 'memorized' | 'reviewed';

export interface ActivityLog {
  id: string;
  date: string;          // ISO date e.g. "2026-04-25"
  action: ActivityAction;
  chunkId: string;
  surahName: string;
  surahArabicName: string;
  rangeInfo: string;
  count: number;         // verses or ayahs covered in this activity
}

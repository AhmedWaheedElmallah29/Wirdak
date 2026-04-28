import type { Surah, Chunk, ActivityLog } from '../types';

// ─── Date helpers ─────────────────────────────────────────────────────────────
const d = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().split('T')[0];

export const TODAY = d(0);

// ─── Surah Catalogue (unchanged shape, drives the Library) ───────────────────
export const mockSurahs: Surah[] = [
  { id: 1,  number: 1,   name: 'Al-Fatiha',    arabicName: 'الفاتحة',  totalVerses: 7,   status: 'memorized',   progressPercentage: 100, nextReviewDate: TODAY,  lastReviewDate: d(-2), difficulty: 'easy',   juz: 1  },
  { id: 2,  number: 2,   name: 'Al-Baqarah',   arabicName: 'البقرة',   totalVerses: 286, status: 'reviewing',   progressPercentage: 15,  nextReviewDate: d(-1),  lastReviewDate: d(-2), difficulty: 'hard',   juz: 1  },
  { id: 3,  number: 3,   name: "Ali 'Imran",   arabicName: 'آل عمران', totalVerses: 200, status: 'reviewing',   progressPercentage: 5,   nextReviewDate: d(7),   lastReviewDate: d(-2), difficulty: 'hard',   juz: 3  },
  { id: 4,  number: 18,  name: 'Al-Kahf',      arabicName: 'الكهف',   totalVerses: 110, status: 'reviewing',   progressPercentage: 40,  nextReviewDate: d(-2),  lastReviewDate: d(-3), difficulty: 'hard',   juz: 15 },
  { id: 5,  number: 19,  name: 'Maryam',       arabicName: 'مريم',    totalVerses: 98,  status: 'not_started', progressPercentage: 0,   nextReviewDate: null,   lastReviewDate: null,  difficulty: 'medium', juz: 16 },
  { id: 6,  number: 20,  name: 'Ta-Ha',        arabicName: 'طه',      totalVerses: 135, status: 'not_started', progressPercentage: 0,   nextReviewDate: null,   lastReviewDate: null,  difficulty: 'hard',   juz: 16 },
  { id: 7,  number: 36,  name: 'Ya-Sin',       arabicName: 'يس',      totalVerses: 83,  status: 'memorized',   progressPercentage: 100, nextReviewDate: d(-1),  lastReviewDate: d(-2), difficulty: 'medium', juz: 22 },
  { id: 8,  number: 55,  name: 'Ar-Rahman',    arabicName: 'الرحمن',  totalVerses: 78,  status: 'memorized',   progressPercentage: 100, nextReviewDate: d(1),   lastReviewDate: TODAY, difficulty: 'medium', juz: 27 },
  { id: 9,  number: 56,  name: "Al-Waqi'ah",   arabicName: 'الواقعة', totalVerses: 96,  status: 'reviewing',   progressPercentage: 20,  nextReviewDate: d(3),   lastReviewDate: d(-1), difficulty: 'medium', juz: 27 },
  { id: 10, number: 67,  name: 'Al-Mulk',      arabicName: 'الملك',   totalVerses: 30,  status: 'memorized',   progressPercentage: 100, nextReviewDate: TODAY,  lastReviewDate: d(-1), difficulty: 'easy',   juz: 29 },
  { id: 11, number: 76,  name: 'Al-Insan',     arabicName: 'الإنسان', totalVerses: 31,  status: 'not_started', progressPercentage: 0,   nextReviewDate: null,   lastReviewDate: null,  difficulty: 'medium', juz: 29 },
  { id: 12, number: 78,  name: 'An-Naba',      arabicName: 'النبأ',   totalVerses: 40,  status: 'memorized',   progressPercentage: 100, nextReviewDate: d(7),   lastReviewDate: TODAY, difficulty: 'easy',   juz: 30 },
  { id: 13, number: 112, name: 'Al-Ikhlas',    arabicName: 'الإخلاص', totalVerses: 4,   status: 'memorized',   progressPercentage: 100, nextReviewDate: d(14),  lastReviewDate: d(-1), difficulty: 'easy',   juz: 30 },
  { id: 14, number: 113, name: 'Al-Falaq',     arabicName: 'الفلق',   totalVerses: 5,   status: 'memorized',   progressPercentage: 100, nextReviewDate: d(14),  lastReviewDate: d(-1), difficulty: 'easy',   juz: 30 },
  { id: 15, number: 114, name: 'An-Nas',       arabicName: 'الناس',   totalVerses: 6,   status: 'memorized',   progressPercentage: 100, nextReviewDate: d(14),  lastReviewDate: d(-1), difficulty: 'easy',   juz: 30 },
  { id: 16, number: 32,  name: 'As-Sajdah',    arabicName: 'السجدة',  totalVerses: 30,  status: 'not_started', progressPercentage: 0,   nextReviewDate: null,   lastReviewDate: null,  difficulty: 'easy',   juz: 21 },
];

// ─── Initial Chunk Seed Data ──────────────────────────────────────────────────
// Demonstrates the three chunk types and both statuses.
export const mockChunks: Chunk[] = [
  // Al-Fatiha — full surah in review
  {
    id: 'chunk-fatiha-surah',
    surahId: 1,
    surahName: 'Al-Fatiha',
    surahArabicName: 'الفاتحة',
    surahNumber: 1,
    type: 'surah',
    rangeInfo: 'Full Surah',
    status: 'review',
    nextReviewDate: TODAY,
    lastReviewDate: d(-2),
    createdAt: d(-30),
  },
  // Al-Baqarah — two ayah_range chunks (the merge-demo targets) in review
  {
    id: 'chunk-baqarah-1-5',
    surahId: 2,
    surahName: 'Al-Baqarah',
    surahArabicName: 'البقرة',
    surahNumber: 2,
    type: 'ayah_range',
    rangeInfo: 'Ayahs 1–5',
    startAyah: 1,
    endAyah: 5,
    status: 'review',
    nextReviewDate: d(-1),
    lastReviewDate: d(-2),
    createdAt: d(-20),
  },
  {
    id: 'chunk-baqarah-6-10',
    surahId: 2,
    surahName: 'Al-Baqarah',
    surahArabicName: 'البقرة',
    surahNumber: 2,
    type: 'ayah_range',
    rangeInfo: 'Ayahs 6–10',
    startAyah: 6,
    endAyah: 10,
    status: 'review',
    nextReviewDate: d(-1),
    lastReviewDate: d(-2),
    createdAt: d(-18),
  },
  // Al-Kahf — page chunk in review, overdue
  {
    id: 'chunk-kahf-page-3',
    surahId: 4,
    surahName: 'Al-Kahf',
    surahArabicName: 'الكهف',
    surahNumber: 18,
    type: 'page',
    rangeInfo: 'Page 3',
    pageNumber: 3,
    status: 'review',
    nextReviewDate: d(-2),
    lastReviewDate: d(-3),
    createdAt: d(-15),
  },
  // Al-Mulk — full surah in review, due today
  {
    id: 'chunk-mulk-surah',
    surahId: 10,
    surahName: 'Al-Mulk',
    surahArabicName: 'الملك',
    surahNumber: 67,
    type: 'surah',
    rangeInfo: 'Full Surah',
    status: 'review',
    nextReviewDate: TODAY,
    lastReviewDate: d(-1),
    createdAt: d(-60),
  },
  // Ya-Sin — a chunk actively being learned today
  {
    id: 'chunk-yasin-learning-1',
    surahId: 7,
    surahName: 'Ya-Sin',
    surahArabicName: 'يس',
    surahNumber: 36,
    type: 'ayah_range',
    rangeInfo: 'Ayahs 1–12',
    startAyah: 1,
    endAyah: 12,
    status: 'learning',
    nextReviewDate: null,
    lastReviewDate: null,
    createdAt: TODAY,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Chunks that are being actively learned (Today's Target). */
export const getLearningChunks = (chunks: Chunk[]): Chunk[] =>
  chunks.filter((c) => c.status === 'learning');

/** Chunks due for spaced-repetition review today or earlier. */
export const getDueReviewChunks = (chunks: Chunk[]): Chunk[] => {
  const today = new Date().toISOString().split('T')[0];
  return chunks.filter(
    (c) => c.status === 'review' && c.nextReviewDate !== null && c.nextReviewDate <= today
  );
};

/** Overall memorization progress as a percentage of Surahs fully memorized. */
export const getOverallProgress = (surahs: Surah[]): number => {
  if (!surahs.length) return 0;
  const memorized = surahs.filter((s) => s.status === 'memorized').length;
  return Math.round((memorized / surahs.length) * 100);
};

export const getVerseProgress = (
  surahs: Surah[]
): { memorized: number; total: number } => {
  const memorized = surahs
    .filter((s) => s.status === 'memorized')
    .reduce((acc, s) => acc + s.totalVerses, 0);
  const total = surahs.reduce((acc, s) => acc + s.totalVerses, 0);
  return { memorized, total };
};

// ─── Activity Log Seed Data (past 30 days) ────────────────────────────────────
export const mockActivityLog: ActivityLog[] = [
  // Week -4
  { id: 'act-1',  date: d(-28), action: 'memorized', chunkId: 'chunk-ikhlas-surah', surahName: 'Al-Ikhlas',  surahArabicName: 'الإخلاص', rangeInfo: 'Full Surah', count: 4  },
  { id: 'act-2',  date: d(-27), action: 'memorized', chunkId: 'chunk-falaq-surah',  surahName: 'Al-Falaq',   surahArabicName: 'الفلق',   rangeInfo: 'Full Surah', count: 5  },
  { id: 'act-3',  date: d(-27), action: 'reviewed',  chunkId: 'chunk-ikhlas-surah', surahName: 'Al-Ikhlas',  surahArabicName: 'الإخلاص', rangeInfo: 'Full Surah', count: 4  },
  { id: 'act-4',  date: d(-26), action: 'memorized', chunkId: 'chunk-nas-surah',    surahName: 'An-Nas',     surahArabicName: 'الناس',   rangeInfo: 'Full Surah', count: 6  },
  { id: 'act-5',  date: d(-26), action: 'reviewed',  chunkId: 'chunk-falaq-surah',  surahName: 'Al-Falaq',   surahArabicName: 'الفلق',   rangeInfo: 'Full Surah', count: 5  },
  { id: 'act-6',  date: d(-25), action: 'reviewed',  chunkId: 'chunk-nas-surah',    surahName: 'An-Nas',     surahArabicName: 'الناس',   rangeInfo: 'Full Surah', count: 6  },
  // Week -3
  { id: 'act-7',  date: d(-21), action: 'memorized', chunkId: 'chunk-mulk-surah',   surahName: 'Al-Mulk',    surahArabicName: 'الملك',   rangeInfo: 'Full Surah', count: 30 },
  { id: 'act-8',  date: d(-20), action: 'memorized', chunkId: 'chunk-nabaa-surah',  surahName: 'An-Naba',    surahArabicName: 'النبأ',   rangeInfo: 'Full Surah', count: 40 },
  { id: 'act-9',  date: d(-20), action: 'reviewed',  chunkId: 'chunk-mulk-surah',   surahName: 'Al-Mulk',    surahArabicName: 'الملك',   rangeInfo: 'Full Surah', count: 30 },
  { id: 'act-10', date: d(-19), action: 'reviewed',  chunkId: 'chunk-nabaa-surah',  surahName: 'An-Naba',    surahArabicName: 'النبأ',   rangeInfo: 'Full Surah', count: 40 },
  { id: 'act-11', date: d(-18), action: 'memorized', chunkId: 'chunk-baqarah-6-10', surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 6–10', count: 5  },
  { id: 'act-12', date: d(-18), action: 'reviewed',  chunkId: 'chunk-ikhlas-surah', surahName: 'Al-Ikhlas',  surahArabicName: 'الإخلاص', rangeInfo: 'Full Surah', count: 4  },
  { id: 'act-13', date: d(-18), action: 'reviewed',  chunkId: 'chunk-falaq-surah',  surahName: 'Al-Falaq',   surahArabicName: 'الفلق',   rangeInfo: 'Full Surah', count: 5  },
  // Week -2
  { id: 'act-14', date: d(-14), action: 'memorized', chunkId: 'chunk-baqarah-1-5',  surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 1–5',  count: 5  },
  { id: 'act-15', date: d(-14), action: 'reviewed',  chunkId: 'chunk-mulk-surah',   surahName: 'Al-Mulk',    surahArabicName: 'الملك',   rangeInfo: 'Full Surah', count: 30 },
  { id: 'act-16', date: d(-13), action: 'reviewed',  chunkId: 'chunk-nabaa-surah',  surahName: 'An-Naba',    surahArabicName: 'النبأ',   rangeInfo: 'Full Surah', count: 40 },
  { id: 'act-17', date: d(-13), action: 'reviewed',  chunkId: 'chunk-baqarah-1-5',  surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 1–5',  count: 5  },
  { id: 'act-18', date: d(-12), action: 'memorized', chunkId: 'chunk-kahf-page-3',  surahName: 'Al-Kahf',    surahArabicName: 'الكهف',   rangeInfo: 'Page 3',     count: 15 },
  { id: 'act-19', date: d(-12), action: 'reviewed',  chunkId: 'chunk-baqarah-6-10', surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 6–10', count: 5  },
  { id: 'act-20', date: d(-11), action: 'reviewed',  chunkId: 'chunk-kahf-page-3',  surahName: 'Al-Kahf',    surahArabicName: 'الكهف',   rangeInfo: 'Page 3',     count: 15 },
  { id: 'act-21', date: d(-11), action: 'reviewed',  chunkId: 'chunk-nas-surah',    surahName: 'An-Nas',     surahArabicName: 'الناس',   rangeInfo: 'Full Surah', count: 6  },
  // Week -1
  { id: 'act-22', date: d(-7),  action: 'memorized', chunkId: 'chunk-fatiha-surah', surahName: 'Al-Fatiha',  surahArabicName: 'الفاتحة', rangeInfo: 'Full Surah', count: 7  },
  { id: 'act-23', date: d(-7),  action: 'reviewed',  chunkId: 'chunk-mulk-surah',   surahName: 'Al-Mulk',    surahArabicName: 'الملك',   rangeInfo: 'Full Surah', count: 30 },
  { id: 'act-24', date: d(-6),  action: 'reviewed',  chunkId: 'chunk-fatiha-surah', surahName: 'Al-Fatiha',  surahArabicName: 'الفاتحة', rangeInfo: 'Full Surah', count: 7  },
  { id: 'act-25', date: d(-6),  action: 'reviewed',  chunkId: 'chunk-baqarah-1-5',  surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 1–5',  count: 5  },
  { id: 'act-26', date: d(-5),  action: 'reviewed',  chunkId: 'chunk-kahf-page-3',  surahName: 'Al-Kahf',    surahArabicName: 'الكهف',   rangeInfo: 'Page 3',     count: 15 },
  { id: 'act-27', date: d(-5),  action: 'reviewed',  chunkId: 'chunk-nabaa-surah',  surahName: 'An-Naba',    surahArabicName: 'النبأ',   rangeInfo: 'Full Surah', count: 40 },
  { id: 'act-28', date: d(-3),  action: 'reviewed',  chunkId: 'chunk-baqarah-6-10', surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 6–10', count: 5  },
  { id: 'act-29', date: d(-2),  action: 'reviewed',  chunkId: 'chunk-fatiha-surah', surahName: 'Al-Fatiha',  surahArabicName: 'الفاتحة', rangeInfo: 'Full Surah', count: 7  },
  { id: 'act-30', date: d(-2),  action: 'reviewed',  chunkId: 'chunk-mulk-surah',   surahName: 'Al-Mulk',    surahArabicName: 'الملك',   rangeInfo: 'Full Surah', count: 30 },
  { id: 'act-31', date: d(-1),  action: 'memorized', chunkId: 'chunk-yasin-learning-1', surahName: 'Ya-Sin', surahArabicName: 'يس',     rangeInfo: 'Ayahs 1–12', count: 12 },
  { id: 'act-32', date: d(-1),  action: 'reviewed',  chunkId: 'chunk-baqarah-1-5',  surahName: 'Al-Baqarah', surahArabicName: 'البقرة',  rangeInfo: 'Ayahs 1–5',  count: 5  },
  { id: 'act-33', date: d(-1),  action: 'reviewed',  chunkId: 'chunk-kahf-page-3',  surahName: 'Al-Kahf',    surahArabicName: 'الكهف',   rangeInfo: 'Page 3',     count: 15 },
  { id: 'act-34', date: TODAY,  action: 'reviewed',  chunkId: 'chunk-fatiha-surah', surahName: 'Al-Fatiha',  surahArabicName: 'الفاتحة', rangeInfo: 'Full Surah', count: 7  },
];

// ─── Calendar helpers ─────────────────────────────────────────────────────────

/** Activity entries grouped by ISO date string. */
export const getActivityByDate = (
  logs: ActivityLog[]
): Record<string, ActivityLog[]> => {
  const map: Record<string, ActivityLog[]> = {};
  logs.forEach((log) => {
    if (!map[log.date]) map[log.date] = [];
    map[log.date].push(log);
  });
  return map;
};

/** Future review chunks grouped by their nextReviewDate. */
export const getForecastByDate = (
  chunks: Chunk[]
): Record<string, Chunk[]> => {
  const today = new Date().toISOString().split('T')[0];
  const map: Record<string, Chunk[]> = {};
  chunks.forEach((c) => {
    if (c.nextReviewDate && c.nextReviewDate > today) {
      if (!map[c.nextReviewDate]) map[c.nextReviewDate] = [];
      map[c.nextReviewDate].push(c);
    }
  });
  return map;
};


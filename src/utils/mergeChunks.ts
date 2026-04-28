import type { Chunk } from '../types';

/**
 * Progressive merge hierarchy:
 *   ayah_range chunks  →  page chunk
 *   page chunks        →  surah chunk
 *
 * This utility simulates the backend merge logic in pure state so the
 * Dev Tool button on the Dashboard can demo the concept without a server.
 */

/** Returns a deterministic ID for a new merged chunk. */
const makeId = (prefix: string) => `${prefix}-${Date.now()}`;

const today = () => new Date().toISOString().split('T')[0];

/**
 * Merge two `ayah_range` chunks into a single `page` chunk.
 * Both source chunks are removed from the array; the new page chunk is appended.
 */
export function mergeAyahRangesIntoPage(
  chunks: Chunk[],
  idA: string,
  idB: string,
  pageNumber: number,
  pageLabel: string
): Chunk[] {
  const a = chunks.find((c) => c.id === idA);
  const b = chunks.find((c) => c.id === idB);

  if (!a || !b) {
    console.warn('mergeAyahRangesIntoPage: one or both chunk IDs not found', { idA, idB });
    return chunks;
  }

  if (a.type !== 'ayah_range' || b.type !== 'ayah_range') {
    console.warn('mergeAyahRangesIntoPage: both chunks must be of type ayah_range');
    return chunks;
  }

  const merged: Chunk = {
    id: makeId(`chunk-${a.surahId}-page-${pageNumber}`),
    surahId: a.surahId,
    surahName: a.surahName,
    surahArabicName: a.surahArabicName,
    surahNumber: a.surahNumber,
    type: 'page',
    rangeInfo: pageLabel,
    pageNumber,
    status: 'review',
    nextReviewDate: today(),
    lastReviewDate: today(),
    createdAt: today(),
  };

  return [...chunks.filter((c) => c.id !== idA && c.id !== idB), merged];
}

/**
 * Merge all `page` chunks of a given surah into a single `surah` chunk.
 */
export function mergePageChunksIntoSurah(
  chunks: Chunk[],
  surahId: number
): Chunk[] {
  const pageChunks = chunks.filter(
    (c) => c.surahId === surahId && c.type === 'page'
  );

  if (pageChunks.length === 0) {
    console.warn('mergePageChunksIntoSurah: no page chunks found for surah', surahId);
    return chunks;
  }

  const ref = pageChunks[0];
  const merged: Chunk = {
    id: makeId(`chunk-${surahId}-surah`),
    surahId: ref.surahId,
    surahName: ref.surahName,
    surahArabicName: ref.surahArabicName,
    surahNumber: ref.surahNumber,
    type: 'surah',
    rangeInfo: 'Full Surah',
    status: 'review',
    nextReviewDate: today(),
    lastReviewDate: today(),
    createdAt: today(),
  };

  const idsToRemove = new Set(pageChunks.map((c) => c.id));
  return [...chunks.filter((c) => !idsToRemove.has(c.id)), merged];
}

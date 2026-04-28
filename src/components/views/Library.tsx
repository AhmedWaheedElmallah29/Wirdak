import React, { useState, useMemo } from 'react';
import type { Surah, SurahStatus, Chunk } from '../../types';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import StartMemorizingModal from '../modals/StartMemorizingModal';
import { useI18n } from '../../i18n/I18nContext';

interface LibraryProps {
  surahs: Surah[];
  chunks: Chunk[];
  onAddChunk: (chunk: Chunk) => void;
}

type FilterStatus = 'all' | SurahStatus;
type SortKey = 'number' | 'name' | 'progress' | 'status';
type ViewMode = 'grid' | 'list';

const Library: React.FC<LibraryProps> = ({ surahs, chunks, onAddChunk }) => {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortKey>('number');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [modalSurah, setModalSurah] = useState<Surah | null>(null);

  const statusOrder: Record<SurahStatus, number> = { memorized: 0, reviewing: 1, not_started: 2 };

  const chunkCountBySurah = useMemo(() => {
    const map: Record<number, number> = {};
    chunks.forEach((c) => { map[c.surahId] = (map[c.surahId] ?? 0) + 1; });
    return map;
  }, [chunks]);

  const filtered = useMemo(() => {
    let result = [...surahs];
    if (filter !== 'all') result = result.filter((s) => s.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.arabicName.includes(q) || String(s.number).includes(q)
      );
    }
    result.sort((a, b) => {
      switch (sort) {
        case 'name':     return a.name.localeCompare(b.name);
        case 'progress': return b.progressPercentage - a.progressPercentage;
        case 'status':   return statusOrder[a.status] - statusOrder[b.status];
        default:         return a.number - b.number;
      }
    });
    return result;
  }, [surahs, filter, sort, search]);

  const counts: Record<FilterStatus, number> = {
    all:         surahs.length,
    memorized:   surahs.filter((s) => s.status === 'memorized').length,
    reviewing:   surahs.filter((s) => s.status === 'reviewing').length,
    not_started: surahs.filter((s) => s.status === 'not_started').length,
  };

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: 'all',         label: t.library.filterAll },
    { value: 'memorized',   label: t.library.filterMemorized },
    { value: 'reviewing',   label: t.library.filterReviewing },
    { value: 'not_started', label: t.library.filterNotStarted },
  ];

  const canStartMemorizing = (s: Surah) => s.status !== 'memorized';

  // ── Grid card ─────────────────────────────────────────────────────────────
  const SurahCard: React.FC<{ surah: Surah }> = ({ surah }) => {
    const chunkCount = chunkCountBySurah[surah.id] ?? 0;
    return (
      <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-xs font-bold">{surah.number}</span>
          </div>
          <StatusBadge status={surah.status} />
        </div>

        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm leading-tight">{surah.name}</p>
          <p className="text-base text-emerald-600 dark:text-emerald-400 font-arabic mt-1">{surah.arabicName}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {surah.totalVerses} {t.library.verses} · {t.library.juz} {surah.juz}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{t.library.memorization}</span>
            <span className="font-medium">{surah.progressPercentage}%</span>
          </div>
          <ProgressBar value={surah.progressPercentage} size="sm" />
        </div>

        {chunkCount > 0 && (
          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            📌 {chunkCount} {chunkCount > 1 ? t.library.activeChunks : t.library.activeChunk}
          </p>
        )}

        {canStartMemorizing(surah) && (
          <button onClick={() => setModalSurah(surah)} className="btn-primary w-full mt-auto text-xs py-2">
            {t.library.startMemorizing}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t.library.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {t.library.subtitle(surahs.length, counts.memorized)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search — ps-9 (logical) instead of pl-9 */}
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={t.library.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="number">{t.library.sortNumber}</option>
            <option value="name">{t.library.sortName}</option>
            <option value="progress">{t.library.sortProgress}</option>
            <option value="status">{t.library.sortStatus}</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-2 text-sm transition-colors ${
                  view === v ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                aria-label={v === 'grid' ? t.library.gridView : t.library.listView}
              >
                {v === 'grid' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                filter === value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === value ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold text-slate-700 dark:text-slate-200">{t.library.noSurahsFound}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.library.adjustFilters}</p>
          </div>
        )}

        {/* Grid view */}
        {view === 'grid' && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => <SurahCard key={s.id} surah={s} />)}
          </div>
        )}

        {/* List view */}
        {view === 'list' && filtered.length > 0 && (
          <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            {filtered.map((surah) => {
              const chunkCount = chunkCountBySurah[surah.id] ?? 0;
              return (
                <div key={surah.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white text-xs font-bold">{surah.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{surah.name}</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-arabic">{surah.arabicName}</p>
                      {chunkCount > 0 && <span className="text-xs text-teal-600 dark:text-teal-400">📌 {chunkCount}</span>}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {surah.totalVerses} {t.library.verses} · {t.library.juz} {surah.juz}
                    </p>
                  </div>
                  <div className="hidden sm:block w-28">
                    <ProgressBar value={surah.progressPercentage} size="sm" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{surah.progressPercentage}%</p>
                  </div>
                  <StatusBadge status={surah.status} />
                  {canStartMemorizing(surah) && (
                    <button onClick={() => setModalSurah(surah)} className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">
                      {t.library.startMemorizing}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StartMemorizingModal surah={modalSurah} onClose={() => setModalSurah(null)} onConfirm={onAddChunk} />
    </>
  );
};

export default Library;

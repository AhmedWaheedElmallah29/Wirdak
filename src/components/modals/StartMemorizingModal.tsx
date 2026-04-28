import React, { useState } from 'react';
import type { Surah, Chunk } from '../../types';
import Modal from '../ui/Modal';
import { useI18n } from '../../i18n/I18nContext';

interface StartMemorizingModalProps {
  surah: Surah | null;
  onClose: () => void;
  onConfirm: (chunk: Chunk) => void;
}

const StartMemorizingModal: React.FC<StartMemorizingModalProps> = ({ surah, onClose, onConfirm }) => {
  const { t } = useI18n();
  const [startAyah, setStartAyah] = useState('1');
  const [endAyah, setEndAyah] = useState('5');
  const [error, setError] = useState('');

  if (!surah) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const start = parseInt(startAyah, 10);
    const end   = parseInt(endAyah,   10);

    if (isNaN(start) || isNaN(end))   { setError(t.modal.errInvalidNumbers); return; }
    if (start < 1)                     { setError(t.modal.errStartAyah);       return; }
    if (end > surah.totalVerses)       { setError(t.modal.errEndAyah(surah.totalVerses)); return; }
    if (end < start)                   { setError(t.modal.errRange);            return; }

    const today = new Date().toISOString().split('T')[0];
    const newChunk: Chunk = {
      id: `chunk-${surah.id}-ayah-${start}-${end}-${Date.now()}`,
      surahId: surah.id,
      surahName: surah.name,
      surahArabicName: surah.arabicName,
      surahNumber: surah.number,
      type: 'ayah_range',
      rangeInfo: `Ayahs ${start}–${end}`,
      startAyah: start,
      endAyah: end,
      status: 'learning',
      nextReviewDate: null,
      lastReviewDate: null,
      createdAt: today,
    };
    onConfirm(newChunk);
    onClose();
  };

  const handleClose = () => {
    setError('');
    setStartAyah('1');
    setEndAyah('5');
    onClose();
  };

  return (
    <Modal isOpen={!!surah} onClose={handleClose} title={t.modal.startMemorizingTitle(surah.name)}>
      {/* Surah info pill */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 mb-5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-bold">{surah.number}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{surah.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-arabic text-emerald-600 dark:text-emerald-400">{surah.arabicName}</span>
            {' · '}{surah.totalVerses} {t.library.verses} · {t.library.juz} {surah.juz}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.modal.description}{' '}
          <strong className="text-slate-800 dark:text-slate-200">{t.modal.learningChunk}</strong>{' '}
          {t.modal.addedToTarget}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Start Ayah */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start-ayah" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {t.modal.startAyah}
            </label>
            <input
              id="start-ayah"
              type="number"
              min={1}
              max={surah.totalVerses}
              value={startAyah}
              onChange={(e) => setStartAyah(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          {/* End Ayah */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="end-ayah" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {t.modal.endAyah}
            </label>
            <input
              id="end-ayah"
              type="number"
              min={1}
              max={surah.totalVerses}
              value={endAyah}
              onChange={(e) => setEndAyah(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        {!error && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{t.modal.validRange(surah.totalVerses)}</p>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-1">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t.modal.cancel}</button>
          <button type="submit" className="btn-primary flex-1">{t.modal.addToTarget}</button>
        </div>
      </form>
    </Modal>
  );
};

export default StartMemorizingModal;

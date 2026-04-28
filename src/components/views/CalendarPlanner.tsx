import React, { useState, useMemo, useCallback } from 'react';
import type { ActivityLog, Chunk } from '../../types';
import { getActivityByDate, getForecastByDate } from '../../data/mockData';
import { useI18n } from '../../i18n/I18nContext';

interface CalendarPlannerProps {
  activityLog: ActivityLog[];
  chunks: Chunk[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const isoDate = (y: number, m: number, day: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const TODAY_STR = new Date().toISOString().split('T')[0];

/** 0 = none, 1-4 = activity intensity shade */
const heatLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
};

const heatClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-slate-100 dark:bg-slate-800',
  1: 'bg-emerald-100 dark:bg-emerald-900/50',
  2: 'bg-emerald-200 dark:bg-emerald-800/70',
  3: 'bg-emerald-400 dark:bg-emerald-600',
  4: 'bg-emerald-600 dark:bg-emerald-400',
};

// ─── Streak calculation ──────────────────────────────────────────────────────
const calcStreak = (activityByDate: Record<string, ActivityLog[]>): number => {
  let streak = 0;
  const check = new Date();
  // If nothing today, start counting from yesterday
  if (!activityByDate[TODAY_STR]) check.setDate(check.getDate() - 1);
  while (true) {
    const key = check.toISOString().split('T')[0];
    if (!activityByDate[key]) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
};

// ─── Day detail panel ────────────────────────────────────────────────────────
interface DayPanelProps {
  date: string | null;
  activity: ActivityLog[];
  forecast: Chunk[];
  onClose: () => void;
}

const DayPanel: React.FC<DayPanelProps> = ({ date, activity, forecast, onClose }) => {
  const { t, lang } = useI18n();
  if (!date) return null;

  const isPast   = date < TODAY_STR;
  const isToday  = date === TODAY_STR;
  const isFuture = date > TODAY_STR;

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  const title = isToday
    ? t.calendar.panelTodayTitle
    : isFuture
    ? `${t.calendar.panelFutureTitle} ${displayDate}`
    : `${t.calendar.panelPastTitle} ${displayDate}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {isToday ? displayDate : isFuture ? '📅' : '📖'}{' '}
            </p>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base leading-tight mt-0.5">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t.calendar.close}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-80 overflow-y-auto flex flex-col gap-2">
          {/* Past / Today: show activity */}
          {(isPast || isToday) && (
            <>
              {activity.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">{t.calendar.panelEmpty}</p>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.action === 'memorized' ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{a.surahName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{a.rangeInfo}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      a.action === 'memorized'
                        ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {a.action === 'memorized' ? t.calendar.actionMemorized : t.calendar.actionReviewed}
                    </span>
                  </div>
                ))
              )}
            </>
          )}

          {/* Future: show forecast */}
          {isFuture && (
            <>
              {forecast.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">{t.calendar.panelFutureEmpty}</p>
              ) : (
                forecast.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{c.surahNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{c.surahName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{c.rangeInfo}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex-shrink-0">
                      {t.calendar.scheduledReview}
                    </span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const CalendarPlanner: React.FC<CalendarPlannerProps> = ({ activityLog, chunks }) => {
  const { t, lang } = useI18n();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activityByDate = useMemo(() => getActivityByDate(activityLog), [activityLog]);
  const forecastByDate = useMemo(() => getForecastByDate(chunks), [chunks]);
  const streak = useMemo(() => calcStreak(activityByDate), [activityByDate]);
  const totalActiveDays = useMemo(() => Object.keys(activityByDate).length, [activityByDate]);

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goToday = useCallback(() => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  // Build calendar grid
  const { days, startPad } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { days: daysInMonth, startPad: firstDay };
  }, [year, month]);

  const weekdays = t.calendar.weekdays;

  const selectedActivity = selectedDate ? (activityByDate[selectedDate] ?? []) : [];
  const selectedForecast = selectedDate ? (forecastByDate[selectedDate] ?? []) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t.calendar.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.calendar.subtitle}</p>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex flex-col gap-1 border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.calendar.streakLabel}</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{streak}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t.calendar.streakDays(streak)}</p>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.calendar.totalDays}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalActiveDays}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t.calendar.streakDays(totalActiveDays)}</p>
        </div>
      </div>

      {/* ── Calendar card ───────────────────────────────────────────────────── */}
      <div className="card p-4 sm:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            aria-label={t.calendar.prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-slate-50 text-lg">
              {t.calendar.months[month]}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{year}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={goToday}
              className="hidden sm:block text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              {t.calendar.today}
            </button>
            <button
              onClick={nextMonth}
              aria-label={t.calendar.nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekday headers — always Sun→Sat regardless of RTL */}
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map((wd) => (
            <div key={wd} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty leading cells */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dateStr = isoDate(year, month, day);
            const isToday = dateStr === TODAY_STR;
            const isPast  = dateStr < TODAY_STR;
            const isFuture = dateStr > TODAY_STR;
            const isSelected = dateStr === selectedDate;

            const acts = activityByDate[dateStr] ?? [];
            const fc   = forecastByDate[dateStr]   ?? [];
            const level = isPast || isToday ? heatLevel(acts.length) : 0;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`
                  relative aspect-square rounded-lg flex flex-col items-center justify-center
                  transition-all duration-150 cursor-pointer group
                  ${isSelected
                    ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900'
                    : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600'
                  }
                  ${isToday
                    ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900'
                    : ''
                  }
                  ${(isPast || isToday) ? heatClasses[level] : 'bg-slate-50 dark:bg-slate-800/50'}
                `}
              >
                {/* Day number */}
                <span className={`text-xs font-semibold leading-none ${
                  isToday
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : isPast && level > 0
                    ? 'text-emerald-800 dark:text-emerald-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {day}
                </span>

                {/* Future forecast dot(s) */}
                {isFuture && fc.length > 0 && (
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400" />
                )}

                {/* Future count badge for busy days */}
                {isFuture && fc.length > 2 && (
                  <span className="absolute -top-1 -end-1 text-[9px] font-bold w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm">
                    {fc.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Legend ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">{t.calendar.noActivity}</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <div
              key={lvl}
              className={`w-4 h-4 rounded-sm ${heatClasses[lvl]}`}
              title={String(lvl)}
            />
          ))}
          <span className="text-xs text-slate-400 dark:text-slate-500">{t.calendar.heatmapLegend}</span>
        </div>
      </div>

      {/* ── Forecast list (upcoming 14 days) ────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 text-sm uppercase tracking-wide">
          📅 Upcoming Reviews — Next 14 Days
        </h2>
        {(() => {
          const upcoming = Object.entries(forecastByDate)
            .filter(([d]) => {
              const limit = new Date(Date.now() + 14 * 86_400_000).toISOString().split('T')[0];
              return d > TODAY_STR && d <= limit;
            })
            .sort(([a], [b]) => a.localeCompare(b));

          if (upcoming.length === 0) {
            return (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">{t.calendar.panelFutureEmpty}</p>
            );
          }

          return upcoming.map(([dateStr, fc]) => (
            <div key={dateStr} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="w-12 text-center flex-shrink-0">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                </p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">
                  {new Date(dateStr + 'T00:00:00').getDate()}
                </p>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {fc.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium">
                    <span className="font-arabic text-xs">{c.surahArabicName}</span>
                    <span className="text-teal-400">·</span>
                    {c.rangeInfo}
                  </span>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Day detail panel/modal */}
      {selectedDate && (
        <DayPanel
          date={selectedDate}
          activity={selectedActivity}
          forecast={selectedForecast}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

export default CalendarPlanner;

import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Surah, Chunk, ActivityLog } from './types';
import { mockSurahs, mockChunks, mockActivityLog } from './data/mockData';
import { I18nProvider } from './i18n/I18nContext';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './components/views/Dashboard';
import ReviewSession from './components/views/ReviewSession';
import Library from './components/views/Library';
import CalendarPlanner from './components/views/CalendarPlanner';

function AppShell() {
  // ── UI state ───────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const toggleDark = useCallback(() => setDarkMode((v) => !v), []);

  // ── Domain state ───────────────────────────────────────────────────────────
  const [surahs] = useState<Surah[]>(mockSurahs);
  const [chunks, setChunks] = useState<Chunk[]>(mockChunks);
  const [activityLog] = useState<ActivityLog[]>(mockActivityLog);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleAddChunk = useCallback((chunk: Chunk) => {
    setChunks((prev) => [...prev, chunk]);
  }, []);

  const handleMarkMemorized = useCallback((chunkId: string) => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
    setChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId
          ? { ...c, status: 'review', nextReviewDate: tomorrow, lastReviewDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );
  }, []);

  const handleRateReview = useCallback((chunkId: string, rating: 'hard' | 'good' | 'easy') => {
    const daysMap = { hard: 1, good: 4, easy: 14 };
    const next = new Date(Date.now() + daysMap[rating] * 86_400_000).toISOString().split('T')[0];
    setChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId
          ? { ...c, nextReviewDate: next, lastReviewDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );
  }, []);

  const handleMergeSimulate = useCallback((updatedChunks: Chunk[]) => {
    setChunks(updatedChunks);
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <BrowserRouter>
          {/* Desktop sidebar — uses start-0 (logical) inside Sidebar itself */}
          <div className="hidden lg:block">
            <Sidebar darkMode={darkMode} onToggleDark={toggleDark} />
          </div>

          {/* Mobile top nav */}
          <MobileNav darkMode={darkMode} onToggleDark={toggleDark} />

          {/* Main — ms-0 on mobile, lg:ms-64 on desktop (logical margin) */}
          <main className="lg:ms-64 pt-14 lg:pt-0">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      surahs={surahs}
                      chunks={chunks}
                      onMarkMemorized={handleMarkMemorized}
                      onRateReview={handleRateReview}
                      onMergeSimulate={handleMergeSimulate}
                    />
                  }
                />
                <Route
                  path="/review"
                  element={<ReviewSession chunks={chunks} onReview={handleRateReview} />}
                />
                <Route
                  path="/library"
                  element={<Library surahs={surahs} chunks={chunks} onAddChunk={handleAddChunk} />}
                />
                <Route
                  path="/calendar"
                  element={<CalendarPlanner activityLog={activityLog} chunks={chunks} />}
                />
              </Routes>
            </div>
          </main>
        </BrowserRouter>
      </div>
    </div>
  );
}

// I18nProvider wraps everything so the context is available at all levels
function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}

export default App;

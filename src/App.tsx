import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Show } from '@clerk/react';
import type { Surah, Chunk, ActivityLog } from './types';
import { mockSurahs, mockChunks, mockActivityLog } from './data/mockData';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeProvider } from './theme/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './components/views/Dashboard';
import ReviewSession from './components/views/ReviewSession';
import Library from './components/views/Library';
import CalendarPlanner from './components/views/CalendarPlanner';
import LandingPage from './components/views/LandingPage';

// ── Authenticated app shell ─────────────────────────────────────────────────
function AppShell() {
  // ── Domain state ───────────────────────────────────────────────────────────
  const [surahs] = useState<Surah[]>(mockSurahs);
  const [chunks, setChunks] = useState<Chunk[]>(mockChunks);
  const [activityLog] = useState<ActivityLog[]>(mockActivityLog);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleAddChunk = useCallback((chunk: Chunk) => {
    setChunks((prev) => [...prev, chunk]);
  }, []);

  const handleMarkMemorized = useCallback((chunkId: string, rating: 'hard' | 'good' | 'easy') => {
    const daysMap = { hard: 1, good: 4, easy: 7 };
    const next = new Date(Date.now() + daysMap[rating] * 86_400_000).toISOString().split('T')[0];
    setChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId
          ? { ...c, status: 'review', nextReviewDate: next, lastReviewDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );
  }, []);

  const handleRateReview = useCallback((chunkId: string, rating: 'hard' | 'good' | 'easy') => {
    const daysMap = { hard: 1, good: 4, easy: 7 };
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <BrowserRouter>
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile top nav */}
        <MobileNav />

        {/* Main content area */}
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
  );
}

// ── Root component ───────────────────────────────────────────────────────────
// ThemeProvider + I18nProvider wrap everything so contexts are available at all
// levels — including the landing page for signed-out users.
// <Show when="signed-in"> gates the authenticated shell; signed-out users see
// the landing page via the fallback prop.
function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Show when="signed-in" fallback={<LandingPage />}>
          <AppShell />
        </Show>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

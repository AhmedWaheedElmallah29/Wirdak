import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Show, useAuth } from "@clerk/react";
import axios from "axios";
import type { Surah, Chunk, ActivityLog } from "./types";
import { surahsData } from "./data/quranMetadata";
import { mockActivityLog } from "./data/mockData";
import { I18nProvider } from "./i18n/I18nContext";
import { ThemeProvider } from "./theme/ThemeContext";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import Dashboard from "./components/views/Dashboard";
import ReviewSession from "./components/views/ReviewSession";
import Library from "./components/views/Library";
import CalendarPlanner from "./components/views/CalendarPlanner";
import LandingPage from "./components/views/LandingPage";

// ── Authenticated app shell ─────────────────────────────────────────────────
function AppShell() {
  const { userId } = useAuth(); // سحبنا الـ ID بتاع المستخدم الحقيقي

  // ── Domain state ───────────────────────────────────────────────────────────
  // بدأنا الأجزاء بمصفوفة فاضية عشان هتيجي من الداتا بيز الحقيقية
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [surahs] = useState<Surah[]>(surahsData);
  const [activityLog] = useState<ActivityLog[]>(mockActivityLog);

  // ── Fetch Real Data from Backend ───────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const fetchUserProgress = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/reviews/progress/${userId}`,
        );
        const dbProgress = response.data;

        // 👈 عملنا النوع ده مخصوص عشان الـ TypeScript يبطل يعترض على كلمة any
        type DBProgress = {
          chunkId: string;
          type?: "surah" | "page" | "ayah_range";
          surahNumber?: number;
          surahName?: string;
          surahArabicName?: string;
          rangeInfo?: { start?: number; end?: number };
          status?: string;
          nextReviewDate?: string;
        };

        // بنحول الداتا اللي راجعة من السيرفر عشان تناسب الواجهة
        const realChunks: Chunk[] = dbProgress.map((p: DBProgress) => ({
          id: p.chunkId,
          type: p.type || "surah",
          surahNumber: p.surahNumber || 1,
          surahName: p.surahName || "Unknown",
          surahArabicName: p.surahArabicName || "غير معروف",
          rangeInfo: p.rangeInfo || { start: 1, end: 1 },
          status: p.status === "reviewing" ? "review" : "learning",
          nextReviewDate: p.nextReviewDate
            ? new Date(p.nextReviewDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));

        setChunks(realChunks);
      } catch (error) {
        console.error("❌ خطأ أثناء جلب الداتا من السيرفر:", error);
      }
    };

    fetchUserProgress();
  }, [userId]);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleAddChunk = useCallback(
    async (chunk: Chunk) => {
      if (!userId) return;

      // نظهره في الواجهة فوراً
      setChunks((prev) => [...prev, { ...chunk, status: "learning" }]);

      try {
        // نبعته لقاعدة البيانات
        await axios.post("http://localhost:5000/api/reviews/add", {
          userId,
          chunk,
        });
        console.log("✅ تم إضافة الجزء لقاعدة البيانات");
      } catch (error) {
        console.error("❌ خطأ أثناء حفظ الجزء:", error);
      }
    },
    [userId],
  );

  const handleMarkMemorized = useCallback(
    (chunkId: string, rating: "hard" | "good" | "easy") => {
      const daysMap = { hard: 1, good: 4, easy: 7 };
      const next = new Date(Date.now() + daysMap[rating] * 86_400_000)
        .toISOString()
        .split("T")[0];
      setChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId
            ? {
                ...c,
                status: "review",
                nextReviewDate: next,
                lastReviewDate: new Date().toISOString().split("T")[0],
              }
            : c,
        ),
      );
    },
    [],
  );

  const handleRateReview = useCallback(
    (chunkId: string, rating: "hard" | "good" | "easy") => {
      const daysMap = { hard: 1, good: 4, easy: 7 };
      const next = new Date(Date.now() + daysMap[rating] * 86_400_000)
        .toISOString()
        .split("T")[0];
      setChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId
            ? {
                ...c,
                nextReviewDate: next,
                lastReviewDate: new Date().toISOString().split("T")[0],
              }
            : c,
        ),
      );
    },
    [],
  );

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
                element={
                  <ReviewSession chunks={chunks} onReview={handleRateReview} />
                }
              />
              <Route
                path="/library"
                element={
                  <Library
                    surahs={surahs}
                    chunks={chunks}
                    onAddChunk={handleAddChunk}
                  />
                }
              />
              <Route
                path="/calendar"
                element={
                  <CalendarPlanner activityLog={activityLog} chunks={chunks} />
                }
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

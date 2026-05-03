import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Chunk, Surah } from "../../types";
import { useAuth } from "@clerk/react";
import axios from "axios"; // استدعينا axios للباك إند
import {
  getLearningChunks,
  getDueReviewChunks,
  getOverallProgress,
  getVerseProgress,
} from "../../data/mockData";
import ProgressBar from "../ui/ProgressBar";
import { mergeAyahRangesIntoPage } from "../../utils/mergeChunks";
import { useI18n } from "../../i18n/I18nContext";

interface DashboardProps {
  surahs: Surah[];
  chunks: Chunk[];
  onMarkMemorized: (chunkId: string, rating: "hard" | "good" | "easy") => void;
  onRateReview: (chunkId: string, rating: "hard" | "good" | "easy") => void;
  onMergeSimulate: (updatedChunks: Chunk[]) => void;
}

// ── Chunk type badge ────────────────────────────────────────────────────────
const ChunkTypeBadge: React.FC<{ type: Chunk["type"] }> = ({ type }) => {
  const { t } = useI18n();
  const colorMap = {
    ayah_range:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    page: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    surah:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[type]}`}
    >
      {t.chunkType[type]}
    </span>
  );
};

// ── Relative date helper ────────────────────────────────────────────────────
const useRelativeDate = () => {
  const { t, lang } = useI18n();
  return (dateStr: string | null): string => {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - now.getTime()) / 86_400_000);
    if (diff === 0) return t.date.today;
    if (diff === -1) return t.date.yesterday;
    if (diff < 0) return t.date.daysOverdue(Math.abs(diff));
    if (diff === 1) return t.date.tomorrow;
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };
};

// ── Stat card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}> = ({ label, value, sub, accent = false }) => (
  <div
    className={`card p-5 flex flex-col gap-1 ${accent ? "border-emerald-200 dark:border-emerald-800" : ""}`}
  >
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
      {label}
    </p>
    <p
      className={`text-3xl font-bold ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-50"}`}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
  </div>
);

// ── Component ───────────────────────────────────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({
  surahs,
  chunks,
  onMarkMemorized,
  onRateReview,
  onMergeSimulate,
}) => {
  const navigate = useNavigate();
  const { t, lang, formatRangeInfo } = useI18n();
  const relativeDate = useRelativeDate();
  const [mergeFlash, setMergeFlash] = useState(false);
  const [mergeResult, setMergeResult] = useState<string | null>(null);
  const { userId } = useAuth(); // سحبنا الـ ID بتاع المستخدم
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);

  type MemorizingState = Record<
    string,
    {
      step: "rating" | "success";
      rating?: "hard" | "good" | "easy";
      nextReviewStr?: string;
      exiting?: boolean;
      isLoading?: boolean;
    }
  >;
  const [memorizingState, setMemorizingState] = useState<MemorizingState>({});

  const handleMemorizeRate = async (
    chunkId: string,
    rating: "hard" | "good" | "easy",
  ) => {
    if (!userId) return;

    setMemorizingState((prev) => ({
      ...prev,
      [chunkId]: { ...prev[chunkId], isLoading: true },
    }));

    try {
      // إرسال التقييم للباك إند
      await axios.post("http://localhost:5000/api/reviews/rate", {
        userId,
        chunkId,
        rating,
      });

      const daysMap = { hard: 1, good: 4, easy: 7 };
      const days = daysMap[rating];
      // eslint-disable-next-line
      const nextDateObj = new Date(Date.now() + days * 86_400_000);
      const dateStr = nextDateObj.toLocaleDateString(
        lang === "ar" ? "ar-EG" : "en-US",
        {
          month: "short",
          day: "numeric",
        },
      );

      setMemorizingState((prev) => ({
        ...prev,
        [chunkId]: {
          step: "success",
          rating,
          nextReviewStr: t.dashboard.nextReviewOn(days, dateStr),
        },
      }));

      onMarkMemorized(chunkId, rating);

      setTimeout(() => {
        setMemorizingState((prev) => ({
          ...prev,
          [chunkId]: { ...prev[chunkId], exiting: true },
        }));
      }, 2000);
    } catch (error) {
      console.error("❌ خطأ أثناء حفظ التقييم:", error);
      alert("حدث خطأ أثناء الحفظ. تأكد من اتصالك.");
      setMemorizingState((prev) => ({
        ...prev,
        [chunkId]: { ...prev[chunkId], isLoading: false },
      }));
    }
  };

  const handleQuickReviewRate = async (
    chunkId: string,
    rating: "hard" | "good" | "easy",
  ) => {
    if (!userId || reviewLoadingId) return;
    setReviewLoadingId(chunkId);

    try {
      await axios.post("http://localhost:5000/api/reviews/rate", {
        userId,
        chunkId,
        rating,
      });

      onRateReview(chunkId, rating);
    } catch (error) {
      console.error("❌ خطأ أثناء المراجعة السريعة:", error);
      alert("حدث خطأ أثناء الحفظ.");
    } finally {
      setReviewLoadingId(null);
    }
  };

  const learningChunks = getLearningChunks(chunks);
  const reviewChunks = getDueReviewChunks(chunks);
  const overallPct = getOverallProgress(surahs);
  const { memorized: memorizedVerses, total: totalVerses } =
    getVerseProgress(surahs);
  const memorizedCount = surahs.filter((s) => s.status === "memorized").length;

  const canSimulateMerge =
    chunks.some((c) => c.id === "chunk-baqarah-1-5") &&
    chunks.some((c) => c.id === "chunk-baqarah-6-10");

  const handleSimulateMerge = () => {
    const updated = mergeAyahRangesIntoPage(
      chunks,
      "chunk-baqarah-1-5",
      "chunk-baqarah-6-10",
      2,
      "Page 2 (Al-Baqarah)",
    );
    onMergeSimulate(updated);
    setMergeFlash(true);
    setMergeResult(t.dashboard.mergeResultText);
    setTimeout(() => setMergeFlash(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t.dashboard.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Dev Tool */}
        <button
          onClick={handleSimulateMerge}
          disabled={!canSimulateMerge}
          title={
            canSimulateMerge
              ? t.dashboard.simulateTitle
              : t.dashboard.simulateDisabledTitle
          }
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.02] active:scale-95 ${
            mergeFlash
              ? "bg-teal-500 text-white border-teal-400"
              : canSimulateMerge
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed hover:scale-100 active:scale-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"
            />
          </svg>
          {t.dashboard.simulatePageMerge}
        </button>
      </div>

      {/* Merge toast */}
      {mergeResult && (
        <div
          className={`card px-4 py-3 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 flex items-center gap-3 text-sm text-teal-700 dark:text-teal-300 transition-opacity duration-500 ${mergeFlash ? "opacity-100" : "opacity-60"}`}
        >
          <span>✅</span>
          <span>
            <strong>{t.dashboard.mergeApplied}</strong> {mergeResult}
          </span>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.dashboard.surahsMemorized}
          value={memorizedCount}
          sub={t.dashboard.ofSurahs(surahs.length)}
          accent
        />
        <StatCard
          label={t.dashboard.chunksLearning}
          value={learningChunks.length}
          sub={t.dashboard.inTodaysTarget}
        />
        <StatCard
          label={t.dashboard.reviewsDue}
          value={reviewChunks.length}
          sub={t.dashboard.spacedRepetition}
        />
        <StatCard
          label={t.dashboard.versesMemorized}
          value={memorizedVerses}
          sub={t.dashboard.ofTotal(totalVerses)}
        />
      </div>

      {/* ── Overall Progress ─────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-50">
              {t.dashboard.overallProgress}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t.dashboard.surahsFullyMemorized}
            </p>
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {overallPct}%
          </span>
        </div>
        <ProgressBar value={overallPct} size="lg" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TODAY'S TARGET                                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 rounded-full bg-violet-500" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-50">
                {t.dashboard.todaysTarget}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dashboard.newMemorizationChunks}
              </p>
            </div>
            {learningChunks.length > 0 && (
              <span className="bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {learningChunks.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/library")}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {t.dashboard.addChunk}
          </button>
        </div>

        {learningChunks.length === 0 ? (
          <div className="card p-8 text-center border-dashed">
            <div className="text-3xl mb-2">📚</div>
            <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">
              {t.dashboard.noChunksLearning}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t.dashboard.noChunksHint}{" "}
              <strong>{t.dashboard.startMemorizingQuote}</strong>{" "}
              {t.dashboard.noChunksHint2}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {learningChunks.map((chunk) => {
              const state = memorizingState[chunk.id];
              if (state?.exiting) return null;

              return (
                <div
                  key={chunk.id}
                  className={`card transition-all duration-500 ease-in-out overflow-hidden border-s-4 border-s-violet-500 ${
                    state?.exiting
                      ? "opacity-0 max-h-0 py-0 my-0 border-0"
                      : "max-h-[200px] opacity-100"
                  } ${state?.isLoading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {state?.step === "rating" ? (
                    <div className="flex flex-col items-center justify-center gap-3 w-full p-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {t.dashboard.howWellMemorized}
                      </p>
                      <div className="flex items-center gap-2">
                        {(["hard", "good", "easy"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => handleMemorizeRate(chunk.id, r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.02] active:scale-95 ${
                              r === "hard"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-500/10"
                                : r === "good"
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/10"
                                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/10"
                            }`}
                          >
                            {t.dashboard[r as "hard" | "good" | "easy"]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : state?.step === "success" ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full p-4 text-center text-emerald-600 dark:text-emerald-400 animate-fade-in">
                      <div className="text-2xl">✅</div>
                      <p className="text-sm font-semibold">
                        {state.nextReviewStr}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
                          {chunk.surahNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {lang === "ar" ? (
                            <p className="font-semibold font-arabic text-slate-900 dark:text-slate-50 text-sm">
                              {chunk.surahArabicName}
                            </p>
                          ) : (
                            <>
                              <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
                                {chunk.surahName}
                              </p>
                              <span className="text-sm text-slate-400 dark:text-slate-500 font-arabic">
                                {chunk.surahArabicName}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <ChunkTypeBadge type={chunk.type} />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {formatRangeInfo(chunk.rangeInfo)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setMemorizingState((prev) => ({
                            ...prev,
                            [chunk.id]: { step: "rating" },
                          }))
                        }
                        className="btn-good text-xs px-3 py-2 flex-shrink-0"
                      >
                        {t.dashboard.markMemorized}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TODAY'S REVIEW                                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 rounded-full bg-emerald-500" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-50">
                {t.dashboard.todaysReview}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dashboard.spacedRepetitionQueue}
              </p>
            </div>
            {reviewChunks.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {reviewChunks.length}
              </span>
            )}
          </div>
          {reviewChunks.length > 0 && (
            <button
              onClick={() => navigate("/review")}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {t.dashboard.startSession}
            </button>
          )}
        </div>

        {reviewChunks.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
              {t.dashboard.allCaughtUp}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t.dashboard.noReviewsToday}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviewChunks.map((chunk) => (
              <div
                key={chunk.id}
                className={`card p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 border-s-4 border-s-emerald-500 ${
                  reviewLoadingId === chunk.id
                    ? "opacity-50 pointer-events-none scale-[0.98]"
                    : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {chunk.surahNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-arabic text-slate-900 dark:text-slate-50 text-sm">
                      {chunk.surahArabicName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <ChunkTypeBadge type={chunk.type} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {formatRangeInfo(chunk.rangeInfo)}
                    </span>
                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                      {t.dashboard.due}: {relativeDate(chunk.nextReviewDate)}
                    </span>
                  </div>
                </div>

                {/* Inline quick-rate */}
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  {(["hard", "good", "easy"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleQuickReviewRate(chunk.id, r)}
                      disabled={reviewLoadingId === chunk.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.02] active:scale-95 ${
                        r === "hard"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-500/10"
                          : r === "good"
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/10"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/10"
                      }`}
                    >
                      {t.dashboard[r as "hard" | "good" | "easy"]}
                    </button>
                  ))}
                </div>

                {/* Mobile arrow */}
                <button
                  onClick={() => navigate(`/review?chunkId=${chunk.id}`)}
                  className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-emerald-500 cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95"
                  aria-label="Open review"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 18l6-6-6-6"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

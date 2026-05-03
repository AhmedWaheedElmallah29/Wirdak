import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { Chunk } from "../../types";
import { useAuth } from "@clerk/react"; // 👈 استدعينا Clerk
import axios from "axios"; // 👈 استدعينا Axios
import { getDueReviewChunks } from "../../data/mockData";
import ProgressBar from "../ui/ProgressBar";
import { useI18n } from "../../i18n/I18nContext";

interface ReviewSessionProps {
  chunks: Chunk[];
  onReview: (chunkId: string, rating: "hard" | "good" | "easy") => void;
}

type Rating = "hard" | "good" | "easy";

const ChunkTypePill: React.FC<{ type: Chunk["type"] }> = ({ type }) => {
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[type]}`}
    >
      {t.chunkType[type]}
    </span>
  );
};

const ReviewSession: React.FC<ReviewSessionProps> = ({ chunks, onReview }) => {
  const { t, lang, formatRangeInfo } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId } = useAuth(); // 👈 سحبنا الـ ID الحقيقي

  const [queue, setQueue] = useState<Chunk[]>(() => {
    const due = getDueReviewChunks(chunks);
    const paramId = searchParams.get("chunkId");
    if (paramId) {
      const idx = due.findIndex((c) => c.id === paramId);
      if (idx > 0) {
        const reordered = [...due];
        reordered.splice(idx, 1);
        reordered.unshift(due[idx]);
        return reordered;
      }
    }
    return due;
  });

  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(
    queue[0]?.id || null,
  );
  const [reviewed, setReviewed] = useState<{ chunk: Chunk; rating: Rating }[]>(
    [],
  );
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);

  // 👈 خلينا الدالة دي async عشان تستنى الباك إند يرد
  const handleRate = async (chunkId: string, rating: Rating) => {
    if (animating || !userId) return;
    setAnimating(true);

    try {
      // 👈 إرسال التقييم لقاعدة البيانات
      await axios.post("http://localhost:5000/api/reviews/rate", {
        userId,
        chunkId,
        rating,
      });

      // بعد ما الباك إند يرد بنجاح، نشغل الأنيميشن ونحدث الفرونت إند
      setTimeout(() => {
        const ratedChunk = queue.find((c) => c.id === chunkId);
        if (ratedChunk) {
          onReview(chunkId, rating);
          setReviewed((prev) => [...prev, { chunk: ratedChunk, rating }]);
        }

        setQueue((prev) => {
          const nextQueue = prev.filter((c) => c.id !== chunkId);
          if (nextQueue.length > 0) {
            setExpandedChunkId(nextQueue[0].id);
          } else {
            setExpandedChunkId(null);
          }
          return nextQueue;
        });

        setRevealed(false);
        setAnimating(false);
      }, 350);
    } catch (error) {
      console.error("❌ خطأ أثناء حفظ التقييم:", error);
      alert("حدث خطأ أثناء الحفظ. تأكد من اتصالك بالإنترنت.");
      setAnimating(false);
    }
  };

  const handleExpand = (chunkId: string) => {
    if (animating || expandedChunkId === chunkId) return;
    setExpandedChunkId(chunkId);
    setRevealed(false);
  };

  const ratingConfigs: {
    rating: Rating;
    emoji: string;
    label: string;
    desc: string;
    cls: string;
  }[] = [
    {
      rating: "hard",
      emoji: "😓",
      label: t.review.ratingHard,
      desc: t.review.ratingHardDesc,
      cls: "btn-hard",
    },
    {
      rating: "good",
      emoji: "👍",
      label: t.review.ratingGood,
      desc: t.review.ratingGoodDesc,
      cls: "btn-good",
    },
    {
      rating: "easy",
      emoji: "🌟",
      label: t.review.ratingEasy,
      desc: t.review.ratingEasyDesc,
      cls: "btn-easy",
    },
  ];

  const ratingBadgeClass = (r: Rating) =>
    r === "easy"
      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
      : r === "good"
        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
        : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";

  // ── Completion ─────────────────────────────────────────────────────────────
  if (queue.length === 0) {
    if (reviewed.length === 0) {
      return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t.review.title}
          </h1>
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              {t.review.noReviewsDue}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {t.review.allCaughtUp}
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              {t.review.backDashboard}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {t.review.title}
        </h1>
        <div className="card p-10 text-center flex flex-col items-center gap-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {t.review.sessionComplete}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t.review.sessionCompleteMsg(reviewed.length)}
          </p>

          <div className="w-full max-w-sm flex flex-col gap-0 mt-1 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
            {reviewed.map(({ chunk, rating }) => (
              <div
                key={chunk.id}
                className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800"
              >
                <div>
                  {lang === "ar" ? (
                    <p className="text-sm font-medium font-arabic text-slate-700 dark:text-slate-200">
                      {chunk.surahArabicName}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {chunk.surahName}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatRangeInfo(chunk.rangeInfo)}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ratingBadgeClass(rating)}`}
                >
                  {rating === "easy"
                    ? `🌟 ${t.review.ratingEasy}`
                    : rating === "good"
                      ? `👍 ${t.review.ratingGood}`
                      : `😓 ${t.review.ratingHard}`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate("/")} className="btn-secondary">
              {t.review.backDashboard}
            </button>
            <button
              onClick={() => navigate("/library")}
              className="btn-primary"
            >
              {t.review.viewLibrary}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = queue.length + reviewed.length;
  const sessionPct = Math.round((reviewed.length / total) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t.review.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {t.review.subtitle(reviewed.length + 1, total)}
          </p>
        </div>
        <button onClick={() => navigate("/")} className="btn-secondary text-xs">
          {t.review.exit}
        </button>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>{t.review.sessionProgress}</span>
          <span>{t.review.reviewed(reviewed.length, total)}</span>
        </div>
        <ProgressBar value={sessionPct} size="sm" color="teal" />
      </div>

      {/* Accordion List */}
      <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col gap-3 pr-2">
        {queue.map((chunk) => {
          const isExpanded = chunk.id === expandedChunkId;

          return (
            <div
              key={chunk.id}
              onClick={() => !isExpanded && handleExpand(chunk.id)}
              role={!isExpanded ? "button" : undefined}
              tabIndex={!isExpanded ? 0 : undefined}
              onKeyDown={(e) => {
                if (!isExpanded && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleExpand(chunk.id);
                }
              }}
              className={`card transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "flex flex-col items-center gap-6 p-8 shadow-md border-emerald-200 dark:border-emerald-800"
                  : "flex items-center gap-3 px-4 py-3 opacity-70 hover:opacity-100 cursor-pointer hover:scale-[1.01] active:scale-[0.99] border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm"
              }`}
              style={
                isExpanded && animating
                  ? {
                      opacity: 0,
                      transform: "translateY(10px) scale(0.97)",
                    }
                  : {}
              }
            >
              {isExpanded ? (
                // EXPANDED VIEW
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold">
                        {chunk.surahNumber}
                      </span>
                    </div>
                    <ChunkTypePill type={chunk.type} />
                  </div>

                  <div className="text-center">
                    {lang === "ar" ? (
                      <h2 className="text-3xl font-bold font-arabic text-emerald-600 dark:text-emerald-400">
                        {chunk.surahArabicName}
                      </h2>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {chunk.surahName}
                        </h2>
                        <p className="text-3xl font-arabic text-emerald-600 dark:text-emerald-400 mt-2">
                          {chunk.surahArabicName}
                        </p>
                      </>
                    )}
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300 mt-3 bg-slate-100 dark:bg-slate-700 px-4 py-1.5 rounded-full inline-block">
                      {formatRangeInfo(chunk.rangeInfo)}
                    </p>
                  </div>

                  {!revealed ? (
                    <button
                      onClick={() => setRevealed(true)}
                      className="btn-primary px-10 py-3 text-base mt-2"
                    >
                      {t.review.showRatingOptions}
                    </button>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-4 mt-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.review.howDidItFeel}
                      </p>
                      <div className="grid grid-cols-3 gap-3 w-full">
                        {ratingConfigs.map(
                          ({ rating, emoji, label, desc, cls }) => (
                            <button
                              key={rating}
                              onClick={() => handleRate(chunk.id, rating)}
                              disabled={animating}
                              className={`${cls} flex-col py-4 h-auto gap-1`}
                            >
                              <span className="text-xl">{emoji}</span>
                              <span className="font-bold">{label}</span>
                              <span className="text-xs opacity-70 font-normal">
                                {desc}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // COLLAPSED VIEW
                <>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 ">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {chunk.surahNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {lang === "ar" ? (
                      <span className="text-sm font-arabic font-semibold text-slate-700 dark:text-slate-300">
                        {chunk.surahArabicName}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {chunk.surahName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ms-auto bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {formatRangeInfo(chunk.rangeInfo)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSession;

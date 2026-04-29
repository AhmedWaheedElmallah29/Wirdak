export type Lang = "en" | "ar";

const en = {
  // ── App / Brand ──────────────────────────────────────────────────────────
  appName: "Wirdak",
  appSubtitle: "Quran Tracker",

  // ── Nav ──────────────────────────────────────────────────────────────────
  nav: {
    dashboard: "Dashboard",
    review: "Review",
    library: "Library",
    calendar: "Journey",
  },

  // ── Theme ────────────────────────────────────────────────────────────────
  lightMode: "Light Mode",
  darkMode: "Dark Mode",

  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    title: "Dashboard",
    overallProgress: "Overall Progress",
    surahsFullyMemorized: "Surahs fully memorized",

    // Stats
    surahsMemorized: "Surahs Memorized",
    ofSurahs: (n: number) => `of ${n} surahs`,
    chunksLearning: "Chunks Learning",
    inTodaysTarget: "in today's target",
    reviewsDue: "Reviews Due",
    spacedRepetition: "spaced repetition",
    versesMemorized: "Verses Memorized",
    ofTotal: (n: number) => `of ${n} total`,

    // Today's Target section
    todaysTarget: "Today's Target",
    newMemorizationChunks: "New memorization chunks",
    addChunk: "+ Add Chunk",
    noChunksLearning: "No chunks being learned.",
    noChunksHint: "Go to the Library and click",
    startMemorizingQuote: '"Start Memorizing"',
    noChunksHint2: "to add a new range.",
    markMemorized: "✓ Mark Memorized",

    // Today's Review section
    todaysReview: "Today's Review",
    spacedRepetitionQueue: "Spaced-repetition queue",
    startSession: "Start Session →",
    allCaughtUp: "All caught up!",
    noReviewsToday: "No reviews due today.",

    // Dev Tool
    simulatePageMerge: "🛠 Simulate Page Merge",
    simulateTitle: "Merge the two Al-Baqarah ayah chunks into a page chunk",
    simulateDisabledTitle: "Merge already applied — chunks no longer exist",
    mergeApplied: "Merge applied:",
    mergeResultText:
      'Merged "Ayahs 1–5" + "Ayahs 6–10" → "Page 2 (Al-Baqarah)"',

    // Ratings
    due: "Due",
    hard: "😓 Hard",
    good: "👍 Good",
    easy: "🌟 Easy",
    howWellMemorized: "How well did you memorize this?",
    nextReviewOn: (days: number, date: string) => `Next review in ${days} day${days > 1 ? 's' : ''}`,
  },

  // ── Review Session ────────────────────────────────────────────────────────
  review: {
    title: "Review Session",
    subtitle: (current: number, total: number) =>
      `${current} of ${total} · Spaced Repetition`,
    sessionProgress: "Session Progress",
    reviewed: (n: number, total: number) => `${n}/${total} reviewed`,
    showRatingOptions: "Show Rating Options",
    howDidItFeel: "How did your recitation feel?",
    upNext: "Up Next",
    more: (n: number) => `+${n} more`,
    exit: "✕ Exit",
    sessionComplete: "Session Complete!",
    sessionCompleteMsg: (n: number) =>
      `You reviewed ${n} chunk${n !== 1 ? "s" : ""} today. Excellent work!`,
    backDashboard: "← Dashboard",
    viewLibrary: "View Library",
    noReviewsDue: "No reviews due!",
    allCaughtUp: "All caught up. Come back tomorrow.",

    ratingHard: "Hard",
    ratingGood: "Good",
    ratingEasy: "Easy",
    ratingHardDesc: "Review again soon (+1d)",
    ratingGoodDesc: "On schedule (+4d)",
    ratingEasyDesc: "Extend interval (+7d)",
  },

  // ── Library ───────────────────────────────────────────────────────────────
  library: {
    title: "Library",
    subtitle: (total: number, memorized: number) =>
      `${total} Surahs tracked · ${memorized} memorized`,
    searchPlaceholder: "Search Surahs…",
    sortNumber: "Sort: Number",
    sortName: "Sort: Name",
    sortProgress: "Sort: Progress",
    sortStatus: "Sort: Status",
    gridView: "grid view",
    listView: "list view",
    filterAll: "All",
    filterMemorized: "Memorized",
    filterReviewing: "Reviewing",
    filterNotStarted: "Not Started",
    noSurahsFound: "No Surahs found",
    adjustFilters: "Adjust your filters or search term.",
    verses: "verses",
    juz: "Juz",
    memorization: "Memorization",
    activeChunk: "active chunk",
    activeChunks: "active chunks",
    startMemorizing: "+ Start Memorizing",
  },

  // ── Status Badges ─────────────────────────────────────────────────────────
  status: {
    memorized: "Memorized",
    reviewing: "Reviewing",
    not_started: "Not Started",
  },

  // ── Chunk Type Badges ─────────────────────────────────────────────────────
  chunkType: {
    ayah_range: "Ayah Range",
    page: "Page",
    surah: "Full Surah",
  },

  // ── Start Memorizing Modal ────────────────────────────────────────────────
  modal: {
    startMemorizingTitle: (name: string) => `Start Memorizing · ${name}`,
    description:
      "Select the Ayah range you want to memorize today. This creates a new",
    learningChunk: "Learning Chunk",
    addedToTarget: "added to today's target.",
    startAyah: "Start Ayah",
    endAyah: "End Ayah",
    validRange: (max: number) => `Valid range: Ayah 1 to ${max}`,
    cancel: "Cancel",
    addToTarget: "Add to Today's Target →",
    errInvalidNumbers: "Please enter valid numbers.",
    errStartAyah: "Start Ayah must be at least 1.",
    errEndAyah: (max: number) =>
      `End Ayah cannot exceed ${max} (total verses).`,
    errRange: "End Ayah must be ≥ Start Ayah.",
  },

  // ── Relative Dates ────────────────────────────────────────────────────────
  date: {
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    daysOverdue: (n: number) => `${n}d overdue`,
  },

  // ── Calendar / Journey ────────────────────────────────────────────────────
  calendar: {
    title: "Journey",
    subtitle: "Your memorization history & upcoming reviews",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    today: "Today",
    heatmapLegend: "Activity level",
    noActivity: "No activity",
    upcomingReviews: "📅 Upcoming Reviews — Next 14 Days",
    // Day detail panel
    panelPastTitle: "Activity on",
    panelFutureTitle: "Scheduled for",
    panelTodayTitle: "Today",
    panelEmpty: "Nothing recorded for this day.",
    panelFutureEmpty: "No reviews scheduled.",
    actionMemorized: "Memorized",
    actionReviewed: "Reviewed",
    scheduledReview: "Scheduled review",
    close: "Close",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ] as readonly string[],
    weekdays: [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ] as readonly string[],
    streakLabel: "Current streak",
    streakDays: (n: number) => `${n} day${n !== 1 ? "s" : ""}`,
    totalDays: "Active days",
  },
} as const;

const ar: typeof en = {
  appName: "وِردَك",
  appSubtitle: "متتبع القرآن",

  nav: {
    dashboard: "لوحة التحكم",
    review: "المراجعة",
    library: "المكتبة",
    calendar: "رحلتي",
  },

  lightMode: "الوضع الفاتح",
  darkMode: "الوضع الداكن",

  dashboard: {
    title: "لوحة التحكم",
    overallProgress: "التقدم العام",
    surahsFullyMemorized: "السور المحفوظة بالكامل",

    surahsMemorized: "السور المحفوظة",
    ofSurahs: (n: number) => `من أصل ${n} سور`,
    chunksLearning: "أجزاء قيد التعلم",
    inTodaysTarget: "في هدف اليوم",
    reviewsDue: "مراجعات مستحقة",
    spacedRepetition: "تكرار متباعد",
    versesMemorized: "الآيات المحفوظة",
    ofTotal: (n: number) => `من أصل ${n}`,

    todaysTarget: "هدف اليوم",
    newMemorizationChunks: "أجزاء الحفظ الجديدة",
    addChunk: "+ إضافة جزء",
    noChunksLearning: "لا توجد أجزاء قيد الحفظ.",
    noChunksHint: "انتقل إلى المكتبة واضغط على",
    startMemorizingQuote: '"ابدأ الحفظ"',
    noChunksHint2: "لإضافة نطاق جديد.",
    markMemorized: "✓ تحديد كمحفوظ",

    todaysReview: "مراجعة اليوم",
    spacedRepetitionQueue: "طابور التكرار المتباعد",
    startSession: "ابدأ الجلسة →",
    allCaughtUp: "أحسنت! أنجزت كل شيء.",
    noReviewsToday: "لا توجد مراجعات مستحقة اليوم.",

    simulatePageMerge: "🛠 محاكاة دمج الصفحة",
    simulateTitle: "دمج جزأَي البقرة في جزء صفحة واحد",
    simulateDisabledTitle: "تم تطبيق الدمج بالفعل — الأجزاء غير موجودة",
    mergeApplied: "تم تطبيق الدمج:",
    mergeResultText: 'دُمج "الآيات 1–5" + "الآيات 6–10" ← "الصفحة 2 (البقرة)"',

    due: "الموعد",
    hard: "😓 صعب",
    good: "👍 جيد",
    easy: "🌟 سهل",
    howWellMemorized: "كيف كان مستوى حفظك؟",
    nextReviewOn: (days: number, date: string) => `مراجعتك القادمة بعد ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : days <= 10 ? 'أيام' : 'يومًا'}`,
  },

  review: {
    title: "جلسة المراجعة",
    subtitle: (current: number, total: number) =>
      `${current} من ${total} · تكرار متباعد`,
    sessionProgress: "تقدم الجلسة",
    reviewed: (n: number, total: number) => `${n}/${total} تمت مراجعتها`,
    showRatingOptions: "عرض خيارات التقييم",
    howDidItFeel: "كيف كانت تلاوتك؟",
    upNext: "التالي",
    more: (n: number) => `+${n} أكثر`,
    exit: "✕ خروج",
    sessionComplete: "اكتملت الجلسة!",
    sessionCompleteMsg: (n: number) =>
      `راجعت ${n} ${n === 1 ? "جزءاً" : "أجزاء"} اليوم. عمل رائع!`,
    backDashboard: "لوحة التحكم →",
    viewLibrary: "عرض المكتبة",
    noReviewsDue: "لا توجد مراجعات مستحقة!",
    allCaughtUp: "أنجزت كل شيء. عد غداً.",

    ratingHard: "صعب",
    ratingGood: "جيد",
    ratingEasy: "سهل",
    ratingHardDesc: "مراجعة قريبة (+1 يوم)",
    ratingGoodDesc: "في الموعد (+4 أيام)",
    ratingEasyDesc: "زيادة المدة (+7 أيام)",
  },

  library: {
    title: "المكتبة",
    subtitle: (total: number, memorized: number) =>
      `${total} سورة مُتتبَّعة · ${memorized} محفوظة`,
    searchPlaceholder: "ابحث عن السور…",
    sortNumber: "ترتيب: الرقم",
    sortName: "ترتيب: الاسم",
    sortProgress: "ترتيب: التقدم",
    sortStatus: "ترتيب: الحالة",
    gridView: "عرض شبكي",
    listView: "عرض قائمة",
    filterAll: "الكل",
    filterMemorized: "المحفوظة",
    filterReviewing: "قيد المراجعة",
    filterNotStarted: "لم تبدأ",
    noSurahsFound: "لم يتم العثور على سور",
    adjustFilters: "عدّل الفلاتر أو مصطلح البحث.",
    verses: "آية",
    juz: "جزء",
    memorization: "الحفظ",
    activeChunk: "جزء نشط",
    activeChunks: "أجزاء نشطة",
    startMemorizing: "+ ابدأ الحفظ",
  },

  status: {
    memorized: "محفوظ",
    reviewing: "قيد المراجعة",
    not_started: "لم يبدأ",
  },

  chunkType: {
    ayah_range: "نطاق آيات",
    page: "صفحة",
    surah: "السورة كاملة",
  },

  modal: {
    startMemorizingTitle: (name: string) => `ابدأ حفظ · ${name}`,
    description: "اختر نطاق الآيات التي تريد حفظها اليوم. سيُنشئ هذا",
    learningChunk: "جزءاً للتعلم",
    addedToTarget: "يُضاف إلى هدف اليوم.",
    startAyah: "آية البداية",
    endAyah: "آية النهاية",
    validRange: (max: number) => `النطاق الصالح: من آية 1 إلى ${max}`,
    cancel: "إلغاء",
    addToTarget: "إضافة إلى هدف اليوم →",
    errInvalidNumbers: "يرجى إدخال أرقام صحيحة.",
    errStartAyah: "يجب أن تكون آية البداية 1 على الأقل.",
    errEndAyah: (max: number) =>
      `لا يمكن أن تتجاوز آية النهاية ${max} (إجمالي الآيات).`,
    errRange: "يجب أن تكون آية النهاية ≥ آية البداية.",
  },

  date: {
    today: "اليوم",
    yesterday: "أمس",
    tomorrow: "غداً",
    daysOverdue: (n: number) => `متأخر ${n} أيام`,
  },

  calendar: {
    title: "رحلتي",
    subtitle: "تاريخ حفظك وجدول مراجعاتك القادمة",
    prevMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    today: "اليوم",
    heatmapLegend: "مستوى النشاط",
    noActivity: "لا نشاط",
    upcomingReviews: "📅 المراجعات القادمة — الـ 14 يومًا القادمة",
    panelPastTitle: "نشاط يوم",
    panelFutureTitle: "مجدول ليوم",
    panelTodayTitle: "اليوم",
    panelEmpty: "لا سجل لهذا اليوم.",
    panelFutureEmpty: "لا مراجعات مجدولة.",
    actionMemorized: "حفظ",
    actionReviewed: "مراجعة",
    scheduledReview: "مراجعة مجدولة",
    close: "إغلاق",
    months: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ] as readonly string[],
    weekdays: [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ] as readonly string[],
    streakLabel: "سلسلة الأيام",
    streakDays: (n: number) => `${n} ${n === 1 ? "يوم" : "أيام"}`,
    totalDays: "الأيام النشطة",
  },
};

export const translations: Record<Lang, typeof en> = { en, ar };
export type Translations = typeof en;

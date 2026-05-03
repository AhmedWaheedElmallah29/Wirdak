import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Lang, type Translations } from "./translations";

// ─── Context shape ─────────────────────────────────────────────────────────
interface I18nContextValue {
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  toggleLang: () => void;
  formatRangeInfo: (info: string) => string;
}

// ─── Context ───────────────────────────────────────────────────────────────
const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "Thabbit-lang";

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "ar") return stored;
    // Auto-detect from browser
    return navigator.language.startsWith("ar") ? "ar" : "en";
  });

  const isRtl = lang === "ar";

  // Sync <html> dir + lang attributes whenever language changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", isRtl ? "rtl" : "ltr");
    root.setAttribute("lang", lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, isRtl]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const formatRangeInfo = useCallback(
    (info: string) => {
      if (lang === "en") return info;

      if (info === "Full Surah") return "سورة كاملة";

      const ayahsMatch = info.match(/^Ayahs?\s+(\d+)[-–](\d+)/i);
      if (ayahsMatch) return `الآيات ${ayahsMatch[1]}–${ayahsMatch[2]}`;

      const ayahMatch = info.match(/^Ayah\s+(\d+)/i);
      if (ayahMatch) return `الآية ${ayahMatch[1]}`;

      const pageMatch = info.match(/^Page\s+(\d+)(?:\s*\((.*?)\))?/i);
      if (pageMatch) {
        // Just keeping the English extra text like "(Al-Baqarah)" if it exists
        // as it's only generated in Dev Tools simulator
        return `صفحة ${pageMatch[1]}${pageMatch[2] ? ` (${pageMatch[2]})` : ""}`;
      }

      return info;
    },
    [lang],
  );

  const value: I18nContextValue = {
    lang,
    t: translations[lang],
    isRtl,
    toggleLang,
    formatRangeInfo,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// ─── Hook ──────────────────────────────────────────────────────────────────
export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};

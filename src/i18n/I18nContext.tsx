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
}

// ─── Context ───────────────────────────────────────────────────────────────
const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "wirdak-lang";

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

  const value: I18nContextValue = {
    lang,
    t: translations[lang],
    isRtl,
    toggleLang,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// ─── Hook ──────────────────────────────────────────────────────────────────
export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};

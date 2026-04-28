import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

interface MobileNavProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ darkMode, onToggleDark }) => {
  const { t, lang, toggleLang } = useI18n();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t.nav.dashboard },
    { to: '/review', label: t.nav.review },
    { to: '/library', label: t.nav.library },
    { to: '/calendar', label: t.nav.calendar },
  ];

  return (
    <>
      <header className="fixed top-0 start-0 end-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 h-14 lg:hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm font-arabic">م</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-50">{t.appName}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Language toggle pill */}
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>

          {/* Dark mode */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <nav
            className="absolute top-14 start-0 end-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileNav;

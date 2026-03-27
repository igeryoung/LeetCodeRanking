import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserMenu } from '../auth/UserMenu';
import { LoginButton } from '../auth/UserMenu';

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          <Trophy size={20} className="text-amber-500" />
          <span className="text-base">{t.nav.appName}</span>
        </Link>

        <nav className="flex items-center gap-1 ml-auto">
          <Link
            to="/"
            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {t.nav.problems}
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t.nav.dashboard}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh-TW' : 'en')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Switch language"
          >
            {language === 'en' ? 'EN' : '中文'}
          </button>
          <ThemeToggle />
          {!isLoading && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
        </div>
      </div>
    </header>
  );
}

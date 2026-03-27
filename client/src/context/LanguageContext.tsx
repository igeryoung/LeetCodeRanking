import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Language, type Translations } from '../i18n';
import { useAuth } from './AuthContext';
import { updateUserSettings } from '../api/user';

const STORAGE_KEY = 'language';

function getInitialLanguage(userLanguage?: Language): Language {
  if (userLanguage) return userLanguage;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh-TW') return stored;
  return 'en';
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: translations['en'],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [language, setLanguageState] = useState<Language>(() =>
    getInitialLanguage(user?.language)
  );

  // Sync from user object once auth resolves
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.language) {
      setLanguageState(user.language);
    }
  }, [isLoading, isAuthenticated, user?.language]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      if (isAuthenticated) {
        try {
          await updateUserSettings(lang);
        } catch {
          // Non-fatal: preference saved locally at least
        }
      }
    },
    [isAuthenticated]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

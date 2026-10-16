import { createContext, useContext, useState, useEffect } from 'react';

export const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {}
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('appLanguage');
      return ['en', 'si', 'ta'].includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = (lang) => {
    if (!['en', 'si', 'ta'].includes(lang)) return;
    setLanguage(lang);
    try {
      localStorage.setItem('appLanguage', lang);
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

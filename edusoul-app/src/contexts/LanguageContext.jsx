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
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved) setLanguage(saved);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

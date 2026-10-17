import { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../src/contexts/LanguageContext';
import { translateCareer, careerMessages } from '../data/careerTranslations';

export function useCareerTranslation() {
  const context = useContext(LanguageContext);

  // Fallback local state if rendered outside of LanguageProvider
  const [localLang, setLocalLang] = useState(() => {
    try {
      const saved = localStorage.getItem('appLanguage');
      return ['en', 'si', 'ta'].includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const language = context?.language || localLang;

  const changeLanguage = (lang) => {
    if (!['en', 'si', 'ta'].includes(lang)) return;
    if (context?.changeLanguage) {
      context.changeLanguage(lang);
    } else {
      setLocalLang(lang);
      try {
        localStorage.setItem('appLanguage', lang);
      } catch {}
    }
  };

  const tr = (text) => translateCareer(text, language);

  return {
    language,
    changeLanguage,
    tr,
    translateCareer: (text) => translateCareer(text, language),
    careerMessages
  };
}

export default useCareerTranslation;

import React from 'react';
import { Globe } from 'lucide-react';
import { useCareerTranslation } from '../hooks/useCareerTranslation';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage } = useCareerTranslation();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'si', label: 'සිංහල', short: 'සිං' },
    { code: 'ta', label: 'தமிழ்', short: 'த' },
  ];

  return (
    <div className={`career-lang-switcher ${compact ? 'compact' : ''}`} role="group" aria-label="Language Selector">
      <div className="career-lang-icon" title="Change Language / භාෂාව තෝරන්න / மொழியை மாற்றவும்">
        <Globe size={14} />
      </div>
      <div className="career-lang-options">
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              aria-pressed={isActive}
              onClick={() => changeLanguage(l.code)}
              className={`career-lang-btn ${isActive ? 'active' : ''}`}
              title={l.label}
            >
              {compact ? l.short : l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

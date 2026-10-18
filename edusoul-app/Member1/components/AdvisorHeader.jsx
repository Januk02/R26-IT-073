import { ArrowUpRight } from 'lucide-react';
import studyfyxLogo from '../../src/assets/studyfyxlogo.png';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { useLanguage } from '../../src/contexts/LanguageContext';
import '../pages/AdvisorWorkspace.css';

export default function AdvisorHeader({ onHome, onViewProfile, onNavigateToDashboard }) {
  const tr = useAdvisorTranslation();
  const { language, changeLanguage } = useLanguage();
  return <header className="advisor-header">
    <button type="button" className="advisor-brand" onClick={onHome}>
      <img className="advisor-brand-logo" src={studyfyxLogo} alt="Studyfyx" />
      <span className="advisor-brand-caption"><small>{tr('Degree & career advisory')}</small></span>
    </button>
    <nav aria-label={tr('Navigation')}>
      {onViewProfile && <button type="button" className="advisor-nav-link" onClick={onViewProfile}>{tr('My Profile')}</button>}
      {onNavigateToDashboard && <button type="button" className="advisor-nav-link" onClick={onNavigateToDashboard}>{tr('Dashboard')}<ArrowUpRight size={14} aria-hidden="true" /></button>}
      <div className="advisor-languages" role="group" aria-label={tr('Language')}>
        {[['en', 'EN'], ['si', 'සිංහල'], ['ta', 'தமிழ்']].map(([code, label]) => <button type="button" key={code} lang={code} aria-pressed={language === code} onClick={() => changeLanguage(code)}>{label}</button>)}
      </div>
    </nav>
  </header>;
}

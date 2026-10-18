import { useEffect, useState } from 'react';
import { ArrowLeft, ClipboardList, Compass, GraduationCap, LayoutDashboard, Map, Menu, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { useLanguage } from '../../src/contexts/LanguageContext';
import logo from '../../src/assets/studyfyxlogo.png';
import '../pages/AdvisorDashboard.css';

export default function AdvisorModuleLayout({ view, onNavigate, onPortal, hasResults, hasRoadmap, children }) {
  const tr = useAdvisorTranslation();
  const { language, changeLanguage } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);
  const links = [
    ['dashboard', 'Dashboard', LayoutDashboard, true],
    ['input', 'Academic profile', ClipboardList, true],
    ['results', 'Degree Predictions', GraduationCap, hasResults],
    ['roadmap', 'Future Goal Roadmap', Map, hasRoadmap],
    ['guidance', 'Improvement Guidance', SlidersHorizontal, hasResults],
    ['profile', 'My Profile', UserRound, true],
    ['home', 'Advisor overview', Compass, true],
  ];
  return <div className={`advisor-module ${collapsed ? 'is-collapsed' : ''}`}>
    {mobileOpen && <button type="button" className="am-backdrop" aria-label={tr('Close navigation')} onClick={() => setMobileOpen(false)} />}
    <aside id="advisor-module-navigation" className={`am-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="am-brand"><img src={logo} alt="Studyfyx" /><button type="button" className="am-mobile-close" aria-label={tr('Close navigation')} onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
      <p className="am-sidebar-label">{tr('FUTURE DREAM DEGREE ADVISOR')}</p>
      <nav aria-label={tr('Degree advisor navigation')}>{links.map(([id, label, Icon, enabled]) => <button type="button" key={id} disabled={!enabled} aria-current={view === id ? 'page' : undefined} title={tr(enabled ? label : 'Complete an analysis to unlock this section.')} onClick={() => { onNavigate(id); setMobileOpen(false); }}><Icon size={19} aria-hidden="true" /><span>{tr(label)}</span></button>)}</nav>
      <div className="am-sidebar-bottom">{onPortal && <button type="button" onClick={onPortal}><ArrowLeft size={17} aria-hidden="true" /><span>{tr('Main Portal')}</span></button>}<button type="button" className="am-collapse" aria-label={tr(collapsed ? 'Expand navigation' : 'Collapse navigation')} onClick={() => setCollapsed(value => !value)}><Menu size={18} aria-hidden="true" /><span>{tr('Collapse navigation')}</span></button></div>
    </aside>
    <div className="am-main"><header className="am-topbar"><button type="button" className="am-mobile-toggle" aria-label={tr('Open navigation')} aria-expanded={mobileOpen} aria-controls="advisor-module-navigation" onClick={() => setMobileOpen(value => !value)}><Menu size={20} /></button><strong>{tr(links.find(([id]) => id === view)?.[1] || 'Dashboard')}</strong><div className="advisor-languages" role="group" aria-label={tr('Language')}>{[['en', 'EN'], ['si', 'සිංහල'], ['ta', 'தமிழ்']].map(([code, label]) => <button type="button" key={code} lang={code} aria-pressed={language === code} onClick={() => changeLanguage(code)}>{label}</button>)}</div></header><div className="am-page">{children}</div></div>
  </div>;
}

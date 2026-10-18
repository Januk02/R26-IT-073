import { ArrowRight, Check } from 'lucide-react';
import AdvisorHeader from '../components/AdvisorHeader';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { useAuth } from '../../src/contexts/AuthContext';
import './AdvisorWorkspace.css';

export default function DreamDegreeHome({ onStart, onLogin, onLogout, onNavigateToDashboard, onViewProfile }) {
  const tr = useAdvisorTranslation();
  const { user } = useAuth();
  return <div className="advisor-workspace">
    <AdvisorHeader onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onViewProfile={onViewProfile} onNavigateToDashboard={onNavigateToDashboard} />
    <main className="advisor-container">
      <section className="advisor-landing">
        <div><p className="advisor-eyebrow">{tr('FUTURE DREAM DEGREE ADVISOR')}</p><h1>{tr('Your ambition.')}<em>{tr('A considered way forward.')}</em></h1><p className="advisor-landing-copy">{tr('Connect your career goal with degree options, university pathways and a practical plan built around your academic profile.')}</p><div className="advisor-landing-actions"><button className="advisor-primary" onClick={onStart}>{tr('Build my degree plan')}<ArrowRight size={17} aria-hidden="true" /></button>{!user && onLogin && <button className="advisor-nav-link" onClick={onLogin}>{tr('Sign in')}</button>}{user && onLogout && <button className="advisor-nav-link" onClick={onLogout}>{tr('Sign out')}</button>}</div><p className="advisor-landing-note">{tr('Four essential details. Optional assessments. One clear starting point.')}</p></div>
        <div className="advisor-path-preview"><p className="advisor-eyebrow">{tr('FROM AMBITION TO ACTION')}</p><h2>{tr('See how your path connects.')}</h2>{[['Your career goal', 'Start with the work you want to do.'], ['Your academic profile', 'Compare your stream, district and Z-score with reference requirements.'], ['Your degree options', 'Understand the fit, requirements and alternatives.'], ['Your next steps', 'Turn gaps into a practical development plan.']].map(([title, detail], index) => <div className="advisor-path-node" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{tr(title)}</strong><small>{tr(detail)}</small></div></div>)}<footer><Check size={13} aria-hidden="true" />{tr('Recommendations explained, with evidence and next steps.')}</footer></div>
      </section>
      <section className="advisor-capabilities" aria-label={tr('What you will receive')}>{[['01', 'Explore with context', 'Compare degree and university options against your goal and academic evidence.'], ['02', 'Understand your readiness', 'See qualification requirements, assessed strengths and the information still needed.'], ['03', 'Plan your next move', 'Review skill gaps, improvement scenarios and a roadmap towards your chosen career.']].map(([number, title, detail]) => <article key={number}><span>{number}</span><h2>{tr(title)}</h2><p>{tr(detail)}</p></article>)}</section>
    </main>
  </div>;
}

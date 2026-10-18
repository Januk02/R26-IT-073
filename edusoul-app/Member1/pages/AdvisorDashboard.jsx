import { ArrowRight, ArrowUpRight, ClipboardList, Compass, GraduationCap, Map, School, SlidersHorizontal } from 'lucide-react';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { createIntake, validateIntake } from '../data/advisorIntake';

export default function AdvisorDashboard({ profile, results, userName, onNavigate }) {
  const tr = useAdvisorTranslation();
  const intake = createIntake(profile || {});
  const errors = validateIntake(intake);
  const complete = ['career', 'stream', 'district', 'zScore'].filter(field => !errors[field]).length;
  const recommendations = results?.recommendations || [];
  const universities = new Set(Object.values(results?.university_recommendations || {}).flat().map(item => item.name)).size;
  const degree = results?.best_degree || results?.trained_model_recommendation?.degree;
  const actions = [
    ['input', 'Build my degree plan', 'Add your academic evidence and career goal.', ClipboardList, true],
    ['results', 'Compare degree options', 'Review your latest degree and university recommendations.', GraduationCap, !!results],
    ['roadmap', 'Future Goal Roadmap', 'Turn your career goal into practical next steps.', Map, !!results?.career_plan || recommendations.length > 0],
    ['guidance', 'Improvement Guidance', 'Understand the gaps and evidence to work on next.', SlidersHorizontal, !!results],
  ];
  return <main className="advisor-workspace am-dashboard">
    <section className="am-hero"><div><p className="advisor-eyebrow"><Compass size={14} aria-hidden="true" />{tr('YOUR DEGREE & CAREER PLAN')}</p><h1>{tr('Welcome back,')} <span>{userName || tr('Student')}</span></h1><p>{tr('Plan your degree, compare university options and take the next step towards your career goal.')}</p><div className="am-hero-actions"><button type="button" className="advisor-primary" onClick={() => onNavigate('input')}>{tr(results ? 'Update my degree plan' : 'Build my degree plan')}<ArrowUpRight size={17} /></button>{results && <button type="button" className="am-secondary" onClick={() => onNavigate('results')}>{tr('View latest results')}<ArrowRight size={16} /></button>}</div></div><div className="am-profile-count"><ClipboardList size={23} aria-hidden="true" /><strong>{complete}<small> / 4</small></strong><span>{tr('Essential details ready')}</span></div></section>
    <section className="am-stats" aria-label={tr('Advisor summary')}>
      {[[ClipboardList, `${complete}/4`, 'Profile details', 'blue'], [GraduationCap, results ? recommendations.length : '—', 'Degree options', 'orange'], [School, results ? universities : '—', 'University options', 'violet'], [Map, results?.career_plan ? tr('Available') : tr('Not started'), 'Career roadmap', 'teal']].map(([Icon, value, label, tone]) => <article className={`am-stat am-${tone}`} key={label}><span><Icon size={21} aria-hidden="true" /></span><div><strong>{value}</strong><small>{tr(label)}</small></div></article>)}
    </section>
    <div className="am-dashboard-grid"><section className="am-section"><div className="am-section-title"><div><p className="advisor-eyebrow">{tr('FROM AMBITION TO ACTION')}</p><h2>{tr('Your latest degree plan')}</h2></div>{results && <button type="button" onClick={() => onNavigate('results')}>{tr('View latest results')}<ArrowUpRight size={16} /></button>}</div>
      {results ? <div className="am-latest"><span className="am-latest-icon"><GraduationCap size={27} aria-hidden="true" /></span><div><small>{tr('Goal-aligned degree')}</small><h3>{degree ? tr(degree) : tr('Vocational training pathway')}</h3><p>{tr(intake.dreamJob)}</p><p>{recommendations.length} {tr('Degree options')} · {universities} {tr('University options')}</p></div><button type="button" className="am-secondary" onClick={() => onNavigate('results')}>{tr('Explore')}<ArrowRight size={16} /></button></div> : <div className="am-no-plan"><GraduationCap size={33} aria-hidden="true" /><h3>{tr('Your next chapter starts with a plan.')}</h3><p>{tr('Complete your profile and run an analysis to see your degree options here.')}</p><button type="button" className="advisor-primary" onClick={() => onNavigate('input')}>{tr('Start my first analysis')}<ArrowRight size={16} /></button></div>}
      <div className="am-action-grid">{actions.map(([id, title, description, Icon, enabled]) => <button type="button" key={id} disabled={!enabled} onClick={() => onNavigate(id)}><Icon size={21} aria-hidden="true" /><strong>{tr(title)}</strong><span>{tr(description)}</span>{!enabled && <small>{tr('Available after analysis')}</small>}<ArrowUpRight className="am-action-arrow" size={16} aria-hidden="true" /></button>)}</div>
    </section><aside className="am-section am-profile-panel"><p className="advisor-eyebrow">{tr('YOUR STARTING POINT')}</p><h2>{tr('Academic profile')}</h2><dl>{[['Career goal', intake.dreamJob], ['A/L Stream', intake.academicResults.stream], ['District', intake.personalInfo.district], ['Z-Score', intake.academicResults.zScore]].map(([label, value]) => <div key={label}><dt>{tr(label)}</dt><dd>{value === '' || value == null ? tr('Not added') : tr(String(value))}</dd></div>)}</dl><button type="button" className="am-secondary" onClick={() => onNavigate('input')}>{tr('Edit academic profile')}<ArrowRight size={16} /></button><p className="am-session-note">{tr('Your latest results are available during this advisor session.')}</p></aside></div>
  </main>;
}

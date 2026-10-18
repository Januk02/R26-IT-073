import { careerJourneyForCareer, futurePathForCareer } from '../data/careerFuturePaths';
import { useAdvisorTranslation } from '../data/advisorTranslations';

export default function FutureCareerPath({ analysis = {}, career }) {
  const tr = useAdvisorTranslation();
  const steps = futurePathForCareer(career, analysis);
  const journey = careerJourneyForCareer(career, analysis);
  const legacyPath = (!career || analysis.goal === career) ? analysis.career_path : null;
  if (!steps.length && !legacyPath) return null;
  return <section className="bg-slate-50 rounded-xl p-5 border border-slate-200 md:col-span-2" data-testid="career-future-path">
    <h3 className="text-slate-900 font-semibold mb-4 text-sm">{tr('Future Path')}</h3>
    {journey && <div className="career-journey" data-testid="career-journey">
      <p className="career-journey-goal"><strong>{tr('Dream job')}: </strong>{tr(journey.goal)}</p>
      <h4>{tr('Work backwards from this goal')}</h4>
      <p className="career-journey-backward" data-testid="career-journey-backward">{journey.backward.map(item => tr(item)).join(' → ')}</p>
      <h4>{tr('Your path forward')}</h4>
      <p className="career-journey-forward" data-testid="career-journey-forward">{journey.forward.map(item => tr(item)).join(' → ')}.</p>
    </div>}
    {steps.length ? <details className="career-journey-details"><summary>{tr('View detailed steps')}</summary><ol className="career-path-steps space-y-4">{steps.map(step => <li key={step.id}>
      <div><h4 className="text-sm font-semibold text-slate-900">{tr(step.id === 'specialisation' && journey?.goal === 'Specialist Doctor'
        ? 'Complete postgraduate specialist training and specialist registration' : step.title)}</h4><p className="mt-1 text-sm leading-relaxed text-slate-600">{tr(step.description)}</p></div>
    </li>)}</ol></details> : <p className="text-slate-700 text-sm leading-relaxed">{tr(legacyPath)}</p>}
  </section>;
}

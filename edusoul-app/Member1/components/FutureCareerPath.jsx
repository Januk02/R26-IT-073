import catalog from '../data/careerCatalog.json';
import { useAdvisorTranslation } from '../data/advisorTranslations';

export default function FutureCareerPath({ analysis = {}, career }) {
  const tr = useAdvisorTranslation();
  // Existing saved results also receive the current career-specific guidance.
  const configured = catalog.jobs.find(job => job.title.en === (analysis.goal || career))?.futurePathSteps || [];
  const steps = analysis.career_path_steps?.length ? analysis.career_path_steps : configured.map(step => ({
    id: step.id, title: step.title.en, description: step.description.en,
  }));
  if (!steps.length && !analysis.career_path) return null;
  return <section className="bg-slate-50 rounded-xl p-5 border border-slate-200 md:col-span-2" data-testid="career-future-path">
    <h3 className="text-slate-900 font-semibold mb-4 text-sm">{tr('Future Path')}</h3>
    {steps.length ? <ol className="space-y-4">{steps.map((step, index) => <li key={step.id} className="flex items-start gap-3">
      <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold" aria-hidden="true">{index + 1}</span>
      <div><h4 className="text-sm font-semibold text-slate-900">{tr(step.title)}</h4><p className="mt-1 text-sm leading-relaxed text-slate-600">{tr(step.description)}</p></div>
    </li>)}</ol> : <p className="text-slate-700 text-sm leading-relaxed">{tr(analysis.career_path)}</p>}
  </section>;
}

import { skillLabel } from '../data/skillLabels';
import { useAdvisorTranslation } from '../data/advisorTranslations';

export default function CareerPlanSummary({ plan, onViewRoadmap, showBackwardSteps = true }) {
  const tr = useAdvisorTranslation();
  if (!plan) return null;
  const entryMessages = {"stream_change_required": "Your selected stream does not support the checked UGC Medicine route. Review a Biological Science pathway with Biology, Chemistry and Physics before applying.", "subject_requirements_not_met": "Your supplied subjects or grades do not meet the checked Medicine requirements. Resolve the subject or grade gaps before applying.", "subject_requirements_supported": "Your supplied subjects and grades meet the checked Medicine subject minimum. Current admission selection and other entry requirements still need verification.", "more_evidence_needed": "Supply your Biology, Chemistry and Physics grades to check the Medicine subject requirements."};
  return <section className="rounded-xl border border-slate-200 bg-white p-5 mb-4" aria-label={tr('Your career pathway')}>
    <p className="advisor-eyebrow">{tr('Your career pathway')}</p>
    <h2 className="font-semibold text-xl text-slate-900">{tr(plan.career)}</h2>
    <p className="mt-2 text-sm text-slate-600">{tr(plan.summary)}</p>
    <p className="mt-3 text-sm text-slate-700"><strong>{tr('Qualification route')}: </strong>{tr(plan.qualification)}</p>
    {plan.backward_steps?.length > 0 && <>
      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4" data-testid="medical-entry-assessment">
        <h3 className="text-sm font-semibold text-slate-900">{tr('Your next step towards Medicine')}</h3>
        <p className="text-sm text-slate-700 mt-2">{tr(entryMessages[plan.entry_route_status] || entryMessages.more_evidence_needed)}</p>
        {plan.student_stream && <p className="text-xs text-slate-600 mt-2">{tr('Selected stream')}: {tr(plan.student_stream)}</p>}
        {!!plan.entry_subject_check?.missing_subjects?.length && <p className="text-xs text-amber-800 mt-2">{tr('Not supplied')}: {plan.entry_subject_check.missing_subjects.map(subject => tr(subject)).join(', ')}</p>}
      </div>
      {showBackwardSteps && <div className="mt-5" data-testid="career-backward-steps">
        <h3 className="font-semibold text-slate-900">{tr('Work backwards from your career goal')}</h3>
        <ol className="mt-3 space-y-3">{plan.backward_steps.map((step, index) => <li key={step.id} className="border-l-2 border-teal-200 pl-4">
          <h4 className="text-sm font-semibold text-slate-900">{index + 1}. {tr(step.title)}</h4>
          <p className="text-sm text-slate-600 mt-1">{tr(step.description)}</p>
        </li>)}</ol>
      </div>}
    </>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="bg-slate-50 rounded-lg p-4"><h3 className="text-sm font-semibold text-slate-900">{tr('Sri Lanka pathway')}</h3><p className="text-xs text-slate-600 mt-2">{tr(plan.sri_lanka_pathway)}</p></div>
      <div className="bg-slate-50 rounded-lg p-4"><h3 className="text-sm font-semibold text-slate-900">{tr('International pathway')}</h3><p className="text-xs text-slate-600 mt-2">{tr(plan.international_pathway)}</p></div>
    </div>
    {plan.registration_note && <p className="mt-4 text-sm text-slate-700">{tr(plan.registration_note)}</p>}
    <h3 className="text-sm font-semibold text-slate-900 mt-4">{tr('Practical milestone')}</h3>
    <p className="text-sm text-slate-600 mt-1">{tr(plan.practical_milestone)}</p>
    {plan.key_skills?.length > 0 && <p className="text-xs text-slate-600 mt-3"><strong>{tr('Key skills')}: </strong>{plan.key_skills.map(skill => tr(skillLabel(skill))).join(', ')}</p>}
    {onViewRoadmap && <button type="button" className="advisor-primary mt-4" onClick={() => onViewRoadmap({ degree: null, career_plan: plan, roadmap_stages: plan.roadmap_stages })}>{tr('View career roadmap')}</button>}
    <details className="mt-4 text-xs text-slate-500"><summary className="cursor-pointer">{tr('Pathway sources and limits')}</summary><p className="mt-2">{tr('These are curated planning routes, not live job vacancies, salary forecasts or guaranteed employment.')}</p><ul className="space-y-2 mt-2">{plan.sources?.map(source => <li key={source.url}><a href={source.url} className="underline" target="_blank" rel="noopener noreferrer">{tr(source.title)} ↗</a></li>)}</ul></details>
  </section>;
}

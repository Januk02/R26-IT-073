import CareerPlanSummary from './CareerPlanSummary';
import { useAdvisorTranslation } from '../data/advisorTranslations';

const percent = value => Number.isFinite(value) ? `${Math.round(value * 100)}%` : 'Not assessed';

const statusLabel = supported => supported === true ? 'Supported by supplied evidence' : supported === false ? 'Needs attention' : 'More evidence or verification needed';
const issueLabels = {
  course_subject_group_required: 'The minimum number of subjects from a required group is not met.',
  course_two_credits_required: 'At least two C grades and one S grade are required.',
  course_subject_required: 'A required subject is missing from the supplied three subjects.',
  course_subject_not_accepted: 'This course requires a different subject combination.',
  course_alternative_required: 'One of the required subject alternatives is missing.',
  course_credit_required: 'A credit pass is needed in an accepted mathematics or physics subject.',
  medicine_two_credits_required: 'Medicine requires at least two C grades and one S grade in Biology, Chemistry and Physics.',
  course_minimum_grade: 'A supplied grade is below the required minimum.',
  subject_pass_required: 'All three subjects need at least an S grade.',
  commerce_core_required: 'Commerce requires at least two of Accounting, Business Studies and Economics.',
};

export function SubjectPrerequisites({ check }) {
  const tr = useAdvisorTranslation();
  if (!check) return null;
  return <div className="rounded-xl border border-slate-200 bg-white p-4 mt-3">
    <h4 className="text-sm font-semibold text-slate-900">{tr(check.degree)} · {tr('A/L subject requirement check')}</h4>
    <p className={`text-xs mt-1 ${check.supported === false ? 'text-amber-800' : 'text-slate-600'}`}>{tr(statusLabel(check.supported))}</p>
    {!!check.required_subjects?.length && <p className="text-xs text-slate-600 mt-2">{tr('Required subjects')}: {check.required_subjects.map(subject => tr(subject)).join(', ')}</p>}
    {!!check.alternative_requirements?.length && <p className="text-xs text-slate-600 mt-2">{tr('Required alternatives')}: {check.alternative_requirements.map(group => group.map(subject => tr(subject)).join(' / ')).join('; ')}</p>}
    {!!check.missing_subjects?.length && <p className="text-xs text-amber-800 mt-2">{tr('Not supplied')}: {check.missing_subjects.map(subject => tr(subject)).join(', ')}</p>}
    {Object.entries(check.minimum_grades || {}).map(([subject, grade]) => <p className="text-xs text-slate-600 mt-2" key={subject}>{tr('Minimum grade')}: {tr(subject)} {grade}</p>)}
    {check.credits_required > 0 && <p className="text-xs text-slate-600 mt-2">{tr('At least two C grades and one S grade are required.')}</p>}
    {!!check.credit_subjects?.length && <p className="text-xs text-slate-600 mt-2">{tr('At least a C grade in one of')}: {check.credit_subjects.map(subject => tr(subject)).join(', ')}</p>}
    {check.at_least && <p className="text-xs text-slate-600 mt-2">{tr('Minimum subjects from this group')}: {check.at_least.count} · {check.at_least.subjects.map(subject => tr(subject)).join(', ')}</p>}
    {check.issues?.map(issue => <p key={issue} className="text-xs text-amber-800 mt-2">{tr(issueLabels[issue] || issue)}</p>)}
    <p className="text-xs text-slate-500 mt-2">{tr('Only A/L subject evidence is checked here. This is not a final admission decision.')}</p>
  </div>;
}

export function ScoreEvidence({ recommendation }) {
  const tr = useAdvisorTranslation();
  if (!recommendation.score_breakdown) return null;
  return (
    <section className="bg-white/80 border border-slate-200 rounded-xl p-4">
      <h4 className="font-semibold text-slate-900 mb-3">{tr('Score evidence')}</h4>
      <p className="text-xs text-slate-500 mb-3">{tr('Missing evidence is excluded from scoring; its weight is redistributed across assessed factors.')}</p>
      <SubjectPrerequisites check={recommendation.subject_prerequisites} />
      <div className="space-y-2 mt-4">
        {recommendation.score_breakdown.map(item => (
          <div key={item.factor} className="flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-slate-600">{tr(item.factor)}</span>
            <span className="font-medium text-slate-900">{tr(percent(item.value))} · {tr('Weight')} {percent(item.effective_weight)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RecommendationEvidence({ result, onViewRoadmap }) {
  const tr = useAdvisorTranslation();
  if (!result?.schema_version) return null;
  const backward = result.backward_analysis || {};
  const scenarios = result.counterfactual_scenarios || [];
  const missing = result.validation?.missing_evidence || [];
  const traceLabels = { goal: 'Start with your career goal', qualification_paths: 'Find the required qualification routes', stream_constraint: 'Compare your stream with the available routes', profile_evidence: 'Check the evidence you supplied', institution_match: 'Compare degree-specific university references' };
  const traceDetail = step => {
    if (step.rule === 'goal') return tr(step.goal || backward.goal);
    if (step.rule === 'qualification_paths') return step.vocational_route ? tr(step.vocational_route) : Object.keys(step.degree_paths || {}).map(degree => tr(degree)).join(', ');
    if (step.rule === 'stream_constraint') return `${tr(step.stream)}${step.excluded_degrees?.length ? ` · ${tr('Routes outside these stream rules')}: ${step.excluded_degrees.map(degree => tr(degree)).join(', ')}` : ''}`;
    if (step.rule === 'profile_evidence') return step.missing?.length ? `${tr('Not yet supplied')}: ${step.missing.map(field => tr(field)).join(', ')}` : tr('All requested evidence supplied');
    return `${tr(step.district)} · ${tr('Reference comparisons still require official verification.')}`;
  };
  return (
    <section className="space-y-4 mb-8" aria-label={tr('Recommendation evidence')}>
      <CareerPlanSummary plan={result.career_plan} onViewRoadmap={onViewRoadmap} />
      {/* <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-slate-900">{tr('Research reference, not an admission decision')}</h2>
        <p className="text-sm text-slate-600 mt-2">{tr('Scores compare your supplied profile with research rules. Current course, subject and district requirements must be verified before applying.')}</p>
        <a className="inline-block mt-3 text-sm font-semibold text-blue-700 underline" href="https://www.ugc.ac.lk/downloads/admissions/Handbook_2025_26/student_handbook_english.pdf" target="_blank" rel="noopener noreferrer">{tr('Check official admission requirements')} ↗</a>
      </div> */}
      {result.model_info?.warnings?.length > 0 && (
        <p className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-sm text-slate-700">{tr('Trained model evidence is unavailable. Recommendations use explicit research rules.')}</p>
      )}
      {result.model_info?.imputed_features?.length > 0 && (
        <p className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-sm text-slate-700">{tr('Some model inputs were defaulted; model evidence is excluded from ranking.')}</p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5">
          <h3 className="font-bold text-slate-900 mb-3">{tr('Goal requirements')}</h3>
          <p className="text-slate-700 text-sm">{tr(backward.requirements?.vocational_route || backward.required_education)}</p>
          {backward.unmet_requirements?.map(item => (
            <p key={item.code} className="mt-3 text-sm font-semibold text-amber-800">{tr(item.message || item.code)}</p>
          ))}
          <h4 className="mt-4 mb-2 font-semibold text-sm">{tr('Missing evidence')}</h4>
          <div className="flex flex-wrap gap-2">
            {missing.length ? missing.map(field => <span key={field} className="text-xs rounded-lg bg-white border border-blue-100 px-2 py-1">{tr(field)}</span>) : <span className="text-sm">{tr('All requested evidence supplied')}</span>}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5">
          <h3 className="font-bold text-slate-900 mb-3">{tr('How your plan was worked out')}</h3>
          <p className="text-xs text-slate-600 mb-4">{tr('We start with your career goal, then work backwards to the qualifications, subjects and skills it needs.')}</p>
          <ol className="space-y-3">
            {backward.inference_trace?.map((step, index) => <li key={step.rule} className="text-sm flex items-start gap-3"><span className="rounded-full bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center shrink-0">{index + 1}</span><span>{tr(traceLabels[step.rule] || step.rule)}<span className="block text-xs text-slate-500 mt-1">{traceDetail(step)}</span></span></li>)}
          </ol>
        </div>
      </div>
      {scenarios.length > 0 && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="font-bold text-slate-900">{tr('Recomputed what-if scenarios')}</h3>
        <p className="mt-1 text-xs text-slate-600">{tr('Only the named input changes. All other profile values and rules stay fixed.')}</p>
        {scenarios.map(scenario => <div key={scenario.id} className="mt-4">
          <h4 className="font-semibold text-sm">{tr(scenario.id)}</h4>
          {Object.entries(scenario.changes).map(([field, change]) => <p key={field} className="text-sm text-slate-600">{tr(field)}: {change.from} → {change.to}</p>)}
          <div className="flex flex-wrap gap-2 mt-2">{scenario.comparison.map(item => <span key={item.degree} className="text-xs bg-white border border-emerald-100 rounded-lg px-2 py-1">{tr(item.degree)}: {percent(item.before)} → {percent(item.after)}</span>)}</div>
        </div>)}
      </div>}
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5">
        <h3 className="font-bold text-slate-900 mb-3">{tr('Priority action plan')}</h3>
        <ul className="space-y-2">{result.action_plan?.map((item, index) => <li key={index} className="text-sm text-slate-700"><span className="font-semibold">{index + 1}. {tr(item.action)}</span>{Number.isFinite(item.gap) && <span> · {tr('Gap')}: {item.gap}</span>}</li>)}</ul>
      </div>
    </section>
  );
}

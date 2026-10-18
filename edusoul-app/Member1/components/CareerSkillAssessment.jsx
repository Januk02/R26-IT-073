import { skillLabel } from '../data/skillLabels';
import { useEffect, useState } from 'react';
import { getBackwardAnalysis } from '../services/apiService';
import { useAdvisorTranslation } from '../data/advisorTranslations';

export default function CareerSkillAssessment({ career, scores = {}, onChange }) {
  const tr = useAdvisorTranslation();
  const [requirements, setRequirements] = useState({ career: '', skills: [], status: 'loading' });
  useEffect(() => {
    let active = true;
    getBackwardAnalysis(career).then(result => {
      if (active) setRequirements({ career, skills: result.backward_analysis?.key_skills || [], status: 'ready' });
    }).catch(() => {
      if (active) setRequirements({ career, skills: [], status: 'unavailable' });
    });
    return () => { active = false; };
  }, [career]);
  const current = requirements.career === career ? requirements : { skills: [], status: 'loading' };
  return (
    <section className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
      <h3 className="font-bold text-slate-900">{tr('Career skill self-assessment')}</h3>
      <p className="text-sm text-slate-600 mt-2 mb-4">{tr('Optional: rate only skills you can assess. These are self-reported skills, not inferred from your personality.')}</p>
      {current.status === 'loading' && <p className="text-sm">{tr('Loading...')}</p>}
      {current.status === 'unavailable' && <p className="text-sm">{tr('Career requirements are unavailable. You can continue without skill scores.')}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{current.skills.map(skill => (
        <label key={skill} className="text-sm text-slate-700">
          <span className="block mb-1 font-medium">{tr(skillLabel(skill))}</span>
          <select value={scores[skill] ?? ''} onChange={event => {
            const updated = { ...scores };
            if (event.target.value === '') delete updated[skill];
            else updated[skill] = Number(event.target.value);
            onChange(updated);
          }} className="w-full p-3 border border-slate-200 rounded-xl bg-white">
            <option value="">{tr('Not assessed')}</option>
            {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}
          </select>
        </label>
      ))}</div>
    </section>
  );
}

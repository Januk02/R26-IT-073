import { useAdvisorTranslation } from '../data/advisorTranslations';
import { partitionUniversities, universityStatus, universityStatusLabels } from '../data/universityPresentation';
import { districtOrigin, straightLineDistanceKm, validCoordinates, resolveUniversityCoordinates } from '../data/universityDistances';

export default function DegreeUniversityOptions({ recommendation, studentDistrict, onViewUniversities, onViewMap }) {
  const tr = useAdvisorTranslation();
  const origin = districtOrigin(studentDistrict);
  const groups = [
    { label: 'Government Universities', universities: recommendation.university_options?.government || [] },
    { label: 'Private Universities', universities: recommendation.university_options?.private || [] },
  ].map(group => ({ ...group, ...partitionUniversities(group.universities) }));
  const total = groups.reduce((sum, group) => sum + group.universities.length, 0);
  const gaps = groups.flatMap(group => group.gaps);

  function universityRow(uni) {
    const coordinates = resolveUniversityCoordinates(uni);
    const distance = straightLineDistanceKm(origin, coordinates);
    return <li key={uni.name} className="rounded-lg border border-slate-200 bg-white p-3" data-testid="degree-university-option">
      <p className="text-sm font-semibold text-slate-900">{tr(uni.name)}</p>
      <p className="text-xs text-slate-600 mt-1">{tr(universityStatusLabels[universityStatus(uni)])}</p>
      {Number.isFinite(distance) && <p className="text-xs text-slate-600 mt-2">{tr(origin.district)} → {tr(uni.location)} · {distance < 1 ? '<1' : Math.round(distance)} {tr('km')} · {tr('Straight-line')}</p>}
      <div className="flex flex-wrap gap-4 mt-2">
        {validCoordinates(coordinates) && <button onClick={() => onViewMap(uni.name)} className="text-xs font-semibold text-blue-800 underline">{tr('View on map')} →</button>}
        {uni.website?.startsWith('https://') && <a href={uni.website} className="text-xs text-blue-800 underline" target="_blank" rel="noopener noreferrer">{tr('Official website')} ↗</a>}
      </div>
    </li>;
  }

  return <section className="border-t border-slate-200 bg-slate-50 px-6 py-5" data-testid="degree-university-options" data-degree={recommendation.degree}>
    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
      <h4 className="text-base font-semibold text-slate-900">{tr('Universities for this degree')}</h4>
      {total > 0 && <button onClick={onViewUniversities} className="text-sm font-semibold text-blue-800 underline">{tr('View all university options')} ({total}) →</button>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.filter(group => group.options.length > 0).map(group => <div key={group.label}>
        <h5 className="text-xs font-semibold text-slate-600 mb-2">{tr(group.label)} ({group.options.length})</h5>
        <ul className="space-y-2">{group.options.slice(0, 3).map(universityRow)}</ul>
        {group.options.length > 3 && <button onClick={onViewUniversities} className="text-xs font-semibold text-blue-800 underline mt-3">{tr('View all university options')} →</button>}
      </div>)}
    </div>
    {gaps.length > 0 && <details className="mt-3">
      <summary className="text-sm font-medium text-amber-900 cursor-pointer">{tr('Universities with entry gaps')} ({gaps.length})</summary>
      <p className="text-xs text-slate-600 mt-2 mb-3">{tr('These options are below a stored cutoff or have unmet subject requirements. Review the gaps before applying.')}</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">{gaps.slice(0, 4).map(universityRow)}</ul>
      {gaps.length > 4 && <button onClick={onViewUniversities} className="text-xs font-semibold text-blue-800 underline mt-3">{tr('View all university options')} →</button>}
    </details>}
    {total === 0 && <p className="text-sm text-slate-600">{tr('No university is mapped to this degree in the current catalog.')}</p>}
  </section>;
}

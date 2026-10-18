import { useAdvisorTranslation } from '../data/advisorTranslations';
import { universityStatus, universityStatusLabels } from '../data/universityPresentation';
import { resolveUniversityCoordinates } from '../data/universityDistances';

export default function TrainedModelRecommendation({ prediction, onViewUniversities, onViewMap }) {
  const tr = useAdvisorTranslation();
  const university = prediction?.university;
  return <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 md:p-6 mb-6" data-testid="trained-model-recommendation">
    <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{tr('Most preferred degree')}</p>
    {prediction?.status === 'available' ? <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <div><p className="text-xs text-slate-600">{tr('Recommended degree')}</p><h2 className="text-2xl font-semibold text-slate-900 mt-1">{tr(prediction.degree)}</h2>
          <p className="text-xs text-slate-600 mt-1">{tr(prediction.goal_relation === 'direct' ? 'Direct career pathway' : 'Related career pathway')}</p>
        </div>
        <div><p className="text-xs text-slate-600">{tr('University option for this degree')}</p>
          <h3 className="text-lg font-semibold text-slate-900 mt-1">{university ? tr(university.name) : tr('No university option meets the checked references.')}</h3>
          {university && <><p className="text-sm text-slate-600 mt-1">{tr(university.location)}</p><p className="text-xs text-slate-700 mt-2">{tr(universityStatusLabels[universityStatus(university)])}</p></>}
        </div>
      </div>
      {prediction.imputed_features?.length > 0 && <p className="text-xs text-slate-600 mt-2">{tr('Missing profile answers were estimated for this model prediction. Complete your profile for a more personal result.')}</p>}
      <div className="flex flex-wrap gap-4 mt-4">
        <button onClick={() => onViewUniversities(prediction.degree)} className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm font-semibold">{tr('View universities for this degree')}</button>
        {resolveUniversityCoordinates(university) && <button onClick={() => onViewMap(prediction.degree, university.name)} className="text-sm font-semibold text-blue-800 underline">{tr('View on map')} →</button>}
      </div>
    </> : <p className="text-sm text-slate-700 mt-3">{tr(prediction?.status === 'no_supported_pathway' ? 'The model has no supported prediction for this career and academic profile. Review the goal-based pathways below.' : 'A trained model prediction is unavailable for this profile. The pathways below use the career rules.')}</p>}
  </section>;
}

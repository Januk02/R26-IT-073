import { useAdvisorTranslation } from '../data/advisorTranslations';
import { districtOrigin, straightLineDistanceKm, drivingDirectionsUrl, resolveUniversityCoordinates } from '../data/universityDistances';
import { useState } from 'react';
import useRoadRoute from './useRoadRoute';

export default function UniversityDistance({ university, studentDistrict }) {
  const tr = useAdvisorTranslation();
  const origin = districtOrigin(studentDistrict);
  const coordinates = resolveUniversityCoordinates(university);
  const distance = straightLineDistanceKm(origin, coordinates);
  const directions = drivingDirectionsUrl(origin, coordinates);
  const [attempt, setAttempt] = useState(0);
  const { route, status } = useRoadRoute(origin, coordinates, attempt);

  return <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 my-3" data-testid="recommendation-distance">
    {origin ? <>
      <p className="text-xs font-medium text-slate-600">{tr('Selected district')}: {tr(origin.district)}</p>
      <p className="text-sm font-semibold text-slate-900 mt-1">{tr(origin.district)} → {tr(university?.name)}</p>
      <p className="text-xs text-slate-600 mt-2">{tr('Road distance')}</p>
      <p className="text-lg font-semibold text-teal-800" data-testid="university-distance" aria-live="polite">{route ? `${route.distanceKm.toFixed(1)} ${tr('km')}` : tr(status === 'loading' ? 'Calculating road distance…' : 'Road distance unavailable')}</p>
      {route && <p className="text-xs text-slate-600">{tr('Estimated driving time')}: {Math.floor(route.durationMinutes / 60)} {tr('hr')} {route.durationMinutes % 60} {tr('min')}</p>}
      {status === 'error' && <button className="text-xs underline text-teal-800 mt-1" onClick={() => setAttempt(value => value + 1)}>{tr('Try again')}</button>}
      <p className="text-xs text-slate-600 mt-2">{tr('Road distance is calculated from your district town to the stored campus location.')}</p>
      {Number.isFinite(distance) && <details className="text-xs text-slate-500 mt-2"><summary className="cursor-pointer">{tr('Approx. straight-line distance')}</summary>{Math.round(distance)} {tr('km')}</details>}
      <p className="text-xs text-slate-600 mt-2">{tr('Representative district town; this is not your exact location.')}</p>
      {directions && <a className="text-xs text-teal-800 underline inline-block mt-2" href={directions} target="_blank" rel="noopener noreferrer">{tr('Driving directions')} ↗</a>}
    </> : <p className="text-xs text-slate-600">{tr('Select a valid district in your profile to see university distances.')}</p>}
  </div>;
}

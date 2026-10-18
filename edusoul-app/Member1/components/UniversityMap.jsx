import { useAdvisorTranslation } from '../data/advisorTranslations';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { districtOrigin, universityDistanceRows, validCoordinates, drivingDirectionsUrl } from '../data/universityDistances';
import 'leaflet/dist/leaflet.css';
import UniversityDistance from './UniversityDistance';
import { transitDirectionsUrl } from '../data/roadRoutes';
import useRoadRoute from './useRoadRoute';
import { universityStatus, universityStatusLabels } from '../data/universityPresentation';

function createIcon(color, label) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="15" cy="14" r="7" fill="#fff"/><text x="15" y="17" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">${label}</text></svg>`,
    iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -36],
  });
}
const govIcon = createIcon('#059669', 'G');
const privateIcon = createIcon('#7c3aed', 'P');
const preferredIcon = createIcon('#f59e0b', '★');
const studentIcon = createIcon('#182f3d', 'S');
const routeIcon = createIcon('#14665f', '→');

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(points.map(point => [point.lat, point.lon])), { padding: [45, 45], maxZoom: 10, animate: false });
  }, [map, points]);
  return null;
}

export default function UniversityMap({ universities = [], preferredUnis = [], studentDistrict, recommendedUniversity, recommendationOnly = false }) {
  const tr = useAdvisorTranslation();
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showAllUniversities, setShowAllUniversities] = useState(true);
  const [routeAttempt, setRouteAttempt] = useState(0);
  const origin = useMemo(() => districtOrigin(studentDistrict), [studentDistrict]);
  const locations = useMemo(() => universityDistanceRows(universities, studentDistrict), [universities, studentDistrict]);
  const markers = useMemo(() => locations.filter(uni => validCoordinates(uni.coordinates)), [locations]);
  const destination = markers.find(uni => uni.name === (selectedUniversity ?? recommendedUniversity)) || markers[0];
  const displayedMarkers = useMemo(() => destination ? [destination] : [], [destination]);
  const visibleMarkers = showAllUniversities ? markers : displayedMarkers;
  const { route: roadRoute, status: routeStatus } = useRoadRoute(origin, destination?.coordinates, routeAttempt);
  const points = useMemo(() => [...(origin ? [origin] : []), ...visibleMarkers.map(uni => uni.coordinates), ...(roadRoute?.points || [])], [origin, visibleMarkers, roadRoute]);
  const distanceText = distance => Number.isFinite(distance) ? `${distance < 1 ? '<1' : Math.round(distance)} ${tr('km')}` : tr('Distance unavailable');
  const entryStatus = uni => tr(universityStatusLabels[universityStatus(uni)]);
  const iconFor = uni => uni.name === destination?.name ? routeIcon : preferredUnis.includes(uni.name) ? preferredIcon : uni.type === 'Government' ? govIcon : privateIcon;
  const directions = uni => drivingDirectionsUrl(origin, uni.coordinates);
  const travelTime = minutes => `${Math.floor(minutes / 60)} ${tr('hr')} ${minutes % 60} ${tr('min')}`;

  return <div className="space-y-4">
    {!recommendationOnly && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      {origin ? <>
        <p className="text-sm font-semibold text-slate-900">{tr('Starting district')}: <span data-testid="map-starting-district">{tr(origin.district)}</span></p>
        <p className="text-xs text-slate-600 mt-2">{tr('Routes start at the main town of your selected district, not your home address. Check the university campus before travelling.')}</p>
      </> : <p className="text-sm text-slate-600">{tr('Select a valid district in your profile to see university distances.')}</p>}
    </div>}
    {recommendationOnly && locations[0] && !validCoordinates(locations[0].coordinates) && <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">{tr(locations[0].name)} · {tr('Campus coordinates are unavailable for this recommendation. Check the official university website.')}</p>}
    {recommendationOnly && !origin && <p className="text-sm text-slate-600">{tr('Select a valid district in your profile to see university distances.')}</p>}
    {!recommendationOnly && markers.length > 0 && <label className="block text-sm font-semibold text-slate-800">
      {tr('University distances')}
      <select className="block w-full mt-2 rounded-xl border border-slate-300 bg-white p-3 text-sm" value={destination?.name || ''} onChange={event => setSelectedUniversity(event.target.value)}>
        {markers.map(uni => <option key={uni.name} value={uni.name}>{tr(uni.name)}</option>)}
      </select>
    </label>}
    {!recommendationOnly && <><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={showAllUniversities} onChange={event => setShowAllUniversities(event.target.checked)} />{tr('Show all recommended universities')}</label>
    <p className="text-xs text-slate-600">{tr('Select a university marker or View route to see its road distance and travel time.')}</p></>}
    {origin && destination && <section className="rounded-xl bg-teal-50 border border-teal-100 p-4 space-y-3" aria-live="polite">
      <h3 className="text-sm font-semibold text-teal-900">{tr(origin.district)} → {tr(destination.name)}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="recommended-route-summary">
        <div><dt className="text-xs text-slate-600">{tr('Selected district')}</dt><dd className="text-base font-semibold text-slate-900 mt-1" data-testid="route-selected-district">{tr(origin.district)}</dd></div>
        <div><dt className="text-xs text-slate-600">{tr('Recommended university')}</dt><dd className="text-base font-semibold text-slate-900 mt-1" data-testid="route-recommended-university">{tr(destination.name)}</dd></div>
        <div><dt className="text-xs text-slate-600">{tr('Road distance')}</dt><dd className={`${roadRoute ? 'text-2xl' : 'text-sm'} font-semibold text-teal-900 mt-1`} data-testid="route-distance">{roadRoute ? `${roadRoute.distanceKm.toFixed(1)} ${tr('km')}` : tr(routeStatus === 'loading' ? 'Calculating road distance…' : 'Road distance unavailable')}</dd></div>
        <div><dt className="text-xs text-slate-600">{tr('Estimated driving time')}</dt><dd className="text-base font-semibold text-teal-900 mt-1" data-testid="route-travel-time">{roadRoute ? travelTime(roadRoute.durationMinutes) : tr(routeStatus === 'loading' ? 'Loading road route…' : 'Travel time unavailable')}</dd></div>
      </dl>
      {roadRoute ? <>
        <p className="text-xs font-medium text-teal-900">{tr('Shortest returned road route')} · {roadRoute.routeCount} {tr('route options checked')}</p>
        <p className="text-xs text-slate-600">{tr('Selected by distance from the routes returned by the routing service; other shorter roads may exist.')}</p>
        <p className="text-xs text-slate-600">{tr('Driving estimate excludes live traffic, stops and bus waiting times.')}</p>
        <details className="text-sm text-slate-700"><summary className="cursor-pointer font-semibold">{tr('Roads along this route')}</summary>
          {roadRoute.roads.length ? <ol className="mt-3 space-y-2 max-h-60 overflow-auto">{roadRoute.roads.map((road, index) => <li key={index} className="flex justify-between gap-3"><span>{index + 1}. {road.label}</span><span className="whitespace-nowrap">{distanceText(road.distanceKm)}</span></li>)}</ol> : <p className="text-xs mt-2">{tr('Road names unavailable for this route.')}</p>}
        </details>
      </> : routeStatus === 'loading' ? <p className="text-sm" role="status">{tr('Loading road route…')}</p> : <div className="text-sm text-slate-700"><p>{tr('Road route unavailable. Use driving directions to check your journey.')}</p><button className="underline mt-2" onClick={() => setRouteAttempt(value => value + 1)}>{tr('Try again')}</button></div>}
      <p className="text-xs text-slate-600">{tr('Road distance is calculated from your district town to the stored campus location.')}</p>
      <p className="text-xs text-slate-600">{tr('Approx. straight-line distance')}: {distanceText(destination.distanceKm)}</p>
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-teal-900">
        <a className="underline" href={directions(destination)} target="_blank" rel="noopener noreferrer">{tr('Driving directions')} ↗</a>
        <a className="underline" href={transitDirectionsUrl(origin, destination.coordinates)} target="_blank" rel="noopener noreferrer">{tr('Bus and train options')} ↗</a>
      </div>
      <p className="text-xs text-slate-600">{tr('Public transport opens in Google Maps. Bus numbers, transfers, fares and schedules depend on local coverage; they are not verified in this app.')}</p>
      <p className="text-xs text-slate-500">{tr('Road routing')}: <a className="underline" href="https://project-osrm.org/" target="_blank" rel="noopener noreferrer">OSRM</a> · OpenStreetMap</p>
    </section>}
    {!recommendationOnly && <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-3 border border-slate-200">
      {[[tr('Selected district'), 'bg-slate-800'], [tr('Selected route'), 'bg-teal-700'], [tr('Government'), 'bg-emerald-600'], [tr('Private'), 'bg-purple-600'], [tr('Preferred'), 'bg-amber-500']].map(([label, color]) => <span key={label} className="flex items-center gap-2 text-xs text-slate-600"><span className={`w-3 h-3 rounded-full ${color}`} />{label}</span>)}
      <span className="ml-auto text-xs text-slate-500">{visibleMarkers.length} {tr('universities shown')}</span>
    </div>}
    {points.length > 0 ? <div className="rounded-xl overflow-hidden border border-slate-200 relative z-0" style={{ height: 520 }}>
      <MapContainer center={origin ? [origin.lat, origin.lon] : [7.8731, 80.7718]} zoom={8} zoomAnimation={false} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={points} />
        {origin && <Marker position={[origin.lat, origin.lon]} icon={studentIcon}>
          <Tooltip permanent direction="top" offset={[0, -35]}>{tr(origin.district)} · {tr('Starting point')}</Tooltip>
          <Popup><strong>{tr('Starting district')}: {tr(origin.district)}</strong><p>{tr('Representative district town; this is not your exact location.')}</p></Popup>
        </Marker>}
        {visibleMarkers.map(uni => <Marker key={uni.name} position={[uni.coordinates.lat, uni.coordinates.lon]} icon={iconFor(uni)} eventHandlers={{ click: () => setSelectedUniversity(uni.name) }}>
          <Popup maxWidth={300}>
            <div className="text-sm text-slate-700" style={{ minWidth: 200 }}>
              <strong className="text-slate-900">{tr(uni.name)}</strong>
              <p>{tr(uni.location)} · {tr(uni.type)}</p>
              <p className="text-xs">{tr('Approx. straight-line distance')}: {distanceText(uni.distanceKm)}</p>
              {origin && <p>{tr(origin.district)} → {tr(uni.name)}</p>}
              {uni.name === destination?.name && roadRoute && <p><strong>{tr('Road distance')}: {distanceText(roadRoute.distanceKm)} · {travelTime(roadRoute.durationMinutes)}</strong></p>}
              <p>{entryStatus(uni)}</p>
              {Number.isFinite(uni.z_score_requirement) && <p>{tr('Z-Score Cutoff:')} {uni.z_score_requirement}</p>}
              {directions(uni) && <a className="underline" href={directions(uni)} target="_blank" rel="noopener noreferrer">{tr('Driving directions')} ↗</a>}
            </div>
          </Popup>
        </Marker>)}
        {origin && displayedMarkers.map(uni => <Polyline key={`distance-${uni.name}`} positions={roadRoute ? roadRoute.points.map(point => [point.lat, point.lon]) : [[origin.lat, origin.lon], [uni.coordinates.lat, uni.coordinates.lon]]} pathOptions={{ color: preferredUnis.includes(uni.name) ? '#d97706' : '#14665f', weight: roadRoute ? 5 : 2, opacity: 0.85, dashArray: roadRoute ? undefined : '6 6' }}>
          <Tooltip permanent direction="center" className="university-route-distance">{tr(origin.district)} → {tr(uni.name)}<br />{roadRoute ? `${roadRoute.distanceKm.toFixed(1)} ${tr('km')} · ${travelTime(roadRoute.durationMinutes)} · ${tr('Road distance')}` : tr(routeStatus === 'loading' ? 'Calculating road distance…' : 'Road distance unavailable')}</Tooltip>
        </Polyline>)}
      </MapContainer>
    </div> : <p className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">{tr('No universities with location data available')}</p>}
    {!recommendationOnly && <>
    {markers.length < locations.length && <p className="text-xs text-slate-600">{tr('Some recommended universities have no valid coordinates. Their distance is unavailable.')}</p>}
    <div className="flex justify-between items-center gap-3"><h3 className="text-sm font-semibold text-slate-900">{tr('University distances')}{origin && <> · {tr(origin.district)}</>}</h3>{origin && <span className="text-xs text-slate-500">{tr('Nearest first')}</span>}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {locations.map(uni => <div key={uni.name} className={`p-4 rounded-xl border ${preferredUnis.includes(uni.name) ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`} data-testid="university-distance-card">
        <h4 className="text-sm font-semibold text-slate-900">{tr(uni.name)}</h4>
        <p className="text-xs text-slate-500 mt-1">{tr(uni.location)} · {tr(uni.type)}</p>
        <UniversityDistance university={uni} studentDistrict={studentDistrict} />
        <p className="text-xs text-slate-600 mt-2">{entryStatus(uni)}</p>
        {validCoordinates(uni.coordinates) && <button className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900" aria-pressed={uni.name === destination?.name} onClick={() => setSelectedUniversity(uni.name)}>{tr(uni.name === destination?.name ? 'Selected route' : 'View route')}</button>}
        {uni.name === destination?.name && roadRoute && <p className="text-xs font-semibold text-teal-800 mt-2">{tr('Road distance')}: {distanceText(roadRoute.distanceKm)} · {travelTime(roadRoute.durationMinutes)}</p>}
      </div>)}
    </div>
    </>}
    <p className="text-xs text-slate-500">{tr('District town coordinates')}: <a className="underline" href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a> · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>
  </div>;
}

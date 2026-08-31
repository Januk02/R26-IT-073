import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons (Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
function createIcon(color) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 30px; height: 40px; position: relative;
      ">
        <svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z"
            fill="${color}" stroke="#fff" stroke-width="1.5"/>
          <circle cx="15" cy="14" r="7" fill="#fff" opacity="0.9"/>
          <text x="15" y="17" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">
            ${color === '#059669' ? 'G' : 'P'}
          </text>
        </svg>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
}

const govIcon = createIcon('#059669');   // emerald for government
const privIcon = createIcon('#7c3aed');  // purple for private
const prefIcon = createIcon('#f59e0b');  // amber for preferred

// Auto-fit map bounds to markers
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [markers, map]);
  return null;
}

export default function UniversityMap({ universities, preferredUnis = [] }) {
  const mapRef = useRef(null);

  // Deduplicate universities by name and filter those with valid coordinates
  const markers = useMemo(() => {
    const seen = new Set();
    return universities
      .filter(uni => {
        if (!uni.coordinates?.lat || !uni.coordinates?.lon) return false;
        if (seen.has(uni.name)) return false;
        seen.add(uni.name);
        return true;
      })
      .map(uni => ({
        ...uni,
        lat: uni.coordinates.lat,
        lon: uni.coordinates.lon,
        isPreferred: preferredUnis.includes(uni.name),
      }));
  }, [universities, preferredUnis]);

  if (markers.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-slate-500 text-lg font-medium">No universities with location data available</p>
        <p className="text-slate-400 text-sm mt-2">Map coordinates are not available for the recommended universities</p>
      </div>
    );
  }

  // Sri Lanka center
  const center = [7.8731, 80.7718];

  const getAdmissionBadge = (prob) => {
    if (prob >= 0.8) return { text: 'High', bg: '#059669' };
    if (prob >= 0.6) return { text: 'Moderate', bg: '#3b82f6' };
    if (prob >= 0.4) return { text: 'Low', bg: '#f59e0b' };
    return { text: 'Very Low', bg: '#ef4444' };
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-700 text-sm">Government</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          <span className="text-slate-700 text-sm">Private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-700 text-sm">Preferred</span>
        </div>
        <span className="ml-auto text-slate-400 text-xs">{markers.length} universities shown</span>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg" style={{ height: '520px' }}>
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds markers={markers} />

          {markers.map((uni) => {
            const icon = uni.isPreferred ? prefIcon : (uni.type === 'Government' ? govIcon : privIcon);
            const badge = getAdmissionBadge(uni.admission_probability);

            return (
              <Marker key={uni.name} position={[uni.lat, uni.lon]} icon={icon}>
                <Popup maxWidth={300} className="uni-popup">
                  <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '220px' }}>
                    {/* Header */}
                    <div style={{
                      background: uni.type === 'Government' ? '#059669' : '#7c3aed',
                      color: '#fff', padding: '10px 14px', margin: '-20px -20px 12px -20px',
                      borderRadius: '12px 12px 0 0',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>{uni.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                        {uni.location} &bull; {uni.type}
                      </div>
                    </div>

                    {/* Admission probability */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{
                        background: badge.bg, color: '#fff', fontSize: '11px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {badge.text}
                      </span>
                      <span style={{ fontSize: '13px', color: '#374151' }}>
                        Admission: <strong>{(uni.admission_probability * 100).toFixed(0)}%</strong>
                      </span>
                    </div>

                    {/* Z-score */}
                    {uni.z_score_requirement && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                        Z-Score Cutoff: <strong style={{ color: '#374151' }}>{uni.z_score_requirement}</strong>
                      </div>
                    )}

                    {/* National rank */}
                    {uni.national_rank && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                        National Rank: <strong style={{ color: '#374151' }}>#{uni.national_rank}</strong>
                      </div>
                    )}

                    {/* Facilities */}
                    {uni.facilities && uni.facilities.length > 0 && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Facilities
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {uni.facilities.slice(0, 4).map((f, i) => (
                            <span key={i} style={{
                              fontSize: '10px', background: '#f3f4f6', color: '#4b5563',
                              padding: '2px 6px', borderRadius: '4px',
                            }}>{f}</span>
                          ))}
                          {uni.facilities.length > 4 && (
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>+{uni.facilities.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* University list below map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {markers.map((uni) => {
          const badge = getAdmissionBadge(uni.admission_probability);
          const isGov = uni.type === 'Government';
          return (
            <div key={uni.name} className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${
              uni.isPreferred ? 'border-amber-300 bg-amber-50' : isGov ? 'border-emerald-200 bg-emerald-50' : 'border-purple-200 bg-purple-50'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                uni.isPreferred ? 'bg-amber-500' : isGov ? 'bg-emerald-600' : 'bg-purple-600'
              }`}>
                {uni.national_rank ? `#${uni.national_rank}` : isGov ? 'G' : 'P'}
              </div>
              <div className="min-w-0">
                <p className="text-slate-800 text-sm font-semibold truncate">{uni.name}</p>
                <p className="text-slate-400 text-xs">{uni.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium" style={{ color: badge.bg }}>
                    {(uni.admission_probability * 100).toFixed(0)}% admission
                  </span>
                  {uni.z_score_requirement && (
                    <span className="text-slate-400 text-xs">Z: {uni.z_score_requirement}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

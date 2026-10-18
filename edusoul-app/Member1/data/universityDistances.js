import districtOrigins from './districtOrigins.json' with { type: 'json' };
import stateUniversities from './stateUniversities.json' with { type: 'json' };

export function validCoordinates(point) {
  return !!point && Number.isFinite(point.lat) && Number.isFinite(point.lon) && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180;
}

export function resolveUniversityCoordinates(university) {
  const name = typeof university?.name === 'string' ? university.name.trim().toLowerCase() : '';
  const campus = stateUniversities.universities.find(uni => [uni.name, ...uni.aliases].some(alias => alias.toLowerCase() === name));
  // Sourced campus updates also repair older saved responses with null/stale coordinates.
  if (validCoordinates(campus?.coordinates)) return campus.coordinates;
  return validCoordinates(university?.coordinates) ? university.coordinates : null;
}

export function districtOrigin(district) {
  if (typeof district !== 'string') return null;
  const name = Object.keys(districtOrigins.districts).find(name => name.toLowerCase() === district.trim().toLowerCase());
  return name ? { district: name, ...districtOrigins.districts[name] } : null;
}

export function straightLineDistanceKm(from, to) {
  if (!validCoordinates(from) || !validCoordinates(to)) return null;
  const radians = value => value * Math.PI / 180;
  const deltaLat = radians(to.lat - from.lat);
  const deltaLon = radians(to.lon - from.lon);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(deltaLon / 2) ** 2;
  const bounded = Math.min(1, Math.max(0, a));
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(bounded), Math.sqrt(1 - bounded));
}

export function universityDistanceRows(universities = [], district) {
  const origin = districtOrigin(district);
  const seen = new Set();
  return universities.filter(uni => {
    if (typeof uni?.name !== 'string' || !uni.name.trim()) return false;
    const key = uni.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(uni => {
    const coordinates = resolveUniversityCoordinates(uni);
    return { ...uni, coordinates, distanceKm: origin ? straightLineDistanceKm(origin, coordinates) : null };
  })
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || a.name.localeCompare(b.name));
}

export function drivingDirectionsUrl(origin, destination) {
  if (!validCoordinates(origin) || !validCoordinates(destination)) return null;
  const params = new URLSearchParams({ api: '1', origin: `${origin.lat},${origin.lon}`, destination: `${destination.lat},${destination.lon}`, travelmode: 'driving' });
  return `https://www.google.com/maps/dir/?${params}`;
}

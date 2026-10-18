import { validCoordinates } from './universityDistances.js';

export function transitDirectionsUrl(origin, destination) {
  if (!validCoordinates(origin) || !validCoordinates(destination)) return null;
  const params = new URLSearchParams({ api: '1', origin: `${origin.lat},${origin.lon}`, destination: `${destination.lat},${destination.lon}`, travelmode: 'transit' });
  return `https://www.google.com/maps/dir/?${params}`;
}

function parseRouteOption(route) {
  if (!route || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0 || route.geometry?.type !== 'LineString' || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2) {
    throw new Error('Road route unavailable');
  }
  const points = route.geometry.coordinates.map(point => {
    if (!Array.isArray(point) || !validCoordinates({ lat: point[1], lon: point[0] })) throw new Error('Invalid route geometry');
    return { lat: point[1], lon: point[0] };
  });
  const roads = [];
  for (const leg of route.legs || []) for (const step of leg.steps || []) {
    const label = [step.name, step.ref].filter(value => typeof value === 'string' && value.trim()).join(' · ');
    if (!label || !Number.isFinite(step.distance) || step.distance <= 0) continue;
    const previous = roads.at(-1);
    if (previous?.label === label) previous.distanceKm += step.distance / 1000;
    else roads.push({ label, distanceKm: step.distance / 1000 });
  }
  return { distanceKm: route.distance / 1000, durationMinutes: Math.ceil(route.duration / 60), points, roads };
}

export function parseRoadRoute(data) {
  if (data?.code !== 'Ok' || !Array.isArray(data.routes)) throw new Error('Road route unavailable');
  const routes = data.routes.flatMap(route => {
    try { return [parseRouteOption(route)]; } catch { return []; }
  }).sort((a, b) => a.distanceKm - b.distanceKm || a.durationMinutes - b.durationMinutes);
  if (!routes.length) throw new Error('Road route unavailable');
  return { ...routes[0], routeCount: routes.length, routeSelection: 'shortest_returned_alternative' };
}

export async function fetchRoadRoute(origin, destination, { signal, fetchImpl = fetch, baseUrl = 'https://router.project-osrm.org' } = {}) {
  if (!validCoordinates(origin) || !validCoordinates(destination)) throw new Error('Invalid route endpoints');
  const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/route/v1/driving/${coordinates}?alternatives=true&overview=full&geometries=geojson&steps=true`, { signal });
  if (!response.ok) throw new Error('Road routing service unavailable');
  return parseRoadRoute(await response.json());
}

// Cards and the map share requests and successful results for five minutes.
// Limit concurrent calls when a recommendation contains several institutions.
export function createRoadRouteLoader(fetchRoute = fetchRoadRoute) {
  const cache = new Map();
  const queue = [];
  let active = 0;
  function drain() {
    while (active < 3 && queue.length) {
      active++;
      queue.shift()();
    }
  }
  return (origin, destination, baseUrl = 'https://router.project-osrm.org') => {
    if (!validCoordinates(origin) || !validCoordinates(destination)) return Promise.reject(new Error('Invalid route endpoints'));
    const key = `${baseUrl}:${origin.lat},${origin.lon}:${destination.lat},${destination.lon}`;
    const saved = cache.get(key);
    if (saved && saved.expires > Date.now()) return saved.promise;
    const entry = { expires: Infinity };
    entry.promise = new Promise((resolve, reject) => {
      queue.push(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const route = await fetchRoute(origin, destination, { baseUrl, signal: controller.signal });
          entry.expires = Date.now() + 300000;
          resolve(route);
        } catch (error) {
          cache.delete(key);
          reject(error);
        } finally {
          clearTimeout(timeout);
          active--;
          drain();
        }
      });
    });
    cache.set(key, entry);
    drain();
    return entry.promise;
  };
}

export const loadRoadRoute = createRoadRouteLoader();

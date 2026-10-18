import { useEffect, useState } from 'react';
import { loadRoadRoute } from '../data/roadRoutes';

export default function useRoadRoute(origin, destination, attempt = 0) {
  const key = origin && destination ? `${origin.lat},${origin.lon}:${destination.lat},${destination.lon}` : '';
  const [state, setState] = useState({ key: '', status: 'idle', route: null });
  useEffect(() => {
    if (!key) return;
    let active = true;
    setState({ key, status: 'loading', route: null });
    loadRoadRoute(origin, destination, import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org')
      .then(route => { if (active) setState({ key, status: 'ready', route }); })
      .catch(() => { if (active) setState({ key, status: 'error', route: null }); });
    return () => { active = false; };
    // Coordinates identify a journey independently of the containing result object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);
  return state.key === key ? state : { status: key ? 'loading' : 'idle', route: null };
}

// API Configuration
// In development, Vite's proxy forwards /api/* to localhost:8000
// In production or ngrok, set the full URL here

const API_BASE = import.meta.env.VITE_API_BASE || '';

export const API = {
  BASE: API_BASE,
  HEALTH: `${API_BASE}/api/health`,
  SUGGEST_SKILLS: `${API_BASE}/api/suggest-skills`,
  SUGGEST_DEGREES: `${API_BASE}/api/suggest-degrees`,
  GENERATE_PATHWAY: `${API_BASE}/api/generate-pathway`,
  GENERATE_TOP3: `${API_BASE}/api/generate-top3`,
  GRAPH_DATA: `${API_BASE}/api/graph-data`,
};

export default API;

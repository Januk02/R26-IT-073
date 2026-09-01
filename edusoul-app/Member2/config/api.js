// API configuration for Career Pathway AI microservice
const API_BASE = 'http://localhost:8008/api';

export const API = {
  BASE_URL: API_BASE,
  HEALTH: `${API_BASE}/health`,
  SUGGEST_SKILLS: `${API_BASE}/suggest-skills`,
  SUGGEST_DEGREES: `${API_BASE}/suggest-degrees`,
  GENERATE_PATHWAY: `${API_BASE}/generate-pathway`,
  GENERATE_TOP3: `${API_BASE}/generate-top3`,
  GRAPH_DATA: `${API_BASE}/graph-data`,
};

export default API;

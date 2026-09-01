const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8006';

/**
 * Maps frontend form data to the backend /recommend endpoint format
 */
function mapFormDataToBackend(formData) {
  const personalityScores = formData.personalityScores || {};

  // Build personality description from scores
  const traitDescriptions = Object.entries(personalityScores)
    .filter(([, score]) => score >= 7)
    .map(([trait]) => trait.replace(/_/g, ' '));

  const lifestyle = formData.lifestylePreferences || {};

  // Map lifestyle string values to numeric (1-5) for model features
  const lifestyleToNumeric = (val) => {
    const map = {
      'Very Important': 5, 'Important': 4, 'Moderate': 3, 'Not Important': 2, 'Irrelevant': 1,
      'Very High': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Very Low': 1,
      'Urban': 5, 'Suburban': 3, 'Rural': 1, 'Any': 3,
    };
    if (typeof val === 'number') return val;
    return map[val] || 3;
  };

  const predictedPerf = formData.academicResults?.predictedPerformance || {};

  return {
    dream_job: formData.dreamJob || '',
    z_score: parseFloat(formData.academicResults?.zScore) || 0,
    stream: formData.academicResults?.stream || '',
    district: formData.personalInfo?.district || '',
    personality_description: traitDescriptions.join(', '),
    detected_traits: traitDescriptions,
    // Personality scores mapped to 1-5 scale for model (all 10 traits)
    analytical_skill: Math.round((personalityScores.analytical_thinking || 5) / 2),
    creativity: Math.round((personalityScores.creativity || 5) / 2),
    leadership: Math.round((personalityScores.leadership || 5) / 2),
    communication_skill: Math.round((personalityScores.communication || 5) / 2),
    problem_solving: Math.round((personalityScores.problem_solving || 5) / 2),
    teamwork: Math.round((personalityScores.teamwork || 5) / 2),
    adaptability: Math.round((personalityScores.adaptability || 5) / 2),
    attention_to_detail: Math.round((personalityScores.attention_to_detail || 5) / 2),
    entrepreneurial_mindset: Math.round((personalityScores.entrepreneurial_mindset || 5) / 2),
    risk_taking: Math.round((personalityScores.risk_taking || 5) / 2),
    // Lifestyle features mapped to backend keys (all 10 collected factors)
    preferred_location: lifestyle.locationPreference || 'Any',
    stress_tolerance: lifestyleToNumeric(lifestyle.stressTolerance || 'Medium'),
    work_life_balance_priority: lifestyleToNumeric(lifestyle.workLifeBalance || 'Moderate'),
    family_attachment_level: lifestyleToNumeric(lifestyle.familyAttachment || 'Moderate'),
    financial_stability_need: lifestyleToNumeric(lifestyle.salaryExpectation || 'Medium'),
    career_sustainability_priority: lifestyleToNumeric(lifestyle.careerGrowth || 'Moderate'),
    innovation_interest: Math.round((personalityScores.creativity || 5) / 2),
    social_impact_priority: lifestyleToNumeric(lifestyle.socialImpact || 'Medium'),
    travel_tolerance: lifestyleToNumeric(lifestyle.travelTolerance || 'Medium'),
    work_environment: lifestyle.workEnvironment || 'Hybrid',
    social_interaction: lifestyle.socialInteraction || 'Ambivert',
    // Predicted academic performance
    predicted_improvement: predictedPerf.improvement || 'Medium',
    predicted_potential_z_score: parseFloat(predictedPerf.potentialZScore) || 0,
    // Pass full personality scores for enhanced matching
    personality_scores: personalityScores,
    // Pass lifestyle preferences
    lifestyle_preferences: lifestyle,
    // Pass personal info
    name: formData.personalInfo?.name || '',
    age: formData.personalInfo?.age || '',
    // Pass subject grades
    subject_grades: formData.academicResults?.subjects || {},
  };
}

/**
 * Fetches degree + university recommendations from the backend
 */
export async function getRecommendations(formData) {
  const payload = mapFormDataToBackend(formData);

  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Backend returned ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches backward analysis (career requirements) for a dream job
 */
export async function getBackwardAnalysis(dreamJob) {
  const response = await fetch(`${API_BASE_URL}/backward-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dream_job: dreamJob }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Backend returned ${response.status}`);
  }

  return response.json();
}

/**
 * Health check - verifies backend is reachable
 */
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
  if (!response.ok) throw new Error('Backend is not reachable');
  return response.json();
}

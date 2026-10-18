const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:8006';

/**
 * Maps frontend form data to the backend /recommend endpoint format
 */
export function mapFormDataToBackend(formData) {
  const dreamJob = formData.dreamJob ?? formData.dream_job ?? '';
  const stream = formData.academicResults?.stream ?? formData.stream ?? '';
  const district = formData.personalInfo?.district ?? formData.district ?? '';
  const zScore = formData.academicResults?.zScore ?? formData.z_score;
  const personalityScores = formData.personalityScores || {};

  // Build personality description from scores
  const traitDescriptions = Object.entries(personalityScores)
    .filter(([, score]) => score >= 7)
    .map(([trait]) => trait.replace(/_/g, ' '));

  const lifestyle = formData.lifestylePreferences || {};
  const traitFeature = (key) => personalityScores[key] == null ? undefined : Math.round(Number(personalityScores[key]) / 2);

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
    dream_job: dreamJob,
    z_score: parseFloat(zScore) || 0,
    stream,
    district,
    personality_description: traitDescriptions.join(', '),
    detected_traits: traitDescriptions,
    // Personality scores mapped to 1-5 scale for model (all 10 traits)
    analytical_skill: traitFeature('analytical_thinking'),
    creativity: traitFeature('creativity'),
    leadership: traitFeature('leadership'),
    communication_skill: traitFeature('communication'),
    problem_solving: traitFeature('problem_solving'),
    teamwork: traitFeature('teamwork'),
    adaptability: traitFeature('adaptability'),
    attention_to_detail: traitFeature('attention_to_detail'),
    entrepreneurial_mindset: traitFeature('entrepreneurial_mindset'),
    risk_taking: traitFeature('risk_taking'),
    // Lifestyle features mapped to backend keys (all 10 collected factors)
    preferred_location: lifestyle.locationPreference,
    stress_tolerance: lifestyle.stressTolerance == null ? undefined : lifestyleToNumeric(lifestyle.stressTolerance),
    work_life_balance_priority: lifestyle.workLifeBalance == null ? undefined : lifestyleToNumeric(lifestyle.workLifeBalance),
    family_attachment_level: lifestyle.familyAttachment == null ? undefined : lifestyleToNumeric(lifestyle.familyAttachment),
    financial_stability_need: lifestyle.salaryExpectation == null ? undefined : lifestyleToNumeric(lifestyle.salaryExpectation),
    career_sustainability_priority: lifestyle.careerGrowth == null ? undefined : lifestyleToNumeric(lifestyle.careerGrowth),
    innovation_interest: traitFeature('creativity'),
    social_impact_priority: lifestyle.socialImpact == null ? undefined : lifestyleToNumeric(lifestyle.socialImpact),
    travel_tolerance: lifestyle.travelTolerance == null ? undefined : lifestyleToNumeric(lifestyle.travelTolerance),
    work_environment: lifestyle.workEnvironment,
    social_interaction: lifestyle.socialInteraction,
    // Predicted academic performance
    predicted_improvement: predictedPerf.improvement,
    predicted_potential_z_score: predictedPerf.potentialZScore === '' || predictedPerf.potentialZScore == null ? undefined : Number(predictedPerf.potentialZScore),
    // Pass full personality scores for enhanced matching
    personality_scores: personalityScores,
    // Pass lifestyle preferences
    lifestyle_preferences: lifestyle,
    // Pass personal info
    name: formData.personalInfo?.name || '',
    age: formData.personalInfo?.age || '',
    common_general_test: formData.academicResults?.commonGeneralTest,
    skill_scores: formData.skillScores,
    // Pass subject grades
    subject_grades: Object.fromEntries(Object.entries(formData.academicResults?.subjects || {}).filter(([, grade]) => grade !== '' && grade != null)),
  };
}

/**
 * Fetches degree + university recommendations from the backend
 */
export async function getRecommendations(formData) {
  const payload = mapFormDataToBackend(formData);
  if (Object.keys(payload.subject_grades).length > 3) {
    const error = new Error('Keep at most three A/L subjects. Remove the extra saved subjects below.');
    error.fieldErrors = { subject_grades: error.message };
    error.code = 'validation_error';
    throw error;
  }
  const rawZScore = formData.academicResults?.zScore ?? formData.z_score;
  const parsedZScore = Number(rawZScore);

  // Do not send an invalid profile to the server. This makes validation errors
  // actionable in the UI and prevents repeated 400 responses while a form is empty.
  if (!String(payload.dream_job).trim()) {
    throw new Error('Please select a career goal before requesting recommendations.');
  }
  if (!String(payload.stream).trim()) {
    throw new Error('Please select your A/L stream before requesting recommendations.');
  }
  if (rawZScore === undefined || rawZScore === null || String(rawZScore).trim() === '' || !Number.isFinite(parsedZScore) || payload.z_score < -4 || payload.z_score > 4) {
    throw new Error('Please enter a valid Z-Score between -4 and 4.');
  }

  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `Backend returned ${response.status}`);
    error.fieldErrors = errorData.field_errors || {};
    error.code = errorData.code;
    throw error;
  }

  return response.json();
}

/**
 * Fetches backward analysis (career requirements) for a dream job
 */
export async function getBackwardAnalysis(dreamJob, formData) {
  const response = await fetch(`${API_BASE_URL}/backward-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData ? { ...mapFormDataToBackend(formData), dream_job: dreamJob } : { dream_job: dreamJob }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `Backend returned ${response.status}`);
    error.fieldErrors = errorData.field_errors || {};
    error.code = errorData.code;
    throw error;
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

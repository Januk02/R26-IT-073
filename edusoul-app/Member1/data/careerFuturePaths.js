import catalog from './careerCatalog.json' with { type: 'json' };

export function careerJourneyForCareer(career, analysis = {}) {
  const selected = career || analysis.goal;
  const job = catalog.jobs.find(item => item.title.en === selected);
  if (!job?.careerJourney) return null;
  return {
    goal: job.careerJourney.goal.en,
    backward: job.careerJourney.backward.map(item => item.en),
    forward: job.careerJourney.forward.map(item => item.en),
  };
}

// Saved recommendations may contain an older, generic roadmap. Refresh only
// its editorial content; retain the student's checks and degree evidence.
export function refreshCareerPlan(plan) {
  const job = catalog.jobs.find(item => item.title.en === plan?.career);
  if (!job || (plan.future_path_version === catalog.future_path_version && plan.journey_version === catalog.journey_version)) return plan;
  const previous = new Map((plan.roadmap_stages || []).map(step => [step.id, step]));
  const legacyIds = { university: 'qualification', skills: 'foundation', portfolio: 'practice', internship: 'experience' };
  const stages = futurePathForCareer(job.title.en).map(step => {
    const saved = { ...(previous.get(step.id) || previous.get(legacyIds[step.id])) };
    if (job.routeType === 'professional' && saved.goal_relation !== 'direct') {
      delete saved.degree;
      delete saved.institution;
      delete saved.goal_relation;
    }
    return { ...saved, ...step, status: saved.status ||
      (job.routeType === 'professional' || ['entry', 'qualification', 'university'].includes(step.id)
        ? 'verification_required' : 'planned') };
  });
  return { ...plan, qualification: job.qualification.en, roadmap_stages: stages,
    backward_steps: stages.filter(step => !step.optional).reverse(),
    future_path_version: catalog.future_path_version, journey_version: catalog.journey_version,
    career_journey: careerJourneyForCareer(job.title.en) };
}

export function futurePathForCareer(career, analysis = {}) {
  const selected = career || analysis.goal;
  const configured = catalog.jobs.find(job => job.title.en === selected)?.futurePathSteps;
  // The selected goal and current catalog take priority over older saved responses.
  if (configured?.length) return configured.map(step => ({
    id: step.id, title: step.title.en, description: step.description.en,
    optional: step.optional || false,
  }));
  if (analysis.goal !== selected || !Array.isArray(analysis.career_path_steps)) return [];
  return analysis.career_path_steps.filter(step => step && typeof step.id === 'string'
    && typeof step.title === 'string' && typeof step.description === 'string');
}

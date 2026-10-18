export function universityStatus(university) {
  if (university.eligibility_status === 'minimum_requirements_not_met') return 'requirements_not_met';
  if (university.sector === 'private' || university.type === 'Private' || university.admission_route === 'institution_specific') return 'verification_required';
  if (university.eligibility_status === 'meets_reference') return 'meets_reference';
  if (university.eligibility_status === 'below_reference') return 'below_reference';
  return 'verification_required';
}

export const universityStatusLabels = {
  meets_reference: 'Meets stored cutoff; verify admission',
  below_reference: 'Below stored cutoff',
  requirements_not_met: 'Supplied entry requirements not met',
  verification_required: 'Admission requirements need checking',
};

export function partitionUniversities(universities = []) {
  return {
    options: universities.filter(uni => ['meets_reference', 'verification_required'].includes(universityStatus(uni))),
    gaps: universities.filter(uni => ['below_reference', 'requirements_not_met'].includes(universityStatus(uni))),
  };
}

export function recommendationMapTarget(recommendations = [], modelPrediction, selectedDegree, selectedUniversity) {
  const degree = selectedDegree || (modelPrediction?.status === 'available' ? modelPrediction.degree : null) || recommendations[0]?.degree;
  const recommendation = recommendations.find(rec => rec.degree === degree);
  const options = [
    ...(recommendation?.university_options?.government || []).map(uni => ({ ...uni, type: 'Government' })),
    ...(recommendation?.university_options?.private || []).map(uni => ({ ...uni, type: 'Private' })),
  ];
  const requestedName = selectedUniversity || (modelPrediction?.status === 'available' && modelPrediction.degree === degree ? modelPrediction.university?.name : null) || recommendation?.university;
  // Never swap a missing or unlocated requested campus for another university.
  const university = requestedName ? options.find(uni => uni.name === requestedName) : partitionUniversities(options).options[0];
  return { degree, university: university || null };
}

export function degreeUniversitySummary(recommendation) {
  const government = recommendation.university_options?.government || [];
  const privateOptions = recommendation.university_options?.private || [];
  const universities = [...government, ...privateOptions];
  if (!universities.length) return 'No university is mapped to this degree in the current catalog.';
  if (universities.some(uni => universityStatus(uni) === 'meets_reference')) return 'Some universities meet the stored cutoff. Current admission requirements still need checking.';
  if (government.some(uni => universityStatus(uni) === 'below_reference')) return 'Your Z-score is below the available stored cutoffs for this degree. Other entry routes need checking.';
  if (universities.every(uni => universityStatus(uni) === 'requirements_not_met')) return 'Your supplied results do not meet the checked entry requirements for this degree.';
  return 'University options are listed for this degree. Admission requirements need checking.';
}

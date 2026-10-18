import { canonicalSubject, subjectCombinationIssues, subjectIssueMessages } from './alSubjectValidation.js';
import { dreamJobs } from './dreamDegreeData.js';
import { ALL_DISTRICTS, STREAM_SUBJECTS } from './advisorIntakeData.js';

export function prepareStreamSubjects(stream, saved = {}) {
  const rule = STREAM_SUBJECTS[stream];
  const allowed = new Set(Object.values(rule?.subjectBuckets || {}).flatMap(group => group.subjects));
  const subjects = {};
  let adjusted = false;
  for (const [name, grade] of Object.entries(saved || {})) {
    const key = canonicalSubject(name);
    if (!allowed.has(key)) { adjusted = true; continue; }
    if (Object.hasOwn(subjects, key)) {
      if (subjects[key] !== grade) subjects[key] = '';
      adjusted = true;
    } else subjects[key] = grade;
  }
  // Several valid saved subjects do not identify the actual exam combination.
  // Ask for a fresh selection rather than choosing three grades arbitrarily.
  const required = rule?.required || [];
  const ordered = Object.fromEntries(required.map(subject => [subject, subjects[subject] ?? '']));
  for (const [subject, grade] of Object.entries(subjects)) {
    if (!Object.hasOwn(ordered, subject)) ordered[subject] = grade;
  }
  const requiresReselection = Object.keys(ordered).length > 3;
  return {
    subjects: requiresReselection ? Object.fromEntries((rule?.required || []).map(subject => [subject, ''])) : ordered,
    adjusted: adjusted || requiresReselection,
    requiresReselection,
  };
}

export function createIntake(data = {}) {
  const { subjects } = prepareStreamSubjects(data.academicResults?.stream, data.academicResults?.subjects);
  return {
    personalInfo: { name: '', age: '', district: '', ...data.personalInfo },
    dreamJob: data.dreamJob || '',
    academicResults: { stream: '', zScore: '', ...data.academicResults, subjects },
    personalityScores: { ...data.personalityScores },
    skillScores: { ...data.skillScores },
    lifestylePreferences: { ...data.lifestylePreferences },
  };
}

export function intakeSubjectOptions(stream, subjects, index) {
  const entries = Object.entries(subjects || {});
  const current = entries[index]?.[0];
  const otherSubjects = entries.filter((_, position) => position !== index).map(([name]) => name);
  const groups = STREAM_SUBJECTS[stream]?.subjectBuckets || {};
  return Object.entries(groups).map(([label, group]) => ({
    label,
    subjects: group.subjects.filter(subject => subject === current || (
      !otherSubjects.includes(subject) &&
      !subjectCombinationIssues(stream, [...otherSubjects, subject], { scope: 'intake' }).length
    )),
  })).filter(group => group.subjects.length);
}

export function validateIntake(data) {
  const errors = {};
  if (!dreamJobs.some(job => job.title === data.dreamJob)) errors.career = 'Select a supported career goal.';
  if (!STREAM_SUBJECTS[data.academicResults.stream]) errors.stream = 'Select your A/L stream.';
  if (!ALL_DISTRICTS.includes(data.personalInfo.district)) errors.district = 'Select your examination district.';
  const z = data.academicResults.zScore;
  if (String(z).trim() === '' || !Number.isFinite(Number(z)) || Number(z) < -4 || Number(z) > 4) errors.zScore = 'Please enter a valid Z-Score between -4 and 4.';
  const subjects = Object.entries(data.academicResults.subjects || {});
  if (subjects.length > 3) errors.subjects = 'Keep at most three A/L subjects. Remove the extra saved subjects below.';
  else if (subjects.some(([subject, grade]) => !subject.trim() || (grade !== '' && grade != null && !['A', 'B', 'C', 'S', 'F'].includes(grade)))) errors.subjects = 'Use A, B, C, S or F for subject grades.';
  const issues = subjectCombinationIssues(data.academicResults.stream, subjects.map(([subject]) => subject), { scope: 'intake' });
  if (!errors.subjects && issues.length) errors.subjects = subjectIssueMessages[issues[0]];
  for (const [key, min, max] of [['commonGeneralTest', 0, 100]]) {
    const value = data.academicResults[key];
    if (value != null && value !== '' && (!Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max)) errors[key] = 'Enter a mark between 0 and 100.';
  }
  const potential = data.academicResults.predictedPerformance?.potentialZScore;
  if (potential != null && potential !== '' && (!Number.isFinite(Number(potential)) || Number(potential) < -4 || Number(potential) > 4)) errors.potentialZScore = 'Please enter a valid Z-Score between -4 and 4.';
  const age = data.personalInfo.age;
  if (age !== '' && (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120)) errors.age = 'Enter an age between 0 and 120.';
  return errors;
}

// Only the three visible subject slots can change the submitted evidence.
export function updateIntakeSubject(subjects, index, name, grade) {
  const entries = Object.entries(subjects || {});
  if (!Number.isInteger(index) || index < 0 || index >= 3) return subjects;
  if (name && entries.some(([subject], position) => subject === name && position !== index)) return subjects;
  entries[index] = [name, grade];
  return Object.fromEntries(entries.filter(entry => entry && entry[0]));
}

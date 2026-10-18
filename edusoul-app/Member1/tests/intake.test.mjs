import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntake, validateIntake, updateIntakeSubject, prepareStreamSubjects, intakeSubjectOptions } from '../data/advisorIntake.js';
import { mapFormDataToBackend } from '../services/apiService.js';
import { workspaceMessages } from '../data/advisorWorkspaceTranslations.js';
import { translateAdvisor } from '../data/advisorLocale.js';

const essentials = () => createIntake({ dreamJob: 'Software Engineer', personalInfo: { district: 'Colombo' }, academicResults: { stream: 'Physical Science', zScore: '0' } });

test('four essentials can be submitted without forced assessments or personal details', () => {
  const data = essentials();
  assert.deepEqual(validateIntake(data), {});
  const payload = mapFormDataToBackend(data);
  assert.equal(payload.z_score, 0);
  assert.deepEqual(payload.personality_scores, {});
  assert.deepEqual(payload.lifestyle_preferences, {});
  assert.deepEqual(payload.skill_scores, {});
});

test('inline validation distinguishes missing, invalid and negative academic scores', () => {
  assert.deepEqual(Object.keys(validateIntake(createIntake())), ['career', 'stream', 'district', 'zScore']);
  for (const zScore of ['-4', '-1.25', '0', '4']) {
    const data = essentials(); data.academicResults.zScore = zScore;
    assert.deepEqual(validateIntake(data), {});
  }
  for (const zScore of ['', 'abc', 'Infinity', '4.01', '-4.01']) {
    const data = essentials(); data.academicResults.zScore = zScore;
    assert.ok(validateIntake(data).zScore);
  }
});

test('optional evidence is retained and validated before submitting', () => {
  const data = essentials();
  data.personalityScores.creativity = 0;
  data.academicResults.subjects = { Physics: 'A' };
  data.academicResults.commonGeneralTest = '0';
  assert.deepEqual(validateIntake(data), {});
  assert.equal(mapFormDataToBackend(data).personality_scores.creativity, 0);
  assert.deepEqual(mapFormDataToBackend(data).subject_grades, { Physics: 'A' });
  data.academicResults.commonGeneralTest = '101';
  data.academicResults.predictedPerformance = { potentialZScore: '5' };
  data.personalInfo.age = '121';
  assert.deepEqual(Object.keys(validateIntake(data)), ['commonGeneralTest', 'potentialZScore', 'age']);
});

test('new workspace copy is available in Sinhala and Tamil', () => {
  for (const text of Object.keys(workspaceMessages)) {
    for (const language of ['si', 'ta']) assert.notEqual(translateAdvisor(text, language), text);
  }
});

test('legacy subjects outside the selected stream are excluded from the form and payload', () => {
  const original = { Physics: 'A', Chemistry: 'B', 'Combined Mathematics': 'A', 'Computer Science': 'C' };
  const data = essentials();
  data.academicResults.subjects = original;
  assert.ok(validateIntake(data).subjects);
  data.academicResults.subjects = createIntake(data).academicResults.subjects;
  assert.deepEqual(Object.keys(data.academicResults.subjects), ['Combined Mathematics', 'Physics', 'Chemistry']);
  assert.deepEqual(validateIntake(data), {});
  assert.equal(Object.keys(mapFormDataToBackend(data).subject_grades).length, 3);
  assert.equal(Object.keys(original).length, 4);
});

test('mixed saved subjects only load the selected stream and never choose arbitrary grades', () => {
  const saved = { 'Political Science': 'B', 'Business Studies': 'B', Accounting: 'B', Economics: 'A', 'Combined Mathematics': 'B', 'Applied Mathematics': 'B', Physics: 'B' };
  const physical = prepareStreamSubjects('Physical Science', saved);
  assert.deepEqual(physical.subjects, { 'Combined Mathematics': 'B', Physics: 'B' });
  assert.equal(physical.adjusted, true);
  const commerce = prepareStreamSubjects('Commerce', saved);
  assert.equal(commerce.requiresReselection, false);
  assert.deepEqual(commerce.subjects, { 'Business Studies': 'B', Accounting: 'B', Economics: 'A' });
  const ambiguousCommerce = prepareStreamSubjects('Commerce', { ...commerce.subjects, 'Business Statistics': 'C' });
  assert.equal(ambiguousCommerce.requiresReselection, true);
  assert.deepEqual(ambiguousCommerce.subjects, {});
  assert.equal(Object.keys(saved).length, 7);
});

test('ambiguous saved core subjects reset to ungraded stream requirements only', () => {
  const prepared = prepareStreamSubjects('Biological Science', { Biology: 'A', Chemistry: 'B', Physics: 'A', 'Agricultural Science': 'B' });
  assert.equal(prepared.requiresReselection, true);
  assert.deepEqual(prepared.subjects, { Biology: '', Chemistry: '' });
  const data = createIntake({ academicResults: { stream: 'Biological Science', subjects: prepared.subjects } });
  assert.deepEqual(mapFormDataToBackend(data).subject_grades, {});
  assert.deepEqual(prepareStreamSubjects('', { Physics: 'A' }).subjects, {});
});

test('subject rows handle empty positions without losing grades or duplicating subjects', () => {
  assert.deepEqual(updateIntakeSubject({}, 2, 'Physics', 'A'), { Physics: 'A' });
  assert.deepEqual(updateIntakeSubject({ Physics: 'A', Chemistry: 'B' }, 1, 'Physics', 'C'), { Physics: 'A', Chemistry: 'B' });
  const data = essentials();
  data.academicResults.subjects = { Physics: 'Z' };
  assert.ok(validateIntake(data).subjects);
});

test('visible third-subject choices contain only compatible subjects', () => {
  const options = (stream, subjects, index) => intakeSubjectOptions(stream, subjects, index).flatMap(group => group.subjects);
  assert.deepEqual(options('Physical Science', { 'Combined Mathematics': 'A', Physics: 'B' }, 2), ['Chemistry', 'Information & Communication Technology']);
  assert.deepEqual(options('Biological Science', { Biology: 'A', Chemistry: 'B' }, 2), ['Physics', 'Agricultural Science']);
  assert.deepEqual(options('Commerce', { Accounting: 'A', 'Business Statistics': 'B' }, 2), ['Business Studies', 'Economics']);
  assert.ok(!options('Arts', { Buddhism: 'A' }, 1).includes('Buddhist Civilization'));
});

test('re-normalising an old in-memory draft removes hidden evidence before submission', () => {
  const original = { dreamJob: 'Software Engineer', personalInfo: { district: 'Colombo' }, academicResults: { stream: 'Physical Science', zScore: '1.5', subjects: { Accounting: 'A', 'Political Science': 'B', Physics: 'C', 'Combined Mathematics': 'B' } } };
  const visible = createIntake(original);
  assert.deepEqual(mapFormDataToBackend(visible).subject_grades, { 'Combined Mathematics': 'B', Physics: 'C' });
  assert.deepEqual(createIntake(visible), visible);
  assert.deepEqual(validateIntake(visible), {});
});

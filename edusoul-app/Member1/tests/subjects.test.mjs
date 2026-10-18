import test from 'node:test';
import assert from 'node:assert/strict';
import cases from '../data/alSubjectCases.json' with { type: 'json' };
import catalog from '../data/alSubjectRules.json' with { type: 'json' };
import { subjectCombinationIssues, subjectIssueMessages, canonicalSubject } from '../data/alSubjectValidation.js';
import { createIntake, validateIntake } from '../data/advisorIntake.js';
import { translateAdvisor } from '../data/advisorLocale.js';

for (const item of cases) test(`UGC subject guidance: ${item.id}`, () => {
  assert.equal(subjectCombinationIssues(item.stream, item.subjects).length === 0, item.valid);
});

test('legacy spellings become the canonical exam subject without changing grades', () => {
  assert.equal(canonicalSubject('ICT'), 'Information & Communication Technology');
  assert.equal(canonicalSubject('Bio Systems Technology'), 'Biosystems Technology');
  const data = createIntake({ dreamJob: 'Software Engineer', personalInfo: { district: 'Colombo' }, academicResults: { stream: 'Engineering Technology', zScore: 1.5, subjects: { 'Engineering Technology': 'A', 'Science for Technology': 'B', ICT: 'C' } } });
  assert.deepEqual(validateIntake(data), {});
  assert.equal(data.academicResults.subjects['Information & Communication Technology'], 'C');
});

test('new subject choices, basket guidance and validation copy have Sinhala and Tamil translations', () => {
  const texts = new Set(Object.values(subjectIssueMessages));
  for (const stream of Object.values(catalog.streams)) {
    texts.add(stream.hint);
    texts.add(stream.intakeHint);
    for (const group of [...stream.groups, ...stream.intakeGroups]) { texts.add(group.label); group.subjects.forEach(subject => texts.add(subject)); }
  }
  for (const text of texts) for (const language of ['si', 'ta']) assert.notEqual(translateAdvisor(text, language), text, `${language}: ${text}`);
});


test('intake uses common school-stream lists separately from broad UGC course references', () => {
  const subjects = stream => catalog.streams[stream].intakeGroups.flatMap(group => group.subjects);
  assert.deepEqual(subjects('Biological Science'), ['Biology', 'Chemistry', 'Physics', 'Agricultural Science']);
  assert.deepEqual(subjects('Physical Science'), ['Combined Mathematics', 'Physics', 'Chemistry', 'Information & Communication Technology']);
  assert.deepEqual(catalog.streams['Engineering Technology'].intakeGroups[1].subjects, ['Information & Communication Technology', 'Agricultural Science', 'Geography', 'Economics', 'Business Studies', 'Art']);
  assert.deepEqual(subjects('Commerce'), ['Accounting', 'Business Studies', 'Economics', 'Business Statistics', 'Information & Communication Technology']);
  assert.equal(subjectCombinationIssues('Biological Science', ['Biology', 'Chemistry', 'Combined Mathematics']).length, 0);
  assert.ok(subjectCombinationIssues('Biological Science', ['Biology', 'Chemistry', 'Combined Mathematics'], { scope: 'intake' }).length);
  assert.ok(subjectCombinationIssues('Physical Science', ['Combined Mathematics', 'Chemistry', 'Information & Communication Technology'], { scope: 'intake' }).includes('stream_core_required'));
});

test('intake core subjects appear first, keep actual grades and never receive invented grades', () => {
  const profile = createIntake({ academicResults: { stream: 'Physical Science', subjects: { Chemistry: 'A', Physics: 'B', 'Combined Mathematics': 'C' } } });
  assert.deepEqual(Object.keys(profile.academicResults.subjects), ['Combined Mathematics', 'Physics', 'Chemistry']);
  assert.equal(profile.academicResults.subjects.Physics, 'B');
  assert.deepEqual(createIntake({ academicResults: { stream: 'Physical Science' } }).academicResults.subjects, { 'Combined Mathematics': '', Physics: '' });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../data/careerCatalog.json' with { type: 'json' };
import { dreamJobs } from '../data/dreamDegreeData.js';
import { translateAdvisor } from '../data/advisorLocale.js';
import { createIntake, validateIntake } from '../data/advisorIntake.js';

test('all 60 catalog careers are selectable and have unique identifiers', () => {
  assert.equal(catalog.jobs.length, 60);
  assert.equal(new Set(dreamJobs.map(job => job.title)).size, 60);
  assert.equal(new Set(dreamJobs.map(job => job.id)).size, 60);
  for (const job of dreamJobs) {
    const data = createIntake({ dreamJob: job.title, personalInfo: { district: 'Colombo' }, academicResults: { stream: 'Physical Science', zScore: 1.5 } });
    assert.deepEqual(validateIntake(data), {});
    assert.equal(job.marketDemand, null);
    assert.equal(job.averageSalary, null);
  }
});

test('every career explanation, qualification and roadmap milestone is trilingual', () => {
  const values = [...Object.values(catalog.copy), ...Object.values(catalog.foundations)];
  for (const job of catalog.jobs) {
    values.push(job.title, job.description, job.summary, job.qualification, job.project, ...[job.registrationNote].filter(Boolean));
    for (const step of [...(job.roadmapSteps || []), ...(job.futurePathSteps || [])]) values.push(step.title, step.description);
  }
  for (const value of values) for (const language of ['si', 'ta']) {
    assert.ok(value[language]?.trim());
    assert.equal(translateAdvisor(value.en, language), value[language], `${language}: ${value.en}`);
  }
});

test('new careers have role-specific practical milestones and search aliases', () => {
  const added = catalog.jobs.filter(job => job.id > 30);
  assert.equal(new Set(added.map(job => job.project.en)).size, 30);
  assert.ok(dreamJobs.find(job => job.title === 'Software QA Engineer').aliases.includes('SQA'));
  assert.ok(dreamJobs.find(job => job.title === 'Automotive Technician').aliases.includes('motor mechanic'));
  for (const job of added.filter(job => job.routeType === 'vocational')) assert.deepEqual(job.degreePaths, {});
});

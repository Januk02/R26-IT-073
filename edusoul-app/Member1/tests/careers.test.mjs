import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../data/careerCatalog.json' with { type: 'json' };
import { dreamJobs } from '../data/dreamDegreeData.js';
import { translateAdvisor } from '../data/advisorLocale.js';
import { createIntake, validateIntake } from '../data/advisorIntake.js';
import { careerJourneyForCareer, futurePathForCareer, refreshCareerPlan } from '../data/careerFuturePaths.js';

test('software journey shows a backward role ladder and a chronological path forward', () => {
  const journey = careerJourneyForCareer('Software Engineer');
  assert.equal(journey.goal, 'Senior Software Engineer');
  assert.deepEqual(journey.backward.slice(0, 4), ['Senior Software Engineer', 'Software Engineer',
    'Junior Software Engineer', 'Software Engineering Intern']);
  assert.ok(journey.backward[4].includes('Degree') || journey.backward[4].includes('degree'));
  assert.ok(journey.forward[0].includes('university'));
  assert.ok(journey.forward.findIndex(step => step.includes('portfolio')) < journey.forward.findIndex(step => step.includes('internship')));
  assert.ok(journey.forward.at(-1).includes('Senior Software Engineer'));
});

test('every career gets its own journey without software roles leaking into other goals', () => {
  for (const job of catalog.jobs) {
    const journey = careerJourneyForCareer(job.title.en, { goal: 'Software Engineer' });
    assert.ok(journey.backward.length >= 4);
    assert.ok(journey.forward.length >= 6);
    if (job.title.en !== 'Software Engineer') {
      assert.equal(journey.goal, job.careerJourney.goal.en);
      assert.ok(!journey.backward.some(item => item.includes('Software Engineering Intern')));
    }
  }
  const doctor = careerJourneyForCareer('Doctor');
  assert.equal(doctor.goal, 'Specialist Doctor');
  assert.equal(doctor.backward[1], 'Consultant / Specialist Doctor');
  assert.ok(!doctor.backward.some(item => item.includes('Optional:')));
  assert.equal(careerJourneyForCareer('Unsupported career'), null);
});

test('all 60 careers define explicit role ladders instead of reversed task headings', () => {
  for (const job of catalog.jobs) {
    assert.ok(job.careerJourney, job.title.en);
    const journey = careerJourneyForCareer(job.title.en);
    assert.equal(journey.backward[0], journey.goal);
    assert.ok(!/^(Build|Learn|Prepare|Complete|Compare|Choose|Meet)\b/.test(journey.backward[1]), job.title.en);
  }
  const civil = careerJourneyForCareer('Civil Engineer');
  assert.deepEqual(civil.backward.slice(0, 4), ['Senior Civil Engineer', 'Civil Engineer',
    'Junior / Graduate Civil Engineer', 'Civil Engineering Intern']);
  assert.ok(civil.backward.some(step => step.includes('Combined Mathematics, Physics and Chemistry')));
  const lawyer = careerJourneyForCareer('Lawyer');
  assert.deepEqual(lawyer.backward.slice(0, 3), ['Senior Lawyer',
    'Experienced Lawyer / Legal Specialist', 'Practising Lawyer (Attorney-at-Law)']);
  assert.ok(lawyer.backward.some(step => step.includes('LLB') && step.includes('another eligible')));
});

test('medical and legal journeys keep professional requirements in causal order', () => {
  const medicine = careerJourneyForCareer('Doctor').forward;
  const index = text => medicine.findIndex(step => step.includes(text));
  assert.ok(index('MBBS') < index('provisional SLMC'));
  assert.ok(index('provisional SLMC') < index('Intern Medical Officer'));
  assert.ok(index('Intern Medical Officer') < index('full SLMC'));
  assert.ok(index('full SLMC') < index('postgraduate specialist'));
  assert.ok(index('postgraduate specialist') < index('Consultant / Specialist'));
  const law = careerJourneyForCareer('Lawyer').forward;
  assert.ok(law.findIndex(step => step.includes('education and examinations')) < law.findIndex(step => step.includes('apprenticeship')));
  assert.ok(law.findIndex(step => step.includes('apprenticeship')) < law.findIndex(step => step.includes('Practising Lawyer')));
});

test('every career has its own complete, ordered Future Path', () => {
  const practicalMilestones = new Set();
  for (const job of catalog.jobs) {
    const steps = futurePathForCareer(job.title.en);
    assert.ok(steps.length >= 6, job.title.en);
    assert.equal(new Set(steps.map(step => step.id)).size, steps.length);
    assert.ok(steps.every(step => step.title.trim() && step.description.trim()), job.title.en);
    if (job.title.en !== 'Software Engineer') {
      assert.ok(!steps.some(step => step.description.includes('Junior Software Engineer')), job.title.en);
    }
    practicalMilestones.add(job.project.en);
  }
  assert.equal(practicalMilestones.size, 60);
});

test('switching careers replaces stale software steps with the selected career path', () => {
  const stale = { goal: 'Software Engineer', career_path_steps: futurePathForCareer('Software Engineer') };
  for (const job of catalog.jobs) {
    assert.deepEqual(futurePathForCareer(job.title.en, stale), futurePathForCareer(job.title.en));
  }
  assert.deepEqual(futurePathForCareer('Unsupported career', stale), []);
  assert.deepEqual(futurePathForCareer(undefined, { goal: 'Doctor' }), futurePathForCareer('Doctor'));
});

test('all six milestones have distinct career content and headings in every language', () => {
  for (const language of ['en', 'si', 'ta']) {
    for (let index = 0; index < 6; index++) {
      for (const field of ['title', 'description']) {
        const values = catalog.jobs.map(job => job.futurePathSteps[index][field][language]);
        assert.equal(new Set(values).size, catalog.jobs.length, `${language}, step ${index + 1}, ${field}`);
      }
    }
  }
  const generic = [
    'Review your subjects, grades and the actual entry criteria of the chosen provider.',
    'Complete the assessed training and supervised experience required for this role.',
    'Apply for suitable internships, trainee roles, apprenticeships or supervised projects.',
    'Target role:',
  ];
  for (const job of catalog.jobs) {
    for (const step of job.futurePathSteps) {
      assert.ok(!generic.some(text => step.description.en.includes(text)), `${job.title.en}: ${step.id}`);
    }
  }
  const civil = futurePathForCareer('Civil Engineer');
  assert.ok(civil.some(step => step.description.includes('Graduate') || step.description.includes('graduate')));
  assert.ok(civil.some(step => step.description.includes('Senior Civil Engineer')));
  assert.ok(civil.some(step => step.description.includes('surveys, drawings and material checks')));
});

test('saved generic plans refresh their content without changing student evidence', () => {
  for (const job of catalog.jobs) {
    const stale = { career: job.title.en, future_path_version: 'career-future-paths-2',
      entry_route_status: 'more_evidence_needed',
      roadmap_stages: [{ id: 'qualification', title: 'OLD GENERIC HEADING',
        description: 'OLD GENERIC DESCRIPTION', degree: 'Engineering',
        institution: 'Saved institution', goal_relation: 'direct', status: 'verification_required' }] };
    const original = structuredClone(stale);
    const refreshed = refreshCareerPlan(stale);
    assert.deepEqual(stale, original);
    assert.equal(refreshed.entry_route_status, stale.entry_route_status);
    assert.equal(refreshed.future_path_version, catalog.future_path_version);
    assert.equal(refreshed.journey_version, catalog.journey_version);
    assert.deepEqual(refreshed.career_journey, careerJourneyForCareer(job.title.en));
    assert.deepEqual(refreshed.roadmap_stages.map(step => step.title), futurePathForCareer(job.title.en).map(step => step.title));
    assert.deepEqual(refreshed.backward_steps.map(step => step.id),
      refreshed.roadmap_stages.filter(step => !step.optional).toReversed().map(step => step.id));
    const qualification = refreshed.roadmap_stages.find(step => ['qualification', 'university'].includes(step.id));
    if (qualification) assert.equal(qualification.institution, 'Saved institution');
    assert.equal(refreshCareerPlan(refreshed), refreshed);
  }
  const related = refreshCareerPlan({ career: 'Civil Engineer', roadmap_stages: [{
    id: 'qualification', degree: 'Architecture', institution: 'Related institution', goal_relation: 'alternative' }] });
  assert.equal(related.roadmap_stages.find(step => step.id === 'qualification').degree, undefined);
  assert.equal(refreshCareerPlan(undefined), undefined);
});

test('regulated and vocational paths preserve their different requirements', () => {
  const doctor = futurePathForCareer('Doctor');
  assert.equal(doctor.at(-1).optional, true);
  assert.ok(doctor.some(step => step.id === 'full_registration'));
  assert.ok(futurePathForCareer('Pilot').some(step => step.description.includes('CAASL')));
  assert.ok(futurePathForCareer('Lawyer').some(step => step.description.includes('Law College')));
  assert.ok(futurePathForCareer('Electrician').some(step => step.description.includes('TVEC')));
  assert.ok(futurePathForCareer('Entrepreneur').some(step => step.description.includes('rather than a universal requirement')));
});

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
    if (job.careerJourney) values.push(job.careerJourney.goal, ...job.careerJourney.backward, ...job.careerJourney.forward);
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

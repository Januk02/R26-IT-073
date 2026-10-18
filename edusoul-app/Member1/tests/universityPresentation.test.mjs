import test from 'node:test';
import assert from 'node:assert/strict';
import { degreeUniversitySummary, partitionUniversities, universityStatus, recommendationMapTarget } from '../data/universityPresentation.js';

const below = { name:'University of Jaffna', sector:'government', eligibility_status:'below_reference', readiness_score:0.292, degree:'Engineering' };
const independent = { name:'KDU', sector:'government', admission_route:'institution_specific', eligibility_status:'institution_verification_required', degree:'Engineering' };
const privateUni = { name:'SLIIT', sector:'private', eligibility_status:'institution_verification_required', degree:'Engineering' };
const rec = (government=[], privateOptions=[]) => ({ degree:'Engineering', university_options:{government,private:privateOptions} });

test('below-cutoff screenshot is explained as an entry gap rather than a missing university', () => {
  const summary=degreeUniversitySummary(rec([below,independent],[privateUni]));
  assert.ok(summary.includes('below the available stored cutoffs'));
  assert.ok(summary.includes('Other entry routes need checking'));
  assert.deepEqual(partitionUniversities([below,independent]),{options:[independent],gaps:[below]});
});

test('unmet subjects override a positive stored cutoff comparison', () => {
  const uni={...below,eligibility_status:'minimum_requirements_not_met',readiness_score:0};
  assert.equal(universityStatus(uni),'requirements_not_met');
  assert.ok(degreeUniversitySummary(rec([uni])).includes('do not meet'));
  assert.deepEqual(partitionUniversities([uni]).options,[]);
});

test('private and independent routes never present a legacy percentage as admission evidence', () => {
  for (const uni of [privateUni,independent,{...privateUni,eligibility_status:'meets_reference',readiness_score:1}]) assert.equal(universityStatus(uni),'verification_required');
  assert.ok(degreeUniversitySummary(rec([],[privateUni])).includes('Admission requirements need checking'));
});

test('missing catalog entries and stored-reference matches have different summaries', () => {
  assert.ok(degreeUniversitySummary(rec()).includes('No university is mapped'));
  assert.ok(degreeUniversitySummary(rec([{...below,eligibility_status:'meets_reference'}])).includes('Current admission requirements still need checking'));
  assert.deepEqual(partitionUniversities(),{options:[],gaps:[]});
});

test('map defaults to the model recommendation rather than the broad course catalog', () => {
  const university={...below,eligibility_status:'meets_reference'};
  const recommendations=[rec([university,independent],[privateUni])];
  const target=recommendationMapTarget(recommendations,{status:'available',degree:'Engineering',university:privateUni});
  assert.equal(target.degree,'Engineering');
  assert.equal(target.university.name,privateUni.name);
});

test('map follows an explicit result university without swapping missing coordinates', () => {
  const recommendations=[rec([below,independent],[privateUni])];
  const target=recommendationMapTarget(recommendations,null,'Engineering','KDU');
  assert.equal(target.university.name,'KDU');
  assert.equal(target.university.coordinates,undefined);
  assert.equal(recommendationMapTarget(recommendations,null,'Engineering','Unrelated university').university,null);
  assert.equal(recommendationMapTarget([],null).university,null);
});

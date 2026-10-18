import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../data/stateUniversities.json' with {type:'json'};
import {stateUniversityMessages} from '../data/stateUniversityTranslations.js';

test('state directory has 22 unique universities in the correct admission groups', () => {
  assert.equal(catalog.universities.length,22);
  assert.equal(new Set(catalog.universities.map(uni=>uni.name)).size,22);
  assert.equal(catalog.universities.filter(uni=>uni.category==='ugc').length,17);
  assert.equal(catalog.universities.filter(uni=>uni.category==='other_state').length,5);
  for (const uni of catalog.universities) {
    assert.equal(new URL(uni.website).protocol,'https:');
    for (const translation of stateUniversityMessages[uni.name]) assert.ok(translation && translation!==uni.name);
    assert.ok(!Object.hasOwn(uni,'z_score_requirements'));
  }
  assert.ok(!catalog.universities.some(uni=>uni.name.includes('SLIIT')||uni.name==='University of Colombo School of Computing'));
});

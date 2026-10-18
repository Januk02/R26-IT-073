import test from 'node:test';
import assert from 'node:assert/strict';
import { mapFormDataToBackend, getRecommendations, getBackwardAnalysis } from '../services/apiService.js';

const profile = {
  dreamJob: 'Software Engineer', personalInfo: { name: 'Student', district: 'Matale' },
  academicResults: { stream: 'Physical Science', zScore: -0.5, subjects: {}, commonGeneralTest: 35 },
  personalityScores: { analytical_thinking: 0 }, skillScores: { programming: 0 }, lifestylePreferences: {},
};

test('payload preserves zero and missing assessments without invented midpoint values', () => {
  const mapped = JSON.parse(JSON.stringify(mapFormDataToBackend(profile)));
  assert.equal(mapped.analytical_skill, 0);
  assert.equal(mapped.personality_scores.analytical_thinking, 0);
  assert.equal(mapped.skill_scores.programming, 0);
  assert.equal(mapped.z_score, -0.5);
  assert.equal(mapped.district, 'Matale');
  assert.equal(mapped.common_general_test, 35);
  assert.ok(!('creativity' in mapped));
  assert.ok(!('stress_tolerance' in mapped));
  assert.ok(!('preferred_location' in mapped));
});

test('invalid scores fail before a network request', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Unexpected network request'); };
  try {
    for (const zScore of ['', '1.5invalid', Infinity, NaN, -4.1, 4.1]) {
      await assert.rejects(getRecommendations({ ...profile, academicResults: { ...profile.academicResults, zScore } }), /Z-Score/);
    }
    assert.equal(requests, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('more than three grades fail before a recommendation request', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Unexpected request'); };
  try {
    await assert.rejects(getRecommendations({ ...profile, academicResults: { ...profile.academicResults, subjects: { Physics: 'A', Chemistry: 'A', Mathematics: 'B', ICT: 'C' } } }), error => error.code === 'validation_error' && !!error.fieldErrors.subject_grades);
    assert.equal(requests, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('backward analysis sends the student profile and exposes structured field errors', async () => {
  const originalFetch = globalThis.fetch;
  let body;
  globalThis.fetch = async (_url, options) => {
    body = JSON.parse(options.body);
    return { ok: false, status: 400, json: async () => ({ error: 'Correct profile', code: 'validation_error', field_errors: { district: 'Invalid district' } }) };
  };
  try {
    await assert.rejects(getBackwardAnalysis(profile.dreamJob, profile), error => {
      assert.equal(error.fieldErrors.district, 'Invalid district');
      assert.equal(error.code, 'validation_error');
      return true;
    });
    assert.equal(body.dream_job, profile.dreamJob);
    assert.equal(body.district, 'Matale');
    assert.equal(body.skill_scores.programming, 0);
  } finally { globalThis.fetch = originalFetch; }
});

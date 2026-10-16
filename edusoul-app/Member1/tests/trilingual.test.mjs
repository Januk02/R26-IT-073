import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { translateAdvisor, advisorMessages } from '../data/advisorLocale.js';
import { dreamJobs, personalityTraits, lifestyleFactors } from '../data/dreamDegreeData.js';

test('both languages cover every career description and form option', () => {
  const texts = [];
  for (const job of dreamJobs) {
    texts.push(job.title, job.category, job.description, ...job.requiredSkills, ...job.requiredQualifications.filter(value => value !== 'Excel'));
  }
  for (const trait of Object.values(personalityTraits)) {
    texts.push(trait.label, trait.description, trait.lowLabel, trait.highLabel);
  }
  for (const factor of Object.values(lifestyleFactors)) {
    texts.push(factor.label, factor.description);
    for (const option of factor.options) texts.push(option.label, option.desc);
  }
  for (const language of ['si', 'ta']) {
    for (const text of texts) {
      assert.notEqual(translateAdvisor(text, language), text, `${language}: ${text}`);
    }
  }
});

test('dynamic explanations preserve scores and translate complete sentences', () => {
  const inputs = [
    'Based on your Physical Science stream and Z-score of 1.85, IT offers strong alignment with your \'Software Engineer\' career goal.',
    'Your Z-score of 1.85 meets the requirement of 1.7 and you receive a 5% district bonus for Colombo. Admission probability: 87.0%.',
    'Your Z-score of 1.85 is slightly below the minimum of 2.0 for Medicine. A foundation program may help. Admission probability: 45.0%.',
    'Improve Z-score from 1.85 to 2.0+ for better opportunities',
  ];
  for (const language of ['si', 'ta']) {
    for (const input of inputs) {
      const result = translateAdvisor(input, language);
      assert.ok(result.includes('1.85'));
      assert.doesNotMatch(result, /Your Z-score|Admission probability|foundation program|Based on|and you receive|Improve Z-score/);
    }
    const roadmap = translateAdvisor('Complete core courses in IT at University of Colombo. Build strong fundamentals in Physical Science.', language);
    assert.doesNotMatch(roadmap, /Complete core|Build strong|Physical Science/);
  }
});

test('display translation preserves model data, numbers and English text', () => {
  const profile = { dreamJob: 'Software Engineer', district: 'Colombo', zScore: 1.85 };
  const before = JSON.stringify(profile);
  for (const language of ['si', 'ta']) {
    translateAdvisor(profile.dreamJob, language);
    translateAdvisor(profile.district, language);
    assert.equal(translateAdvisor(profile, language), profile);
    assert.equal(translateAdvisor(1.85, language), 1.85);
  }
  assert.equal(JSON.stringify(profile), before);
  assert.equal(translateAdvisor('Software Engineer', 'en'), 'Software Engineer');
  assert.equal(translateAdvisor('Back', 'unsupported'), 'Back');
  assert.equal(translateAdvisor('Custom student name', 'si'), 'Custom student name');
  for (const [key, values] of Object.entries(advisorMessages)) {
    assert.equal(values.length, 2, key);
    assert.ok(values.every(value => typeof value === 'string' && value.trim()), key);
  }
});

test('results, roadmap and guidance use the shared saved language', () => {
  for (const page of ['DreamDegreeResults', 'DreamDegreeRoadmap', 'DreamDegreeGuidance']) {
    const source = readFileSync(new URL(`../pages/${page}.jsx`, import.meta.url), 'utf8');
    assert.match(source, /changeLanguage: setLanguage.*useLanguage\(\)/);
    assert.doesNotMatch(source, /\[language, setLanguage\].*useState/);
  }
});

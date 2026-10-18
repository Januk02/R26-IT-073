import catalog from './alSubjectRules.json' with { type: 'json' };
export { default as alSubjectRules } from './alSubjectRules.json' with { type: 'json' };

export const STREAM_SUBJECTS = Object.fromEntries(Object.entries(catalog.streams).map(([name, rule]) => [name, {
  description: rule.intakeHint || rule.hint,
  section: rule.section,
  required: rule.intakeRequired || rule.required,
  hasSubjectBuckets: true,
  subjectBuckets: Object.fromEntries((rule.intakeGroups || rule.groups).map(group => [group.label, { subjects: group.subjects }])),
}]));

// All 25 Sri Lankan districts
export const ALL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];


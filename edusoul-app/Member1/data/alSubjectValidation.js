import catalog from './alSubjectRules.json' with { type: 'json' };

export const subjectIssueMessages = {
  subject_outside_stream: 'A selected subject is not in the supported subject groups for this stream. Remove it or correct the stream.',
  stream_core_required: 'Include the two required core subjects shown for this stream.',
  commerce_core_required: 'Commerce requires at least two of Accounting, Business Studies and Economics.',
  arts_religion_limit: 'Choose at most two subjects from the Religions and civilizations basket.',
  arts_religion_pair: 'A religion and its corresponding civilization cannot be selected together.',
  arts_aesthetic_limit: 'Choose at most two aesthetic subjects.',
  arts_aesthetic_area: 'Choose only one subject from each aesthetic area: Art, Dancing, Music or Drama.',
  arts_alternative_group: 'Choose only one subject from each alternative group, including the technological subjects.',
  arts_classical_limit: 'Choose at most two classical languages.',
  arts_language_limit: 'Three language subjects require the national-language or national-and-classical-language exception.',
  arts_social_required: 'Arts requires a Basket 1 subject unless an official language exception applies.',
};

export function canonicalSubject(name) {
  const subjects = Object.values(catalog.streams).flatMap(stream => stream.groups.flatMap(group => group.subjects));
  const alias = Object.keys(catalog.subjectAliases).find(key => key.toLowerCase() === name.trim().toLowerCase());
  return alias ? catalog.subjectAliases[alias] : subjects.find(subject => subject.toLowerCase() === name.trim().toLowerCase()) || name.trim();
}

export function subjectCombinationIssues(stream, subjects, { scope = 'reference' } = {}) {
  const rule = catalog.streams[stream];
  if (!rule) return [];
  const selected = new Set(subjects);
  const groups = scope === 'intake' ? rule.intakeGroups || rule.groups : rule.groups;
  const required = scope === 'intake' ? rule.intakeRequired || rule.required : rule.required;
  const allowed = groups.flatMap(group => group.subjects);
  const issues = [...selected].some(subject => !allowed.includes(subject)) ? ['subject_outside_stream'] : [];
  const count = names => names.filter(name => selected.has(name)).length;
  if (stream === 'Arts') {
    const arts = catalog.arts;
    const languages = [...arts.national, ...arts.classical, ...arts.foreign];
    if (count(arts.religions) > 2) issues.push('arts_religion_limit');
    if (arts.incompatiblePairs.some(pair => count(pair) === pair.length)) issues.push('arts_religion_pair');
    if (count(arts.aesthetics) > 2) issues.push('arts_aesthetic_limit');
    if (arts.aestheticAreas.some(area => count(area) > 1)) issues.push('arts_aesthetic_area');
    if (count(arts.technology) > 1 || arts.exclusiveGroups.some(group => count(group) > 1)) issues.push('arts_alternative_group');
    if (count(arts.classical) > 2) issues.push('arts_classical_limit');
    if (selected.size === 3) {
      const nationalOnly = count(arts.national) === 3;
      const nationalClassical = count([...arts.national, ...arts.classical]) === 3 && count(arts.national) >= 1 && count(arts.classical) <= 2;
      const languageException = nationalOnly || nationalClassical;
      const twoLanguages = count(languages) === 2 && count([...arts.religions, ...arts.aesthetics]) === 1;
      if (count(languages) === 3 && !languageException) issues.push('arts_language_limit');
      if (!count(arts.social) && !languageException && !twoLanguages) issues.push('arts_social_required');
    }
  }
  if (selected.size === 3) {
    if (!required.every(subject => selected.has(subject))) issues.push('stream_core_required');
    if (stream === 'Commerce' && count(catalog.commerceCore) < 2) issues.push('commerce_core_required');
  }
  return issues;
}

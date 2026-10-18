"""UGC 2025/26 subject guidance. The JSON is shared with the React intake.

This covers selected prerequisites, not final eligibility or all examination rules.
"""
import json
from pathlib import Path

CATALOG_PATH = Path(__file__).resolve().parents[1] / 'edusoul-app/Member1/data/alSubjectRules.json'
CATALOG = json.loads(CATALOG_PATH.read_text())
GRADE_LEVEL = {'F': 0, 'S': 1, 'C': 2, 'B': 3, 'A': 4}


def canonical_subject(name):
    if not isinstance(name, str):
        return name
    name = name.strip()
    aliases = CATALOG['subjectAliases']
    match = next((key for key in aliases if key.casefold() == name.casefold()), None)
    if match:
        return aliases[match]
    subjects = {subject for stream in CATALOG['streams'].values() for group in stream['groups'] for subject in group['subjects']}
    return next((subject for subject in subjects if subject.casefold() == name.casefold()), name)


def arts_issues(subjects):
    selected, rules = set(subjects), CATALOG['arts']
    issues = []
    languages = set(rules['national'] + rules['classical'] + rules['foreign'])
    count = lambda names: len(selected.intersection(names))
    if count(rules['religions']) > 2:
        issues.append('arts_religion_limit')
    if any(set(pair) <= selected for pair in rules['incompatiblePairs']):
        issues.append('arts_religion_pair')
    if count(rules['aesthetics']) > 2:
        issues.append('arts_aesthetic_limit')
    if any(count(area) > 1 for area in rules['aestheticAreas']):
        issues.append('arts_aesthetic_area')
    if count(rules['technology']) > 1 or any(count(group) > 1 for group in rules['exclusiveGroups']):
        issues.append('arts_alternative_group')
    if count(rules['classical']) > 2:
        issues.append('arts_classical_limit')
    if len(selected) == 3:
        national_only = selected == set(rules['national'])
        national_classical = selected <= set(rules['national'] + rules['classical']) and count(rules['national']) >= 1 and count(rules['classical']) <= 2
        language_exception = national_only or national_classical
        two_languages = count(languages) == 2 and count(rules['religions'] + rules['aesthetics']) == 1
        if count(languages) == 3 and not language_exception:
            issues.append('arts_language_limit')
        if not count(rules['social']) and not language_exception and not two_languages:
            issues.append('arts_social_required')
    return issues


def combination_issues(stream, subjects):
    rule = CATALOG['streams'].get(stream)
    if not rule:
        return []
    selected = set(subjects)
    allowed = {subject for group in rule['groups'] for subject in group['subjects']}
    issues = ['subject_outside_stream'] if selected - allowed else []
    if stream == 'Arts':
        issues += arts_issues(selected)
    if len(selected) == 3:
        if not set(rule['required']) <= selected:
            issues.append('stream_core_required')
        if stream == 'Commerce' and len(selected.intersection(CATALOG['commerceCore'])) < 2:
            issues.append('commerce_core_required')
    return issues


def course_subject_check(degree, grades):
    """Three-valued evidence for the named UGC course's A/L requirement only."""
    rule = CATALOG['degreeRules'].get(degree)
    result = {'degree': degree, 'supported': None, 'status': 'verification_required',
        'source': CATALOG['source'], 'academic_year': CATALOG['academicYear'],
        'scope': 'UGC A/L subject prerequisites only; other conditions remain unverified',
        'supplied_grades': dict(grades), 'missing_subjects': [], 'issues': []}
    if not rule:
        return result
    result.update({'section': rule['section'], 'required_subjects': rule.get('required', []),
        'allowed_subjects': rule.get('allowed', []), 'minimum_grades': rule.get('minimumGrades', {}),
        'credit_subjects': rule.get('creditAny', []), 'credits_required': rule.get('creditsRequired', 0),
        'alternative_requirements': rule.get('requiredAny', []), 'at_least': rule.get('atLeast')})
    selected = set(grades)
    complete = len(grades) == 3
    issues = []
    if any(GRADE_LEVEL.get(grade, 0) < 1 for grade in grades.values()):
        issues.append('subject_pass_required')
    missing = sorted(set(rule.get('required', [])) - selected)
    result['missing_subjects'] = missing
    if complete:
        if missing:
            issues.append('course_subject_required')
        if rule.get('allowed') and selected - set(rule['allowed']):
            issues.append('course_subject_not_accepted')
        if any(not selected.intersection(group) for group in rule.get('requiredAny', [])):
            issues.append('course_alternative_required')
        at_least = rule.get('atLeast')
        if at_least and len(selected.intersection(at_least['subjects'])) < at_least['count']:
            issues.append('course_subject_group_required')
        if rule.get('artsBaskets'):
            issues += arts_issues(selected)
        if rule.get('creditAny') and not any(GRADE_LEVEL.get(grades.get(subject), 0) >= 2 for subject in rule['creditAny']):
            issues.append('course_credit_required')
        if sum(GRADE_LEVEL.get(grade, 0) >= 2 for grade in grades.values()) < rule.get('creditsRequired', 0):
            issues.append('medicine_two_credits_required' if degree == 'Medicine' else 'course_two_credits_required')
    for subject, grade in rule.get('minimumGrades', {}).items():
        if subject in grades and GRADE_LEVEL.get(grades[subject], 0) < GRADE_LEVEL[grade]:
            issues.append('course_minimum_grade')
    result['issues'] = list(dict.fromkeys(issues))
    result['supported'] = False if issues else True if complete else None
    result['status'] = 'requirements_not_met' if issues else 'subject_requirements_met' if complete else 'evidence_required'
    return result

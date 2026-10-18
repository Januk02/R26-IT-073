"""Curated pathways shared with the career picker; no vacancy or salary forecasts."""
import json
from copy import deepcopy
from pathlib import Path

CATALOG_PATH = Path(__file__).resolve().parents[1] / 'edusoul-app/Member1/data/careerCatalog.json'
CATALOG = json.loads(CATALOG_PATH.read_text())
PROFILES = {job['title']['en']: job for job in CATALOG['jobs']}


def future_path_steps(title):
    return [{'id': step['id'], 'title': step['title']['en'], 'description': step['description']['en'],
             'optional': step.get('optional', False)}
            for step in PROFILES[title].get('futurePathSteps', [])]


def career_journey(title):
    journey = PROFILES[title]['careerJourney']
    return {'goal': journey['goal']['en'],
            'backward': [item['en'] for item in journey['backward']],
            'forward': [item['en'] for item in journey['forward']]}


def extend_careers(careers):
    result = deepcopy(careers)
    for title, job in PROFILES.items():
        if title not in result:
            result[title] = {'degree_paths': job['degreePaths'], 'required_skills': job['skillTargets'],
                'personality_traits': {}, 'lifestyle_profile': {}}
        if job['directDegrees'] is not None:
            result[title]['direct_degrees'] = set(job['directDegrees'])
        if job['routeType'] == 'vocational':
            result[title]['vocational_route'] = job['qualification']['en']
            result[title]['degree_paths'] = {}
    return result


def career_plan(title, degree=None, relation=None, institution=None, subject_check=None, stream=None):
    job = PROFILES[title]
    copy = CATALOG['copy']
    stages = []
    details = {'entry': copy['entryDetail'], 'qualification': job['qualification'],
        'foundation': CATALOG['foundations'][job['sector']], 'practice': job['project'],
        'experience': copy['experienceDetail'], 'market': copy['global']}
    for key in ('entry', 'qualification', 'foundation', 'practice', 'experience', 'market'):
        stage = {'id': key, 'title': copy[key]['en'], 'description': details[key]['en'],
            'status': 'verification_required' if key in ('entry', 'qualification', 'market') else 'planned'}
        if key == 'qualification' and degree:
            stage.update({'degree': degree, 'goal_relation': relation, 'institution': institution})
        if key == "foundation":
            stage["focus_skills"] = list(job["skillTargets"])
        stages.append(stage)
    if job.get('roadmapSteps'):
        stages = [{'id': step['id'], 'title': step['title']['en'],
                   'description': step['description']['en'], 'optional': step.get('optional', False),
                   'status': 'verification_required'} for step in job['roadmapSteps']]
        # An alternative degree must never appear to complete a regulated medical route.
        if degree and relation == 'direct':
            stages[1].update({'degree': degree, 'goal_relation': relation, 'institution': institution})
    elif job.get('futurePathSteps'):
        stages = [{**step, 'status': 'verification_required' if step['id'] in ('entry', 'university', 'qualification') else 'planned'}
                  for step in future_path_steps(title)]
        qualification = next((stage for stage in stages if stage['id'] in ('qualification', 'university')), None)
        if qualification and degree and (relation == 'direct' or job['routeType'] != 'professional'):
            qualification.update({'degree': degree, 'goal_relation': relation, 'institution': institution})
        for stage in stages:
            if stage['id'] in ('foundation', 'skills'):
                stage['focus_skills'] = list(job['skillTargets'])
    result = {'career': title, 'summary': job['summary']['en'], 'qualification': job['qualification']['en'],
        'route_type': job['routeType'], 'key_skills': list(job['skillTargets']), 'markets': ['Sri Lanka', 'International'],
        'sri_lanka_pathway': copy['localVocational' if job['routeType'] == 'vocational' else 'localAcademic']['en'],
        'international_pathway': copy['global']['en'], 'practical_milestone': job['project']['en'],
        'registration_note': job.get('registrationNote', {}).get('en'),
        'roadmap_stages': stages, 'sources': job.get('sources', []) + CATALOG['sources'], 'catalog_version': CATALOG['version'],
        'labour_market_forecast': None, 'salary_forecast': None,
        'future_path_version': CATALOG.get('future_path_version'), 'career_journey': career_journey(title),
        'journey_version': CATALOG['journey_version'],
        'backward_steps': [deepcopy(stage) for stage in reversed(stages) if not stage.get('optional')]}
    if title == 'Doctor':
        result['entry_subject_check'] = subject_check
        result['student_stream'] = stream
        result['entry_route_status'] = ('stream_change_required' if stream and stream != 'Biological Science'
            else 'subject_requirements_not_met' if subject_check and subject_check['supported'] is False
            else 'subject_requirements_supported' if subject_check and subject_check['supported'] is True
            else 'more_evidence_needed')
    return result

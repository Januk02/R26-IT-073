"""State-university directory shared with the frontend; no invented cutoffs."""
import json
from copy import deepcopy
from pathlib import Path

CATALOG = json.loads((Path(__file__).resolve().parents[1] / 'edusoul-app/Member1/data/stateUniversities.json').read_text(encoding='utf-8'))


def complete_state_universities(database):
    result = deepcopy(database)
    old = result.get('government', {})
    government = {}
    for entry in CATALOG['universities']:
        candidates = [entry['name']] + entry.get('aliases', [])
        previous = next((old[name] for name in candidates if name in old), {})
        record = deepcopy(previous)
        record.update({key: value for key, value in entry.items() if key not in ('aliases', 'study_areas')})
        record['admission_route'] = entry.get('admission_route', 'ugc_selection' if entry['category'] == 'ugc' else 'institution_specific')
        if 'study_areas' in entry:
            record['degrees'] = entry['study_areas']
            record['z_score_requirements'] = {}
            record['programme_mapping_status'] = 'study_area_only_verify_specific_programme'
        record.setdefault('degrees', [])
        record.setdefault('z_score_requirements', {})
        # Non-centralised admissions cannot use the bundled UGC-style cutoffs.
        if record['admission_route'] == 'institution_specific':
            record['z_score_requirements'] = {}
        government[entry['name']] = record

    # UCSC is a school within Colombo, not a separate state university.
    computing = old.get('University of Colombo School of Computing', {})
    colombo = government['University of Colombo']
    colombo['degrees'] = list(dict.fromkeys(colombo['degrees'] + computing.get('degrees', [])))
    for degree, cutoff in computing.get('z_score_requirements', {}).items():
        colombo['z_score_requirements'].setdefault(degree, cutoff)
    # Keep SLIIT only in the existing non-state category and preserve its courses.
    sliit = old.get('Sri Lanka Institute of Information Technology', {})
    if 'SLIIT' in result.get('private', {}):
        private = result['private']['SLIIT']
        private['degrees'] = list(dict.fromkeys(private.get('degrees', []) + sliit.get('degrees', [])))
        for degree, cutoff in sliit.get('z_score_requirements', {}).items():
            private.setdefault('z_score_requirements', {}).setdefault(degree, cutoff)
    result['government'] = government
    return result

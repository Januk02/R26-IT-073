import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import UNIVERSITY_DATABASE, advisor_engine
from state_universities import CATALOG, complete_state_universities


class StateUniversityTests(unittest.TestCase):
    def test_complete_directory_and_correct_categories(self):
        universities = CATALOG['universities']
        self.assertEqual(len(universities), 22)
        self.assertEqual(sum(uni['category'] == 'ugc' for uni in universities), 17)
        self.assertEqual(sum(uni['category'] == 'other_state' for uni in universities), 5)
        self.assertEqual(set(UNIVERSITY_DATABASE['government']), {uni['name'] for uni in universities})
        for invalid in ['SLIIT', 'Sri Lanka Institute of Information Technology', 'University of the Visual Arts', 'Sri Lanka Institute of Advanced Technology', 'University of Colombo School of Computing']:
            self.assertNotIn(invalid, UNIVERSITY_DATABASE['government'])
        self.assertIn('SLIIT', UNIVERSITY_DATABASE['private'])
        self.assertIn('Computer Science', UNIVERSITY_DATABASE['government']['University of Colombo']['degrees'])
        for name,university in UNIVERSITY_DATABASE['government'].items():
            self.assertIsInstance(university.get('coordinates'),dict,name)
            self.assertTrue(5 < university['coordinates']['lat'] < 10,name)
            self.assertTrue(79 < university['coordinates']['lon'] < 83,name)

    def test_unknown_cutoffs_are_included_without_fabricated_readiness(self):
        profile = advisor_engine.validate({'dream_job':'Software Engineer','stream':'Physical Science','district':'Galle','z_score':1.6})
        options = advisor_engine._university_options('IT', profile)['government']
        for name in ['Open University of Sri Lanka', 'University of Vavuniya', 'University of Vocational Technology', 'Gampaha Wickramarachchi University of Indigenous Medicine']:
            uni = next(item for item in options if item['name'] == name)
            self.assertIsNone(uni['readiness_score'])
            self.assertIsNone(uni['z_score_requirement'])
            self.assertIsNone(uni['z_score_gap'])
            self.assertFalse(uni['eligibility_confirmed'])
            self.assertEqual(uni['eligibility_status'], 'institution_verification_required')
            self.assertTrue(uni['website'].startswith('https://'))

    def test_independent_admissions_do_not_inherit_ugc_cutoffs(self):
        uni = UNIVERSITY_DATABASE['government']['General Sir John Kotelawala Defence University']
        self.assertEqual(uni['location'], 'Ratmalana')
        self.assertEqual(uni['z_score_requirements'], {})
        self.assertTrue(6.81 < uni['coordinates']['lat'] < 6.83)
        self.assertTrue(79.88 < uni['coordinates']['lon'] < 79.90)
        self.assertIn('kdu.ac.lk',uni['coordinate_source'])
        self.assertEqual(complete_state_universities(UNIVERSITY_DATABASE), UNIVERSITY_DATABASE)

    def test_unrelated_universities_are_not_forced_into_degree_recommendations(self):
        profile = advisor_engine.validate({'dream_job':'Software Engineer','stream':'Physical Science','district':'Galle','z_score':1.6})
        options = advisor_engine._university_options('IT', profile)['government']
        names = {uni['name'] for uni in options}
        self.assertNotIn('Ocean University of Sri Lanka', names)
        self.assertNotIn('Bhiksu University of Sri Lanka', names)

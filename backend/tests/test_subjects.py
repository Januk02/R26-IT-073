import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import app
from al_subjects import CATALOG_PATH, combination_issues, course_subject_check


class SubjectTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.profile = {'dream_job': 'Doctor', 'stream': 'Biological Science', 'district': 'Colombo', 'z_score': 3.5}

    def post(self, **fields):
        return self.client.post('/recommend', json={**self.profile, **fields})

    def test_frontend_backend_share_expected_subject_combinations(self):
        cases = json.loads(CATALOG_PATH.with_name('alSubjectCases.json').read_text())
        for case in cases:
            with self.subTest(case=case['id']):
                self.assertEqual(not combination_issues(case['stream'], case['subjects']), case['valid'])
                response = self.post(stream=case['stream'], subject_grades={subject: 'A' for subject in case['subjects']})
                self.assertEqual(response.status_code, 200 if case['valid'] else 400)

    def test_medical_subjects_and_grades_are_not_overridden_by_high_z(self):
        for grades, expected in [({'Biology': 'C', 'Chemistry': 'C', 'Physics': 'S'}, True),
            ({'Biology': 'S', 'Chemistry': 'S', 'Physics': 'S'}, False),
            ({'Biology': 'A', 'Chemistry': 'A', 'Agricultural Science': 'A'}, False),
            ({'Biology': 'A', 'Chemistry': 'A'}, None), ({}, None)]:
            with self.subTest(grades=grades):
                response = self.post(subject_grades=grades)
                self.assertEqual(response.status_code, 200)
                data = response.get_json()
                med = next(rec for rec in data['recommendations'] if rec['degree'] == 'Medicine')
                self.assertIs(med['subject_prerequisites']['supported'], expected)
                if expected is False:
                    self.assertEqual(data['goal_status'], 'subject_requirements_not_met')
                    self.assertEqual(med['academic_feasibility']['z_score_feasibility'], 0)
                    for uni in med['university_options']['government']:
                        if uni['admission_route'] == 'institution_specific':
                            self.assertIsNone(uni['readiness_score'])
                            self.assertEqual(uni['eligibility_status'], 'institution_verification_required')
                        else:
                            self.assertEqual(uni['readiness_score'], 0)
                    self.assertIn('direct_subject_requirements_not_met', [item['code'] for item in data['backward_analysis']['unmet_requirements']])

    def test_engineering_computing_and_technology_are_distinct(self):
        grades = {'Combined Mathematics': 'A', 'Physics': 'A', 'Information & Communication Technology': 'A'}
        self.assertFalse(course_subject_check('Engineering', grades)['supported'])
        self.assertTrue(course_subject_check('Computer Science', grades)['supported'])
        for stream, first in [('Engineering Technology', 'Engineering Technology'), ('Bio Systems Technology', 'Biosystems Technology')]:
            data = self.post(dream_job='Civil Engineer', stream=stream, subject_grades={first: 'A', 'Science for Technology': 'A', 'Information & Communication Technology': 'A'}).get_json()
            self.assertNotIn('Engineering', [rec['degree'] for rec in data['recommendations']])
            self.assertNotEqual(data['goal_status'], 'direct_path_available')

    def test_specific_credit_requirements(self):
        self.assertFalse(course_subject_check('Pharmacy', {'Biology': 'A', 'Chemistry': 'S', 'Physics': 'A'})['supported'])
        self.assertTrue(course_subject_check('Pharmacy', {'Biology': 'S', 'Chemistry': 'C', 'Physics': 'S'})['supported'])
        self.assertFalse(course_subject_check('Computer Science', {'Combined Mathematics': 'S', 'Physics': 'S', 'Information & Communication Technology': 'A'})['supported'])
        self.assertIsNone(course_subject_check('Computer Science', {'Combined Mathematics': 'A'})['supported'])
        self.assertIsNone(course_subject_check('Unknown degree', {'Biology': 'A', 'Physics': 'A', 'Chemistry': 'A'})['supported'])

    def test_multi_stream_courses_use_subjects_rather_than_arts_only_assumptions(self):
        response = self.post(dream_job='Lawyer', stream='Commerce', subject_grades={'Accounting': 'A', 'Business Studies': 'C', 'Economics': 'S'})
        data = response.get_json()
        law = next(rec for rec in data['recommendations'] if rec['degree'] == 'Law')
        self.assertTrue(law['subject_prerequisites']['supported'])
        self.assertTrue(course_subject_check('Architecture', {'Art': 'A', 'History': 'S', 'English': 'S'})['supported'])
        self.assertFalse(course_subject_check('Law', {'Sinhala': 'A', 'English': 'A', 'Tamil': 'A'})['supported'])
        self.assertTrue(course_subject_check('IT', {'Accounting': 'A', 'Economics': 'S', 'Mathematics': 'C'})['supported'])
        self.assertTrue(course_subject_check('Quantity Surveying', {'Accounting': 'A', 'Economics': 'S', 'Combined Mathematics': 'S'})['supported'])

    def test_aliases_are_normalized_and_duplicate_subjects_rejected(self):
        self.assertEqual(self.post(stream='Technology').status_code, 400)
        result = self.post(stream='Engineering Technology', subject_grades={'Engineering Technology': 'A', 'Science for Technology': 'B', 'ICT': 'C'})
        self.assertEqual(result.status_code, 200)
        duplicate = self.post(stream='Engineering Technology', subject_grades={'ICT': 'A', 'Information & Communication Technology': 'C'})
        self.assertEqual(duplicate.status_code, 400)

    def test_unknown_exam_history_and_official_eligibility_stay_unknown(self):
        data = self.post(subject_grades={'Biology': 'A', 'Physics': 'A', 'Chemistry': 'A'}, common_general_test=80).get_json()
        proof = data['backward_analysis']['goal_proof']
        academic = next(node for node in proof['children'] if node['id'] == 'academic_entry_evidence')
        leaves = {node['id']: node for node in academic['children']}
        self.assertIsNone(leaves['exam_sitting_and_attempts']['supported'])
        self.assertIsNone(leaves['current_course_eligibility']['supported'])
        self.assertIsNone(proof['supported'])

import unittest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import app, advisor_engine
from career_pathways import CATALOG, PROFILES


class CareerExpansionTests(unittest.TestCase):
    def test_every_career_returns_its_own_forward_and_backward_dependencies(self):
        for title, job in PROFILES.items():
            for profile in ({'dream_job': title}, {'dream_job': title,
                    'stream': 'Physical Science', 'district': 'Ratnapura', 'z_score': 1.5}):
                with self.subTest(career=title, personalized='stream' in profile):
                    response = self.client.post('/backward-analysis', json=profile)
                    self.assertEqual(response.status_code, 200)
                    result = response.get_json()
                    analysis = result['backward_analysis']
                    journey = analysis['career_journey']
                    self.assertEqual(journey, result['career_plan']['career_journey'])
                    self.assertGreaterEqual(len(journey['forward']), 6)
                    self.assertEqual(journey['backward'][0], journey['goal'])
                    if title == 'Software Engineer':
                        self.assertEqual(journey['backward'][:4], ['Senior Software Engineer',
                            'Software Engineer', 'Junior Software Engineer', 'Software Engineering Intern'])
                        self.assertIn('university', journey['forward'][0])
                    else:
                        self.assertEqual(journey['goal'], job['careerJourney']['goal']['en'])
                    self.assertEqual(analysis['journey_version'], CATALOG['journey_version'])
                    self.assertEqual(analysis['goal'], title)
                    self.assertEqual(analysis['future_path_version'], CATALOG['future_path_version'])
                    expected = job['futurePathSteps']
                    self.assertEqual([step['id'] for step in analysis['career_path_steps']],
                        [step['id'] for step in expected])
                    self.assertEqual([step['description'] for step in analysis['career_path_steps']],
                        [step['description']['en'] for step in expected])
                    required = [step['id'] for step in reversed(expected) if not step.get('optional')]
                    self.assertEqual([step['id'] for step in analysis['backward_steps']], required)
                    self.assertEqual(analysis['backward_steps'], result['career_plan']['backward_steps'])
                    if title != 'Doctor':
                        self.assertNotIn('entry_route_status', result['career_plan'])

    def test_doctor_civil_and_lawyer_use_explicit_roles_and_valid_dependency_order(self):
        for title, goal, roles in [
                ('Doctor', 'Specialist Doctor', ['Specialist Doctor', 'Consultant / Specialist Doctor']),
                ('Civil Engineer', 'Senior Civil Engineer', ['Senior Civil Engineer', 'Civil Engineer',
                    'Junior / Graduate Civil Engineer', 'Civil Engineering Intern']),
                ('Lawyer', 'Senior Lawyer', ['Senior Lawyer', 'Experienced Lawyer / Legal Specialist',
                    'Practising Lawyer (Attorney-at-Law)'])]:
            with self.subTest(career=title):
                journey = self.client.post('/backward-analysis', json={'dream_job': title}).get_json()['backward_analysis']['career_journey']
                self.assertEqual(journey['goal'], goal)
                self.assertEqual(journey['backward'][:len(roles)], roles)
        doctor = self.client.post('/backward-analysis', json={'dream_job': 'Doctor'}).get_json()['backward_analysis']['career_journey']
        forward = doctor['forward']
        def pos(text):
            return next(i for i, step in enumerate(forward) if text in step)
        self.assertLess(pos('MBBS'), pos('provisional SLMC'))
        self.assertLess(pos('provisional SLMC'), pos('Intern Medical Officer'))
        self.assertLess(pos('Intern Medical Officer'), pos('full SLMC'))
        self.assertLess(pos('full SLMC'), pos('postgraduate specialist'))
        self.assertLess(pos('postgraduate specialist'), pos('Consultant / Specialist'))

    def test_software_future_path_explains_progression_in_both_analysis_modes(self):
        for profile in [{'dream_job': 'Software Engineer'}, {'dream_job': 'Software Engineer',
                'stream': 'Physical Science', 'district': 'Ratnapura', 'z_score': 1.5}]:
            with self.subTest(profile=profile):
                response = self.client.post('/backward-analysis', json=profile)
                self.assertEqual(response.status_code, 200)
                analysis = response.get_json()['backward_analysis']
                steps = analysis['career_path_steps']
                self.assertEqual([step['id'] for step in steps],
                    ['university', 'skills', 'portfolio', 'internship', 'junior', 'engineer', 'senior'])
                self.assertTrue(all(step['title'] and step['description'] for step in steps))
                self.assertIn('Senior Software Engineer', analysis['career_path'])
                self.assertIn('where applicable', steps[0]['description'])
                self.assertNotIn('professional requirements', analysis['career_path'])

    def test_doctor_backward_plan_uses_medical_registration_dependencies(self):
        response = self.client.post('/backward-analysis', json={
            'dream_job': 'Doctor', 'stream': 'Biological Science', 'district': 'Ratnapura',
            'z_score': 2.1, 'subject_grades': {'Biology': 'C', 'Chemistry': 'C', 'Physics': 'S'}})
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        plan = result['career_plan']
        self.assertEqual(plan['entry_route_status'], 'subject_requirements_supported')
        self.assertEqual([step['id'] for step in plan['backward_steps']],
            ['full_registration', 'internship', 'provisional_registration', 'qualification', 'entry'])
        self.assertEqual(result['backward_analysis']['backward_steps'], plan['backward_steps'])
        self.assertTrue(plan['roadmap_stages'][-1]['optional'])
        self.assertIn('one-year', plan['roadmap_stages'][3]['description'])
        self.assertIn('ERPM', plan['registration_note'])
        self.assertIn('does not qualify', plan['registration_note'])
        self.assertIsNone(result['backward_analysis']['goal_proof']['supported'])

    def test_doctor_entry_plan_distinguishes_unknown_failed_and_wrong_stream(self):
        cases = [
            ({}, 'Biological Science', 'more_evidence_needed'),
            ({'Biology': 'C', 'Chemistry': 'S', 'Physics': 'S'}, 'Biological Science', 'subject_requirements_not_met'),
            ({'Biology': 'A', 'Chemistry': 'A', 'Agricultural Science': 'A'}, 'Biological Science', 'subject_requirements_not_met'),
            ({}, 'Commerce', 'stream_change_required'),
        ]
        for grades, stream, status in cases:
            with self.subTest(status=status, grades=grades):
                result = self.client.post('/recommend', json={'dream_job': 'Doctor',
                    'stream': stream, 'district': 'Ratnapura', 'z_score': 2.1,
                    'subject_grades': grades}).get_json()
                self.assertEqual(result['career_plan']['entry_route_status'], status)
                for rec in result['recommendations']:
                    if rec['goal_relation'] != 'direct':
                        self.assertNotIn('degree', rec['roadmap_stages'][1])

    def setUp(self):
        self.client = app.test_client()

    def recommend(self, title, stream='Physical Science'):
        response = self.client.post('/recommend', json={'dream_job':title,'stream':stream,'district':'Colombo','z_score':1.7})
        self.assertEqual(response.status_code, 200)
        return response.get_json()

    def test_frontend_and_backend_support_the_same_60_careers(self):
        self.assertEqual(len(PROFILES), 60)
        self.assertEqual(set(PROFILES), set(advisor_engine.careers))
        for title in PROFILES:
            with self.subTest(career=title):
                data = self.recommend(title)
                plan = data['career_plan']
                self.assertEqual(plan['career'], title)
                self.assertEqual(plan['catalog_version'], CATALOG['version'])
                self.assertTrue(plan['summary'])
                self.assertTrue(plan['qualification'])
                self.assertEqual(len(plan['roadmap_stages']), len(PROFILES[title]['futurePathSteps']))
                self.assertEqual(len({stage['id'] for stage in plan['roadmap_stages']}), len(PROFILES[title]['futurePathSteps']))
                self.assertTrue(all(stage['title'] and stage['description'] for stage in plan['roadmap_stages']))
                self.assertTrue(plan['sri_lanka_pathway'])
                self.assertTrue(plan['international_pathway'])
                self.assertIsNone(plan['labour_market_forecast'])
                self.assertIsNone(plan['salary_forecast'])
                for rec in data['recommendations']:
                    self.assertEqual(rec['career_plan']['career'], title)
                    self.assertEqual(len(rec['roadmap_stages']), len(PROFILES[title]['futurePathSteps']))
                    if PROFILES[title]['routeType'] == 'professional' and rec['goal_relation'] != 'direct':
                        self.assertTrue(all('degree' not in stage for stage in rec['roadmap_stages']))

    def test_vocational_jobs_have_a_roadmap_without_fabricated_degrees(self):
        for title in ('Solar PV Installer','HVAC Technician','Automotive Technician','Welder','Tour Guide'):
            with self.subTest(career=title):
                data = self.recommend(title)
                self.assertEqual(data['recommendations'], [])
                self.assertIsNone(data['best_degree'])
                self.assertEqual(data['goal_status'], 'vocational_route')
                self.assertTrue(data['career_plan']['practical_milestone'])
                self.assertNotIn('complete_subject_grades', data['validation']['missing_evidence'])
                self.assertNotIn('common_general_test', data['validation']['missing_evidence'])
                self.assertIn('training_provider_entry_requirements', data['validation']['missing_evidence'])
                self.assertEqual(data['action_plan'][0]['action'], 'Verify training provider entry requirements')

    def test_technology_business_and_specialist_routes_are_distinct(self):
        self.assertIn(self.recommend('AI Engineer')['best_direct_degree'], ('IT','Computer Science'))
        self.assertIn(self.recommend('Hotel Operations Manager','Commerce')['best_direct_degree'], ('Business','Management'))
        self.assertEqual(self.recommend('Quantity Surveyor','Arts')['best_direct_degree'], 'Quantity Surveying')
        food = self.recommend('Food Technologist','Biological Science')
        self.assertIsNone(food['best_direct_degree'])
        self.assertTrue(all(rec['goal_relation'] != 'direct' for rec in food['recommendations']))
        self.assertIn('food science', food['career_plan']['qualification'])

    def test_new_goal_only_analysis_exposes_real_required_skills_and_plan(self):
        response = self.client.post('/backward-analysis', json={'dream_job':'Software QA Engineer'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('software_testing', data['backward_analysis']['key_skills'])
        self.assertEqual(data['career_plan']['career'], 'Software QA Engineer')
        self.assertFalse(data['backward_analysis']['personalized'])
        self.assertNotIn('skill_gaps', data['backward_analysis'])

    def test_guide_registration_is_not_replaced_by_a_generic_degree(self):
        data = self.recommend('Tour Guide')
        self.assertIn('SLTDA', data['career_plan']['registration_note'])
        self.assertTrue(any('sltda.gov.lk' in source['url'] for source in data['career_plan']['sources']))
        self.assertTrue(data['backward_analysis']['requirements']['professional_verification_required'])

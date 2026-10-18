import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import advisor_engine


class UniversityRecommendationTests(unittest.TestCase):
    def profile(self, **changes):
        return advisor_engine.validate({'dream_job':'Software Engineer','stream':'Physical Science','district':'Galle','z_score':1.2, **changes})

    def test_private_institutions_do_not_use_generic_z_scores(self):
        low = advisor_engine._university_options('IT', self.profile(z_score=-2))['private']
        high = advisor_engine._university_options('IT', self.profile(z_score=3))['private']
        self.assertTrue(low)
        self.assertEqual([item['name'] for item in low], [item['name'] for item in high])
        for item in low + high:
            self.assertIsNone(item['readiness_score'])
            self.assertIsNone(item['z_score_requirement'])
            self.assertIsNone(item['z_score_gap'])
            self.assertEqual(item['z_score_requirements'], {})
            self.assertEqual(item['eligibility_status'], 'institution_verification_required')

    def test_all_displayed_degrees_contribute_without_duplicate_institutions(self):
        data = advisor_engine.recommend(self.profile(dream_job='Accountant',stream='Commerce'), include_scenarios=False)
        self.assertEqual(data['university_recommendation_scope'], 'all_displayed_degree_pathways')
        for sector, universities in data['university_recommendations'].items():
            expected = {(uni['name'],rec['degree']) for rec in data['recommendations'] for uni in rec['university_options'][sector]}
            actual = {(uni['name'],degree) for uni in universities for degree in uni['matched_degrees']}
            self.assertEqual(actual, expected)
            self.assertEqual(len(universities),len({uni['name'] for uni in universities}))
            for uni in universities:
                self.assertEqual(set(uni['available_degrees']),set(uni['matched_degrees']))
                self.assertEqual({item['degree'] for item in uni['degree_matches']},set(uni['matched_degrees']))
                for evidence in uni['degree_matches']:
                    expected_option = next(option for rec in data['recommendations'] if rec['degree']==evidence['degree'] for option in rec['university_options'][sector] if option['name']==uni['name'])
                    self.assertEqual(evidence['readiness_score'],expected_option['readiness_score'])
                    self.assertEqual(evidence['eligibility_status'],expected_option['eligibility_status'])

    def test_degree_that_is_not_first_still_adds_its_university(self):
        options = lambda name,degree: {'name':name,'degree':degree,'available_degrees':[degree],'z_score_requirements':{},'tuition_fee_range':{},'readiness_score':None}
        recommendations = [
            {'degree':'Education','goal_relation':'direct','university_options':{'government':[options('A','Education')],'private':[]}},
            {'degree':'Arts','goal_relation':'related','university_options':{'government':[options('B','Arts')],'private':[]}},
        ]
        combined = advisor_engine._combined_university_options(recommendations)
        self.assertEqual([item['name'] for item in combined['government']],['A','B'])
        self.assertEqual(advisor_engine._combined_university_options([]),{'government':[],'private':[]})

    def test_unknown_admissions_do_not_claim_that_no_institutions_exist(self):
        data = advisor_engine.recommend(self.profile(z_score=-2), include_scenarios=False)
        for rec in data['recommendations']:
            if rec['university'] is None and any(rec['university_options'].values()):
                self.assertIn('Related institutions are listed below',rec['explanation'])
                self.assertIsNone(rec['admissionProbability'])

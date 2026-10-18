import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import advisor_engine


class ModelRecommendationTests(unittest.TestCase):
    def profile(self, **changes):
        return advisor_engine.validate({'dream_job':'Software Engineer','stream':'Physical Science','district':'Galle','z_score':1.6, **changes})

    def predict(self, probabilities, **changes):
        evidence={'available':True,'probabilities':probabilities,'imputed_features':['creativity'],'top_probability':max(probabilities.values())}
        with patch.object(advisor_engine.predictor,'prediction_evidence',return_value=evidence):
            return advisor_engine.recommend(self.profile(**changes),include_scenarios=False)

    def test_model_score_determines_model_pick_and_university_offers_that_degree(self):
        data=self.predict({'Engineering':.1,'IT':.2,'Computer Science':.7})
        result=data['trained_model_recommendation']
        self.assertEqual(result['status'],'available')
        self.assertEqual(result['degree'],'Computer Science')
        self.assertEqual(result['model_probability'],.7)
        self.assertEqual(result['imputed_features'],['creativity'])
        self.assertEqual(result['degree_source'],'trained_classifier')
        self.assertEqual(result['university_source'],'degree_course_catalog')
        uni=result['university']
        self.assertIsNotNone(uni)
        self.assertIn(result['degree'],advisor_engine.universities[uni['sector']][uni['name']]['degrees'])
        self.assertFalse(uni['eligibility_confirmed'])

    def test_unrelated_model_top_class_does_not_replace_the_career_path(self):
        result=self.predict({'Medicine':.8,'Computer Science':.2})['trained_model_recommendation']
        self.assertEqual(result['degree'],'Computer Science')
        self.assertEqual(result['model_probability'],.2)

    def test_related_degree_does_not_replace_required_professional_degree(self):
        result=self.predict({'Quantity Surveying':.8,'Engineering':.2},dream_job='Civil Engineer')['trained_model_recommendation']
        self.assertEqual(result['degree'],'Engineering')
        self.assertEqual(result['model_probability'],.2)

    def test_known_subject_failure_excludes_a_model_pathway(self):
        result=self.predict({'Medicine':1},dream_job='Doctor',stream='Biological Science',subject_grades={'Biology':'S','Chemistry':'S','Physics':'S'})['trained_model_recommendation']
        self.assertEqual(result['status'],'no_supported_pathway')
        self.assertIsNone(result['degree'])
        self.assertIsNone(result['university'])

    def test_below_cutoff_universities_are_not_selected_as_a_model_university(self):
        result=self.predict({'Engineering':1},dream_job='Civil Engineer',z_score=.834)['trained_model_recommendation']
        self.assertEqual(result['degree'],'Engineering')
        self.assertEqual(result['university']['eligibility_status'],'institution_verification_required')
        self.assertEqual(result['university_selection_basis'],'programme_match_requires_verification')

    def test_unavailable_model_never_fabricates_prediction(self):
        with patch.object(advisor_engine.predictor,'prediction_evidence',return_value={'available':False,'probabilities':{}}):
            data=advisor_engine.recommend(self.profile(),include_scenarios=False)
        self.assertEqual(data['trained_model_recommendation']['status'],'unavailable')
        self.assertIsNone(data['trained_model_recommendation']['model_probability'])
        self.assertIsNone(data['trained_model_recommendation']['degree'])

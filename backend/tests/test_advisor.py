import json
import math
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from flask_app import app, advisor_engine
from advisor_engine import STREAM_DEGREES, DISTRICTS, evaluate_proof
from enhanced_trained_model import TrainedModelPredictor
import numpy as np
from types import SimpleNamespace


class AdvisorTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.profile = {"dream_job": "Software Engineer", "stream": "Physical Science",
            "district": "Colombo", "z_score": 1.6}

    def recommend(self, **changes):
        return self.client.post('/recommend', json={**self.profile, **changes})

    def test_malformed_json_and_wrong_body_types(self):
        for body in (None, [], True, "text", 42):
            with self.subTest(body=body):
                response = self.client.post('/recommend', data=json.dumps(body), content_type='application/json')
                self.assertEqual(response.status_code, 400)
                self.assertIn('error', response.get_json())
        self.assertEqual(self.client.post('/recommend', data='{bad', content_type='application/json').status_code, 400)
        self.assertEqual(self.client.post('/backward-analysis', data='text').status_code, 400)
        self.assertEqual(self.client.post('/recommend', data='x' * 66000, content_type='application/json').status_code, 413)

    def test_invalid_numbers_and_structures_return_field_errors(self):
        for value in (None, '', '1.2junk', True, [], {}, float('nan'), float('inf'), -4.01, 4.01):
            with self.subTest(value=value):
                response = self.recommend(z_score=value)
                self.assertEqual(response.status_code, 400)
                self.assertIn('z_score', response.get_json()['field_errors'])
        for field in ('personality_scores', 'skill_scores', 'subject_grades', 'lifestyle_preferences'):
            self.assertEqual(self.recommend(**{field: []}).status_code, 400)
        for field, value in [('analytical_skill', -1), ('stress_tolerance', 6),
            ('personality_scores', {'creativity': 11}), ('personality_scores', {'invented_trait': 5}),
            ('skill_scores', {'programming': float('nan')}), ('subject_grades', {'Physics': 'X'}),
            ('preferred_location', 'Moon'), ('common_general_test', 101)]:
            with self.subTest(field=field):
                self.assertEqual(self.recommend(**{field: value}).status_code, 400)

    def test_missing_and_unsupported_inputs_are_not_substituted(self):
        for field in ('dream_job', 'stream', 'district', 'z_score'):
            data = dict(self.profile)
            del data[field]
            self.assertEqual(self.client.post('/recommend', json=data).status_code, 400)
        self.assertEqual(self.recommend(stream='Unknown').status_code, 400)
        self.assertEqual(self.recommend(district='Unknown').status_code, 400)
        response = self.recommend(dream_job='Astronaut')
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.get_json()['code'], 'unsupported_career')

    def test_canonicalization_zero_and_negative_scores(self):
        response = self.recommend(dream_job=' software engineer ', stream='physical sciences', district=' matale ',
            z_score='-0.75', personality_scores={'analytical_thinking': 0})
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result['validation']['district'], 'Matale')
        self.assertEqual(result['validation']['normalized_stream'], 'Physical Science')
        analytical = next(item for item in result['backward_analysis']['personality_gaps'] if item['trait'] == 'analytical')
        self.assertEqual(analytical['current'], 0)
        self.assertTrue(all(math.isfinite(rec['overall_score']) for rec in result['recommendations']))

    def test_missing_evidence_is_never_fabricated(self):
        data = self.recommend().get_json()
        self.assertIn('skill_scores', data['validation']['missing_evidence'])
        self.assertTrue(all(item['current'] is None and item['gap'] is None for item in data['backward_analysis']['skill_gaps']))
        for rec in data['recommendations']:
            self.assertEqual(rec['skill_match'], {})
            self.assertEqual(rec['personality_match'], {})
            missing = next(item for item in rec['score_breakdown'] if item['factor'] == 'skills')
            self.assertEqual(missing['effective_weight'], 0)
            self.assertIsNone(missing['value'])

    def test_score_breakdown_and_universities_are_degree_specific(self):
        data = self.recommend(personality_scores={'analytical_thinking': 8, 'creativity': 7},
            skill_scores={'programming': 3, 'logic': 6}, lifestyle_preferences={'stressTolerance': 'Low'}).get_json()
        self.assertEqual(data['best_degree'], data['recommendations'][0]['degree'])
        for rec in data['recommendations']:
            self.assertAlmostEqual(sum(item['contribution'] for item in rec['score_breakdown']), rec['suitability_score'], places=5)
            self.assertAlmostEqual(sum(item['effective_weight'] for item in rec['score_breakdown']), 1, places=5)
            self.assertIsNone(rec['admissionProbability'])
            self.assertEqual(rec['score_type'], 'heuristic_suitability_not_probability')
            for sector, choices in rec['university_options'].items():
                for uni in choices:
                    self.assertEqual(uni['degree'], rec['degree'])
                    self.assertIn(rec['degree'], advisor_engine.universities[sector][uni['name']]['degrees'])
                    self.assertEqual(set(uni['z_score_requirements']), {rec['degree']} if uni['z_score_requirement'] is not None else set())
                    if uni['z_score_requirement'] is None:
                        self.assertIsNone(uni['z_score_gap'])
                    self.assertEqual(uni['district_bonus_applied'], 0)
                    self.assertIsNone(uni['admission_probability'])
                    self.assertFalse(uni['eligibility_confirmed'])

    def test_professional_goal_constraints_and_vocational_routes(self):
        data = self.recommend(dream_job='Doctor', stream='Biological Science', z_score=2.4).get_json()
        self.assertEqual(data['recommendations'][0]['degree'], 'Medicine')
        self.assertEqual(data['recommendations'][0]['goal_relation'], 'direct')
        self.assertTrue(all(rec['goal_relation'] != 'direct' for rec in data['recommendations'] if rec['degree'] != 'Medicine'))
        blocked = self.recommend(dream_job='Doctor', stream='Commerce').get_json()
        self.assertNotIn('Medicine', [rec['degree'] for rec in blocked['recommendations']])
        self.assertIn('no_direct_degree_path', [item['code'] for item in blocked['backward_analysis']['unmet_requirements']])
        for job in ('Chef', 'Electrician'):
            data = self.recommend(dream_job=job).get_json()
            self.assertIsNone(data['best_degree'])
            self.assertEqual(data['recommendations'], [])
            self.assertTrue(data['backward_analysis']['requirements']['vocational_route'])

    def test_unmet_minimum_requirements_and_no_invented_university(self):
        data = self.recommend(z_score=-3, subject_grades={'Physics': 'F'}, common_general_test=20).get_json()
        self.assertTrue(all(rec['university'] is None for rec in data['recommendations']))
        self.assertTrue(all(uni['readiness_score'] in (0, None) for rec in data['recommendations'] for group in rec['university_options'].values() for uni in group))
        self.assertTrue(all(uni['eligibility_status'] == 'institution_verification_required' for rec in data['recommendations'] for uni in rec['university_options']['government'] if uni['readiness_score'] is None))
        self.assertIn('minimum_requirements_not_met', [item['code'] for item in data['backward_analysis']['unmet_requirements']])

    def test_backward_analysis_uses_profile_and_exposes_rule_trace(self):
        generic = self.client.post('/backward-analysis', json={'dream_job': 'Software Engineer'}).get_json()
        self.assertFalse(generic['backward_analysis']['personalized'])
        response = self.client.post('/backward-analysis', json={**self.profile, 'skill_scores': {'programming': 2}})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['backward_analysis']['personalized'])
        self.assertEqual(len(data['backward_analysis']['inference_trace']), 5)
        gap = next(item for item in data['backward_analysis']['skill_gaps'] if item['skill'] == 'programming')
        self.assertAlmostEqual(gap['gap'], .7)
        self.assertEqual(self.client.post('/backward-analysis', json={'dream_job':'Software Engineer', 'z_score':1.5}).status_code, 400)
        proof = data['backward_analysis']['goal_proof']
        self.assertEqual(proof['operator'], 'AND')
        self.assertFalse(proof['supported'])  # The explicitly assessed programming gap is unmet.

    def test_backward_proof_distinguishes_false_from_unknown(self):
        for operator, values, expected in [('AND', [True, None], None), ('AND', [False, None], False),
            ('OR', [False, None], None), ('OR', [True, None], True), ('AND', [True, True], True)]:
            proof = evaluate_proof({'id': 'test', 'operator': operator, 'children': [{'id': str(i), 'supported': value} for i, value in enumerate(values)]})
            self.assertIs(proof['supported'], expected)
        self.assertIsNone(evaluate_proof({'id': 'empty', 'operator': 'OR'})['supported'])

    def test_counterfactuals_recompute_same_degree_with_one_changed_input(self):
        baseline_profile = {**self.profile, 'skill_scores': {'programming': 2}, 'predicted_potential_z_score': 2.0}
        data = self.client.post('/recommend', json=baseline_profile).get_json()
        self.assertEqual(len(data['counterfactual_scenarios']), 3)
        for scenario in data['counterfactual_scenarios']:
            self.assertEqual(len(scenario['changes']), 1)
            self.assertFalse(scenario['admission_guaranteed'])
            replay = json.loads(json.dumps(baseline_profile))
            field, change = next(iter(scenario['changes'].items()))
            if field.startswith('skill_scores.'):
                replay['skill_scores'][field.split('.', 1)[1]] = change['to']
            else:
                replay[field] = change['to']
            replayed = self.client.post('/recommend', json=replay).get_json()
            scores = {item['degree']: item['suitability_score'] for item in replayed['recommendations']}
            for item in scenario['comparison']:
                self.assertAlmostEqual(item['after'], scores[item['degree']], places=6)
                self.assertAlmostEqual(item['after'] - item['before'], item['score_change'], places=5)
                self.assertGreaterEqual(item['score_change'], -1e-6)

    def test_all_supported_careers_and_streams_produce_finite_consistent_results(self):
        for job in advisor_engine.careers:
            for stream in STREAM_DEGREES:
                with self.subTest(job=job, stream=stream):
                    response = self.recommend(dream_job=job, stream=stream)
                    self.assertEqual(response.status_code, 200)
                    data = response.get_json()
                    json.dumps(data, allow_nan=False)
                    for rec in data['recommendations']:
                        self.assertIn(rec['degree'], STREAM_DEGREES[stream])
                        self.assertTrue(0 <= rec['suitability_score'] <= 1)
                        self.assertTrue(math.isfinite(rec['suitability_score']))
        for district in DISTRICTS:
            self.assertEqual(self.recommend(district=district).status_code, 200)

    def test_unavailable_model_is_explicit_and_legacy_route_is_validated(self):
        with patch.object(advisor_engine.predictor, 'prediction_evidence', return_value={
            'available': False, 'probabilities': {}, 'top_probability': None, 'warnings': ['unavailable']}):
            data = self.recommend().get_json()
            self.assertEqual(data['method'], 'goal_directed_rules')
            self.assertTrue(all(rec['model_probability'] is None for rec in data['recommendations']))
            self.assertIsNone(data['model_info']['confidence_score'])
        self.assertEqual(self.client.post('/predict-simple', json={}).status_code, 400)

    def test_model_probabilities_follow_estimator_class_order(self):
        predictor = TrainedModelPredictor.__new__(TrainedModelPredictor)
        predictor.load_status, predictor.version_mismatch, predictor.encoders = 'loaded', False, {}
        predictor.model = SimpleNamespace(classes_=np.array([1, 0]), predict_proba=lambda frame: np.array([[.7, .3]]))
        predictor.le_target = SimpleNamespace(inverse_transform=lambda classes: np.array(['IT', 'Medicine'])[classes])
        with patch.object(predictor, '_prepare_model_input', return_value={'z_score': 1.6}):
            evidence = predictor.prediction_evidence(self.profile)
        self.assertTrue(evidence['available'])
        self.assertEqual(evidence['probabilities'], {'Medicine': .7, 'IT': .3})
        self.assertFalse(evidence['calibrated'])

    def test_incompatible_or_invalid_model_output_never_gets_confidence(self):
        predictor = TrainedModelPredictor.__new__(TrainedModelPredictor)
        predictor.load_status, predictor.version_mismatch, predictor.encoders = 'version_mismatch', True, {}
        predictor.model = SimpleNamespace(classes_=np.array([0]), predict_proba=lambda frame: np.array([[float('nan')]]))
        predictor.le_target = SimpleNamespace(inverse_transform=lambda classes: np.array(['IT']))
        self.assertFalse(predictor.prediction_evidence(self.profile)['available'])
        predictor.version_mismatch = False
        with patch.object(predictor, '_prepare_model_input', return_value={'z_score': 1.6}):
            evidence = predictor.prediction_evidence(self.profile)
        self.assertFalse(evidence['available'])
        self.assertIsNone(evidence['top_probability'])

    def test_model_unknown_categories_are_not_aliased(self):
        predictor = TrainedModelPredictor.__new__(TrainedModelPredictor)
        predictor.load_status, predictor.version_mismatch = 'loaded', False
        predictor.model, predictor.le_target = object(), object()
        predictor.encoders = {'district': SimpleNamespace(classes_=['Colombo'])}
        with patch.object(predictor, '_prepare_model_input') as prepare:
            evidence = predictor.prediction_evidence({**self.profile, 'district': 'Matale'})
        self.assertFalse(evidence['available'])
        prepare.assert_not_called()


if __name__ == '__main__':
    unittest.main()

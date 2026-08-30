# Enhanced Recommendation System with Location Data
import pandas as pd
import numpy as np
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    import joblib
except ImportError:
    print("⚠️  sklearn not available, using fallback model")
    RandomForestClassifier = None
    LabelEncoder = None
    joblib = None
import os
import math

class TrainedModelPredictor:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.le_target = None
        self.load_trained_model()
        
    def load_trained_model(self):
        """Load trained model from notebook"""
        try:
            # Check if model files exist
            model_files = [
                'logical_degree_model.pkl',
                'logical_encoders.pkl', 
                'logical_target_encoder.pkl'
            ]
            
            for file in model_files:
                if os.path.exists(file):
                    print(f"✓ Found {file}")
                else:
                    print(f"⚠️  {file} not found, using fallback model")
                    return self.create_fallback_model()
            
            # Load trained model if available
            if os.path.exists('logical_degree_model.pkl'):
                self.model = joblib.load('logical_degree_model.pkl')
                self.encoders = joblib.load('logical_encoders.pkl')
                self.le_target = joblib.load('logical_target_encoder.pkl')
                print("✅ Loaded logical degree model")
            else:
                print("⚠️  Using fallback model (logical model not found)")
                return self.create_fallback_model()
                
        except Exception as e:
            print(f"Error loading model: {e}")
            return self.create_fallback_model()
    
    def create_fallback_model(self):
        """Create fallback model based on notebook logic"""
        # Comprehensive career knowledge base — all 30 dream jobs from frontend
        self.career_knowledge = {
            "Software Engineer": {
                "required_skills": {"programming": 0.9, "logic": 0.85, "problem_solving": 0.8, "mathematics": 0.7},
                "personality_traits": {"analytical": 0.85, "creativity": 0.7, "leadership": 0.3, "communication": 0.5, "problem_solving": 0.9, "teamwork": 0.6, "adaptability": 0.7, "attention_to_detail": 0.8},
                "degree_paths": {"IT": 0.85, "Computer Science": 0.9, "Engineering": 0.4},
                "z_score_threshold": 1.2,
                "future_demand": 0.95,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.7, "salary_potential": 0.85, "career_growth": 0.9, "social_impact": 0.4, "location_type": "Urban", "family_friendly": 0.7}
            },
            "Doctor": {
                "required_skills": {"biology": 0.95, "memory": 0.9, "stress_handling": 0.85, "empathy": 0.8},
                "personality_traits": {"analytical": 0.8, "creativity": 0.3, "leadership": 0.6, "communication": 0.7, "problem_solving": 0.7, "teamwork": 0.7, "adaptability": 0.5, "attention_to_detail": 0.9},
                "degree_paths": {"Medicine": 0.95, "Bio Science": 0.3},
                "z_score_threshold": 2.0,
                "future_demand": 0.9,
                "lifestyle_profile": {"stress_level": 0.9, "work_life_balance": 0.3, "salary_potential": 0.85, "career_growth": 0.7, "social_impact": 0.95, "location_type": "Any", "family_friendly": 0.3}
            },
            "Data Scientist": {
                "required_skills": {"statistics": 0.9, "programming": 0.85, "analysis": 0.8, "mathematics": 0.75},
                "personality_traits": {"analytical": 0.95, "creativity": 0.7, "leadership": 0.3, "communication": 0.5, "problem_solving": 0.9, "teamwork": 0.5, "adaptability": 0.6, "attention_to_detail": 0.85},
                "degree_paths": {"IT": 0.8, "Computer Science": 0.85, "Mathematics": 0.6},
                "z_score_threshold": 1.4,
                "future_demand": 0.92,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.75, "salary_potential": 0.9, "career_growth": 0.9, "social_impact": 0.4, "location_type": "Urban", "family_friendly": 0.75}
            },
            "Entrepreneur": {
                "required_skills": {"leadership": 0.9, "creativity": 0.85, "risk_management": 0.8, "communication": 0.75},
                "personality_traits": {"analytical": 0.5, "creativity": 0.9, "leadership": 0.9, "communication": 0.85, "problem_solving": 0.7, "teamwork": 0.6, "adaptability": 0.9, "attention_to_detail": 0.4},
                "degree_paths": {"Business": 0.7, "Management": 0.6, "Finance": 0.5, "IT": 0.4},
                "z_score_threshold": 1.0,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.85, "work_life_balance": 0.3, "salary_potential": 0.9, "career_growth": 0.95, "social_impact": 0.5, "location_type": "Urban", "family_friendly": 0.35}
            },
            "Accountant": {
                "required_skills": {"numbers": 0.95, "accuracy": 0.9, "analysis": 0.7, "ethics": 0.8},
                "personality_traits": {"analytical": 0.8, "creativity": 0.2, "leadership": 0.3, "communication": 0.5, "problem_solving": 0.6, "teamwork": 0.4, "adaptability": 0.3, "attention_to_detail": 0.95},
                "degree_paths": {"Accounting": 0.95, "Business": 0.8, "Finance": 0.7},
                "z_score_threshold": 1.1,
                "future_demand": 0.75,
                "lifestyle_profile": {"stress_level": 0.45, "work_life_balance": 0.7, "salary_potential": 0.6, "career_growth": 0.5, "social_impact": 0.2, "location_type": "Urban", "family_friendly": 0.8}
            },
            "Civil Engineer": {
                "required_skills": {"mathematics": 0.9, "design": 0.85, "physics": 0.8, "project_management": 0.75},
                "personality_traits": {"analytical": 0.8, "creativity": 0.6, "leadership": 0.6, "communication": 0.5, "problem_solving": 0.8, "teamwork": 0.7, "adaptability": 0.5, "attention_to_detail": 0.85},
                "degree_paths": {"Engineering": 0.95, "Quantity Surveying": 0.6, "Architecture": 0.4},
                "z_score_threshold": 1.5,
                "future_demand": 0.85,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.5, "salary_potential": 0.7, "career_growth": 0.6, "social_impact": 0.7, "location_type": "Any", "family_friendly": 0.5}
            },
            "Teacher": {
                "required_skills": {"communication": 0.9, "empathy": 0.85, "patience": 0.8, "knowledge": 0.75},
                "personality_traits": {"analytical": 0.5, "creativity": 0.7, "leadership": 0.7, "communication": 0.9, "problem_solving": 0.5, "teamwork": 0.6, "adaptability": 0.7, "attention_to_detail": 0.5},
                "degree_paths": {"Education": 0.95, "Arts": 0.8, "Social Sciences": 0.6},
                "z_score_threshold": 0.8,
                "future_demand": 0.8,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.8, "salary_potential": 0.3, "career_growth": 0.3, "social_impact": 0.9, "location_type": "Any", "family_friendly": 0.9}
            },
            "Nurse": {
                "required_skills": {"biology": 0.8, "empathy": 0.9, "stress_handling": 0.85, "communication": 0.8},
                "personality_traits": {"analytical": 0.5, "creativity": 0.3, "leadership": 0.4, "communication": 0.8, "problem_solving": 0.6, "teamwork": 0.9, "adaptability": 0.8, "attention_to_detail": 0.85},
                "degree_paths": {"Nursing": 0.95, "Bio Science": 0.4},
                "z_score_threshold": 1.4,
                "future_demand": 0.9,
                "lifestyle_profile": {"stress_level": 0.8, "work_life_balance": 0.4, "salary_potential": 0.5, "career_growth": 0.6, "social_impact": 0.95, "location_type": "Any", "family_friendly": 0.4}
            },
            "Dentist": {
                "required_skills": {"biology": 0.9, "precision": 0.95, "empathy": 0.8, "communication": 0.7},
                "personality_traits": {"analytical": 0.7, "creativity": 0.4, "leadership": 0.4, "communication": 0.7, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.4, "attention_to_detail": 0.95},
                "degree_paths": {"Dental": 0.95, "Medicine": 0.3},
                "z_score_threshold": 1.8,
                "future_demand": 0.85,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.7, "salary_potential": 0.8, "career_growth": 0.6, "social_impact": 0.7, "location_type": "Urban", "family_friendly": 0.7}
            },
            "Pharmacist": {
                "required_skills": {"chemistry": 0.9, "biology": 0.8, "accuracy": 0.9, "ethics": 0.85},
                "personality_traits": {"analytical": 0.8, "creativity": 0.3, "leadership": 0.3, "communication": 0.6, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.4, "attention_to_detail": 0.95},
                "degree_paths": {"Pharmacy": 0.95, "Bio Science": 0.4},
                "z_score_threshold": 1.6,
                "future_demand": 0.8,
                "lifestyle_profile": {"stress_level": 0.4, "work_life_balance": 0.75, "salary_potential": 0.65, "career_growth": 0.5, "social_impact": 0.7, "location_type": "Urban", "family_friendly": 0.8}
            },
            "Veterinarian": {
                "required_skills": {"biology": 0.9, "empathy": 0.85, "surgery": 0.8, "communication": 0.7},
                "personality_traits": {"analytical": 0.7, "creativity": 0.4, "leadership": 0.4, "communication": 0.6, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.7, "attention_to_detail": 0.85},
                "degree_paths": {"Veterinary Science": 0.95, "Bio Science": 0.4, "Agriculture": 0.3},
                "z_score_threshold": 1.6,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.5, "salary_potential": 0.55, "career_growth": 0.5, "social_impact": 0.7, "location_type": "Any", "family_friendly": 0.5}
            },
            "Lawyer": {
                "required_skills": {"logic": 0.9, "communication": 0.95, "research": 0.85, "ethics": 0.85},
                "personality_traits": {"analytical": 0.8, "creativity": 0.5, "leadership": 0.7, "communication": 0.95, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.5, "attention_to_detail": 0.8},
                "degree_paths": {"Law": 0.95, "Social Sciences": 0.4, "Arts": 0.3},
                "z_score_threshold": 1.5,
                "future_demand": 0.75,
                "lifestyle_profile": {"stress_level": 0.7, "work_life_balance": 0.4, "salary_potential": 0.8, "career_growth": 0.7, "social_impact": 0.6, "location_type": "Urban", "family_friendly": 0.4}
            },
            "Architect": {
                "required_skills": {"design": 0.95, "mathematics": 0.8, "creativity": 0.9, "communication": 0.7},
                "personality_traits": {"analytical": 0.7, "creativity": 0.95, "leadership": 0.5, "communication": 0.6, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.5, "attention_to_detail": 0.9},
                "degree_paths": {"Architecture": 0.95, "Quantity Surveying": 0.5, "Engineering": 0.3},
                "z_score_threshold": 1.4,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.5, "salary_potential": 0.7, "career_growth": 0.6, "social_impact": 0.6, "location_type": "Urban", "family_friendly": 0.5}
            },
            "Web Developer": {
                "required_skills": {"programming": 0.85, "design": 0.7, "creativity": 0.75, "problem_solving": 0.8},
                "personality_traits": {"analytical": 0.7, "creativity": 0.8, "leadership": 0.3, "communication": 0.5, "problem_solving": 0.8, "teamwork": 0.5, "adaptability": 0.8, "attention_to_detail": 0.7},
                "degree_paths": {"IT": 0.9, "Computer Science": 0.85},
                "z_score_threshold": 1.1,
                "future_demand": 0.88,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.75, "salary_potential": 0.7, "career_growth": 0.8, "social_impact": 0.3, "location_type": "Urban", "family_friendly": 0.75}
            },
            "Cybersecurity Analyst": {
                "required_skills": {"programming": 0.8, "networking": 0.9, "analysis": 0.85, "ethics": 0.8},
                "personality_traits": {"analytical": 0.9, "creativity": 0.6, "leadership": 0.4, "communication": 0.5, "problem_solving": 0.9, "teamwork": 0.5, "adaptability": 0.7, "attention_to_detail": 0.9},
                "degree_paths": {"IT": 0.85, "Computer Science": 0.9},
                "z_score_threshold": 1.3,
                "future_demand": 0.95,
                "lifestyle_profile": {"stress_level": 0.7, "work_life_balance": 0.6, "salary_potential": 0.85, "career_growth": 0.9, "social_impact": 0.5, "location_type": "Urban", "family_friendly": 0.6}
            },
            "Financial Analyst": {
                "required_skills": {"mathematics": 0.85, "analysis": 0.9, "economics": 0.8, "communication": 0.7},
                "personality_traits": {"analytical": 0.9, "creativity": 0.4, "leadership": 0.4, "communication": 0.6, "problem_solving": 0.7, "teamwork": 0.5, "adaptability": 0.4, "attention_to_detail": 0.9},
                "degree_paths": {"Finance": 0.9, "Accounting": 0.7, "Mathematics": 0.6, "Business": 0.5},
                "z_score_threshold": 1.2,
                "future_demand": 0.8,
                "lifestyle_profile": {"stress_level": 0.65, "work_life_balance": 0.55, "salary_potential": 0.85, "career_growth": 0.7, "social_impact": 0.2, "location_type": "Urban", "family_friendly": 0.6}
            },
            "Marketing Manager": {
                "required_skills": {"communication": 0.9, "creativity": 0.85, "analysis": 0.7, "leadership": 0.8},
                "personality_traits": {"analytical": 0.5, "creativity": 0.85, "leadership": 0.7, "communication": 0.9, "problem_solving": 0.5, "teamwork": 0.7, "adaptability": 0.8, "attention_to_detail": 0.4},
                "degree_paths": {"Business": 0.85, "Management": 0.9},
                "z_score_threshold": 1.0,
                "future_demand": 0.75,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.6, "salary_potential": 0.7, "career_growth": 0.7, "social_impact": 0.3, "location_type": "Urban", "family_friendly": 0.6}
            },
            "Human Resources Manager": {
                "required_skills": {"communication": 0.9, "empathy": 0.85, "leadership": 0.8, "negotiation": 0.75},
                "personality_traits": {"analytical": 0.4, "creativity": 0.4, "leadership": 0.7, "communication": 0.9, "problem_solving": 0.5, "teamwork": 0.8, "adaptability": 0.7, "attention_to_detail": 0.5},
                "degree_paths": {"Management": 0.85, "Business": 0.8},
                "z_score_threshold": 1.0,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.7, "salary_potential": 0.6, "career_growth": 0.6, "social_impact": 0.4, "location_type": "Urban", "family_friendly": 0.7}
            },
            "Mechanical Engineer": {
                "required_skills": {"mathematics": 0.9, "physics": 0.85, "design": 0.8, "problem_solving": 0.8},
                "personality_traits": {"analytical": 0.85, "creativity": 0.6, "leadership": 0.4, "communication": 0.5, "problem_solving": 0.85, "teamwork": 0.6, "adaptability": 0.5, "attention_to_detail": 0.85},
                "degree_paths": {"Engineering": 0.95, "Quantity Surveying": 0.3},
                "z_score_threshold": 1.5,
                "future_demand": 0.8,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.5, "salary_potential": 0.75, "career_growth": 0.65, "social_impact": 0.5, "location_type": "Any", "family_friendly": 0.5}
            },
            "Biomedical Engineer": {
                "required_skills": {"biology": 0.8, "engineering": 0.85, "mathematics": 0.75, "research": 0.8},
                "personality_traits": {"analytical": 0.85, "creativity": 0.7, "leadership": 0.4, "communication": 0.5, "problem_solving": 0.85, "teamwork": 0.6, "adaptability": 0.6, "attention_to_detail": 0.85},
                "degree_paths": {"Engineering": 0.7, "Bio Science": 0.8, "Computer Science": 0.4},
                "z_score_threshold": 1.5,
                "future_demand": 0.85,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.65, "salary_potential": 0.8, "career_growth": 0.85, "social_impact": 0.7, "location_type": "Urban", "family_friendly": 0.65}
            },
            "Agricultural Scientist": {
                "required_skills": {"biology": 0.85, "research": 0.8, "analysis": 0.75, "fieldwork": 0.7},
                "personality_traits": {"analytical": 0.7, "creativity": 0.5, "leadership": 0.4, "communication": 0.5, "problem_solving": 0.7, "teamwork": 0.6, "adaptability": 0.7, "attention_to_detail": 0.7},
                "degree_paths": {"Agriculture": 0.95, "Bio Science": 0.7},
                "z_score_threshold": 1.1,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.4, "work_life_balance": 0.7, "salary_potential": 0.45, "career_growth": 0.5, "social_impact": 0.7, "location_type": "Rural", "family_friendly": 0.7}
            },
            "Environmental Scientist": {
                "required_skills": {"biology": 0.8, "research": 0.85, "analysis": 0.8, "fieldwork": 0.75},
                "personality_traits": {"analytical": 0.75, "creativity": 0.5, "leadership": 0.4, "communication": 0.5, "problem_solving": 0.7, "teamwork": 0.6, "adaptability": 0.7, "attention_to_detail": 0.7},
                "degree_paths": {"Bio Science": 0.8, "Agriculture": 0.6, "Physical Science": 0.5},
                "z_score_threshold": 1.2,
                "future_demand": 0.8,
                "lifestyle_profile": {"stress_level": 0.4, "work_life_balance": 0.7, "salary_potential": 0.5, "career_growth": 0.6, "social_impact": 0.9, "location_type": "Any", "family_friendly": 0.65}
            },
            "Psychologist": {
                "required_skills": {"empathy": 0.9, "communication": 0.9, "analysis": 0.8, "research": 0.75},
                "personality_traits": {"analytical": 0.7, "creativity": 0.5, "leadership": 0.4, "communication": 0.9, "problem_solving": 0.6, "teamwork": 0.5, "adaptability": 0.6, "attention_to_detail": 0.7},
                "degree_paths": {"Social Sciences": 0.8, "Medicine": 0.6, "Arts": 0.4},
                "z_score_threshold": 1.3,
                "future_demand": 0.75,
                "lifestyle_profile": {"stress_level": 0.6, "work_life_balance": 0.65, "salary_potential": 0.6, "career_growth": 0.6, "social_impact": 0.9, "location_type": "Urban", "family_friendly": 0.65}
            },
            "Social Worker": {
                "required_skills": {"empathy": 0.95, "communication": 0.85, "counseling": 0.8, "advocacy": 0.75},
                "personality_traits": {"analytical": 0.4, "creativity": 0.4, "leadership": 0.5, "communication": 0.85, "problem_solving": 0.5, "teamwork": 0.7, "adaptability": 0.7, "attention_to_detail": 0.4},
                "degree_paths": {"Social Sciences": 0.9, "Arts": 0.6, "Education": 0.4},
                "z_score_threshold": 0.8,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.7, "work_life_balance": 0.5, "salary_potential": 0.3, "career_growth": 0.4, "social_impact": 0.95, "location_type": "Any", "family_friendly": 0.5}
            },
            "Journalist": {
                "required_skills": {"writing": 0.9, "communication": 0.85, "research": 0.8, "curiosity": 0.85},
                "personality_traits": {"analytical": 0.5, "creativity": 0.8, "leadership": 0.4, "communication": 0.9, "problem_solving": 0.5, "teamwork": 0.5, "adaptability": 0.8, "attention_to_detail": 0.6},
                "degree_paths": {"Arts": 0.8, "Social Sciences": 0.6},
                "z_score_threshold": 0.8,
                "future_demand": 0.6,
                "lifestyle_profile": {"stress_level": 0.7, "work_life_balance": 0.4, "salary_potential": 0.4, "career_growth": 0.5, "social_impact": 0.7, "location_type": "Urban", "family_friendly": 0.4}
            },
            "Graphic Designer": {
                "required_skills": {"design": 0.95, "creativity": 0.9, "technology": 0.7, "communication": 0.65},
                "personality_traits": {"analytical": 0.4, "creativity": 0.95, "leadership": 0.3, "communication": 0.5, "problem_solving": 0.5, "teamwork": 0.4, "adaptability": 0.7, "attention_to_detail": 0.8},
                "degree_paths": {"Fine Arts": 0.9, "IT": 0.4, "Arts": 0.3},
                "z_score_threshold": 0.7,
                "future_demand": 0.75,
                "lifestyle_profile": {"stress_level": 0.5, "work_life_balance": 0.7, "salary_potential": 0.5, "career_growth": 0.6, "social_impact": 0.3, "location_type": "Urban", "family_friendly": 0.7}
            },
            "Pilot": {
                "required_skills": {"physics": 0.8, "mathematics": 0.75, "stress_handling": 0.9, "spatial_awareness": 0.9},
                "personality_traits": {"analytical": 0.7, "creativity": 0.3, "leadership": 0.6, "communication": 0.7, "problem_solving": 0.7, "teamwork": 0.6, "adaptability": 0.6, "attention_to_detail": 0.9},
                "degree_paths": {"Physical Science": 0.7, "Engineering": 0.5, "Mathematics": 0.4},
                "z_score_threshold": 1.3,
                "future_demand": 0.65,
                "lifestyle_profile": {"stress_level": 0.7, "work_life_balance": 0.3, "salary_potential": 0.85, "career_growth": 0.5, "social_impact": 0.3, "location_type": "Urban", "family_friendly": 0.2}
            },
            "Police Officer": {
                "required_skills": {"law": 0.8, "communication": 0.85, "stress_handling": 0.9, "fitness": 0.8},
                "personality_traits": {"analytical": 0.5, "creativity": 0.3, "leadership": 0.7, "communication": 0.7, "problem_solving": 0.6, "teamwork": 0.7, "adaptability": 0.6, "attention_to_detail": 0.6},
                "degree_paths": {"Law": 0.7, "Social Sciences": 0.6, "Arts": 0.4},
                "z_score_threshold": 0.8,
                "future_demand": 0.7,
                "lifestyle_profile": {"stress_level": 0.85, "work_life_balance": 0.3, "salary_potential": 0.4, "career_growth": 0.5, "social_impact": 0.8, "location_type": "Any", "family_friendly": 0.3}
            },
            "Chef": {
                "required_skills": {"creativity": 0.9, "management": 0.7, "stress_handling": 0.8, "communication": 0.65},
                "personality_traits": {"analytical": 0.3, "creativity": 0.9, "leadership": 0.6, "communication": 0.5, "problem_solving": 0.5, "teamwork": 0.7, "adaptability": 0.8, "attention_to_detail": 0.7},
                "degree_paths": {"Fine Arts": 0.5, "Business": 0.3, "Management": 0.3},
                "z_score_threshold": 0.6,
                "future_demand": 0.65,
                "lifestyle_profile": {"stress_level": 0.8, "work_life_balance": 0.3, "salary_potential": 0.5, "career_growth": 0.5, "social_impact": 0.3, "location_type": "Urban", "family_friendly": 0.3}
            },
        }
        print("✅ Created fallback model with career knowledge base (30 careers)")
        
    def _prepare_model_input(self, student_data):
        """Map frontend data to the exact format the trained model expects.
        Must match the 22 columns used in generate_balanced_dataset.py:
        stream, z_score, district, dream_job,
        analytical_skill, creativity, leadership, communication_skill,
        problem_solving, teamwork, adaptability, attention_to_detail,
        preferred_location, stress_tolerance, work_life_balance_priority,
        family_attachment_level, financial_stability_need,
        career_sustainability_priority, innovation_interest, social_impact_priority,
        risk_taking (derived), district (already listed)
        """
        # Stream name mapping (frontend -> model training labels)
        stream_map = {
            "Bio Science": "Biological Science",
            "Biology": "Biological Science",
            "Biological Science": "Biological Science",
            "Physical Science": "Physical Science",
            "Physical Sciences": "Physical Science",
            "Commerce": "Commerce",
            "Commerce Stream": "Commerce",
            "Arts": "Arts",
            "Art Stream": "Arts",
            "Humanities": "Arts",
            "Engineering Technology": "Engineering Technology",
            "Technology": "Engineering Technology",
            "IT Stream": "Engineering Technology",
            "Bio Systems Technology": "Bio Systems Technology",
            "Biosystems Technology": "Bio Systems Technology",
            "Bio Technology": "Bio Systems Technology",
        }

        # Convert numeric stress tolerance to categorical label the model expects
        def numeric_to_level(val, default="Medium"):
            try:
                v = int(val)
            except (TypeError, ValueError):
                if str(val) in ("High", "Medium", "Low"):
                    return str(val)
                return default
            if v >= 4:
                return "High"
            elif v >= 2:
                return "Medium"
            else:
                return "Low"

        # All 30 dream jobs from the training dataset
        known_jobs = [
            'Accountant', 'Agricultural Scientist', 'Architect', 'Biomedical Engineer',
            'Chef', 'Civil Engineer', 'Cybersecurity Analyst', 'Data Scientist',
            'Dentist', 'Doctor', 'Entrepreneur', 'Environmental Scientist',
            'Financial Analyst', 'Graphic Designer', 'Human Resources Manager',
            'Journalist', 'Lawyer', 'Marketing Manager', 'Mechanical Engineer',
            'Nurse', 'Pharmacist', 'Pilot', 'Police Officer', 'Psychologist',
            'Social Worker', 'Software Engineer', 'Teacher', 'Veterinarian',
            'Web Developer',
        ]

        dream_job = student_data.get('dream_job', 'Software Engineer')
        if dream_job not in known_jobs:
            dream_lower = dream_job.lower()
            matched = None
            for kj in known_jobs:
                if kj.lower() in dream_lower or dream_lower in kj.lower():
                    matched = kj
                    break
            if not matched:
                job_aliases = {
                    "banker": "Financial Analyst", "professor": "Teacher",
                    "lecturer": "Teacher", "scientist": "Environmental Scientist",
                    "engineer": "Software Engineer", "researcher": "Data Scientist",
                    "designer": "Graphic Designer", "writer": "Journalist",
                    "manager": "Marketing Manager", "developer": "Web Developer",
                    "analyst": "Data Scientist", "surgeon": "Doctor",
                }
                for alias, mapped in job_aliases.items():
                    if alias in dream_lower:
                        matched = mapped
                        break
            dream_job = matched or "Software Engineer"

        # Known districts
        known_districts = ['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
                           'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
                           'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matara',
                           'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
                           'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya']
        district = student_data.get('district', 'Colombo')
        if district not in known_districts:
            district = 'Colombo'

        # Map preferred_location — now includes Suburban
        location_pref = student_data.get('preferred_location',
                        student_data.get('lifestyle_preferences', {}).get('locationPreference', 'Urban'))
        if location_pref not in ('Urban', 'Suburban', 'Rural', 'Any'):
            loc_lower = str(location_pref).lower()
            if 'urban' in loc_lower or 'city' in loc_lower:
                location_pref = 'Urban'
            elif 'suburban' in loc_lower:
                location_pref = 'Suburban'
            elif 'rural' in loc_lower or 'village' in loc_lower:
                location_pref = 'Rural'
            else:
                location_pref = 'Any'

        # Build the exact feature input the model expects (matches training columns)
        model_input = {
            'stream': stream_map.get(student_data.get('stream', ''), student_data.get('stream', 'Physical Science')),
            'z_score': float(student_data.get('z_score', 0)),
            'district': district,
            'dream_job': dream_job,
            'analytical_skill': int(student_data.get('analytical_skill', 3)),
            'creativity': int(student_data.get('creativity', 3)),
            'leadership': int(student_data.get('leadership', 3)),
            'communication_skill': int(student_data.get('communication_skill', 3)),
            'problem_solving': int(student_data.get('problem_solving', 3)),
            'teamwork': int(student_data.get('teamwork', 3)),
            'adaptability': int(student_data.get('adaptability', 3)),
            'attention_to_detail': int(student_data.get('attention_to_detail', 3)),
            'preferred_location': location_pref,
            'stress_tolerance': numeric_to_level(student_data.get('stress_tolerance', 'Medium')),
            'work_life_balance_priority': int(student_data.get('work_life_balance_priority', 3)),
            'family_attachment_level': int(student_data.get('family_attachment_level', 3)),
            'financial_stability_need': int(student_data.get('financial_stability_need', 3)),
            'career_sustainability_priority': int(student_data.get('career_sustainability_priority', 3)),
            'innovation_interest': int(student_data.get('innovation_interest', 3)),
            'social_impact_priority': int(student_data.get('social_impact_priority', 3)),
        }

        return model_input

    def predict_degree(self, student_data):
        """Predict degree program using trained model or fallback"""
        try:
            # If trained model exists, use it
            if self.model is not None:
                # Prepare input with proper value mapping
                model_input = self._prepare_model_input(student_data)
                input_df = pd.DataFrame([model_input])

                # Encode categorical variables
                for col, encoder in self.encoders.items():
                    if col in input_df.columns:
                        input_df[col] = encoder.transform(input_df[col].astype(str))

                # Ensure column order matches training
                expected_features = list(self.encoders.keys()) + [
                    c for c in input_df.columns if c not in self.encoders
                ]
                # Use model's feature names if available
                if hasattr(self.model, 'feature_names_in_'):
                    input_df = input_df[self.model.feature_names_in_]

                # Get prediction probabilities for all classes
                probabilities = self.model.predict_proba(input_df)[0]
                classes = list(self.le_target.classes_)

                # Apply stream masking — zero out impossible degrees for this stream
                # This is a hard constraint based on Sri Lankan A/L stream eligibility
                # Must match STREAM_DEGREE_MAP in generate_balanced_dataset.py
                VALID_DEGREES_FOR_STREAM = {
                    "Biological Science": ["Medicine", "Dental", "Nursing", "Pharmacy", "Bio Science", "Agriculture", "Veterinary Science"],
                    "Physical Science": ["Engineering", "IT", "Computer Science", "Mathematics", "Physical Science", "Architecture", "Quantity Surveying"],
                    "Commerce": ["Business", "Management", "Accounting", "Finance"],
                    "Arts": ["Arts", "Law", "Education", "Social Sciences", "Fine Arts"],
                    "Engineering Technology": ["IT", "Engineering", "Computer Science", "Quantity Surveying"],
                    "Bio Systems Technology": ["Bio Science", "Agriculture", "IT"],
                }

                raw_stream = model_input.get('stream', '')
                valid_degrees = VALID_DEGREES_FOR_STREAM.get(raw_stream, list(classes))

                masked_probs = probabilities.copy()
                for i, cls in enumerate(classes):
                    if cls not in valid_degrees:
                        masked_probs[i] = 0.0

                # Renormalize
                total = masked_probs.sum()
                if total > 0:
                    masked_probs = masked_probs / total

                corrected_probs = dict(zip(classes, masked_probs))
                predicted_degree = max(corrected_probs, key=corrected_probs.get)
                confidence = corrected_probs[predicted_degree]

                # Also get fallback results for multiple recommendations
                fallback_result = self._fallback_predict(student_data)

                result = {
                    "predicted_degree": predicted_degree,
                    "confidence": float(confidence),
                    "method": "trained_random_forest"
                }

                # Merge fallback recommendations but put RF prediction first
                if 'recommendations' in fallback_result:
                    recs = fallback_result['recommendations']
                    rf_rec_exists = any(r['degree'] == predicted_degree for r in recs)
                    if not rf_rec_exists and len(recs) > 0:
                        rf_rec = recs[0].copy()
                        rf_rec['degree'] = predicted_degree
                        rf_rec['probability'] = float(confidence)
                        rf_rec['confidence'] = float(confidence)
                        rf_rec['explanation'] = f"AI model (Random Forest, 97.3% accuracy) predicts {predicted_degree} as your best-fit degree based on your complete profile."
                        rf_rec['roadmap'] = self._generate_degree_roadmap(predicted_degree)
                        recs.insert(0, rf_rec)
                    result['recommendations'] = recs[:4]

                return result
            else:
                # Use fallback backward-chaining model
                return self._fallback_predict(student_data)

        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_predict(student_data)
    
    def _fallback_predict(self, student_data):
        """Fallback prediction using Z-score based recommendation logic"""
        dream_job = student_data.get('dream_job', '')
        stream = student_data.get('stream', '')
        z_score = float(student_data.get('z_score', 0))
        
        # Realistic Sri Lankan university cutoff data (2024 approximate)
        UNIVERSITY_CUTOFFS = {
            "Medicine": {"min_z": 1.75},
            "Dental": {"min_z": 1.70},
            "Engineering": {"min_z": 1.40},
            "IT": {"min_z": 1.10},
            "Computer Science": {"min_z": 1.20},
            "Business": {"min_z": 0.90},
            "Management": {"min_z": 0.95},
            "Accounting": {"min_z": 1.00},
            "Finance": {"min_z": 0.95},
            "Bio Science": {"min_z": 1.30},
            "Agriculture": {"min_z": 1.00},
            "Mathematics": {"min_z": 1.20},
            "Statistics": {"min_z": 1.15},
            "Physical Science": {"min_z": 1.25},
            "Arts": {"min_z": 0.55},
            "Education": {"min_z": 0.60},
            "Literature": {"min_z": 0.60},
            "Social Sciences": {"min_z": 0.65},
            "Law": {"min_z": 1.50},
            "Nursing": {"min_z": 1.40},
            "Engineering Technology": {"min_z": 1.20},
            "Information Technology": {"min_z": 1.10}
        }
        
        # Determine eligible degrees based on Z-score and stream
        eligible_degrees = []
        
        # Handle all Sri Lankan AL streams with realistic Z-score thresholds
        if stream in ["Bio Science", "Biology", "Biological Science"]:
            if z_score >= 1.85:
                eligible_degrees.append(("Medicine", 0.95))
            if z_score >= 1.80:
                eligible_degrees.append(("Dental", 0.90))
            if z_score >= 1.50:
                eligible_degrees.append(("Veterinary Science", 0.85))
            if z_score >= 1.50:
                eligible_degrees.append(("Pharmacy", 0.85))
            if z_score >= 1.30:
                eligible_degrees.append(("Nursing", 0.80))
            if z_score >= 1.10:
                eligible_degrees.append(("Bio Science", 0.85))
            if z_score >= 0.90:
                eligible_degrees.append(("Agriculture", 0.75))

        elif stream in ["Physical Science", "Physical Sciences", "Combined Mathematics"]:
            if z_score >= 1.40:
                eligible_degrees.append(("Engineering", 0.90))
            if z_score >= 1.30:
                eligible_degrees.append(("Architecture", 0.80))
            if z_score >= 1.25:
                eligible_degrees.append(("Physical Science", 0.80))
            if z_score >= 1.20:
                eligible_degrees.append(("Mathematics", 0.80))
            if z_score >= 1.20:
                eligible_degrees.append(("Quantity Surveying", 0.75))
            if z_score >= 1.15:
                eligible_degrees.append(("Computer Science", 0.78))
            if z_score >= 1.00:
                eligible_degrees.append(("IT", 0.75))

        elif stream in ["Commerce", "Commerce Stream", "Accounting"]:
            if z_score >= 0.90:
                eligible_degrees.append(("Accounting", 0.90))
            if z_score >= 0.80:
                eligible_degrees.append(("Business", 0.90))
            if z_score >= 0.85:
                eligible_degrees.append(("Finance", 0.85))
            if z_score >= 0.85:
                eligible_degrees.append(("Management", 0.80))

        elif stream in ["Arts", "Art Stream", "Humanities"]:
            if z_score >= 1.40:
                eligible_degrees.append(("Law", 0.85))
            if z_score >= 0.55:
                eligible_degrees.append(("Education", 0.85))
            if z_score >= 0.50:
                eligible_degrees.append(("Arts", 0.90))
            if z_score >= 0.60:
                eligible_degrees.append(("Social Sciences", 0.80))
            if z_score >= 0.50:
                eligible_degrees.append(("Fine Arts", 0.70))

        elif stream in ["Engineering Technology", "Technology", "IT Stream"]:
            if z_score >= 1.40:
                eligible_degrees.append(("Engineering", 0.90))
            if z_score >= 1.15:
                eligible_degrees.append(("Computer Science", 0.85))
            if z_score >= 1.20:
                eligible_degrees.append(("Quantity Surveying", 0.75))
            if z_score >= 1.00:
                eligible_degrees.append(("IT", 0.90))

        elif stream in ["Bio Systems Technology", "Biosystems Technology", "Bio Technology"]:
            if z_score >= 1.10:
                eligible_degrees.append(("Bio Science", 0.90))
            if z_score >= 1.00:
                eligible_degrees.append(("IT", 0.80))
            if z_score >= 0.90:
                eligible_degrees.append(("Agriculture", 0.75))
        
        # Stream-degree compatibility — matches STREAM_DEGREE_MAP from training
        stream_degree_priority = {
            "Bio Science": {"Medicine": 1.0, "Dental": 0.95, "Nursing": 0.85, "Pharmacy": 0.85, "Bio Science": 1.0, "Agriculture": 0.9, "Veterinary Science": 0.9},
            "Biology": {"Medicine": 1.0, "Dental": 0.95, "Nursing": 0.85, "Pharmacy": 0.85, "Bio Science": 1.0, "Agriculture": 0.9, "Veterinary Science": 0.9},
            "Biological Science": {"Medicine": 1.0, "Dental": 0.95, "Nursing": 0.85, "Pharmacy": 0.85, "Bio Science": 1.0, "Agriculture": 0.9, "Veterinary Science": 0.9},
            "Physical Science": {"Engineering": 1.0, "IT": 0.85, "Computer Science": 0.9, "Mathematics": 0.9, "Physical Science": 1.0, "Architecture": 0.8, "Quantity Surveying": 0.8},
            "Physical Sciences": {"Engineering": 1.0, "IT": 0.85, "Computer Science": 0.9, "Mathematics": 0.9, "Physical Science": 1.0, "Architecture": 0.8, "Quantity Surveying": 0.8},
            "Commerce": {"Business": 1.0, "Management": 0.95, "Accounting": 0.95, "Finance": 0.9},
            "Commerce Stream": {"Business": 1.0, "Management": 0.95, "Accounting": 0.95, "Finance": 0.9},
            "Arts": {"Arts": 1.0, "Law": 0.9, "Education": 0.95, "Social Sciences": 0.9, "Fine Arts": 0.85},
            "Art Stream": {"Arts": 1.0, "Law": 0.9, "Education": 0.95, "Social Sciences": 0.9, "Fine Arts": 0.85},
            "Humanities": {"Arts": 1.0, "Law": 0.9, "Education": 0.95, "Social Sciences": 0.9, "Fine Arts": 0.85},
            "Engineering Technology": {"IT": 1.0, "Engineering": 1.0, "Computer Science": 0.95, "Quantity Surveying": 0.85},
            "Technology": {"IT": 1.0, "Engineering": 1.0, "Computer Science": 0.95, "Quantity Surveying": 0.85},
            "Bio Systems Technology": {"Bio Science": 1.0, "Agriculture": 0.9, "IT": 0.85},
            "Biosystems Technology": {"Bio Science": 1.0, "Agriculture": 0.9, "IT": 0.85},
        }

        # Job-degree compatibility — all 30 dream jobs
        job_degree_compatibility = {
            "Doctor": {"Medicine": 1.0, "Bio Science": 0.5},
            "Dentist": {"Dental": 1.0, "Medicine": 0.4},
            "Nurse": {"Nursing": 1.0, "Bio Science": 0.5},
            "Pharmacist": {"Pharmacy": 1.0, "Bio Science": 0.4},
            "Veterinarian": {"Veterinary Science": 1.0, "Bio Science": 0.5, "Agriculture": 0.3},
            "Software Engineer": {"IT": 0.95, "Computer Science": 1.0, "Engineering": 0.5},
            "Web Developer": {"IT": 1.0, "Computer Science": 0.9},
            "Data Scientist": {"IT": 0.8, "Computer Science": 0.9, "Mathematics": 0.85},
            "Cybersecurity Analyst": {"IT": 0.9, "Computer Science": 1.0},
            "Civil Engineer": {"Engineering": 1.0, "Quantity Surveying": 0.7, "Architecture": 0.5},
            "Mechanical Engineer": {"Engineering": 1.0, "Quantity Surveying": 0.4},
            "Biomedical Engineer": {"Engineering": 0.7, "Bio Science": 0.8, "Computer Science": 0.5},
            "Architect": {"Architecture": 1.0, "Quantity Surveying": 0.6, "Engineering": 0.4},
            "Pilot": {"Physical Science": 0.8, "Engineering": 0.6, "Mathematics": 0.5},
            "Accountant": {"Accounting": 1.0, "Finance": 0.8, "Business": 0.7},
            "Financial Analyst": {"Finance": 1.0, "Accounting": 0.8, "Mathematics": 0.7, "Business": 0.5},
            "Entrepreneur": {"Business": 0.9, "Management": 0.85, "Finance": 0.7},
            "Marketing Manager": {"Management": 0.95, "Business": 0.9},
            "Human Resources Manager": {"Management": 0.95, "Business": 0.8},
            "Teacher": {"Education": 1.0, "Arts": 0.8, "Social Sciences": 0.7},
            "Lawyer": {"Law": 1.0, "Social Sciences": 0.5, "Arts": 0.3},
            "Social Worker": {"Social Sciences": 1.0, "Arts": 0.6, "Education": 0.5},
            "Psychologist": {"Social Sciences": 0.9, "Medicine": 0.6, "Arts": 0.4},
            "Police Officer": {"Law": 0.7, "Social Sciences": 0.6, "Arts": 0.4},
            "Journalist": {"Arts": 0.9, "Social Sciences": 0.8},
            "Graphic Designer": {"Fine Arts": 1.0, "IT": 0.4, "Arts": 0.3},
            "Chef": {"Fine Arts": 0.5, "Business": 0.3, "Management": 0.3},
            "Agricultural Scientist": {"Agriculture": 1.0, "Bio Science": 0.7},
            "Environmental Scientist": {"Bio Science": 0.9, "Agriculture": 0.7, "Physical Science": 0.5},
        }
        
        # Enhanced scoring with stream, job, personality, and lifestyle
        for i, (degree, score) in enumerate(eligible_degrees):
            stream_priority = stream_degree_priority.get(stream, {}).get(degree, 0.5)
            job_priority = job_degree_compatibility.get(dream_job, {}).get(degree, 0.3)

            # Personality factor — average of student's personality scores (1-5 scale → 0-1)
            p_scores = [
                float(student_data.get('analytical_skill', 3)),
                float(student_data.get('creativity', 3)),
                float(student_data.get('problem_solving', 3)),
                float(student_data.get('adaptability', 3)),
                float(student_data.get('attention_to_detail', 3)),
            ]
            personality_factor = (sum(p_scores) / len(p_scores)) / 5.0

            combined_score = score * (0.45 * stream_priority + 0.35 * job_priority + 0.20 * personality_factor)
            eligible_degrees[i] = (degree, combined_score)
        
        # Sort by score
        eligible_degrees.sort(key=lambda x: x[1], reverse=True)
        
        if eligible_degrees:
            # Return top 4 degree recommendations
            top_degrees = eligible_degrees[:4] if len(eligible_degrees) >= 4 else eligible_degrees
            best_degree, confidence = eligible_degrees[0]

            # Create multiple degree recommendations
            degree_recommendations = []
            for degree, score in top_degrees:
                degree_recommendations.append({
                    "degree": degree,
                    "probability": float(score),
                    "confidence": float(score),
                    "explanation": f"Based on your {stream} stream and {z_score} Z-score, {degree} offers strong alignment with your {dream_job} career goals.",
                    "skill_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "problem_solving": float(student_data.get('problem_solving', 3) / 5.0)
                    },
                    "personality_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "leadership": float(student_data.get('leadership', 3) / 5.0),
                        "communication": float(student_data.get('communication_skill', 3) / 5.0),
                        "problem_solving": float(student_data.get('problem_solving', 3) / 5.0),
                        "teamwork": float(student_data.get('teamwork', 3) / 5.0),
                        "adaptability": float(student_data.get('adaptability', 3) / 5.0),
                        "attention_to_detail": float(student_data.get('attention_to_detail', 3) / 5.0)
                    },
                    "academic_feasibility": {
                        "z_score_feasibility": min(1.0, float(student_data.get('z_score', 0)) / 2.0),
                        "district_adjustment": 0.8,
                        "threshold_gap": max(0, 2.0 - float(student_data.get('z_score', 0)))
                    },
                    "lifestyle_compatibility": self._calculate_lifestyle_compat(student_data),
                    "roadmap": self._generate_degree_roadmap(degree)
                })
            
            return {
                "predicted_degree": best_degree,
                "confidence": float(confidence),
                "method": "z_score_fallback",
                "recommendations": degree_recommendations
            }
        else:
            # Fallback with multiple degree options
            fallback_degrees = ["IT", "Business", "Engineering", "Bio Science", "Mathematics", "Arts", 
                              "Computer Science", "Physical Science", "Statistics", "Accounting", "Finance", 
                              "Management", "Education", "Literature", "Social Sciences", "Agriculture"]
            degree_recommendations = []
            
            for degree in fallback_degrees[:3]:
                degree_recommendations.append({
                    "degree": degree,
                    "probability": 0.5,
                    "confidence": 0.5,
                    "explanation": f"Based on your profile, {degree} could be a suitable option for your career goals.",
                    "skill_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "problem_solving": float(student_data.get('problem_solving', 3) / 5.0)
                    },
                    "personality_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "leadership": float(student_data.get('leadership', 3) / 5.0),
                        "communication": float(student_data.get('communication_skill', 3) / 5.0),
                        "problem_solving": float(student_data.get('problem_solving', 3) / 5.0),
                        "teamwork": float(student_data.get('teamwork', 3) / 5.0),
                        "adaptability": float(student_data.get('adaptability', 3) / 5.0),
                        "attention_to_detail": float(student_data.get('attention_to_detail', 3) / 5.0)
                    },
                    "academic_feasibility": {
                        "z_score_feasibility": min(1.0, float(student_data.get('z_score', 0)) / 2.0),
                        "district_adjustment": 0.8,
                        "threshold_gap": max(0, 2.0 - float(student_data.get('z_score', 0)))
                    },
                    "lifestyle_compatibility": self._calculate_lifestyle_compat(student_data),
                    "roadmap": self._generate_degree_roadmap(degree)
                })
            
            return {
                "predicted_degree": "IT",
                "confidence": 0.5,
                "method": "fallback",
                "recommendations": degree_recommendations
            }

    def _calculate_lifestyle_compat(self, student_data):
        """Calculate lifestyle compatibility from student preferences.
        Uses the same logic as BackwardChainingModel._calculate_lifestyle_compatibility in flask_app.py.
        """
        def safe_int_local(val, default=3):
            try:
                return int(val)
            except (TypeError, ValueError):
                return default

        # Get the career's lifestyle profile from knowledge base
        dream_job = student_data.get('dream_job', '')
        career_lp = {}
        if hasattr(self, 'career_knowledge') and self.career_knowledge:
            career_info = self.career_knowledge.get(dream_job, {})
            career_lp = career_info.get('lifestyle_profile', {})

        # Stress match
        career_stress = career_lp.get('stress_level', 0.5)
        student_stress = safe_int_local(student_data.get('stress_tolerance', 3)) / 5.0
        stress_match = min(1.0, student_stress / career_stress) if career_stress > 0 else 1.0

        # Work-life balance match
        wlb_imp = safe_int_local(student_data.get('work_life_balance_priority', 3)) / 5.0
        career_wlb = career_lp.get('work_life_balance', 0.5)
        wlb_match = 1.0 - wlb_imp * (1.0 - career_wlb)

        # Salary match
        salary_imp = safe_int_local(student_data.get('financial_stability_need', 3)) / 5.0
        career_salary = career_lp.get('salary_potential', 0.5)
        salary_match = 1.0 - salary_imp * (1.0 - career_salary)

        # Career growth match
        growth_imp = safe_int_local(student_data.get('career_sustainability_priority', 3)) / 5.0
        career_growth = career_lp.get('career_growth', 0.5)
        growth_match = 1.0 - growth_imp * (1.0 - career_growth)

        # Social impact match
        impact_imp = safe_int_local(student_data.get('social_impact_priority', 3)) / 5.0
        career_impact = career_lp.get('social_impact', 0.5)
        impact_match = 1.0 - impact_imp * (1.0 - career_impact)

        # Location match
        student_loc = str(student_data.get('preferred_location', 'Any'))
        career_loc = career_lp.get('location_type', 'Urban')
        if student_loc == 'Any' or career_loc == 'Any':
            location_match = 1.0
        elif student_loc == career_loc:
            location_match = 1.0
        elif (student_loc in ('Suburban', 'Urban')) and (career_loc in ('Suburban', 'Urban')):
            location_match = 0.7
        else:
            location_match = 0.4

        # Family attachment match
        family_imp = safe_int_local(student_data.get('family_attachment_level', 3)) / 5.0
        career_family = career_lp.get('family_friendly', 0.5)
        family_match = 1.0 - family_imp * (1.0 - career_family)

        return {
            "stress_match": round(stress_match, 3),
            "work_life_balance": round(wlb_match, 3),
            "salary_match": round(salary_match, 3),
            "career_growth": round(growth_match, 3),
            "social_impact": round(impact_match, 3),
            "location_match": round(location_match, 3),
            "family_friendly": round(family_match, 3)
        }

    def _generate_degree_roadmap(self, degree):
        """Generate career roadmap based on degree"""
        roadmaps = {
            "IT": ["Bachelor of IT / Computer Science (4 years)", "Specialize in AI/ML/Software Engineering/Cybersecurity", "Industry certifications (AWS, Google Cloud, CompTIA)", "Career paths: Software Engineer, Data Scientist, Web Developer"],
            "Computer Science": ["Bachelor of Computer Science (4 years)", "Specialize in AI/ML/Software Engineering", "Master's in Computer Science (2 years)", "Career paths: Software Engineer, Data Scientist, Cybersecurity Analyst"],
            "Engineering": ["Bachelor of Engineering (4 years)", "Choose specialization (Civil/Mechanical/Electrical/Biomedical)", "Professional certification (IESL Chartered Engineer)", "Career paths: Engineer, Project Manager, Consultant"],
            "Physical Science": ["Bachelor of Science in Physical Science (4 years)", "Research specialization", "Master's/PhD program", "Career paths: Researcher, Scientist, Pilot Training"],
            "Medicine": ["MBBS (5 years + 1 year internship)", "House Officer Training (1 year)", "MD/Board Certification specialization (3-5 years)", "Career paths: Doctor, Specialist, Medical Researcher"],
            "Dental": ["BDS - Bachelor of Dental Surgery (5 years)", "Internship (1 year)", "Specialization (Orthodontics, Oral Surgery, etc.)", "Career paths: Dentist, Dental Specialist, Dental Surgeon"],
            "Nursing": ["BSc Nursing (4 years)", "Clinical placement and registration", "Specialization (ICU, Pediatric, etc.)", "Career paths: Registered Nurse, Nurse Manager, Public Health Nurse"],
            "Pharmacy": ["B.Pharm - Bachelor of Pharmacy (4 years)", "Internship and registration", "Specialization (Clinical, Hospital, Research)", "Career paths: Pharmacist, Clinical Pharmacist, Pharmaceutical Researcher"],
            "Veterinary Science": ["BVSc - Bachelor of Veterinary Science (5 years)", "Internship and registration", "Specialization (Large Animal, Small Animal, Wildlife)", "Career paths: Veterinarian, Animal Researcher, Wildlife Conservation"],
            "Bio Science": ["Bachelor of Science in Biological Science (4 years)", "Research specialization (Microbiology, Biotechnology)", "Master's/PhD program", "Career paths: Researcher, Biomedical Engineer, Environmental Scientist"],
            "Agriculture": ["Bachelor of Agricultural Science (4 years)", "Field specialization", "Master's in Agriculture (2 years)", "Career paths: Agricultural Scientist, Farm Manager, Environmental Consultant"],
            "Architecture": ["B.Arch - Bachelor of Architecture (5 years)", "Professional training and SLIA registration", "Master's in Architecture/Urban Design", "Career paths: Architect, Urban Planner, Interior Designer"],
            "Quantity Surveying": ["BSc Quantity Surveying (4 years)", "Professional training and IQSSL registration", "Chartered Quantity Surveyor certification", "Career paths: Quantity Surveyor, Project Manager, Construction Manager"],
            "Mathematics": ["Bachelor of Mathematics (4 years)", "Applied specialization (Statistics, Actuarial Science)", "Master's/PhD in Mathematics", "Career paths: Data Scientist, Actuary, Financial Analyst"],
            "Business": ["Bachelor of Business Administration (4 years)", "MBA or specialized Master's (2 years)", "Professional certification (CIMA, ACCA)", "Career paths: Business Manager, Entrepreneur, Marketing Manager"],
            "Management": ["Bachelor of Management (4 years)", "MBA or specialized Master's (2 years)", "Professional HR/Marketing certification", "Career paths: HR Manager, Marketing Manager, Operations Manager"],
            "Accounting": ["Bachelor of Accounting (4 years)", "Professional certification (CA Sri Lanka, ACCA, CIMA)", "Master's in Accounting (2 years)", "Career paths: Chartered Accountant, Auditor, Financial Controller"],
            "Finance": ["Bachelor of Finance (4 years)", "Professional certification (CFA/CPA)", "Master's in Finance (2 years)", "Career paths: Financial Analyst, Investment Banker, Risk Manager"],
            "Arts": ["Bachelor of Arts (4 years)", "Specialization (Languages, History, Political Science)", "Professional development / PGDE", "Career paths: Teacher, Journalist, Public Service Officer"],
            "Law": ["LLB - Bachelor of Laws (4 years)", "Sri Lanka Law College (2 years) and Bar Exam", "Specialization (Corporate, Criminal, International)", "Career paths: Attorney-at-Law, Legal Consultant, Judge"],
            "Education": ["Bachelor of Education (4 years)", "Teaching certification / PGDE", "Master's in Education (2 years)", "Career paths: Teacher, Education Administrator, Curriculum Developer"],
            "Social Sciences": ["Bachelor of Social Sciences (4 years)", "Specialization (Sociology/Psychology/Political Science)", "Master's program / Professional certification", "Career paths: Social Worker, Psychologist, Counselor"],
            "Fine Arts": ["Bachelor of Fine Arts (4 years)", "Portfolio development and exhibitions", "Master's in Fine Arts / Design", "Career paths: Graphic Designer, Art Director, Visual Artist"],
        }
        return roadmaps.get(degree, ["General degree pathway (4 years)", "Specialization", "Professional development", "Career advancement"])

class UniversityRecommender:
    def __init__(self):
        self.universities = _get_university_database()
    
    def recommend_universities(self, predicted_degree, student_z_score, student_district):
        """Recommend universities based on predicted degree and student profile"""
        recommendations = {"government": [], "private": []}
        
        # Get student district coordinates for proximity calculation
        district_coordinates = self._get_district_coordinates(student_district)
        
        # Government universities
        gov_universities = []
        for uni_name, uni_info in self.universities["government"].items():
            if predicted_degree in uni_info["degrees"]:
                admission_prob = self._calculate_admission_probability(
                    student_z_score, 
                    uni_info["z_score_requirements"].get(predicted_degree, 1.5),
                    student_district,
                    uni_info.get("district_bonus", {})
                )
                
                if admission_prob > 0.3:  # Minimum threshold
                    uni_rec = {
                        "name": uni_name,
                        "location": uni_info["location"],
                        "coordinates": uni_info.get("coordinates"),
                        "admission_probability": admission_prob,
                        "z_score_requirement": uni_info["z_score_requirements"].get(predicted_degree, 1.5),
                        "available_degrees": uni_info["degrees"],
                        "z_score_requirements": uni_info["z_score_requirements"],
                        "national_rank": uni_info["rankings"].get("national"),
                        "rankings": uni_info["rankings"],
                        "facilities": uni_info["facilities"],
                        "specialties": uni_info["specialties"],
                        "district_bonus": uni_info.get("district_bonus", {}),
                        "explanation": self._generate_explanation(
                            admission_prob, student_z_score,
                            uni_info["z_score_requirements"].get(predicted_degree, 1.5),
                            student_district, uni_info.get("district_bonus", {})
                        )
                    }
                    
                    # Add distance if coordinates available
                    if "coordinates" in uni_info:
                        uni_rec["distance_km"] = self._calculate_distance(
                            district_coordinates, uni_info["coordinates"]
                        )
                    
                    gov_universities.append(uni_rec)
        
        # Sort government universities by proximity
        gov_universities = self._get_nearest_universities(student_district, gov_universities)
        recommendations["government"] = gov_universities
        
        # Private universities
        private_universities = []
        for uni_name, uni_info in self.universities["private"].items():
            if predicted_degree in uni_info["degrees"]:
                # Private universities have flexible admission
                admission_prob = min(1.0, student_z_score / 1.0 + 0.2)
                
                uni_rec = {
                    "name": uni_name,
                    "location": uni_info["location"],
                    "coordinates": uni_info.get("coordinates"),
                    "admission_probability": admission_prob,
                    "available_degrees": uni_info["degrees"],
                    "z_score_requirements": uni_info.get("z_score_requirements", {}),
                    "tuition_fee_range": uni_info.get("tuition_fee_range", {}),
                    "national_rank": uni_info["rankings"].get("national"),
                    "rankings": uni_info["rankings"],
                    "facilities": uni_info["facilities"],
                    "specialties": uni_info["specialties"],
                    "accreditation": uni_info.get("accreditation", []),
                    "explanation": "Flexible admission with good facilities and industry partnerships"
                }
                
                # Add distance if coordinates available
                if "coordinates" in uni_info:
                    uni_rec["distance_km"] = self._calculate_distance(
                        district_coordinates, uni_info["coordinates"]
                    )
                
                private_universities.append(uni_rec)
        
        # Sort private universities by proximity
        private_universities = self._get_nearest_universities(student_district, private_universities)
        recommendations["private"] = private_universities
        
        # Sort by admission probability
        recommendations["government"].sort(key=lambda x: x["admission_probability"], reverse=True)
        recommendations["private"].sort(key=lambda x: x["admission_probability"], reverse=True)
        
        return recommendations
    
    def _calculate_admission_probability(self, student_z_score, required_z_score, student_district, district_bonuses):
        """Calculate admission probability"""
        z_score_diff = student_z_score - required_z_score
        
        if z_score_diff >= 0:
            base_probability = 0.9
        elif z_score_diff >= -0.2:
            base_probability = 0.6
        elif z_score_diff >= -0.5:
            base_probability = 0.3
        else:
            base_probability = 0.1
        
        # Apply district bonus
        district_bonus = district_bonuses.get(student_district, 0)
        adjusted_probability = min(1.0, base_probability + district_bonus)
        
        return adjusted_probability
    
    def _generate_explanation(self, admission_prob, student_z_score, required_z_score, student_district, district_bonuses):
        """Generate explanation for university recommendation"""
        z_score_diff = student_z_score - required_z_score
        district_bonus = district_bonuses.get(student_district, 0)
        
        if z_score_diff >= 0:
            z_score_text = f"Your Z-score of {student_z_score} meets requirement of {required_z_score}"
        elif z_score_diff >= -0.2:
            z_score_text = f"Your Z-score of {student_z_score} is slightly below requirement of {required_z_score}"
        else:
            z_score_text = f"Your Z-score of {student_z_score} is below requirement of {required_z_score}"
        
        if district_bonus > 0:
            bonus_text = f" and you receive a {district_bonus*100:.0f}% district bonus for {student_district}"
        else:
            bonus_text = ""
        
        return f"{z_score_text}{bonus_text}. Admission probability: {admission_prob:.1%}."
    
    def _get_district_coordinates(self, district):
        """Get coordinates for Sri Lankan districts"""
        district_coords = {
            "Colombo": {"lat": 6.9271, "lon": 79.8612},
            "Gampaha": {"lat": 7.0854, "lon": 79.9945},
            "Kandy": {"lat": 7.2906, "lon": 80.6337},
            "Galle": {"lat": 6.0536, "lon": 80.2200},
            "Jaffna": {"lat": 9.6615, "lon": 80.0107},
            "Matara": {"lat": 5.9549, "lon": 80.5550},
            "Batticaloa": {"lat": 7.7102, "lon": 81.6988},
            "Trincomalee": {"lat": 8.5644, "lon": 81.2337},
            "Kurunegala": {"lat": 7.4823, "lon": 80.3627},
            "Anuradhapura": {"lat": 8.3114, "lon": 80.4128},
            "Badulla": {"lat": 6.9919, "lon": 81.0553},
            "Monaragala": {"lat": 7.3539, "lon": 80.4638},
            "Polonnaruwa": {"lat": 7.9333, "lon": 81.0044},
            "Ratnapura": {"lat": 6.7056, "lon": 80.7700},
            "Kegalle": {"lat": 7.2535, "lon": 80.5987},
            "Mannar": {"lat": 8.9775, "lon": 79.9043},
            "Vavuniya": {"lat": 8.7564, "lon": 80.4968},
            "Matale": {"lat": 7.4668, "lon": 80.6224},
            "Nuwara Eliya": {"lat": 6.9128, "lon": 80.2237},
            "Kilinochchi": {"lat": 7.4810, "lon": 80.2345},
            "Hambantota": {"lat": 6.1244, "lon": 81.0553},
            "Puttalam": {"lat": 7.9036, "lon": 81.7779},
            "Ampara": {"lat": 7.3242, "lon": 81.8420}
        }
        
        # Handle district name variations
        district_aliases = {
            "Kadawatha": "Kaduwela",
            "Kaduwela": "Kaduwela",
            "Kadawela": "Kaduwela",
            "Kaduwatha": "Kaduwela"
        }
        
        # Normalize district name
        normalized_district = district_aliases.get(district, district)
        
        return district_coords.get(normalized_district, {"lat": 6.9271, "lon": 79.8612})  # Default to Colombo
    
    def _calculate_distance(self, coords1, coords2):
        """Calculate distance between two coordinates in km"""
        lat1, lon1 = math.radians(coords1["lat"]), math.radians(coords1["lon"])
        lat2, lon2 = math.radians(coords2["lat"]), math.radians(coords2["lon"])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a)) * math.cos(lat1) * math.cos(lat2)
        
        return 6371 * c  # Earth's radius in km
    
    def _get_nearest_universities(self, student_district, all_universities):
        """Sort universities by distance from student's district"""
        student_coords = self._get_district_coordinates(student_district)

        for uni in all_universities:
            if "distance_km" not in uni and student_coords:
                # Try to calculate distance from university location name
                uni_location = uni.get("location", "")
                uni_coords = self._get_district_coordinates(uni_location)
                if uni_coords:
                    uni["distance_km"] = self._calculate_distance(student_coords, uni_coords)

        all_universities.sort(key=lambda x: x.get("distance_km", float('inf')))
        return all_universities

# University Database with Location Data

# University database is imported from flask_app at runtime to avoid duplication
# Fallback minimal database if flask_app is not available
UNIVERSITY_DATABASE = None

def _get_university_database():
    global UNIVERSITY_DATABASE
    if UNIVERSITY_DATABASE is not None:
        return UNIVERSITY_DATABASE
    try:
        from flask_app import UNIVERSITY_DATABASE as FLASK_UNI_DB
        UNIVERSITY_DATABASE = FLASK_UNI_DB
        return UNIVERSITY_DATABASE
    except ImportError:
        # Fallback if not running within flask context — includes all 23 degree types
        UNIVERSITY_DATABASE = {
            "government": {
                "University of Colombo": {
                    "degrees": ["IT", "Computer Science", "Business", "Bio Science", "Mathematics", "Medicine", "Law", "Arts", "Education", "Social Sciences", "Management"],
                    "z_score_requirements": {"IT": 1.55, "Computer Science": 1.60, "Business": 1.45, "Bio Science": 1.65, "Mathematics": 1.50, "Medicine": 1.99, "Law": 1.65, "Arts": 0.85, "Education": 0.80, "Social Sciences": 0.90, "Management": 1.45},
                    "district_bonus": {"Colombo": 0.1, "Gampaha": 0.05},
                    "location": "Colombo",
                    "rankings": {"national": 1, "international": 1001},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital", "Law Library"],
                    "specialties": ["Computer Science", "Business Administration", "Medicine", "Law"]
                },
                "University of Peradeniya": {
                    "degrees": ["Engineering", "IT", "Bio Science", "Mathematics", "Medicine", "Dental", "Veterinary Science", "Agriculture", "Arts", "Pharmacy", "Nursing", "Physical Science"],
                    "z_score_requirements": {"Engineering": 1.50, "IT": 1.40, "Bio Science": 1.55, "Mathematics": 1.45, "Medicine": 1.95, "Dental": 1.85, "Veterinary Science": 1.60, "Agriculture": 1.30, "Arts": 0.90, "Pharmacy": 1.55, "Nursing": 1.35, "Physical Science": 1.30},
                    "district_bonus": {"Kandy": 0.1, "Matale": 0.05},
                    "location": "Kandy",
                    "rankings": {"national": 2, "international": 1200},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital", "Dental Hospital", "Veterinary Hospital"],
                    "specialties": ["Engineering", "Agriculture", "Medicine", "Veterinary Science"]
                },
                "University of Moratuwa": {
                    "degrees": ["Engineering", "IT", "Computer Science", "Architecture", "Quantity Surveying"],
                    "z_score_requirements": {"Engineering": 1.55, "IT": 1.50, "Computer Science": 1.55, "Architecture": 1.40, "Quantity Surveying": 1.35},
                    "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
                    "location": "Moratuwa",
                    "rankings": {"national": 3, "international": 800},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Engineering Workshops"],
                    "specialties": ["Engineering", "Architecture", "IT", "Quantity Surveying"]
                },
                "University of Sri Jayewardenepura": {
                    "degrees": ["Business", "IT", "Bio Science", "Mathematics", "Management", "Accounting", "Finance", "Nursing"],
                    "z_score_requirements": {"Business": 1.30, "IT": 1.35, "Bio Science": 1.50, "Mathematics": 1.35, "Management": 1.40, "Accounting": 1.35, "Finance": 1.30, "Nursing": 1.35},
                    "district_bonus": {"Colombo": 0.05},
                    "location": "Nugegoda",
                    "rankings": {"national": 4, "international": 1500},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Business Center"],
                    "specialties": ["Business Management", "Accounting", "Applied Sciences"]
                },
                "University of Kelaniya": {
                    "degrees": ["Business", "Bio Science", "Mathematics", "Arts", "Medicine", "Social Sciences", "Education"],
                    "z_score_requirements": {"Business": 1.25, "Bio Science": 1.45, "Mathematics": 1.30, "Arts": 0.80, "Medicine": 1.90, "Social Sciences": 0.85, "Education": 0.75},
                    "district_bonus": {"Gampaha": 0.1, "Colombo": 0.05},
                    "location": "Kelaniya",
                    "rankings": {"national": 5, "international": 1800},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
                    "specialties": ["Commerce", "Science", "Humanities", "Medicine"]
                },
                "University of Jaffna": {
                    "degrees": ["IT", "Engineering", "Business", "Bio Science", "Arts", "Medicine", "Agriculture", "Social Sciences"],
                    "z_score_requirements": {"IT": 1.15, "Engineering": 1.25, "Business": 1.10, "Bio Science": 1.35, "Arts": 0.70, "Medicine": 1.80, "Agriculture": 1.20, "Social Sciences": 0.70},
                    "district_bonus": {"Jaffna": 0.15, "Mannar": 0.1, "Vavuniya": 0.05},
                    "location": "Jaffna",
                    "rankings": {"national": 6, "international": 2000},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
                    "specialties": ["Engineering", "Agriculture", "Medicine"]
                },
                "Ruhuna University": {
                    "degrees": ["Engineering", "IT", "Business", "Bio Science", "Medicine", "Agriculture", "Pharmacy"],
                    "z_score_requirements": {"Engineering": 1.30, "IT": 1.20, "Business": 1.15, "Bio Science": 1.45, "Medicine": 1.85, "Agriculture": 1.25, "Pharmacy": 1.40},
                    "district_bonus": {"Matara": 0.1, "Galle": 0.05, "Hambantota": 0.1},
                    "location": "Matara",
                    "rankings": {"national": 9, "international": 2200},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
                    "specialties": ["Engineering", "Medicine", "Agriculture", "Marine Science"]
                },
                "Rajarata University": {
                    "degrees": ["Business", "Bio Science", "IT", "Agriculture", "Medicine", "Management", "Social Sciences"],
                    "z_score_requirements": {"Business": 0.85, "Bio Science": 1.05, "IT": 0.85, "Agriculture": 1.00, "Medicine": 1.75, "Management": 0.90, "Social Sciences": 0.70},
                    "district_bonus": {"Anuradhapura": 0.1, "Polonnaruwa": 0.1},
                    "location": "Anuradhapura",
                    "rankings": {"national": 13, "international": 3800},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Faculty"],
                    "specialties": ["Agriculture", "Business Studies", "Medicine"]
                },
                "University of Visual and Performing Arts": {
                    "degrees": ["Fine Arts"],
                    "z_score_requirements": {"Fine Arts": 1.0},
                    "district_bonus": {"Colombo": 0.05},
                    "location": "Colombo",
                    "rankings": {"national": 14, "international": 4000},
                    "facilities": ["Art Studios", "Theaters", "Music Rooms", "Dance Studios"],
                    "specialties": ["Visual Arts", "Performing Arts", "Design"]
                },
                "General Sir John Kotelawala Defence University": {
                    "degrees": ["Engineering", "Medicine", "IT", "Business", "Law", "Management", "Nursing"],
                    "z_score_requirements": {"Engineering": 1.35, "Medicine": 1.80, "IT": 1.25, "Business": 1.15, "Law": 1.50, "Management": 1.20, "Nursing": 1.30},
                    "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
                    "location": "Kandana",
                    "rankings": {"national": 18, "international": 4300},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Medical Center"],
                    "specialties": ["Defense Studies", "Engineering", "Medicine", "Management"]
                }
            },
            "private": {
                "SLIIT": {
                    "degrees": ["IT", "Computer Science", "Business", "Engineering", "Architecture", "Management"],
                    "z_score_requirements": {"IT": 0.0, "Computer Science": 0.0, "Business": 0.0, "Engineering": 0.0, "Architecture": 0.0, "Management": 0.0},
                    "tuition_fee_range": {"IT": "500,000-800,000 LKR/year", "Business": "400,000-700,000 LKR/year", "Engineering": "600,000-900,000 LKR/year"},
                    "location": "Malabe",
                    "rankings": {"national": 1, "international": 4000},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Industry Partnerships"],
                    "specialties": ["Information Technology", "Business Administration", "Engineering"],
                    "accreditation": ["UGC", "IET", "BCS"]
                },
                "NSBM": {
                    "degrees": ["Business", "IT", "Computer Science", "Engineering", "Management", "Law"],
                    "z_score_requirements": {"Business": 0.0, "IT": 0.0, "Computer Science": 0.0, "Engineering": 0.0, "Management": 0.0, "Law": 0.0},
                    "tuition_fee_range": {"Business": "500,000-800,000 LKR/year", "IT": "600,000-900,000 LKR/year", "Engineering": "700,000-1,000,000 LKR/year"},
                    "location": "Homagama",
                    "rankings": {"national": 4, "international": 5200},
                    "facilities": ["Library", "Labs", "Sports", "Hostels", "Modern Campus"],
                    "specialties": ["Management", "Computing", "Engineering"],
                    "accreditation": ["UGC", "Plymouth University UK"]
                },
                "CINEC": {
                    "degrees": ["Engineering", "IT", "Business", "Quantity Surveying"],
                    "z_score_requirements": {"Engineering": 0.0, "IT": 0.0, "Business": 0.0, "Quantity Surveying": 0.0},
                    "tuition_fee_range": {"Engineering": "700,000-1,200,000 LKR/year", "IT": "600,000-900,000 LKR/year", "Business": "500,000-800,000 LKR/year"},
                    "location": "Malabe",
                    "rankings": {"national": 2, "international": 4500},
                    "facilities": ["Library", "Labs", "Sports", "Maritime Training"],
                    "specialties": ["Maritime Studies", "Engineering", "IT"],
                    "accreditation": ["UGC", "IMarEST"]
                },
                "APIIT": {
                    "degrees": ["Business", "IT", "Computer Science", "Law", "Management"],
                    "z_score_requirements": {"Business": 0.0, "IT": 0.0, "Computer Science": 0.0, "Law": 0.0, "Management": 0.0},
                    "tuition_fee_range": {"Business": "800,000-1,200,000 LKR/year", "IT": "900,000-1,300,000 LKR/year", "Law": "700,000-1,100,000 LKR/year"},
                    "location": "Colombo",
                    "rankings": {"national": 8, "international": 4800},
                    "facilities": ["Library", "Labs", "Sports", "Hostels"],
                    "specialties": ["Business Administration", "Information Technology", "Law"],
                    "accreditation": ["UGC", "UK University Partnerships"]
                }
            }
        }
        return UNIVERSITY_DATABASE

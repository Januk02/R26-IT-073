"""
Generate a balanced, realistic training dataset for the FutureDream Degree Advisor.

Complete Sri Lankan A/L → University degree mapping with:
1. All 6 A/L streams (Physical Science, Biological Science, Commerce, Arts, Engineering Technology, Bio Systems Technology)
2. 18 realistic government university degree programs
3. 30 dream jobs matching all frontend career cards
4. 8 personality traits matching frontend (adaptability, attention_to_detail instead of risk_taking, business_acumen)
5. 7 lifestyle factors matching frontend (no travel_tolerance, no social_preference)
6. Suburban added as valid location
7. Personality & lifestyle correlated to degree/career for realistic predictions

Sources:
- UGC Sri Lanka Handbook (university admission criteria)
- Department of Examinations (stream-degree eligibility)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import json

np.random.seed(42)

# ============================================================
# ALL 6 SRI LANKAN A/L STREAMS → ELIGIBLE DEGREE PROGRAMS
# Source: UGC Sri Lanka, Department of Examinations
# ============================================================

STREAM_DEGREE_MAP = {
    "Biological Science": {
        "degrees": ["Medicine", "Dental", "Nursing", "Pharmacy", "Bio Science", "Agriculture", "Veterinary Science"],
        "weights": [0.18, 0.06, 0.12, 0.08, 0.28, 0.20, 0.08],
    },
    "Physical Science": {
        "degrees": ["Engineering", "IT", "Computer Science", "Mathematics", "Physical Science", "Architecture", "Quantity Surveying"],
        "weights": [0.25, 0.20, 0.15, 0.12, 0.12, 0.08, 0.08],
    },
    "Commerce": {
        "degrees": ["Business", "Management", "Accounting", "Finance"],
        "weights": [0.30, 0.25, 0.25, 0.20],
    },
    "Arts": {
        "degrees": ["Arts", "Law", "Education", "Social Sciences", "Fine Arts"],
        "weights": [0.30, 0.15, 0.25, 0.20, 0.10],
    },
    "Engineering Technology": {
        "degrees": ["IT", "Engineering", "Computer Science", "Quantity Surveying"],
        "weights": [0.35, 0.30, 0.20, 0.15],
    },
    "Bio Systems Technology": {
        "degrees": ["Bio Science", "Agriculture", "IT"],
        "weights": [0.40, 0.35, 0.25],
    },
}

# ============================================================
# DEGREE → DREAM JOB MAPPING (covers all 30 frontend dream jobs)
# ============================================================

DEGREE_DREAM_JOBS = {
    "Medicine": {
        "jobs": ["Doctor", "Psychologist"],
        "weights": [0.80, 0.20],
    },
    "Dental": {
        "jobs": ["Dentist"],
        "weights": [1.0],
    },
    "Nursing": {
        "jobs": ["Nurse"],
        "weights": [1.0],
    },
    "Pharmacy": {
        "jobs": ["Pharmacist"],
        "weights": [1.0],
    },
    "Bio Science": {
        "jobs": ["Agricultural Scientist", "Environmental Scientist", "Biomedical Engineer"],
        "weights": [0.35, 0.35, 0.30],
    },
    "Agriculture": {
        "jobs": ["Agricultural Scientist", "Environmental Scientist"],
        "weights": [0.65, 0.35],
    },
    "Veterinary Science": {
        "jobs": ["Veterinarian"],
        "weights": [1.0],
    },
    "Engineering": {
        "jobs": ["Civil Engineer", "Mechanical Engineer", "Biomedical Engineer"],
        "weights": [0.45, 0.35, 0.20],
    },
    "IT": {
        "jobs": ["Software Engineer", "Web Developer", "Cybersecurity Analyst", "Data Scientist"],
        "weights": [0.35, 0.25, 0.20, 0.20],
    },
    "Computer Science": {
        "jobs": ["Software Engineer", "Data Scientist", "Cybersecurity Analyst", "Web Developer"],
        "weights": [0.35, 0.25, 0.25, 0.15],
    },
    "Mathematics": {
        "jobs": ["Data Scientist", "Financial Analyst"],
        "weights": [0.55, 0.45],
    },
    "Physical Science": {
        "jobs": ["Environmental Scientist", "Pilot"],
        "weights": [0.65, 0.35],
    },
    "Architecture": {
        "jobs": ["Architect"],
        "weights": [1.0],
    },
    "Quantity Surveying": {
        "jobs": ["Civil Engineer", "Architect"],
        "weights": [0.60, 0.40],
    },
    "Business": {
        "jobs": ["Accountant", "Entrepreneur", "Marketing Manager", "Human Resources Manager"],
        "weights": [0.30, 0.25, 0.25, 0.20],
    },
    "Management": {
        "jobs": ["Marketing Manager", "Entrepreneur", "Human Resources Manager"],
        "weights": [0.40, 0.30, 0.30],
    },
    "Accounting": {
        "jobs": ["Accountant", "Financial Analyst"],
        "weights": [0.65, 0.35],
    },
    "Finance": {
        "jobs": ["Financial Analyst", "Accountant", "Entrepreneur"],
        "weights": [0.45, 0.30, 0.25],
    },
    "Arts": {
        "jobs": ["Teacher", "Journalist", "Social Worker"],
        "weights": [0.45, 0.30, 0.25],
    },
    "Law": {
        "jobs": ["Lawyer", "Police Officer"],
        "weights": [0.80, 0.20],
    },
    "Education": {
        "jobs": ["Teacher"],
        "weights": [1.0],
    },
    "Social Sciences": {
        "jobs": ["Social Worker", "Psychologist", "Police Officer"],
        "weights": [0.45, 0.30, 0.25],
    },
    "Fine Arts": {
        "jobs": ["Graphic Designer", "Chef"],
        "weights": [0.70, 0.30],
    },
}

# ============================================================
# Z-SCORE RANGES PER DEGREE (realistic Sri Lankan cutoffs)
# Source: UGC annual cutoff marks
# ============================================================

DEGREE_ZSCORE_RANGE = {
    "Medicine":             (1.85, 2.80),
    "Dental":               (1.80, 2.60),
    "Nursing":              (1.30, 2.00),
    "Pharmacy":             (1.50, 2.20),
    "Bio Science":          (1.10, 2.00),
    "Agriculture":          (0.90, 1.80),
    "Veterinary Science":   (1.50, 2.30),
    "Engineering":          (1.40, 2.50),
    "IT":                   (1.00, 2.00),
    "Computer Science":     (1.15, 2.10),
    "Mathematics":          (1.10, 2.00),
    "Physical Science":     (1.10, 1.90),
    "Architecture":         (1.30, 2.10),
    "Quantity Surveying":   (1.20, 2.00),
    "Business":             (0.80, 1.80),
    "Management":           (0.85, 1.75),
    "Accounting":           (0.90, 1.85),
    "Finance":              (0.85, 1.80),
    "Arts":                 (0.50, 1.50),
    "Law":                  (1.40, 2.20),
    "Education":            (0.55, 1.40),
    "Social Sciences":      (0.60, 1.50),
    "Fine Arts":            (0.50, 1.30),
}

# ============================================================
# PERSONALITY PROFILES PER DEGREE (8 traits matching frontend)
# Columns: analytical_skill, creativity, leadership,
#           communication_skill, problem_solving, teamwork,
#           adaptability, attention_to_detail
# Scale: 1-5. Ranges have overlap so model uses stream+job as primary signal.
# ============================================================

DEGREE_PERSONALITY = {
    "Medicine": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (2, 5),
        "communication_skill": (3, 5), "problem_solving": (3, 5), "teamwork": (3, 5),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Dental": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (2, 4),
        "communication_skill": (3, 5), "problem_solving": (3, 5), "teamwork": (2, 5),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Nursing": {
        "analytical_skill": (2, 4), "creativity": (2, 4), "leadership": (2, 4),
        "communication_skill": (3, 5), "problem_solving": (2, 5), "teamwork": (4, 5),
        "adaptability": (3, 5), "attention_to_detail": (3, 5),
    },
    "Pharmacy": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (1, 4),
        "communication_skill": (3, 5), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Bio Science": {
        "analytical_skill": (3, 5), "creativity": (2, 5), "leadership": (1, 4),
        "communication_skill": (2, 4), "problem_solving": (3, 5), "teamwork": (2, 5),
        "adaptability": (2, 4), "attention_to_detail": (3, 5),
    },
    "Agriculture": {
        "analytical_skill": (2, 5), "creativity": (2, 4), "leadership": (2, 4),
        "communication_skill": (2, 4), "problem_solving": (2, 5), "teamwork": (3, 5),
        "adaptability": (3, 5), "attention_to_detail": (2, 4),
    },
    "Veterinary Science": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (2, 4),
        "communication_skill": (3, 5), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (3, 5), "attention_to_detail": (4, 5),
    },
    "Engineering": {
        "analytical_skill": (3, 5), "creativity": (2, 5), "leadership": (2, 4),
        "communication_skill": (2, 4), "problem_solving": (4, 5), "teamwork": (2, 5),
        "adaptability": (2, 4), "attention_to_detail": (3, 5),
    },
    "IT": {
        "analytical_skill": (3, 5), "creativity": (2, 5), "leadership": (1, 4),
        "communication_skill": (1, 4), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (3, 5), "attention_to_detail": (3, 5),
    },
    "Computer Science": {
        "analytical_skill": (4, 5), "creativity": (2, 5), "leadership": (1, 4),
        "communication_skill": (1, 4), "problem_solving": (4, 5), "teamwork": (2, 4),
        "adaptability": (3, 5), "attention_to_detail": (3, 5),
    },
    "Mathematics": {
        "analytical_skill": (4, 5), "creativity": (1, 4), "leadership": (1, 4),
        "communication_skill": (1, 4), "problem_solving": (4, 5), "teamwork": (1, 4),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Physical Science": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (1, 4),
        "communication_skill": (1, 4), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (2, 4), "attention_to_detail": (3, 5),
    },
    "Architecture": {
        "analytical_skill": (3, 5), "creativity": (4, 5), "leadership": (2, 4),
        "communication_skill": (2, 5), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Quantity Surveying": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (2, 4),
        "communication_skill": (2, 4), "problem_solving": (3, 5), "teamwork": (3, 5),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Business": {
        "analytical_skill": (2, 5), "creativity": (2, 4), "leadership": (2, 5),
        "communication_skill": (3, 5), "problem_solving": (2, 5), "teamwork": (3, 5),
        "adaptability": (3, 5), "attention_to_detail": (2, 4),
    },
    "Management": {
        "analytical_skill": (2, 5), "creativity": (2, 4), "leadership": (3, 5),
        "communication_skill": (3, 5), "problem_solving": (2, 5), "teamwork": (3, 5),
        "adaptability": (3, 5), "attention_to_detail": (2, 4),
    },
    "Accounting": {
        "analytical_skill": (3, 5), "creativity": (1, 3), "leadership": (1, 4),
        "communication_skill": (2, 4), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (1, 3), "attention_to_detail": (4, 5),
    },
    "Finance": {
        "analytical_skill": (3, 5), "creativity": (1, 4), "leadership": (2, 4),
        "communication_skill": (2, 5), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Arts": {
        "analytical_skill": (1, 4), "creativity": (3, 5), "leadership": (1, 4),
        "communication_skill": (3, 5), "problem_solving": (1, 4), "teamwork": (2, 5),
        "adaptability": (3, 5), "attention_to_detail": (1, 4),
    },
    "Law": {
        "analytical_skill": (3, 5), "creativity": (2, 4), "leadership": (3, 5),
        "communication_skill": (4, 5), "problem_solving": (3, 5), "teamwork": (2, 4),
        "adaptability": (2, 4), "attention_to_detail": (4, 5),
    },
    "Education": {
        "analytical_skill": (2, 4), "creativity": (3, 5), "leadership": (3, 5),
        "communication_skill": (4, 5), "problem_solving": (2, 4), "teamwork": (3, 5),
        "adaptability": (3, 5), "attention_to_detail": (2, 4),
    },
    "Social Sciences": {
        "analytical_skill": (2, 4), "creativity": (2, 5), "leadership": (2, 4),
        "communication_skill": (3, 5), "problem_solving": (2, 4), "teamwork": (3, 5),
        "adaptability": (3, 5), "attention_to_detail": (2, 4),
    },
    "Fine Arts": {
        "analytical_skill": (1, 3), "creativity": (4, 5), "leadership": (1, 3),
        "communication_skill": (2, 5), "problem_solving": (1, 4), "teamwork": (2, 4),
        "adaptability": (3, 5), "attention_to_detail": (4, 5),
    },
}

# ============================================================
# LIFESTYLE PREFERENCES PER DEGREE
# 7 factors matching frontend:
#   preferred_location, stress_tolerance,
#   work_life_balance_priority, family_attachment_level,
#   financial_stability_need, career_sustainability_priority,
#   social_impact_priority
# + innovation_interest (derived from creativity)
# ============================================================

DEGREE_LIFESTYLE = {
    "Medicine": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["High", "High", "Medium"], None),
        "work_life_balance_priority": (1, 3),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Dental": {
        "preferred_location": (["Urban", "Urban", "Suburban"], None),
        "stress_tolerance": (["Medium", "High", "Medium"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (3, 5),
    },
    "Nursing": {
        "preferred_location": (["Urban", "Suburban", "Any", "Rural"], None),
        "stress_tolerance": (["Medium", "High", "Medium"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 4),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (4, 5),
    },
    "Pharmacy": {
        "preferred_location": (["Urban", "Suburban", "Urban"], None),
        "stress_tolerance": (["Medium", "Medium", "Low"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (3, 5),
    },
    "Bio Science": {
        "preferred_location": (["Urban", "Any", "Rural", "Suburban"], None),
        "stress_tolerance": (["Medium", "Medium", "Low"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 5),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (3, 5),
    },
    "Agriculture": {
        "preferred_location": (["Rural", "Any", "Suburban", "Rural"], None),
        "stress_tolerance": (["Low", "Medium", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (4, 5),
        "financial_stability_need": (2, 4),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Veterinary Science": {
        "preferred_location": (["Any", "Rural", "Suburban", "Urban"], None),
        "stress_tolerance": (["Medium", "Medium", "High"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 5),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Engineering": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "High", "Medium"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (3, 5),
    },
    "IT": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "Medium", "High"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (3, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (2, 4),
    },
    "Computer Science": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "Medium", "High"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (2, 4),
    },
    "Mathematics": {
        "preferred_location": (["Urban", "Any", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "Low", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 5),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (2, 4),
    },
    "Physical Science": {
        "preferred_location": (["Urban", "Any", "Any", "Suburban"], None),
        "stress_tolerance": (["Medium", "Medium", "Low"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (3, 4),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (3, 5),
    },
    "Architecture": {
        "preferred_location": (["Urban", "Urban", "Suburban"], None),
        "stress_tolerance": (["Medium", "Medium", "High"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (4, 5),
        "social_impact_priority": (3, 5),
    },
    "Quantity Surveying": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "Medium", "High"], None),
        "work_life_balance_priority": (3, 4),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (3, 4),
    },
    "Business": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "Medium", "Low"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (2, 4),
    },
    "Management": {
        "preferred_location": (["Urban", "Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Medium", "High", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (3, 5),
    },
    "Accounting": {
        "preferred_location": (["Urban", "Urban", "Suburban"], None),
        "stress_tolerance": (["Medium", "Low", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (1, 3),
        "social_impact_priority": (1, 3),
    },
    "Finance": {
        "preferred_location": (["Urban", "Urban", "Suburban"], None),
        "stress_tolerance": (["Medium", "High", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (2, 4),
    },
    "Arts": {
        "preferred_location": (["Any", "Suburban", "Rural", "Urban"], None),
        "stress_tolerance": (["Low", "Medium", "Low"], None),
        "work_life_balance_priority": (4, 5),
        "family_attachment_level": (4, 5),
        "financial_stability_need": (2, 4),
        "career_sustainability_priority": (2, 4),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Law": {
        "preferred_location": (["Urban", "Urban", "Suburban"], None),
        "stress_tolerance": (["High", "High", "Medium"], None),
        "work_life_balance_priority": (2, 4),
        "family_attachment_level": (2, 4),
        "financial_stability_need": (4, 5),
        "career_sustainability_priority": (4, 5),
        "innovation_interest": (2, 4),
        "social_impact_priority": (4, 5),
    },
    "Education": {
        "preferred_location": (["Any", "Suburban", "Rural", "Urban"], None),
        "stress_tolerance": (["Low", "Medium", "Low"], None),
        "work_life_balance_priority": (4, 5),
        "family_attachment_level": (4, 5),
        "financial_stability_need": (2, 4),
        "career_sustainability_priority": (3, 5),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Social Sciences": {
        "preferred_location": (["Any", "Urban", "Suburban", "Rural"], None),
        "stress_tolerance": (["Medium", "Low", "Medium"], None),
        "work_life_balance_priority": (3, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (2, 4),
        "career_sustainability_priority": (3, 4),
        "innovation_interest": (3, 5),
        "social_impact_priority": (4, 5),
    },
    "Fine Arts": {
        "preferred_location": (["Urban", "Suburban", "Any"], None),
        "stress_tolerance": (["Low", "Low", "Medium"], None),
        "work_life_balance_priority": (4, 5),
        "family_attachment_level": (3, 5),
        "financial_stability_need": (2, 4),
        "career_sustainability_priority": (2, 4),
        "innovation_interest": (4, 5),
        "social_impact_priority": (3, 5),
    },
}

# ============================================================
# VALID DEGREES FOR EACH STREAM (hard constraint at inference)
# ============================================================

VALID_DEGREES_FOR_STREAM = {
    "Biological Science": ["Medicine", "Dental", "Nursing", "Pharmacy", "Bio Science", "Agriculture", "Veterinary Science"],
    "Physical Science": ["Engineering", "IT", "Computer Science", "Mathematics", "Physical Science", "Architecture", "Quantity Surveying"],
    "Commerce": ["Business", "Management", "Accounting", "Finance"],
    "Arts": ["Arts", "Law", "Education", "Social Sciences", "Fine Arts"],
    "Engineering Technology": ["IT", "Engineering", "Computer Science", "Quantity Surveying"],
    "Bio Systems Technology": ["Bio Science", "Agriculture", "IT"],
}

DISTRICTS = [
    "Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Jaffna", "Kurunegala",
    "Anuradhapura", "Badulla", "Batticaloa", "Hambantota", "Kalutara",
    "Kegalle", "Kilinochchi", "Mannar", "Monaragala", "Mullaitivu",
    "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee",
    "Vavuniya", "Ampara"
]


def generate_student(degree, student_id):
    """Generate one realistic student record for the given degree."""

    # Pick a stream that can lead to this degree
    valid_streams = [s for s, info in STREAM_DEGREE_MAP.items() if degree in info["degrees"]]
    stream = np.random.choice(valid_streams)

    # Z-score from realistic range
    z_min, z_max = DEGREE_ZSCORE_RANGE[degree]
    z_score = round(np.random.uniform(z_min, z_max), 2)

    # Dream job correlated to degree
    job_info = DEGREE_DREAM_JOBS[degree]
    dream_job = np.random.choice(job_info["jobs"], p=job_info["weights"])

    # District
    district = np.random.choice(DISTRICTS)

    # Personality (8 traits, correlated to degree)
    personality = {}
    for trait, (low, high) in DEGREE_PERSONALITY[degree].items():
        personality[trait] = np.random.randint(low, high + 1)

    # Lifestyle (7 factors + innovation_interest, correlated to degree)
    lifestyle_cfg = DEGREE_LIFESTYLE[degree]
    lifestyle = {}
    for feat, val in lifestyle_cfg.items():
        if isinstance(val[0], list):
            lifestyle[feat] = np.random.choice(val[0])
        else:
            lifestyle[feat] = np.random.randint(val[0], val[1] + 1)

    return {
        "student_id": student_id,
        "stream": stream,
        "z_score": z_score,
        "district": district,
        "dream_job": dream_job,
        "degree_program": degree,
        **personality,
        **lifestyle,
    }


def generate_dataset(samples_per_class=400):
    """Generate a perfectly balanced dataset."""
    degrees = list(DEGREE_ZSCORE_RANGE.keys())
    rows = []
    sid = 1

    for degree in degrees:
        for _ in range(samples_per_class):
            rows.append(generate_student(degree, sid))
            sid += 1

    df = pd.DataFrame(rows)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df


def train_model(df):
    """Train Random Forest on the balanced dataset."""

    # Features matching what frontend sends (via apiService.js)
    feature_cols = [
        "stream", "z_score", "district", "dream_job",
        # 8 personality traits
        "analytical_skill", "creativity", "leadership",
        "communication_skill", "problem_solving", "teamwork",
        "adaptability", "attention_to_detail",
        # 7 lifestyle + innovation
        "preferred_location", "stress_tolerance",
        "work_life_balance_priority", "family_attachment_level",
        "financial_stability_need", "career_sustainability_priority",
        "innovation_interest", "social_impact_priority",
    ]
    target_col = "degree_program"

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Encode categoricals
    encoders = {}
    categorical_cols = ["stream", "district", "dream_job", "preferred_location", "stress_tolerance"]

    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le

    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Train
    model = RandomForestClassifier(
        n_estimators=400,
        max_depth=25,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n{'='*60}")
    print(f"MODEL ACCURACY: {accuracy:.1%}")
    print(f"{'='*60}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    classes = le_target.classes_
    print(f"{'':>20}", end="")
    for c in classes:
        print(f"{c:>12}", end="")
    print()
    for i, row in enumerate(cm):
        print(f"{classes[i]:>20}", end="")
        for val in row:
            print(f"{val:>12}", end="")
        print()

    # Feature importances
    print(f"\nTop 10 Feature Importances:")
    importances = model.feature_importances_
    features = list(X.columns)
    sorted_idx = np.argsort(importances)[::-1]
    for i in sorted_idx[:10]:
        bar = "█" * int(importances[i] * 100)
        print(f"  {features[i]:<35} {importances[i]:.4f}  {bar}")

    return model, encoders, le_target, accuracy, X.columns.tolist()


def save_model(model, encoders, le_target, accuracy, features, n_train, n_test, n_classes):
    """Save model files."""
    joblib.dump(model, "logical_degree_model.pkl")
    joblib.dump(encoders, "logical_encoders.pkl")
    joblib.dump(le_target, "logical_target_encoder.pkl")

    model_info = {
        "accuracy": round(accuracy, 4),
        "n_train": n_train,
        "n_test": n_test,
        "n_features": len(features),
        "n_classes": n_classes,
        "classes": list(le_target.classes_),
        "features": features,
        "top_features": [
            {"feature": features[i], "importance": round(float(model.feature_importances_[i]), 6)}
            for i in np.argsort(model.feature_importances_)[::-1][:10]
        ],
        "dataset": "balanced_synthetic_v3_complete_srilanka",
        "notes": "Complete Sri Lankan degree system: 23 degrees, 30 dream jobs, 6 streams, 8 personality traits, 7 lifestyle factors, Suburban location support"
    }

    with open("model_info.json", "w") as f:
        json.dump(model_info, f, indent=2)

    print(f"\n✅ Model saved!")
    print(f"   logical_degree_model.pkl")
    print(f"   logical_encoders.pkl")
    print(f"   logical_target_encoder.pkl")
    print(f"   model_info.json")


def apply_stream_mask(proba, classes, stream):
    """Mask out impossible degree predictions based on stream."""
    valid = VALID_DEGREES_FOR_STREAM.get(stream, list(classes))
    masked = proba.copy()
    for i, cls in enumerate(classes):
        if cls not in valid:
            masked[i] = 0.0
    total = masked.sum()
    if total > 0:
        masked = masked / total
    return masked


def validate_model(model, encoders, le_target):
    """Run realistic validation tests with stream masking."""

    test_cases = [
        # (stream, dream_job, z_score, district, acceptable_degrees)
        # Physical Science
        ("Physical Science", "Software Engineer", 1.85, "Colombo", ["IT", "Computer Science", "Engineering"]),
        ("Physical Science", "Civil Engineer", 1.90, "Kandy", ["Engineering", "Quantity Surveying"]),
        ("Physical Science", "Data Scientist", 1.60, "Gampaha", ["IT", "Computer Science", "Mathematics"]),
        ("Physical Science", "Architect", 1.70, "Colombo", ["Architecture", "Engineering"]),
        # Biological Science
        ("Biological Science", "Doctor", 2.50, "Kandy", ["Medicine"]),
        ("Biological Science", "Doctor", 1.50, "Colombo", ["Bio Science", "Nursing"]),
        ("Biological Science", "Nurse", 1.60, "Galle", ["Nursing", "Medicine"]),
        ("Biological Science", "Dentist", 2.20, "Colombo", ["Dental", "Medicine"]),
        ("Biological Science", "Pharmacist", 1.80, "Matara", ["Pharmacy", "Bio Science"]),
        ("Biological Science", "Veterinarian", 1.90, "Kandy", ["Veterinary Science"]),
        ("Biological Science", "Agricultural Scientist", 1.30, "Anuradhapura", ["Agriculture", "Bio Science"]),
        # Commerce
        ("Commerce", "Accountant", 1.40, "Colombo", ["Accounting", "Business", "Finance"]),
        ("Commerce", "Entrepreneur", 1.20, "Gampaha", ["Business", "Management"]),
        ("Commerce", "Financial Analyst", 1.50, "Colombo", ["Finance", "Accounting", "Business"]),
        ("Commerce", "Marketing Manager", 1.30, "Kurunegala", ["Management", "Business"]),
        # Arts
        ("Arts", "Lawyer", 1.80, "Colombo", ["Law"]),
        ("Arts", "Teacher", 1.00, "Matara", ["Education", "Arts"]),
        ("Arts", "Social Worker", 0.90, "Batticaloa", ["Social Sciences", "Arts"]),
        ("Arts", "Journalist", 1.10, "Colombo", ["Arts", "Social Sciences"]),
        ("Arts", "Graphic Designer", 0.80, "Kandy", ["Fine Arts", "Arts"]),
        # Engineering Technology
        ("Engineering Technology", "Software Engineer", 1.60, "Colombo", ["IT", "Computer Science", "Engineering"]),
        ("Engineering Technology", "Web Developer", 1.30, "Gampaha", ["IT", "Computer Science"]),
        # Bio Systems Technology
        ("Bio Systems Technology", "Agricultural Scientist", 1.40, "Anuradhapura", ["Agriculture", "Bio Science"]),
        ("Bio Systems Technology", "Software Engineer", 1.30, "Colombo", ["IT"]),
    ]

    print(f"\n{'='*110}")
    print(f"VALIDATION: Real-world test cases (with stream masking)")
    print(f"{'='*110}")

    correct = 0
    for stream, job, z, dist, expected in test_cases:
        row = {
            "stream": stream, "z_score": z, "district": dist, "dream_job": job,
            "analytical_skill": 4, "creativity": 3, "leadership": 3,
            "communication_skill": 3, "problem_solving": 4, "teamwork": 3,
            "adaptability": 3, "attention_to_detail": 3,
            "preferred_location": "Urban", "stress_tolerance": "Medium",
            "work_life_balance_priority": 3, "family_attachment_level": 3,
            "financial_stability_need": 3, "career_sustainability_priority": 4,
            "innovation_interest": 3, "social_impact_priority": 3,
        }

        df = pd.DataFrame([row])
        for col, enc in encoders.items():
            if col in df.columns:
                try:
                    df[col] = enc.transform(df[col].astype(str))
                except ValueError:
                    df[col] = 0

        if hasattr(model, "feature_names_in_"):
            df = df[model.feature_names_in_]

        raw_proba = model.predict_proba(df)[0]
        classes = le_target.classes_
        masked_proba = apply_stream_mask(raw_proba, classes, stream)

        pred_idx = np.argmax(masked_proba)
        pred = classes[pred_idx]
        conf = masked_proba[pred_idx]

        ok = pred in expected
        if ok:
            correct += 1

        status = "✅" if ok else "❌"
        print(f"  {stream:<25} {job:<25} Z={z:<5} → {pred:<20} {conf:.1%}  {status}")

    print(f"\n  Result: {correct}/{len(test_cases)} = {correct/len(test_cases):.1%}")
    return correct, len(test_cases)


if __name__ == "__main__":
    n_degrees = len(DEGREE_ZSCORE_RANGE)
    samples = 400
    print(f"🔧 Generating balanced training dataset...")
    print(f"   {samples} samples × {n_degrees} degree classes = {samples * n_degrees:,} total")
    print()

    df = generate_dataset(samples_per_class=samples)

    print(f"Dataset shape: {df.shape}")
    print(f"\n📊 Degree distribution (should be perfectly balanced):")
    print(df["degree_program"].value_counts())
    print(f"\n📊 Stream distribution:")
    print(df["stream"].value_counts())
    print(f"\n📊 Dream job distribution:")
    print(df["dream_job"].value_counts())
    print(f"\n📊 Stream → Degree crosstab:")
    print(pd.crosstab(df["stream"], df["degree_program"]))

    print("\n🚀 Training Random Forest model...")
    model, encoders, le_target, accuracy, features = train_model(df)

    n_train = int(len(df) * 0.8)
    n_test = len(df) - n_train
    save_model(model, encoders, le_target, accuracy, features, n_train, n_test, len(le_target.classes_))

    validate_model(model, encoders, le_target)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
import joblib
import networkx as nx
from scipy.stats import norm
import os

# Initialize FastAPI app
app = FastAPI(
    title="FutureDream Degree Advisor API",
    description="AI-powered backward-chaining degree recommendation system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class StudentProfile(BaseModel):
    district: str
    stream: str
    z_score: float
    dream_job: str
    analytical_skill: int
    creativity: int
    leadership: int
    risk_taking: int
    communication_skill: int
    problem_solving: int
    teamwork: int
    entrepreneural_mindset: int
    business_acumen: int
    preferred_location: str
    travel_tolerance: str
    stress_tolerance: str
    social_preference: str
    work_life_balance_priority: int
    family_attachment_level: int
    financial_stability_need: int
    ol_results: str
    al_predicted: float
    subject_strength: str
    career_sustainability_priority: int
    innovation_interest: int
    social_impact_priority: int

class DegreeRecommendation(BaseModel):
    degree: str
    probability: float
    overall_score: float
    skill_match: Dict[str, float]
    personality_match: Dict[str, float]
    academic_feasibility: Dict[str, float]
    lifestyle_compatibility: Dict[str, float]
    explanation: str
    roadmap: List[str]

class RecommendationResponse(BaseModel):
    dream_job: str
    recommendations: List[DegreeRecommendation]
    best_degree: str
    confidence: float
    counterfactual_guidance: Dict[str, str]

# Load trained model and encoders
try:
    model = joblib.load("enhanced_degree_model.pkl")
    encoders = joblib.load("enhanced_encoders.pkl")
    target_encoder = joblib.load("enhanced_target_encoder.pkl")
    print("✅ Model and encoders loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    encoders = {}
    target_encoder = None

# Enhanced Backward-Chaining Model (from notebook)
class BackwardChainingModel:
    def __init__(self):
        self.career_graph = nx.DiGraph()
        self.skill_requirements = {}
        self.probability_matrix = {}
        self._build_knowledge_base()

    def _build_knowledge_base(self):
        # Comprehensive career knowledge base with probabilities
        self.career_knowledge = {
            "Software Engineer": {
                "required_skills": {"programming": 0.9, "logic": 0.85, "problem_solving": 0.8, "mathematics": 0.7},
                "personality_traits": {"analytical": 0.8, "creativity": 0.6, "risk_taking": 0.5},
                "degree_paths": {"IT": 0.85, "Engineering": 0.4, "Business": 0.2},
                "z_score_threshold": 1.2,
                "future_demand": 0.95,
                "stress_level": 0.6,
                "work_environment": {"office": 0.8, "remote": 0.7}
            },
            "Doctor": {
                "required_skills": {"biology": 0.95, "memory": 0.9, "stress_handling": 0.85, "empathy": 0.8},
                "personality_traits": {"analytical": 0.7, "leadership": 0.6, "risk_taking": 0.3},
                "degree_paths": {"Medicine": 0.95, "Bio Science": 0.3},
                "z_score_threshold": 2.0,
                "future_demand": 0.9,
                "stress_level": 0.9,
                "work_environment": {"hospital": 0.9, "clinic": 0.6}
            },
            "Data Scientist": {
                "required_skills": {"statistics": 0.9, "programming": 0.85, "analysis": 0.8, "mathematics": 0.75},
                "personality_traits": {"analytical": 0.9, "creativity": 0.7, "risk_taking": 0.4},
                "degree_paths": {"IT": 0.8, "Mathematics": 0.6, "Business": 0.3},
                "z_score_threshold": 1.4,
                "future_demand": 0.92,
                "stress_level": 0.5,
                "work_environment": {"office": 0.7, "remote": 0.8}
            },
            "Entrepreneur": {
                "required_skills": {"leadership": 0.9, "creativity": 0.85, "risk_management": 0.8, "communication": 0.75},
                "personality_traits": {"risk_taking": 0.9, "leadership": 0.85, "creativity": 0.8},
                "degree_paths": {"Business": 0.7, "IT": 0.4, "Engineering": 0.3},
                "z_score_threshold": 1.0,
                "future_demand": 0.7,
                "stress_level": 0.8,
                "work_environment": {"office": 0.4, "remote": 0.3, "field": 0.6}
            },
            "Accountant": {
                "required_skills": {"numbers": 0.95, "accuracy": 0.9, "analysis": 0.7, "ethics": 0.8},
                "personality_traits": {"analytical": 0.8, "risk_taking": 0.2, "creativity": 0.3},
                "degree_paths": {"Business": 0.9, "Finance": 0.7},
                "z_score_threshold": 1.1,
                "future_demand": 0.75,
                "stress_level": 0.4,
                "work_environment": {"office": 0.9}
            },
            "Civil Engineer": {
                "required_skills": {"mathematics": 0.9, "design": 0.85, "physics": 0.8, "project_management": 0.75},
                "personality_traits": {"analytical": 0.8, "creativity": 0.7, "leadership": 0.6},
                "degree_paths": {"Engineering": 0.95, "Architecture": 0.4},
                "z_score_threshold": 1.5,
                "future_demand": 0.85,
                "stress_level": 0.6,
                "work_environment": {"office": 0.5, "field": 0.8}
            }
        }

        # Build probabilistic graph
        for career, details in self.career_knowledge.items():
            self.career_graph.add_node(career, **details)
            for degree, prob in details["degree_paths"].items():
                self.career_graph.add_edge(career, degree, probability=prob)

    def backward_chain(self, dream_job, student_profile):
        """Main backward chaining algorithm with probabilistic reasoning"""
        if dream_job not in self.career_knowledge:
            return {"error": "Career not found in knowledge base"}

        career_info = self.career_knowledge[dream_job]
        results = {
            "dream_job": dream_job,
            "degree_recommendations": {},
            "skill_match_scores": {},
            "personality_match": {},
            "academic_feasibility": {},
            "lifestyle_compatibility": {},
            "overall_scores": {}
        }

        # Calculate degree path probabilities
        for degree, base_prob in career_info["degree_paths"].items():
            adjusted_prob = self._calculate_degree_probability(
                degree, base_prob, student_profile, career_info
            )
            results["degree_recommendations"][degree] = adjusted_prob

        # Calculate skill compatibility
        results["skill_match_scores"] = self._calculate_skill_match(career_info, student_profile)

        # Calculate personality compatibility
        results["personality_match"] = self._calculate_personality_match(career_info, student_profile)

        # Calculate academic feasibility
        results["academic_feasibility"] = self._calculate_academic_feasibility(career_info, student_profile)

        # Calculate lifestyle compatibility
        results["lifestyle_compatibility"] = self._calculate_lifestyle_compatibility(career_info, student_profile)

        # Calculate overall scores for each degree
        for degree in results["degree_recommendations"]:
            overall = self._calculate_overall_score(degree, results, career_info)
            results["overall_scores"][degree] = overall

        return results

    def _calculate_degree_probability(self, degree, base_prob, student_profile, career_info):
        """Calculate adjusted probability for degree path"""
        factors = []

        # Z-score factor
        z_factor = min(1.0, student_profile.get("z_score", 0) / career_info["z_score_threshold"])
        factors.append(z_factor)

        # Stream compatibility
        stream = student_profile.get("stream", "")
        if degree == "IT" and stream in ["Physical Science", "Mathematics"]:
            factors.append(0.9)
        elif degree == "Medicine" and stream == "Bio Science":
            factors.append(0.95)
        elif degree == "Engineering" and stream in ["Physical Science", "Mathematics"]:
            factors.append(0.9)
        elif degree == "Business" and stream in ["Commerce", "Arts"]:
            factors.append(0.8)
        else:
            factors.append(0.5)

        # District/university availability factor
        factors.append(0.8)  # Placeholder

        return base_prob * np.mean(factors)

    def _calculate_skill_match(self, career_info, student_profile):
        """Calculate skill compatibility scores"""
        skill_scores = {}
        required_skills = career_info["required_skills"]

        skill_mapping = {
            "analytical_skill": ["programming", "logic", "analysis", "mathematics", "statistics"],
            "creativity": ["creativity", "design", "problem_solving"],
            "leadership": ["leadership", "project_management", "communication"],
            "risk_taking": ["risk_management", "risk_taking"]
        }

        for student_skill, mapped_skills in skill_mapping.items():
            student_value = student_profile.get(student_skill, 3) / 5.0  # Normalize to 0-1

            for required_skill in mapped_skills:
                if required_skill in required_skills:
                    required_level = required_skills[required_skill]
                    match_score = min(1.0, student_value / required_level)
                    skill_scores[required_skill] = match_score

        return skill_scores

    def _calculate_personality_match(self, career_info, student_profile):
        """Calculate personality compatibility"""
        personality_scores = {}
        required_traits = career_info["personality_traits"]

        trait_mapping = {
            "analytical": "analytical_skill",
            "creativity": "creativity",
            "leadership": "leadership",
            "risk_taking": "risk_taking"
        }

        for trait, required_level in required_traits.items():
            if trait in trait_mapping:
                student_value = student_profile.get(trait_mapping[trait], 3) / 5.0
                match_score = min(1.0, student_value / required_level)
                personality_scores[trait] = match_score

        return personality_scores

    def _calculate_academic_feasibility(self, career_info, student_profile):
        """Calculate academic feasibility with district considerations"""
        z_score = student_profile.get("z_score", 0)
        threshold = career_info["z_score_threshold"]

        # District-based adjustments
        district = student_profile.get("district", "")
        district_multipliers = {
            "Colombo": 1.0, "Gampaha": 0.95, "Kandy": 0.9,
            "Galle": 0.85, "Jaffna": 0.8, "Matara": 0.85
        }
        district_factor = district_multipliers.get(district, 0.8)

        feasibility = min(1.0, (z_score * district_factor) / threshold)

        return {
            "z_score_feasibility": feasibility,
            "district_adjustment": district_factor,
            "threshold_gap": max(0, threshold - z_score)
        }

    def _calculate_lifestyle_compatibility(self, career_info, student_profile):
        """Calculate lifestyle and emotional compatibility"""
        compatibility = {}

        # Stress tolerance
        career_stress = career_info["stress_level"]
        student_stress = {"Low": 0.3, "Medium": 0.6, "High": 0.9}.get(
            student_profile.get("stress_tolerance", "Medium"), 0.6
        )
        compatibility["stress_match"] = 1.0 - abs(career_stress - student_stress)

        # Location preference
        preferred_location = student_profile.get("preferred_location", "Any")
        work_envs = career_info["work_environment"]

        if preferred_location == "Urban":
            compatibility["location_match"] = work_envs.get("office", 0.5)
        elif preferred_location == "Rural":
            compatibility["location_match"] = work_envs.get("field", 0.3)
        else:
            compatibility["location_match"] = 0.7

        # Social preference
        social_pref = student_profile.get("social_preference", "Introvert")
        if social_pref == "Extrovert":
            compatibility["social_match"] = 0.8
        else:
            compatibility["social_match"] = 0.6

        # Travel tolerance
        travel_tolerance = student_profile.get("travel_tolerance", "Medium")
        if travel_tolerance == "High":
            compatibility["travel_match"] = 0.9
        elif travel_tolerance == "Medium":
            compatibility["travel_match"] = 0.7
        else:
            compatibility["travel_match"] = 0.5

        return compatibility

    def _calculate_overall_score(self, degree, results, career_info):
        """Calculate overall compatibility score for degree path"""
        weights = {
            "degree_probability": 0.3,
            "skill_match": 0.25,
            "personality_match": 0.2,
            "academic_feasibility": 0.15,
            "lifestyle_compatibility": 0.1
        }

        score = 0

        # Degree probability
        score += results["degree_recommendations"][degree] * weights["degree_probability"]

        # Average skill match
        if results["skill_match_scores"]:
            avg_skill = np.mean(list(results["skill_match_scores"].values()))
            score += avg_skill * weights["skill_match"]

        # Average personality match
        if results["personality_match"]:
            avg_personality = np.mean(list(results["personality_match"].values()))
            score += avg_personality * weights["personality_match"]

        # Academic feasibility
        academic = results["academic_feasibility"]["z_score_feasibility"]
        score += academic * weights["academic_feasibility"]

        # Average lifestyle compatibility
        lifestyle = np.mean(list(results["lifestyle_compatibility"].values()))
        score += lifestyle * weights["lifestyle_compatibility"]

        return min(1.0, score)

# Initialize backward chaining model
backward_model = BackwardChainingModel()

def generate_roadmap(degree: str, dream_job: str) -> List[str]:
    """Generate long-term academic and career roadmap"""
    roadmaps = {
        "IT": [
            "Bachelor of Computer Science (4 years)",
            "Specialize in AI/ML/Software Engineering",
            "Consider Master's in Computer Science (2 years)",
            "Pursue certifications (AWS, Google Cloud)",
            "Career paths: Software Engineer, Data Scientist, AI Researcher"
        ],
        "Medicine": [
            "Bachelor of Medicine & Surgery (5 years)",
            "Internship and residency (2-3 years)",
            "Specialization (Cardiology, Neurology, etc.)",
            "Consider Master's in Public Health",
            "Career paths: Doctor, Medical Researcher, Public Health Officer"
        ],
        "Engineering": [
            "Bachelor of Engineering (4 years)",
            "Professional qualification (IEEESL)",
            "Consider Master's in Engineering (2 years)",
            "Specialization (Structural, Mechanical, etc.)",
            "Career paths: Civil Engineer, Project Manager, Consultant"
        ],
        "Business": [
            "Bachelor of Business Administration (4 years)",
            "Professional qualifications (CIM, ACCA)",
            "Consider MBA (2 years)",
            "Specialize in Marketing/Finance/Management",
            "Career paths: Manager, Entrepreneur, Consultant"
        ]
    }
    return roadmaps.get(degree, ["General academic pathway"])

def generate_counterfactual_guidance(student_profile: dict, results: dict) -> Dict[str, str]:
    """Generate counterfactual reasoning for improvement"""
    guidance = {}
    
    # Z-score improvement
    z_score = student_profile.get("z_score", 0)
    if z_score < 1.5:
        guidance["z_score"] = f"Improve Z-score to {min(1.5, z_score + 0.3)} for better university options"
    
    # Skill improvements
    skills = results.get("skill_match_scores", {})
    for skill, score in skills.items():
        if score < 0.6:
            skill_names = {
                "programming": "Programming skills",
                "analysis": "Analytical thinking",
                "leadership": "Leadership abilities",
                "creativity": "Creative problem-solving"
            }
            guidance[skill] = f"Strengthen {skill_names.get(skill, skill)} through practice and learning"
    
    # Personality development
    personality = results.get("personality_match", {})
    for trait, score in personality.items():
        if score < 0.5:
            trait_names = {
                "analytical": "Analytical thinking",
                "creativity": "Creative mindset",
                "leadership": "Leadership qualities",
                "risk_taking": "Calculated risk-taking"
            }
            guidance[trait] = f"Develop {trait_names.get(trait, trait)} through workshops and experience"
    
    return guidance

@app.get("/")
async def root():
    return {"message": "FutureDream Degree Advisor API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(student: StudentProfile):
    """Get degree recommendations based on student profile"""
    try:
        # Convert to dictionary
        student_profile = student.dict()
        
        # Use backward chaining model
        results = backward_model.backward_chain(student_profile["dream_job"], student_profile)
        
        if "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
        
        # Generate recommendations
        recommendations = []
        for degree, overall_score in results["overall_scores"].items():
            recommendation = DegreeRecommendation(
                degree=degree,
                probability=results["degree_recommendations"][degree],
                overall_score=overall_score,
                skill_match=results["skill_match_scores"],
                personality_match=results["personality_match"],
                academic_feasibility=results["academic_feasibility"],
                lifestyle_compatibility=results["lifestyle_compatibility"],
                explanation=f"Based on your {student_profile['stream']} stream and {student_profile['z_score']} Z-score, {degree} offers strong alignment with your {student_profile['dream_job']} career goals.",
                roadmap=generate_roadmap(degree, student_profile["dream_job"])
            )
            recommendations.append(recommendation)
        
        # Sort by overall score
        recommendations.sort(key=lambda x: x.overall_score, reverse=True)
        
        # Generate counterfactual guidance
        counterfactual = generate_counterfactual_guidance(student_profile, results)
        
        return RecommendationResponse(
            dream_job=student_profile["dream_job"],
            recommendations=recommendations,
            best_degree=recommendations[0].degree if recommendations else "None",
            confidence=recommendations[0].overall_score if recommendations else 0.0,
            counterfactual_guidance=counterfactual
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing recommendation: {str(e)}")

@app.post("/predict-ml")
async def predict_with_ml(student: StudentProfile):
    """Get prediction using trained ML model"""
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not available")
    
    try:
        # Convert to dictionary and prepare features
        student_dict = student.dict()
        
        # Create feature vector similar to training
        feature_vector = {}
        categorical_cols = [
            "district", "stream", "dream_job", "preferred_location", "travel_tolerance",
            "stress_tolerance", "social_preference", "ol_results", "subject_strength"
        ]
        
        # Encode categorical variables
        for col in categorical_cols:
            if col in encoders and col in student_dict:
                try:
                    feature_vector[col] = encoders[col].transform([student_dict[col]])[0]
                except:
                    feature_vector[col] = 0
            else:
                feature_vector[col] = 0
        
        # Add numerical features
        numerical_features = [
            "z_score", "analytical_skill", "creativity", "leadership", "risk_taking",
            "communication_skill", "problem_solving", "teamwork", "entrepreneurial_mindset",
            "business_acumen", "work_life_balance_priority", "family_attachment_level",
            "financial_stability_need", "al_predicted", "career_sustainability_priority",
            "innovation_interest", "social_impact_priority"
        ]
        
        for feature in numerical_features:
            if feature in student_dict:
                feature_vector[feature] = student_dict[feature]
            else:
                feature_vector[feature] = 0
        
        # Create DataFrame in correct order
        feature_df = pd.DataFrame([feature_vector])
        
        # Ensure all expected columns are present
        expected_cols = model.feature_names_in_
        for col in expected_cols:
            if col not in feature_df.columns:
                feature_df[col] = 0
        
        # Reorder columns
        feature_df = feature_df[expected_cols]
        
        # Make prediction
        prediction = model.predict(feature_df)[0]
        probability = model.predict_proba(feature_df)[0].max()
        
        # Decode prediction
        if target_encoder:
            degree_name = target_encoder.inverse_transform([prediction])[0]
        else:
            degree_name = f"Degree_{prediction}"
        
        return {
            "predicted_degree": degree_name,
            "confidence": float(probability),
            "method": "machine_learning"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in ML prediction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

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
        # Create comprehensive career knowledge base
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
            },
            "Teacher": {
                "required_skills": {"communication": 0.9, "empathy": 0.85, "patience": 0.8, "knowledge": 0.75},
                "personality_traits": {"leadership": 0.7, "creativity": 0.6, "analytical": 0.5},
                "degree_paths": {"Arts": 0.9, "Bio Science": 0.7, "Mathematics": 0.8},
                "z_score_threshold": 1.0,
                "future_demand": 0.8,
                "stress_level": 0.5,
                "work_environment": {"school": 0.9, "office": 0.3}
            }
        }
        print("✅ Created fallback model with career knowledge base")
        
    def predict_degree(self, student_data):
        """Predict degree program using trained model or fallback"""
        try:
            # Prepare input data
            input_df = pd.DataFrame([student_data])
            
            # If trained model exists, use it
            if self.model is not None:
                # Encode categorical variables
                for col, encoder in self.encoders.items():
                    if col in input_df.columns:
                        input_df[col] = encoder.transform(input_df[col].astype(str))
                
                # Make prediction
                prediction = self.model.predict(input_df)
                predicted_degree = self.le_target.inverse_transform([prediction[0]])[0]
                
                # Get prediction probability
                probabilities = self.model.predict_proba(input_df)[0]
                confidence = max(probabilities)
                
                return {
                    "predicted_degree": predicted_degree,
                    "confidence": float(confidence),
                    "method": "trained_random_forest"
                }
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
        
        # Sri Lankan university cutoff data
        UNIVERSITY_CUTOFFS = {
            "Medicine": {"min_z": 2.0},
            "Engineering": {"min_z": 1.8},
            "IT": {"min_z": 1.4},
            "Business": {"min_z": 1.2},
            "Bio Science": {"min_z": 1.7},
            "Mathematics": {"min_z": 1.5},
            "Arts": {"min_z": 1.0}
        }
        
        # Determine eligible degrees based on Z-score and stream
        eligible_degrees = []
        
        # Handle all Sri Lankan AL streams with proper mapping
        if stream in ["Bio Science", "Biology", "Biological Science"]:
            if z_score >= 2.0:
                eligible_degrees.append(("Medicine", 0.9))
            if z_score >= 1.7:
                eligible_degrees.append(("Bio Science", 0.8))
            if z_score >= 1.5:
                eligible_degrees.append(("Agriculture", 0.7))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.6))
                
        elif stream in ["Physical Science", "Physical Sciences", "Combined Mathematics"]:
            if z_score >= 1.8:
                eligible_degrees.append(("Engineering", 0.85))
            if z_score >= 1.6:
                eligible_degrees.append(("Physical Science", 0.8))
            if z_score >= 1.5:
                eligible_degrees.append(("Mathematics", 0.8))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.75))
            if z_score >= 1.3:
                eligible_degrees.append(("Computer Science", 0.7))
                
        elif stream in ["Commerce", "Commerce Stream", "Accounting"]:
            if z_score >= 1.5:
                eligible_degrees.append(("Business", 0.9))
            if z_score >= 1.4:
                eligible_degrees.append(("Accounting", 0.85))
            if z_score >= 1.3:
                eligible_degrees.append(("Finance", 0.8))
            if z_score >= 1.2:
                eligible_degrees.append(("IT", 0.6))
            if z_score >= 1.1:
                eligible_degrees.append(("Management", 0.5))
                
        elif stream in ["Mathematics", "Pure Mathematics"]:
            if z_score >= 1.6:
                eligible_degrees.append(("Mathematics", 0.9))
            if z_score >= 1.5:
                eligible_degrees.append(("Statistics", 0.85))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.8))
            if z_score >= 1.3:
                eligible_degrees.append(("Engineering", 0.7))
            if z_score >= 1.2:
                eligible_degrees.append(("Physical Science", 0.6))
                
        elif stream in ["Arts", "Art Stream", "Humanities"]:
            if z_score >= 1.2:
                eligible_degrees.append(("Arts", 0.9))
            if z_score >= 1.1:
                eligible_degrees.append(("Literature", 0.8))
            if z_score >= 1.0:
                eligible_degrees.append(("Social Sciences", 0.7))
            if z_score >= 0.9:
                eligible_degrees.append(("Business", 0.6))
            if z_score >= 0.8:
                eligible_degrees.append(("Education", 0.5))
                
        elif stream in ["Technology", "Engineering Technology", "IT Stream"]:
            # Technology stream students have specialized options
            if z_score >= 1.8:
                eligible_degrees.append(("Engineering", 0.9))
            if z_score >= 1.6:
                eligible_degrees.append(("IT", 0.9))
            if z_score >= 1.5:
                eligible_degrees.append(("Computer Science", 0.8))
            if z_score >= 1.4:
                eligible_degrees.append(("Engineering Technology", 0.7))
            if z_score >= 1.3:
                eligible_degrees.append(("Information Technology", 0.6))
                
        elif stream in ["General", "General Arts", "General Science"]:
            # General stream students can access most degrees
            if z_score >= 1.8:
                eligible_degrees.append(("Engineering", 0.8))
            if z_score >= 1.6:
                eligible_degrees.append(("Business", 0.8))
            if z_score >= 1.5:
                eligible_degrees.append(("IT", 0.8))
            if z_score >= 1.4:
                eligible_degrees.append(("Mathematics", 0.7))
            if z_score >= 1.3:
                eligible_degrees.append(("Arts", 0.7))
            if z_score >= 1.2:
                eligible_degrees.append(("Bio Science", 0.6))
        
        # Enhanced stream-degree compatibility with prioritization
        stream_degree_priority = {
            # Bio Science stream priorities
            "Bio Science": {"Medicine": 1.0, "Bio Science": 1.0, "Agriculture": 0.9, "IT": 0.6, "Nursing": 0.8},
            "Biology": {"Medicine": 1.0, "Bio Science": 1.0, "Agriculture": 0.9, "IT": 0.6, "Nursing": 0.8},
            "Biological Science": {"Medicine": 1.0, "Bio Science": 1.0, "Agriculture": 0.9, "IT": 0.6, "Nursing": 0.8},
            
            # Physical Science stream priorities  
            "Physical Science": {"Engineering": 1.0, "Physical Science": 1.0, "Mathematics": 0.9, "IT": 0.8, "Computer Science": 0.85},
            "Physical Sciences": {"Engineering": 1.0, "Physical Science": 1.0, "Mathematics": 0.9, "IT": 0.8, "Computer Science": 0.85},
            "Combined Mathematics": {"Engineering": 1.0, "Mathematics": 1.0, "Physical Science": 0.9, "IT": 0.8, "Computer Science": 0.85},
            
            # Commerce stream priorities
            "Commerce": {"Business": 1.0, "Accounting": 0.95, "Finance": 0.9, "Management": 0.85, "IT": 0.7},
            "Commerce Stream": {"Business": 1.0, "Accounting": 0.95, "Finance": 0.9, "Management": 0.85, "IT": 0.7},
            "Accounting": {"Accounting": 1.0, "Business": 0.9, "Finance": 0.95, "Management": 0.8, "IT": 0.6},
            
            # Mathematics stream priorities
            "Mathematics": {"Mathematics": 1.0, "Statistics": 0.95, "IT": 0.9, "Engineering": 0.8, "Physical Science": 0.85},
            "Pure Mathematics": {"Mathematics": 1.0, "Statistics": 0.95, "IT": 0.9, "Engineering": 0.8, "Physical Science": 0.85},
            
            # Arts stream priorities
            "Arts": {"Arts": 1.0, "Literature": 0.9, "Social Sciences": 0.85, "Education": 0.95, "Business": 0.7},
            "Art Stream": {"Arts": 1.0, "Literature": 0.9, "Social Sciences": 0.85, "Education": 0.95, "Business": 0.7},
            "Humanities": {"Arts": 0.9, "Literature": 0.95, "Social Sciences": 1.0, "Education": 0.9, "Business": 0.6},
            
            # Technology stream priorities
            "Technology": {"Engineering": 1.0, "IT": 1.0, "Computer Science": 0.95, "Engineering Technology": 0.9, "Information Technology": 0.85},
            "Engineering Technology": {"Engineering": 1.0, "Engineering Technology": 1.0, "IT": 0.9, "Computer Science": 0.85, "Information Technology": 0.8},
            "IT Stream": {"IT": 1.0, "Computer Science": 1.0, "Engineering": 0.8, "Information Technology": 0.9, "Engineering Technology": 0.7},
            
            # General stream priorities
            "General": {"Business": 0.9, "IT": 0.9, "Engineering": 0.8, "Mathematics": 0.8, "Arts": 0.8, "Bio Science": 0.7},
            "General Arts": {"Arts": 1.0, "Business": 0.8, "Social Sciences": 0.9, "Education": 0.85, "IT": 0.7},
            "General Science": {"Science": 1.0, "Engineering": 0.9, "IT": 0.9, "Mathematics": 0.8, "Bio Science": 0.8}
        }
        
        # Job compatibility matrix
        job_degree_compatibility = {
            "Doctor": {"Medicine": 1.0, "Bio Science": 0.7, "Agriculture": 0.4, "Nursing": 0.8},
            "Software Engineer": {"IT": 1.0, "Computer Science": 1.0, "Engineering": 0.8, "Mathematics": 0.7, "Physical Science": 0.6},
            "Data Scientist": {"IT": 0.9, "Mathematics": 0.9, "Statistics": 1.0, "Computer Science": 0.95, "Bio Science": 0.6},
            "Entrepreneur": {"Business": 1.0, "Management": 0.9, "Finance": 0.8, "IT": 0.7},
            "Accountant": {"Accounting": 1.0, "Finance": 0.9, "Business": 0.8, "Mathematics": 0.7},
            "Civil Engineer": {"Engineering": 1.0, "Mathematics": 0.8, "Physical Science": 0.7},
            "Teacher": {"Education": 1.0, "Arts": 0.9, "Mathematics": 0.8, "Literature": 0.9, "Bio Science": 0.7},
            "Nurse": {"Nursing": 1.0, "Medicine": 0.8, "Bio Science": 0.9, "Agriculture": 0.5},
            "Banker": {"Finance": 1.0, "Business": 0.9, "Accounting": 0.8, "Mathematics": 0.6},
            "Architect": {"Engineering": 0.9, "Mathematics": 0.7, "Arts": 0.6},
            "Lawyer": {"Social Sciences": 1.0, "Arts": 0.9, "Business": 0.6},
            "Journalist": {"Literature": 1.0, "Arts": 0.9, "Social Sciences": 0.8},
            "Scientist": {"Bio Science": 1.0, "Physical Science": 1.0, "Mathematics": 0.9, "IT": 0.7},
            "Manager": {"Management": 1.0, "Business": 0.9, "Arts": 0.6, "IT": 0.5}
        }
        
        # Enhanced scoring with stream prioritization
        for i, (degree, score) in enumerate(eligible_degrees):
            # Stream compatibility (highest priority)
            stream_priority = stream_degree_priority.get(stream, {}).get(degree, 0.5)
            
            # Job compatibility (medium priority)
            job_priority = job_degree_compatibility.get(dream_job, {}).get(degree, 0.5)
            
            # Combined score with stream prioritization
            combined_score = score * (0.6 * stream_priority + 0.4 * job_priority)
            eligible_degrees[i] = (degree, combined_score)
        
        # Sort by score
        eligible_degrees.sort(key=lambda x: x[1], reverse=True)
        
        if eligible_degrees:
            # Return top 3 degree recommendations instead of just one
            top_degrees = eligible_degrees[:3] if len(eligible_degrees) >= 3 else eligible_degrees
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
                        "risk_taking": float(student_data.get('risk_taking', 3) / 5.0)
                    },
                    "personality_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "risk_taking": float(student_data.get('risk_taking', 3) / 5.0),
                        "leadership": float(student_data.get('leadership', 3) / 5.0)
                    },
                    "academic_feasibility": {
                        "z_score_feasibility": min(1.0, float(student_data.get('z_score', 0)) / 2.0),
                        "district_adjustment": 0.8,
                        "threshold_gap": max(0, 2.0 - float(student_data.get('z_score', 0)))
                    },
                    "lifestyle_compatibility": {
                        "stress_match": 0.8,
                        "location_match": 0.7,
                        "social_match": 0.6,
                        "travel_match": 0.5
                    },
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
                        "risk_taking": float(student_data.get('risk_taking', 3) / 5.0)
                    },
                    "personality_match": {
                        "analytical": float(student_data.get('analytical_skill', 3) / 5.0),
                        "creativity": float(student_data.get('creativity', 3) / 5.0),
                        "risk_taking": float(student_data.get('risk_taking', 3) / 5.0),
                        "leadership": float(student_data.get('leadership', 3) / 5.0)
                    },
                    "academic_feasibility": {
                        "z_score_feasibility": min(1.0, float(student_data.get('z_score', 0)) / 2.0),
                        "district_adjustment": 0.8,
                        "threshold_gap": max(0, 2.0 - float(student_data.get('z_score', 0)))
                    },
                    "lifestyle_compatibility": {
                        "stress_match": 0.8,
                        "location_match": 0.7,
                        "social_match": 0.6,
                        "travel_match": 0.5
                    },
                    "roadmap": self._generate_degree_roadmap(degree)
                })
            
            return {
                "predicted_degree": "IT",
                "confidence": 0.5,
                "method": "fallback",
                "recommendations": degree_recommendations
            }

    def _generate_degree_roadmap(self, degree):
        """Generate career roadmap based on degree"""
        roadmaps = {
            "IT": ["Bachelor of Computer Science (4 years)", "Specialize in AI/ML/Software Engineering", "Consider Master's in Computer Science (2 years)", "Career paths: Software Engineer, Data Scientist, AI Researcher"],
            "Computer Science": ["Bachelor of Computer Science (4 years)", "Specialize in AI/ML/Software Engineering", "Consider Master's in Computer Science (2 years)", "Career paths: Software Engineer, Data Scientist, AI Researcher"],
            "Engineering": ["Bachelor of Engineering (4 years)", "Choose specialization (Civil/Mechanical/Electrical)", "Professional certification (P.Eng)", "Career paths: Engineer, Project Manager, Consultant"],
            "Physical Science": ["Bachelor of Science in Physical Science (4 years)", "Research specialization", "Master's/PhD program", "Career paths: Researcher, Lab Scientist, Academic"],
            "Medicine": ["MBBS (5 years)", "Internship (1 year)", "Specialization training (3-5 years)", "Career paths: Doctor, Specialist, Medical Researcher"],
            "Business": ["Bachelor of Business Administration (4 years)", "MBA or specialized Master's (2 years)", "Professional certification", "Career paths: Business Manager, Entrepreneur, Consultant"],
            "Management": ["Bachelor of Management (4 years)", "MBA or specialized Master's (2 years)", "Professional certification", "Career paths: Manager, Administrator, Consultant"],
            "Finance": ["Bachelor of Finance (4 years)", "Professional certification (CFA/CPA)", "Master's in Finance (2 years)", "Career paths: Financial Analyst, Banker, Investment Manager"],
            "Accounting": ["Bachelor of Accounting (4 years)", "Professional certification (CA/CMA)", "Master's in Accounting (2 years)", "Career paths: Accountant, Auditor, Financial Controller"],
            "Bio Science": ["Bachelor of Science in Bio Science (4 years)", "Research specialization", "Master's/PhD program", "Career paths: Researcher, Lab Technician, Academic"],
            "Mathematics": ["Bachelor of Mathematics (4 years)", "Applied specialization", "Advanced degree", "Career paths: Mathematician, Data Analyst, Academic"],
            "Statistics": ["Bachelor of Statistics (4 years)", "Statistical computing specialization", "Master's in Statistics (2 years)", "Career paths: Statistician, Data Scientist, Researcher"],
            "Arts": ["Bachelor of Arts (4 years)", "Specialization in chosen field", "Professional development", "Career paths: Teacher, Writer, Public Service"],
            "Literature": ["Bachelor of Arts in Literature (4 years)", "Creative writing specialization", "Master's in Literature (2 years)", "Career paths: Writer, Journalist, Editor"],
            "Social Sciences": ["Bachelor of Social Sciences (4 years)", "Specialization (Sociology/Psychology)", "Master's program", "Career paths: Social Worker, Counselor, Researcher"],
            "Education": ["Bachelor of Education (4 years)", "Teaching certification", "Master's in Education (2 years)", "Career paths: Teacher, Education Administrator, Curriculum Developer"],
            "Agriculture": ["Bachelor of Agriculture (4 years)", "Agricultural science specialization", "Master's in Agriculture (2 years)", "Career paths: Agricultural Scientist, Farm Manager, Researcher"]
        }
        return roadmaps.get(degree, ["General degree pathway (4 years)", "Specialization", "Professional development", "Career advancement"])

class UniversityRecommender:
    def __init__(self):
        self.universities = UNIVERSITY_DATABASE
    
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
                        "admission_probability": admission_prob,
                        "z_score_requirement": uni_info["z_score_requirements"].get(predicted_degree, 1.5),
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
                    "admission_probability": admission_prob,
                    "tuition_fee_range": uni_info.get("tuition_fee_range", {}).get(predicted_degree, "N/A"),
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
        
        universities_with_distance = []
        for uni in all_universities:
            if "coordinates" in uni:
                distance = self._calculate_distance(student_coords, uni["coordinates"])
                uni_with_distance = uni.copy()
                uni_with_distance["distance_km"] = distance
                universities_with_distance.append(uni_with_distance)
        
        # Sort by distance
        universities_with_distance.sort(key=lambda x: x.get("distance_km", float('inf')))
        return universities_with_distance

# University Database with Location Data
UNIVERSITY_DATABASE = {
    "government": {
        "University of Colombo": {
            "degrees": ["Medicine", "Engineering", "IT", "Business", "Arts", "Social Sciences"],
            "z_score_requirements": {"Medicine": 2.24, "Engineering": 1.99, "IT": 1.55, "Business": 1.6, "Arts": 1.2, "Social Sciences": 1.3},
            "district_bonus": {"Colombo": 0.1, "Gampaha": 0.05},
            "location": "Colombo",
            "coordinates": {"lat": 6.9271, "lon": 79.8612},
            "rankings": {"national": 1, "international": 1001},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Computer Science", "Business Administration", "Medicine", "Arts", "Social Sciences"]
        },
        "University of Peradeniya": {
            "degrees": ["Engineering", "IT", "Bio Science", "Mathematics", "Medicine", "Arts", "Agriculture"],
            "z_score_requirements": {"Engineering": 1.85, "IT": 1.60, "Bio Science": 1.85, "Mathematics": 1.60, "Medicine": 2.24, "Arts": 1.1, "Agriculture": 1.5},
            "district_bonus": {"Kandy": 0.1, "Matale": 0.05},
            "location": "Kandy",
            "coordinates": {"lat": 7.2906, "lon": 80.6337},
            "rankings": {"national": 2, "international": 1200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital"],
            "specialties": ["Engineering", "Agriculture", "Medicine", "Arts"]
        },
        "University of Moratuwa": {
            "degrees": ["Engineering", "IT", "Architecture"],
            "z_score_requirements": {"Engineering": 1.99, "IT": 1.55, "Architecture": 1.70},
            "district_bonus": {"Colombo": 0.05, "Gampaha": 0.05},
            "location": "Moratuwa",
            "coordinates": {"lat": 6.7959, "lon": 79.9008},
            "rankings": {"national": 3, "international": 800},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Engineering", "Architecture", "Technology"]
        },
        "University of Sri Jayewardenepura": {
            "degrees": ["Business", "IT", "Bio Science", "Mathematics"],
            "z_score_requirements": {"Business": 1.6, "IT": 1.5, "Bio Science": 1.8, "Mathematics": 1.6},
            "district_bonus": {"Colombo": 0.05},
            "location": "Nugegoda",
            "coordinates": {"lat": 6.8919, "lon": 79.8649},
            "rankings": {"national": 4, "international": 1500},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Business Management", "Computer Science"]
        }
    },
    "private": {
        "SLIIT": {
            "degrees": ["IT", "Business", "Engineering"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0},
            "tuition_fee_range": {"IT": "500,000-800,000", "Business": "400,000-700,000", "Engineering": "600,000-900,000"},
            "location": "Malabe",
            "coordinates": {"lat": 6.8422, "lon": 80.0921},
            "rankings": {"national": 1, "international": 4000},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Industry Partnerships"],
            "specialties": ["Information Technology", "Business Administration", "Engineering"],
            "accreditation": ["UGC", "IET", "BCS"]
        },
        "NSBM": {
            "degrees": ["Business", "IT", "Engineering"],
            "z_score_requirements": {"Business": 1.0, "IT": 1.0, "Engineering": 1.0},
            "tuition_fee_range": {"Business": "500,000-800,000", "IT": "600,000-900,000", "Engineering": "700,000-1,000,000"},
            "location": "Homagama",
            "coordinates": {"lat": 6.8422, "lon": 80.0921},
            "rankings": {"national": 4, "international": 5200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Modern Campus"],
            "specialties": ["Management", "Computing", "Engineering"],
            "accreditation": ["UGC", "Plymouth University UK"]
        }
    }
}

# Fixed University Recommendation System with Location Data
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
        # Create comprehensive career knowledge base from notebook
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
        district = student_data.get('district', '')
        
        # Step 1: Determine eligible degrees based on Z-score and stream
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
        
        if stream == "Bio Science":
            if z_score >= 2.0:
                eligible_degrees.append(("Medicine", 0.9))
            if z_score >= 1.7:
                eligible_degrees.append(("Bio Science", 0.8))
                
        elif stream == "Physical Science":
            if z_score >= 1.8:
                eligible_degrees.append(("Engineering", 0.85))
            if z_score >= 1.5:
                eligible_degrees.append(("Mathematics", 0.8))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.75))
                
        elif stream == "Commerce":
            if z_score >= 1.2:
                eligible_degrees.append(("Business", 0.9))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.6))
                
        elif stream == "Mathematics":
            if z_score >= 1.5:
                eligible_degrees.append(("Mathematics", 0.85))
            if z_score >= 1.4:
                eligible_degrees.append(("IT", 0.8))
                
        elif stream == "Arts":
            if z_score >= 1.0:
                eligible_degrees.append(("Arts", 0.9))
            if z_score >= 1.2:
                eligible_degrees.append(("Business", 0.6))
        
        # Adjust scores based on dream job compatibility
        job_degree_compatibility = {
            "Doctor": {"Medicine": 1.0, "Bio Science": 0.7},
            "Software Engineer": {"IT": 1.0, "Engineering": 0.8, "Mathematics": 0.7},
            "Data Scientist": {"IT": 0.9, "Mathematics": 0.9, "Bio Science": 0.6},
            "Entrepreneur": {"Business": 1.0, "IT": 0.7, "Engineering": 0.3},
            "Accountant": {"Business": 1.0, "Mathematics": 0.7},
            "Civil Engineer": {"Engineering": 1.0, "Mathematics": 0.8},
            "Teacher": {"Arts": 0.9, "Bio Science": 0.7, "Mathematics": 0.8}
        }
        
        if dream_job in job_degree_compatibility:
            for i, (degree, score) in enumerate(eligible_degrees):
                compatibility = job_degree_compatibility[dream_job].get(degree, 0.5)
                eligible_degrees[i] = (degree, score * compatibility)
        
        # Sort by score and return top recommendation
        eligible_degrees.sort(key=lambda x: x[1], reverse=True)
        
        if eligible_degrees:
            best_degree, confidence = eligible_degrees[0]
            return {
                "predicted_degree": best_degree,
                "confidence": float(confidence),
                "method": "z_score_fallback"
            }
        else:
            return {"predicted_degree": "IT", "confidence": 0.5, "method": "fallback"}

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
        admission_prob = min(1.0, base_probability + district_bonus)
        
        return admission_prob
    
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
            "Jaffna": {"lat": 9.6615, "lon": 80.0107},
            "Puttalam": {"lat": 7.9036, "lon": 81.7779},
            "Ampara": {"lat": 7.3242, "lon": 81.8420}
        }
        return district_coords.get(district, {"lat": 6.9271, "lon": 79.8612})  # Default to Colombo
    
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
            "degrees": ["IT", "Business", "Bio Science", "Mathematics", "Medicine"],
            "z_score_requirements": {"IT": 1.65, "Business": 1.50, "Bio Science": 1.80, "Mathematics": 1.70, "Medicine": 2.28},
            "district_bonus": {"Colombo": 0.1, "Gampaha": 0.05},
            "location": "Colombo",
            "coordinates": {"lat": 6.9271, "lon": 79.8612},
            "rankings": {"national": 1, "international": 1001},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Computer Science", "Business Administration", "Medicine"]
        },
        "University of Peradeniya": {
            "degrees": ["Engineering", "IT", "Bio Science", "Mathematics", "Medicine"],
            "z_score_requirements": {"Engineering": 1.85, "IT": 1.60, "Bio Science": 1.85, "Mathematics": 1.60, "Medicine": 2.24},
            "district_bonus": {"Kandy": 0.1, "Matale": 0.05},
            "location": "Kandy",
            "coordinates": {"lat": 7.2906, "lon": 80.6337},
            "rankings": {"national": 2, "international": 1200},
            "facilities": ["Library", "Labs", "Sports", "Hostels", "Hospital"],
            "specialties": ["Engineering", "Agriculture", "Medicine"]
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
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0},
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

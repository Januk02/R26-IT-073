import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
from career_recommender import AdaptiveCareerRecommender

class UnifiedAIEngine:
    def __init__(self):
        print("Booting up Unified AI-Engine (Stacking Ensemble + Knowledge Graph)...")
        self.recommender = AdaptiveCareerRecommender()
        load_dotenv()
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USERNAME")
        self.password = os.getenv("NEO4J_PASSWORD")
        
        if not self.uri or not self.password:
            raise ValueError("⚠️ Missing Neo4j credentials! Check your .env file.")
            
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def close(self):
        self.driver.close()

    def get_core_competencies(self, target_role, top_n=10):
        query = """
        MATCH (r:JobRole {name: $role})-[rel:REQUIRES_SKILL]->(s:Skill)
        RETURN s.name AS skill, rel.weight AS weight
        ORDER BY weight DESC
        LIMIT $limit
        """
        requirements = {}
        with self.driver.session() as session:
            result = session.run(query, role=target_role, limit=top_n)
            for record in result:
                requirements[record["skill"]] = record["weight"]
        return requirements

    def get_academic_benchmark(self, target_role):
        query = """
        MATCH (r:JobRole {name: $role})-[rel:REQUIRES_DEGREE]->(d:Degree)
        RETURN d.name AS degree, rel.weight AS weight
        ORDER BY weight DESC
        LIMIT 1
        """
        with self.driver.session() as session:
            result = session.run(query, role=target_role)
            record = result.single()
            if record:
                return record["degree"], record["weight"]
            return "Bachelor's Degree in IT / Computer Science", 5

    def apply_academic_affinity(self, predictions, user_degree):
        """
        Intercepts ML predictions and mathematically boosts roles that align 
        with the user's explicit academic background.
        """
        if not user_degree or user_degree.lower() == "none":
            return predictions
            
        degree_lower = user_degree.lower()
        
        # Dictionary mapping academic keywords to job roles
        affinity_map = {
            "Data Scientist": ["data science", "statistics", "mathematics", "analytics"],
            "Data Engineer": ["data science", "data engineering", "computer science", "information systems"], # NEW
            "Cloud Architect": ["cloud", "networking", "computer science", "information technology"], # NEW
            "Software Engineer": ["software", "computer science", "computing", "programming"],
            "QA Engineer": ["quality assurance", "software testing", "qa"],
            "Cybersecurity": ["security", "cybersecurity", "information security"],
            "Business Analyst": ["business", "management", "administration", "commerce"]
        }
        
        adjusted_predictions = []
        for pred in predictions:
            role = pred['role']
            confidence = pred['confidence']
            
            # Check if user's degree contains keywords for this specific role
            if role in affinity_map:
                for keyword in affinity_map[role]:
                    if keyword in degree_lower:
                        confidence += 20.0  # Apply a 20% Affinity Boost
                        print(f"   [Affinity System] Mathematical Boost applied to '{role}' due to Degree Match!")
                        break
                        
            # Cap confidence at 99.9%
            confidence = min(confidence, 99.9)
            adjusted_predictions.append({'role': role, 'confidence': confidence})
            
        # Re-sort the predictions based on the newly adjusted confidence scores
        adjusted_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        return adjusted_predictions

    def generate_adaptive_pathway(self, user_skills, user_current_degree=None):
        print("\n=======================================================")
        print(f"👤 USER PROFILE INITIATED: {user_skills}")
        if user_current_degree:
            print(f"🎓 CURRENT EDUCATION: {user_current_degree}")
        print("=======================================================")
        
        # --- BRAIN 1: Predict the Destination ---
        # Get top 3 so the Affinity System has room to re-order them
        predictions = self.recommender.predict_top_pathways(user_skills, top_n=3)
        if not predictions:
            return
            
        # Apply the Academic Affinity Post-Processing
        print("\n[Brain 1.5] Running Academic Affinity Diagnostics...")
        adjusted_predictions = self.apply_academic_affinity(predictions, user_current_degree)
            
        target_role = adjusted_predictions[0]['role']
        confidence = adjusted_predictions[0]['confidence']
        print(f"\n🎯 Target Destination Locked: {target_role} (Adjusted Confidence: {confidence:.1f}%)")
        
        # --- BRAIN 2: Calculate the Pathway ---
        core_reqs = self.get_core_competencies(target_role, top_n=10)
        recommended_degree, degree_weight = self.get_academic_benchmark(target_role)
        
        total_market_weight = sum(core_reqs.values()) + degree_weight
        user_matched_weight = 0
        missing_requirements = []
        user_skills_lower = [s.lower() for s in user_skills]

        # 1. Grade Technical Skills
        for required_skill, weight in core_reqs.items():
            if required_skill.lower() in user_skills_lower:
                user_matched_weight += weight
            else:
                missing_requirements.append({"req": required_skill, "weight": weight, "type": "Skill"})

        # 2. Grade Academic Profile (Using Tier-Matching Entity Resolution)
        degree_met = False
        if user_current_degree and user_current_degree.lower() != "none":
            user_deg_clean = user_current_degree.lower()
            req_deg_clean = recommended_degree.lower()
            
            academic_tiers = ['bachelor', 'bsc', 'b.sc', 'degree', 'master', 'msc', 'phd']
            
            if user_deg_clean == req_deg_clean:
                degree_met = True
            else:
                for tier in academic_tiers:
                    if tier in user_deg_clean and tier in req_deg_clean:
                        degree_met = True
                        break
                        
        if degree_met:
             user_matched_weight += degree_weight
        else:
             missing_requirements.append({"req": recommended_degree, "weight": degree_weight, "type": "Degree"})

        # Final SGI Formula
        match_percentage = (user_matched_weight / total_market_weight) * 100 if total_market_weight > 0 else 0
        sgi_score = 100 - match_percentage

        # --- OUTPUT THE RESULTS ---
        print("\n📊 HOLISTIC PATHWAY ANALYSIS RESULTS:")
        print(f"   Overall Market Readiness: {match_percentage:.1f}%")
        print(f"   Skill & Academic Gap Index (SGI): {sgi_score:.1f}%")
        
        print("\n🗺️ PRIORITIZED ADAPTIVE PATHWAY (What you need to acquire):")
        if not missing_requirements:
            print("   ✅ Profile is 100% optimized. Ready for job applications.")
        else:
            missing_requirements.sort(key=lambda x: x["weight"], reverse=True)
            for item in missing_requirements:
                if item["type"] == "Degree":
                    print(f"   🎓 ACQUIRE DEGREE: {item['req']} (Market Weight: {item['weight']})")
                else:
                    print(f"   ❌ LEARN SKILL: {item['req']} (Market Weight: {item['weight']})")
        print("=======================================================\n")
        
        return {
            "target_role": target_role,
            "confidence_score": confidence,
            "sgi_score": sgi_score,
            "market_readiness": match_percentage,
            "recommended_degree": recommended_degree,
            "missing_requirements": missing_requirements
        }

# --- Execution Entry Point ---
if __name__ == "__main__":
    engine = UnifiedAIEngine()
    try:
        # TEST CASE: The Data Science Degree Trap
        engine.generate_adaptive_pathway(
            user_skills=["Python", "SQL", "AWS","excel"], 
            user_current_degree="Bachelor's in Data Science"
        )
    finally:
        engine.close()
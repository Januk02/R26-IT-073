from career_recommender import GraphRecommender
from sgi_engine import SkillGapEngine

class AdaptiveCareerSystem:
    def __init__(self, industry_csv_path):
        print("Initializing the Adaptive Career System...")
        # 1. Boot up the Graph Brain (Neo4j)
        self.brain = GraphRecommender()
        
        # 2. Boot up the Math Calculator (Scikit-Learn)
        self.calculator = SkillGapEngine()
        self.calculator.train_engine(industry_csv_path)
        
    def generate_xai_roadmap(self, student_name, student_skills):
        print("\n" + "="*60)
        print(f" GENERATING EXPLAINABLE AI (XAI) ROADMAP FOR: {student_name}")
        print("="*60)
        
        # --- STAGE 1: GRAPH RECOMMENDATION ---
        print("\n[STAGE 1] Traversing Knowledge Graph for Role Recommendations...")
        recommended_roles = self.brain.get_career_recommendations(student_name, limit=1)
        
        if not recommended_roles:
            print("Error: No paths found for this user in the graph.")
            return
            
        top_role = recommended_roles[0]
        print(f"✅ Recommended Career Path: {top_role['Career']}")
        print(f"🔗 Foundation Match: Shared {top_role['Match_Count']} core skills based on Degree & Profile.")
        
        # --- STAGE 2: MATHEMATICAL SKILL-GAP (SGI) ---
        print("\n[STAGE 2] Calculating Mathematical SGI against Real Industry Jobs...")
        sgi_results = self.calculator.calculate_sgi(student_skills)
        
        # Display the Top 2 best fitting specific job postings
        top_jobs = sgi_results.head(2)
        
        for index, row in top_jobs.iterrows():
            print("\n" + "-"*40)
            print(f"🏢 Specific Job Match: {row['Job URL']}")
            print(f"📊 Similarity Score: {row['Similarity_Score']:.2f} | 📉 SGI (Gap): {row['Skill_Gap_Index (SGI)']:.2f}")
            
            # --- STAGE 3: PRESCRIPTIVE ROADMAP ---
            missing = set(row['Extracted_Skills']) - set(student_skills)
            if missing:
                print(f"🛠️ XAI PRESCRIPTION: To achieve a 100% match for this job, you must learn:")
                for skill in missing:
                    print(f"   -> {skill}")
            else:
                print("🌟 XAI PRESCRIPTION: You are a 100% match for this role!")
                
    def shutdown(self):
        self.brain.close()

# --- Main Execution ---
if __name__ == "__main__":
    # Point to our cleaned data
    csv_path = '../data/cleaned_software_engineer_jobs.csv'
    
    # Instantiate the unified system
    system = AdaptiveCareerSystem(csv_path)
    
    try:
        # The exact profile we injected into Neo4j
        target_student = "J.A. Wickremathilaka"
        current_skills = ['Java', 'SQL', 'React'] # The skills you currently hold
        
        # Run the full pipeline!
        system.generate_xai_roadmap(target_student, current_skills)
        
    finally:
        system.shutdown()
        print("\nPipeline execution complete.")
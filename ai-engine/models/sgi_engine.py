import pandas as pd
import ast
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity

class SkillGapEngine:
    """
    Core AI mathematical engine for computing the Skill-Gap Index (SGI)
    using Cosine Distance between User Vectors (U) and Industry Vectors (I).
    """
    def __init__(self):
        # MultiLabelBinarizer transforms arrays of strings into binary math vectors
        self.mlb = MultiLabelBinarizer()
        self.industry_vectors = None
        self.industry_data = None
        self.is_trained = False
        
    def train_engine(self, csv_path):
        """
        Reads the cleaned industry data and establishes the 'Universal Skill Space'.
        """
        print(f"Loading Industry Data from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Safely parse the stringified lists back into actual Python lists
        df['Extracted_Skills'] = df['Extracted_Skills'].apply(
            lambda x: ast.literal_eval(x) if pd.notna(x) else []
        )
        
        # Filter out jobs that have 0 skills identified
        self.industry_data = df[df['Extracted_Skills'].map(len) > 0].copy()
        
        # Train the binarizer to learn every unique skill in the dataset
        # This creates our N-dimensional math space
        self.industry_vectors = self.mlb.fit_transform(self.industry_data['Extracted_Skills'])
        self.is_trained = True
        
        print(f"Engine Trained! Universal Skill Space contains {len(self.mlb.classes_)} unique skills.")
        print(f"Skills mapping: {self.mlb.classes_}\n")
        
    def calculate_sgi(self, user_skills):
        """
        Takes a student's list of skills, compares it to the industry database,
        and calculates the exact SGI for the top matches.
        """
        if not self.is_trained:
            raise ValueError("Engine must be trained with industry data first!")
            
        # Convert the user's skills into the SAME math vector format as the industry
        user_vector = self.mlb.transform([user_skills])
        
        # Calculate Cosine Similarity against all industry jobs simultaneously
        similarities = cosine_similarity(user_vector, self.industry_vectors)[0]
        
        # SGI Formula: Distance = 1 - Similarity
        sgi_scores = 1 - similarities
        
        # Add the scores back to our dataframe so we can rank them
        results_df = self.industry_data.copy()
        results_df['Similarity_Score'] = similarities
        results_df['Skill_Gap_Index (SGI)'] = sgi_scores
        
        # Sort so the SMALLEST gap (closest to 0.0) is at the top
        ranked_results = results_df.sort_values(by='Skill_Gap_Index (SGI)', ascending=True)
        
        return ranked_results

# --- Academic Testing Module ---
if __name__ == "__main__":
    # 1. Initialize the AI Engine
    engine = SkillGapEngine()
    
    # 2. Feed it the clean dataset we built in the last step
    engine.train_engine('../data/cleaned_software_engineer_jobs.csv')
    
    # 3. Create a Dummy Student Profile
    # Let's say this student knows Java and SQL, but nothing about Cloud/DevOps
    student_profile = ['Java', 'SQL', 'HTML'] 
    
    print(f"Evaluating Student Profile: {student_profile}")
    print("-" * 50)
    
    # 4. Calculate the Gaps
    recommendations = engine.calculate_sgi(student_profile)
    
    # 5. Display the Top 3 most highly matched roles
    top_3 = recommendations.head(3)
    
    for index, row in top_3.iterrows():
        print(f"Job URL: {row['Job URL']}")
        print(f"Industry Requires: {row['Extracted_Skills']}")
        print(f"Similarity Score: {row['Similarity_Score']:.2f} (Higher is better)")
        print(f"Skill Gap Index (SGI): {row['Skill_Gap_Index (SGI)']:.2f} (Closer to 0.0 is better)")
        
        # Simple Logic to find missing skills for the XAI later
        missing = set(row['Extracted_Skills']) - set(student_profile)
        print(f"Missing Skills to Bridge: {list(missing)}")
        print("-" * 50)
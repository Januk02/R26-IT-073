import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load the hidden passwords from the .env file
load_dotenv('../../.env')

class GraphRecommender:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")
        
        # Using +ssc to bypass Windows SSL issues
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_career_recommendations(self, student_name, limit=3):
        """
        Traverses the graph to find the careers that share the most
        skills with the given student profile.
        """
        print(f"Analyzing Graph Connections for: {student_name}...\n")
        
        # The Cypher Query: Match Student -> Skill <- CareerPath
        query = """
        MATCH (st:Student {name: $student_name})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(c:CareerPath)
        RETURN c.title AS Career, collect(s.name) AS Shared_Skills, count(s) AS Match_Count
        ORDER BY Match_Count DESC
        LIMIT $limit
        """
        
        recommendations = []
        with self.driver.session() as session:
            result = session.run(query, student_name=student_name, limit=limit)
            
            for record in result:
                recommendations.append({
                    "Career": record["Career"],
                    "Shared_Skills": record["Shared_Skills"],
                    "Match_Count": record["Match_Count"]
                })
                
        return recommendations

# --- Main Execution ---
if __name__ == "__main__":
    recommender = GraphRecommender()
    
    try:
        # We created this exact student profile in our graph_builder script
        target_student = "J.A. Wickremathilaka"
        
        top_careers = recommender.get_career_recommendations(target_student)
        
        print("--- TOP CAREER RECOMMENDATIONS ---")
        if not top_careers:
            print("No matching career paths found in the graph.")
        else:
            for i, rec in enumerate(top_careers, 1):
                print(f"{i}. {rec['Career']}")
                print(f"   Graph Overlap: {rec['Match_Count']} connected skills")
                print(f"   Shared Foundational Skills: {rec['Shared_Skills']}")
                print("-" * 40)
                
    finally:
        recommender.close()
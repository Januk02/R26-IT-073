import os
import pandas as pd
import ast
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load the hidden passwords from the .env file in the root directory
load_dotenv('../../.env')

class KnowledgeGraphBuilder:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")
        
        print("Connecting to Neo4j AuraDB...")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        
    def close(self):
        self.driver.close()

    def build_industry_nodes(self, csv_path):
        """Reads the cleaned CSV and maps Career Paths to Skills."""
        print(f"Reading Industry Data from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        with self.driver.session() as session:
            for index, row in df.iterrows():
                # For Phase 1, our CSV only contains this one role
                career_title = "Software Engineer" 
                
                # Safely parse the array of skills
                skills_list = ast.literal_eval(row['Extracted_Skills']) if pd.notna(row['Extracted_Skills']) else []
                
                # 1. Create the Career Node
                session.execute_write(self._merge_career, career_title)
                
                # 2. Create the Skill Nodes and draw the relationship line
                for skill in skills_list:
                    session.execute_write(self._merge_skill_and_link, career_title, skill)
                    
        print("Industry Graph built successfully!")

    @staticmethod
    def _merge_career(tx, title):
        # Cypher: MERGE creates the node only if it doesn't already exist
        query = "MERGE (c:CareerPath {title: $title})"
        tx.run(query, title=title)

    @staticmethod
    def _merge_skill_and_link(tx, career_title, skill_name):
        # Cypher: Match the career, Create/Match the skill, Draw the REQUIRED_SKILL line
        query = """
        MATCH (c:CareerPath {title: $career_title})
        MERGE (s:Skill {name: $skill_name})
        MERGE (c)-[:REQUIRES_SKILL]->(s)
        """
        tx.run(query, career_title=career_title, skill_name=skill_name)

    def add_student_profile(self):
        """Creates the initial student and degree nodes for the Recommender testing."""
        print("Injecting Student Profile into the Graph...")
        with self.driver.session() as session:
            session.execute_write(self._merge_student)
        print("Student Profile added.")

    @staticmethod
    def _merge_student(tx):
        # Cypher: Let's create your specific profile to test the architecture
        query = """
        // 1. Establish the Degree
        MERGE (d:Degree {name: 'BSc Information Technology'})
        
        // 2. Create the Student User
        MERGE (st:Student {name: 'J.A. Wickremathilaka'})
        
        // 3. Link Student to Degree
        MERGE (st)-[:HOLDS_DEGREE]->(d)
        
        // 4. Give the student some baseline skills to start
        MERGE (s1:Skill {name: 'Java'})
        MERGE (s2:Skill {name: 'SQL'})
        MERGE (s3:Skill {name: 'React'})
        MERGE (st)-[:HAS_SKILL]->(s1)
        MERGE (st)-[:HAS_SKILL]->(s2)
        MERGE (st)-[:HAS_SKILL]->(s3)
        """
        tx.run(query)

# --- Main Execution ---
if __name__ == "__main__":
    builder = KnowledgeGraphBuilder()
    
    try:
        # 1. Build the Industry side of the graph
        builder.build_industry_nodes('../data/cleaned_software_engineer_jobs.csv')
        
        # 2. Build the Academic/Student side of the graph
        builder.add_student_profile()
        
    finally:
        builder.close()
        print("Database connection closed. Check your Neo4j Console!")
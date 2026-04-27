import os
import pandas as pd
import ast
from dotenv import load_dotenv
from neo4j import GraphDatabase

class KnowledgeGraphBuilder:
    def __init__(self):
        print("Initializing Neo4j Graph Builder...")
        
        # Load credentials from the .env file
        load_dotenv()
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USERNAME")
        self.password = os.getenv("NEO4J_PASSWORD")
        
        if not self.uri or not self.password:
            raise ValueError("⚠️ Missing Neo4j credentials! Please check your .env file.")
            
        # Initialize the Neo4j Driver
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        
    def close(self):
        self.driver.close()

    def build_graph_from_csv(self, csv_path):
        print(f"\nLoading cleaned data from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Open a session with the database
        with self.driver.session() as session:
            for index, row in df.iterrows():
                target_role = row['Target_Role']
                degree = row['Required_Degree']
                
                # The skills are saved as a string "['Python', 'AWS']" in the CSV. 
                # ast.literal_eval converts it back into a real Python list.
                try:
                    skills_list = ast.literal_eval(row['Extracted_Skills'])
                except (ValueError, SyntaxError):
                    skills_list = []
                
                # 1. Map the Degree Relationship
                if degree != "Not Specified / Equivalent Experience":
                    session.execute_write(self._merge_degree_logic, target_role, degree)
                    
                # 2. Map the Skill Relationships
                for skill in skills_list:
                    session.execute_write(self._merge_skill_logic, target_role, skill)
                    
            print(f"\n🎉 SUCCESS! {len(df)} job records successfully injected into the Knowledge Graph.")
            print("Open your Neo4j AuraDB console to view the visualization!")

    # --- Cypher Query Methods ---
    
    @staticmethod
    def _merge_degree_logic(tx, role_name, degree_name):
        """
        MERGE ensures we don't create duplicate nodes. 
        It creates the Target Role, creates the Degree, and links them.
        The weight counter increments every time we see this connection.
        """
        query = """
        MERGE (r:JobRole {name: $role_name})
        MERGE (d:Degree {name: $degree_name})
        MERGE (r)-[rel:REQUIRES_DEGREE]->(d)
        ON CREATE SET rel.weight = 1
        ON MATCH SET rel.weight = rel.weight + 1
        """
        tx.run(query, role_name=role_name, degree_name=degree_name)

    @staticmethod
    def _merge_skill_logic(tx, role_name, skill_name):
        """
        Creates the Role, creates the Skill, and links them.
        The weight counter tracks the actual market demand for this skill.
        """
        query = """
        MERGE (r:JobRole {name: $role_name})
        MERGE (s:Skill {name: $skill_name})
        MERGE (r)-[rel:REQUIRES_SKILL]->(s)
        ON CREATE SET rel.weight = 1
        ON MATCH SET rel.weight = rel.weight + 1
        """
        tx.run(query, role_name=role_name, skill_name=skill_name)


# --- Execution Entry Point ---
if __name__ == "__main__":
    builder = KnowledgeGraphBuilder()
    try:
        # Point to your finalized seed file
        csv_path = '../data/cleaned_multi_role_jobs.csv'
        builder.build_graph_from_csv(csv_path)
    finally:
        builder.close()
import os
import pandas as pd
import ast
import time  # NEW: Required for network throttling
from dotenv import load_dotenv
from neo4j import GraphDatabase

class KnowledgeGraphBuilder:
    def __init__(self):
        print("Initializing Enterprise Neo4j Graph Builder...")
        
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
        
        total_jobs = len(df)
        print(f"Beginning injection of {total_jobs} jobs. Throttling network to prevent socket drops...")
        
        # Open a session with the database
        with self.driver.session() as session:
            for index, row in df.iterrows():
                target_role = row['Target_Role']
                degree = row['Required_Degree']
                
                try:
                    skills_list = ast.literal_eval(row['Extracted_Skills'])
                except (ValueError, SyntaxError):
                    skills_list = []
                
                # 1. Map the Degree Relationship (with error handling & throttling)
                if degree != "Not Specified / Equivalent Experience":
                    try:
                        session.execute_write(self._merge_degree_logic, target_role, degree)
                        time.sleep(0.03) # Pause for 30 milliseconds
                    except Exception as e:
                        print(f"   ⚠️ Network blip while mapping Degree for {target_role}: {e}. Skipping...")
                    
                # 2. Map the Skill Relationships (with error handling & throttling)
                for skill in skills_list:
                    try:
                        session.execute_write(self._merge_skill_logic, target_role, skill)
                        time.sleep(0.03) # Pause for 30 milliseconds
                    except Exception as e:
                        print(f"   ⚠️ Network blip while mapping {skill} to {target_role}: {e}. Skipping...")
                        
                # Optional: Print a progress tracker every 25 jobs
                if (index + 1) % 25 == 0:
                    print(f"   -> Progress: {index + 1} / {total_jobs} jobs injected...")
                    
            print(f"\n🎉 SUCCESS! {total_jobs} job records securely injected into the Knowledge Graph.")
            print("Open your Neo4j AuraDB console to view the visualization!")

    # --- Cypher Query Methods ---
    
    @staticmethod
    def _merge_degree_logic(tx, role_name, degree_name):
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
        csv_path = '../data/cleaned_multi_role_jobs.csv'
        builder.build_graph_from_csv(csv_path)
    finally:
        builder.close()
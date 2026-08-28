import os
import pandas as pd
import ast
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
            raise ValueError("[WARNING] Missing Neo4j credentials! Please check your .env file.")
            
        # Initialize the Neo4j Driver with aggressive keep-alive settings
        # to prevent AuraDB from dropping the connection during heavy processing
        self.driver = GraphDatabase.driver(
            self.uri, 
            auth=(self.user, self.password),
            keep_alive=True,
            max_connection_lifetime=3600 # 1 hour
        )
        
    def close(self):
        self.driver.close()

    def build_graph_from_csv(self, csv_path, batch_size=500):
        if not os.path.exists(csv_path):
            print(f"[WARNING] Error: Path {csv_path} does not exist.")
            return

        print(f"\nLoading data from {csv_path}...")
        try:
            # fillna("") ensures we don't get NaN floats in empty text columns
            df = pd.read_csv(csv_path).fillna("") 
        except pd.errors.EmptyDataError:
            print("[INFO] The dataset is empty. No records to inject.")
            return
            
        total_jobs = len(df)
        if total_jobs == 0:
            print("[INFO] Zero records found. Skipping injection.")
            return
            
        print(f"Beginning batched injection of {total_jobs} jobs...")
        
        degree_batch = []
        skill_batch = []
        processed_count = 0
        
        with self.driver.session() as session:
            for index, row in df.iterrows():
                target_role = row['Target_Role']
                degree = row['Required_Degree']
                
                # Parse the stringified list securely
                try:
                    skills_list = ast.literal_eval(row['Extracted_Skills'])
                    if not isinstance(skills_list, list):
                        skills_list = []
                except (ValueError, SyntaxError):
                    skills_list = []
                
                # 1. Queue Degree Relationships
                if degree and degree != "Not Specified / Equivalent Experience":
                    degree_batch.append({"role": target_role, "degree": degree})
                    
                # 2. Queue Skill Relationships
                for skill in skills_list:
                    if skill: # Skip empty strings
                        skill_batch.append({"role": target_role, "skill": skill})
                
                processed_count += 1
                
                # If we hit the batch limit OR the very last row, execute the batches
                if len(degree_batch) >= batch_size or len(skill_batch) >= batch_size or processed_count == total_jobs:
                    
                    if degree_batch:
                        session.execute_write(self._batch_merge_degrees, degree_batch)
                        degree_batch = [] # Reset the list memory
                    
                    if skill_batch:
                        session.execute_write(self._batch_merge_skills, skill_batch)
                        skill_batch = [] # Reset the list memory
                        
                    print(f"   -> Progress: {processed_count} / {total_jobs} jobs injected...")
                    
            print(f"\n[OK] SUCCESS! {total_jobs} job records rapidly injected using batching.")
            print("Open your Neo4j AuraDB console to view the visualization!")

    # --- Batched Cypher Query Methods ---
    
    @staticmethod
    def _batch_merge_degrees(tx, batch_data):
        query = """
        UNWIND $batch_data AS row
        MERGE (r:JobRole {name: row.role})
        MERGE (d:Degree {name: row.degree})
        MERGE (r)-[rel:REQUIRES_DEGREE]->(d)
        ON CREATE SET rel.weight = 1
        ON MATCH SET rel.weight = rel.weight + 1
        """
        tx.run(query, batch_data=batch_data)

    @staticmethod
    def _batch_merge_skills(tx, batch_data):
        query = """
        UNWIND $batch_data AS row
        MERGE (r:JobRole {name: row.role})
        MERGE (s:Skill {name: row.skill})
        MERGE (r)-[rel:REQUIRES_SKILL]->(s)
        ON CREATE SET rel.weight = 1
        ON MATCH SET rel.weight = rel.weight + 1
        """
        tx.run(query, batch_data=batch_data)

# --- Execution Entry Point ---
if __name__ == "__main__":
    builder = KnowledgeGraphBuilder()
    try:
        # Swapped to the primary CSV file as requested
        csv_path = '../data/cleaned_multi_role_jobs.csv'
        # batch_size=500 is a safe "sweet spot" for Neo4j Aura cloud instances
        builder.build_graph_from_csv(csv_path, batch_size=500) 
    except Exception as e:
        print(f"\n[CRITICAL ERROR] Execution stopped: {e}")
    finally:
        builder.close()
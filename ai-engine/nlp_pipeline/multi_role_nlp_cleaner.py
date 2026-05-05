import pandas as pd
import spacy
import re
import os
import glob # NEW: For automatically finding all raw files

class AdvancedNLPCleaner:
    def __init__(self):
        print("Initializing Master NLP Engine...")
        
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model (en_core_web_sm)...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
            
        # ---------------------------------------------------------
        # THE EXPANDED ENTERPRISE IT SKILL DICTIONARY
        # ---------------------------------------------------------
        self.skill_dictionary = [
            # Programming & Scripting
            'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Go', 'Golang', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala',
            # Frontend & UI
            'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Tailwind', 'Figma', 'React Native', 'Flutter',
            # Databases & Storage
            'SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Oracle', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
            # Cloud & Infrastructure (Expanded for Cloud Architect)
            'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Bash', 'Shell Scripting', 'Ansible', 'VMware',
            # Data Engineering (NEW)
            'Hadoop', 'Spark', 'Kafka', 'ETL', 'Airflow', 'Snowflake', 'BigQuery', 'Databricks',
            # CI/CD & Version Control
            'CI/CD', 'Jenkins', 'Git', 'GitHub', 'Bitbucket', 'GitLab', 'CircleCI',
            # QA & Testing
            'QA', 'Manual Testing', 'Automation', 'Selenium', 'Cypress', 'Appium', 'JMeter', 'Postman', 'JUnit', 'TestNG',
            # Data Science & Machine Learning (Expanded for ML Engineer)
            'Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Keras', 'NLP', 'Computer Vision',
            'Tableau', 'PowerBI', 'Data Warehousing', 'Data Analytics', 'Excel',
            # Architecture & Methodologies (Expanded for IT Project Manager)
            'Agile', 'Scrum', 'Jira', 'Kanban', 'Confluence', 'REST API', 'GraphQL', 'Microservices', 'System Design', 'PMP',
            # Security & IT Admin (Expanded for SysAdmin)
            'Cybersecurity', 'Penetration Testing', 'Firewalls', 'Security', 'Active Directory', 'Networking', 'TCP/IP', 'DNS', 'VPN'
        ]
        
        self.skill_dictionary_lower = [skill.lower() for skill in self.skill_dictionary]

    def extract_advanced_degree(self, text):
        text = str(text).replace('\n', ' ')
        pattern = r'(?i)\b(bachelor\'?s?|b\.?sc|master\'?s?|m\.?sc|phd|degree)\b.{0,15}?(?:in|of)\s+([a-zA-Z\s]{3,40}?)(?:,|\.|and|\bor\b|with|for|[0-9]|\-)'
        match = re.search(pattern, text)
        
        if match:
            deg_type = match.group(1).strip().title()
            field = match.group(2).strip().title()
            deg_type = deg_type.replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            
            if len(field.split()) <= 6:
                return f"{deg_type} in {field}"
                
        fallback_pattern = r'(?i)\b(bachelor\'?s?|bsc|master\'?s?|msc|phd)\b'
        fallback = re.search(fallback_pattern, text)
        if fallback:
            deg = fallback.group(1).title().replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            return f"{deg} (Field Unspecified)"
            
        return "Not Specified / Equivalent Experience"

    def extract_skills(self, text):
        extracted = set() 
        text_lower = str(text).lower()
        
        for skill, skill_lower in zip(self.skill_dictionary, self.skill_dictionary_lower):
            if skill_lower in text_lower:
                if len(skill_lower) <= 3: 
                    if re.search(rf'\b{re.escape(skill_lower)}\b', text_lower):
                        extracted.add(skill)
                else:
                    extracted.add(skill)
                    
        return list(extracted)

    def run_pipeline(self, raw_data_folder, output_csv_path):
        print(f"\n[1/4] Scanning for raw datasets in {raw_data_folder}...")
        
        # NEW: Automatically find all CSV files in the raw folder
        all_files = glob.glob(os.path.join(raw_data_folder, "*.csv"))
        
        if not all_files:
            print(f"ERROR: No CSV files found in {raw_data_folder}.")
            return
            
        print(f"      Found {len(all_files)} raw batches. Merging...")
        dataframes = [pd.read_csv(path) for path in all_files]
        master_df = pd.concat(dataframes, ignore_index=True)
        print(f"      Initial job count: {len(master_df)}")
        
        print("\n[2/4] Executing ELT Deduplication Protocol...")
        # NEW: Drop duplicate jobs based on their exact URL
        original_count = len(master_df)
        master_df = master_df.drop_duplicates(subset=['Job URL'], keep='last')
        dupes_removed = original_count - len(master_df)
        print(f"      Removed {dupes_removed} duplicate job postings.")
        print(f"      Final unique jobs to process: {len(master_df)}")
        
        print("\n[3/4] Running Deep NLP Extraction (Degrees & Skills)...")
        master_df['Required_Degree'] = master_df['Description'].apply(self.extract_advanced_degree)
        master_df['Extracted_Skills'] = master_df['Description'].apply(self.extract_skills)
        
        # Filter out jobs where the NLP engine couldn't find ANY skills (corrupted data)
        master_df = master_df[master_df['Extracted_Skills'].map(len) > 0]
        
        clean_df = master_df[['Target_Role', 'Job Title', 'Company', 'Job URL', 'Required_Degree', 'Extracted_Skills']]
        
        print(f"\n[4/4] Saving final processed dataset...")
        clean_df.to_csv(output_csv_path, index=False)
        print(f"      🎉 SUCCESS! Enterprise dataset saved to: {output_csv_path}")
        print(f"      Total validated, skill-rich records ready for Graph DB: {len(clean_df)}")

# --- Execution Entry Point ---
if __name__ == "__main__":
    cleaner = AdvancedNLPCleaner()
    
    # Point it to your folders!
    raw_folder = '../data/raw'
    output = '../data/cleaned_multi_role_jobs.csv'
    
    cleaner.run_pipeline(raw_folder, output)
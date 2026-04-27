import pandas as pd
import spacy
import re
import os

class AdvancedNLPCleaner:
    def __init__(self):
        print("Initializing NLP Engine...")
        
        # Load the core English NLP model for tokenization
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model (en_core_web_sm)...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
            
        # ---------------------------------------------------------
        # THE UNIVERSAL IT SKILL DICTIONARY
        # ---------------------------------------------------------
        self.skill_dictionary = [
            # Programming & Scripting
            'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Go', 'Golang', 'Ruby', 'PHP',
            # Frontend & UI
            'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Tailwind',
            # Databases & Storage
            'SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Oracle', 'Redis', 'Elasticsearch',
            # Cloud & Infrastructure
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Bash', 'Shell Scripting',
            # CI/CD & Version Control
            'CI/CD', 'Jenkins', 'Git', 'GitHub', 'Bitbucket', 'GitLab',
            # QA & Testing
            'QA', 'Manual Testing', 'Automation', 'Selenium', 'Cypress', 'Appium', 'JMeter', 'Postman', 'JUnit',
            # Data Science & Machine Learning
            'Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-Learn',
            'Tableau', 'PowerBI', 'Data Warehousing', 'Data Analytics', 'Excel',
            # Architecture & Methodologies
            'Agile', 'Scrum', 'Jira', 'REST API', 'GraphQL', 'Microservices',
            # Security & Analysis
            'Cybersecurity', 'Penetration Testing', 'Firewalls', 'Security', 'Business Analysis', 'UML', 'Visio'
        ]
        
        # Create a lowercase mapping for rapid, case-insensitive text searching
        self.skill_dictionary_lower = [skill.lower() for skill in self.skill_dictionary]

    def extract_advanced_degree(self, text):
        """
        Uses dynamic Regular Expressions to capture both the degree tier (e.g., BSc) 
        and the specific academic field (e.g., Computer Science).
        """
        # Clean the text to ensure consistent regex parsing
        text = str(text).replace('\n', ' ')
        
        # Regex Pattern Explanation:
        # (?i) -> Case insensitive
        # \b(bachelor...)\b -> Matches the exact degree boundary
        # .{0,15}?(?:in|of) -> Looks ahead up to 15 characters for 'in' or 'of'
        # \s+([a-zA-Z\s]{3,40}?) -> Captures the actual field of study (3 to 40 chars)
        # (?:,|\.|and|\bor\b|with|for|[0-9]|\-) -> Stop capturing when hitting punctuation or transition words
        pattern = r'(?i)\b(bachelor\'?s?|b\.?sc|master\'?s?|m\.?sc|phd|degree)\b.{0,15}?(?:in|of)\s+([a-zA-Z\s]{3,40}?)(?:,|\.|and|\bor\b|with|for|[0-9]|\-)'
        match = re.search(pattern, text)
        
        if match:
            # Format the raw match into standard academic casing
            deg_type = match.group(1).strip().title()
            field = match.group(2).strip().title()
            
            # Normalize common messy abbreviations
            deg_type = deg_type.replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            
            # Prevent the regex from accidentally capturing a massive run-on sentence
            if len(field.split()) <= 6:
                return f"{deg_type} in {field}"
                
        # Phase 2 Fallback: If the job says "Requires a BSc" but doesn't mention the field
        fallback_pattern = r'(?i)\b(bachelor\'?s?|bsc|master\'?s?|msc|phd)\b'
        fallback = re.search(fallback_pattern, text)
        if fallback:
            deg = fallback.group(1).title().replace("Bsc", "BSc").replace("Msc", "MSc").replace("Bachelor'S", "Bachelor's")
            return f"{deg} (Field Unspecified)"
            
        # Default state if no academic keywords exist in the job description
        return "Not Specified / Equivalent Experience"

    def extract_skills(self, text):
        """
        Scans the text using the Universal Dictionary, employing strict word boundaries 
        to prevent false positive matches (e.g., matching 'go' inside the word 'good').
        """
        extracted = set() # Using a Set automatically prevents duplicate skills
        text_lower = str(text).lower()
        
        for skill, skill_lower in zip(self.skill_dictionary, self.skill_dictionary_lower):
            if skill_lower in text_lower:
                # Extra validation for short tech acronyms (e.g., QA, Go, C++)
                if len(skill_lower) <= 3: 
                    # \b ensures we only match whole words
                    if re.search(rf'\b{re.escape(skill_lower)}\b', text_lower):
                        extracted.add(skill)
                else:
                    extracted.add(skill)
                    
        # Return as a clean Python list for the CSV output
        return list(extracted)

    def run_pipeline(self, input_csv_paths, output_csv_path):
        print(f"\n[1/3] Merging raw datasets...")
        
        # Safely read and combine only files that actually exist in the directory
        dataframes = [pd.read_csv(path) for path in input_csv_paths if os.path.exists(path)]
        if not dataframes:
            print("ERROR: No raw CSV files found. Run the web scraper first.")
            return
            
        master_df = pd.concat(dataframes, ignore_index=True)
        print(f"      Successfully loaded {len(master_df)} raw job descriptions.")
        
        print("\n[2/3] Running NLP Extraction (Degrees & Skills)...")
        master_df['Required_Degree'] = master_df['Description'].apply(self.extract_advanced_degree)
        master_df['Extracted_Skills'] = master_df['Description'].apply(self.extract_skills)
        
        # Filter down to just the columns needed for the Knowledge Graph integration
        clean_df = master_df[['Target_Role', 'Job Title', 'Company', 'Job URL', 'Required_Degree', 'Extracted_Skills']]
        
        print(f"\n[3/3] Saving final processed dataset...")
        clean_df.to_csv(output_csv_path, index=False)
        print(f"      🎉 SUCCESS! Cleaned dataset saved to: {output_csv_path}")
        print(f"      Total validated records ready for Graph DB: {len(clean_df)}")
        
        # Display a terminal preview to verify extraction logic
        print("\n================== DATA PREVIEW ==================")
        preview = clean_df[clean_df['Required_Degree'] != "Not Specified / Equivalent Experience"]
        print(preview[['Target_Role', 'Required_Degree']].head(10).to_string(index=False))
        print("==================================================")

# --- Execution Entry Point ---
if __name__ == "__main__":
    cleaner = AdvancedNLPCleaner()
    
    # Map the exact locations of your scraped data files
    inputs = [
        '../data/raw_multi_role_jobs.csv',
        '../data/raw_multi_role_jobs_2.csv'
    ]
    
    output = '../data/cleaned_multi_role_jobs.csv'
    
    # Trigger the pipeline
    cleaner.run_pipeline(inputs, output)
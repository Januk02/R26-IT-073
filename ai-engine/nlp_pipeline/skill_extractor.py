import pandas as pd
import spacy
from spacy.matcher import PhraseMatcher

print("Loading spaCy English model...")
nlp = spacy.load("en_core_web_sm")

# Initialize the PhraseMatcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# The seed for our Dynamic Skills Ontology
tech_skills = [
    "React", "Golang", "Go", "PostgreSQL", "Next.js", "LLMs", 
    "LangChain", "RAG", "Docker", "CI/CD", "Kafka", "RabbitMQ", 
    "DevOps", "Blockchain", "Web3", "Python", "Java", "SQL", "Shell Scripting"
]

patterns = [nlp.make_doc(text) for text in tech_skills]
matcher.add("TECH_SKILL", patterns)

def extract_exact_skills(text):
    if pd.isna(text) or text == 'N/A':
        return []
        
    doc = nlp(text)
    matches = matcher(doc)
    
    skills = []
    for match_id, start, end in matches:
        skills.append(doc[start:end].text)
        
    return list(set(skills))

# --- Main Execution ---
if __name__ == "__main__":
    print("Reading raw scraped data...")
    try:
        # Load the raw data
        df = pd.read_csv('../data/detailed_software_engineer_jobs.csv')
        
        print("Processing descriptions through the NLP pipeline. This might take a few seconds...")
        
        # Apply the NLP extraction to the Description column and create a new column
        df['Extracted_Skills'] = df['Description'].apply(extract_exact_skills)
        
        # Create a clean dataframe: We keep the essential metadata and the clean skills,
        # but we can drop the massive 'Description' wall of text to keep the file lightweight.
        df_clean = df[['Job Title', 'Company', 'Job URL', 'Extracted_Skills']]
        
        # Save the final, clean dataset
        save_path = '../data/cleaned_software_engineer_jobs.csv'
        df_clean.to_csv(save_path, index=False)
        
        print(f"\nSuccess! The Adaptive Career Pathway data pipeline is complete.")
        print(f"Cleaned data saved to: {save_path}\n")
        
        print("--- Preview of Final Data ---")
        # Print a quick preview of the URLs and the clean arrays of skills
        print(df_clean[['Job URL', 'Extracted_Skills']].head())
        
    except FileNotFoundError:
        print("Error: Could not find the CSV file. Make sure you are running this from inside the nlp_pipeline folder!")
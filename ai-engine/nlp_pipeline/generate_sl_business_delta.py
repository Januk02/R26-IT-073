import os
import pandas as pd
import random

# Define the new Business and Tech-Management target roles for the Sri Lankan Market
new_roles_data = {

    "Agile Coach": {
        "skills": ["Agile", "Scrum", "Kanban", "Coaching", "SAFe", "Jira", "Transformation"],
        "degrees": ["BSc from a UGC recognized university", "Master's in Business Administration (MBA)", "Agile Coach Certification"]
    },

    "Digital Marketing Manager": {
        "skills": ["Digital Marketing", "SEO", "Google Analytics", "Social Media Management", "Content Strategy", "SEM", "Marketing Automation"],
        "degrees": ["BSc in Marketing", "CIM / SLIM Qualified", "Bachelor's in Business Administration"]
    },
    "Financial Analyst": {
        "skills": ["Financial Modeling", "Excel", "Data Analysis", "Forecasting", "SQL", "Risk Management", "Reporting"],
        "degrees": ["BSc in Finance", "CIMA/ACCA/CA Qualified", "BSc in Business Administration"]
    },
    "FinTech Analyst": {
        "skills": ["FinTech", "Data Analysis", "SQL", "Excel", "Blockchain", "Risk Management", "Financial Modeling"],
        "degrees": ["BSc in Finance", "BSc in Computer Science", "CIMA/ACCA/CA Qualified"]
    },
    "HR Information Systems Analyst": {
        "skills": ["HRIS", "Workday", "Data Analysis", "Reporting", "Excel", "System Administration", "Stakeholder Management"],
        "degrees": ["BSc in Human Resources", "BSc from a UGC recognized university", "Master's in Business Administration (MBA)"]
    },
    "Tech Recruiter": {
        "skills": ["Sourcing", "Technical Screening", "Stakeholder Management", "LinkedIn Recruiter", "Negotiation", "ATS", "HR"],
        "degrees": ["BSc in Human Resources", "BSc in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "Sales Engineer": {
        "skills": ["Pre-Sales", "Technical Presentations", "Solution Selling", "B2B Sales", "Stakeholder Management", "Cloud Architecture"],
        "degrees": ["BSc in Computer Science", "BSc in Software Engineering", "SLIIT/IIT/UCSC Alumni"]
    },
    "Supply Chain Analyst": {
        "skills": ["Supply Chain Management", "Data Analysis", "Excel", "Logistics", "SAP", "Forecasting", "Inventory Management"],
        "degrees": ["BSc in Logistics", "BSc in Business Administration", "CILT Qualified"]
    },
    "E-Commerce Manager": {
        "skills": ["E-Commerce", "Digital Marketing", "SEO", "Shopify", "Data Analysis", "Magento", "Conversion Rate Optimization"],
        "degrees": ["BSc in Business Administration", "BSc in Marketing", "Not Specified / Equivalent Experience"]
    },
    "Customer Success Manager": {
        "skills": ["Customer Success", "Account Management", "Stakeholder Management", "Onboarding", "CRM", "Salesforce", "Churn Reduction"],
        "degrees": ["BSc from a UGC recognized university", "BSc in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "Operations Analyst": {
        "skills": ["Data Analysis", "Excel", "Process Improvement", "Reporting", "SQL", "Operations Management", "Tableau"],
        "degrees": ["BSc in Business Administration", "BSc in Operations Management", "Master's in Business Administration (MBA)"]
    },
    "Risk Management Analyst": {
        "skills": ["Risk Assessment", "Compliance", "Data Analysis", "Excel", "Reporting", "Auditing", "Financial Modeling"],
        "degrees": ["BSc in Finance", "CIMA/ACCA/CA Qualified", "BSc in Business Administration"]
    },

    "Business Systems Analyst": {
        "skills": ["Requirements Gathering", "UML", "Agile", "SQL", "System Design", "Jira", "Process Mapping"],
        "degrees": ["BSc in Information Systems", "SLIIT/IIT/UCSC Alumni", "BSc in Business Administration"]
    },
    "CRM Developer": {
        "skills": ["Salesforce", "CRM", "Apex", "Integration", "REST API", "JavaScript", "HTML"],
        "degrees": ["BSc in Computer Science", "BSc in Information Technology", "SLIIT/IIT/UCSC Alumni"]
    },
    "Data Strategist": {
        "skills": ["Data Strategy", "Data Governance", "Business Intelligence", "Stakeholder Management", "Data Analytics", "Roadmapping"],
        "degrees": ["Master's in Data Analytics", "Master's in Business Administration (MBA)", "BSc in Data Science"]
    },
    "Digital Transformation Consultant": {
        "skills": ["Digital Transformation", "Change Management", "Strategy", "Cloud Computing", "Stakeholder Management", "Process Improvement"],
        "degrees": ["Master's in Business Administration (MBA)", "BSc in Information Technology", "BSc in Business Administration"]
    }
}

# Top Sri Lankan tech and corporate companies
companies = [
    "WSO2", "Sysco LABS", "Virtusa", "Dialog Axiata", "IFS", 
    "Pearson Lanka", "MillenniumIT ESP", "99x", "LSEG", "Creative Software", 
    "Brandix", "MAS Holdings", "John Keells IT", "CodeGen", "Axiata Digital Labs",
    "Mitra Innovation", "Zone24x7", "HCL Tech Sri Lanka", "Softlogic", "Hayleys"
]

# Title prefixes/suffixes for variability
titles_template = [
    "Senior {} Specialist",
    "Lead {} Engineer",
    "Junior {} Associate",
    "{} Consultant",
    "{} Executive",
    "Enterprise {} Architect",
    "Principal {} Developer",
    "{} Analyst"
]

def generate_delta_dataset(output_path):
    print("Generating Sri Lankan Business-focused delta dataset...")
    records = []
    
    for role, info in new_roles_data.items():
        role_skills = info["skills"]
        role_degrees = info["degrees"]
        
        # Generating 50 records per role = 1000 records total
        for i in range(50):
            title_pattern = random.choice(titles_template)
            job_title = title_pattern.format(role)
            
            company = random.choice(companies)
            
            # Select a degree
            if random.random() < 0.15:
                degree = "Not Specified / Equivalent Experience"
            else:
                degree = random.choice(role_degrees)
            
            job_url = f"https://rooster.jobs/jobs/{role.lower().replace(' ', '-')}-specialist-{random.randint(100000, 999999)}"
            
            num_skills = random.randint(min(4, len(role_skills)), min(7, len(role_skills)))
            selected_skills = random.sample(role_skills, num_skills)
            
            records.append({
                "Target_Role": role,
                "Job Title": job_title,
                "Company": company,
                "Job URL": job_url,
                "Required_Degree": degree,
                "Extracted_Skills": str(selected_skills)
            })
            
    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[OK] Generated {len(df)} records across {len(new_roles_data)} new Sri Lankan Business roles and saved to {output_path}")

if __name__ == "__main__":
    delta_path = "../data/delta_new_jobs.csv"
    master_path = "../data/cleaned_multi_role_jobs.csv"
    
    generate_delta_dataset(delta_path)
    
    if os.path.exists(delta_path) and os.path.exists(master_path):
        delta_df = pd.read_csv(delta_path)
        master_df = pd.read_csv(master_path)
        combined_df = pd.concat([master_df, delta_df], ignore_index=True)
        combined_df = combined_df.drop_duplicates(subset=['Job URL'], keep='last')
        combined_df.to_csv(master_path, index=False)
        print(f"[OK] Successfully appended delta to master dataset: {master_path} (New total: {len(combined_df)} records)")
    else:
        print("[WARNING] Could not append because master or delta file is missing.")

import os
import pandas as pd
import random

# Define the NEW popular Business roles for the Sri Lankan Market
new_roles_data = {
    "Business Development Manager": {
        "skills": ["B2B Sales", "Lead Generation", "CRM", "Negotiation", "Market Research", "Stakeholder Management", "Sales Strategy"],
        "degrees": ["Master's in Business Administration (MBA)", "BSc in Business Administration", "CIM / SLIM Qualified"]
    },
    "Marketing Executive": {
        "skills": ["Digital Marketing", "Social Media Management", "Content Creation", "SEO", "Event Management", "Market Research", "Campaign Management"],
        "degrees": ["BSc in Marketing", "CIM / SLIM Qualified", "Not Specified / Equivalent Experience"]
    },
    "Management Accountant": {
        "skills": ["Financial Reporting", "Budgeting", "Cost Analysis", "Excel", "Forecasting", "Variance Analysis", "ERP"],
        "degrees": ["CIMA/ACCA/CA Qualified", "BSc in Finance", "Master's in Business Administration (MBA)"]
    },
    "Investment Analyst": {
        "skills": ["Financial Modeling", "Valuation", "Equity Research", "Excel", "Data Analysis", "Bloomberg", "Risk Management"],
        "degrees": ["CFA Charterholder", "BSc in Finance", "CIMA/ACCA/CA Qualified"]
    },
    "Financial Controller": {
        "skills": ["Financial Reporting", "Auditing", "Compliance", "Taxation", "ERP", "Leadership", "Budgeting"],
        "degrees": ["CIMA/ACCA/CA Qualified", "BSc in Finance", "Master's in Business Administration (MBA)"]
    },
    "Operations Manager": {
        "skills": ["Operations Management", "Process Improvement", "Supply Chain Management", "Leadership", "Budgeting", "Lean Six Sigma", "Stakeholder Management"],
        "degrees": ["BSc in Operations Management", "Master's in Business Administration (MBA)", "BSc in Business Administration"]
    },
    "Brand Manager": {
        "skills": ["Brand Strategy", "Market Research", "Campaign Management", "Advertising", "Product Launch", "Public Relations", "Digital Marketing"],
        "degrees": ["BSc in Marketing", "CIM / SLIM Qualified", "Master's in Business Administration (MBA)"]
    },
    "Talent Acquisition Specialist": {
        "skills": ["Sourcing", "Interviewing", "ATS", "Employer Branding", "Negotiation", "HR", "LinkedIn Recruiter"],
        "degrees": ["BSc in Human Resources", "BSc in Business Administration", "Not Specified / Equivalent Experience"]
    }
}

# Top Sri Lankan tech and corporate companies
companies = [
    "WSO2", "Sysco LABS", "Virtusa", "Dialog Axiata", "IFS", 
    "Pearson Lanka", "MillenniumIT ESP", "99x", "LSEG", "Creative Software", 
    "Brandix", "MAS Holdings", "John Keells IT", "CodeGen", "Axiata Digital Labs",
    "Mitra Innovation", "Zone24x7", "HCL Tech Sri Lanka", "Softlogic", "Hayleys",
    "Hemas", "Cargills", "Commercial Bank", "HNB", "Sampath Bank"
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
    "{} Analyst",
    "Associate {}"
]

def generate_delta_dataset(output_path):
    print("Generating Sri Lankan Business-focused delta dataset (V2 - Core Corporate)...")
    records = []
    
    for role, info in new_roles_data.items():
        role_skills = info["skills"]
        role_degrees = info["degrees"]
        
        # Generating 50 records per role = 400 records total
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

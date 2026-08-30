import os
import pandas as pd
import random
import json

# Define the 67 new target roles and their relevant skills and degrees
new_roles_data = {
    "DevSecOps Engineer": {
        "skills": ["Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "Git", "Cybersecurity", "AWS", "Azure", "Python"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Systems Administrator": {
        "skills": ["Linux", "Windows Server", "Active Directory", "Networking", "DNS", "VPN", "Bash", "Shell Scripting", "Troubleshooting", "VMware"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "Network Security Engineer": {
        "skills": ["Firewalls", "Cybersecurity", "Networking", "VPN", "TCP/IP", "DNS", "Routing", "Switching", "Active Directory"],
        "degrees": ["Bachelor's in Cyber Security", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "Data Warehouse Architect": {
        "skills": ["SQL", "Data Warehousing", "ETL", "Snowflake", "BigQuery", "Redshift", "Data Modeling", "Databricks", "Oracle"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Master's in Data Analytics"]
    },
    "Business Intelligence Analyst": {
        "skills": ["Power BI", "Tableau", "SQL", "Data Analytics", "Reporting", "Excel", "Data Visualization", "Looker"],
        "degrees": ["Bachelor's in Business Administration", "Bachelor's in Data Science", "Bachelor's in Information Technology"]
    },
    "Application Security Engineer": {
        "skills": ["Cybersecurity", "Penetration Testing", "OWASP", "Git", "REST API", "OAuth", "JSON", "Python", "Java", "JavaScript"],
        "degrees": ["Bachelor's in Cyber Security", "Bachelor's in Computer Science", "Bachelor's in Software Engineering"]
    },
    "IT Support Specialist": {
        "skills": ["Troubleshooting", "Active Directory", "Windows Server", "Networking", "DNS", "VPN", "Documentation", "Linux"],
        "degrees": ["Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Network Administrator": {
        "skills": ["Networking", "TCP/IP", "DNS", "Routing", "Switching", "Firewalls", "Troubleshooting", "VPN"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "Systems Engineer": {
        "skills": ["Linux", "Bash", "Shell Scripting", "Docker", "AWS", "System Design", "High Availability", "VMware", "Networking"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Technical Product Manager": {
        "skills": ["Agile", "Scrum", "Jira", "Stakeholder Management", "Requirements Gathering", "System Design", "Documentation"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Business Administration", "Master's in Business Administration"]
    },
    "IT Infrastructure Manager": {
        "skills": ["ITIL", "Disaster Recovery", "Networking", "Windows Server", "VMware", "Project Management", "SLA Management", "Troubleshooting"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Computer Science", "Master's in Business Administration"]
    },
    "Systems Integrator": {
        "skills": ["REST API", "SOAP", "JSON", "XML", "WSO2", "MuleSoft", "Apigee", "API Gateway", "OAuth", "GraphQL"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Cloud Operations Engineer": {
        "skills": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Prometheus", "Grafana", "Linux", "Bash"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "NOC Technician": {
        "skills": ["Monitoring", "Alerting", "Networking", "Troubleshooting", "TCP/IP", "VPN", "SLA Management", "Incident Management"],
        "degrees": ["Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "SOC Analyst": {
        "skills": ["Splunk", "SIEM", "Cybersecurity", "Incident Response", "Firewalls", "Linux", "Wireshark", "Nmap"],
        "degrees": ["Bachelor's in Cyber Security", "Bachelor's in Information Technology", "Bachelor's in Computer Science"]
    },
    "Data Privacy Officer": {
        "skills": ["GDPR", "Compliance", "ISO 27001", "Risk Assessment", "Auditing", "Data Governance", "Documentation"],
        "degrees": ["Bachelor's in Business Administration", "Not Specified / Equivalent Experience", "Master's in Information Security"]
    },
    "IAM Engineer": {
        "skills": ["IAM", "Active Directory", "OAuth", "Cybersecurity", "Linux", "Azure", "AWS", "System Design"],
        "degrees": ["Bachelor's in Cyber Security", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "IaC Specialist": {
        "skills": ["Terraform", "Ansible", "Git", "Docker", "AWS", "Azure", "Bash", "Python", "Kubernetes"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Release Manager": {
        "skills": ["CI/CD", "Git", "Jenkins", "Jira", "Agile", "Scrum", "Docker", "Linux"],
        "degrees": ["Bachelor's in Software Engineering", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "Linux Systems Administrator": {
        "skills": ["Linux", "Bash", "Shell Scripting", "Troubleshooting", "DNS", "Active Directory", "Docker", "Ansible", "Networking"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Windows Systems Administrator": {
        "skills": ["Windows Server", "Active Directory", "Troubleshooting", "DNS", "Networking", "VMware", "IIS", "Security"],
        "degrees": ["Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Storage Administrator": {
        "skills": ["SAN", "NAS", "Backup & Recovery", "Disaster Recovery", "Linux", "Windows Server", "Troubleshooting", "VMware"],
        "degrees": ["Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Backup Administrator": {
        "skills": ["Veeam", "Backup & Recovery", "Disaster Recovery", "Storage", "Windows Server", "Linux", "VMware", "Troubleshooting"],
        "degrees": ["Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Virtualization Engineer": {
        "skills": ["VMware", "Linux", "Windows Server", "Networking", "Storage", "Troubleshooting", "Docker", "Kubernetes"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "IT Asset Manager": {
        "skills": ["Compliance", "Excel", "Reporting", "Documentation", "Project Management", "ITIL", "Risk Assessment"],
        "degrees": ["Bachelor's in Business Administration", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "IT Procurement Specialist": {
        "skills": ["Procurement", "Excel", "Reporting", "Negotiation", "Project Management", "Documentation"],
        "degrees": ["Bachelor's in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "Disaster Recovery Specialist": {
        "skills": ["Disaster Recovery", "Backup & Recovery", "Risk Assessment", "Planning", "Testing", "Documentation", "Windows Server", "Linux"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "Business Continuity Manager": {
        "skills": ["Business Continuity", "Disaster Recovery", "Risk Assessment", "Incident Management", "Planning", "Documentation"],
        "degrees": ["Bachelor's in Business Administration", "Bachelor's in Information Technology", "Master's in Business Administration"]
    },
    "Tech Support Engineer": {
        "skills": ["Troubleshooting", "Linux", "Windows Server", "SQL", "REST API", "Documentation", "Networking", "Active Directory"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "SAP Functional Consultant": {
        "skills": ["SAP", "SAP HANA", "Requirements Gathering", "Testing", "Documentation", "Agile", "Excel"],
        "degrees": ["Bachelor's in Business Administration", "Bachelor's in Information Technology", "Master's in Business Administration"]
    },
    "Oracle DBA": {
        "skills": ["Oracle", "SQL", "Database Administration", "Performance Tuning", "Backup & Recovery", "Linux", "NoSQL"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Master's in Computer Science"]
    },
    "SQL Server DBA": {
        "skills": ["SQL", "Database Administration", "SSIS", "Performance Tuning", "Windows Server", "Backup & Recovery", "NoSQL"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Mainframe System Programmer": {
        "skills": ["JCL", "CICS", "DB2", "COBOL", "Troubleshooting", "Mainframe", "IBM MQ"],
        "degrees": ["Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "AS400 Developer": {
        "skills": ["DB2", "SQL", "COBOL", "Mainframe", "Troubleshooting", "Systems Analysis"],
        "degrees": ["Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "GIS Analyst": {
        "skills": ["GIS", "ArcGIS", "QGIS", "Python", "Data Analysis", "Database Administration", "SQL"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Web Designer": {
        "skills": ["Figma", "HTML", "CSS", "Tailwind", "React", "JavaScript", "UX Design"],
        "degrees": ["Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "Interaction Designer": {
        "skills": ["Figma", "UX Design", "User Research", "Prototyping", "Wireframing", "React"],
        "degrees": ["Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "User Researcher": {
        "skills": ["User Research", "Data Analysis", "UX Design", "Figma", "Reporting", "Documentation"],
        "degrees": ["Bachelor's in Business Administration", "Bachelor's in Computer Science", "Not Specified / Equivalent Experience"]
    },
    "Information Architect": {
        "skills": ["Figma", "UX Design", "Content Management", "System Design", "Documentation"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Content Strategist": {
        "skills": ["Content Management", "SEO", "Editing", "Data Analysis", "Reporting"],
        "degrees": ["Bachelor's in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "SEO Specialist": {
        "skills": ["SEO", "Data Analysis", "HTML", "CSS", "Reporting", "Excel"],
        "degrees": ["Bachelor's in Information Technology", "Bachelor's in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "Digital Marketing Specialist": {
        "skills": ["Digital Marketing", "SEO", "Data Analysis", "Reporting", "Excel", "Documentation"],
        "degrees": ["Bachelor's in Business Administration", "Not Specified / Equivalent Experience"]
    },
    "Data Governance Specialist": {
        "skills": ["Data Governance", "Data Quality", "Metadata Management", "Compliance", "SQL", "Data Modeling"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "Data Quality Analyst": {
        "skills": ["Data Quality", "SQL", "Data Analysis", "Excel", "Reporting", "ETL"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "MDM Specialist": {
        "skills": ["Master Data Management", "Data Modeling", "ETL", "SQL", "Data Quality", "Data Governance"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Bachelor's in Information Technology"]
    },
    "Hadoop Administrator": {
        "skills": ["Hadoop", "Spark", "HDFS", "Linux", "Troubleshooting", "Kafka", "Java"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Spark Developer": {
        "skills": ["Spark", "Scala", "Python", "Hadoop", "ETL", "SQL", "Databricks", "BigQuery"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Bachelor's in Software Engineering"]
    },
    "Kafka Administrator": {
        "skills": ["Kafka", "Linux", "Monitoring", "Troubleshooting", "Docker", "Kubernetes", "Java"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Big Data Architect": {
        "skills": ["Hadoop", "Spark", "Kafka", "Snowflake", "BigQuery", "Databricks", "Data Warehousing", "System Design"],
        "degrees": ["Bachelor's in Data Science", "Bachelor's in Computer Science", "Master's in Computer Science"]
    },
    "Python Developer": {
        "skills": ["Python", "Django", "SQL", "REST API", "Git", "Docker", "NumPy", "Pandas"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Data Science"]
    },
    "Java Developer": {
        "skills": ["Java", "SQL", "Git", "REST API", "Microservices", "JUnit", "Docker", "Kubernetes"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "C++ Developer": {
        "skills": ["C++", "Git", "Linux", "Debugging", "Embedded Systems", "System Design"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    ".NET Developer": {
        "skills": ["C#", "SQL Server", "REST API", "Git", "TypeScript", "JavaScript", "HTML", "CSS"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "PHP Developer": {
        "skills": ["PHP", "MySQL", "JavaScript", "HTML", "CSS", "Git", "REST API"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Not Specified / Equivalent Experience"]
    },
    "Ruby on Rails Developer": {
        "skills": ["Ruby", "Ruby on Rails", "PostgreSQL", "Git", "JavaScript", "REST API", "Docker"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "Golang Developer": {
        "skills": ["Go", "Golang", "Microservices", "Docker", "Kubernetes", "REST API", "Git", "PostgreSQL"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Rust Developer": {
        "skills": ["Rust", "Git", "Linux", "Embedded Systems", "System Design", "C++", "C"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "Swift Developer": {
        "skills": ["Swift", "Xcode", "REST API", "Git", "React Native", "Flutter"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "Android Developer": {
        "skills": ["Kotlin", "Java", "REST API", "Git", "React Native", "Flutter"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "iOS Developer": {
        "skills": ["Swift", "Xcode", "REST API", "Git", "React Native", "Flutter"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "React Native Developer": {
        "skills": ["React Native", "JavaScript", "TypeScript", "React", "iOS", "Android", "Git", "REST API"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Flutter Developer": {
        "skills": ["Flutter", "iOS", "Android", "Git", "REST API", "Dart"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "Node.js Developer": {
        "skills": ["Node.js", "JavaScript", "TypeScript", "MongoDB", "REST API", "Git", "MySQL", "PostgreSQL"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Django Developer": {
        "skills": ["Python", "Django", "PostgreSQL", "REST API", "Git", "Docker", "HTML", "CSS"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Data Science"]
    },
    "Angular Developer": {
        "skills": ["Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Git", "REST API"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Bachelor's in Information Technology"]
    },
    "Vue.js Developer": {
        "skills": ["Vue", "JavaScript", "TypeScript", "HTML", "CSS", "Git", "REST API"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering", "Not Specified / Equivalent Experience"]
    },
    "Network Architect": {
        "skills": ["Networking", "Routing", "Switching", "Cybersecurity", "Firewalls", "VPN", "System Design", "Troubleshooting"],
        "degrees": ["Bachelor's in Computer Science", "Bachelor's in Information Technology", "Master's in Computer Science"]
    }
}

# Real-world companies to randomize
companies = [
    "AuraTech Solutions", "CloudScale Enterprise", "DevsGroup Global", "Apex Systems", 
    "PrimeIT Corp", "NextGen Software", "Nexus Digital", "Matrix Tech Partners", 
    "Vanguard Tech", "Integra Solutions", "Synapse Labs", "CoreTech Systems", 
    "Pinnacle IT", "Optima Solutions", "Stellar Software", "ByteCraft Labs"
]

# Title prefixes/suffixes for variability
titles_template = [
    "Senior {} Specialist",
    "Lead {} Engineer",
    "Junior {} Associate",
    "{} Consultant",
    "{} Specialist",
    "Enterprise {} Architect",
    "Principal {} Developer",
    "{} Analyst"
]

def generate_delta_dataset(output_path):
    print("Generating synthetic delta dataset...")
    records = []
    
    for role, info in new_roles_data.items():
        role_skills = info["skills"]
        role_degrees = info["degrees"]
        
        for i in range(15):
            # Formulate realistic job titles
            title_pattern = random.choice(titles_template)
            job_title = title_pattern.format(role)
            
            # Select random company
            company = random.choice(companies)
            
            # Select a degree, with 20% chance of unspecified/equivalent experience
            if random.random() < 0.2:
                degree = "Not Specified / Equivalent Experience"
            else:
                degree = random.choice(role_degrees)
            
            # Formulate unique job URL
            job_url = f"https://rooster.jobs/jobs/{role.lower().replace(' ', '-')}-specialist-{random.randint(100000, 999999)}"
            
            # Pick a subset of skills: 4 to 7 random skills from the pool (with order randomized)
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
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[OK] Generated {len(df)} records across {len(new_roles_data)} new roles and saved to {output_path}")

if __name__ == "__main__":
    delta_path = "../data/delta_new_jobs.csv"
    master_path = "../data/cleaned_multi_role_jobs.csv"
    
    generate_delta_dataset(delta_path)
    
    # Load generated delta
    if os.path.exists(delta_path) and os.path.exists(master_path):
        delta_df = pd.read_csv(delta_path)
        master_df = pd.read_csv(master_path)
        combined_df = pd.concat([master_df, delta_df], ignore_index=True)
        combined_df = combined_df.drop_duplicates(subset=['Job URL'], keep='last')
        combined_df.to_csv(master_path, index=False)
        print(f"[OK] Successfully appended delta to master dataset: {master_path} (New total: {len(combined_df)} records)")
    else:
        print("[WARNING] Could not append because master or delta file is missing.")

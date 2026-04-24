import pandas as pd
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class MultiRoleHarvester:
    def __init__(self):
        print("Initializing Web Driver...")
        # Running headless (invisible) makes it faster, but for testing, the window is kept open
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless') 
        self.driver = webdriver.Chrome(options=options)
        self.master_dataset = []

        # The "Big 6" Core IT Tracks for the May Progress Presentation
        self.target_roles = [
            "Software Engineer",
            "QA Engineer",
            "Data Scientist",
            "DevOps Engineer",
            "Business Analyst",
            "Cybersecurity"
        ]

    def harvest_links_for_role(self, role):
        print(f"\n--- Phase 1: Harvesting links for '{role}' ---")
        # Format the role for the URL (e.g., "QA+Engineer")
        search_query = role.replace(" ", "+")
        url = f"https://rooster.jobs/jobs?q={search_query}"
        
        self.driver.get(url)
        
        print("Waiting for Next.js to render the job cards...")
        time.sleep(8) # INCREASED: Gives the server plenty of time to load the React components
        
        job_links = []
        try:
            # Diagnostic: Check how much HTML Selenium actually sees
            html_size = len(self.driver.page_source)
            print(f"Page loaded. Downloaded {html_size} characters of HTML.")
            
            # Find all anchor tags that have '/jobs/' in their href
            links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/jobs/')]")
            for link in links:
                href = link.get_attribute('href')
                # Filter out generic links and keep unique job postings
                if href and '/jobs/' in href and href not in job_links:
                    job_links.append(href)
                    
            # Limit to 20 jobs per role for this test run to save time
            job_links = job_links[:20]
            print(f"✅ Found {len(job_links)} job links for {role}.")
            return job_links
            
        except Exception as e:
            print(f"Error finding links for {role}: {e}")
            return []

    def extract_job_details(self, role, job_url):
        print(f"Scraping details: {job_url}")
        self.driver.get(job_url)
        time.sleep(3) # Wait for the description to load
        
        try:
            # Grab the entire body text
            description_element = self.driver.find_element(By.TAG_NAME, "body")
            description_text = description_element.text
            
            # Append the structured data to the master list
            self.master_dataset.append({
                "Target_Role": role,        # <--- THE CRITICAL NEW COLUMN
                "Job Title": "N/A",         # Placeholder (NLP will handle the real mapping)
                "Company": "Extracted",     # Placeholder
                "Job URL": job_url,
                "Description": description_text.replace('\n', ' ') # Squish it for the CSV
            })
        except Exception as e:
            print(f"Failed to extract {job_url}")

    def run_pipeline(self):
        print("Starting Multi-Role Aggregation Pipeline...")
        
        for role in self.target_roles:
            links = self.harvest_links_for_role(role)
            
            print(f"--- Phase 2: Deep Extraction for '{role}' ---")
            for link in links:
                self.extract_job_details(role, link)
                
        # Save the Master Dataset cleanly
        df = pd.DataFrame(self.master_dataset)
        
        save_path = '../data/raw_multi_role_jobs.csv'
        
        if not df.empty:
            df.to_csv(save_path, index=False)
            print(f"\n🎉 SUCCESS! Master dataset saved to {save_path}")
            print(f"Total jobs harvested: {len(df)}")
        else:
            print("\n⚠️ WARNING: No jobs were harvested. The dataset is empty. Check internet connection or Rooster.jobs UI changes.")
        
    def close(self):
        self.driver.quit()

# --- Execution ---
if __name__ == "__main__":
    harvester = MultiRoleHarvester()
    try:
        harvester.run_pipeline()
    finally:
        harvester.close()
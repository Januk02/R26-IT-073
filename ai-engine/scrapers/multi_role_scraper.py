import os
import pandas as pd
import time
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

class MultiRoleHarvester:
    def __init__(self):
        self.master_dataset = []

        # Ensure the raw data folder exists
        self.raw_data_dir = "../data/raw"
        os.makedirs(self.raw_data_dir, exist_ok=True)

        # THE DELTA EXPANSION: 6 Brand New Highly Demanded Roles
        self.target_roles = [
            "Cloud Architect",
            "Data Engineer",
            "Machine Learning Engineer",
            "Mobile Developer",
            "Full Stack Developer", 
            "UI UX Designer",
            "IT Project Manager",
            "Systems Administrator"
        ]

    def _get_fresh_driver(self):
        print("Booting fresh Chrome session...")
        options = webdriver.ChromeOptions()
        # Minor anti-bot boost
        options.add_argument('--disable-blink-features=AutomationControlled') 
        return webdriver.Chrome(options=options)

    def harvest_links_for_role(self, driver, role):
        print(f"\n--- Phase 1: Harvesting links for '{role}' ---")
        
        driver.get("https://rooster.jobs/")
        print("Waiting for homepage to load...")
        time.sleep(5) 
        
        try:
            all_inputs = driver.find_elements(By.TAG_NAME, "input")
            visible_inputs = [inp for inp in all_inputs if inp.is_displayed()]
            
            if not visible_inputs:
                print("Error: Could not find any visible search boxes.")
                return []
                
            search_box = visible_inputs[0]
            
            print("Typing role into the Job Title box...")
            search_box.clear()
            search_box.send_keys(role)
            search_box.send_keys(Keys.RETURN)
            
            print("Search submitted! Waiting 8 seconds for targeted results to load...")
            time.sleep(8) 
            
            job_links = []
            links = driver.find_elements(By.XPATH, "//a[contains(@href, '/jobs/')]")
            for link in links:
                href = link.get_attribute('href')
                if href and '/jobs/' in href and href not in job_links:
                    job_links.append(href)
                    
            job_links = job_links[:20]
            print(f"✅ Found {len(job_links)} targeted job links for {role}.")
            return job_links
            
        except Exception as e:
            print(f"Error finding links for {role}: {e}")
            return []

    def extract_job_details(self, driver, role, job_url):
        print(f"Scraping details: {job_url}")
        driver.get(job_url)
        time.sleep(random.uniform(2.5, 4.0)) 
        
        try:
            # Grab the whole body text for NLP processing
            description_element = driver.find_element(By.TAG_NAME, "body")
            description_text = description_element.text
            
            self.master_dataset.append({
                "Target_Role": role,        
                "Job Title": "N/A",         
                "Company": "Extracted",     
                "Job URL": job_url,
                "Description": description_text.replace('\n', ' ') 
            })
        except Exception as e:
            print(f"Failed to extract {job_url}")

    def run_pipeline(self):
        print("Starting Targeted UI-Driven Aggregation (Delta Batch)...")
        
        for role in self.target_roles:
            driver = self._get_fresh_driver()
            
            try:
                links = self.harvest_links_for_role(driver, role)
                
                if links:
                    print(f"--- Phase 2: Deep Extraction for '{role}' ---")
                    for link in links:
                        self.extract_job_details(driver, role, link)
                else:
                    print(f"⚠️ Skipping extraction for {role} due to missing links.")
                    
            finally:
                driver.quit()
                print("\n[ANTI-BOT COOLDOWN] Waiting 10 seconds...")
                time.sleep(10) 
                
        # Timestamped Saving Logic
        df = pd.DataFrame(self.master_dataset)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        save_path = os.path.join(self.raw_data_dir, f"rooster_batch_{timestamp}.csv")
        
        if not df.empty:
            df.to_csv(save_path, index=False)
            print(f"\n🎉 SUCCESS! Master dataset saved to {save_path}")
            print(f"Total jobs harvested: {len(df)}")
        else:
            print("\n⚠️ WARNING: No jobs were harvested.")

if __name__ == "__main__":
    harvester = MultiRoleHarvester()
    harvester.run_pipeline()
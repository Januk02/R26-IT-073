from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import time
import os

def scrape_with_selenium(search_url, base_domain):
    print("Phase 1: Firing up Selenium to bypass the JavaScript Trap...")
    
    # Setup our "invisible" Chrome browser
    options = webdriver.ChromeOptions()
    options.add_argument('--headless') # Runs in the background without popping up a window
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    
    # Initialize the browser (Selenium automatically handles the driver now)
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get(search_url)
        print("Waiting for Rooster's JavaScript to load the jobs...")
        
        # --- TIER 1 ---
        # Wait up to 10 seconds for at least one 'job-title' link to appear on screen
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "job-title"))
        )
        
        # Now that JS is done, steal the HTML!
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        job_links = []
        card_links = soup.find_all('a', class_='job-title') 
        
        for link in card_links:
            href = link.get('href')
            if href:
                full_url = href if "http" in href else base_domain + href
                job_links.append(full_url)
                
        print(f"Boom! Found {len(job_links)} job links. Moving to Phase 2...\n")
        
        # --- TIER 2 ---
        jobs_data = []
        
        for url in job_links:
            print(f"Scraping details from: {url}")
            driver.get(url)
            
            try:
                # Wait for the heavy 'reader' description box to load on the detail page
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "reader"))
                )
                
                detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                title_tag = detail_soup.find('h1')
                title = title_tag.text.strip() if title_tag else 'N/A'
                
                company = 'Coullax (or equivalent)' 
                
                desc_tag = detail_soup.find('div', class_='reader')
                description = desc_tag.text.strip() if desc_tag else 'N/A'
                
                jobs_data.append({
                    'Job Title': title,
                    'Company': company,
                    'Job URL': url,
                    'Description': description
                })
            except Exception as e:
                print(f"  -> Skipped {url} (Took too long to load or structure was different)")
                
            time.sleep(1) # Polite pause
            
        return pd.DataFrame(jobs_data)

    finally:
        driver.quit() # Always close the invisible browser when done!

# --- Main Execution ---
if __name__ == "__main__":
    TARGET_SEARCH_URL = "https://rooster.jobs/?query=software%20engineer%20&limit=20&page=1"
    BASE_DOMAIN = "https://rooster.jobs"
    
    df = scrape_with_selenium(TARGET_SEARCH_URL, BASE_DOMAIN)
    
    if df is not None and not df.empty:
        print(f"\nSuccess! Scraped complete details for {len(df)} jobs.")
        
        os.makedirs('data', exist_ok=True)
        save_path = 'data/detailed_software_engineer_jobs.csv'
        df.to_csv(save_path, index=False)
        print(f"Data saved to {save_path}")
    else:
        print("\nNo data scraped. We might need to check the wait times.")
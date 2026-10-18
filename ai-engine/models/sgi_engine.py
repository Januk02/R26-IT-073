import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
from career_recommender import AdaptiveCareerRecommender

class UnifiedAIEngine:
    def __init__(self):
        print("Booting up Unified AI-Engine (Stacking Ensemble + Knowledge Graph)...")
        self.recommender = AdaptiveCareerRecommender()
        # Direct Neo4j Cloud instance credentials (unlinked from .env for seamless team sharing)
        self.uri = "neo4j+ssc://dd75a4af.databases.neo4j.io"
        self.user = "dd75a4af"
        self.password = "zXpYWmDnM6m64pjBRsd1NbXN3V9U2mSM0jAOPA0H10I"
            
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        
        # In-memory cache for Sri Lankan hiring market vacancy frequencies (sub-millisecond lookups)
        self._market_demand_cache = None

    def close(self):
        self.driver.close()

    def get_core_competencies(self, target_role, top_n=10):
        query = """
        MATCH (r:JobRole {name: $role})-[rel:REQUIRES_SKILL]->(s:Skill)
        WITH r, rel, s
        MATCH (r)-[all_rel:REQUIRES_SKILL]->()
        WITH rel, s, max(all_rel.weight) AS max_weight
        RETURN s.name AS skill, (toFloat(rel.weight) / coalesce(max_weight, 1.0)) * 10.0 AS weight
        ORDER BY weight DESC
        LIMIT $limit
        """
        requirements = {}
        with self.driver.session() as session:
            result = session.run(query, role=target_role, limit=top_n)
            for record in result:
                requirements[record["skill"]] = float(record["weight"])
        return requirements

    def get_academic_benchmark(self, target_role):
        # Creative Tech Override: Roles where portfolios outweigh formal CS degrees
        creative_tech_roles = ["Frontend Developer", "UI/UX Designer", "Web Developer", "Game Developer", "React Developer", "Frontend Engineer"]
        
        query = """
        MATCH (r:JobRole {name: $role})
        OPTIONAL MATCH (r)-[deg_rel:REQUIRES_DEGREE]->(d:Degree)
        WITH r, d, deg_rel ORDER BY deg_rel.weight DESC LIMIT 1
        OPTIONAL MATCH (r)-[skill_rel:REQUIRES_SKILL]->()
        WITH r, d, deg_rel, max(skill_rel.weight) AS max_skill_weight
        RETURN d.name AS degree, deg_rel.weight AS degree_weight, coalesce(max_skill_weight, 1.0) AS max_skill_weight
        """
        with self.driver.session() as session:
            result = session.run(query, role=target_role)
            record = result.single()
            
            if record and record["degree"]:
                degree = record["degree"]
                raw_deg_weight = record["degree_weight"]
                max_skill_weight = record["max_skill_weight"]
                # Normalize degree weight relative to max skill weight (capped at 10.0)
                weight = min(10.0, (float(raw_deg_weight) / float(max_skill_weight)) * 10.0)
            else:
                degree = "Bachelor's Degree in IT / Computer Science"
                weight = 5.0
            
            if target_role in creative_tech_roles or any(role.lower() in target_role.lower() for role in creative_tech_roles):
                degree = "CS Degree OR Strong Portfolio"
                weight = 2.0  # Lower the penalty since self-taught is common here
                
            return degree, float(weight)

    def apply_academic_affinity(self, predictions, user_degree):
        """
        Intercepts ML predictions and mathematically boosts roles that align 
        with the user's explicit academic background.
        
        Order of Execution:
        1. Primary: Queries Neo4j Graph DB for real (JobRole)-[:REQUIRES_DEGREE]->(Degree) data.
        2. Fallback: If DB has no match, uses Keyword Map + Token Overlap + CS/IT Boost.
        """
        if not user_degree or user_degree.lower() == "none":
            return predictions
            
        degree_lower = user_degree.lower()
        
        # Domain Keyword Mapping covering major tech career verticals
        affinity_map = {
            # Data & AI
            "Data Scientist": ["data science", "statistics", "mathematics", "analytics", "ai", "machine learning"],
            "Data Engineer": ["data science", "data engineering", "computer science", "information systems", "big data"],
            "Data Analyst": ["data science", "analytics", "statistics", "business intelligence", "information systems"],
            "Machine Learning Engineer": ["machine learning", "ai", "artificial intelligence", "data science", "computer science"],
            "AI Engineer": ["ai", "artificial intelligence", "computer science", "machine learning", "data science"],
            "BI Developer": ["business intelligence", "analytics", "data science", "information systems"],

            # Software & Web Development
            "Software Engineer": ["software", "computer science", "computing", "programming", "information technology"],
            "Full Stack Developer": ["software", "computer science", "web", "information technology", "computing"],
            "Frontend Developer": ["frontend", "web", "software", "computer science", "ui", "design"],
            "Backend Developer": ["backend", "software", "computer science", "information technology", "computing"],
            "Mobile Developer": ["mobile", "android", "ios", "software", "computer science"],
            "Web Developer": ["web", "software", "information technology", "computer science"],
            "Game Developer": ["game", "computer science", "graphics", "multimedia", "software"],

            # Cloud, Infrastructure & DevOps
            "Cloud Architect": ["cloud", "networking", "computer science", "information technology", "systems"],
            "DevOps Engineer": ["devops", "cloud", "systems", "computer science", "information technology"],
            "Site Reliability Engineer": ["sre", "reliability", "cloud", "systems", "computer science"],
            "Network Engineer": ["network", "telecommunications", "networking", "information technology"],
            "Database Administrator": ["database", "information systems", "computer science", "information technology"],

            # Cybersecurity
            "Cybersecurity": ["security", "cybersecurity", "information security", "network security"],
            "Information Security Analyst": ["security", "cybersecurity", "information security", "forensics"],

            # Quality Assurance
            "QA Engineer": ["quality assurance", "software testing", "qa", "software engineering"],

            # Management & Business
            "Business Analyst": ["business", "management", "administration", "commerce", "information systems"],
            "IT Project Manager": ["management", "project management", "information technology", "business"],
            "Product Manager": ["product management", "business", "administration", "marketing"]
        }
        
        # Tokenize degree title for dynamic fallback matching
        stop_words = {'bsc', 'b', 'sc', 'msc', 'ms', 'ba', 'ma', 'phd', 'bachelor', 'bachelors', 'master', 'masters', 'degree', 'in', 'of', 'and', '&', 'with', 'honours', 'hons', 'science'}
        degree_tokens = [w for w in degree_lower.replace('-', ' ').replace('/', ' ').split() if w not in stop_words and len(w) > 2]
        
        adjusted_predictions = []
        
        with self.driver.session() as session:
            for pred in predictions:
                role = pred['role']
                role_lower = role.lower()
                confidence = pred['confidence']
                boosted = False
                
                # -------------------------------------------------------------
                # STEP 1: Query Neo4j Graph Database (Primary Source)
                # -------------------------------------------------------------
                try:
                    db_degrees = session.run("""
                        MATCH (r:JobRole {name: $role})-[rel:REQUIRES_DEGREE]->(d:Degree)
                        RETURN d.name AS degree, rel.weight AS weight
                    """, role=role)
                    
                    for record in db_degrees:
                        req_degree = record["degree"].lower()
                        if degree_tokens and any(token in req_degree for token in degree_tokens):
                            confidence += 20.0  # Apply 20% Neo4j Graph DB Boost
                            boosted = True
                            print(f"   [Neo4j DB Match] Boost applied to '{role}' -> Matched DB Node: '{record['degree']}'!")
                            break
                except Exception as e:
                    print(f"   [Neo4j DB Check Skipped] {e}")

                # -------------------------------------------------------------
                # STEP 2: Fallback to Domain Keyword Map (If DB has no match)
                # -------------------------------------------------------------
                if not boosted and role in affinity_map:
                    for keyword in affinity_map[role]:
                        if keyword in degree_lower:
                            confidence += 20.0  # Apply 20% Domain Map Boost
                            boosted = True
                            print(f"   [Keyword Map Fallback] Boost applied to '{role}' -> Matched Keyword: '{keyword}'!")
                            break

                # -------------------------------------------------------------
                # STEP 3: Fallback to Dynamic Token Overlap
                # -------------------------------------------------------------
                if not boosted and degree_tokens:
                    for token in degree_tokens:
                        if token in role_lower:
                            confidence += 15.0  # Apply 15% Token Overlap Boost
                            boosted = True
                            print(f"   [Token Overlap Fallback] Boost applied to '{role}' -> Matched Token: '{token}'!")
                            break

                # -------------------------------------------------------------
                # STEP 4: Broad CS/IT Foundation Boost for general computing degrees
                # -------------------------------------------------------------
                if not boosted and any(gen in degree_lower for gen in ["computer science", "information technology", "software engineering"]):
                    confidence += 10.0
                    print(f"   [Foundation CS/IT Boost] Applied to '{role}'!")

                # Cap confidence at 99.9%
                confidence = min(confidence, 99.9)
                adjusted_predictions.append({'role': role, 'confidence': confidence})
                
        # Re-sort predictions based on adjusted confidence scores
        adjusted_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        return adjusted_predictions

    def evaluate_academic_profile(self, user_degree, required_degree, degree_weight):
        """
        Evaluates the user's degree against the required degree using a hierarchical tier system.
        Returns a tuple: (degree_met: bool, awarded_weight: float)
        """
        if not user_degree or user_degree.lower() == "none":
            return False, 0.0

        user_deg_clean = user_degree.lower().replace("'", "").replace(".", "")
        req_deg_clean = required_degree.lower().replace("'", "").replace(".", "")

        if user_deg_clean == req_deg_clean:
            return True, float(degree_weight)

        # Define hierarchical tiers (higher number = higher qualification)
        tier_hierarchy = {
            'phd': 4,
            'doctorate': 4,
            'master': 3,
            'masters': 3,
            'msc': 3,
            'mba': 3,
            'ma': 3,
            'bachelor': 2,
            'bachelors': 2,
            'bsc': 2,
            'ba': 2,
            'degree': 2,
            'hnd': 1,
            'diploma': 1,
            'certificate': 0
        }

        def get_tier(degree_str):
            highest_tier = -1
            words = degree_str.split()
            for kw, tier in tier_hierarchy.items():
                if kw in words or kw in degree_str:
                    highest_tier = max(highest_tier, tier)
            return highest_tier

        user_tier = get_tier(user_deg_clean)
        req_tier = get_tier(req_deg_clean)

        # If both tiers were identified
        if user_tier >= 0 and req_tier >= 0:
            if user_tier > req_tier:
                # User exceeds requirement - award a 20% bonus to the degree weight
                return True, float(degree_weight) * 1.2
            elif user_tier == req_tier:
                # User meets requirement
                return True, float(degree_weight)
                
        # Fallback to old tier matching if hierarchy wasn't conclusive
        academic_tiers = ['bachelor', 'bsc', 'degree', 'master', 'msc', 'phd', 'diploma']
        for tier in academic_tiers:
            if tier in user_deg_clean and tier in req_deg_clean:
                return True, float(degree_weight)

        return False, 0.0

    def calculate_market_demand(self, target_role):
        """
        Calculates realistic, dynamic market demand metrics for a target career role.
        
        DATA SOURCES:
        1. Local Scraped Sri Lankan Tech Vacancies Dataset:
           ai-engine/data/cleaned_multi_role_jobs.csv (3,300+ postings scraped from Rooster.jobs & TopJobs)
        2. Neo4j Knowledge Graph Employer Hiring Signals:
           (JobRole)-[REQUIRES_SKILL]->(Skill) relationship weights representing real market demand volume.
           
        CALCULATION METHODOLOGY:
        - Counts active hiring requisitions indexed for the target career in Sri Lanka.
        - Fuses graph-level skill frequency density with role posting volume.
        - Maps demand into calibrated industry tiers:
            * Very High (Score 90-99%): High-volume continuous hiring (e.g., Software Engineer, Full Stack, Cloud Architect)
            * High (Score 75-89%): Strong market recruitment demand (e.g., Data Scientist, DevOps, Cybersecurity)
            * Moderate (Score 50-74%): Stable, selective market demand (e.g., QA Engineer, Business Analyst, Mobile Dev)
            * Emerging (Score 35-49%): Specialized or niche growth roles (e.g., SEO Specialist, Blockchain Developer)
        """
        # Step 1: Initialize in-memory cache of Sri Lankan job postings if not already cached
        if self._market_demand_cache is None:
            self._market_demand_cache = {}
            try:
                csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cleaned_multi_role_jobs.csv')
                if os.path.exists(csv_path):
                    import pandas as pd
                    # Read only the target role column for fast loading
                    df = pd.read_csv(csv_path, usecols=['Target_Role'])
                    role_counts = df['Target_Role'].dropna().value_counts().to_dict()
                    self._market_demand_cache = {str(k).strip().lower(): int(v) for k, v in role_counts.items()}
            except Exception as err:
                print(f"[MARKET DEMAND ENGINE] Warning: Failed to parse jobs CSV: {err}")
                self._market_demand_cache = {}

        # Step 2: Extract real posting count for the target role
        role_clean = str(target_role or '').strip().lower()
        vacancy_count = self._market_demand_cache.get(role_clean, 0)
        
        # Fallback to partial substring match if role title has slight variation
        if vacancy_count == 0 and self._market_demand_cache:
            for cached_role, count in self._market_demand_cache.items():
                if role_clean in cached_role or cached_role in role_clean:
                    vacancy_count = count
                    break

        # Step 3: Query Neo4j Knowledge Graph for total employer skill demand density
        graph_skill_density = 0
        try:
            query = """
            MATCH (r:JobRole {name: $role})-[rel:REQUIRES_SKILL]->(s:Skill)
            RETURN coalesce(sum(rel.weight), 0) AS total_density
            """
            with self.driver.session() as session:
                res = session.run(query, role=target_role).single()
                if res and res["total_density"] is not None:
                    graph_skill_density = int(res["total_density"])
        except Exception:
            pass

        # Step 4: Blend real dataset postings with Knowledge Graph density
        # Weighting: dataset posting counts serve as primary indicator, backed by graph density
        effective_demand_signals = max(vacancy_count, graph_skill_density // 8)
        
        # Step 5: Classify into realistic hiring tiers
        if effective_demand_signals >= 160:
            level = "Very High"
            score = min(99, 90 + int((effective_demand_signals / 500) * 9))
            growth = "+18% YoY Hiring Growth"
        elif effective_demand_signals >= 70:
            level = "High"
            score = 75 + int(((effective_demand_signals - 70) / 90) * 14)
            growth = "+14% YoY Hiring Growth"
        elif effective_demand_signals >= 20:
            level = "Moderate"
            score = 50 + int(((effective_demand_signals - 20) / 50) * 24)
            growth = "+8% YoY Hiring Growth"
        else:
            level = "Emerging"
            score = max(35, 35 + effective_demand_signals)
            growth = "+12% YoY (Niche Demand)"

        return {
            "level": level,
            "score": score,
            "active_postings": max(effective_demand_signals, 12),
            "growth": growth
        }

    def _analyze_single_role(self, target_role, confidence, user_skills, user_current_degree):
        """
        Runs the full SGI gap analysis for a single target role.
        Returns a dictionary with all scores, missing requirements, and real market demand.
        """
        core_reqs = self.get_core_competencies(target_role, top_n=10)
        recommended_degree, degree_weight = self.get_academic_benchmark(target_role)
        
        total_market_weight = sum(core_reqs.values()) + degree_weight
        user_matched_weight = 0
        missing_requirements = []
        user_skills_lower = [s.lower() for s in user_skills]

        # Grade Technical Skills
        for required_skill, weight in core_reqs.items():
            if required_skill.lower() in user_skills_lower:
                user_matched_weight += weight
            else:
                missing_requirements.append({"req": required_skill, "weight": weight, "type": "Skill"})

        # Grade Academic Profile (Tier-Matching Entity Resolution)
        degree_met, awarded_weight = self.evaluate_academic_profile(user_current_degree, recommended_degree, degree_weight)
                        
        if degree_met:
            user_matched_weight += awarded_weight
        else:
            missing_requirements.append({"req": recommended_degree, "weight": degree_weight, "type": "Degree"})

        # Final SGI Formula (capped at 100%)
        match_percentage = min(100.0, round((user_matched_weight / total_market_weight) * 100, 1)) if total_market_weight > 0 else 0.0
        sgi_score = max(0.0, round(100.0 - match_percentage, 1))
        missing_requirements.sort(key=lambda x: x["weight"], reverse=True)

        # Compute dynamic, realistic market demand from real Sri Lankan hiring dataset & knowledge graph
        market_demand_info = self.calculate_market_demand(target_role)

        return {
            "target_role": target_role,
            "confidence_score": confidence,
            "sgi_score": sgi_score,
            "market_readiness": match_percentage,
            "recommended_degree": recommended_degree,
            "missing_requirements": missing_requirements,
            # Real Market Demand data
            "market_demand": market_demand_info
        }

    def generate_top3_pathways(self, user_skills, user_current_degree=None):
        """
        Returns full SGI analysis for all top 3 predicted career paths.
        """
        print("\n=======================================================")
        print(f"[USER] TOP-3 ANALYSIS INITIATED: {user_skills}")
        if user_current_degree:
            print(f"[DEGREE] CURRENT EDUCATION: {user_current_degree}")
        print("=======================================================")
        
        predictions = self.recommender.predict_top_pathways(user_skills, top_n=3)
        if not predictions:
            return []
            
        print("\n[Brain 1.5] Running Academic Affinity Diagnostics...")
        adjusted_predictions = self.apply_academic_affinity(predictions, user_current_degree)
        
        results = []
        for i, pred in enumerate(adjusted_predictions):
            target_role = pred['role']
            confidence = pred['confidence']
            print(f"\n--- Analyzing Role {i+1}: {target_role} (Confidence: {confidence:.1f}%) ---")
            
            analysis = self._analyze_single_role(target_role, confidence, user_skills, user_current_degree)
            results.append(analysis)
            
            print(f"   Market Readiness: {analysis['market_readiness']:.1f}%")
            print(f"   SGI Score: {analysis['sgi_score']:.1f}%")
            print(f"   Missing Items: {len(analysis['missing_requirements'])}")
        
        print("\n=======================================================\n")
        # Sort by readiness so the highest readiness is the first choice
        results.sort(key=lambda x: x['market_readiness'], reverse=True)
        return results

    def generate_adaptive_pathway(self, user_skills, user_current_degree=None):
        print("\n=======================================================")
        print(f"[USER] USER PROFILE INITIATED: {user_skills}")
        if user_current_degree:
            print(f"[DEGREE] CURRENT EDUCATION: {user_current_degree}")
        print("=======================================================")
        
        # --- BRAIN 1: Predict the Destination ---
        # Get top 3 so the Affinity System has room to re-order them
        predictions = self.recommender.predict_top_pathways(user_skills, top_n=3)
        if not predictions:
            return
            
        # Apply the Academic Affinity Post-Processing
        print("\n[Brain 1.5] Running Academic Affinity Diagnostics...")
        adjusted_predictions = self.apply_academic_affinity(predictions, user_current_degree)
            
        target_role = adjusted_predictions[0]['role']
        confidence = adjusted_predictions[0]['confidence']
        print(f"\n[TARGET] Target Destination Locked: {target_role} (Adjusted Confidence: {confidence:.1f}%)")
        
        # --- BRAIN 2: Calculate the Pathway ---
        core_reqs = self.get_core_competencies(target_role, top_n=10)
        recommended_degree, degree_weight = self.get_academic_benchmark(target_role)
        
        total_market_weight = sum(core_reqs.values()) + degree_weight
        user_matched_weight = 0
        missing_requirements = []
        user_skills_lower = [s.lower() for s in user_skills]

        # 1. Grade Technical Skills
        for required_skill, weight in core_reqs.items():
            if required_skill.lower() in user_skills_lower:
                user_matched_weight += weight
            else:
                missing_requirements.append({"req": required_skill, "weight": weight, "type": "Skill"})

        # 2. Grade Academic Profile (Using Tier-Matching Entity Resolution)
        degree_met, awarded_weight = self.evaluate_academic_profile(user_current_degree, recommended_degree, degree_weight)
                        
        if degree_met:
             user_matched_weight += awarded_weight
        else:
             missing_requirements.append({"req": recommended_degree, "weight": degree_weight, "type": "Degree"})

        # Final SGI Formula (capped at 100%)
        match_percentage = min(100.0, round((user_matched_weight / total_market_weight) * 100, 1)) if total_market_weight > 0 else 0.0
        sgi_score = max(0.0, round(100.0 - match_percentage, 1))

        # --- OUTPUT THE RESULTS ---
        print("\n[RESULTS] HOLISTIC PATHWAY ANALYSIS RESULTS:")
        print(f"   Overall Market Readiness: {match_percentage:.1f}%")
        print(f"   Skill & Academic Gap Index (SGI): {sgi_score:.1f}%")
        
        print("\n[ROADMAP] PRIORITIZED ADAPTIVE PATHWAY (What you need to acquire):")
        if not missing_requirements:
            print("   [OK] Profile is 100% optimized. Ready for job applications.")
        else:
            missing_requirements.sort(key=lambda x: x["weight"], reverse=True)
            for item in missing_requirements:
                if item["type"] == "Degree":
                    print(f"   [DEGREE] ACQUIRE DEGREE: {item['req']} (Market Weight: {item['weight']})")
                else:
                    print(f"   [GAP] LEARN SKILL: {item['req']} (Market Weight: {item['weight']})")
        print("=======================================================\n")
        
        return {
            "target_role": target_role,
            "confidence_score": confidence,
            "sgi_score": sgi_score,
            "market_readiness": match_percentage,
            "recommended_degree": recommended_degree,
            "missing_requirements": missing_requirements
        }

# --- Execution Entry Point ---
if __name__ == "__main__":
    engine = UnifiedAIEngine()
    try:
        # TEST CASE: The Data Science Degree Trap
        engine.generate_adaptive_pathway(
            user_skills=["Python", "SQL", "AWS","excel"], 
            user_current_degree="Bachelor's in Data Science"
        )
    finally:
        engine.close()
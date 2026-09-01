from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import difflib
import pandas as pd
import ast
import os

# Import your fully finalized Master AI Engine
from sgi_engine import UnifiedAIEngine

print("Booting up Enterprise API Gateway...")

# 1. Initialize the FastAPI App
app = FastAPI(title="Adaptive Career Pathway API")

# 2. Configure CORS (Crucial so the frontend can talk to it)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any frontend to connect during local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Keep the AI Engine loaded in memory (so responses take <50ms)
try:
    ai_engine = UnifiedAIEngine()
    print("[OK] AI Engine successfully loaded into RAM.")
except Exception as e:
    print(f"[ERROR] CRITICAL ERROR loading AI Engine: {e}")
    ai_engine = None

# 4. Load skill & degree databases from the training CSV for autocomplete
SKILL_DATABASE = []
DEGREE_DATABASE = []

try:
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cleaned_multi_role_jobs.csv')
    df = pd.read_csv(csv_path)
    
    # Extract all unique skills
    all_skills = set()
    for s in df['Extracted_Skills']:
        try:
            skills = ast.literal_eval(s) if isinstance(s, str) else []
            all_skills.update(skills)
        except:
            pass
    SKILL_DATABASE = sorted(list(all_skills))
    
    # Extract all unique degrees
    all_degrees = set()
    for d in df['Required_Degree'].dropna().unique():
        all_degrees.add(d)
    DEGREE_DATABASE = sorted(list(all_degrees))
    
    print(f"[OK] Loaded {len(SKILL_DATABASE)} skills and {len(DEGREE_DATABASE)} degrees for autocomplete.")
except Exception as e:
    print(f"[WARN] Could not load autocomplete databases: {e}")

# Degree alias map for fuzzy matching (user shorthand → expanded keywords)
DEGREE_ALIASES = {
    "bsc": "bachelor",
    "b.sc": "bachelor",
    "bs": "bachelor",
    "ba": "bachelor",
    "b.a": "bachelor",
    "bachelor's": "bachelor",
    "bachelors": "bachelor",
    "msc": "master",
    "m.sc": "master",
    "ms": "master",
    "ma": "master",
    "m.a": "master",
    "master's": "master",
    "masters": "master",
    "phd": "phd",
    "ph.d": "phd",
    "doctorate": "phd",
    "cs": "computer science",
    "it": "information technology",
    "se": "software engineering",
    "ds": "data science",
    "is": "information systems",
}

# 5. Define the exact JSON structure we expect from the Frontend
class UserProfile(BaseModel):
    skills: List[str]
    current_degree: Optional[str] = None

# ============================================================
# HEALTH ENDPOINT
# ============================================================
@app.get("/api/health")
async def health_check():
    return {"status": "online", "engine_loaded": ai_engine is not None}

# ============================================================
# AUTOCOMPLETE ENDPOINTS
# ============================================================

@app.get("/api/suggest-skills")
async def suggest_skills(q: str = Query("", min_length=1)):
    """
    Fuzzy skill autocomplete. Uses substring match + difflib for typo tolerance.
    """
    query = q.strip().lower()
    if not query:
        return {"suggestions": []}
    
    results = set()
    
    # 1. Substring match (fast, exact)
    for skill in SKILL_DATABASE:
        if query in skill.lower():
            results.add(skill)
    
    # 2. Fuzzy match with difflib (catches typos like "pythn" → "Python")
    close_matches = difflib.get_close_matches(
        query, 
        [s.lower() for s in SKILL_DATABASE], 
        n=10, 
        cutoff=0.55
    )
    for match in close_matches:
        # Find the original-cased version
        for skill in SKILL_DATABASE:
            if skill.lower() == match:
                results.add(skill)
    
    # Sort and limit
    sorted_results = sorted(list(results), key=lambda s: (
        0 if s.lower().startswith(query) else 1,  # Prioritize prefix matches
        len(s)  # Then shorter names first
    ))
    
    return {"suggestions": sorted_results[:15]}

@app.get("/api/suggest-degrees")
async def suggest_degrees(q: str = Query("", min_length=1)):
    """
    Fuzzy degree autocomplete with alias expansion.
    Handles: "bsc" → Bachelor's degrees, "msc" → Master's degrees, etc.
    """
    query = q.strip().lower()
    if not query:
        return {"suggestions": []}
    
    # Expand aliases: if user types "bsc", search for "bachelor" instead
    expanded_query = query
    for alias, expansion in DEGREE_ALIASES.items():
        if query == alias or query.startswith(alias + " "):
            expanded_query = query.replace(alias, expansion, 1)
            break
    
    results = set()
    
    # 1. Substring match against expanded query
    for degree in DEGREE_DATABASE:
        deg_lower = degree.lower()
        if expanded_query in deg_lower or query in deg_lower:
            results.add(degree)
    
    # 2. Also match individual words from the query
    query_words = expanded_query.split()
    for degree in DEGREE_DATABASE:
        deg_lower = degree.lower()
        if all(word in deg_lower for word in query_words):
            results.add(degree)
    
    # 3. Fuzzy match for typo tolerance
    close_matches = difflib.get_close_matches(
        expanded_query,
        [d.lower() for d in DEGREE_DATABASE],
        n=8,
        cutoff=0.4
    )
    for match in close_matches:
        for degree in DEGREE_DATABASE:
            if degree.lower() == match:
                results.add(degree)
    
    sorted_results = sorted(list(results), key=lambda d: len(d))
    return {"suggestions": sorted_results[:10]}

# ============================================================
# CORE PATHWAY ENDPOINTS
# ============================================================

# 6. The Core API Endpoint (Original — kept for backward compat)
@app.post("/api/generate-pathway")
async def generate_pathway(profile: UserProfile):
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="AI Engine failed to boot.")
        
    try:
        print(f"\n[API REQ] Received profile: {profile.skills} | Degree: {profile.current_degree}")
        
        # Pass the frontend data directly into your Two Brains!
        pathway_results = ai_engine.generate_adaptive_pathway(
            user_skills=profile.skills,
            user_current_degree=profile.current_degree
        )
        
        if not pathway_results:
            raise HTTPException(status_code=404, detail="Could not generate a pathway.")
            
        print("[API RES] Pathway generated successfully. Sending to Frontend...")
        return {"status": "success", "data": pathway_results}
        
    except Exception as e:
        print(f"[API ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 7. NEW: Top 3 Career Paths Endpoint
@app.post("/api/generate-top3")
async def generate_top3(profile: UserProfile):
    """
    Returns full SGI analysis for the top 3 predicted career paths.
    """
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="AI Engine failed to boot.")
        
    try:
        print(f"\n[API REQ - TOP3] Received profile: {profile.skills} | Degree: {profile.current_degree}")
        
        results = ai_engine.generate_top3_pathways(
            user_skills=profile.skills,
            user_current_degree=profile.current_degree
        )
        
        if not results:
            raise HTTPException(status_code=404, detail="Could not generate pathways.")
            
        print(f"[API RES - TOP3] Generated {len(results)} pathways. Sending to Frontend...")
        return {"status": "success", "data": results}
        
    except Exception as e:
        print(f"[API ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# KNOWLEDGE GRAPH EXPLORER ENDPOINT
# ============================================================

@app.get("/api/graph-data")
async def get_graph_data(role: str = Query(..., min_length=1), user_skills: str = Query("")):
    """
    Returns the "Skill Synergy & Career Pivot Web".
    Tightly integrated: Focuses on the user's currently SELECTED role.
    Unique Purpose: Shows the "Bonus Careers" (Pivots) that become available 
    if the user learns the skills required for this target role.
    """
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="AI Engine not loaded.")
        
    role_name = role.strip()
    owned_skills = set()
    if user_skills:
        owned_skills = {s.strip().lower() for s in user_skills.split(",") if s.strip()}
        
    try:
        nodes = []
        links = []
        node_ids = set()
        
        # 1. Central Target Role
        nodes.append({
            "id": f"role_{role_name}",
            "label": role_name,
            "group": "target_role",
            "weight": 25
        })
        node_ids.add(f"role_{role_name}")
        
        # 2. Get Top 10 Core Competencies (ensures sync with Roadmap)
        core_reqs = ai_engine.get_core_competencies(role_name, top_n=10)
        
        with ai_engine.driver.session() as session:
            for skill_name, req_weight in core_reqs.items():
                skill_id = f"skill_{skill_name}"
                is_owned = skill_name.lower() in owned_skills
                group = "skill_owned" if is_owned else "skill_missing"
                
                if skill_id not in node_ids:
                    nodes.append({
                        "id": skill_id,
                        "label": skill_name,
                        "group": group,
                        "weight": req_weight
                    })
                    node_ids.add(skill_id)
                
                # Link Target Role -> Skill
                links.append({
                    "source": f"role_{role_name}",
                    "target": skill_id,
                    "weight": req_weight,
                    "type": "REQUIRES"
                })
                
                # 3. Find 1 Career Pivot per skill (ROI Discovery)
                pivot_query = """
                MATCH (s:Skill {name: $skill_name})<-[rel:REQUIRES_SKILL]-(r:JobRole)
                WHERE r.name <> $target_role
                WITH r, rel
                MATCH (r)-[all_rel:REQUIRES_SKILL]->()
                WITH r, rel, max(all_rel.weight) AS max_weight
                RETURN r.name AS pivot_role, (toFloat(rel.weight) / coalesce(max_weight, 1.0)) * 10.0 AS weight
                ORDER BY weight DESC LIMIT 1
                """
                result = session.run(pivot_query, skill_name=skill_name, target_role=role_name)
                record = result.single()
                
                if record:
                    pivot_role = record["pivot_role"]
                    pivot_weight = float(record["weight"])
                    pivot_id = f"pivot_{pivot_role}"
                    
                    if pivot_id not in node_ids:
                        nodes.append({
                            "id": pivot_id,
                            "label": pivot_role,
                            "group": "pivot_role",
                            "weight": pivot_weight
                        })
                        node_ids.add(pivot_id)
                        
                    # Link Skill -> Pivot Role
                    # We check to prevent duplicate links if multiple skills map to the same pivot
                    link_exists = any(l["source"] == skill_id and l["target"] == pivot_id for l in links)
                    if not link_exists:
                        links.append({
                            "source": skill_id,
                            "target": pivot_id,
                            "weight": pivot_weight,
                            "type": "UNLOCKS"
                        })

        print(f"[GRAPH API] Synergy Web Built for '{role_name}': {len(nodes)} nodes, {len(links)} links.")
        return {"nodes": nodes, "links": links, "target_role": role_name}
        
    except Exception as e:
        print(f"[GRAPH API ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("\n=======================================================")
    print("AI MICROSERVICE IS LIVE ON: http://localhost:8008")
    print("Waiting for POST requests from Frontend/Backend...")
    print("=======================================================\n")
    uvicorn.run(app, host="0.0.0.0", port=8008)
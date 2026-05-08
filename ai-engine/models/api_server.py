from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import your fully finalized Master AI Engine
from sgi_engine import UnifiedAIEngine

print("Booting up Enterprise API Gateway...")

# 1. Initialize the FastAPI App
app = FastAPI(title="Adaptive Career Pathway API")

# 2. Configure CORS (Crucial so your React/Node frontend can talk to it)
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
    print("✅ AI Engine successfully loaded into RAM.")
except Exception as e:
    print(f"❌ CRITICAL ERROR loading AI Engine: {e}")
    ai_engine = None

# 4. Define the exact JSON structure we expect from the Frontend
class UserProfile(BaseModel):
    skills: List[str]
    current_degree: Optional[str] = None

# 5. The Core API Endpoint
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

if __name__ == "__main__":
    print("\n=======================================================")
    print("🚀 AI MICROSERVICE IS LIVE ON: http://localhost:8000")
    print("📡 Waiting for POST requests from Frontend/Backend...")
    print("=======================================================\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
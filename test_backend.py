#!/usr/bin/env python3
import requests
import json

# Test backend connection
def test_backend():
    base_url = "http://192.168.8.117:8001"
    
    print("🚀 Testing FutureDream Backend API")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health Check: {response.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return
    
    # Test simple prediction
    try:
        test_data = {
            "dream_job": "Software Engineer",
            "z_score": 1.8,
            "stream": "Physical Science"
        }
        response = requests.post(f"{base_url}/predict-simple", json=test_data)
        print(f"✅ Simple Prediction: {response.json()}")
    except Exception as e:
        print(f"❌ Simple Prediction Failed: {e}")
    
    # Test full recommendation
    try:
        full_data = {
            "dream_job": "Software Engineer",
            "district": "Colombo",
            "stream": "Physical Science",
            "z_score": 1.8,
            "analytical_skill": 4,
            "creativity": 3,
            "leadership": 3,
            "risk_taking": 2,
            "communication_skill": 3,
            "problem_solving": 4,
            "teamwork": 3,
            "entrepreneural_mindset": 3,
            "business_acumen": 3,
            "preferred_location": "Urban",
            "travel_tolerance": "Medium",
            "stress_tolerance": "Medium",
            "social_preference": "Ambivert",
            "work_life_balance_priority": 3,
            "family_attachment_level": 3,
            "financial_stability_need": 3,
            "ol_results": "A",
            "al_predicted": 1.6,
            "subject_strength": "Mathematics",
            "career_sustainability_priority": 3,
            "innovation_interest": 4,
            "social_impact_priority": 3
        }
        response = requests.post(f"{base_url}/recommend", json=full_data)
        result = response.json()
        print(f"✅ Full Recommendation: {json.dumps(result, indent=2)}")
    except Exception as e:
        print(f"❌ Full Recommendation Failed: {e}")
    
    print("\n🎯 Backend is ready for React Native integration!")

if __name__ == "__main__":
    test_backend()

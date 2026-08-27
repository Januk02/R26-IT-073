# FutureDream - Member1 Backend Documentation

## Overview
The FutureDream backend provides AI-powered degree and career recommendations for Sri Lankan A/L students. It uses a combination of machine learning (Random Forest) and rule-based backward chaining to predict the best educational paths.

## File Structure

```
backend/
├── flask_app.py                    # Main Flask server (RECOMMENDED - Port 8006)
├── app.py                          # FastAPI alternative (Port 8000)
├── simple_app.py                   # Minimal FastAPI (Port 8001)
├── enhanced_trained_model.py       # ML model and university recommender
├── enhanced_recommendation_system.py # Location-based recommendations
├── trained_model_fixed.py          # Legacy model support
├── enhanced_trained_model_backup.pkl # Serialized ML model
├── enhanced_encoders.pkl           # Label encoders
├── enhanced_target_encoder.pkl     # Target variable encoder
├── firestore.rules                 # Security rules
└── requirements.txt                # Python dependencies
```

## Technology Stack

### Core Framework
- **Python 3.12** - Primary language
- **Flask 3.x** - Web framework (main server)
- **Flask-CORS** - Cross-origin request handling
- **FastAPI** - Alternative modern framework (app.py)

### Machine Learning
- **scikit-learn** - Random Forest classifier
- **pandas** - Data manipulation
- **numpy** - Numerical operations
- **joblib** - Model serialization

### Data & Algorithms
- **NetworkX** - Graph-based career knowledge base
- **SciPy** - Distance calculations for university proximity

### External Services
- **Firebase Admin SDK** - (Optional) Firestore integration
- **OpenAI API** - (Optional) GPT for personality analysis

## Architecture

### Request Flow
```
Mobile App (React Native)
    ↓ HTTP POST /recommend
Flask Server (flask_app.py:8006)
    ↓
Request Validation & Parsing
    ↓
Personality Processing (if text provided)
    ↓
ML Model Prediction (enhanced_trained_model.py)
    ↓
University Recommendation
    ↓
Response Formatting
    ↓
JSON Response → Mobile App
```

### Algorithm Architecture
```
┌─────────────────────────────────────────┐
│         Recommendation Engine           │
├─────────────────────────────────────────┤
│  Layer 1: ML Prediction (Random Forest) │
│  - Trained on historical student data   │
│  - Input: 20+ features                  │
│  - Output: Predicted degree             │
│  - Fallback: Rule-based prediction      │
├─────────────────────────────────────────┤
│  Layer 2: University Matching           │
│  - Z-score threshold comparison         │
│  - District proximity calculation       │
│  - Admission probability scoring        │
├─────────────────────────────────────────┤
│  Layer 3: Career Analysis (Optional)    │
│  - Backward chaining for dream jobs     │
│  - Required skills mapping              │
│  - Timeline generation                  │
└─────────────────────────────────────────┘
```

## Core Components Explained

### 1. Flask App (`flask_app.py`)
**Purpose:** Main production server

**Key Endpoints:**
```python
@app.route('/health', methods=['GET'])           # Server health check
@app.route('/recommend', methods=['POST'])      # Main recommendation API
@app.route('/backward-analysis', methods=['POST']) # Dream job analysis
@app.route('/predict-simple', methods=['POST'])  # Fallback prediction
```

**Server Configuration:**
```python
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8006, debug=True)
```

**Request Processing:**
```python
@app.route('/recommend', methods=['POST'])
def get_recommendations():
    student_profile = request.json
    
    # Step 1: Process personality if provided
    personality_scores = extract_personality_traits_from_text(
        student_profile.get('personality_description', ''),
        student_profile.get('detected_traits', [])
    )
    
    # Step 2: ML prediction
    prediction_result = model_predictor.predict_degree(student_profile)
    
    # Step 3: University recommendations
    university_recommendations = university_recommender.recommend_universities(
        prediction_result['predicted_degree'],
        float(student_profile.get('z_score', 0)),
        student_profile.get('district', '')
    )
    
    # Step 4: Combine and return
    return jsonify({
        "recommendations": enhanced_recommendations,
        "best_degree": predicted_degree,
        "confidence": confidence
    })
```

### 2. Enhanced Trained Model (`enhanced_trained_model.py`)
**Purpose:** Core ML prediction logic

**Classes:**

#### TrainedModelPredictor
```python
class TrainedModelPredictor:
    def __init__(self):
        self.model = None  # Random Forest
        self.encoders = {}  # Label encoders
        self.le_target = None  # Target encoder
        self._load_model()
    
    def predict_degree(self, student_data):
        """Main prediction method"""
        if self.model is not None:
            # Use trained Random Forest
            prediction = self.model.predict(input_df)
            probabilities = self.model.predict_proba(input_df)
            return {
                "predicted_degree": predicted_degree,
                "confidence": float(max(probabilities)),
                "method": "trained_random_forest"
            }
        else:
            # Fallback to rule-based
            return self._fallback_predict(student_data)
```

#### UniversityRecommender
```python
class UniversityRecommender:
    def recommend_universities(self, predicted_degree, student_z_score, student_district):
        """Recommend universities based on degree and profile"""
        recommendations = {"government": [], "private": []}
        
        # Check each university
        for uni_name, uni_info in UNIVERSITY_DATABASE["government"].items():
            if predicted_degree in uni_info["degrees"]:
                admission_prob = self._calculate_admission_probability(
                    student_z_score,
                    uni_info["z_score_requirements"][predicted_degree],
                    student_district,
                    uni_info.get("district_bonus", {})
                )
                
                if admission_prob > 0.3:
                    recommendations["government"].append({
                        "name": uni_name,
                        "admission_probability": admission_prob,
                        "distance_km": calculated_distance
                    })
        
        return recommendations
```

### 3. Alternative FastAPI Server (`app.py`)
**Purpose:** Modern async alternative to Flask

**Key Differences:**
- Uses Pydantic for request validation
- Native async/await support
- Auto-generated API documentation at `/docs`
- Type-safe with Python type hints

```python
class StudentProfile(BaseModel):
    district: str
    stream: str
    z_score: float
    dream_job: str
    analytical_skill: int
    creativity: int
    # ... other fields

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(student: StudentProfile):
    # Async processing
    recommendations = await calculate_recommendations(student)
    return recommendations
```

## Algorithms & Logic

### 1. Random Forest Prediction Algorithm

**Training Features (20+ inputs):**
```python
numerical_features = [
    'z_score', 'analytical_skill', 'creativity', 'leadership',
    'risk_taking', 'communication_skill', 'problem_solving',
    'teamwork', 'entrepreneural_mindset', 'business_acumen',
    'work_life_balance_priority', 'family_attachment_level',
    'financial_stability_need', 'al_predicted',
    'career_sustainability_priority', 'innovation_interest',
    'social_impact_priority'
]

categorical_features = [
    'district', 'stream', 'preferred_location',
    'travel_tolerance', 'stress_tolerance', 'social_preference'
]
```

**Prediction Process:**
```python
1. Encode categorical variables
   for col, encoder in self.encoders.items():
       input_df[col] = encoder.transform(input_df[col].astype(str))

2. Make prediction
   prediction = self.model.predict(input_df)
   predicted_degree = self.le_target.inverse_transform([prediction[0]])[0]

3. Get confidence score
   probabilities = self.model.predict_proba(input_df)[0]
   confidence = max(probabilities)
```

### 2. Fallback Rule-Based Prediction

**Stream-Based Degree Eligibility:**
```python
def _fallback_predict(self, student_data):
    stream = student_data.get('stream', '')
    z_score = float(student_data.get('z_score', 0))
    
    if stream == "Biological Science":
        if z_score >= 2.0: eligible.append(("Medicine", 0.9))
        if z_score >= 1.7: eligible.append(("Bio Science", 0.8))
        if z_score >= 1.4: eligible.append(("IT", 0.6))
    
    elif stream == "Physical Science":
        if z_score >= 1.8: eligible.append(("Engineering", 0.85))
        if z_score >= 1.5: eligible.append(("Mathematics", 0.8))
        if z_score >= 1.4: eligible.append(("IT", 0.75))
    
    elif stream == "Commerce":
        if z_score >= 1.5: eligible.append(("Business", 0.9))
        if z_score >= 1.4: eligible.append(("Accounting", 0.85))
    
    elif stream == "Arts":
        if z_score >= 1.2: eligible.append(("Arts", 0.9))
        if z_score >= 1.0: eligible.append(("Social Sciences", 0.7))
```

### 3. Admission Probability Algorithm

**Calculation Logic:**
```python
def _calculate_admission_probability(
    self, student_z_score, required_z_score, 
    student_district, district_bonuses
):
    z_score_diff = student_z_score - required_z_score
    
    # Base probability
    if z_score_diff >= 0:
        base_probability = 0.9  # Above cutoff
    elif z_score_diff >= -0.2:
        base_probability = 0.6  # Slightly below
    elif z_score_diff >= -0.5:
        base_probability = 0.3  # Below cutoff
    else:
        base_probability = 0.1  # Far below
    
    # District bonus (e.g., Colombo students get +0.1 for Colombo uni)
    district_bonus = district_bonuses.get(student_district, 0)
    adjusted_probability = min(1.0, base_probability + district_bonus)
    
    return adjusted_probability
```

### 4. University Distance Calculation

**Haversine Formula:**
```python
def _calculate_distance(self, coord1, coord2):
    """Calculate distance between two coordinates in km"""
    R = 6371  # Earth radius in km
    
    lat1, lon1 = radians(coord1['lat']), radians(coord1['lon'])
    lat2, lon2 = radians(coord2['lat']), radians(coord2['lon'])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c
```

### 5. Backward Chaining Algorithm

**For Dream Job Analysis:**
```python
class BackwardChainingModel:
    def __init__(self):
        self.career_graph = nx.DiGraph()
        self._build_knowledge_base()
    
    def _build_knowledge_base(self):
        # Define career requirements
        self.career_knowledge = {
            "Software Engineer": {
                "required_skills": {
                    "programming": 0.9,
                    "logic": 0.85,
                    "problem_solving": 0.8
                },
                "personality_traits": {
                    "analytical": 0.8,
                    "creativity": 0.6
                },
                "degree_paths": {"IT": 0.85, "Engineering": 0.4},
                "z_score_threshold": 1.2,
                "stress_level": 0.6
            }
            # ... more careers
        }
    
    def backward_chain(self, dream_job, student_profile):
        """Work backwards from dream job to required education"""
        career_info = self.career_knowledge.get(dream_job)
        
        # Calculate compatibility scores
        skill_match = self._calculate_skill_match(career_info, student_profile)
        personality_match = self._calculate_personality_match(career_info, student_profile)
        academic_feasibility = self._calculate_academic_feasibility(career_info, student_profile)
        lifestyle_compatibility = self._calculate_lifestyle_compatibility(career_info, student_profile)
        
        return {
            "required_skills": skill_match,
            "recommended_degrees": career_info["degree_paths"],
            "timeline": self._generate_timeline(career_info),
            "feasibility_score": overall_score
        }
```

### 6. Personality Trait Extraction

**Text Analysis (Rule-Based):**
```python
def extract_personality_traits_from_text(description, detected_traits):
    """Convert detected traits to personality scores"""
    personality_scores = {
        'leadership': 1, 'creativity': 1, 'analytical': 1,
        'risk_taking': 1, 'entrepreneurial': 1, 'teamwork': 1,
        'communication': 1, 'adaptability': 1, 'empathy': 1
    }
    
    for trait in detected_traits:
        trait_lower = trait.lower()
        
        if 'leader' in trait_lower:
            personality_scores['leadership'] = min(5, personality_scores['leadership'] + 3)
            personality_scores['teamwork'] = min(5, personality_scores['teamwork'] + 2)
        
        elif 'creative' in trait_lower:
            personality_scores['creativity'] = min(5, personality_scores['creativity'] + 3)
            personality_scores['adaptability'] = min(5, personality_scores['adaptability'] + 2)
        
        elif 'analytical' in trait_lower:
            personality_scores['analytical'] = min(5, personality_scores['analytical'] + 3)
        
        elif 'risk' in trait_lower:
            personality_scores['risk_taking'] = min(5, personality_scores['risk_taking'] + 3)
            personality_scores['entrepreneurial'] = min(5, personality_scores['entrepreneurial'] + 2)
    
    return personality_scores
```

## Data Models

### University Database Structure
```python
UNIVERSITY_DATABASE = {
    "government": {
        "University of Colombo": {
            "degrees": ["IT", "Business", "Bio Science", "Mathematics", "Medicine"],
            "z_score_requirements": {
                "IT": 1.65,
                "Business": 1.50,
                "Bio Science": 1.80,
                "Mathematics": 1.70,
                "Medicine": 2.28
            },
            "district_bonus": {"Colombo": 0.1, "Gampaha": 0.05},
            "location": "Colombo",
            "coordinates": {"lat": 6.9271, "lon": 79.8612},
            "rankings": {"national": 1, "international": 1001},
            "facilities": ["Library", "Labs", "Sports", "Hostels"],
            "specialties": ["Computer Science", "Business", "Medicine"]
        }
        # ... more universities
    },
    "private": {
        "SLIIT": {
            "degrees": ["IT", "Business", "Engineering"],
            "z_score_requirements": {"IT": 1.0, "Business": 1.0, "Engineering": 1.0},
            "tuition_fee_range": {"IT": "500,000-800,000", "Business": "400,000-700,000"},
            "location": "Malabe",
            "coordinates": {"lat": 6.8422, "lon": 80.0921}
        }
        # ... more private universities
    }
}
```

### Career Knowledge Base
```python
CAREER_KNOWLEDGE = {
    "Software Engineer": {
        "required_skills": {
            "programming": 0.9,
            "logic": 0.85,
            "problem_solving": 0.8,
            "mathematics": 0.7
        },
        "personality_traits": {
            "analytical": 0.8,
            "creativity": 0.6,
            "risk_taking": 0.5
        },
        "degree_paths": {"IT": 0.85, "Engineering": 0.4, "Business": 0.2},
        "z_score_threshold": 1.2,
        "future_demand": 0.95,
        "stress_level": 0.6,
        "work_environment": {"office": 0.8, "remote": 0.7}
    }
    # ... more careers
}
```

## API Endpoints Reference

### 1. Health Check
```
GET /health
Response: {"status": "healthy", "model_loaded": true}
```

### 2. Get Recommendations (Main)
```
POST /recommend
Content-Type: application/json

Request Body:
{
    "dream_job": "Software Engineer",
    "district": "Colombo",
    "stream": "Physical Science",
    "z_score": 1.72,
    "analytical_skill": 3,
    "creativity": 3,
    "leadership": 3,
    "risk_taking": 3,
    "communication_skill": 3,
    "problem_solving": 3,
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
    "innovation_interest": 3,
    "social_impact_priority": 3
}

Response:
{
    "recommendations": [
        {
            "degree": "IT",
            "probability": 0.85,
            "overall_score": 0.82,
            "university": "University of Colombo",
            "university_type": "Government",
            "admission_probability": 0.75,
            "skill_match": {"analytical": 0.8, "creativity": 0.6},
            "personality_match": {"analytical": 0.6, "creativity": 0.6},
            "academic_feasibility": {"z_score_feasibility": 0.86},
            "lifestyle_compatibility": {"stress_match": 0.8, "location_match": 0.9},
            "explanation": "Based on your Physical Science stream and 1.72 Z-score...",
            "roadmap": ["Step 1", "Step 2", "Step 3"]
        }
    ],
    "best_degree": "IT",
    "confidence": 0.85
}
```

### 3. Backward Analysis
```
POST /backward-analysis
Content-Type: application/json

Request Body:
{
    "dream_job": "Software Engineer"
}

Response:
{
    "dream_job": "Software Engineer",
    "required_education": "Bachelor's degree in Computer Science...",
    "key_skills": ["Programming", "Problem Solving", "System Design"],
    "career_path": "👨‍💻 Junior Developer → 💻 Software Engineer → 🚀 Senior Engineer...",
    "industries": ["Technology", "Finance", "Healthcare"],
    "timeline": "4 years degree + 2-3 years experience",
    "salary_range": "$60,000 - $150,000+",
    "recommended_degrees": ["IT", "Engineering"],
    "feasibility": "High"
}
```

## Scoring Weights (Current)

The overall recommendation score is calculated as:

```python
weights = {
    "degree_probability": 0.30,      # ML model confidence
    "skill_match": 0.25,               # Skills alignment
    "personality_match": 0.20,         # Personality fit
    "academic_feasibility": 0.15,      # Z-score feasibility
    "lifestyle_compatibility": 0.10    # Location, stress, etc.
}

overall_score = (
    degree_probability * 0.30 +
    avg_skill_match * 0.25 +
    avg_personality_match * 0.20 +
    z_score_feasibility * 0.15 +
    avg_lifestyle_compatibility * 0.10
)
```

## Current Limitations & Issues

### Critical Issues
1. **Interests Not Used** - Frontend sends interests, backend ignores them
2. **Personality Decorative** - Scores calculated but not weighted in algorithm
3. **Lifestyle Ignored** - Preferences collected but don't filter results
4. **Hardcoded Weights** - No dynamic scoring adjustment

### Technical Debt
1. **Model Training Data** - Limited historical data for accurate predictions
2. **No Feedback Loop** - Can't learn from recommendation outcomes
3. **Single Algorithm** - No ensemble or alternative methods
4. **Simplified Logic** - Many rule-based decisions instead of ML

## Future Development Roadmap

### Phase 1: Feature Completion (High Priority)

#### 1.1 Interest Integration
**Status:** Frontend sends, backend ignores
**Implementation:**
```python
# Add to flask_app.py:1360+
student_interests = student_profile.get('interests', [])

INTEREST_DEGREE_MAPPING = {
    "Technology": ["IT", "Engineering", "Data Science"],
    "Art/Design": ["Architecture", "Arts"],
    "Healthcare": ["Medicine", "Bio Science"],
    "Business": ["Business", "Finance", "Marketing"]
}

def _calculate_interest_match(degree, interests):
    matches = sum(1 for interest in interests 
                  if degree in INTEREST_DEGREE_MAPPING.get(interest, []))
    return min(1.0, 0.3 + (matches * 0.2))
```

**Weight Update:**
```python
weights = {
    "degree_probability": 0.25,
    "skill_match": 0.20,
    "personality_match": 0.15,
    "interest_match": 0.15,  # NEW
    "academic_feasibility": 0.15,
    "lifestyle_compatibility": 0.10
}
```

#### 1.2 Personality Scoring Implementation
**Current:** Personality scores extracted but not used
**Target:** Use Big Five/OCEAN model with proper career correlation

```python
# Replace simple 1-5 scale with OCEAN
personality_traits = {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
}

# Career correlation matrix
CAREER_PERSONALITY_PROFILES = {
    "Software Engineer": {
        "openness": 0.8, "conscientiousness": 0.9,
        "extraversion": 0.4, "agreeableness": 0.5,
        "neuroticism": 0.3  # Low neuroticism preferred
    }
}
```

#### 1.3 Lifestyle Filtering
**Current:** Collected but not used
**Target:** Filter universities by lifestyle compatibility

```python
def _filter_by_lifestyle(universities, lifestyle_prefs):
    filtered = []
    for uni in universities:
        score = 0
        
        # Stress tolerance
        if lifestyle_prefs['stress_tolerance'] == 'Low':
            if uni['stress_level'] < 0.5:
                score += 0.3
        
        # Location preference
        if lifestyle_prefs['preferred_location'] == 'Urban':
            if uni['location'] in ['Colombo', 'Kandy']:
                score += 0.3
        
        if score > 0.3:
            filtered.append({**uni, 'lifestyle_score': score})
    
    return filtered
```

### Phase 2: Algorithm Enhancement (Medium Priority)

#### 2.1 Model Retraining Pipeline
**Goal:** Continuously improve ML model with new data
```python
# Collect outcomes
@app.route('/feedback', methods=['POST'])
def collect_feedback():
    {
        "user_id": "...",
        "recommended_degree": "IT",
        "actual_degree": "IT",
        "satisfaction": 4.5,
        "career_outcome": "Software Engineer"
    }

# Retrain monthly
# - Add new data to training set
# - Retrain Random Forest
# - A/B test new model
# - Deploy if improvement > 5%
```

#### 2.2 Ensemble Methods
**Goal:** Combine multiple algorithms
```python
class EnsembleRecommender:
    def __init__(self):
        self.random_forest = TrainedModelPredictor()
        self.backward_chaining = BackwardChainingModel()
        self.rule_based = RuleBasedPredictor()
    
    def predict(self, student_data):
        rf_pred = self.random_forest.predict(student_data)
        bc_pred = self.backward_chaining.predict(student_data)
        rb_pred = self.rule_based.predict(student_data)
        
        # Weighted ensemble
        final_prediction = weighted_vote([
            (rf_pred, 0.5),
            (bc_pred, 0.3),
            (rb_pred, 0.2)
        ])
        
        return final_prediction
```

#### 2.3 Natural Language Processing
**Goal:** Better personality extraction
```python
# Use spaCy or GPT for trait extraction
def extract_traits_with_nlp(description):
    import spacy
    nlp = spacy.load("en_core_web_sm")
    
    doc = nlp(description)
    
    traits = []
    for token in doc:
        if token.pos_ == "ADJ":
            trait = map_adjective_to_trait(token.text)
            if trait:
                traits.append(trait)
    
    return traits
```

### Phase 3: Advanced Features (Low Priority)

#### 3.1 Career Success Prediction
**Goal:** Predict career success, not just degree fit
```python
def predict_career_success(degree, student_profile, career_goal):
    # Historical success rates by degree-career pair
    success_rates = load_career_outcome_data()
    
    # Student aptitude score
    aptitude = calculate_aptitude(student_profile)
    
    # Market demand
    demand = get_market_demand(career_goal)
    
    return {
        "success_probability": success_rates * aptitude * demand,
        "expected_salary": predict_salary(degree, career_goal),
        "time_to_job": predict_job_timeline(degree, career_goal)
    }
```

#### 3.2 Dynamic Z-Score Prediction
**Goal:** Predict A/L Z-score from O/L results
```python
def predict_z_score(ol_results, subject_performance):
    # Historical correlation data
    # Machine learning model trained on past students
    # Inputs: O/L grades, school ranking, district
    # Output: Predicted Z-score range
    
    features = extract_features(ol_results, subject_performance)
    predicted_z = z_score_model.predict(features)
    confidence_interval = calculate_confidence(features)
    
    return {
        "predicted_z_score": predicted_z,
        "confidence_range": [predicted_z - 0.3, predicted_z + 0.3],
        "confidence_level": 0.85
    }
```

#### 3.3 Scholarship Recommendation
**Goal:** Match students with scholarships
```python
SCHOLARSHIP_DATABASE = [
    {
        "name": "Mahapola Scholarship",
        "eligibility": {
            "z_score_min": 1.8,
            "stream": ["Physical Science", "Biological Science"],
            "district": "All",
            "financial_need": True
        },
        "amount": "Full tuition + stipend"
    }
]

def recommend_scholarships(student_profile):
    eligible = []
    for scholarship in SCHOLARSHIP_DATABASE:
        if check_eligibility(student_profile, scholarship['eligibility']):
            eligible.append(scholarship)
    return eligible
```

## Deployment & Operations

### Server Startup
```bash
# Recommended (Flask with full features)
cd /Users/rusiru/Desktop/R26-IT-073/R26-IT-073/backend
python flask_app.py

# Alternative (FastAPI)
python app.py

# Minimal (Simple FastAPI)
python simple_app.py
```

### Environment Variables
```bash
# .env file
FLASK_ENV=production
FLASK_PORT=8006
FIREBASE_PROJECT_ID=edusoul-baeb2
MODEL_PATH=./enhanced_trained_model.pkl
ENABLE_LOGGING=true
```

### Monitoring
```python
# Add to flask_app.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('recommendations.log'),
        logging.StreamHandler()
    ]
)

@app.route('/metrics', methods=['GET'])
def get_metrics():
    return jsonify({
        "total_recommendations": get_total_count(),
        "average_response_time": get_avg_response_time(),
        "model_accuracy": calculate_accuracy(),
        "popular_degrees": get_degree_counts()
    })
```

### Scaling Considerations
1. **Load Balancing** - Use nginx with multiple Flask instances
2. **Caching** - Redis for repeated similar requests
3. **Model Serving** - TensorFlow Serving for high throughput
4. **Database** - Firestore for student data, PostgreSQL for analytics

## Testing Strategy

### Unit Tests
```python
def test_admission_probability():
    recommender = UniversityRecommender()
    prob = recommender._calculate_admission_probability(
        student_z_score=1.8,
        required_z_score=1.65,
        student_district="Colombo",
        district_bonuses={"Colombo": 0.1}
    )
    assert 0.9 <= prob <= 1.0  # Above cutoff + bonus

def test_stream_eligibility():
    predictor = TrainedModelPredictor()
    result = predictor._fallback_predict({
        "stream": "Physical Science",
        "z_score": 1.8
    })
    assert "Engineering" in [d[0] for d in result["eligible_degrees"]]
```

### Integration Tests
```python
def test_full_recommendation_flow():
    client = app.test_client()
    
    response = client.post('/recommend', json={
        "dream_job": "Software Engineer",
        "district": "Colombo",
        "stream": "Physical Science",
        "z_score": 1.72
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
```

### Load Testing
```bash
# Using locust
locust -f locustfile.py --host=http://localhost:8006

# locustfile.py
from locust import HttpUser, task

class RecommendationUser(HttpUser):
    @task
    def get_recommendation(self):
        self.client.post("/recommend", json={
            "dream_job": "Software Engineer",
            "district": "Colombo",
            "stream": "Physical Science",
            "z_score": 1.72
        })
```

---

**Last Updated:** May 2026  
**API Version:** v1.0  
**Maintained By:** FutureDream Backend Team  
**Contact:** backend@futuredream.edu

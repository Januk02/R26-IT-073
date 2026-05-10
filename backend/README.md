# FutureDream Degree Advisor Backend

## 🚀 Overview
Advanced AI-powered backend for FutureDream app featuring backward-chaining degree recommendation system with comprehensive multi-parameter analysis.

## 🧠 Features

### Core AI Engine
- **Backward-Chaining Algorithm**: Starts from dream job and works backwards to degree pathways
- **Multi-Parameter Analysis**: Academic + Personality + Lifestyle compatibility
- **Probabilistic Reasoning**: Weighted scoring based on multiple factors
- **Explainable AI (XAI)**: Clear explanations for recommendations

### Advanced Analytics
- **Career Knowledge Base**: 6 career paths with detailed requirements
- **Skill Matching**: Maps student skills to career requirements
- **Personality Compatibility**: 5 personality traits analysis
- **Lifestyle Factors**: Location, travel, stress tolerance
- **Academic Feasibility**: Z-score + district-based adjustments

### Smart Features
- **Counterfactual Reasoning**: "What if" improvement guidance
- **Long-term Roadmapping**: Bachelor's → Master's → PhD pathways
- **Future Market Analysis**: Career sustainability and demand
- **District Integration**: Sri Lankan university admission factors

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.12)
- **ML**: Scikit-learn Random Forest
- **Data**: Pandas, NumPy
- **Graph**: NetworkX for career pathways
- **Statistics**: SciPy for probabilistic reasoning

## 📦 Installation

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Model Files
Ensure these files are in the backend directory:
- `enhanced_degree_model.pkl` (trained ML model)
- `enhanced_encoders.pkl` (label encoders)
- `enhanced_target_encoder.pkl` (target encoder)

## 🚀 Running the Server

### Development Mode
```bash
python app.py
```

### Production Mode
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```
Returns server status and model availability.

### 2. Degree Recommendations (Backward-Chaining)
```
POST /recommend
```
**Request Body:**
```json
{
  "district": "Colombo",
  "stream": "Physical Science",
  "z_score": 1.8,
  "dream_job": "Software Engineer",
  "analytical_skill": 4,
  "creativity": 3,
  "leadership": 4,
  "risk_taking": 3,
  "communication_skill": 4,
  "problem_solving": 5,
  "teamwork": 4,
  "entrepreneurial_mindset": 1,
  "business_acumen": 3,
  "preferred_location": "Urban",
  "travel_tolerance": "High",
  "stress_tolerance": "Medium",
  "social_preference": "Extrovert",
  "work_life_balance_priority": 4,
  "family_attachment_level": 2,
  "financial_stability_need": 3,
  "ol_results": "A",
  "al_predicted": 1.9,
  "subject_strength": "Mathematics",
  "career_sustainability_priority": 4,
  "innovation_interest": 5,
  "social_impact_priority": 3
}
```

**Response:**
```json
{
  "dream_job": "Software Engineer",
  "recommendations": [
    {
      "degree": "IT",
      "probability": 0.85,
      "overall_score": 0.78,
      "skill_match": {"programming": 0.8, "logic": 0.75},
      "personality_match": {"analytical": 0.8, "creativity": 0.6},
      "academic_feasibility": {"z_score_feasibility": 0.9, "district_adjustment": 1.0},
      "lifestyle_compatibility": {"stress_match": 0.8, "location_match": 0.7},
      "explanation": "Based on your Physical Science stream and 1.8 Z-score...",
      "roadmap": ["Bachelor of Computer Science", "Specialize in AI/ML", ...]
    }
  ],
  "best_degree": "IT",
  "confidence": 0.78,
  "counterfactual_guidance": {
    "z_score": "Improve Z-score to 2.0 for better options",
    "programming": "Strengthen programming skills through practice"
  }
}
```

### 3. ML Prediction
```
POST /predict-ml
```
Uses trained Random Forest model for predictions.

## 🔬 Model Architecture

### Backward-Chaining Algorithm
1. **Input**: Dream job + student profile
2. **Career Analysis**: Match against knowledge base
3. **Degree Pathways**: Calculate probabilities for each degree
4. **Multi-Parameter Scoring**:
   - Academic feasibility (15%)
   - Skill compatibility (25%)
   - Personality match (20%)
   - Degree probability (30%)
   - Lifestyle compatibility (10%)

### Scoring System
- **Z-Score Factor**: Academic capability assessment
- **Stream Compatibility**: A/L stream to degree mapping
- **District Multipliers**: Regional admission factors
- **Personality Traits**: 5-factor psychometric analysis
- **Lifestyle Factors**: Stress, location, social preferences

## 📊 Performance Metrics

- **Model Accuracy**: 80.8% (Random Forest)
- **Features**: 34 comprehensive parameters
- **Training Data**: 1,800 student records
- **Career Paths**: 6 major Sri Lankan careers

## 🔧 Configuration

### Environment Variables
```bash
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=*
```

### Model Files
- `enhanced_degree_model.pkl`: Main ML model
- `enhanced_encoders.pkl`: Feature encoders
- `enhanced_target_encoder.pkl`: Target variable encoder

## 🧪 Testing

### API Testing
```bash
curl -X POST "http://localhost:8000/recommend" \
  -H "Content-Type: application/json" \
  -d @test_request.json
```

### Health Check
```bash
curl http://localhost:8000/health
```

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.12
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
- **AWS**: Elastic Beanstalk or ECS
- **Google Cloud**: Cloud Run
- **Azure**: App Service
- **Heroku**: Dyno deployment

## 🔒 Security

- **CORS**: Configured for development origins
- **Input Validation**: Pydantic models for all endpoints
- **Error Handling**: Comprehensive HTTP exception handling
- **Rate Limiting**: Recommended for production

## 📈 Monitoring

### Logs
- Application logs show model loading status
- Error tracking for API failures
- Performance metrics for response times

### Health Checks
- `/health` endpoint for monitoring
- Model availability status
- Service health indicators

## 🔄 Future Enhancements

1. **Real-time Model Updates**: Online learning capabilities
2. **Advanced XAI**: SHAP values for feature importance
3. **Multilingual Support**: Sinhala/Tamil language processing
4. **Career Market Data**: Integration with job market APIs
5. **Performance Optimization**: GPU acceleration for ML inference

## 📞 Support

For technical support or questions:
- Check API documentation at `http://localhost:8000/docs`
- Review logs for error messages
- Verify model files are in correct directory
- Ensure all dependencies are installed

---

**FutureDream Degree Advisor Backend**  
*Intelligent Career Pathway Recommendation System*

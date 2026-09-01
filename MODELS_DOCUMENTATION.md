# Models & AI Systems Documentation

## Overview
This document explains all AI models, techniques, and algorithms used in the EduSoul degree recommendation system in simple Q&A format with real scenarios.

---

## 🎯 System Architecture

### Q: What is the main purpose of this system?
**A:** The system helps Sri Lankan A/L students choose the right university degree based on their academic results, personality, and career dreams.

### Q: How many AI models are used?
**A:** Three main models:
1. **Backward-Chaining Model** - Rule-based expert system
2. **Random Forest Model** - Machine learning classifier  
3. **Location-Based Model** - Geographic recommendation system

---

## 🧠 Model 1: Backward-Chaining Expert System

### Q: What is Backward-Chaining?
**A:** It's a technique that starts from the goal (dream job) and works backwards to find what's needed (degree). Like: "I want to be a Doctor → What degree do I need? → Medicine"

### Q: How does it work step by step?
**A:** 
1. **Input:** Student enters dream job (e.g., "Software Engineer")
2. **Knowledge Base:** System looks up requirements for that job
3. **Degree Paths:** Finds all degrees that lead to that job
4. **Probability Calculation:** Scores each degree based on student profile
5. **Output:** Ranked list of recommended degrees

### Q: What data does it use?
**A:** 
- **Required Skills:** Programming, logic, mathematics (with importance scores 0-1)
- **Personality Traits:** Analytical, creativity, leadership (with scores)
- **Degree Paths:** Which degrees lead to which careers (with probabilities)
- **Z-Score Thresholds:** Minimum scores needed for each career
- **Future Demand:** Job market predictions
- **Lifestyle Factors:** Stress levels, work environments

### Q: Can you show a real example?
**A:** 
**Scenario:** Student wants to be "Software Engineer"
- **System finds:** IT (85% match), Engineering (40% match), Business (20% match)
- **Student has:** Z-score 1.5, Physical Science stream, high analytical skills
- **System calculates:**
  - IT: 0.85 × (1.5/1.2) × 0.9 (stream match) = **0.96** (96%)
  - Engineering: 0.40 × (1.5/1.5) × 0.9 = **0.36** (36%)
- **Recommendation:** IT degree with 96% confidence

### Q: What are the key algorithms?
**A:**
1. **Probability Adjustment:** `base_prob × (z_score/threshold) × stream_factor`
2. **Skill Matching:** `student_skill / required_skill` (normalized)
3. **Personality Matching:** Compares traits with career requirements
4. **Overall Scoring:** Weighted average of all factors

### Q: Where is this code located?
**A:** 
- `backend/app.py` (lines 88-365)
- `backend/enhanced_trained_model.py` (lines 54-290)

---

## 🌲 Model 2: Random Forest Machine Learning

### Q: What is Random Forest?
**A:** A machine learning algorithm that creates many decision trees and combines their predictions. Like asking 100 experts and taking the majority vote.

### Q: Why Random Forest?
**A:** 
- Handles complex relationships between features
- Works well with both numerical and categorical data
- Provides probability scores (confidence levels)
- Resistant to overfitting
- Achieved **97.3% accuracy** in testing

### Q: What features does it use?
**A:** 22 input features:
1. **Stream:** Bio Science, Physical Science, Commerce, Arts, etc.
2. **Z-Score:** Academic performance (0.0 - 3.0)
3. **District:** Geographic location (25 districts)
4. **Dream Job:** 30 career options
5. **Personality Skills:** Analytical, creativity, leadership (1-10 scale)
6. **Soft Skills:** Communication, problem-solving, teamwork (1-10 scale)
7. **Lifestyle Preferences:** Location, stress tolerance, work-life balance
8. **Future Priorities:** Career sustainability, innovation, social impact

### Q: How was it trained?
**A:** 
1. **Dataset:** 2020 Sri Lankan student data with 34 features
2. **Preprocessing:** Label encoding for categorical variables
3. **Split:** 80% training, 20% testing
4. **Training:** RandomForestClassifier with 100 trees
5. **Validation:** Cross-validation and accuracy testing

### Q: What is the Stream Masking feature?
**A:** A hard constraint that ensures impossible degrees get zero probability. Example: A Bio Science student cannot get Engineering degree.

**Code Logic:**
```python
VALID_DEGREES_FOR_STREAM = {
    "Biological Science": ["Medicine", "Dental", "Nursing", "Pharmacy", "Bio Science", "Agriculture", "Veterinary Science"],
    "Physical Science": ["Engineering", "IT", "Computer Science", "Mathematics", "Physical Science", "Architecture", "Quantity Surveying"],
    "Commerce": ["Business", "Management", "Accounting", "Finance"],
    "Arts": ["Arts", "Law", "Education", "Social Sciences", "Fine Arts"],
    "Engineering Technology": ["IT", "Engineering", "Computer Science", "Quantity Surveying"],
    "Bio Systems Technology": ["Bio Science", "Agriculture", "IT"]
}
```

**Total Degrees Available:** 30 unique degree programs across 6 A/L streams

### Q: How does it make predictions?
**A:** 
1. **Input:** Student profile converted to feature vector
2. **Encoding:** Categorical variables transformed to numbers
3. **Prediction:** Random Forest outputs class probabilities
4. **Masking:** Impossible degrees set to zero probability
5. **Renormalization:** Probabilities rescaled to sum to 1.0
6. **Output:** Degree with highest probability

### Q: Where is this code located?
**A:** 
- `NoteBook/student_model (1).ipynb` (training notebook)
- `backend/enhanced_trained_model.py` (lines 424-509)
- Model files: `enhanced_degree_model.pkl`, `enhanced_encoders.pkl`

---

## 📍 Model 3: Location-Based Recommendation System

### Q: What does this model do?
**A:** Recommends specific universities based on student's district, calculating admission probability and travel distance.

### Q: How does it calculate distance?
**A:** Uses Haversine formula to calculate great-circle distance between coordinates:
```python
distance = 6371 * c  # Earth's radius in km
```

### Q: What data does it use?
**A:** 
- **University Cutoffs:** Minimum Z-scores for each university
- **District Coordinates:** GPS coordinates of 25 Sri Lankan districts
- **University Coordinates:** GPS coordinates of major universities
- **District Bonus:** Extra probability for local students

### Q: How is admission probability calculated?
**A:** 
- **Above cutoff:** `0.5 + (z_score - cutoff) × 2`
- **Near cutoff (within 0.2):** 30% probability
- **Below cutoff:** 10% probability
- **District bonus:** +10% for local students

### Q: Can you show a real example?
**A:** 
**Scenario:** Student from Jaffna, Z-score 1.6, wants IT
- **University of Moratuwa:** Cutoff 1.55, Distance 300km
  - Probability: 0.5 + (1.6-1.55)×2 = **60%**
- **University of Jaffna:** Cutoff 1.45, Distance 5km
  - Probability: 0.5 + (1.6-1.45)×2 = **80%** + 15% district bonus = **95%**
- **Recommendation:** Jaffna University (95% vs 60%)

### Q: Where is this code located?
**A:** 
- `backend/enhanced_recommendation_system.py` (full file)

---

## 🎨 Frontend Components

### Q: How does the frontend collect data?
**A:** Through interactive multi-step forms:

**Step 1: Academic Input** (`InputStepAcademic.jsx`)
- Stream selection (6 streams with icons)
- Z-score input (0.00 - 3.50)
- Subject selection (Arts stream uses bucket system)
- Subject grades (A, B, C, S, F)

**Step 2: Personality Input** (`InputStepPersonality.jsx`)
- 8 personality traits with sliders (1-10 scale)
- Visual feedback with color-coded scores
- Trait descriptions and low/high labels

**Step 3: Lifestyle Input**
- Location preference (Urban, Suburban, Rural)
- Stress tolerance (Low, Medium, High)
- Work-life balance priority
- Family attachment level

### Q: How is data sent to backend?
**A:** Through REST API endpoints:
- `POST /recommend` - Main recommendation endpoint
- `POST /predict-ml` - ML model prediction endpoint

### Q: What does the response contain?
**A:** 
- **Recommended degrees** with confidence scores
- **Skill match analysis** for each degree
- **Personality compatibility** scores
- **Academic feasibility** assessment
- **Lifestyle compatibility** evaluation
- **University recommendations** with admission probability
- **Career roadmap** for each degree
- **Counterfactual guidance** (how to improve)

---

## 📊 Datasets & File Locations

### Q: What datasets are used and where are they located?
**A:** Complete file mapping for all datasets:

#### **1. Frontend Data Files**

**Stream & Academic Data**
- **File:** `edusoul-app/Member1/data/inputConstants.js`
- **Contains:**
  - `STREAM_SUBJECTS` - 6 A/L streams with subjects and degree paths
  - `ALL_DISTRICTS` - 25 Sri Lankan districts
  - `CATEGORY_COLORS` - Career category color schemes

**Career & Personality Data**
- **File:** `edusoul-app/Member1/data/dreamDegreeData.js`
- **Contains:**
  - `dreamJobs` - 30 career options with details
  - `personalityTraits` - 8 personality traits with descriptions
  - `lifestyleFactors` - 6 lifestyle preference categories

**Language Translations**
- **File:** `edusoul-app/Member1/data/languageTranslations.js`
- **Contains:** Multi-language support for UI

#### **2. Frontend Component Files**

**Academic Input Component**
- **File:** `edusoul-app/Member1/components/InputStepAcademic.jsx`
- **Collects:** Stream selection, Z-score, subject grades

**Personality Input Component**
- **File:** `edusoul-app/Member1/components/InputStepPersonality.jsx`
- **Collects:** 8 personality trait scores (1-10 scale)

**Lifestyle Input Component**
- **File:** `edusoul-app/Member1/components/InputStepLifestyle.jsx`
- **Collects:** Location, work-life balance, family attachment preferences

**Personal Info Component**
- **File:** `edusoul-app/Member1/components/InputStepPersonal.jsx`
- **Collects:** Name, age, district, dream job selection

**Main Input Page**
- **File:** `edusoul-app/Member1/pages/DreamDegreeInput.jsx`
- **Integrates:** All input components and data flow

#### **3. Backend Data Files**

**Training Dataset (Original)**
- **File:** `NoteBook/university_2020 (1).csv`
- **Contains:** 2020 Sri Lankan student data
- **Features:** Academic results, streams, Z-scores, university admissions

**Enhanced Student Dataset**
- **File:** Generated in `NoteBook/student_model (1).ipynb`
- **Contains:** 34 features per student
- **Features:**
  - Academic: stream, z_score, subject_combination, degree_program
  - Personality: analytical_skill, creativity, leadership, risk_taking
  - Skills: communication_skill, problem_solving, teamwork
  - Lifestyle: preferred_location, travel_tolerance, stress_tolerance
  - Priorities: work_life_balance_priority, family_attachment_level
  - Career: dream_job, career_sustainability_priority, innovation_interest

**University Cutoff Data**
- **File:** Embedded in `backend/enhanced_recommendation_system.py`
- **Contains:** `UNIVERSITY_CUTOFFS` dictionary
- **Features:** University names, cutoff Z-scores, GPS coordinates

**District Coordinates**
- **File:** Embedded in `backend/enhanced_recommendation_system.py`
- **Contains:** `DISTRICT_COORDINATES` dictionary
- **Features:** 25 districts with latitude/longitude

#### **4. Backend Model Files**

**Main API Application**
- **File:** `backend/app.py`
- **Contains:**
  - Backward-chaining model implementation (lines 88-365)
  - Career knowledge base (lines 97-152)
  - Roadmap generation (lines 370-402)
  - Counterfactual guidance (lines 404-437)
  - API endpoints (lines 439-565)

**ML Model Integration**
- **File:** `backend/enhanced_trained_model.py`
- **Contains:**
  - Trained model loader (lines 23-52)
  - Fallback career knowledge base (lines 54-290)
  - Feature preparation (lines 293-422)
  - Prediction logic (lines 424-509)
  - Stream masking (lines 450-460)

**Location-Based System**
- **File:** `backend/enhanced_recommendation_system.py`
- **Contains:**
  - University cutoff data (lines 69-101)
  - District coordinates (lines 104-128)
  - Distance calculation (lines 130-141)
  - Admission probability logic (lines 143-193)

#### **5. Trained Model Files**

**Random Forest Model**
- **File:** `backend/enhanced_degree_model.pkl`
- **Contains:** Trained RandomForestClassifier (97.3% accuracy)

**Label Encoders**
- **File:** `backend/enhanced_encoders.pkl`
- **Contains:** Encoders for categorical variables (stream, district, dream_job, etc.)

**Target Encoder**
- **File:** `backend/enhanced_target_encoder.pkl`
- **Contains:** Encoder for degree program labels

#### **6. Training Notebook**

**Model Training**
- **File:** `NoteBook/student_model (1).ipynb`
- **Contains:**
  - Data loading and preprocessing
  - Feature engineering
  - Model training (Random Forest)
  - Model evaluation
  - Model export to .pkl files

#### **7. Additional Data Files**

**Mentorship System Data**
- **Directory:** `NoteBook/complete_mentorship_system/`
- **Files:** 
  - `enhanced_mentors.csv` - Mentor profiles
  - `enhanced_mentees.csv` - Student profiles
  - `mentorship_matching.csv` - Matching results

**AI Engine Data**
- **Directory:** `ai-engine/data/`
- **Files:**
  - `delta_new_jobs.csv` - Job market data
  - `cleaned_multi_role_jobs.csv` - Multi-role job data
  - `detailed_software_engineer_jobs.csv` - Software engineering jobs

**Stress Analyzer Data**
- **Directory:** `Stress Analyser/`
- **Files:**
  - `data/student_wellbeing_dataset (2).csv` - Student wellbeing data
  - `models/stress_label_encoder.pkl` - Stress model encoder
  - `models/mood_rf_model.pkl` - Mood prediction model

### Q: How was the training data created?
**A:** 
- Base data from real 2020 student records (`university_2020 (1).csv`)
- Enhanced with logical personality mappings in notebook
- Added lifestyle preferences with realistic distributions
- Mapped degrees to dream jobs logically
- Generated 34 features per student for ML training

---

## 🛣️ Roadmap Generation

### Q: How are career roadmaps created?
**A:** Pre-defined educational pathways for each degree:

**Example - IT Degree Roadmap:**
1. Bachelor of Computer Science (4 years)
2. Specialize in AI/ML/Software Engineering
3. Consider Master's in Computer Science (2 years)
4. Pursue certifications (AWS, Google Cloud)
5. Career paths: Software Engineer, Data Scientist, AI Researcher

**Example - Medicine Roadmap:**
1. Bachelor of Medicine & Surgery (5 years)
2. Internship and residency (2-3 years)
3. Specialization (Cardiology, Neurology, etc.)
4. Consider Master's in Public Health
5. Career paths: Doctor, Medical Researcher, Public Health Officer

### Q: Where is this code?
**A:** `backend/app.py` (lines 370-402)

---

## 💡 Counterfactual Guidance

### Q: What is counterfactual guidance?
**A:** Personalized advice on how to improve chances for desired degrees.

### Q: What kind of guidance is provided?
**A:** 
- **Z-score improvement:** "Improve Z-score to 1.5 for better options"
- **Skill development:** "Strengthen programming skills through practice"
- **Personality development:** "Develop leadership qualities through workshops"
- **Academic focus:** "Focus on mathematics subjects"

### Q: How is it generated?
**A:** Based on gap analysis:
- Compare student scores with career requirements
- Identify areas below threshold (usually <0.6)
- Generate specific improvement suggestions

### Q: Where is this code?
**A:** `backend/app.py` (lines 404-437)

---

## 🎯 Complete Workflow Example

### Scenario: Student Profile
- **Name:** Tharindu
- **Stream:** Physical Science
- **Z-Score:** 1.65
- **District:** Kandy
- **Dream Job:** Data Scientist
- **Personality:** High analytical (8/10), Medium creativity (5/10)
- **Skills:** Good problem-solving (7/10), Average leadership (4/10)

### Step 1: Data Collection
Frontend collects all inputs through interactive forms.

### Step 2: Backward-Chaining Analysis
System looks up "Data Scientist" requirements:
- Required skills: Statistics (0.9), Programming (0.85), Analysis (0.8)
- Degree paths: IT (0.8), Mathematics (0.6), Business (0.3)
- Z-score threshold: 1.4

### Step 3: Probability Calculation
- **IT:** 0.8 × (1.65/1.4) × 0.9 (stream match) = **0.85** (85%)
- **Mathematics:** 0.6 × (1.65/1.4) × 0.9 = **0.64** (64%)
- **Business:** 0.3 × (1.65/1.4) × 0.5 = **0.18** (18%)

### Step 4: Skill Matching
- Analytical skill: 8/10 ÷ 0.9 required = **0.89** (89% match)
- Creativity: 5/10 ÷ 0.7 required = **0.71** (71% match)
- Problem-solving: 7/10 ÷ 0.8 required = **0.88** (88% match)

### Step 5: Random Forest Prediction
ML model processes 22 features and outputs:
- **Predicted degree:** IT
- **Confidence:** 92%
- **Method:** trained_random_forest

### Step 6: Location Analysis
For IT degree:
- **University of Peradeniya:** Cutoff 1.50, Distance 10km
  - Probability: 0.5 + (1.65-1.50)×2 = **80%** + 10% local bonus = **90%**
- **University of Moratuwa:** Cutoff 1.55, Distance 100km
  - Probability: 0.5 + (1.65-1.55)×2 = **70%**

### Step 7: Overall Recommendation
**Primary Recommendation:** IT Degree
- **Confidence:** 92%
- **Best University:** Peradeniya (90% admission probability)
- **Roadmap:** CS degree → AI specialization → Cloud certifications

### Step 8: Guidance
**Counterfactual Advice:**
- "Your analytical skills are excellent (89%)"
- "Improve creativity through design thinking courses"
- "Consider mathematics as secondary option"

---

## 🔧 Technical Implementation

### Q: What technologies are used?
**A:** 
- **Backend:** Python, FastAPI, scikit-learn
- **Frontend:** React, JavaScript
- **ML:** Random Forest, Label Encoding
- **Data:** Pandas, NumPy
- **API:** REST with CORS support
- **Model Storage:** joblib (.pkl files)

### Q: How are models deployed?
**A:** 
- Models loaded at startup in FastAPI app
- Encoders for categorical variables
- Fallback system if ML model unavailable
- Real-time prediction on API requests

### Q: What is the fallback mechanism?
**A:** If trained ML model fails, system automatically uses backward-chaining model as backup, ensuring always available recommendations.

---

## 📈 Performance Metrics

### Q: How accurate is the system?
**A:** 
- **Random Forest Accuracy:** 97.3%
- **Backward-Chaining:** Rule-based (100% consistent)
- **Location Model:** Based on real cutoff data

### Q: How fast are predictions?
**A:** 
- **Backward-Chaining:** <50ms
- **Random Forest:** <100ms
- **Location Calculation:** <30ms
- **Total Response Time:** <200ms

---

## 🎓 Key Features Summary

### 1. Multi-Model Approach
- Combines rule-based and ML approaches
- Provides both explainable and data-driven recommendations
- Fallback ensures reliability

### 2. Comprehensive Analysis
- Academic feasibility (Z-score, stream)
- Skill compatibility (8 personality traits)
- Lifestyle fit (location, stress, work-life)
- Career alignment (dream job matching)

### 3. Personalized Guidance
- Degree-specific roadmaps
- Improvement suggestions
- University recommendations
- Admission probability estimates

### 4. Sri Lankan Context
- Local university cutoffs
- District-based advantages
- A/L stream requirements
- Geographic considerations

---

## 🔍 Code References

### Backend Files
- `backend/app.py` - Main API and backward-chaining model
- `backend/enhanced_trained_model.py` - ML model integration
- `backend/enhanced_recommendation_system.py` - Location-based system

### Frontend Files
- `edusoul-app/Member1/components/InputStepAcademic.jsx` - Academic input
- `edusoul-app/Member1/components/InputStepPersonality.jsx` - Personality input

### Training Files
- `NoteBook/student_model (1).ipynb` - Model training notebook
- `NoteBook/university_2020 (1).csv` - Dataset

### Model Files
- `enhanced_degree_model.pkl` - Trained Random Forest
- `enhanced_encoders.pkl` - Label encoders
- `enhanced_target_encoder.pkl` - Target variable encoder

---

## ❓ Frequently Asked Questions

### Q: Can the system handle new careers not in training data?
**A:** Yes, the backward-chaining model can be extended with new career definitions in the knowledge base.

### Q: What if a student's Z-score is very low?
**A:** System provides realistic guidance and suggests alternative pathways or skill development areas.

### Q: How often are university cutoffs updated?
**A:** Cutoffs should be updated annually with new UGC data. Currently using 2020 data.

### Q: Can the system recommend private universities?
**A:** Currently focuses on state universities. Can be extended with private institution data.

### Q: How are personality scores validated?
**A:** Self-reported by students. System provides realistic ranges and prevents extreme values.

---

## 🚀 Future Enhancements

### Planned Features
1. **Real-time cutoff updates** - API integration with UGC
2. **Private university data** - Expand institution coverage
3. **Scholarship matching** - Financial aid recommendations
4. **Career trend analysis** - Future job market predictions
5. **Alumni success stories** - Real career path examples
6. **Mobile app** - Native iOS/Android applications

---

## 📞 Contact & Support

For questions about models, algorithms, or implementation:
- Review code comments in source files
- Check training notebook for methodology
- Refer to this documentation for architecture

---

**Document Version:** 1.0  
**Last Updated:** September 2026  
**System Version:** EduSoul Degree Advisor v1.0.0

# Dream Degree Advisor — Technical Guide

This guide covers **only Member 1: the Dream Degree Advisor**. It documents the files that currently implement it, the exact data path, model artifacts, algorithms, and the correct way to describe its accuracy.

## 1. What the feature does

The advisor helps a Sri Lankan A/L student select a degree and possible universities from their career goal, academic profile, personality scores, lifestyle preferences, district, and Z-score.

It is a hybrid system:

1. A **trained Random Forest classifier** predicts and ranks compatible degree classes.
2. A **rule-based fallback** supplies results if the serialized model cannot load.
3. A **university matching rule engine** estimates admission suitability from degree availability, Z-score requirements, district bonuses, and geographic proximity.
4. A **backward-analysis knowledge base** works from the target career backwards to show education, skills, and career-path information.

> Important: a model confidence is not an accuracy. The current project does not store a reproducible held-out test score for the Dream Degree Random Forest. Do not present old documentation values such as 97.3%, 80.8%, or 94.5% as its verified accuracy until the training notebook is rerun and its metrics are saved.

## 2. Component map

| Layer | Purpose | Main files |
|---|---|---|
| Application routing | Opens the Dream Degree Advisor in the main web app | `edusoul-app/src/App.jsx` |
| Feature controller | Holds advisor state, saves profile to Firestore, calls APIs and switches screens | `edusoul-app/Member1/index.jsx` |
| Student input UI | Multi-step form and validation | `edusoul-app/Member1/pages/DreamDegreeInput.jsx` |
| Input steps | Personal, academic, personality, and lifestyle inputs | `edusoul-app/Member1/components/InputStepPersonal.jsx`, `InputStepAcademic.jsx`, `InputStepPersonality.jsx`, `InputStepLifestyle.jsx` |
| Result screens | Recommendation cards, roadmap, guidance, profile | `edusoul-app/Member1/pages/DreamDegreeResults.jsx`, `DreamDegreeRoadmap.jsx`, `DreamDegreeGuidance.jsx`, `StudentProfile.jsx` |
| Frontend request mapper | Converts UI values to model-ready JSON | `edusoul-app/Member1/services/apiService.js` |
| Static UI knowledge | Career cards, input constants, translations | `edusoul-app/Member1/data/dreamDegreeData.js`, `inputConstants.js`, `languageTranslations.js` |
| Live API server | Receives requests and assembles the response | `backend/flask_app.py` |
| Degree ML and university engine | Loads model, predicts degrees, recommends universities | `backend/enhanced_trained_model.py` |
| Saved ML artifacts | Random Forest and label encoders | `backend/logical_degree_model.pkl`, `logical_encoders.pkl`, `logical_target_encoder.pkl` |
| Training reference data | University cutoff data used by the project/notebook work | `NoteBook/university_2020 (1) (1).csv` |
| Training notebook | Original experiment/training reference | `NoteBook/student_model (1).ipynb` |

`backend/app.py` is a separate **FastAPI alternative**, not the server called by the current Member 1 frontend. The active frontend defaults to `http://localhost:8006`, which is the Flask server.

## 3. Saved model (`.pkl`) files

| File | Role | Current inspected contents |
|---|---|---|
| `backend/logical_degree_model.pkl` | Degree classifier | `RandomForestClassifier`: 400 trees, maximum depth 25, `class_weight='balanced'`, `random_state=42`; predicts 23 degree classes from 20 features. |
| `backend/logical_encoders.pkl` | Input encoders | A dictionary of `LabelEncoder`s for `stream`, `district`, `dream_job`, `preferred_location`, and `stress_tolerance`. |
| `backend/logical_target_encoder.pkl` | Output decoder | Converts the predicted numeric class back to the degree name. |

The 23 current output degrees are: Accounting, Agriculture, Architecture, Arts, Bio Science, Business, Computer Science, Dental, Education, Engineering, Finance, Fine Arts, IT, Law, Management, Mathematics, Medicine, Nursing, Pharmacy, Physical Science, Quantity Surveying, Social Sciences, and Veterinary Science.

These files are loaded by `TrainedModelPredictor` in `backend/enhanced_trained_model.py`. `.pkl` files are executable Python serializations: only load artifacts created by a trusted source and use a compatible scikit-learn version. The local artifacts were created with a newer scikit-learn version than one inspected environment, which raised version-compatibility warnings.

## 4. Dataset and research techniques

### Dataset locations

| File | Contents | Use in this component |
|---|---|---|
| `NoteBook/university_2020 (1) (1).csv` | 150 rows: `year`, `district`, `degree_program`, `university`, `cutoff_z` | Reference data for university admission/cutoff analysis. |
| `NoteBook/student_model (1).ipynb` | Training notebook | The project’s source for the degree-model experiment. |
| `edusoul-app/Member1/data/dreamDegreeData.js` | Curated careers, descriptions, traits and UI metadata | Frontend selection lists and explanations—not a machine-learning CSV. |
| `edusoul-app/Member1/data/inputConstants.js` | Streams, subjects, districts and form constants | Frontend form constraints—not a training dataset. |
| `backend/flask_app.py` | Embedded university catalogue | Runtime university data: available degrees, requirements, locations, bonuses, facilities and rankings. |

### Techniques used

- **Supervised multiclass classification:** Random Forest maps a student feature vector to one of the 23 degree labels.
- **Label encoding:** Categorical inputs become integer values before inference; see `logical_encoders.pkl`.
- **Probability ranking:** `predict_proba()` produces degree probabilities; `predict_degree()` returns the highest class and a recommendation list.
- **Rule-based fallback:** if artifacts are unavailable or input encoding fails, `enhanced_trained_model.py` applies Z-score, stream-to-degree compatibility and career-to-degree rules.
- **Backward chaining:** starts with the dream job, then retrieves expected education, skills, career path, industries and timeline; the endpoint is `/backward-analysis`.
- **Eligibility and proximity heuristics:** university results are filtered by whether the degree is available; government admission bands use Z-score difference plus any district bonus, while distance uses the Haversine formula.
- **Explainable output:** the API returns the selected model method, confidence, factors used, degree explanation, roadmap and university details.

### Research techniques used in this component

| Research technique | How it is used in Dream Degree Advisor | Code/data location |
|---|---|---|
| **Supervised multiclass learning** | The system learns to classify a student profile into one of 23 degree programmes. | `logical_degree_model.pkl`; `NoteBook/student_model (1).ipynb` |
| **Ensemble learning (Random Forest)** | 400 decision trees vote together to estimate degree probabilities. `class_weight='balanced'` reduces bias toward common degree classes. | `backend/logical_degree_model.pkl`; `enhanced_trained_model.py` |
| **Feature engineering** | Raw form responses are transformed into 20 meaningful features: academics, personality, career goal, district and lifestyle preferences. Slider scores are normalized from 1–10 to 1–5. | `edusoul-app/Member1/services/apiService.js` |
| **Categorical encoding** | Text categories such as A/L stream, district, dream job, preferred location and stress tolerance are converted to integer labels before model inference. | `backend/logical_encoders.pkl`; `TrainedModelPredictor.predict_degree()` |
| **Domain-knowledge constraints** | Stream masking removes degree classes that are incompatible with a student’s A/L stream, then normalizes the remaining probabilities. This combines ML with Sri Lankan education rules. | `backend/enhanced_trained_model.py` (`VALID_DEGREES_FOR_STREAM`) |
| **Hybrid recommendation** | If model loading or prediction fails, the system uses transparent Z-score, stream compatibility and career-degree rules instead of returning no recommendation. | `_fallback_predict()` in `enhanced_trained_model.py` |
| **Rule-based expert reasoning / backward chaining** | Starting from the desired job, the system presents required education, skills, industries and future career steps. | `/backward-analysis` in `backend/flask_app.py` |
| **Multi-criteria decision analysis** | University suitability uses more than one criterion: degree availability, Z-score requirement, district bonus, admission band and distance. | `UniversityRecommender` in `enhanced_trained_model.py` |
| **Geospatial analysis** | The Haversine formula estimates distance between the student’s district and university coordinates. | `_calculate_distance()` in `enhanced_trained_model.py` |
| **Counterfactual explanation** | Guidance answers “what can improve?” using explicit conditions, such as Z-score below 2.0 or a personality score below 6. | `DreamDegreeGuidance.jsx` |
| **Explainable AI (XAI) presentation** | Results exposes the prediction method, confidence, input factors, score breakdowns, explanations and cutoff comparisons rather than showing only a final label. | `DreamDegreeResults.jsx`; `flask_app.py` |
| **Template-based personalisation** | Roadmap fills structured academic, entrepreneurial and industry templates with the selected degree, university, stream and dream job. | `DreamDegreeRoadmap.jsx` |

### Short presentation answer

> “Our research approach is a hybrid recommendation system. We use supervised Random Forest classification for degree ranking, feature engineering and label encoding for student inputs, domain rules to enforce A/L stream eligibility, and multi-criteria university matching using Z-score, district and distance. We improve transparency through counterfactual guidance and explainable result breakdowns.”

### Important research limitation

The current repository contains the trained artifacts and a training notebook, but it does not contain a saved, reproducible evaluation report for this exact Dream Degree model. The implementation should therefore report **prediction confidence**, not an unverified accuracy percentage. A formal research evaluation should use a held-out test set or stratified cross-validation and report accuracy, macro precision, recall, F1-score, a confusion matrix, and top-k degree accuracy.

## 5. Model features: how the dataset reaches the model

The Random Forest expects these **20 features**, in this exact order:

```text
stream, z_score, district, dream_job,
analytical_skill, creativity, leadership, communication_skill,
problem_solving, teamwork, adaptability, attention_to_detail,
preferred_location, stress_tolerance, work_life_balance_priority,
family_attachment_level, financial_stability_need,
career_sustainability_priority, innovation_interest, social_impact_priority
```

The mapping happens in `edusoul-app/Member1/services/apiService.js`:

| UI input | Backend/model feature conversion |
|---|---|
| A/L stream, district, dream job | Sent as text; backend label-encodes supported values. |
| Z-score | Parsed to a number. The UI rejects values outside 0–4. |
| Personality sliders (1–10) | Converted to a 1–5 value with `Math.round(score / 2)`. |
| Lifestyle text values | Converted with a fixed 1–5 mapping: e.g. `Very Important → 5`, `Moderate → 3`, `Low → 2`; location uses `Urban → 5`, `Suburban/Any → 3`, `Rural → 1`. |
| Creativity score | Also becomes `innovation_interest`. |
| Other form fields | `name`, age, subjects and full preference objects are retained for display/storage, but are not part of the 20-feature Random Forest vector. |

At inference, `TrainedModelPredictor.predict_degree()` creates the vector, label-encodes categorical fields, calls the Random Forest, decodes the predicted target label, and returns its probability. Unknown categorical values are handled by fallback/default paths, so training data must be expanded before claiming support for a new stream, job, district, or preference category.

## 6. End-to-end feature flow

```text
Student completes four-step form
        ↓
DreamDegreeInput.jsx builds one profile object
        ↓
Member1/index.jsx saves the profile to Firestore (when authenticated)
        ↓
apiService.js validates and maps strings/sliders to model features
        ↓
POST http://localhost:8006/recommend
        ↓
flask_app.py validates required dream_job, stream and z_score
        ↓
enhanced_trained_model.py loads encoders + Random Forest → ranked degrees
        ↓
UniversityRecommender filters and scores universities
        ↓
flask_app.py adds explanation, roadmap, model transparency fields
        ↓
DreamDegreeResults.jsx displays degree and university recommendations
```

In parallel, `Member1/index.jsx` calls `POST /backward-analysis` with `{ "dream_job": "…" }`. Its result enriches the guidance/results view but intentionally does not stop degree recommendations if it fails for an unsupported custom job.

## 7. Component structure

```text
Dream Degree Advisor (Member 1)
│
├── Entry and state
│   ├── edusoul-app/src/App.jsx
│   │   └── Opens Member1DreamDegreeAdvisor
│   └── edusoul-app/Member1/index.jsx
│       ├── Keeps current screen, profile, API results and errors in state
│       ├── Saves signed-in student profiles to Firebase Firestore
│       └── Calls /recommend and /backward-analysis
│
├── Student-facing screens
│   ├── pages/DreamDegreeHome.jsx       → landing screen
│   ├── pages/DreamDegreeInput.jsx      → coordinates the multi-step form
│   ├── pages/DreamDegreeResults.jsx    → ranked degree/university results
│   ├── pages/DreamDegreeRoadmap.jsx    → selected degree roadmap
│   ├── pages/DreamDegreeGuidance.jsx   → backward career guidance
│   └── pages/StudentProfile.jsx        → saved profile view
│
├── Input components
│   ├── components/InputStepPersonal.jsx    → name, district, career goal
│   ├── components/InputStepAcademic.jsx    → A/L stream, Z-score, subjects
│   ├── components/InputStepPersonality.jsx → personality sliders
│   └── components/InputStepLifestyle.jsx   → lifestyle preferences
│
├── Client data/API layer
│   ├── data/dreamDegreeData.js        → career and UI knowledge
│   ├── data/inputConstants.js          → streams, subjects, districts
│   └── services/apiService.js          → validates/maps data and sends HTTP
│
└── Python service (backend/)
    ├── flask_app.py                    → Flask routes and response assembly
    ├── enhanced_trained_model.py       → Random Forest + university engine
    ├── logical_degree_model.pkl        → 400-tree trained classifier
    ├── logical_encoders.pkl            → input label encoders
    └── logical_target_encoder.pkl      → degree-name output decoder
```

## 8. Demo: how the feature works

Use this example in a presentation or live demonstration.

### Demo student profile

| Form step | Student enters | Why it matters |
|---|---|---|
| Personal | Name: Nethmi; District: Colombo; dream job: Software Engineer | District helps university suitability; dream job helps career and degree alignment. |
| Academic | Physical Science; Z-score: 1.55 | Stream and Z-score are key eligibility features. |
| Personality | Analytical thinking: 9; problem solving: 9; creativity: 7; teamwork: 7 | The UI converts each 1–10 slider score to the model’s 1–5 scale. |
| Lifestyle | Urban; high stress tolerance; career growth very important | Converts preferences to numeric or categorical model features. |

### What the user does

1. Open **Dream Degree Advisor** and press **Start**.
2. Complete Personal, Academic, Personality, and Lifestyle screens.
3. Press **Analyze My Future** (the final form action).
4. The app shows the loading screen: personality analysis, career prediction, university matching, admission probability, and roadmap generation.
5. The Results screen presents ranked degree pathways, the best matched university, admission likelihood, explanation, and a roadmap. The user can open a roadmap or backward career guidance.

### What happens in code during this demo

```text
1. DreamDegreeInput.jsx returns formData
   {
     dreamJob: "Software Engineer",
     personalInfo: { district: "Colombo", ... },
     academicResults: { stream: "Physical Science", zScore: 1.55, ... },
     personalityScores: { analytical_thinking: 9, problem_solving: 9, ... },
     lifestylePreferences: { locationPreference: "Urban", ... }
   }

2. Member1/index.jsx → handleAnalyze(formData)
   • saves the original profile to Firestore if the student is logged in
   • starts these two API calls at the same time:
       getRecommendations(formData)
       getBackwardAnalysis("Software Engineer")

3. apiService.js → mapFormDataToBackend(formData)
   • 9 / 2 → analytical_skill: 5
   • 7 / 2 → creativity: 4
   • "Urban" → preferred_location: "Urban"
   • "High" stress tolerance → stress_tolerance: 5
   • sends the normalized JSON to POST /recommend

4. flask_app.py → /recommend
   • verifies dream_job, stream and z_score
   • calls model_predictor.predict_degree(profile)

5. enhanced_trained_model.py → TrainedModelPredictor
   • loads the Random Forest and encoders
   • converts stream/district/job/location/stress level to encoded numbers
   • passes the 20-feature vector to the 400-tree Random Forest
   • returns ranked degree probabilities, for example IT / Computer Science / Engineering

6. UniversityRecommender
   • keeps universities that offer the predicted degree
   • compares 1.55 against that degree’s stored Z-score requirement
   • applies a Colombo district bonus where configured
   • calculates distance from district/university coordinates
   • sorts the government and private recommendations

7. DreamDegreeResults.jsx
   • receives JSON from Flask
   • shows the recommendation and lets the student open its roadmap
```

### Example normalized request

This is the kind of request that is sent by the current frontend. Values are illustrative, but the field names match the component.

```json
{
  "dream_job": "Software Engineer",
  "z_score": 1.55,
  "stream": "Physical Science",
  "district": "Colombo",
  "analytical_skill": 5,
  "creativity": 4,
  "leadership": 3,
  "communication_skill": 4,
  "problem_solving": 5,
  "teamwork": 4,
  "adaptability": 4,
  "attention_to_detail": 4,
  "preferred_location": "Urban",
  "stress_tolerance": 5,
  "work_life_balance_priority": 3,
  "family_attachment_level": 3,
  "financial_stability_need": 4,
  "career_sustainability_priority": 5,
  "innovation_interest": 4,
  "social_impact_priority": 3
}
```

### Expected demo outcome

The exact ranked degree and probability depend on the saved model and input values. In a live demo, describe the result as:

> “The model ranks degree pathways from the student’s 20 features. Then the advisor filters universities that offer the top degree, compares the student’s Z-score with its requirement, applies the available district bonus, and presents an eligibility-oriented recommendation with a roadmap.”

Do not promise a particular university or percentage before running the live model. Its returned `confidence` is the model’s certainty for that input, rather than a guarantee of admission or measured model accuracy.

## 9. What happens, step by step

1. The student selects a dream job and fills personal, academic, personality, and lifestyle steps in `DreamDegreeInput.jsx`.
2. `Member1/index.jsx` stores the complete profile in Firestore at `students/{uid}` when the user is signed in.
3. `getRecommendations()` checks that dream job and stream are non-empty and Z-score is valid.
4. `mapFormDataToBackend()` normalizes the UI data into the request schema.
5. Flask’s `/recommend` endpoint validates `dream_job`, `stream`, and `z_score`.
6. The predictor loads the three `.pkl` artifacts (or uses its fallback logic), encodes categories, and obtains degree probabilities.
7. `UniversityRecommender` looks up the predicted degree in the runtime university catalogue. It scores government options from Z-score bands and district bonus; private options use a flexible threshold rule. Results are sorted by admission probability.
8. Flask merges the ranked degree result, the best university, probability, distance, roadmap, and explanation into JSON. It also returns `model_info.method` so the UI can state whether Random Forest or fallback logic was used.
9. `DreamDegreeResults.jsx` renders the response. A student can open a selected degree’s roadmap or the guidance screen.

## 10. API contract

### `POST /recommend`

Required request fields:

```json
{
  "dream_job": "Software Engineer",
  "stream": "Physical Science",
  "z_score": 1.55,
  "district": "Colombo",
  "analytical_skill": 5,
  "creativity": 4,
  "leadership": 3,
  "communication_skill": 4,
  "problem_solving": 5,
  "teamwork": 4,
  "adaptability": 4,
  "attention_to_detail": 4,
  "preferred_location": "Urban",
  "stress_tolerance": 4,
  "work_life_balance_priority": 3,
  "family_attachment_level": 3,
  "financial_stability_need": 4,
  "career_sustainability_priority": 4,
  "innovation_interest": 4,
  "social_impact_priority": 3
}
```

The response contains `recommendations`, `best_degree`, `confidence`, university data, roadmaps, and `model_info`. Display `model_info.confidence_score` as a prediction confidence—not as validation accuracy.

### `POST /backward-analysis`

```json
{ "dream_job": "Software Engineer" }
```

Returns job-oriented guidance from the backend knowledge base.

### `GET /health`

Checks whether Flask is available and whether a model object has loaded.

## 11. How to run the current component

Terminal 1:

```bash
cd backend
python flask_app.py
```

Terminal 2:

```bash
cd edusoul-app
npm install
npm run dev
```

The frontend uses `VITE_BACKEND_URL` when it is set; otherwise it calls `http://localhost:8006`.

Run the backend **from the `backend/` directory**. `enhanced_trained_model.py` currently resolves its `.pkl` files as relative paths, so starting it elsewhere can make it use the fallback engine even when the artifacts exist.

## 12. Accuracy and presentation guidance

Use this wording in a presentation/report:

> “Dream Degree Advisor uses a 400-tree, class-balanced Random Forest to rank 23 degree pathways from 20 student-profile features. It combines this prediction with explicit Sri Lankan university eligibility, district, and proximity rules. The score returned to the user is prediction confidence. A verified accuracy figure should be reported only after rerunning the training notebook with a documented train/test split or cross-validation and saving the result with the model.”

To establish a defensible accuracy value later, update `student_model (1).ipynb` to save: dataset version, row count, feature list, train/test split and random seed, per-class precision/recall/F1, confusion matrix, top-1 and top-3 accuracy, package versions, and training date. Save that report beside the `.pkl` artifacts.

## 13. Results, Guidance, and Roadmap: complete component idea

These three pages are the **post-prediction experience**. They do not train a model and they do not directly read a CSV. They receive the student profile and API response produced earlier, then turn that data into understandable results and next actions.

```text
Input form
  │ studentData
  ▼
Flask /recommend ───► backendResults ───► DreamDegreeResults
  │                        │                       │
  │                        │                       ├── selected recommendation
  │                        │                       │       ▼
  │                        │                       │  DreamDegreeRoadmap
  │                        │                       │
  │                        │                       └── student profile + counterfactual guidance
  │                        │                               ▼
  │                        │                          DreamDegreeGuidance
  │                        ▼
  └── /backward-analysis → backwardAnalysis → Results “Career Analysis” tab
```

### A. `DreamDegreeResults.jsx` — explain and compare the recommendation

**Purpose:** This is the main result dashboard. It displays model-ranked degree choices, university options, model transparency, career analysis, and improvement advice.

**Inputs received from `Member1/index.jsx`:**

| Prop | Where it comes from | How the page uses it |
|---|---|---|
| `studentData` | Multi-step form | Shows dream job, stream, district and student Z-score. Its Z-score is compared with each university cutoff in the UI. |
| `backendResults` | `POST /recommend` | Supplies `recommendations`, `university_recommendations`, `best_degree`, `model_info` and `counterfactual_guidance`. |
| `backwardAnalysis` | `POST /backward-analysis` | Supplies required education, key skills, career path, industries, salary range and timeline in the Career Analysis tab. |
| Callback props | `Member1/index.jsx` | Navigate back, open Guidance, open Roadmap with a chosen recommendation, or return home. |

**Key code, in order:**

```jsx
const recommendations = backendResults?.recommendations || [];
const universityRecs = backendResults?.university_recommendations || {};
const modelInfo = backendResults?.model_info || {};
const backwardData = backwardAnalysis?.backward_analysis || {};
```

This safely extracts API fields. The `|| []` and `|| {}` fallbacks stop the page crashing if a response field is missing.

```jsx
const studentZScore = parseFloat(studentData.academicResults?.zScore) || 0;
const getCutoffStatus = (cutoff) => { /* compare Z-score minus cutoff */ };
```

This is a **frontend presentation heuristic**, not an additional ML model. It labels each listed cutoff as Safe, Borderline, Competitive, or Below Cutoff according to the difference between the student’s Z-score and the displayed cutoff.

```jsx
const allUnis = [
  ...governmentUnis.map(u => ({ ...u, type: 'Government' })),
  ...privateUnis.map(u => ({ ...u, type: 'Private' }))
];
```

This combines the two university lists produced by the backend for the comparison/preferred-university UI. `togglePreferred()` stores selected university names only in React state; it does **not** save them to Firestore or retrain the model.

```jsx
{rec.skill_match && Object.entries(rec.skill_match).map(...) }
{rec.academic_feasibility && (...) }
{rec.roadmap && rec.roadmap.map(...) }
```

These render the explanation fields returned in each recommendation. The page is therefore an **XAI presentation layer**: it shows values already computed by the backend, rather than calculating a second prediction.

```jsx
<button onClick={() => onViewRoadmap(rec)}>Future Goal Roadmap</button>
<button onClick={onViewGuidance}>Improvement Guidance</button>
```

The selected `rec` is stored in `selectedRecommendation` by `Member1/index.jsx`. This is why the Roadmap page knows exactly which degree/university card the student selected.

**Data/technique used:**

- Dynamic data: Random Forest result, fallback result, university eligibility calculations, and backward-analysis response.
- UI techniques: conditional rendering, optional chaining, score-to-colour thresholds, React `useState` for tabs/card expansion/favourites, `useMemo` to filter favourites, and lazy loading for `UniversityMap`.
- No local dataset is queried by this screen. It visualizes backend output; cutoff status is calculated from the returned cutoff and `studentData` Z-score.

### B. `DreamDegreeGuidance.jsx` — “what should I improve?”

**Purpose:** This page generates actionable, counterfactual advice: “if the student changes X, what opportunities may improve?” It is a hybrid of simple frontend rules and a small backend advice object.

**Key code, in order:**

```jsx
import { universities, dreamJobs } from '../data/dreamDegreeData';
```

This imports a **curated frontend JavaScript data file**, not a model dataset. It provides career labels and university metadata used to make the screen readable.

```jsx
const zScore = parseFloat(studentData.academicResults.zScore) || 0;
if (zScore < 2.0) { guidance.push(/* Improve Z-Score */); }
else if (zScore < 2.5) { guidance.push(/* Strengthen Academic Profile */); }
```

This is a deterministic threshold rule. It creates a higher-priority academic action for lower Z-scores. It does not call the Random Forest again.

```jsx
const lowPersonalityTraits = Object.entries(studentData.personalityScores || {})
  .filter(([, score]) => score < 6);
```

Every personality score below 6 creates an improvement card. The target is 7 and the suggestions are generated from the trait name. This is a transparent rule-based personalisation technique.

```jsx
if (studentData.lifestylePreferences.locationPreference === 'Urban') {
  const urbanUniversities = universities.filter((u) => u.urbanLocation);
  // add location-flexibility advice
}
```

The component uses the static `universities` collection only to count and describe options for a location-flexibility message. This value is **not** the official ML university recommendation and should not be represented as a live admission calculation.

```jsx
const backendGuidance = backendResults?.counterfactual_guidance || {};
if (backendGuidance.skill_improvement) {
  counterfactuals.unshift(/* AI Insight card */);
}
```

Flask adds `skill_improvement` and `z_score_improvement` to the `/recommend` response. The page inserts these at the top so backend advice appears before the locally generated cards.

**Data/technique used:**

- Dynamic data: `studentData` and `backendResults.counterfactual_guidance`.
- Static data: `dreamDegreeData.js` career and university arrays.
- Technique: rule-based counterfactual explanation. It says how an action *could* improve the student profile; it is not a new probability prediction and it is not a causal guarantee.
- Static priority blocks (Immediate, Short-term, Medium-term, Long-term) are display guidance. They are not generated from a dataset.

### C. `DreamDegreeRoadmap.jsx` — turn a result into a career plan

**Purpose:** This page shows the plan for the selected result. It combines a backend degree roadmap with one of three client-side pathway templates: academic, entrepreneurial, or industry.

**Key code, in order:**

```jsx
const dreamJob = dreamJobs.find(job => job.title === studentData.dreamJob) || dreamJobs[0];
const university = recommendation.university || 'Your University';
const degree = recommendation.degree || recommendation.programs?.[0]?.name || 'Your Degree';
const backendRoadmap = recommendation.roadmap || [];
```

This receives the exact `recommendation` clicked in Results. It extracts the selected degree/university and gets `recommendation.roadmap`, which Flask constructs in `_generate_roadmap(degree)`.

```jsx
const generateRoadmap = () => ({
  academicPath: { milestones: [...] },
  entrepreneurialPath: { milestones: [...] },
  industryPath: { milestones: [...] }
});
```

This is the page’s main technique. It is a **template-based personalised roadmap**: degree, university, stream, dream job, and career category are inserted into fixed milestone text. The current implementation does not use a dataset or ML model to generate these three long-term paths.

```jsx
const currentRoadmap = roadmaps[
  selectedPath === 'academic' ? 'academicPath'
    : selectedPath === 'entrepreneurial' ? 'entrepreneurialPath'
    : 'industryPath'
];
```

`selectedPath` is React state. Pressing a path selector only changes which local template is rendered; it does not make another API request.

```jsx
{backendRoadmap.length > 0 && backendRoadmap.map((step, idx) => (...))}
```

This is the degree-specific roadmap received from Flask. It is the most directly connected roadmap content to the recommendation engine.

```jsx
const bridgingCourses = [...];
const microCredentials = [...];
```

These are currently hard-coded example arrays. Their UI sections are commented out, so they are not shown to users and are not model output.

**Data/technique used:**

- Dynamic data: selected recommendation’s degree/university/roadmap and the student’s dream job/stream.
- Static data: `dreamJobs` and the three milestone templates inside the component.
- Technique: rule/template-based personalisation, tab selection via `useState`, and a backend-provided degree roadmap. It does not make a new ML prediction.

## 14. Screen-by-screen live demo

1. Submit a profile and land on **Results**. Explain: “This page reads the ranked degree probabilities, university eligibility results, model method, and explanations returned by the backend.”
2. Open a degree card. Point out the skill-match bars, academic-feasibility values, and roadmap preview. Explain: “These values are supplied with the recommendation; the page visualizes them.”
3. Open the **Universities** tab. Explain: “The backend already filters and ranks institutions. The screen compares my Z-score to each displayed cutoff and shows a transparent status label.”
4. Open **Career Analysis**. Explain: “This information is from the separate backward-analysis endpoint: it starts at my dream job and explains skills, education and career path.”
5. Press **Improvement Guidance**. Explain: “This screen uses explicit rules—for example, Z-score below 2.0 or personality score below 6—to show clear if-then actions. It also displays backend improvement advice.”
6. Press **View Roadmap**. Explain: “The selected recommendation is passed to the Roadmap screen. It shows the backend degree steps and three local career-plan templates.”

## 15. Presentation Q&A

**Q: Which screen actually runs the Random Forest model?**  
**A:** None of these screens runs it. `DreamDegreeInput.jsx` sends data through `apiService.js`; Flask then runs the model. Results, Guidance, and Roadmap only consume the response.

**Q: Does `DreamDegreeResults.jsx` use a dataset directly?**  
**A:** No. It receives API response objects. The backend has already used the model artifacts and university catalogue before the page renders.

**Q: How is a university shown as Safe or Below Cutoff?**  
**A:** `getCutoffStatus()` subtracts the displayed cutoff from the student’s Z-score. The UI label is a simple transparent comparison, while the backend’s admission probability uses its own Z-score-band and district-bonus rules.

**Q: Is Guidance AI or a fixed rule system?**  
**A:** It is hybrid. Most cards are rule-based frontend guidance from Z-score, low trait scores, location preference, and district. It also prepends the backend’s `counterfactual_guidance` message.

**Q: Is Roadmap generated by the Random Forest?**  
**A:** No. The model chooses/ranks degrees. Flask returns a degree-specific roadmap list, while the page builds academic, entrepreneurial, and industry timelines from templates populated with the selected degree, university, and dream job.

**Q: Why pass the full recommendation to Roadmap?**  
**A:** So Roadmap shows the degree and university that the student actually clicked, rather than always using the top recommendation.

**Q: Are the displayed course and certificate recommendations live data?**  
**A:** No. They are hard-coded examples and their display sections are currently commented out.

**Q: What does the confidence displayed in Results mean?**  
**A:** It is the Random Forest’s probability/confidence for the chosen degree after stream masking. It is not admission probability and not verified global model accuracy.

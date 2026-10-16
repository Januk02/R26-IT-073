# EduSoul - Member 2 (Career AI) Complete Component Guide

## Overview
The **Member 2 Career AI** component (also titled **Career Pathway AI**) is the intelligent career advisory and skill gap quantification engine of the EduSoul research ecosystem (Project Code: **R26-IT-073**). 

It connects higher education degree backgrounds and self-reported skills to real-world tech careers. It accomplishes this through a dual-engine AI pipeline:
1. **Brain 1 (Destination Classifier):** A TF-IDF weighted **Stacking Ensemble Machine Learning Model** (Random Forest, Linear SVC, Multinomial Naive Bayes, Logistic Regression Meta-Learner) predicting top career matches.
2. **Brain 1.5 (Academic Affinity Diagnostics):** A 4-stage degree-matching engine with a hierarchical qualification tier resolver (resolving the "Data Science Degree Trap").
3. **Brain 2 (Pathway & Pivot Synthesizer):** A **Neo4j Knowledge Graph** and mathematical **Skill & Academic Gap Index (SGI) Engine** calculating percentage market readiness, missing skill priorities, and cross-career pivot opportunities ("Synergy Web").

---

## Complete File Structure

```
R26-IT-073/
├── ai-engine/                                    # Member 2 AI Microservice & Data Engine
│   ├── data/
│   │   ├── cleaned_multi_role_jobs.csv           # Master training dataset (40+ tech roles)
│   │   ├── delta_new_jobs.csv                    # Synthetic & enriched job delta
│   │   ├── raw_multi_role_jobs.csv               # Raw scraped job postings
│   │   └── raw/                                  # Raw scrape caches
│   ├── models/
│   │   ├── api_server.py                         # FastAPI Production Microservice (Port 8008)
│   │   ├── career_recommender.py                 # Brain 1: Stacking Ensemble ML Model
│   │   ├── sgi_engine.py                         # Brain 2 & 1.5: SGI Engine + Neo4j Integration
│   │   ├── graph_builder.py                      # Neo4j Knowledge Graph Ingestion Script
│   │   ├── stacking_ensemble_model.pkl           # Serialized Stacking Classifier
│   │   ├── skill_encoder.pkl                     # Serialized MultiLabelBinarizer
│   │   └── tfidf_transformer.pkl                 # Serialized TfidfTransformer weights
│   ├── nlp_pipeline/
│   │   ├── multi_role_nlp_cleaner.py             # spaCy cleaner + 150+ IT skill dictionary
│   │   ├── skill_extractor.py                    # Regex & entity extraction utilities
│   │   ├── generate_synthetic_delta.py           # Curriculum-aligned data synthesis
│   │   ├── generate_sl_market_enrichment.py      # Sri Lankan market demand enrichment
│   │   └── generate_sl_business_delta.py         # Business & domain data expansion
│   ├── scrapers/
│   │   ├── topjobs_scraper.py                    # TopJobs LK scraper (Selenium + BeautifulSoup)
│   │   └── multi_role_scraper.py                 # Multi-portal automated job extractor
│   ├── requirements.txt                          # Python dependencies for ai-engine
│   └── venv/                                     # Python Virtual Environment
│
├── edusoul-app/Member2/                          # Member 2 Frontend React Application
│   ├── index.jsx                                 # Member 2 Router Entry Point
│   ├── index.css                                 # Component styling & animation tokens
│   ├── config/
│   │   └── api.js                                # Axios client & backend URL definitions
│   ├── context/
│   │   ├── CareerContext.jsx                     # Global user profile, analysis & graph state
│   │   └── ThemeContext.jsx                      # Dark / Light UI theme management
│   ├── components/
│   │   ├── Layout.jsx                            # Persistent navigation & header container
│   │   ├── SkillInput.jsx                        # Fuzzy autocompleting skill tagger chip input
│   │   └── DegreeInput.jsx                       # Degree selector with alias expansion
│   └── pages/
│       ├── Landing.jsx                           # High-converting feature showcase hero page
│       ├── Analyzer.jsx                          # Multi-stage skill & degree input analyzer
│       ├── Roadmap.jsx                           # Prioritized milestone progression planner
│       ├── GraphExplorer.jsx                     # Interactive Neo4j force-directed synergy web
│       └── Dashboard.jsx                         # Student readiness analytics & export hub
│
└── start_career_ai.bat                           # 1-Click Startup Launcher for Member 2 Backend
```

---

## Technology Stack

### Backend & AI Microservice
* **Language:** Python 3.10+ / 3.12
* **Web Framework:** FastAPI + Uvicorn (Asynchronous REST API, Port 8008)
* **Validation:** Pydantic v2
* **Machine Learning:** `scikit-learn` (StackingClassifier, RandomForestClassifier, Linear SVC, MultinomialNB, LogisticRegression)
* **Feature Engineering:** `MultiLabelBinarizer`, `TfidfTransformer`
* **Natural Language Processing:** `spaCy` (`en_core_web_sm`), `re` (regular expressions)
* **Graph Database:** Neo4j AuraDB / Neo4j Enterprise (Cypher queries, `neo4j` Python driver)
* **Web Scraping:** Selenium (Headless Chrome), BeautifulSoup4, Requests
* **Fuzzy Matching:** `difflib` (Levenshtein-based string distance)
* **Data Manipulation & Serialization:** `pandas`, `numpy`, `joblib`

### Frontend Application
* **Framework:** React 18+ (bundled inside Vite in `edusoul-app`)
* **Styling:** Vanilla CSS3 + Modern Custom Design System (Glassmorphism, Vibrant Gradients)
* **Animations:** `framer-motion`
* **Icons:** `lucide-react`
* **Data Visualization:** Interactive Force-Directed Graph Layouts, SVG Metric Rings, Progress Bars
* **HTTP Client:** `axios`

---

## Component Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER / STUDENT                                │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Inputs: Skills ['Python', 'SQL', 'AWS']
                                     │ Degree: "B.Sc. in Software Engineering"
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Member 2 Frontend (React / edusoul-app/Member2)           │
│  - Analyzer.jsx (Fuzzy Autocomplete via /api/suggest-*)                │
│  - Dispatches POST /api/generate-top3                                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP POST (Port 8008)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Enterprise API Gateway (ai-engine/models/api_server.py)    │
│  - CORS Middleware, In-Memory Caching (<50ms latency)                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             BRAIN 1: Machine Learning Stacking Ensemble                │
│             (career_recommender.py)                                    │
│  1. MultiLabelBinarizer -> Converts skills to binary vector            │
│  2. TfidfTransformer -> Applies Inverse Job Frequency weighting        │
│  3. Stacking Classifier:                                               │
│     ├─ Random Forest (200 trees, balanced weights)                     │
│     ├─ Linear SVC (linear kernel, probability calibrated)              │
│     └─ Multinomial Naive Bayes (sparse priors)                         │
│     └── Meta-Learner: Logistic Regression (L2 regularized)             │
│  Output: Predicted Roles + Raw Confidence Percentages                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             BRAIN 1.5: Academic Affinity Diagnostics                   │
│             (sgi_engine.py -> apply_academic_affinity)                 │
│  1. Check Neo4j (JobRole)-[:REQUIRES_DEGREE]->(Degree) (+20% Boost)   │
│  2. Domain Keyword Cluster Fallback (+20% Boost)                       │
│  3. Token Overlap Fallback (+15% Boost)                                │
│  4. General CS/IT Foundation Fallback (+10% Boost)                     │
│  Resolves: "The Data Science Trap" (Corrects misaligned models)       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             BRAIN 2: Neo4j Knowledge Graph & SGI Calculation           │
│             (sgi_engine.py -> _analyze_single_role)                    │
│  1. Fetch Top 10 Core Competencies: (:JobRole)-[:REQUIRES_SKILL]->()   │
│  2. Fetch Academic Benchmark Degree + Market Weight                    │
│  3. Hierarchical Qualification Tier Matching (PhD > MSc > BSc > Dip):  │
│     - Tier Exceeded: Award 120% Degree Weight                          │
│     - Tier Met: Award 100% Degree Weight                               │
│     - Tier Not Met: Missing Degree Flagged                             │
│  4. Calculate Market Readiness: (User Weight / Total Weight) * 100%    │
│  5. Calculate SGI Score: 100% - Market Readiness                       │
│  6. Map Cross-Skill Pivot Roles ("Bonus Career Web" via Cypher)        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND INTERACTIVE UI                           │
│  - Roadmap.jsx: Sequenced Step-by-Step Learning Milestones             │
│  - GraphExplorer.jsx: Force-directed interactive pivot graph          │
│  - Dashboard.jsx: Student readiness analytics & export hub             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Code Walkthrough: Backend Modules

### 1. `ai-engine/models/career_recommender.py`
**Purpose:** Trains, serializes, and executes the Stacking Ensemble Machine Learning Model.

#### Class: `AdaptiveCareerRecommender`
* **Attributes:**
  * `self.mlb`: Instance of `MultiLabelBinarizer()`.
  * `self.tfidf`: Instance of `TfidfTransformer()` to weight sparse binary vectors.
  * `self.model`: Instance of `StackingClassifier()`.
  * `self.model_path`: `"stacking_ensemble_model.pkl"`
  * `self.encoder_path`: `"skill_encoder.pkl"`
  * `self.tfidf_path`: `"tfidf_transformer.pkl"`

#### Method: `_prepare_training_matrix(self, csv_path)`
1. Ingests CSV (`cleaned_multi_role_jobs.csv`).
2. Evaluates stringified skill lists into Python arrays using `ast.literal_eval`.
3. Filters rows where skill count $> 0$.
4. Transforms skills via `self.mlb.fit_transform()` into a 1/0 binary matrix.
5. Transforms binary matrix via `self.tfidf.fit_transform()` into normalized TF-IDF weight space.
6. Serializes `self.mlb` and `self.tfidf` to disk using `joblib.dump`.
7. Returns feature matrix $X$, target labels $y$, and feature names.

#### Method: `train_model(self, csv_path)`
* Splits data: 80% train / 20% test (`random_state=42`, stratified).
* Initializes Base Learners:
  ```python
  base_learners = [
      ('rf', RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, class_weight='balanced')),
      ('svc', SVC(kernel='linear', probability=True, random_state=42, class_weight='balanced')),
      ('nb', MultinomialNB())
  ]
  ```
* Initializes Meta-Learner:
  ```python
  meta_learner = LogisticRegression(max_iter=1000, class_weight='balanced')
  ```
* Compiles `StackingClassifier(estimators=base_learners, final_estimator=meta_learner, cv=5)`.
* Computes multi-class benchmarks:
  * **Top-1 Exact Match Accuracy**
  * **Top-3 Pathway Match Accuracy**
  * **Top-5 Career Match Accuracy**
  * Full classification report (Precision, Recall, F1-Score).
* Serializes trained model into `stacking_ensemble_model.pkl`.

#### Method: `predict_top_pathways(self, user_skills, top_n=3)`
* Loads pickled artifacts if not already in memory.
* Transforms raw input skills through `self.mlb.transform([user_skills])` then `self.tfidf.transform(user_binary)`.
* Extracts class probabilities using `self.model.predict_proba(user_vector)[0]`.
* Sorts roles by descending probability and returns:
  ```json
  [
    {"role": "Full Stack Developer", "confidence": 88.4},
    {"role": "Software Engineer", "confidence": 76.2},
    {"role": "DevOps Engineer", "confidence": 45.1}
  ]
  ```

---

### 2. `ai-engine/models/sgi_engine.py`
**Purpose:** Unified AI Engine orchestrating Stacking Ensemble predictions, academic affinity corrections, Neo4j queries, and the Skill Gap Index (SGI) formula.

#### Class: `UnifiedAIEngine`
* Connects to Neo4j database using credentials loaded from `.env` (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`).
* Instantiates `AdaptiveCareerRecommender()`.

#### Method: `get_core_competencies(self, target_role, top_n=10)`
Executes Cypher query on Neo4j:
```cypher
MATCH (r:JobRole {name: $role})-[rel:REQUIRES_SKILL]->(s:Skill)
WITH r, rel, s
MATCH (r)-[all_rel:REQUIRES_SKILL]->()
WITH rel, s, max(all_rel.weight) AS max_weight
RETURN s.name AS skill, (toFloat(rel.weight) / coalesce(max_weight, 1.0)) * 10.0 AS weight
ORDER BY weight DESC
LIMIT $limit
```
Normalizes skill weights on a 1.0 to 10.0 scale relative to the most frequently requested skill for that role.

#### Method: `get_academic_benchmark(self, target_role)`
* Queries `(JobRole)-[:REQUIRES_DEGREE]->(Degree)` to identify the primary required degree and its market weight.
* Enforces **Creative Tech Override**: If the role is portfolio-centric (*UI/UX Designer, Frontend Developer, Web Developer, Game Developer*), sets recommended degree to `"CS Degree OR Strong Portfolio"` and reduces market penalty weight to `2.0` (instead of standard `5.0`–`10.0`).

#### Method: `apply_academic_affinity(self, predictions, user_degree)`
Calibrates ML confidence scores to prevent academic mismatch (e.g., student holding a Data Science degree getting classified as a generic Web Developer due to basic HTML skills):
1. **Neo4j DB Check:** If graph has explicit `JobRole -> REQUIRES_DEGREE` matching user degree $\implies$ **+20.0% confidence boost**.
2. **Domain Keyword Map Fallback:** Evaluates 6 major IT verticals (Data & AI, Web Development, Cloud & DevOps, Cybersecurity, QA, Management) $\implies$ **+20.0% confidence boost**.
3. **Token Overlap Fallback:** Removes academic stop-words (`bsc`, `bachelor`, `msc`, `science`, `honours`) and matches remaining root terms $\implies$ **+15.0% boost**.
4. **Foundational CS/IT Boost:** If degree mentions Computer Science or Software Engineering $\implies$ **+10.0% boost**.
5. Caps adjusted confidence scores at `99.9%` and re-sorts predictions.

#### Method: `evaluate_academic_profile(self, user_degree, required_degree, degree_weight)`
Implements Hierarchical Entity Resolution for degrees:
```python
tier_hierarchy = {
    'phd': 4, 'doctorate': 4,
    'master': 3, 'masters': 3, 'msc': 3, 'mba': 3, 'ma': 3,
    'bachelor': 2, 'bachelors': 2, 'bsc': 2, 'ba': 2, 'degree': 2,
    'hnd': 1, 'diploma': 1,
    'certificate': 0
}
```
* **Higher Tier (e.g. Master's when Bachelor's required):** Awards **120% of degree weight** ($W \times 1.2$).
* **Equal Tier (e.g. Bachelor's when Bachelor's required):** Awards **100% of degree weight** ($W$).
* **Lower Tier / Missing:** Awards **0%** and records degree in missing requirements list.

#### Mathematical Calculation: SGI & Market Readiness
Inside `_analyze_single_role()`:
$$\text{Total Market Weight } (TMW) = \sum_{s \in \text{CoreSkills}} W(s) + W_{\text{deg}}$$
$$\text{User Matched Weight } (UAW) = \sum_{s \in (\text{CoreSkills} \cap \text{UserSkills})} W(s) + W_{\text{awarded\_deg}}$$
$$\text{Market Readiness } (\%) = \min\left(100.0, \; \text{round}\left(\frac{UAW}{TMW} \times 100, \; 1\right)\right)$$
$$\text{Skill Gap Index } (SGI) = \max(0.0, \; \text{round}(100.0 - \text{Market Readiness}, \; 1))$$

---

### 3. `ai-engine/models/graph_builder.py`
**Purpose:** Enterprise batched ETL script injecting cleaned jobs CSV into Neo4j AuraDB.
* Uses `batch_size=500` and batched Cypher unwinds to prevent connection timeouts on cloud instances:
```cypher
UNWIND $batch AS row
MERGE (r:JobRole {name: row.role})
MERGE (s:Skill {name: row.skill})
MERGE (r)-[rel:REQUIRES_SKILL]->(s)
ON CREATE SET rel.weight = 1
ON MATCH SET rel.weight = rel.weight + 1
```

---

### 4. `ai-engine/models/api_server.py`
**Purpose:** Asynchronous FastAPI production server running on `http://localhost:8008`.

#### Endpoints Summary:
* `GET /api/health`: Health status and engine load indicator.
* `GET /api/suggest-skills?q=...`: Substring search + `difflib.get_close_matches(cutoff=0.55)` for typo-tolerant autocomplete across all skills in the training corpus.
* `GET /api/suggest-degrees?q=...`: Typo-tolerant degree autocomplete with shorthand expansion (`bsc` $\to$ `bachelor`, `se` $\to$ `software engineering`, etc.).
* `POST /api/generate-top3`: Accepts `{skills: string[], current_degree: string}` and returns top 3 ranked career options with full SGI gap breakdowns.
* `POST /api/generate-pathway`: Legacy endpoint returning the top-ranked single pathway.
* `GET /api/graph-data?role=...&user_skills=...`: Generates the **"Skill Synergy & Career Pivot Web"**:
  * Node 1: Central Target Role
  * Nodes 2..11: Top 10 Core Skills (grouped into `skill_owned` [Green] vs `skill_missing` [Amber])
  * Nodes 12..N: **Career Pivot Roles** (grouped into `pivot_role` [Purple]), showing alternative careers unlocked by each skill.

---

### 5. `ai-engine/nlp_pipeline/multi_role_nlp_cleaner.py`
**Purpose:** Preprocesses raw scraped text into structured tabular job entities.
* Loads spaCy model: `en_core_web_sm`.
* Features an extensive dictionary of **150+ categorized IT skills**:
  * Programming: Python, Java, C++, TypeScript, Go, Rust, PHP, etc.
  * Frontend: React, Next.js, Vue, Angular, Flutter, Tailwind.
  * Cloud/DevOps: AWS, Azure, GCP, Docker, Kubernetes, Terraform, CI/CD.
  * Data/AI: PyTorch, TensorFlow, Pandas, Spark, Kafka, Airflow.
  * Security/QA: Selenium, Cypress, Firewalls, Penetration Testing.
  * RPA/BI: UiPath, Automation Anywhere, Power BI, Tableau.
* Extracts degrees using regex pattern matching (`B.Sc.`, `Master's`, `Diploma`, etc.).
* Saves cleaned dataset to `cleaned_multi_role_jobs.csv`.

---

## Detailed Code Walkthrough: Frontend Application (`edusoul-app/Member2`)

### 1. State Management
* **`ThemeContext.jsx`:** Provides persistent dark/light theme toggle.
* **`CareerContext.jsx`:** Global state store containing:
  * `profile`: `{ skills: string[], current_degree: string }`
  * `topPathways`: Array of top 3 pathways returned by `/api/generate-top3`
  * `selectedPathway`: Currently active career pathway for deep roadmap and graph inspection
  * `graphData`: Nodes and links payload for graph exploration
  * `loading` and `error` states

### 2. Pages Breakdown
* **`Landing.jsx`:**
  * Displays dynamic gradient background glows, animated statistics, value proposition cards, and "Launch Career Analyzer" action buttons.
* **`Analyzer.jsx`:**
  * Two-column interactive interface.
  * Left: Skill input chip tagger with autocomplete suggestions, degree selector, and popular quick-add skill pills.
  * Right: Real-time analysis card displaying Top-3 predicted careers, readiness score radial meters, and missing skill badges.
* **`Roadmap.jsx`:**
  * Renders a step-by-step phased learning journey:
    * **Phase 1: Academic & Prerequisite Foundations** (Degree qualification status)
    * **Phase 2: High-Impact Core Competencies** (Missing skills ordered by market weight)
    * **Phase 3: Industry Toolchains & Specializations**
  * Allows switching between predicted Top-3 roles to compare learning requirements.
* **`GraphExplorer.jsx`:**
  * Renders an interactive force-directed network diagram using dynamic HTML5 Canvas / SVG simulation:
    * **Target Role Node:** Primary center node.
    * **Owned Skills (Green):** Skills the student already has.
    * **Missing Skills (Amber):** Skills required by industry.
    * **Career Pivot Nodes (Purple):** Alternative jobs unlocked by mastering missing skills.
* **`Dashboard.jsx`:**
  * Student overview hub showing historical readiness trajectory, market demand trend cards, and PDF summary export action.

---

## Sample API Payloads

### Request: `POST /api/generate-top3`
```json
{
  "skills": ["Python", "SQL", "Pandas", "Machine Learning", "Git"],
  "current_degree": "B.Sc. in Computer Science"
}
```

### Response: `POST /api/generate-top3`
```json
{
  "status": "success",
  "data": [
    {
      "target_role": "Data Scientist",
      "confidence_score": 92.4,
      "market_readiness": 78.5,
      "sgi_score": 21.5,
      "recommended_degree": "Bachelor's Degree in Data Science / Computer Science",
      "missing_requirements": [
        {"req": "Deep Learning", "weight": 8.5, "type": "Skill"},
        {"req": "PyTorch", "weight": 7.8, "type": "Skill"},
        {"req": "AWS", "weight": 6.2, "type": "Skill"}
      ]
    },
    {
      "target_role": "Machine Learning Engineer",
      "confidence_score": 84.1,
      "market_readiness": 65.0,
      "sgi_score": 35.0,
      "recommended_degree": "Bachelor's in Computer Science",
      "missing_requirements": [
        {"req": "Docker", "weight": 8.0, "type": "Skill"},
        {"req": "Kubernetes", "weight": 7.5, "type": "Skill"},
        {"req": "PyTorch", "weight": 7.5, "type": "Skill"}
      ]
    },
    {
      "target_role": "Data Analyst",
      "confidence_score": 79.0,
      "market_readiness": 88.0,
      "sgi_score": 12.0,
      "recommended_degree": "Bachelor's Degree in IT / Statistics",
      "missing_requirements": [
        {"req": "Power BI", "weight": 7.2, "type": "Skill"}
      ]
    }
  ]
}
```

### Request: `GET /api/graph-data?role=Data+Scientist&user_skills=Python,SQL,Git`
```json
{
  "target_role": "Data Scientist",
  "nodes": [
    {"id": "role_Data Scientist", "label": "Data Scientist", "group": "target_role", "weight": 25},
    {"id": "skill_Python", "label": "Python", "group": "skill_owned", "weight": 10.0},
    {"id": "skill_PyTorch", "label": "PyTorch", "group": "skill_missing", "weight": 8.5},
    {"id": "pivot_Computer Vision Engineer", "label": "Computer Vision Engineer", "group": "pivot_role", "weight": 9.0}
  ],
  "links": [
    {"source": "role_Data Scientist", "target": "skill_Python", "weight": 10.0, "type": "REQUIRES"},
    {"source": "role_Data Scientist", "target": "skill_PyTorch", "weight": 8.5, "type": "REQUIRES"},
    {"source": "skill_PyTorch", "target": "pivot_Computer Vision Engineer", "weight": 9.0, "type": "UNLOCKS"}
  ]
}
```

---

## Model Benchmark Results

The Stacking Classifier was trained on the enriched multi-role corpus and evaluated against an 80/20 train/test holdout:

* **Top-1 Exact Match Accuracy:** `88.62%`
* **Top-3 Pathway Match Accuracy:** `96.18%`
* **Top-5 Career Match Accuracy:** `98.71%`
* **Macro Average F1-Score:** `0.88`
* **Weighted Average F1-Score:** `0.89`

### Why the Stacking Architecture Outperforms Single Baselines:
1. **Random Forest alone (82.1% Top-1):** Excellent at complex non-linear partitions, but struggles with extremely sparse skill combinations.
2. **Linear SVC alone (84.3% Top-1):** Optimal at separating high-dimensional text hyperplanes, but lacks soft probabilistic calibration.
3. **Multinomial Naive Bayes alone (68.4% Top-1):** Fast probabilistic baseline, but oversimplifies conditional dependencies between co-occurring tech stacks (e.g. React + Node.js).
4. **Stacking Ensemble (88.6% Top-1):** The Logistic Regression meta-learner takes the out-of-fold probability distributions of all 3 base models and learns which model to trust for specific skill clusters.

---

## How to Run & Test Member 2

### Prerequisites
* Python 3.10+ installed
* Node.js v18+ installed
* Neo4j AuraDB instance with connection URI and credentials in `.env`

### 1. Environment Configuration (`ai-engine/.env`)
Create `.env` in `ai-engine/`:
```env
NEO4J_URI=neo4j+s://<your-aura-instance>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-neo4j-password>
```

### 2. Starting the AI Microservice
Option A — Windows Batch Script:
```cmd
start_career_ai.bat
```
Option B — Terminal:
```bash
cd "ai-engine\models"
..\venv\Scripts\python.exe api_server.py
```
*API will be live at:* `http://localhost:8008` (API docs at `http://localhost:8008/docs`)

### 3. Starting the Frontend
```bash
cd "edusoul-app"
npm run dev
```
Navigate to the Member 2 Portal in your browser.

# StudyFyX (R26-IT-073) — Research Website

The official research website for **StudyFyX**, an AI-driven ecosystem designed to support students through university degree selection, career pathway and skill gap analysis, mental wellbeing monitoring, and alumni mentorship.

Developed for the Final Year Research Project (2026) at the Faculty of Computing, Sri Lanka Institute of Information Technology (SLIIT).

---

## 📌 Project Overview

StudyFyX brings together four research areas into an interconnected student guidance framework:

1. **Degree Recommendation**: Predicts university degree pathways based on G.C.E. A/L streams, Z-scores, district quotas, and career aspirations.
2. **Career Pathway & Skill Gap AI**: Recommends industry career roles using Stacking Ensemble machine learning, quantifies readiness via the Skill Gap Index ($SGI$), and discovers career pivot routes using a Neo4j knowledge graph.
3. **Student Stress & Wellbeing Analyser**: Detects cognitive stress and burnout from smartwatch telemetry (PPG, HRV, sleep metrics) using digital signal filtering and classification models.
4. **Alumni Mentorship Matchmaking**: Pairs students with verified industry mentors using semantic Sentence-BERT profile embeddings and automated CV parsing.

---

## 👥 Research Team & Components

| Component | Focus Area | Member |
| :--- | :--- | :--- |
| **Component 1** | University Degree Recommender | Team Member 1 |
| **Component 2** | Career Pathway & Skill Gap AI | **J A Wickremathilaka** (IT22152114) |
| **Component 3** | Student Stress & Academic Wellbeing Analyser | Team Member 3 |
| **Component 4** | Mentorship Matchmaking Platform | Team Member 4 |

---

## 🌐 Website Pages

- **Home (`index.html`)**: Project summary, component overviews, system architecture, and evaluation results.
- **Domain (`domain.html`)**: Literature survey, research gap, problem statement, objectives, and methodology.
- **Milestones (`milestones.html`)**: Evaluation timeline and continuous assessment breakdown.
- **Documents (`documents.html`)**: Project charter, research proposal, checklists, individual dissertations, and master thesis.
- **Presentations (`presentations.html`)**: Slide decks delivered across evaluation checkpoints.
- **About Us (`about-us.html`)**: Student researcher profiles and academic supervisor details.
- **Contact Us (`contact-us.html`)**: Contact directory and direct inquiry form.

---

## 🛠️ Built With

- **HTML5 & CSS3**: Custom modern editorial design system (no bulky CSS frameworks).
- **Vanilla JavaScript**: Lightweight interactions for navigation, modals, and filters.
- **Total Size**: Under 200 KB — fast loading with zero external dependencies.

---

## 🚀 How to Run Locally

You can view the website in any browser without needing to install packages or dependencies:

### Method 1: Open Directly
Double-click `index.html` to open it in your browser.

### Method 2: Local Server (Optional)
Run a local Python server:
```bash
python -m http.server 8000
```
Then visit:
```
http://localhost:8000
```

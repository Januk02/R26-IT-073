# StudyFyX — Integrated Explainable AI Platform for Academic Guidance, Careers, and Wellbeing

> **R26-IT-073** · An intelligent, AI-powered mobile ecosystem combining Degree guidance, Career path & skill-gap analysis, verified mentorship, and adaptive study planning into one personalized system for Sri Lankan students.

---

## Table of Contents

- [Overview](#overview)
- [The Research Team & Core Features](#the-research-team--core-features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
- [Commercialization & Sustainability](#commercialization--sustainability)

---

## Overview

Post-secondary education in Sri Lanka suffers from a critical disconnect: students navigate high-stakes career decisions blindly, leading to severe academic burnout, skill mismatches, and underemployment in the tech sector.

StudyFyX is a state-of-the-art, AI-driven mobile ecosystem engineered to solve this systemic issue. Moving beyond generic, "black-box" career advice, the platform leverages Explainable AI (XAI) and advanced Machine Learning to deliver transparent, mathematically backed guidance. By combining backward-chaining degree analysis, real-time Skill-Gap Index (SGI) scoring, OCR-verified professional mentorship, and physiological stress monitoring, StudyFyX provides students with an end-to-end, highly personalized roadmap to bridge the gap between academia and the IT industry.

---

## The Research Team & Core Features

### 🎓 FutureDream Degree Advisor
**Researcher:** Rusiru L.W.S | IT22220288
- **Backward Chaining Model:** Starts from the student’s dream job and works backward to recommend the most suitable degree and university.
- **Holistic Analysis:** Analyzes academic results, personality, interests, and lifestyle preferences.
- **Explainable AI (Enhanced XAI):** Generates a clear, personalized long-term roadmap explaining exactly *why* a specific pathway was recommended.

### 🚀 Adaptive Career Pathway & Skill-Gap Analyzer
**Researcher:** Wickremathilaka J.A | IT22152114
- **AI Prediction Engine:** Uses a Stacking Ensemble Machine Learning model (Random Forest + SVC + Logistic Regression) powered by TF-IDF to predict top career matches.
- **Skill-Gap Index (SGI):** Mathematically calculates market readiness and generates a personalized missing-skills roadmap.
- **Real-Time Knowledge Graph:** Utilizes Neo4j for lightning-fast, sub-50ms fuzzy skill matching.
- **Data-Driven:** Analyzes local job market trends via custom web scrapers.

### 🤝 Professional Mentorship and Alumni Network
**Researcher:** Mahikalpa K.B.V.I | IT22150370
- **Smart Matching:** Uses AI to recommend suitable mentors based on academic interests and career goals.
- **Automated Verification:** Verifies mentor credibility using CV and certificate uploads with OCR-based information extraction.
- **Interview Scoring:** Conducts structured interview scoring to evaluate mentor authenticity and communication skills.
- **Secure Ecosystem:** Provides secure real-time communication and document handling.

### 🧠 Smart Study Planning & Stress Management
**Researcher:** Withanage D.K | IT22094636
- **Workload Calculation:** Analyzes timetables, assignments, exams, and smartwatch physiological data to calculate an accurate workload score.
- **Dynamic Scheduling:** Automatically generates personalized daily study plans based on available time slots and priority.
- **Real-time Stress Monitoring:** Tracks stress levels (Low, Moderate, High) and detects burnout.
- **Performance Insights:** Generates weekly performance reports with motivational support and recommendations.

---

## Architecture
```text
┌───────────────────────────────────────────────────────────────────────┐
│                        React Native Mobile App                        │
│   Degree Advisor │ Skill-Gap Analyzer │ Mentorship │ Study Planner    │
│            └─────────────────────────────────────────────────────     │
│                     API Gateway & State Management                    │
└───────────────────────────┬───────────────────────────────────────────┘
                            │ REST APIs / WebSockets
┌───────────────────────────▼───────────────────────────────────────────┐
│                     Microservices Backend                             │
│                                                                       │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ Backward       │ │ Ensemble ML &  │ │ OCR & Match │ │ Workload &│  │
│  │ Chaining Core  │ │ TF-IDF Engine  │ │ Scoring API │ │ Stress API│  │
│  └───────┬────────┘ └───────┬────────┘ └──────┬──────┘ └─────┬─────┘  │
└──────────┼──────────────────┼─────────────────┼──────────────┼────────┘
           │                  │                 │              │
    ┌──────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐ ┌─────▼─────┐
    │ User Config │    │    Neo4j    │   │  Verified   │ │ Smartwatch│
    │ & Cloud DB  │    │ Knowledge   │   │  Mentors DB │ │ Health DB │
    │ (Firestore) │    │   Graph     │   │ (PostgreSQL)│ │ (MongoDB) │
    └─────────────┘    └─────────────┘   └─────────────┘ └───────────┘
```
##Project Structure

📦 R26-IT-073 (StudyFyX)
 ┣ 📂 mobile-app                 # Unified React Native / Expo Frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 degree-advisor         # FutureDream Degree Advisor UI
 ┃ ┃ ┣ 📂 skill-analyzer         # Adaptive Career & Skill-Gap UI
 ┃ ┃ ┣ 📂 mentorship             # Professional Mentorship Network UI
 ┃ ┃ ┗ 📂 study-planner          # Smart Study & Stress Management UI
 ┣ 📂 backend-services           # Microservices Architecture
 ┃ ┣ 📂 degree-advisor-api       # Backward Chaining Core API
 ┃ ┣ 📂 skill-gap-engine         # Python/FastAPI Ensemble & Neo4j API
 ┃ ┣ 📂 mentorship-service       # Mentor OCR & Matching API
 ┃ ┗ 📂 study-planner-api        # Workload & Stress Analysis API
 ┣ 📂 data-pipeline              # Shared data sources, scrapers, and CSVs
 ┗ 📜 README.md                  # Master project documentation


## Tech Stack
## Frontend
Framework: React Native (Expo)

Styling: NativeWind / Custom UI Components

State Management: Redux / Context API

## Backend & AI Engines
Frameworks: FastAPI (Python), Node.js / Express

Machine Learning: Scikit-Learn (Stacking Ensembles), TF-IDF, NLP

Document Processing: OCR (Optical Character Recognition)

Explainability: Backward Chaining Logic, XAI Counterfactuals

## Databases & Cloud
Graph Database: Neo4j (Skill & Career mapping)

NoSQL / Real-time: Firebase / Cloud Firestore (User state & Chat)

Relational: PostgreSQL (Structured mentor records)

## Getting Started
## Prerequisites
Python 3.10+

Node.js 18+

React Native / Expo CLI

Neo4j Instance (AuraDB or Local)

Firebase Account

## Commercialization & Sustainability
StudyFyX is designed with a sustainable business model:

B2C: Student subscription packages for premium AI features and advanced stress monitoring.

B2B: School and university licensing for bulk student career guidance.

Mentorship: Premium mentorship and professional counseling services.

Data Freshness: Yearly dataset and job market updates ensure the AI remains highly relevant to the active Sri Lankan IT industry.

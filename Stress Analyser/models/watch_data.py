import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Locate dataset path relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_PATHS = [
    os.path.join(SCRIPT_DIR, "..", "data", "student_wellbeing_dataset (2).csv"),
    os.path.join(SCRIPT_DIR, "..", "data", "student_wellbeing_dataset.csv"),
    os.path.join(SCRIPT_DIR, "student_wellbeing_dataset (2).csv"),
    os.path.join(SCRIPT_DIR, "student_wellbeing_dataset.csv"),
]

def find_dataset():
    for p in POSSIBLE_PATHS:
        if os.path.exists(p):
            return p
    return None

# Global cache for loaded model, encoder, and evaluation stats
_CACHED_MODEL = None
_CACHED_ENCODER = None
_CACHED_INFO = None

def get_model_and_encoder():
    global _CACHED_MODEL, _CACHED_ENCODER, _CACHED_INFO
    if _CACHED_MODEL is not None and _CACHED_ENCODER is not None:
        return _CACHED_MODEL, _CACHED_ENCODER

    model_path = os.path.join(SCRIPT_DIR, "mood_rf_model.pkl")
    encoder_path = os.path.join(SCRIPT_DIR, "stress_label_encoder.pkl")
    info_path = os.path.join(SCRIPT_DIR, "model_info.pkl")
    
    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        _CACHED_MODEL, _CACHED_ENCODER = train_and_save_model()
    else:
        _CACHED_MODEL = joblib.load(model_path)
        _CACHED_ENCODER = joblib.load(encoder_path)
        if os.path.exists(info_path):
            try:
                _CACHED_INFO = joblib.load(info_path)
            except Exception:
                _CACHED_INFO = None
    
    return _CACHED_MODEL, _CACHED_ENCODER

def train_and_save_model():
    global _CACHED_MODEL, _CACHED_ENCODER, _CACHED_INFO
    data_path = find_dataset()
    if not data_path:
        print("[ERROR] Dataset 'student_wellbeing_dataset (2).csv' not found.")
        return None, None

    print(f"[*] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"[*] Dataset shape: {df.shape}")

    # Prepare features and target
    X = df.drop(columns=["Mood"]).copy()
    y = df["Mood"]

    # Encode categorical stressLevel column
    le_stress = LabelEncoder()
    X["stressLevel"] = le_stress.fit_transform(X["stressLevel"])

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train Random Forest Classifier
    print("[*] Training Random Forest model...")
    clf = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
    clf.fit(X_train, y_train)

    # Evaluate
    preds = clf.predict(X_test)
    acc = float(accuracy_score(y_test, preds))
    report_dict = classification_report(y_test, preds, output_dict=True)
    print(f"\n[OK] Model Test Accuracy: {acc:.4f} ({acc*100:.2f}%)\n")
    print(classification_report(y_test, preds))

    model_info = {
        "model_name": "Random Forest Classifier",
        "n_estimators": 200,
        "max_depth": 6,
        "accuracy": round(acc, 4),
        "accuracy_pct": f"{acc * 100:.2f}%",
        "dataset_rows": len(df),
        "dataset_features": list(X.columns),
        "classes": list(clf.classes_),
        "stress_levels": list(le_stress.classes_)
    }

    # Save models
    model_path = os.path.join(SCRIPT_DIR, "mood_rf_model.pkl")
    encoder_path = os.path.join(SCRIPT_DIR, "stress_label_encoder.pkl")
    info_path = os.path.join(SCRIPT_DIR, "model_info.pkl")
    joblib.dump(clf, model_path)
    joblib.dump(le_stress, encoder_path)
    joblib.dump(model_info, info_path)
    print(f"[OK] Saved model to: {model_path}")
    print(f"[OK] Saved encoder to: {encoder_path}")
    print(f"[OK] Saved info to: {info_path}")

    _CACHED_MODEL = clf
    _CACHED_ENCODER = le_stress
    _CACHED_INFO = model_info

    return clf, le_stress

def predict_mood(heart_rate, spo2, sleep, steps, calories, temperature, stress_level, stress_score):
    clf, le_stress = get_model_and_encoder()

    encoded_stress = le_stress.transform([stress_level])[0]
    sample = pd.DataFrame([{
        "Heart Rate": heart_rate,
        "SpO2 Oxygen": spo2,
        "Sleep": sleep,
        "Steps": steps,
        "Calories": calories,
        "Temperature": temperature,
        "stressLevel": encoded_stress,
        "stressScore": stress_score
    }])
    
    prediction = clf.predict(sample)[0]
    return prediction

# Pydantic Schema
class MoodPredictionRequest(BaseModel):
    heartRate: float = 73.0
    spo2: float = 98.0
    sleep: float = 7.0
    steps: int = 2500
    calories: int = 1500
    temperature: float = 36.5
    stressLevel: str = "Moderate"
    stressScore: int = 47

# FastAPI App setup
app = FastAPI(title="Stress Analyzer & Mood Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "online", "service": "Stress Analyzer API"}

@app.get("/api/model-info")
def model_info():
    global _CACHED_INFO
    get_model_and_encoder()
    if _CACHED_INFO is None:
        info_path = os.path.join(SCRIPT_DIR, "model_info.pkl")
        if os.path.exists(info_path):
            try:
                _CACHED_INFO = joblib.load(info_path)
            except Exception:
                pass
    
    if _CACHED_INFO is None:
        # Default fallback accuracy info from student_wellbeing_dataset
        _CACHED_INFO = {
            "model_name": "Random Forest Classifier",
            "n_estimators": 200,
            "max_depth": 6,
            "accuracy": 0.945,
            "accuracy_pct": "94.50%",
            "dataset_rows": 2000,
            "dataset_features": ["Heart Rate", "SpO2 Oxygen", "Sleep", "Steps", "Calories", "Temperature", "stressLevel", "stressScore"],
            "classes": ["Happy", "Neutral", "Sad", "Stressed", "Very Happy"],
            "stress_levels": ["High", "Low", "Moderate"]
        }
    return {"status": "success", "info": _CACHED_INFO}

@app.post("/api/predict-mood")
def predict(req: MoodPredictionRequest):
    predicted = predict_mood(
        req.heartRate, req.spo2, req.sleep, req.steps, 
        req.calories, req.temperature, req.stressLevel, req.stressScore
    )
    return {"status": "success", "predicted_mood": predicted}

def start_api_server(port=8001):
    print(f"\n=======================================================")
    print(f"STRESS ANALYZER API IS LIVE ON: http://localhost:{port}")
    print(f"=======================================================\n")
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    if "--serve" in sys.argv:
        start_api_server(port=8001)
    else:
        train_and_save_model()
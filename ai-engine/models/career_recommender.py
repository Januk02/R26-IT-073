import pandas as pd
import numpy as np
import ast
import joblib
import os
import warnings

# Scikit-Learn tools for advanced modeling
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Suppress minor warnings for clean terminal output
warnings.filterwarnings("ignore")

class AdaptiveCareerRecommender:
    def __init__(self):
        print("Initializing Advanced Stacking Ensemble Engine (with TF-IDF Layer)...")
        self.mlb = MultiLabelBinarizer()
        self.tfidf = TfidfTransformer() # NEW: The TF-IDF Math Engine
        self.model = None
        
        # Define the file paths for model persistence
        self.model_path = "stacking_ensemble_model.pkl"
        self.encoder_path = "skill_encoder.pkl"
        self.tfidf_path = "tfidf_transformer.pkl" # NEW: Must save the exact penalty weights

    def _prepare_training_matrix(self, csv_path):
        """
        Transforms flat CSV data into a high-dimensional TF-IDF weighted matrix.
        """
        print(f"Loading and vectorizing dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        df['Extracted_Skills'] = df['Extracted_Skills'].apply(
            lambda x: ast.literal_eval(x) if isinstance(x, str) else []
        )
        
        df = df[df['Extracted_Skills'].map(len) > 0]
        
        # Step 1: Flatten to 1s and 0s
        binary_matrix = self.mlb.fit_transform(df['Extracted_Skills'])
        
        # Step 2: Apply the TF-IDF mathematical penalties and boosts
        X_matrix = self.tfidf.fit_transform(binary_matrix)
        
        y_vector = df['Target_Role'].values
        
        # Save both transformers for the live API
        joblib.dump(self.mlb, self.encoder_path)
        joblib.dump(self.tfidf, self.tfidf_path)
        
        return X_matrix, y_vector, self.mlb.classes_

    def train_model(self, csv_path):
        """
        Constructs and trains the Stacking Ensemble.
        """
        X, y, feature_names = self._prepare_training_matrix(csv_path)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print(f"Training Matrix Shape: {X_train.shape[0]} samples, {X_train.shape[1]} dimensional features.")
        
        # 1. Base Estimators (Slightly tuned for TF-IDF sparse matrices)
        base_learners = [
            ('rf', RandomForestClassifier(n_estimators=150, max_depth=None, random_state=42, class_weight='balanced')),
            ('svc', SVC(kernel='linear', probability=True, random_state=42, class_weight='balanced')) # Switched to 'linear' kernel for better NLP text classification
        ]
        
        # 2. Meta-Learner
        meta_learner = LogisticRegression(max_iter=1000, class_weight='balanced')
        
        # 3. Compile Architecture
        print("Compiling Stacking Classifier architectures and executing training loop...")
        self.model = StackingClassifier(
            estimators=base_learners,
            final_estimator=meta_learner,
            cv=5
        )
        
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        
        print(f"\n✅ Model Training Complete. Validation Accuracy: {acc * 100:.2f}%")
        print("\n--- Model Classification Report ---")
        print(classification_report(y_test, y_pred))
        
        joblib.dump(self.model, self.model_path)
        print(f"Model successfully serialized and saved to {self.model_path}")

    def predict_top_pathways(self, user_skills, top_n=3):
        """
        Transforms live user input using the saved MLB and TF-IDF transformers.
        """
        if self.model is None:
            self.model = joblib.load(self.model_path)
            self.mlb = joblib.load(self.encoder_path)
            self.tfidf = joblib.load(self.tfidf_path) # Load the TF-IDF weights
            
        # Transform input through BOTH layers
        user_binary = self.mlb.transform([user_skills])
        user_vector = self.tfidf.transform(user_binary)
        
        probabilities = self.model.predict_proba(user_vector)[0]
        class_labels = self.model.classes_
        
        role_probs = {label: prob for label, prob in zip(class_labels, probabilities)}
        sorted_roles = sorted(role_probs.items(), key=lambda item: item[1], reverse=True)
        
        print(f"\n--- Adaptive Career Pathway Predictions ---")
        print(f"User Input Skills: {user_skills}")
        
        results = []
        for i, (role, prob) in enumerate(sorted_roles[:top_n]):
            confidence = prob * 100
            print(f"{i+1}. {role} (Confidence: {confidence:.2f}%)")
            results.append({"role": role, "confidence": confidence})
            
        return results

# --- Execution Entry Point ---
if __name__ == "__main__":
    recommender = AdaptiveCareerRecommender()
    data_path = '../data/cleaned_multi_role_jobs.csv'
    
    recommender.train_model(data_path)
    
    print("\n[Executing Live TF-IDF Prediction Test]")
    # We test the exact scenario that failed previously
    simulated_user_skills = ["Python", "SQL", "Pandas", "Machine Learning", "AWS"]
    recommender.predict_top_pathways(simulated_user_skills, top_n=3)
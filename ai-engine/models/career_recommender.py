import pandas as pd
import numpy as np
import ast
import joblib
import os
import warnings

# Scikit-Learn tools for advanced modeling
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Suppress minor warnings for clean terminal output
warnings.filterwarnings("ignore")

class AdaptiveCareerRecommender:
    def __init__(self):
        print("Initializing Advanced Stacking Ensemble Engine...")
        self.mlb = MultiLabelBinarizer()
        self.model = None
        
        # Define the file paths for model persistence
        self.model_path = "stacking_ensemble_model.pkl"
        self.encoder_path = "skill_encoder.pkl"

    def _prepare_training_matrix(self, csv_path):
        """
        Transforms flat CSV data into a high-dimensional mathematical matrix.
        Uses MultiLabelBinarizer to One-Hot Encode the skill arrays.
        """
        print(f"Loading and vectorizing dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Convert string representations of lists back to actual Python lists
        df['Extracted_Skills'] = df['Extracted_Skills'].apply(
            lambda x: ast.literal_eval(x) if isinstance(x, str) else []
        )
        
        # Filter out any broken rows with no skills
        df = df[df['Extracted_Skills'].map(len) > 0]
        
        # X matrix: The predictive features (Skills)
        # We transform [['Python', 'SQL'], ['Java']] into a binary matrix of 1s and 0s
        X_matrix = self.mlb.fit_transform(df['Extracted_Skills'])
        
        # y vector: The target variable (Job Role)
        y_vector = df['Target_Role'].values
        
        # Save the encoder so we can process user input later with the exact same dimensions
        joblib.dump(self.mlb, self.encoder_path)
        
        return X_matrix, y_vector, self.mlb.classes_

    def train_model(self, csv_path):
        """
        Constructs and trains the Stacking Ensemble using Cross-Validation.
        """
        X, y, feature_names = self._prepare_training_matrix(csv_path)
        
        # Split data for rigorous testing (80% training, 20% validation)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print(f"Training Matrix Shape: {X_train.shape[0]} samples, {X_train.shape[1]} dimensional features.")
        
        # 1. Define the Base Estimators (Level 0)
        base_learners = [
            # RF handles the sparsity of the one-hot encoded skills well
            ('rf', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')),
            # SVC with probability=True allows the meta-learner to see confidence scores
            ('svc', SVC(kernel='rbf', probability=True, random_state=42, class_weight='balanced'))
        ]
        
        # 2. Define the Meta-Learner (Level 1)
        meta_learner = LogisticRegression(max_iter=1000)
        
        # 3. Construct the Stacking Architecture
        print("Compiling Stacking Classifier architectures and executing training loop...")
        self.model = StackingClassifier(
            estimators=base_learners,
            final_estimator=meta_learner,
            cv=5 # 5-fold cross-validation prevents data leakage between layers
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate the model
        y_pred = self.model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        
        print(f"\n✅ Model Training Complete. Validation Accuracy: {acc * 100:.2f}%")
        print("\n--- Model Classification Report ---")
        print(classification_report(y_test, y_pred))
        
        # Persist the trained weights to disk
        joblib.dump(self.model, self.model_path)
        print(f"Model successfully serialized and saved to {self.model_path}")

    def predict_top_pathways(self, user_skills, top_n=3):
        """
        Takes raw user input, transforms it, and predicts the highest probability roles.
        """
        # Load the model and encoder if not already loaded in memory
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError("Model not found. Please run train_model() first.")
            self.model = joblib.load(self.model_path)
            self.mlb = joblib.load(self.encoder_path)
            
        # Format the user's input exactly like the training data
        user_vector = self.mlb.transform([user_skills])
        
        # Extract probability distributions for all classes
        probabilities = self.model.predict_proba(user_vector)[0]
        class_labels = self.model.classes_
        
        # Map probabilities to their corresponding job roles
        role_probs = {label: prob for label, prob in zip(class_labels, probabilities)}
        
        # Sort by highest probability
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
    
    # Path to the data that generated in Phase 2
    data_path = '../data/cleaned_multi_role_jobs.csv'
    
    # 1. Train the model (This saves the .pkl files)
    recommender.train_model(data_path)
    
    # 2. Simulate User Input to test the prediction
    print("\n[Executing Live Prediction Test]")
    simulated_user_skills = ["Python", "SQL", "Pandas", "Machine Learning", "AWS", "React"]
    recommender.predict_top_pathways(simulated_user_skills, top_n=2)
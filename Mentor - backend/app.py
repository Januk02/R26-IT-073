"""
Mentorship Matching API Backend
Exposes ML model trained in enhanced_mentorship_with_real_data.ipynb
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
# Enable CORS for all origins during development
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.errorhandler(Exception)
def handle_error(error):
    """Global error handler to ensure CORS headers are always included"""
    import traceback
    print(f"❌ Error: {error}")
    print(traceback.format_exc())
    response = jsonify({
        'error': str(error),
        'type': type(error).__name__
    })
    response.status_code = 500
    return response

# Global model and data
model = None
df_mentors = None
df_mentees = None

def load_data():
    """Load mentors and mentees datasets"""
    global df_mentors, df_mentees

    base_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.abspath(os.path.join(base_dir, '..'))

    # Try to load from multiple sources
    mentors_paths = [
        os.path.join(base_dir, 'data', 'enhanced_mentors.csv'),
        os.path.join(base_dir, 'data', 'mentors.csv'),
        os.path.join(workspace_dir, 'NoteBook', 'complete_mentorship_system', 'enhanced_mentors.csv'),
        os.path.join(workspace_dir, 'NoteBook', 'enhanced_mentors.csv'),
        '../NoteBook/complete_mentorship_system/enhanced_mentors.csv',
        '../NoteBook/enhanced_mentors.csv'
    ]

    mentees_paths = [
        os.path.join(base_dir, 'data', 'enhanced_mentees.csv'),
        os.path.join(base_dir, 'data', 'mentees.csv'),
        os.path.join(workspace_dir, 'NoteBook', 'complete_mentorship_system', 'enhanced_mentees.csv'),
        os.path.join(workspace_dir, 'NoteBook', 'enhanced_mentees.csv'),
        '../NoteBook/complete_mentorship_system/enhanced_mentees.csv',
        '../NoteBook/enhanced_mentees.csv'
    ]

    for path in mentors_paths:
        if os.path.exists(path):
            df_mentors = pd.read_csv(path)
            print(f"✅ Loaded {len(df_mentors)} mentors from {path}")
            break

    for path in mentees_paths:
        if os.path.exists(path):
            df_mentees = pd.read_csv(path)
            print(f"✅ Loaded {len(df_mentees)} mentees from {path}")
            break

    if df_mentors is None or df_mentees is None:
        print("⚠️ Warning: Could not load datasets. Using synthetic data fallback.")
        generate_synthetic_data()

def generate_synthetic_data():
    """Generate synthetic data if real data not available"""
    global df_mentors, df_mentees

    import random

    universities = ["University of Colombo", "University of Moratuwa", "SLIIT", "NSBM"]
    domains = ["Software Engineering", "AI/ML", "Cybersecurity", "Data Science"]
    locations = ["Colombo", "Kandy", "Galle"]
    skills_pool = ["Python", "Java", "Machine Learning", "Cybersecurity", "Cloud Computing"]

    # Generate mentors
    mentors = []
    for i in range(1000):
        mentors.append({
            'mentor_id': f"M{i}",
            'name': f"Mentor_{i}",
            'email': f"mentor{i}@edu.lk",
            'gender': random.choice(['Male', 'Female']),
            'university': random.choice(universities),
            'industry_role': random.choice(['Lecturer', 'Engineer', 'Data Scientist']),
            'domain': random.choice(domains),
            'experience_years': random.randint(2, 20),
            'skills': ",".join(random.sample(skills_pool, 3)),
            'location': random.choice(locations),
            'verification_level': random.choice(['Bronze', 'Silver', 'Gold']),
            'combined_verification_score': round(random.uniform(60, 95), 2),
            'availability_hours': random.randint(2, 20),
            'mentoring_style': random.choice(['formal', 'casual', 'structured']),
            'languages': random.choice(['English', 'English,Sinhala'])
        })
    df_mentors = pd.DataFrame(mentors)

    # Generate mentees
    mentees = []
    for i in range(500):
        mentees.append({
            'student_id': f"S{i}",
            'name': f"Student_{i}",
            'email': f"student{i}@edu.lk",
            'gender': random.choice(['Male', 'Female']),
            'university': random.choice(universities),
            'degree_program': random.choice(['IT', 'CS', 'SE']),
            'year_of_study': random.randint(1, 4),
            'interests': random.choice(domains),
            'career_goal': random.choice(['Software Engineer', 'Data Scientist']),
            'location': random.choice(locations),
            'gpa': round(random.uniform(2.5, 4.0), 2),
            'available_hours': random.randint(1, 10),
            'preferred_communication_style': random.choice(['formal', 'casual']),
            'languages': random.choice(['English', 'English,Sinhala'])
        })
    df_mentees = pd.DataFrame(mentees)

    print(f"✅ Generated synthetic: {len(df_mentors)} mentors, {len(df_mentees)} mentees")

def train_model():
    """Train the mentorship matching model"""
    from sklearn.ensemble import RandomForestClassifier

    global model

    # Prepare training data
    training_data = []

    # Generate positive examples based on good matches
    for i in range(min(5000, len(df_mentors))):
        mentor = df_mentors.iloc[i % len(df_mentors)]
        mentee = df_mentees.iloc[i % len(df_mentees)]

        features = {
            'domain_match': 1 if mentor['domain'] == mentee['interests'] else 0,
            'university_match': 1 if mentor['university'] == mentee['university'] else 0,
            'location_match': 1 if mentor['location'] == mentee.get('location', '') else 0,
            'mentor_experience': mentor['experience_years'],
            'mentor_verification_score': mentor.get('combined_verification_score', 70),
            'mentee_year': mentee.get('year_of_study', 2),
            'mentee_gpa': mentee.get('gpa', 3.0),
            'availability_match': 1 if mentor['availability_hours'] >= mentee.get('available_hours', 5) else 0,
            'language_match': 1 if set(str(mentor.get('languages', 'English')).split(',')) & set(str(mentee.get('languages', 'English')).split(',')) else 0,
            'target': 1 if (mentor['domain'] == mentee['interests'] and mentor['verification_level'] in ['Gold', 'Silver']) else 0
        }
        training_data.append(features)

    training_df = pd.DataFrame(training_data)

    X = training_df.drop('target', axis=1)
    y = training_df['target']

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    print(f"✅ Model trained with {len(X)} samples")

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'mentorship_model.pkl')
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"💾 Model saved to {model_path}")

def calculate_compatibility_score(mentor, mentee):
    """Calculate detailed compatibility score"""
    score = 0
    breakdown = {}
    
    # Helper to safely get interests as a list
    def get_interests_list(interests):
        if isinstance(interests, list):
            return interests
        if isinstance(interests, str):
            return interests.split(',')
        if isinstance(interests, dict):
            return list(interests.values())
        return []

    # Domain matching (25%)
    mentee_interests_field = mentee.get('interests', '')
    mentee_interests_list = get_interests_list(mentee_interests_field)
    domain_match = 100 if mentor['domain'] in mentee_interests_list else 30
    breakdown['domain_match'] = domain_match
    score += domain_match * 0.25

    # Skills alignment (20%)
    mentor_skills = set(str(mentor['skills']).split(','))
    mentee_interests_set = set(mentee_interests_list)
    skill_overlap = len(mentor_skills.intersection(mentee_interests_set))
    skill_score = (skill_overlap / max(1, len(mentor_skills))) * 100
    breakdown['skills_alignment'] = skill_score
    score += skill_score * 0.20

    # Experience match (15%)
    exp_score = min(100, (mentor['experience_years'] / 15) * 100)
    breakdown['experience_match'] = exp_score
    score += exp_score * 0.15

    # Location preference (10%)
    location_match = 100 if mentor['location'] == mentee.get('location', '') else 70
    breakdown['location_preference'] = location_match
    score += location_match * 0.10

    # Language match (10%)
    mentor_langs = set(str(mentor.get('languages', 'English')).split(','))
    mentee_langs = set(str(mentee.get('languages', 'English')).split(','))
    lang_match = 100 if mentor_langs & mentee_langs else 50
    breakdown['language_match'] = lang_match
    score += lang_match * 0.10

    # Availability match (10%)
    avail_score = min(100, (mentor['availability_hours'] / max(1, mentee.get('available_hours', 5))) * 100)
    breakdown['availability_match'] = avail_score
    score += avail_score * 0.10

    # Verification bonus (25% - increased so Gold/Bronze distinction matters)
    verif_bonus = {'Gold': 100, 'Silver': 80, 'Bronze': 60}.get(mentor.get('verification_level', 'Bronze'), 50)
    breakdown['verification_bonus'] = verif_bonus
    score += verif_bonus * 0.25
    
    # Domain verification boost - Gold mentors in matching domain get extra bonus
    if mentor.get('verification_level') == 'Gold' and domain_match == 100:
        gold_domain_bonus = 10  # Additional 10 points for Gold + perfect domain match
        breakdown['gold_domain_bonus'] = gold_domain_bonus
        score += gold_domain_bonus
    
    # Cap at 100 but ensure Gold always beats Bronze for same student
    final_score = min(100, round(score, 2))
    
    return final_score, breakdown

# Initialize on startup
@app.before_request
def init():
    global model, df_mentors, df_mentees
    if model is None:
        load_data()

        # Try to load saved model
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'mentorship_model.pkl')
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print(f"✅ Loaded saved model from {model_path}")
        else:
            train_model()

# API Endpoints
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'mentors_count': len(df_mentors) if df_mentors is not None else 0,
        'mentees_count': len(df_mentees) if df_mentees is not None else 0,
        'model_loaded': model is not None
    })

@app.route('/api/mentors', methods=['GET'])
def get_mentors():
    """Get all mentors"""
    if df_mentors is None:
        return jsonify({'error': 'No mentor data available'}), 500

    # Convert to dict, handling NaN values
    mentors = df_mentors.fillna('').to_dict('records')
    return jsonify({'mentors': mentors, 'count': len(mentors)})

@app.route('/api/mentees', methods=['GET'])
def get_mentees():
    """Get all mentees"""
    if df_mentees is None:
        return jsonify({'error': 'No mentee data available'}), 500

    mentees = df_mentees.fillna('').to_dict('records')
    return jsonify({'mentees': mentees, 'count': len(mentees)})

@app.route('/api/match', methods=['POST'])
def predict_match():
    """Predict match compatibility between mentor and mentee"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        mentor_id = data.get('mentor_id')
        mentee_id = data.get('mentee_id')
        mentee_data = data.get('mentee_data')  # Full mentee data from frontend

        if not mentor_id or not mentee_id:
            return jsonify({'error': 'mentor_id and mentee_id required'}), 400

        # Find mentor
        mentor = df_mentors[df_mentors['mentor_id'] == mentor_id]
        if mentor.empty:
            return jsonify({'error': f'Mentor {mentor_id} not found'}), 404
        mentor = mentor.iloc[0]

        # Use provided mentee data or look up in dataset
        if mentee_data:
            # Use the full mentee data passed from frontend (Firestore student)
            mentee = pd.Series(mentee_data)
        else:
            # Look up in local dataset
            mentee = df_mentees[df_mentees['student_id'] == mentee_id]
            if mentee.empty:
                return jsonify({'error': f'Mentee {mentee_id} not found'}), 404
            mentee = mentee.iloc[0]

        # Calculate compatibility score
        compatibility, breakdown = calculate_compatibility_score(mentor, mentee)

        # Prepare model features
        features = {
            'domain_match': 1 if mentor['domain'] == mentee.get('interests', '') else 0,
            'university_match': 1 if mentor['university'] == mentee.get('university', '') else 0,
            'location_match': 1 if mentor['location'] == mentee.get('location', '') else 0,
            'mentor_experience': mentor['experience_years'],
            'mentor_verification_score': mentor.get('combined_verification_score', 70),
            'mentee_year': mentee.get('year_of_study', 2),
            'mentee_gpa': mentee.get('gpa', 3.0),
            'availability_match': 1 if mentor['availability_hours'] >= mentee.get('available_hours', 5) else 0,
            'language_match': 1 if set(str(mentor.get('languages', 'English')).split(',')) & set(str(mentee.get('languages', 'English')).split(',')) else 0
        }

        X = pd.DataFrame([features])

        # Get model prediction
        prediction_prob = model.predict_proba(X)[0]
        match_probability = round(prediction_prob[1] * 100, 2)

        return jsonify({
            'mentor_id': mentor_id,
            'mentee_id': mentee_id,
            'match_probability': match_probability,
            'compatibility_score': compatibility,
            'breakdown': breakdown,
            'recommendation': 'Highly Recommended' if compatibility >= 80 else 'Recommended' if compatibility >= 60 else 'Consider Other Options',
            'mentor_details': {
                'name': mentor['name'],
                'domain': mentor['domain'],
                'verification_level': mentor.get('verification_level', 'Bronze')
            },
            'mentee_details': {
                'name': mentee.get('name', 'Unknown'),
                'interests': mentee.get('interests', '')
            }
        })
    except Exception as e:
        import traceback
        print(f"❌ Error in predict_match: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/find-mentors', methods=['POST'])
def find_mentors_for_mentee():
    """Find best matching mentors for a mentee"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        mentee_id = data.get('mentee_id')
        mentee_data = data.get('mentee_data')  # Full mentee data from frontend
        top_n = data.get('top_n', 5)

        if not mentee_id:
            return jsonify({'error': 'mentee_id required'}), 400

        # Use provided mentee data or look up in dataset
        if mentee_data:
            mentee = pd.Series(mentee_data)
        else:
            mentee = df_mentees[df_mentees['student_id'] == mentee_id]
            if mentee.empty:
                return jsonify({'error': f'Mentee {mentee_id} not found'}), 404
            mentee = mentee.iloc[0]

        matches = []
        for _, mentor in df_mentors.iterrows():
            compatibility, breakdown = calculate_compatibility_score(mentor, mentee)

            matches.append({
                'mentor_id': mentor['mentor_id'],
                'name': mentor['name'],
                'domain': mentor['domain'],
                'university': mentor['university'],
                'experience_years': mentor['experience_years'],
                'verification_level': mentor.get('verification_level', 'Bronze'),
                'compatibility_score': compatibility,
                'breakdown': breakdown
            })

        # Sort by compatibility
        matches = sorted(matches, key=lambda x: x['compatibility_score'], reverse=True)

        return jsonify({
            'mentee_id': mentee_id,
            'mentee_name': mentee.get('name', 'Unknown'),
            'matches': matches[:top_n],
            'top_matches': matches[:top_n]
        })
    except Exception as e:
        import traceback
        print(f"❌ Error in find_mentors_for_mentee: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-interview', methods=['POST'])
def analyze_interview():
    """Use an AI rubric to evaluate mentor interview responses."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400

        questions = data.get('questions', [])
        answers = data.get('answers', {})

        if not isinstance(questions, list) or not questions:
            return jsonify({'error': 'At least one interview question is required'}), 400

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'AI interview scoring is not configured. Set GEMINI_API_KEY on the backend.'}), 503

        interview_items = []
        for idx, question_data in enumerate(questions):
            question = question_data.get('question', '') if isinstance(question_data, dict) else str(question_data)
            domain = question_data.get('domain', 'General mentoring') if isinstance(question_data, dict) else 'General mentoring'
            answer = str(answers.get(str(idx), answers.get(idx, ''))).strip()
            interview_items.append({'index': idx, 'domain': domain, 'question': question, 'answer': answer[:8000]})

        schema = {
            'type': 'object',
            'properties': {'evaluations': {'type': 'array', 'items': {
                'type': 'object',
                'properties': {
                    'index': {'type': 'integer'}, 'score': {'type': 'number'},
                    'feedback': {'type': 'string'},
                    'strengths': {'type': 'array', 'items': {'type': 'string'}},
                    'improvements': {'type': 'array', 'items': {'type': 'string'}}
                },
                'required': ['index', 'score', 'feedback', 'strengths', 'improvements']
            }}},
            'required': ['evaluations']
        }
        rubric = '''You are a fair mentor-interview assessor. Evaluate each answer by meaning, never keyword matching. Score 0-10: 0 no answer/irrelevant; 1-3 minimal or unsafe; 4-5 limited; 6-7 competent and practical; 8-9 strong, specific, empathetic and professional; 10 exceptional, nuanced, actionable and appropriate. Consider relevance, practical mentoring approach, empathy/communication, professional boundaries, and examples where relevant. Do not reward verbosity, writing style, protected traits, or particular words. Return one evaluation for every supplied index.'''
        gemini_client = genai.Client(api_key=api_key)
        response = gemini_client.models.generate_content(
            model=os.getenv('GEMINI_MODEL', 'gemini-3.6-flash'),
            contents=f'{rubric}\n\nInterview answers:\n{json.dumps(interview_items)}',
            config={
                'response_mime_type': 'application/json',
                'response_schema': schema,
                'temperature': 0.2
            }
        )
        evaluations = json.loads(response.text).get('evaluations', [])
        evaluations_by_index = {item.get('index'): item for item in evaluations if isinstance(item, dict)}
        scores = {}
        domain_breakdown = {}
        feedback = {}
        for item in interview_items:
            evaluation = evaluations_by_index.get(item['index'])
            if not evaluation:
                return jsonify({'error': 'AI evaluation was incomplete. Please submit again.'}), 502
            score = max(0, min(10, round(float(evaluation['score']), 1)))
            scores[item['index']] = score
            domain_breakdown.setdefault(item['domain'], []).append(score)
            feedback[item['index']] = {
                'feedback': evaluation['feedback'],
                'strengths': evaluation['strengths'],
                'improvements': evaluation['improvements']
            }

        domain_averages = {d: round(float(np.mean(vals)), 1) for d, vals in domain_breakdown.items()}
        total_possible = len(questions) * 10
        total_earned = sum(scores.values())
        overall_percentage = round((total_earned / max(1, total_possible)) * 100, 1)

        return jsonify({
            'scores': scores,
            'overallScore': overall_percentage,
            'domainAverages': domain_averages,
            'feedback': feedback,
            'status': 'qualified' if overall_percentage >= 50 else 'needs-retry'
        })
    except Exception as e:
        import traceback
        print(f"❌ Error in analyze_interview: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get platform statistics"""
    if df_mentors is None or df_mentees is None:
        return jsonify({'error': 'Data not available'}), 500

    # Domain distribution
    mentor_domains = df_mentors['domain'].value_counts().to_dict()
    mentee_interests = df_mentees['interests'].value_counts().to_dict()

    # Verification levels
    verification_dist = df_mentors.get('verification_level', pd.Series(['Bronze']*len(df_mentors))).value_counts().to_dict()

    return jsonify({
        'total_mentors': len(df_mentors),
        'total_mentees': len(df_mentees),
        'mentor_domains': mentor_domains,
        'mentee_interests': mentee_interests,
        'verification_distribution': verification_dist,
        'universities_represented': df_mentors['university'].nunique()
    })

if __name__ == '__main__':
    print("🚀 Starting Mentorship Matching API...")
    load_data()
    train_model()
    print(f"🎯 API ready at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

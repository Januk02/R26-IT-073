# Mentorship Matching API Backend

Flask-based backend for the mentorship matching ML model from `enhanced_mentorship_with_real_data.ipynb`.

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- Firebase project with Firestore database (for live data)

## 🚀 Quick Start

### Option 1: Using start.bat (Windows)
```bash
cd backend
start.bat
```

### Option 2: Manual Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start server
python app.py
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/mentors` | GET | Get all mentors from Firestore |
| `/api/mentees` | GET | Get all mentees from Firestore |
| `/api/match` | POST | Predict mentor-mentee match |
| `/api/find-mentors` | POST | Find best mentors for mentee |
| `/api/stats` | GET | Platform statistics |
| `/api/match-profiles` | POST | Match Firestore profiles directly |

## 📊 Example Usage

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Match Prediction
```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"mentor_id": "M1", "mentee_id": "S1"}'
```

### Find Mentors for Mentee
```bash
curl -X POST http://localhost:5000/api/find-mentors \
  -H "Content-Type: application/json" \
  -d '{"mentee_id": "S1", "top_n": 5}'
```

## 🔗 Frontend Integration

The backend includes CORS configured for:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://127.0.0.1:5173`

Add your edusoul-app URL to the CORS origins in `app.py` if needed.

## � Configuration

### Firebase Setup

The backend now fetches mentor and mentee data directly from Firestore. To enable this:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (JSON file)
3. Copy the values from the JSON file to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### Fallback to CSV Files

If Firebase is not configured or fails, the backend will automatically fall back to loading from CSV files in the `data/` folder.

### Environment Variables

Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

## �📁 Folder Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── run.py             # Convenience startup script
├── start.bat          # Windows batch startup
├── .env.example       # Environment variables template
├── models/            # Trained ML models (auto-created)
└── data/              # Dataset files (fallback, auto-created)
```

## � Notes

- **Primary Data Source**: Firestore database (mentorProfiles, studentMentorshipProfiles collections)
- **Fallback**: CSV files in `data/` folder if Firestore is unavailable
- **Fallback**: Synthetic data generation if both Firestore and CSV are unavailable
- The model is trained automatically on first run
- Model is saved to `models/mentorship_model.pkl` for reuse
- Firebase Admin SDK is used for server-side Firestore access

# Mentorship Matching API Backend

Flask-based backend for the mentorship matching ML model from `enhanced_mentorship_with_real_data.ipynb`.

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)

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

# Start server
python app.py
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/mentors` | GET | Get all mentors |
| `/api/mentees` | GET | Get all mentees |
| `/api/match` | POST | Predict mentor-mentee match |
| `/api/find-mentors` | POST | Find best mentors for mentee |
| `/api/stats` | GET | Platform statistics |

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

## 📁 Folder Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── run.py             # Convenience startup script
├── start.bat          # Windows batch startup
├── .env.example       # Environment variables template
├── models/            # Trained ML models (auto-created)
└── data/              # Dataset files (auto-created)
```

## 🔧 Configuration

Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

## 📝 Notes

- If no data files are found, synthetic data will be auto-generated
- The model is trained automatically on first run
- Model is saved to `models/mentorship_model.pkl` for reuse

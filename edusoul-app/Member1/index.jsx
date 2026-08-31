import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { useAuth } from '../src/contexts/AuthContext';
import DreamDegreeHome from './pages/DreamDegreeHome';
import DreamDegreeInput from './pages/DreamDegreeInput';
import DreamDegreeResults from './pages/DreamDegreeResults';
import DreamDegreeRoadmap from './pages/DreamDegreeRoadmap';
import DreamDegreeGuidance from './pages/DreamDegreeGuidance';
import StudentProfile from './pages/StudentProfile';
import { getRecommendations, getBackwardAnalysis } from './services/apiService';

export default function Member1DreamDegreeAdvisor({ onBack, onLogin, onLogout, onNavigateToDashboard, initialView = 'home', initialStudentData = null }) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(initialView);
  const [studentData, setStudentData] = useState(initialStudentData);
  const [backendResults, setBackendResults] = useState(null);
  const [backwardAnalysis, setBackwardAnalysis] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);

  // Fetch existing profile from Firebase when user is logged in
  useEffect(() => {
    const fetchExisting = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'students', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.personalInfo) setExistingProfile(data);
        }
      } catch (e) {
        console.error('Error fetching existing profile:', e);
      }
    };
    fetchExisting();
  }, [user]);

  const handleStart = () => {
    setCurrentView('input');
  };

  const handleAnalyze = async (data) => {
    setStudentData(data);
    setIsLoading(true);
    setError(null);

    try {
      // Save student profile to Firebase if user is logged in
      if (user) {
        const studentProfile = {
          uid: user.uid,
          email: user.email || '',
          personalInfo: data.personalInfo,
          dreamJob: data.dreamJob,
          academicResults: data.academicResults,
          personalityScores: data.personalityScores,
          lifestylePreferences: data.lifestylePreferences,
          role: 'student',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'students', user.uid), studentProfile, { merge: true });
        setExistingProfile(studentProfile);
      }

      // Fetch recommendations and backward analysis in parallel
      // backward-analysis can fail for custom jobs not in knowledge base — don't block results
      const [recommendations, backward] = await Promise.all([
        getRecommendations(data),
        data.dreamJob
          ? getBackwardAnalysis(data.dreamJob).catch(() => null)
          : Promise.resolve(null),
      ]);

      setBackendResults(recommendations);
      setBackwardAnalysis(backward || {});
      setCurrentView('results');
    } catch (err) {
      console.error('Backend API Error:', err);
      setError(err.message || 'Failed to connect to the AI backend. Please ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (studentData) {
      handleAnalyze(studentData);
    }
  };

  const handleViewRoadmap = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setCurrentView('roadmap');
  };

  const handleViewGuidance = () => {
    setCurrentView('guidance');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleBackToInput = () => {
    setCurrentView('input');
  };

  const handleBackToResults = () => {
    setCurrentView('results');
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          {/* Animated Brain Icon */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">AI Model Processing</h2>
          <p className="text-blue-200/80 text-lg mb-6">
            Our trained Random Forest model is analyzing your profile across 44 universities...
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 text-left bg-white/5 rounded-2xl p-6 border border-white/10">
            {[
              'Analyzing personality traits...',
              'Running career prediction model...',
              'Matching with university programs...',
              'Calculating admission probabilities...',
              'Generating career roadmap...',
            ].map((step, i) => (
              <div key={i} className="flex items-center space-x-3" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                <span className="text-blue-100/70 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Connection Error</h2>
          <p className="text-red-200/80 mb-2">Could not reach the AI backend server.</p>
          <p className="text-sm text-red-300/60 mb-8 bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-mono">
            {error}
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10 text-left">
            <p className="text-white font-medium mb-2">Make sure the backend is running:</p>
            <code className="text-blue-300 text-sm block bg-black/30 p-3 rounded-lg">
              cd backend && python flask_app.py
            </code>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-500/30"
            >
              Retry Connection
            </button>
            <button
              onClick={handleBackToInput}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentView === 'home' && (
        <DreamDegreeHome onStart={handleStart} onLogin={onLogin} onLogout={onLogout} onNavigateToDashboard={onNavigateToDashboard} onViewProfile={handleViewProfile} />
      )}
      {currentView === 'input' && (
        <DreamDegreeInput
          onAnalyze={handleAnalyze}
          onBack={handleBackToHome}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
          initialData={existingProfile}
        />
      )}
      {currentView === 'profile' && (
        <StudentProfile
          onBack={handleBackToHome}
          onEditProfile={handleBackToInput}
        />
      )}
      {currentView === 'results' && studentData && backendResults && (
        <DreamDegreeResults
          studentData={studentData}
          backendResults={backendResults}
          backwardAnalysis={backwardAnalysis}
          onBack={handleBackToInput}
          onHome={handleBackToHome}
          onViewRoadmap={handleViewRoadmap}
          onViewGuidance={handleViewGuidance}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      )}
      {currentView === 'guidance' && studentData && (
        <DreamDegreeGuidance
          studentData={studentData}
          backendResults={backendResults}
          onBack={handleBackToResults}
          onHome={handleBackToHome}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
          onComplete={(rec) => {
            // If called without a recommendation (e.g. from Guidance page button),
            // use the first recommendation from backend results
            const recommendation = rec || backendResults?.recommendations?.[0];
            if (recommendation) {
              handleViewRoadmap(recommendation);
            } else {
              handleBackToResults();
            }
          }}
        />
      )}
      {currentView === 'roadmap' && studentData && selectedRecommendation && (
        <DreamDegreeRoadmap
          recommendation={selectedRecommendation}
          studentData={studentData}
          onBack={handleBackToResults}
          onHome={handleBackToHome}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      )}
    </div>
  );
}

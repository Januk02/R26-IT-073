import AdvisorModuleLayout from './components/AdvisorModuleLayout';
import AdvisorDashboard from './pages/AdvisorDashboard';
import { useAdvisorTranslation } from './data/advisorTranslations';
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

// Firestore does not accept `undefined` at any depth in a document. Optional
// form fields may be absent in older profiles, so omit those values on save.
const removeUndefined = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item === undefined ? null : removeUndefined(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefined(item)])
    );
  }

  return value;
};

export default function Member1DreamDegreeAdvisor({ onBack, onNavigateToDashboard, initialView = 'home', initialStudentData = null }) {
  const tr = useAdvisorTranslation();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(initialView);
  const [studentData, setStudentData] = useState(initialStudentData);
  const [backendResults, setBackendResults] = useState(null);
  const [backwardAnalysis, setBackwardAnalysis] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
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
    setFieldErrors({});

    try {
      // Fetch recommendations and backward analysis in parallel
      // backward-analysis can fail for custom jobs not in knowledge base — don't block results
      const [recommendations, backward] = await Promise.all([
        getRecommendations(data),
        data.dreamJob
          ? getBackwardAnalysis(data.dreamJob, data).catch(() => null)
          : Promise.resolve(null),
      ]);

      // Save student profile to Firebase if user is logged in
      if (user) {
        try {
          const studentProfile = {
            uid: user.uid,
            email: user.email || '',
            personalInfo: data.personalInfo || { name: '', age: '', district: data.district || '' },
            dreamJob: data.dreamJob || data.dream_job || '',
            academicResults: data.academicResults || { stream: data.stream || '', zScore: data.z_score || 0 },
            personalityScores: data.personalityScores || {},
            skillScores: data.skillScores || {},
            lifestylePreferences: data.lifestylePreferences || {},
            role: 'student',
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'students', user.uid), removeUndefined(studentProfile), { merge: true });
          setExistingProfile(studentProfile);
        } catch (firebaseErr) {
          console.warn('Could not save profile to Firebase:', firebaseErr);
        }
      }

      setBackendResults(recommendations);
      setBackwardAnalysis({ ...(backward || {}), backward_analysis: recommendations.backward_analysis || backward?.backward_analysis || {} });
      setCurrentView('results');
    } catch (err) {
      console.error('Backend API Error:', err);
      setFieldErrors(err.fieldErrors || {});
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
    setCurrentView('dashboard');
  };

  const handleBackToInput = () => {
    setError(null);
    setFieldErrors({});
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
      <div className="advisor-workspace advisor-state">
        <div className="advisor-state-card" role="status" aria-live="polite">
          <div className="advisor-state-spinner" aria-hidden="true" />
          <p className="advisor-eyebrow" style={{ marginTop: 24 }}>{tr('YOUR DEGREE & CAREER PLAN')}</p>
          <h2>{tr('Preparing your recommendations')}</h2>
          <p>{tr('Checking your goal requirements and supplied profile evidence...')}</p>
          <p>{tr('Comparing reference cutoff readiness...')}</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="advisor-workspace advisor-state">
        <div className="advisor-state-card" role="alert">
          <p className="advisor-eyebrow">{tr('YOUR DEGREE & CAREER PLAN')}</p>
          <h2>{tr(Object.keys(fieldErrors).length ? "Profile validation" : "Connection Error")}</h2>
          <p>{tr(Object.keys(fieldErrors).length ? "Review the fields below and return to your profile." : "Could not reach the AI backend server.")}</p>
          <p>{tr(error)}</p>
          {Object.keys(fieldErrors).length > 0 && <ul className="text-sm text-slate-600 space-y-2 my-5">{Object.entries(fieldErrors).map(([field, detail]) => <li key={field}><strong>{tr(field === 'subject_grades' ? 'Academic evidence' : field)}</strong>: {tr(typeof detail === 'string' ? detail : detail.message)}</li>)}</ul>}
          <div className="flex flex-wrap items-center gap-5 mt-6">
            {!Object.keys(fieldErrors).length && <button onClick={handleRetry} className="advisor-primary">{tr("Retry Connection")}</button>}
            <button onClick={handleBackToInput} className={Object.keys(fieldErrors).length ? 'advisor-primary' : 'advisor-nav-link'}>{tr("Back to Form")}</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'home') return <DreamDegreeHome onStart={handleStart} onLaunch={() => setCurrentView('dashboard')} onNavigateToDashboard={onNavigateToDashboard || onBack} />;

  const latestRoadmap = backendResults?.recommendations?.[0] || (backendResults?.career_plan ? { career_plan: backendResults.career_plan, roadmap_stages: backendResults.career_plan.roadmap_stages } : null);
  const navigateAdvisor = view => {
    if (view === 'roadmap') { if (latestRoadmap) handleViewRoadmap(latestRoadmap); return; }
    if (['results', 'guidance'].includes(view) && !backendResults) return;
    setCurrentView(view);
  };
  return (
    <AdvisorModuleLayout view={currentView} onNavigate={navigateAdvisor} onPortal={onNavigateToDashboard || onBack} hasResults={!!backendResults} hasRoadmap={!!latestRoadmap}>
      {currentView === 'dashboard' && <AdvisorDashboard profile={studentData || existingProfile} results={backendResults} userName={user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]} onNavigate={navigateAdvisor} />}
      {tr(currentView === 'input' && (
        <DreamDegreeInput
          onAnalyze={handleAnalyze}
          onBack={handleBackToHome}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
          initialData={studentData || existingProfile}
        />
      ))}
      {tr(currentView === 'profile' && (
        <StudentProfile
          initialProfile={studentData || existingProfile}
          onBack={handleBackToHome}
          onEditProfile={handleBackToInput}
        />
      ))}
      {tr(currentView === 'results' && studentData && backendResults && (
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
      ))}
      {tr(currentView === 'guidance' && studentData && (
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
      ))}
      {tr(currentView === 'roadmap' && studentData && selectedRecommendation && (
        <DreamDegreeRoadmap
          recommendation={selectedRecommendation}
          studentData={studentData}
          onBack={handleBackToResults}
          onHome={handleBackToHome}
          onViewProfile={handleViewProfile}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      ))}
    </AdvisorModuleLayout>
  );
}

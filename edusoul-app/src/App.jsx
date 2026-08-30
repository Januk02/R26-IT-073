import { useState, useEffect, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar, { SIDEBAR_WIDTH } from './components/Sidebar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from '../Member4/pages/MentorDashboard';
import MentorVerification from '../Member4/pages/MentorVerification';
import VerificationHistory from '../Member4/pages/VerificationHistory';
import CVVerification from '../Member4/pages/CVVerification';
import ProtectedRoute from './components/ProtectedRoute';
import StudyBot from './components/StudyBot';
import ChatHub from './pages/ChatHub';
import Member1DreamDegreeAdvisor from '../Member1/index';
import DreamDegreeInput from '../Member1/pages/DreamDegreeInput';
import Member2Courses from '../Member2/index';
import Member3Analytics from '../Member3/index';
import MentorshipPage from '../Member4/pages/MentorshipPage';
import './App.css';

import { LanguageProvider, LanguageContext, useLanguage } from './contexts/LanguageContext';
export { LanguageContext, useLanguage };

// ── Views that get the sidebar + layout shell ─────────────────
const WITH_SIDEBAR = [
  'dashboard', 
  'studentHome', 
  'analytics', 
  'mentorHub', 
  'messages', 
  'verification', 
  'cvVerification', 
  'history'
];
// Views that are full-screen (no parent sidebar, own layout)
const FULL_SCREEN  = ['home', 'login', 'register', 'onboarding', 'courses', 'dreamDegreeAdvisor'];

// ── App shell layout ──────────────────────────────────────────
function Layout({ currentView, setCurrentView, children }) {
  const showSidebar = WITH_SIDEBAR.includes(currentView);

  if (!showSidebar) return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main
        style={{
          flex: 1,
          marginLeft: SIDEBAR_WIDTH,
          minHeight: '100vh',
          overflow: 'auto',
          background: '#f8faff',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </main>

      {/* Global StudyBot AI Assistant available across Dashboard & Member functions */}
      <StudyBot onNavigate={setCurrentView} currentView={currentView} />

      {/* Mobile override */}
      <style>{`
        @media (max-width: 768px) {
          main { margin-left: 0 !important; padding-top: 56px; }
        }
      `}</style>
    </div>
  );
}

// ── Main content router ───────────────────────────────────────
function AppContent({ currentView, setCurrentView }) {
  const { user, userRole, loading: authLoading, logout } = useAuth();
  const [registerRole, setRegisterRole] = useState('student');
  const [onboardingData, setOnboardingData] = useState(null);
  const [chatInitialMentor, setChatInitialMentor] = useState(null);

  // Redirect after login / on app load if already authenticated
  useEffect(() => {
    if (user && userRole) {
      if (currentView === 'login' || currentView === 'register') {
        // Fresh login/register → go through onboarding first
        setCurrentView(userRole === 'mentor' ? 'dashboard' : 'onboarding');
      } else if (currentView === 'home') {
        // Already logged in, landed on home → skip onboarding, go straight to dashboard
        setCurrentView(userRole === 'mentor' ? 'dashboard' : 'studentHome');
      }
    }
    // Redirect unauthenticated users away from protected views
    if (!user && !authLoading && !FULL_SCREEN.includes(currentView)) {
      setCurrentView('home');
    }
  }, [user, userRole, authLoading, currentView, setCurrentView]);

  // ── Handlers ──────────────────────────────────────────────
  const go = (view) => () => setCurrentView(view);

  const goToRegister = (role = 'student') => {
    setRegisterRole(role);
    setCurrentView('register');
  };

  const goToMessages = (mentor = null) => {
    setChatInitialMentor(mentor);
    setCurrentView('messages');
  };

  const content = (() => {
    switch (currentView) {

      // ── Public ──
      case 'home':
        return (
          <HomePage
            onNavigateToLogin={go('login')}
            onNavigateToRegister={goToRegister}
          />
        );

      case 'login':
        return <Login onNavigateToRegister={goToRegister} onNavigateToHome={go('home')} />;

      case 'register':
        return <Register onNavigateToLogin={go('login')} onNavigateToHome={go('home')} initialRole={registerRole} />;

      // ── Onboarding (full-screen, no sidebar) ──
      case 'onboarding':
        return (
          <ProtectedRoute>
            <DreamDegreeInput
              onAnalyze={(data) => {
                setOnboardingData(data);
                setCurrentView('studentHome');
              }}
              onFinishOnboarding={() => {
                setCurrentView('studentHome');
              }}
              onBack={go('home')}
            />
          </ProtectedRoute>
        );

      // ── Student ──
      case 'dreamDegreeAdvisor':
        return (
          <ProtectedRoute>
            <Member1DreamDegreeAdvisor
              onBack={go('studentHome')}
              onLogin={go('login')}
              onLogout={logout}
              onNavigateToDashboard={go('studentHome')}
              initialStudentData={onboardingData}
              initialView={onboardingData ? 'results' : 'home'}
            />
          </ProtectedRoute>
        );

      case 'studentHome':
        return (
          <ProtectedRoute>
            <StudentDashboard
              onStartDreamDegreeAdvisor={go('dreamDegreeAdvisor')}
              onNavigateToCourses={go('courses')}
              onNavigateToAnalytics={go('analytics')}
              onNavigateToMentorHub={go('mentorHub')}
              onNavigateToMessages={() => goToMessages(null)}
            />
          </ProtectedRoute>
        );

      // ── Member2: Courses ──
      case 'courses':
        return (
          <ProtectedRoute>
            <Member2Courses onBack={go('studentHome')} />
          </ProtectedRoute>
        );

      // ── Member3: Analytics ──
      case 'analytics':
        return (
          <ProtectedRoute>
            <Member3Analytics onBack={go('studentHome')} />
          </ProtectedRoute>
        );

      // ── Member4: Mentor Hub / AI Matching ──
      case 'mentorHub':
        return (
          <ProtectedRoute>
            <MentorshipPage 
              onBack={go(userRole === 'mentor' ? 'dashboard' : 'studentHome')} 
            />
          </ProtectedRoute>
        );

      // ── Firebase Mentor-Student Chat ──
      case 'messages':
        return (
          <ProtectedRoute>
            <ChatHub 
              onBack={go(userRole === 'mentor' ? 'dashboard' : 'studentHome')} 
              initialMentor={chatInitialMentor}
            />
          </ProtectedRoute>
        );

      // ── Mentor ──
      case 'dashboard':
        return (
          <ProtectedRoute>
            {authLoading || !userRole ? (
              <LoadingSpinner />
            ) : (
              <MentorDashboard
                onStartVerification={go('verification')}
                onViewHistory={go('history')}
                onStartCVVerification={go('cvVerification')}
                onMentorshipMatching={go('mentorHub')}
                onNavigateToMessages={() => goToMessages(null)}
              />
            )}
          </ProtectedRoute>
        );

      case 'verification':
        return (
          <ProtectedRoute>
            <MentorVerification
              onComplete={go('dashboard')}
              onCancel={go('dashboard')}
            />
          </ProtectedRoute>
        );

      case 'cvVerification':
        return (
          <ProtectedRoute>
            <CVVerification
              onComplete={go('dashboard')}
              onCancel={go('dashboard')}
            />
          </ProtectedRoute>
        );

      case 'history':
        return (
          <ProtectedRoute>
            <VerificationHistory onClose={go('dashboard')} />
          </ProtectedRoute>
        );

      default:
        return (
          <HomePage
            onNavigateToLogin={go('login')}
            onNavigateToRegister={goToRegister}
          />
        );
    }
  })();

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {content}
    </Layout>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8faff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, border: '4px solid #bfdbfe',
          borderTopColor: '#1d4ed8', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading your dashboard…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent currentView={currentView} setCurrentView={setCurrentView} />
      </AuthProvider>
    </LanguageProvider>
  );
}

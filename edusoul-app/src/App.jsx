import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MentorVerification from './pages/MentorVerification';
import VerificationHistory from './pages/VerificationHistory';
import CVVerification from './pages/CVVerification';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent({ currentView, setCurrentView }) {
  const { user, userRole, loading: authLoading } = useAuth();

  // Handle navigation after login - wait for role to be loaded
  useEffect(() => {
    if (user && userRole && currentView === 'login') {
      setCurrentView('dashboard');
    }
  }, [user, userRole, currentView, setCurrentView]);

  const handleVerificationComplete = () => {
    setCurrentView('dashboard');
  };

  const handleVerificationCancel = () => {
    setCurrentView('dashboard');
  };

  const handleStartVerification = () => {
    setCurrentView('verification');
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleStartCVVerification = () => {
    setCurrentView('cvVerification');
  };

  const handleCloseHistory = () => {
    setCurrentView('dashboard');
  };

  return (
    <div>
      {currentView === 'login' && (
        <Login onNavigateToRegister={() => setCurrentView('register')} />
      )}
      {currentView === 'register' && (
        <Register onNavigateToLogin={() => setCurrentView('login')} />
      )}
      {currentView === 'verification' && (
        <ProtectedRoute>
          <MentorVerification 
            onComplete={handleVerificationComplete}
            onCancel={handleVerificationCancel}
          />
        </ProtectedRoute>
      )}
      {currentView === 'cvVerification' && (
        <ProtectedRoute>
          <CVVerification 
            onComplete={handleVerificationComplete}
            onCancel={handleVerificationCancel}
          />
        </ProtectedRoute>
      )}
      {currentView === 'history' && (
        <ProtectedRoute>
          <VerificationHistory onClose={handleCloseHistory} />
        </ProtectedRoute>
      )}
      {currentView === 'dashboard' && (
        <ProtectedRoute>
          {authLoading || !userRole ? (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          ) : userRole === 'mentor' ? (
            <MentorDashboard 
              onStartVerification={handleStartVerification}
              onViewHistory={handleViewHistory}
              onStartCVVerification={handleStartCVVerification}
            />
          ) : (
            <StudentDashboard />
          )}
        </ProtectedRoute>
      )}
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('login');

  const handleAuthChange = (isAuthenticated, role) => {
    // Remove automatic navigation to prevent overriding manual view changes
  };

  return (
    <AuthProvider onAuthChange={handleAuthChange}>
      <AppContent currentView={currentView} setCurrentView={setCurrentView} />
    </AuthProvider>
  );
}

export default App;

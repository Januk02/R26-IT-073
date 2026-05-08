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
  const { user, userRole } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Only redirect to dashboard on initial mount if user is authenticated and on login page
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (user && currentView === 'login') {
        setCurrentView('dashboard');
      }
    }
  }, [user, currentView, setCurrentView, mounted]);

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
          {userRole === 'mentor' ? (
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

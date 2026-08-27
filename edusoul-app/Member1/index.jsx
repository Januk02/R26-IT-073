import { useState } from 'react';
import DreamDegreeHome from './pages/DreamDegreeHome';
import DreamDegreeInput from './pages/DreamDegreeInput';
import DreamDegreeResults from './pages/DreamDegreeResults';
import DreamDegreeRoadmap from './pages/DreamDegreeRoadmap';
import DreamDegreeGuidance from './pages/DreamDegreeGuidance';

export default function Member1DreamDegreeAdvisor({ onBack, onLogin, onLogout, onNavigateToDashboard, initialView = 'home', initialStudentData = null }) {
  const [currentView, setCurrentView] = useState(initialView);
  const [studentData, setStudentData] = useState(initialStudentData);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const handleStart = () => {
    setCurrentView('input');
  };

  const handleAnalyze = (data) => {
    setStudentData(data);
    setCurrentView('results');
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

  const handleBackToHomeFromResults = () => {
    setCurrentView('home');
  };

  const handleBackToHomeFromRoadmap = () => {
    setCurrentView('home');
  };

  return (
    <div>
      {currentView === 'home' && (
        <DreamDegreeHome onStart={handleStart} onLogin={onLogin} onLogout={onLogout} onNavigateToDashboard={onNavigateToDashboard} />
      )}
      {currentView === 'input' && (
        <DreamDegreeInput 
          onAnalyze={handleAnalyze}
          onBack={onBack}
        />
      )}
      {currentView === 'results' && studentData && (
        <DreamDegreeResults 
          studentData={studentData}
          onBack={handleBackToInput}
          onHome={handleBackToHomeFromResults}
          onViewRoadmap={handleViewRoadmap}
          onViewGuidance={handleViewGuidance}
        />
      )}
      {currentView === 'guidance' && studentData && (
        <DreamDegreeGuidance 
          studentData={studentData}
          onBack={handleBackToResults}
          onHome={handleBackToHome}
          onComplete={handleViewRoadmap}
        />
      )}
      {currentView === 'roadmap' && studentData && selectedRecommendation && (
        <DreamDegreeRoadmap 
          recommendation={selectedRecommendation}
          studentData={studentData}
          onBack={handleBackToResults}
          onHome={handleBackToHomeFromRoadmap}
        />
      )}
    </div>
  );
}

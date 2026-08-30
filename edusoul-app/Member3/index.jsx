import { useState } from 'react';
import StressAnalyticsHome from './pages/StressAnalyticsHome';
import StudyPlanner from './pages/StudyPlanner';
import ProgressReport from './pages/ProgressReport';

export default function Member3Analytics({ onBack }) {
  const [view, setView] = useState('home');

  return (
    <div>
      {view === 'home' && (
        <StressAnalyticsHome
          onViewPlanner={() => setView('planner')}
          onViewReport={() => setView('report')}
        />
      )}
      {view === 'planner' && (
        <StudyPlanner onBack={() => setView('home')} />
      )}
      {view === 'report' && (
        <ProgressReport onBack={() => setView('home')} />
      )}
    </div>
  );
}

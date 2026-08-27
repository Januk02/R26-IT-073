import { useState } from 'react';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import StudyPlanner from './pages/StudyPlanner';
import ProgressReport from './pages/ProgressReport';

export default function Member3Analytics({ onBack }) {
  const [view, setView] = useState('dashboard');

  return (
    <div>
      {view === 'dashboard' && (
        <AnalyticsDashboard
          onViewPlanner={() => setView('planner')}
          onViewReport={() => setView('report')}
        />
      )}
      {view === 'planner' && (
        <StudyPlanner onBack={() => setView('dashboard')} />
      )}
      {view === 'report' && (
        <ProgressReport onBack={() => setView('dashboard')} />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Member3Landing from './pages/Landing';
import StressAnalyticsHome from './pages/StressAnalyticsHome';
import StudyPlanner from './pages/StudyPlanner';
import ProgressReport from './pages/ProgressReport';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';

export default function Member3Analytics({ onBack }) {
  const [view, setView] = useState('landing');

  return (
    <ThemeProvider>
      <div className="member3-root-container">
        {view === 'landing' && (
          <Member3Landing
            onLaunchHub={() => setView('home')}
            onViewPlanner={() => setView('planner')}
            onViewReport={() => setView('report')}
            onViewDashboard={() => setView('dashboard')}
            onBackToPortal={onBack}
          />
        )}

        {view === 'home' && (
          <div className="member3-inner-view">
            <InnerTopNav 
              title="Stress & Biometric Telemetry Hub" 
              onBackToLanding={() => setView('landing')} 
              onBackToPortal={onBack} 
            />
            <StressAnalyticsHome
              onViewPlanner={() => setView('planner')}
              onViewReport={() => setView('report')}
            />
          </div>
        )}

        {view === 'planner' && (
          <div className="member3-inner-view">
            <InnerTopNav 
              title="Bio-Adaptive Study Planner" 
              onBackToLanding={() => setView('landing')} 
              onBackToPortal={onBack} 
            />
            <StudyPlanner onBack={() => setView('home')} />
          </div>
        )}

        {view === 'report' && (
          <div className="member3-inner-view">
            <InnerTopNav 
              title="Clinical Progress & Wellness Report" 
              onBackToLanding={() => setView('landing')} 
              onBackToPortal={onBack} 
            />
            <ProgressReport onBack={() => setView('home')} />
          </div>
        )}

        {view === 'dashboard' && (
          <div className="member3-inner-view">
            <InnerTopNav 
              title="Learning Analytics & Study Heatmap" 
              onBackToLanding={() => setView('landing')} 
              onBackToPortal={onBack} 
            />
            <AnalyticsDashboard
              onViewPlanner={() => setView('planner')}
              onViewReport={() => setView('report')}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

function InnerTopNav({ title, onBackToLanding, onBackToPortal }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#fff',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onBackToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
          title="Back to Member 3 Landing Page"
        >
          <ArrowLeft size={14} />
          <span>Landing Overview</span>
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{title}</span>
      </div>

      <button
        onClick={onBackToPortal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#38bdf8',
          padding: '0.4rem 0.85rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600
        }}
        title="Return to Central Student Portal"
      >
        <HomeIcon size={14} />
        <span>Main Portal</span>
      </button>
    </div>
  );
}

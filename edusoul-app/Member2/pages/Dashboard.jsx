import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Target, BookOpen, Map, 
  ChevronRight, Briefcase, BarChart3, Clock, Trash2, 
  ArrowUpRight, Layers, Compass, CheckCircle2, Award
} from 'lucide-react';
import { useCareerData } from '../context/CareerContext';
import './Dashboard.css';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    userName, latestSGI, readiness, recentPathways, 
    selectedPathway, setSelectedPathway, deletePathway, isLoading 
  } = useCareerData();

  const hasData = recentPathways.length > 0;
  const readinessVal = Math.round(readiness || 0);

  const handleDelete = async (e, pathwayId) => {
    e.stopPropagation();
    if (window.confirm('Delete this pathway? This action cannot be undone.')) {
      await deletePathway(pathwayId);
    }
  };

  return (
    <motion.div 
      className="dashboard-v2"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── HERO HEADER CARD ── */}
      <motion.div className="dash-hero-v2" variants={fadeUp}>
        <div className="dash-hero-content">
          <div className="dash-kicker">
            <Compass size={14} />
            <span>STUDENT CAREER PORTAL</span>
          </div>
          <h1 className="dash-hero-title">
            Welcome back, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="dash-hero-desc">
            Track your skill development, evaluate market readiness, and follow personalized learning roadmaps for your target software engineering roles.
          </p>

          <div className="dash-cta-row">
            <button 
              className="dash-primary-btn"
              onClick={() => navigate('/analyzer')}
            >
              <Sparkles size={16} />
              <span>Analyze Skills</span>
              <ArrowUpRight size={16} />
            </button>

            {hasData && (
              <button 
                className="dash-secondary-btn"
                onClick={() => navigate('/roadmap')}
              >
                <Map size={16} />
                <span>View Roadmap</span>
              </button>
            )}
          </div>
        </div>

        <div className="dash-hero-summary">
          <div className="hero-stat-badge">
            <Layers size={18} />
            <div className="hero-stat-text">
              <span className="hero-stat-number">{recentPathways.length}</span>
              <span className="hero-stat-label">Saved Pathways</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS EXECUTIVE GRID ── */}
      <motion.div className="dash-stats-grid" variants={fadeUp}>
        <div className="dash-stat-card">
          <div className="stat-icon-circle blue">
            <Target size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{readiness ? `${readinessVal}%` : '--'}</span>
            <span className="stat-title">Market Readiness</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon-circle purple">
            <BarChart3 size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{latestSGI ? `${latestSGI.toFixed(0)}%` : '--'}</span>
            <span className="stat-title">Skill Gap Index</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card-inner">
            <div className="stat-icon-circle cyan">
              <Briefcase size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-number">{recentPathways.length}</span>
              <span className="stat-title">Target Roles</span>
            </div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon-circle green">
            <Award size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">
              {selectedPathway?.current_skills?.length || 0}
            </span>
            <span className="stat-title">Mastered Skills</span>
          </div>
        </div>
      </motion.div>

      {/* ── ACTIVE PATHWAY HYPER-MODERN PROGRESS VISUALIZER ── */}
      {hasData && selectedPathway && (
        <motion.div className="dash-progress-widget glass-card" variants={fadeUp}>
          <div className="dash-progress-top">
            <div>
              <span className="progress-kicker">ACTIVE ROLE PROGRESSION</span>
              <h3 className="dash-progress-role">{selectedPathway.role}</h3>
            </div>
            <div className="dash-readiness-badge">
              <span>{readinessVal}% Ready</span>
            </div>
          </div>

          {/* Hyper-Modern Liquid Progress Visualizer */}
          <div className="readiness-progress-wrapper">
            <div className="progress-bar-track">
              <div className="track-tick tick-25" />
              <div className="track-tick tick-50" />
              <div className="track-tick tick-75" />

              <motion.div 
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(readinessVal, 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {readinessVal > 0 && <div className="leading-edge-node" />}
              </motion.div>
            </div>
            <div className="progress-labels">
              <span>0% Start</span>
              <span>
                {selectedPathway.missing_requirements?.length > 0
                  ? `${selectedPathway.missing_requirements.length} skills remaining`
                  : 'Target Achieved! 🎉'}
              </span>
              <span>100% Job Ready</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── QUICK ACTIONS GRID ── */}
      <motion.div variants={fadeUp} className="quick-actions-section">
        <h3 className="dash-section-title">Quick Actions</h3>
        <div className="dash-quick-grid">
          <button className="quick-card" onClick={() => navigate('/analyzer')}>
            <div className="q-icon blue">
              <Sparkles size={20} />
            </div>
            <span className="q-title">Analyze Skills</span>
            <span className="q-desc">Run new profile evaluation</span>
          </button>

          <button 
            className="quick-card" 
            onClick={() => navigate('/roadmap')}
            disabled={!hasData}
          >
            <div className="q-icon purple">
              <Map size={20} />
            </div>
            <span className="q-title">View Roadmap</span>
            <span className="q-desc">Step-by-step learning path</span>
          </button>

          <button 
            className="quick-card" 
            onClick={() => navigate('/graph')}
            disabled={!hasData}
          >
            <div className="q-icon cyan">
              <Layers size={20} />
            </div>
            <span className="q-title">Skill Graph</span>
            <span className="q-desc">Explore career pivots</span>
          </button>
        </div>
      </motion.div>

      {/* ── RECENT PATHWAYS LIST ── */}
      <motion.div variants={fadeUp} className="recent-pathways-section">
        <div className="dash-section-header">
          <h3 className="dash-section-title">Saved Career Pathways</h3>
          {hasData && (
            <button className="dash-link-btn" onClick={() => navigate('/roadmap')}>
              View All Pathways <ChevronRight size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="dash-loading-box">
            <div className="dash-spinner" />
            <p>Loading your career pathways...</p>
          </div>
        ) : hasData ? (
          <div className="pathway-cards-list">
            {recentPathways.slice(0, 5).map((pathway, index) => {
              const dateStr = pathway.date 
                ? new Date(pathway.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Today';
              const isActive = selectedPathway?.id === pathway.id;
              const pReadiness = Math.round(pathway.market_readiness || 0);

              return (
                <motion.div
                  key={pathway.id || index}
                  className={`dash-pathway-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedPathway(pathway)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="item-icon-bg">
                    <TrendingUp size={18} />
                  </div>

                  <div className="item-info">
                    <span className="item-role-title">{pathway.role}</span>
                    <span className="item-meta">
                      <Clock size={12} /> {dateStr} • {pathway.current_skills?.length || 0} mastered • {pathway.missing_requirements?.length || 0} gaps
                    </span>
                  </div>

                  <div className="item-score-pill">
                    <span className="score-num">{pReadiness}%</span>
                    <span className="score-tag">Ready</span>
                  </div>

                  <button 
                    className="item-delete-btn"
                    onClick={(e) => handleDelete(e, pathway.id)}
                    aria-label="Delete pathway"
                    title="Delete this pathway"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="dash-empty-box glass-card">
            <div className="empty-icon-ring">
              <Target size={36} />
            </div>
            <h4>No Career Pathways Saved Yet</h4>
            <p>Analyze your skills in the Career Analyzer to generate and save your target pathways.</p>
            <button className="dash-primary-btn" onClick={() => navigate('/analyzer')}>
              <Sparkles size={16} />
              <span>Start Skill Analysis</span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

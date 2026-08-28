import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Loader2, ChevronDown,
  Bookmark, GraduationCap, AlertTriangle, CheckCircle2,
  Target, Brain, Shield, Zap, Trophy, Medal, Award,
  TrendingUp, BarChart3, Gauge
} from 'lucide-react';
import axios from 'axios';
import API from '../../config/api';
import SkillInput from '../../components/SkillInput';
import DegreeInput from '../../components/DegreeInput';
import { useCareerData } from '../../context/CareerContext';
import './Analyzer.css';

const CARD_THEMES = [
  { label: 'BEST FIT', icon: Trophy, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { label: '2ND MATCH', icon: Medal, gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
  { label: '3RD MATCH', icon: Award, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
];

const easeExpo = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 55
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const detailInnerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.45
    }
  }
};

const detailItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } 
  }
};

const roadmapContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.5
    }
  }
};

const roadmapNodeVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function Analyzer() {
  const { saveNewPathway } = useCareerData();
  const [currentSkills, setCurrentSkills] = useState([]);
  const [degreeInput, setDegreeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [top3Results, setTop3Results] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savedIndexes, setSavedIndexes] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [engineOnline, setEngineOnline] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(API.HEALTH);
        if (res.ok) setEngineOnline(true);
        else setEngineOnline(false);
      } catch (err) {
        setEngineOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = useCallback(() => {
    setCurrentSkills([]);
    setDegreeInput('');
    setTop3Results(null);
    setSelectedIndex(null);
    setSavedIndexes(new Set());
    setRefreshKey(prev => prev + 1);
  }, []);

  const generatePathways = async () => {
    if (currentSkills.length === 0) return;
    setIsSearching(true);
    setTop3Results(null);
    setSelectedIndex(null);
    setSavedIndexes(new Set());

    try {
      const apiCall = axios.post(API.GENERATE_TOP3, {
        skills: currentSkills,
        current_degree: degreeInput || "None",
      });
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 1800));
      const [response] = await Promise.all([apiCall, minimumDelay]);
      setTop3Results(response.data.data);
    } catch (error) {
      console.error("Analysis Failed:", error);
      showNotification('Connection failed — is the Python server running?', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSavePathway = async (result, index) => {
    const success = await saveNewPathway({
      role: result.target_role,
      matchScore: result.sgi_score,
      confidence_score: result.confidence_score,
      market_readiness: result.market_readiness,
      missing_requirements: result.missing_requirements,
      recommended_degree: result.recommended_degree,
      initial_skills_count: currentSkills.length,
      current_skills: currentSkills,
      sgi_score: result.sgi_score,
    });
    if (success) {
      setSavedIndexes(prev => new Set([...prev, index]));
      showNotification(`"${result.target_role}" saved to your profile!`);
    }
  };

  const toggleCard = (index) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  const getReadinessColor = (value) => {
    if (value >= 70) return 'var(--success)';
    if (value >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="analyzer">
      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`toast ${notification.type}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="analyzer-header">
        <div className="analyzer-step-badge">
          <Brain size={14} />
          <span>AI CAREER MATCH</span>
        </div>
        <h2 className="analyzer-title">
          Design Your <span className="gradient-text">Career Identity</span>
        </h2>
        <p className="analyzer-desc">
          Map your current skills against industry demands using our predictive AI
          engine to discover your optimal career trajectories.
        </p>
      </div>

      {/* Engine Info */}
      <div className="feature-highlight">
        <div className="feature-icon-bg">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="feature-title">Precision Matching Engine</h4>
          <p className="feature-desc">
            Powered by advanced predictive analytics and proprietary machine learning models to identify your optimal career trajectory and personalized skill gaps.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="input-form">
        <div className="form-field">
          <div className="field-header">
            <label className="field-label">TECHNICAL SKILLS</label>
            <span className="field-badge required">REQUIRED</span>
          </div>
          <SkillInput onSkillsChange={setCurrentSkills} resetKey={refreshKey} />
        </div>

        <div className="form-field">
          <div className="field-header">
            <label className="field-label">DEGREE PROGRAM</label>
            <span className="field-badge optional">OPTIONAL</span>
          </div>
          <DegreeInput onDegreeChange={setDegreeInput} resetKey={refreshKey} />
        </div>

        <div className="form-actions">
          <button
            className="generate-btn"
            onClick={generatePathways}
            disabled={currentSkills.length === 0 || isSearching}
            id="generate-pathway-btn"
          >
            {isSearching ? (
              <>
                <Loader2 size={18} className="btn-spinner" />
                <span>Analyzing Profile...</span>
              </>
            ) : (
              <>
                <span>{top3Results ? 'Recalculate' : 'Initialize My Journey'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          {top3Results && (
            <button className="reset-btn" onClick={resetForm}>Reset</button>
          )}
        </div>

        <div className={`engine-bar ${engineOnline === false ? 'offline' : ''}`}>
          <div className={`pulse-dot ${engineOnline === false ? 'offline' : ''}`} />
          <span>{engineOnline === false ? 'AI Engine Offline' : engineOnline === true ? 'AI Engine Ready for Computation' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Loading & Results Stagger */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="loading"
            className="loading-analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="loading-orb">
              <Loader2 size={28} className="loading-spin" />
            </div>
            <h3>Mapping Career Trajectories...</h3>
            <p>Running deep multi-layered profile analysis</p>
            <div className="loading-steps">
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
                <CheckCircle2 size={14} /> Normalizing Skill Inputs
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <CheckCircle2 size={14} /> Running Predictive Models
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                <CheckCircle2 size={14} /> Validating Career Graphs
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <Loader2 size={14} className="loading-spin" /> Calculating SGI Score
              </motion.div>
            </div>
            <div className="loading-bar-track">
              <motion.div
                className="loading-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        ) : top3Results ? (
          <motion.div
            key="results"
            className="results-section"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="results-header">
              <div>
                <h3 className="results-title">Your Career Matches</h3>
                <p className="results-desc">Expand a career path to see your detailed analysis</p>
              </div>
              <div className="results-meta">
                <Shield size={13} />
                <span>{currentSkills.length} skills analyzed</span>
              </div>
            </div>

            {top3Results.map((result, index) => {
              const theme = CARD_THEMES[index];
              const isOpen = selectedIndex === index;
              const isSaved = savedIndexes.has(index);
              const ThemeIcon = theme.icon;
              const readinessColor = getReadinessColor(result.market_readiness);

              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className={`result-block ${isOpen ? 'expanded' : ''}`}
                >
                  {/* Clickable Card Header */}
                  <button
                    className={`career-card ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleCard(index)}
                    aria-expanded={isOpen}
                  >
                    {/* Top Row: Badge + Chevron */}
                    <div className="career-card-top">
                      <div className="career-rank" style={{ background: theme.gradient }}>
                        <ThemeIcon size={14} />
                        <span>{theme.label}</span>
                      </div>
                      <motion.div
                        className="career-chevron"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: easeExpo }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </div>

                    {/* Role Name */}
                    <h4 className="career-role">{result.target_role}</h4>

                    {/* Stats Cards */}
                    <div className="career-metrics">
                      <div className="metric-item">
                        <div className="metric-icon readiness">
                          <Gauge size={14} />
                        </div>
                        <div className="metric-data">
                          <span className="metric-value" style={{ color: readinessColor }}>{result.market_readiness.toFixed(0)}%</span>
                          <span className="metric-label">Readiness</span>
                        </div>
                      </div>
                      <div className="metric-sep" />
                      <div className="metric-item">
                        <div className="metric-icon sgi">
                          <BarChart3 size={14} />
                        </div>
                        <div className="metric-data">
                          <span className="metric-value">{result.sgi_score.toFixed(0)}%</span>
                          <span className="metric-label">Skill Gap</span>
                        </div>
                      </div>
                      <div className="metric-sep" />
                      <div className="metric-item">
                        <div className="metric-icon confidence">
                          <TrendingUp size={14} />
                        </div>
                        <div className="metric-data">
                          <span className="metric-value accent">{result.confidence_score.toFixed(0)}%</span>
                          <span className="metric-label">Confidence</span>
                        </div>
                      </div>
                    </div>

                    {/* Readiness Bar */}
                    <div className="readiness-bar">
                      <div className="readiness-bar-header">
                        <span>Market Readiness</span>
                        <span>{result.market_readiness.toFixed(0)}%</span>
                      </div>
                      <div className="readiness-bar-track">
                        <motion.div
                          className="readiness-bar-fill"
                          style={{ background: readinessColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(result.market_readiness, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: easeExpo }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expandable Detail Panel */}
                  <motion.div
                    className="detail-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isOpen ? 'auto' : 0, 
                      opacity: isOpen ? 1 : 0 
                    }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div 
                      className="detail-inner"
                      variants={detailInnerVariants}
                      initial="hidden"
                      animate={isOpen ? "visible" : "hidden"}
                    >
                      {/* Action Buttons */}
                      <motion.div variants={detailItemVariants} className="detail-actions">
                        <button
                          className={`save-btn ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => { e.stopPropagation(); if (!isSaved) handleSavePathway(result, index); }}
                          disabled={isSaved}
                        >
                          {isSaved ? <><CheckCircle2 size={16} /> Pathway Saved</> : <><Bookmark size={16} /> Save to Profile</>}
                        </button>
                      </motion.div>

                      {/* Stats Banner */}
                      <motion.div variants={detailItemVariants} className="detail-banner" style={{ background: theme.gradient }}>
                        <span className="detail-banner-label">DETAILED ANALYSIS</span>
                        <h4 className="detail-banner-role">{result.target_role}</h4>
                        <div className="detail-banner-stats">
                          <div className="dbs">
                            <span className="dbs-value">{result.market_readiness.toFixed(0)}%</span>
                            <span className="dbs-label">READINESS</span>
                          </div>
                          <div className="dbs-divider" />
                          <div className="dbs">
                            <span className="dbs-value">{result.sgi_score.toFixed(0)}%</span>
                            <span className="dbs-label">SGI SCORE</span>
                          </div>
                          <div className="dbs-divider" />
                          <div className="dbs">
                            <span className="dbs-value">{result.confidence_score.toFixed(0)}%</span>
                            <span className="dbs-label">CONFIDENCE</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Degree */}
                      <motion.div variants={detailItemVariants} className="detail-degree">
                        <GraduationCap size={20} className="detail-degree-icon" />
                        <div>
                          <span className="detail-degree-label">Recommended Degree</span>
                          <span className="detail-degree-value">{result.recommended_degree}</span>
                        </div>
                      </motion.div>

                      {/* Roadmap */}
                      {result.missing_requirements.length > 0 ? (
                        <motion.div variants={detailItemVariants} className="roadmap-section">
                          <h5 className="roadmap-title">
                            <Target size={15} />
                            <span>Personalized Roadmap</span>
                            <span className="roadmap-count">{result.missing_requirements.length} phases</span>
                          </h5>

                          <motion.div 
                            className="roadmap-timeline"
                            variants={roadmapContainerVariants}
                            initial="hidden"
                            animate={isOpen ? "visible" : "hidden"}
                          >
                            {result.missing_requirements.map((req, ri) => {
                              const isDegree = req.type === 'Degree';
                              const isCritical = ri === 0 && !isDegree;
                              const impactValue = Math.round(req.weight * 1.5);

                              return (
                                <motion.div
                                  key={ri}
                                  variants={roadmapNodeVariants}
                                  className="roadmap-node"
                                >
                                  <div className="tl-track">
                                    <div className={`tl-dot ${isDegree ? 'degree' : isCritical ? 'critical' : ''}`}>
                                      {isDegree ? <GraduationCap size={10} color="white" /> : <AlertTriangle size={10} color="white" />}
                                    </div>
                                    {ri < result.missing_requirements.length - 1 && <div className="tl-line" />}
                                  </div>
                                  <div className={`roadmap-card ${isCritical ? 'critical' : ''}`}>
                                    <div className="roadmap-card-header">
                                      <span className="roadmap-req-name">{req.req}</span>
                                      <span className={`roadmap-badge ${isDegree ? 'degree' : isCritical ? 'critical' : ''}`}>
                                        {isDegree ? 'DEGREE' : isCritical ? 'CRITICAL GAP' : 'TARGET SKILL'}
                                      </span>
                                    </div>
                                    <p className="roadmap-card-desc">
                                      Market Weight: {Number(req.weight).toFixed(1)} / 10.0 — {isDegree
                                        ? 'Core academic foundation for this role'
                                        : 'High-impact skill to close the gap'}
                                    </p>
                                    {!isDegree && (
                                      <div className="impact-forecast">
                                        <Zap size={12} />
                                        <span>Learning this reduces SGI by <strong>-{impactValue}%</strong></span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div variants={detailItemVariants} className="perfect-match">
                          <CheckCircle2 size={40} color="var(--success)" />
                          <h4>Perfect Match!</h4>
                          <p>Your profile is fully optimized for this role.</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

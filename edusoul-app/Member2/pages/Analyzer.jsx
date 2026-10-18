import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Loader2, ChevronDown,
  Bookmark, GraduationCap, AlertTriangle, CheckCircle2,
  Target, Brain, Shield, Zap, Trophy, Medal, Award,
  TrendingUp, BarChart3, Gauge
} from 'lucide-react';
import axios from 'axios';
import API from '../config/api';
import SkillInput from '../components/SkillInput';
import DegreeInput from '../components/DegreeInput';
import { useCareerData } from '../context/CareerContext';
import { useCareerTranslation } from '../hooks/useCareerTranslation';
import './Analyzer.css';

const CARD_THEMES = [
  { label: 'BEST FIT', icon: Trophy, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  { label: '2ND MATCH', icon: Medal, gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
  { label: '3RD MATCH', icon: Award, gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' },
];

const easeExpo = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.06
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 35
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const detailInnerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35
    }
  }
};

const detailItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
  }
};

const roadmapContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4
    }
  }
};

const roadmapNodeVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function Analyzer() {
  const { saveNewPathway } = useCareerData();
  const { tr } = useCareerTranslation();
  const [currentSkills, setCurrentSkills] = useState([]);
  const [degreeInput, setDegreeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [top3Results, setTop3Results] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savedIndexes, setSavedIndexes] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [engineStatus, setEngineStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(API.HEALTH);
        if (!res.ok) {
          setEngineStatus('offline');
          return;
        }
        const data = await res.json();
        setEngineStatus(data.status || 'online');
      } catch (err) {
        setEngineStatus('offline');
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
      if (error.response?.status === 404) {
        showNotification('No matching career pathways found. Try adding complementary technical skills.', 'warning');
      } else if (error.response?.status >= 500) {
        showNotification('Our AI career intelligence service is momentarily unavailable. Please try again shortly.', 'error');
      } else if (error.code === 'ECONNABORTED' || !error.response) {
        showNotification('Unable to reach the recommendation service. Please verify your connection.', 'error');
      } else {
        showNotification(error.response?.data?.detail || 'An unexpected error occurred while analyzing your pathway.', 'error');
      }
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
    if (value >= 70) return '#059669'; // Emerald
    if (value >= 40) return '#d97706'; // Warm Amber
    return '#e11d48'; // Elegant Rose
  };

  return (
    <div className="analyzer">
      {/* Toast Notification */}
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
          <Brain size={13} aria-hidden="true" />
          <span>{tr('AI CAREER SCANNER')}</span>
        </div>
        <h2 className="analyzer-title">
          {tr('Degree Background & Skill Profiling')}
        </h2>
        <p className="analyzer-desc">
          {tr('Configure your academic background and technical skills to evaluate job readiness across 100+ tech roles.')}
        </p>
      </div>

      {/* Engine Capability Bar */}
      <div className="feature-highlight">
        <div className="feature-icon-bg">
          <Sparkles size={17} aria-hidden="true" />
        </div>
        <div>
          <h4 className="feature-title">{tr('Core Engine Capabilities')}</h4>
          <p className="feature-desc">
            {tr('Dual-Engine AI career recommendation and skill-gap quantification system designed specifically for Sri Lankan undergraduates and tech job seekers.')}
          </p>
        </div>
      </div>

      {/* Frosted Glass Input Card */}
      <div className="input-form">
        <div className="form-field">
          <div className="field-header">
            <label className="field-label">{tr('Add Your Current Skills')}</label>
            <span className="field-badge required">{tr('Priority')}</span>
          </div>
          <SkillInput 
            onSkillsChange={setCurrentSkills} 
            resetKey={refreshKey}
            externalSkills={currentSkills}
          />
        </div>

        <div className="form-field">
          <div className="field-header">
            <label className="field-label">{tr('Select Your Degree Program')}</label>
            <span className="field-badge optional">{tr('(Optional)')}</span>
          </div>
          <DegreeInput onDegreeChange={setDegreeInput} resetKey={refreshKey} />
        </div>

        <div className="form-actions">
          <button
            className="generate-btn glass-btn"
            onClick={generatePathways}
            disabled={currentSkills.length === 0 || isSearching}
            id="generate-pathway-btn"
          >
            {isSearching ? (
              <>
                <Loader2 size={17} className="btn-spinner" />
                <span>{tr('Analyzing Profile & Knowledge Graph...')}</span>
              </>
            ) : (
              <>
                <span>{tr('Run AI Career Scan')}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
          {top3Results && (
            <button className="reset-btn glass-btn-secondary" onClick={resetForm}>{tr('Reset View')}</button>
          )}
        </div>

        {/* Engine Status */}
        <div className={`engine-bar ${engineStatus === 'offline' ? 'offline' : engineStatus === 'degraded' ? 'degraded' : ''}`}>
          <div className={`pulse-dot ${engineStatus === 'offline' ? 'offline' : engineStatus === 'degraded' ? 'degraded' : ''}`} />
          <span>
            {engineStatus === 'offline'
              ? tr('AI Engine Offline')
              : engineStatus === 'degraded'
              ? tr('Database Reconnecting')
              : engineStatus === 'online'
              ? tr('AI Engine Online')
              : tr('Connecting...')}
          </span>
        </div>
      </div>

      {/* ── Empty State: Frosted Glass Status Card (Eliminates the empty void without clutter) ── */}
      {!top3Results && !isSearching && (
        <motion.div 
          className="analyzer-empty-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeExpo }}
        >
          <div className="empty-radar-wrap">
            <div className="empty-radar-ring r1" />
            <div className="empty-radar-ring r2" />
            <div className="empty-radar-icon">
              <Sparkles size={22} className="anim-sparkle" />
            </div>
          </div>
          <h3>{tr('Ready for Career Intelligence Scan')}</h3>
          <p>{tr('Enter your technical skills above and run the scanner to evaluate your profile across 100+ industry job benchmarks, calculate your SGI gap index, and unlock personalized milestone roadmaps.')}</p>
          <div className="empty-highlights-row">
            <span className="empty-pill">
              <Gauge size={13} className="anim-gauge" /> {tr('Market Readiness')}
            </span>
            <span className="empty-pill">
              <BarChart3 size={13} className="anim-barchart" /> {tr('SGI Gap Index')}
            </span>
            <span className="empty-pill">
              <TrendingUp size={13} className="anim-trend" /> {tr('Market Demand')}
            </span>
          </div>
        </motion.div>
      )}

      {/* Loading & Results */}
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
                <CheckCircle2 size={14} /> Normalizing Technical Skills
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <CheckCircle2 size={14} /> Running Predictive Models
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                <CheckCircle2 size={14} /> Validating Career Knowledge Graph
              </motion.div>
              <motion.div className="loading-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <Loader2 size={14} className="loading-spin" /> Calculating SGI Gap & Market Demand
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
                <h3 className="results-title">{tr('Top Recommended Career Matches')}</h3>
                <p className="results-desc">{tr('Select a Node to inspect attributes')}</p>
              </div>
              <div className="results-meta">
                <Shield size={13} />
                <span>{currentSkills.length} {tr('skills selected')}</span>
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
                  className={`result-block tier-${index} ${isOpen ? 'expanded' : ''}`}
                >
                  {/* Clickable Card Header */}
                  <button
                    className={`career-card tier-${index} ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleCard(index)}
                    aria-expanded={isOpen}
                  >
                    {/* Top Row: Rank Badge + Chevron */}
                    <div className="career-card-top">
                      <div className="career-rank" style={{ background: theme.gradient }}>
                        <ThemeIcon size={13} />
                        <span>{tr(theme.label)}</span>
                      </div>
                      <motion.div
                        className="career-chevron"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: easeExpo }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </div>

                    {/* Role Name */}
                    <h4 className="career-role">{result.target_role}</h4>

                    {/* ── Modern Telemetry Stats with Animated Icons & Market Demand ── */}
                    <div className="career-metrics">
                      {/* Metric 1: Market Readiness (Animated Gauge) */}
                      <div className="metric-item">
                        <div className="metric-icon readiness">
                          <Gauge size={16} className="anim-gauge" />
                        </div>
                        <div className="metric-data">
                          <span className="metric-value" style={{ color: readinessColor }}>
                            {result.market_readiness.toFixed(0)}%
                          </span>
                          <span className="metric-label">{tr('Market Readiness')}</span>
                        </div>
                      </div>

                      <div className="metric-sep" />

                      {/* Metric 2: SGI Gap Index (Animated Bar Chart) */}
                      <div className="metric-item">
                        <div className="metric-icon sgi">
                          <BarChart3 size={16} className="anim-barchart" />
                        </div>
                        <div className="metric-data">
                          <span className="metric-value">{result.sgi_score.toFixed(0)}%</span>
                          <span className="metric-label">{tr('SGI Gap Index')}</span>
                        </div>
                      </div>

                      <div className="metric-sep" />

                      {/* Metric 3: Real Market Demand (Calculated dynamically from Sri Lankan hiring dataset & Neo4j graph) */}
                      {(() => {
                        // 1. Extract dynamic market demand object (with safe fallback to 'High' if unpopulated)
                        const demandData = (typeof result.market_demand === 'object' && result.market_demand !== null)
                          ? result.market_demand
                          : { level: result.market_demand || 'High', score: null, active_postings: null };
                        
                        // 2. Resolve categorical tier (e.g., 'Very High', 'High', 'Moderate', 'Emerging')
                        const demandLevel = demandData.level || 'High';
                        
                        return (
                          <div 
                            className="metric-item"
                            title={demandData.active_postings ? `${demandData.active_postings} active vacancies indexed in Sri Lanka (${demandData.growth || ''})` : 'Calculated from live industry hiring demand'}
                          >
                            <div className="metric-icon demand">
                              <TrendingUp size={16} className="anim-trend" />
                            </div>
                            <div className="metric-data">
                              <span className="metric-value accent">{tr(demandLevel)}</span>
                              <span className="metric-label">{tr('Market Demand')}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Readiness Bar */}
                    <div className="readiness-bar">
                      <div className="readiness-bar-header">
                        <span>{tr('Market Readiness')}</span>
                        <span style={{ color: readinessColor, fontWeight: 700 }}>
                          {result.market_readiness.toFixed(0)}%
                        </span>
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
                    className={`detail-panel tier-${index}`}
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
                      {/* Academic Pathway Alignment */}
                      <motion.div variants={detailItemVariants} className="detail-degree">
                        <div className="detail-degree-icon-wrap">
                          <GraduationCap size={22} className="detail-degree-icon" />
                        </div>
                        <div className="detail-degree-info">
                          <span className="detail-degree-label">{tr('Recommended Academic Pathway')}</span>
                          <span className="detail-degree-value">{result.recommended_degree}</span>
                        </div>
                      </motion.div>

                      {/* Roadmap */}
                      {result.missing_requirements.length > 0 ? (
                        <motion.div variants={detailItemVariants} className="roadmap-section">
                          <h5 className="roadmap-title">
                            <Target size={15} />
                            <span>{tr('CAREER MILESTONE ROADMAP')}</span>
                            <span className="roadmap-count">{result.missing_requirements.length} {tr('Missing Skills')}</span>
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
                                        {isDegree ? tr('Degree Affinity') : isCritical ? tr('High Priority Skill') : tr('Missing Skill')}
                                      </span>
                                    </div>
                                    <p className="roadmap-card-desc">
                                      {tr('Priority')}: {Number(req.weight).toFixed(1)} / 10.0
                                    </p>
                                    {!isDegree && (
                                      <div className="impact-forecast">
                                        <Zap size={12} />
                                        <span>{tr('Impact')}: <strong>+{impactValue}% {tr('MARKET READINESS')}</strong></span>
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
                          <CheckCircle2 size={36} color="#10b981" />
                          <h4>{tr('All core skills mastered! Exceptional profile alignment.')}</h4>
                        </motion.div>
                      )}

                      {/* Glass Action Button */}
                      <motion.div variants={detailItemVariants} className="detail-actions">
                        <button
                          className={`save-btn glass-btn ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => { e.stopPropagation(); if (!isSaved) handleSavePathway(result, index); }}
                          disabled={isSaved}
                        >
                          {isSaved ? <><CheckCircle2 size={16} /> {tr('Pathway Saved to Dashboard')}</> : <><Bookmark size={16} /> {tr('Save to My Pathways')}</>}
                        </button>
                      </motion.div>
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

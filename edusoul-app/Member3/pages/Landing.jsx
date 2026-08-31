import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Heart, Zap, Brain, Clock, Calendar, Sparkles, RefreshCw,
  AlertTriangle, CheckCircle2, TrendingUp, Watch, Flame,
  Smile, ShieldCheck, Play, Sun, Moon, Home as HomeIcon, Target,
  ArrowRight, ArrowUpRight, BarChart3, FileText, Cpu, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { checkModelBackendHealth } from '../services/healthService';
import heroAvatar from '../../src/assets/stress_hero_3d.png';
import './Landing.css';

export default function Member3Landing({ 
  onLaunchHub, 
  onViewPlanner, 
  onViewReport, 
  onViewDashboard, 
  onBackToPortal 
}) {
  const { theme, toggleTheme } = useTheme();
  const [modelOnline, setModelOnline] = useState(false);
  const [checkingModel, setCheckingModel] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      try {
        const res = await checkModelBackendHealth();
        if (isMounted) {
          setModelOnline(!!res?.online);
          setCheckingModel(false);
        }
      } catch {
        if (isMounted) {
          setModelOnline(false);
          setCheckingModel(false);
        }
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleBackToHub = () => {
    if (onBackToPortal) {
      onBackToPortal();
    }
  };

  return (
    <div className="stress-landing-root">
      {/* Dynamic Ambient Glows */}
      <div className="stress-glow glow-cyan-top" />
      <div className="stress-glow glow-emerald-right" />
      <div className="stress-glow glow-violet-bottom" />

      {/* Top Navigation Bar */}
      <header className="stress-nav">
        <div className="stress-nav-container">
          <div className="stress-nav-brand" onClick={onLaunchHub}>
            <div className="stress-brand-badge">
              <Activity size={22} className="stress-brand-icon" />
            </div>
            <div className="stress-brand-text">
              <span className="stress-brand-title">Stress & Bio-Analytics AI</span>
              <span className="stress-brand-subtitle">STUDYFYX COGNITIVE WELL-BEING</span>
            </div>
          </div>

          <nav className="stress-nav-links">
            <a href="#hero" className="stress-nav-link active">Overview</a>
            <a href="#features" className="stress-nav-link">Features</a>
            <a href="#model-status" className="stress-nav-link">AI Model</a>
            <a href="#workflow" className="stress-nav-link">How It Works</a>
          </nav>

          <div className="stress-nav-actions">
            {/* Model Live Indicator */}
            <div className={`model-live-pill ${modelOnline ? 'online' : 'offline'}`} title="Stress Analyzer API Status (Port 8001)">
              <span className="live-dot" />
              <span className="live-text">{modelOnline ? 'ML Engine Live' : 'Offline / Local AI'}</span>
            </div>

            <button
              className="stress-hub-btn"
              onClick={handleBackToHub}
              title="Return to Central Portal"
            >
              <HomeIcon size={15} />
              <span>Portal</span>
            </button>

            <button
              className="stress-theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className="stress-cta-primary-btn" onClick={onLaunchHub}>
              <span>Launch Stress Hub</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="stress-hero-section">
        <div className="stress-hero-container">
          {/* Left Column: Headline & Action */}
          <motion.div
            className="stress-hero-content"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="stress-hero-badge">
              <Sparkles size={14} className="sparkle-icon" />
              <span>AI-POWERED COGNITIVE HEALTH & STRESS TELEMETRY</span>
            </div>

            <h1 className="stress-hero-title">
              Balance.<br />
              Focus.<br />
              <span className="stress-gradient-text">Thrive.</span>
            </h1>

            <p className="stress-hero-description">
              Intelligent student cognitive health analytics powered by Random Forest AI. 
              Sync smartwatch telemetry, predict stress and mood in real time, and dynamically 
              adapt your study schedules to prevent burnout and maximize retention.
            </p>

            <div className="stress-hero-cta-group">
              <button className="stress-hero-btn-primary" onClick={onLaunchHub}>
                <span>Enter Stress Hub</span>
                <ArrowRight size={18} />
              </button>

              <button className="stress-hero-btn-secondary" onClick={onViewPlanner}>
                <div className="stress-play-bubble">
                  <Play size={14} fill="currentColor" />
                </div>
                <span>Bio-Study Planner</span>
              </button>
            </div>

            {/* Commercial & Scientific Stats Row */}
            <div className="stress-hero-stats">
              <div className="stress-stat-item">
                <div className="stress-stat-value">94.50%</div>
                <div className="stress-stat-label">Model Accuracy (RF)</div>
              </div>
              <div className="stress-stat-divider" />
              <div className="stress-stat-item">
                <div className="stress-stat-value">2,000+</div>
                <div className="stress-stat-label">Biometric Samples</div>
              </div>
              <div className="stress-stat-divider" />
              <div className="stress-stat-item">
                <div className="stress-stat-value">Real-Time</div>
                <div className="stress-stat-label">BLE Watch Telemetry</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Visual & Floating Feature Cards */}
          <motion.div
            className="stress-hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 3D Render Image */}
            <div className="stress-avatar-wrapper">
              <img
                src={heroAvatar}
                alt="Student Cognitive Well-being AI Character"
                className="stress-avatar-3d-image"
              />
            </div>

            {/* Floating Card 1: Top Right */}
            <motion.div
              className="stress-floating-card card-top-right"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              onClick={onLaunchHub}
            >
              <div className="card-icon-box cyan">
                <Heart size={20} />
              </div>
              <div className="card-info">
                <h4>Biometric Pulse & SpO2</h4>
                <p>72 BPM · 98.4% Blood Oxygen</p>
              </div>
            </motion.div>

            {/* Floating Card 2: Middle Left */}
            <motion.div
              className="stress-floating-card card-mid-left"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              onClick={onLaunchHub}
            >
              <div className="card-icon-box emerald">
                <Brain size={20} />
              </div>
              <div className="card-info">
                <h4>Random Forest AI</h4>
                <p>94.5% Accuracy Mood Predictor</p>
              </div>
            </motion.div>

            {/* Floating Card 3: Bottom Left */}
            <motion.div
              className="stress-floating-card card-bottom-left"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              onClick={onViewPlanner}
            >
              <div className="card-icon-box violet">
                <Clock size={20} />
              </div>
              <div className="card-info">
                <h4>Bio-Adaptive Pomodoro</h4>
                <p>50m Deep Focus · 10m Recovery</p>
              </div>
            </motion.div>

            {/* Floating Card 4: Bottom Right */}
            <motion.div
              className="stress-floating-card card-bottom-right"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              onClick={onViewReport}
            >
              <div className="card-icon-box amber">
                <ShieldCheck size={20} />
              </div>
              <div className="card-info">
                <h4>Burnout Shield</h4>
                <p>Zero Academic Fatigue Detected</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="features" className="stress-features-section">
        <div className="stress-section-header">
          <div className="stress-section-badge">PLATFORM CAPABILITIES</div>
          <h2 className="stress-section-title">Everything You Need for Peak Cognitive Health</h2>
          <p className="stress-section-subtitle">
            Harness real physiological signals and cutting-edge machine learning to eliminate study fatigue,
            enhance brain retention, and safeguard your mental well-being.
          </p>
        </div>

        <div className="stress-features-grid">
          {/* Feature 1 */}
          <motion.div
            className="stress-feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onLaunchHub}
          >
            <div className="stress-feature-icon-wrapper cyan">
              <Activity size={26} />
            </div>
            <h3 className="stress-feature-card-title">Real-Time Biometric Sync</h3>
            <p className="stress-feature-card-desc">
              Streams continuous smartwatch telemetry including heart rate, SpO2 blood oxygen, sleep duration, 
              skin temperature, and active calories directly into Firestore.
            </p>
            <div className="stress-feature-card-footer">
              <span>Open Vitals Hub</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="stress-feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onLaunchHub}
          >
            <div className="stress-feature-icon-wrapper emerald">
              <Brain size={26} />
            </div>
            <h3 className="stress-feature-card-title">Random Forest Mood Classifier</h3>
            <p className="stress-feature-card-desc">
              Trained on 2,000+ clinical records with 94.50% test accuracy. Evaluates multi-parameter physiology 
              to accurately classify Happy, Neutral, Stressed, and Fatigue states.
            </p>
            <div className="stress-feature-card-footer">
              <span>Test AI Classifier</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="stress-feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onViewPlanner}
          >
            <div className="stress-feature-icon-wrapper violet">
              <Clock size={26} />
            </div>
            <h3 className="stress-feature-card-title">Bio-Adaptive Study Planner</h3>
            <p className="stress-feature-card-desc">
              Dynamically scales your study intervals—from 50-minute peak focus blocks down to 15-minute 
              stress recovery sessions—based on real-time nervous system readings.
            </p>
            <div className="stress-feature-card-footer">
              <span>Open Study Planner</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="stress-feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onViewReport}
          >
            <div className="stress-feature-icon-wrapper amber">
              <BarChart3 size={26} />
            </div>
            <h3 className="stress-feature-card-title">Longitudinal Progress Reports</h3>
            <p className="stress-feature-card-desc">
              Deep clinical analytics with multi-day biometric trends, cognitive readiness scores, 
              stress distributions, and exportable academic wellness audits.
            </p>
            <div className="stress-feature-card-footer">
              <span>View Full Reports</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Model Architecture & Live Status Section */}
      <section id="model-status" className="stress-model-section">
        <div className="stress-model-card">
          <div className="stress-model-glow" />
          <div className="stress-model-content">
            <div className="model-header-row">
              <div className="model-badge">
                <Cpu size={16} />
                <span>RANDOM FOREST CLASSIFIER ARCHITECTURE</span>
              </div>
              <div className={`model-status-chip ${modelOnline ? 'active' : 'idle'}`}>
                <span className="dot" />
                <span>{modelOnline ? 'FastAPI Server Live (Port 8001)' : 'Local Decision Fallback Active'}</span>
              </div>
            </div>

            <h3 className="model-title">Precision ML Trained on Student Biometric Data</h3>
            <p className="model-desc">
              The backend engine processes 8 key physiological signals to predict student emotional states and calculate
              a real-time Cognitive Readiness Index (0–100%).
            </p>

            <div className="model-stats-grid">
              <div className="model-mini-box">
                <span className="label">Accuracy</span>
                <span className="val highlight-green">94.50%</span>
              </div>
              <div className="model-mini-box">
                <span className="label">Estimators</span>
                <span className="val">200 Trees</span>
              </div>
              <div className="model-mini-box">
                <span className="label">Max Depth</span>
                <span className="val">6 Layers</span>
              </div>
              <div className="model-mini-box">
                <span className="label">Target Classes</span>
                <span className="val">5 States</span>
              </div>
              <div className="model-mini-box">
                <span className="label">Dataset Size</span>
                <span className="val">2,000 Rows</span>
              </div>
            </div>

            <div className="model-actions-row">
              <button className="model-action-btn primary" onClick={onLaunchHub}>
                <span>Test Live Inference</span>
                <ArrowRight size={16} />
              </button>
              <button className="model-action-btn secondary" onClick={onViewDashboard}>
                <span>Learning Analytics</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Flow) */}
      <section id="workflow" className="stress-workflow-section">
        <div className="stress-section-header">
          <div className="stress-section-badge">SIMPLE 3-STEP WORKFLOW</div>
          <h2 className="stress-section-title">How Stress & Bio-Analytics AI Works</h2>
        </div>

        <div className="stress-workflow-grid">
          <div className="stress-workflow-step">
            <div className="step-number">01</div>
            <h4 className="step-title">Sync Your Vitals</h4>
            <p className="step-desc">
              Connect your smartwatch via Bluetooth Low Energy (BLE) or simulate live telemetry readings 
              with our built-in watch data emitter.
            </p>
          </div>

          <div className="stress-workflow-connector" />

          <div className="stress-workflow-step">
            <div className="step-number">02</div>
            <h4 className="step-title">Instant AI Stress Analysis</h4>
            <p className="step-desc">
              The 94.5% accurate Random Forest model analyzes your heart rate, SpO2, sleep, and stress score 
              to determine your cognitive readiness state.
            </p>
          </div>

          <div className="stress-workflow-connector" />

          <div className="stress-workflow-step">
            <div className="step-number">03</div>
            <h4 className="step-title">Adaptive High-Retention Study</h4>
            <p className="step-desc">
              Follow bio-synchronized study sessions, take timely relaxation breaks, and prevent academic burnout 
              with intelligent daily guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="stress-bottom-cta-section">
        <div className="stress-bottom-cta-card">
          <div className="stress-bottom-cta-glow" />
          <div className="stress-bottom-cta-content">
            <h2>Ready to Eliminate Burnout & Maximize Your Study Output?</h2>
            <p>
              Join students utilizing biometric intelligence and machine learning to achieve optimal academic balance.
            </p>
            <div className="stress-bottom-cta-buttons">
              <button className="stress-cta-large-btn" onClick={onLaunchHub}>
                <span>Launch Stress Hub</span>
                <ArrowRight size={18} />
              </button>
              <button className="stress-cta-report-btn" onClick={onViewReport}>
                <span>View Progress Report</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="stress-landing-footer">
        <div className="stress-footer-container">
          <div className="stress-footer-brand">
            <div className="stress-brand-badge mini">
              <Activity size={18} className="stress-brand-icon" />
            </div>
            <span className="stress-footer-brand-title">Stress & Bio-Analytics AI · StudyFyX</span>
          </div>

          <div className="stress-footer-meta">
            <p>© 2026 StudyFyX Ecosystem · Member 3 Cognitive Health. All rights reserved.</p>
          </div>

          <div className="stress-footer-links">
            <button onClick={handleBackToHub} className="stress-footer-link">Portal</button>
            <button onClick={onLaunchHub} className="stress-footer-link">Vitals Hub</button>
            <button onClick={onViewPlanner} className="stress-footer-link">Study Planner</button>
            <button onClick={onViewReport} className="stress-footer-link">Progress Report</button>
            <button onClick={onViewDashboard} className="stress-footer-link">Analytics</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

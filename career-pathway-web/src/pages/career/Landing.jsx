import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Compass, Brain, Layers,
  Share2, MapPin, CheckCircle2, ChevronRight,
  TrendingUp, Award, Zap, ArrowUpRight, Play, Sun, Moon, Home as HomeIcon, Target, Rocket, Briefcase
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleStart = () => {
    navigate('/analyzer');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleGraph = () => {
    navigate('/graph');
  };

  const handleRoadmap = () => {
    navigate('/roadmap');
  };

  const handleBackToHub = () => {
    navigate('/home');
  };

  return (
    <div className="career-landing-root">
      {/* Dynamic Background Glows */}
      <div className="landing-glow glow-top-left" />
      <div className="landing-glow glow-center-right" />
      <div className="landing-glow glow-bottom-center" />

      {/* Top Navigation Bar */}
      <header className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/career')}>
            <div className="brand-badge">
              <Zap size={22} className="brand-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Career Pathway AI</span>
              <span className="brand-subtitle">INTELLIGENT CAREER GUIDANCE</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#hero" className="nav-link active">Overview</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#workflow" className="nav-link">How It Works</a>
          </nav>

          <div className="nav-actions">
            <button
              className="hub-btn"
              onClick={handleBackToHub}
              title="Return to Central Portal"
            >
              <HomeIcon size={15} />
              <span>Portal</span>
            </button>

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className="cta-primary-btn" onClick={handleStart}>
              <span>Launch App</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-container">
          {/* Left Column: Headline & Action */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-badge">
              <Sparkles size={14} className="sparkle-icon" />
              <span>AI-POWERED CAREER PATHWAY & SKILL INTELLIGENCE</span>
            </div>

            <h1 className="hero-title">
              Discover.<br />
              Bridge.<br />
              <span className="gradient-text">Succeed.</span>
            </h1>

            <p className="hero-description">
              Personalized career pathway intelligence powered by AI to help you
              identify in-demand tech roles, close critical skill gaps, and build your future.
            </p>

            <div className="hero-cta-group">
              <button className="hero-btn-primary" onClick={handleStart}>
                <span>Start Your Journey</span>
                <ArrowRight size={18} />
              </button>

              <button className="hero-btn-secondary" onClick={handleGraph}>
                <div className="play-icon-bubble">
                  <Play size={14} fill="currentColor" />
                </div>
                <span>Explore Career Web</span>
              </button>
            </div>

            {/* Commercial Stats Row */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">600+</div>
                <div className="stat-label">In-Demand Skills</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">98%</div>
                <div className="stat-label">Match Precision</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">Real-Time</div>
                <div className="stat-label">Market Demands</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Visual & Floating Feature Cards */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 3D Render Image */}
            <div className="avatar-image-wrapper">
              <img
                src="/career_hero_3d.png"
                alt="Career AI Guidance Character"
                className="avatar-3d-image"
              />
            </div>

            {/* Floating Card 1: Top Right */}
            <motion.div
              className="floating-card card-top-right"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              onClick={handleStart}
            >
              <div className="card-icon-box pink">
                <Brain size={20} />
              </div>
              <div className="card-info">
                <h4>AI Career Match</h4>
                <p>Personalized career pathway insights</p>
              </div>
            </motion.div>

            {/* Floating Card 2: Middle Left */}
            <motion.div
              className="floating-card card-mid-left"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              onClick={handleDashboard}
            >
              <div className="card-icon-box purple">
                <TrendingUp size={20} />
              </div>
              <div className="card-info">
                <h4>Skill Gap Analyzer</h4>
                <p>Identify in-demand skills you need next</p>
              </div>
            </motion.div>

            {/* Floating Card 3: Bottom Left */}
            <motion.div
              className="floating-card card-bottom-left"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              onClick={handleGraph}
            >
              <div className="card-icon-box cyan">
                <Share2 size={20} />
              </div>
              <div className="card-info">
                <h4>Skill Synergy Web</h4>
                <p>Discover high-growth career pivots</p>
              </div>
            </motion.div>

            {/* Floating Card 4: Bottom Right */}
            <motion.div
              className="floating-card card-bottom-right"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              onClick={handleRoadmap}
            >
              <div className="card-icon-box indigo">
                <Compass size={20} />
              </div>
              <div className="card-info">
                <h4>Adaptive Roadmap</h4>
                <p>Step-by-step path to your dream role</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-badge">PLATFORM CAPABILITIES</div>
          <h2 className="section-title">Everything You Need to Accelerate Your Career</h2>
          <p className="section-subtitle">
            Move beyond guesswork. Get clear, data-driven career recommendations tailored specifically to your background and ambitions.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <motion.div
            className="feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={handleStart}
          >
            <div className="feature-icon-wrapper purple">
              <Brain size={26} />
            </div>
            <h3 className="feature-card-title">Intelligent Career Matching</h3>
            <p className="feature-card-desc">
              Analyzes your existing skill set and academic background to recommend high-paying, high-growth tech positions.
            </p>
            <div className="feature-card-footer">
              <span>Launch Matcher</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={handleDashboard}
          >
            <div className="feature-icon-wrapper pink">
              <Target size={26} />
            </div>
            <h3 className="feature-card-title">Precision Skill Gap Scoring</h3>
            <p className="feature-card-desc">
              Benchmarks your current profile against live job market demands to show exactly what skills you are missing.
            </p>
            <div className="feature-card-footer">
              <span>Check Readiness</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={handleGraph}
          >
            <div className="feature-icon-wrapper cyan">
              <Share2 size={26} />
            </div>
            <h3 className="feature-card-title">Interactive Synergy Web</h3>
            <p className="feature-card-desc">
              Visualizes how your skills unlock adjacent career options and flexible transition opportunities in tech.
            </p>
            <div className="feature-card-footer">
              <span>Explore Graph</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="feature-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={handleRoadmap}
          >
            <div className="feature-icon-wrapper indigo">
              <Rocket size={26} />
            </div>
            <h3 className="feature-card-title">Dynamic Action Roadmaps</h3>
            <p className="feature-card-desc">
              Generates customized learning milestones, recommended courses, and degree pathways to reach your target role.
            </p>
            <div className="feature-card-footer">
              <span>View Roadmaps</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works (3-Step Flow) */}
      <section id="workflow" className="workflow-section">
        <div className="section-header">
          <div className="section-badge">SIMPLE 3-STEP PROCESS</div>
          <h2 className="section-title">How Career Pathway AI Works</h2>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="step-number">01</div>
            <h4 className="step-title">Add Your Skills</h4>
            <p className="step-desc">
              Enter your current technical skills and degree. Our smart autocomplete makes adding your profile fast and effortless.
            </p>
          </div>

          <div className="workflow-connector" />

          <div className="workflow-step">
            <div className="step-number">02</div>
            <h4 className="step-title">Get Instant AI Insights</h4>
            <p className="step-desc">
              The AI engine matches your profile with active industry roles, calculates your readiness, and highlights key missing skills.
            </p>
          </div>

          <div className="workflow-connector" />

          <div className="workflow-step">
            <div className="step-number">03</div>
            <h4 className="step-title">Follow Your Roadmap</h4>
            <p className="step-desc">
              Access your personalized learning roadmap, master prioritized skills, and land your ideal tech position.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-section">
        <div className="bottom-cta-card">
          <div className="bottom-cta-glow" />
          <div className="bottom-cta-content">
            <h2>Ready to Discover Your Next Tech Career Move?</h2>
            <p>
              Join ambitious students and developers finding their ideal career trajectories with data-backed AI insights.
            </p>
            <div className="bottom-cta-buttons">
              <button className="cta-large-btn" onClick={handleStart}>
                <span>Start Free Analysis</span>
                <ArrowRight size={18} />
              </button>
              <button className="cta-dashboard-btn" onClick={handleDashboard}>
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-badge mini">
              <Zap size={18} className="brand-icon" />
            </div>
            <span className="footer-brand-title">Career Pathway AI · StudyFyX</span>
          </div>

          <div className="footer-meta">
            <p>© 2026 StudyFyX Ecosystem. All rights reserved.</p>
          </div>

          <div className="footer-links">
            <button onClick={handleBackToHub} className="footer-link">Portal</button>
            <button onClick={handleStart} className="footer-link">AI Matcher</button>
            <button onClick={handleDashboard} className="footer-link">Dashboard</button>
            <button onClick={handleGraph} className="footer-link">Career Web</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

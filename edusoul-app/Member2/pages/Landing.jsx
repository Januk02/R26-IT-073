import studyfyxLogo from '../../src/assets/studyfyxlogo.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Compass, Brain, Layers,
  Share2, MapPin, CheckCircle2, ChevronRight,
  TrendingUp, Award, Zap, ArrowUpRight, Play, Sun, Moon, Home as HomeIcon, Target, Rocket, Briefcase
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCareerTranslation } from '../hooks/useCareerTranslation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Landing.css';

export default function Landing({ onBackToPortal }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { tr } = useCareerTranslation();

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
    if (onBackToPortal) {
      onBackToPortal();
    } else {
      navigate('/');
    }
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
            <img src={studyfyxLogo} alt="Studyfyx" className="studyfyx-module-logo" />
            <div className="brand-text">
              <span className="brand-title">Career AI</span>
              <span className="brand-subtitle">{tr('CAREER PATHWAY & SKILL GAP ANALYZER')}</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#hero" className="nav-link active">{tr('Overview')}</a>
            <a href="#features" className="nav-link">{tr('Features')}</a>
            <a href="#workflow" className="nav-link">{tr('How It Works')}</a>
          </nav>

          <div className="nav-actions">
            {/* Language Switcher (Trilingual: English, Sinhala, Tamil) */}
            <LanguageSwitcher />

            <button
              className="hub-btn"
              onClick={handleBackToHub}
              title={tr('Return to Central Portal')}
            >
              <HomeIcon size={15} />
              <span>{tr('Portal')}</span>
            </button>

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className="cta-primary-btn" onClick={handleStart}>
              <span>{tr('Launch App')}</span>
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
              <span>{tr('AI-POWERED CAREER GUIDANCE')}</span>
            </div>

            <h1 className="hero-title">
              {tr('Bridge Your Skills to')}<br />
              <span className="gradient-text">{tr('High-Growth Tech Careers')}</span>
            </h1>

            <p className="hero-description">
              {tr('Discover your best-fit software engineering roles, measure your real-time job readiness, and follow a personalized step-by-step roadmap to land your dream tech job.')}
            </p>

            <div className="hero-cta-group">
              <button className="hero-btn-primary" onClick={handleStart}>
                <span>{tr('Analyze My Skills')}</span>
                <ArrowRight size={18} />
              </button>

              <button className="hero-btn-secondary" onClick={handleGraph}>
                <div className="play-icon-bubble">
                  <Play size={14} fill="currentColor" />
                </div>
                <span>{tr('Explore Knowledge Graph')}</span>
              </button>
            </div>

            {/* Commercial Stats Row */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">1,200+</div>
                <div className="stat-label">{tr('Verified Tech Skills')}</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">98%</div>
                <div className="stat-label">{tr('Matching Precision')}</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">100+</div>
                <div className="stat-label">{tr('Career Paths Mapped')}</div>
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
                <h4>{tr('AI Analyzer')}</h4>
                <p>{tr('Run Career Scan')}</p>
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
                <h4>{tr('Skill Gap Analysis')}</h4>
                <p>{tr('Spot missing skills & boost readiness')}</p>
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
                <h4>{tr('Career Synergy Web')}</h4>
                <p>{tr('Explore high-growth transition paths')}</p>
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
                <h4>{tr('Personalized Roadmap')}</h4>
                <p>{tr('Step-by-step milestones to your goal')}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-badge">{tr('POWERFUL PRODUCT FEATURES')}</div>
          <h2 className="section-title">{tr('Everything You Need to Launch Your Tech Career')}</h2>
          <p className="section-subtitle">
            {tr('Clear, data-driven career recommendations designed to guide undergraduates and job seekers from classroom to employment.')}
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
            <h3 className="feature-card-title">{tr('Intelligent Career Matching')}</h3>
            <p className="feature-card-desc">
              {tr('Instantly discovers the top technology careers that match your unique degree and current technical skill set.')}
            </p>
            <div className="feature-card-footer">
              <span>{tr('Analyze My Skills')}</span>
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
            <h3 className="feature-card-title">{tr('Degree-to-Industry Alignment')}</h3>
            <p className="feature-card-desc">
              {tr('Evaluates your academic background against actual industry hiring requirements to ensure you meet job criteria.')}
            </p>
            <div className="feature-card-footer">
              <span>{tr('View Dashboard')}</span>
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
            <h3 className="feature-card-title">{tr('Interactive Career Synergy Web')}</h3>
            <p className="feature-card-desc">
              {tr('Visualizes connections between tech roles and shows adjacent career options you can easily pivot into.')}
            </p>
            <div className="feature-card-footer">
              <span>{tr('Explore Knowledge Graph')}</span>
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
            <h3 className="feature-card-title">{tr('Personalized Skill Gap Roadmap')}</h3>
            <p className="feature-card-desc">
              {tr('Pinpoints the exact high-priority skills you need to learn, with actionable milestones to reach 100% job readiness.')}
            </p>
            <div className="feature-card-footer">
              <span>{tr('View Roadmap')}</span>
              <ArrowUpRight size={16} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works (4-Step Flow) */}
      <section id="workflow" className="workflow-section">
        <div className="section-header">
          <div className="section-badge">{tr('SIMPLE 4-STEP PROCESS')}</div>
          <h2 className="section-title">{tr('How Career AI Works for You')}</h2>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="step-number">01</div>
            <h4 className="step-title">{tr('Enter Your Background & Skills')}</h4>
            <p className="step-desc">
              {tr('Select your degree and choose the technical skills you currently have with quick smart suggestions.')}
            </p>
          </div>

          <div className="workflow-connector" />

          <div className="workflow-step">
            <div className="step-number">02</div>
            <h4 className="step-title">{tr('Get Instant Best-Fit Role Matches')}</h4>
            <p className="step-desc">
              {tr('Our AI scans 100+ industry tech roles to recommend your highest probability career destinations.')}
            </p>
          </div>

          <div className="workflow-connector" />

          <div className="workflow-step">
            <div className="step-number">03</div>
            <h4 className="step-title">{tr('Uncover Exact Skill Gaps')}</h4>
            <p className="step-desc">
              {tr('See which critical skills are missing from your profile and learn which ones offer the highest market value.')}
            </p>
          </div>

          <div className="workflow-connector" />

          <div className="workflow-step">
            <div className="step-number">04</div>
            <h4 className="step-title">{tr('Follow Your Custom Action Roadmap')}</h4>
            <p className="step-desc">
              {tr('Track your progress with milestones, master new proficiencies, and watch your job readiness score reach 100%.')}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-section">
        <div className="bottom-cta-card">
          <div className="bottom-cta-glow" />
          <div className="bottom-cta-content">
            <h2>{tr('Ready to Accelerate Your Tech Career?')}</h2>
            <p>
              {tr('Discover your strengths, close your skill gaps, and step confidently into the tech industry.')}
            </p>
            <div className="bottom-cta-buttons">
              <button className="cta-large-btn" onClick={handleStart}>
                <span>{tr('Analyze My Skills')}</span>
                <ArrowRight size={18} />
              </button>
              <button className="cta-dashboard-btn" onClick={handleDashboard}>
                <span>{tr('View Dashboard')}</span>
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
            <span className="footer-brand-title">Career AI · StudyFyX</span>
          </div>

          <div className="footer-meta">
            <p>© 2026 StudyFyX Ecosystem. All rights reserved.</p>
          </div>

          <div className="footer-links">
            <button onClick={handleBackToHub} className="footer-link">{tr('Portal')}</button>
            <button onClick={handleStart} className="footer-link">{tr('AI Analyzer')}</button>
            <button onClick={handleDashboard} className="footer-link">{tr('Dashboard')}</button>
            <button onClick={handleGraph} className="footer-link">{tr('Knowledge Graph')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

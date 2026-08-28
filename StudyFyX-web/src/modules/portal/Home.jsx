import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Briefcase, BookOpen, FileCheck,
  ChevronRight, LogOut, Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './Home.css';

const MODULES = [
  {
    id: 'degree',
    title: 'Degree Advisor',
    desc: 'Plan your academic journey, track credits, and get course recommendations.',
    icon: GraduationCap,
    path: '#', // Not implemented in this UI
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.1)',
    disabled: true
  },
  {
    id: 'career',
    title: 'Career Pathway AI',
    desc: 'Predict top careers, calculate your Skill-Gap Index (SGI), explore the Neo4j synergy graph, and generate your adaptive roadmap.',
    icon: Briefcase,
    path: '/career', // Navigates to the Career Landing Page
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.15)',
    disabled: false
  },
  {
    id: 'study',
    title: 'Study Assist',
    desc: 'Get help with assignments, scheduling, and smart study resources.',
    icon: BookOpen,
    path: '#', // Not implemented
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    disabled: true
  },
  {
    id: 'cv',
    title: 'Mentor Verification',
    desc: 'Verify your skills with mentors and maintain an authenticated CV.',
    icon: FileCheck,
    path: '#', // Not implemented
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.1)',
    disabled: true
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <header className="home-nav">
        <div className="home-logo">
          <div className="logo-icon-small">
            <Zap size={18} />
          </div>
          <span className="logo-text-bold">StudyFyx</span>
        </div>

        <div className="home-nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="logout-btn" onClick={() => navigate('/login')}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <motion.div
          className="home-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="welcome-badge">Student Portal</div>
          <h1 className="home-title">Welcome to <span className="gradient-text">StudyFyx</span></h1>
          <p className="home-subtitle">What would you like to focus on today? Select a module to continue.</p>
        </motion.div>

        <div className="modules-grid">
          {MODULES.map((mod, index) => {
            const Icon = mod.icon;

            return (
              <motion.div
                key={mod.id}
                className={`module-card glass-card ${mod.disabled ? 'disabled' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => !mod.disabled && navigate(mod.path)}
              >
                <div className="module-card-header">
                  <div className="module-icon" style={{ backgroundColor: mod.bg, color: mod.color }}>
                    <Icon size={24} />
                  </div>
                  {!mod.disabled && (
                    <div className="module-chevron">
                      <ChevronRight size={20} />
                    </div>
                  )}
                  {mod.disabled && (
                    <div className="module-badge">Coming Soon</div>
                  )}
                </div>

                <h3 className="module-title">{mod.title}</h3>
                <p className="module-desc">{mod.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

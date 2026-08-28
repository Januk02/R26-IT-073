import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, Map, ChevronLeft, ChevronRight,
  Zap, GraduationCap, Menu, X, Sun, Moon, LogOut, Home, Network
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useCareerData } from '../context/CareerContext';
import { useAuth } from '../../auth/AuthContext';
import { API } from '../../../config/api';
import './Layout.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & Stats' },
  { path: '/analyzer', icon: Sparkles, label: 'AI Analyzer', desc: 'Run Career Scan' },
  { path: '/roadmap', icon: Map, label: 'Roadmap', desc: 'Career Journey' },
  { path: '/graph', icon: Network, label: 'Knowledge Graph', desc: 'Skill Web Explorer' },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [engineOnline, setEngineOnline] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userName } = useCareerData();
  const { logoutUser } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch(API.HEALTH);
        if (isMounted) setEngineOnline(res.ok);
      } catch (err) {
        if (isMounted) setEngineOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="layout">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon" onClick={() => navigate('/career')} style={{ cursor: 'pointer' }}>
            <Zap size={20} />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="logo-text"
            >
              <span className="logo-name">CareerAI</span>
              <span className="logo-sub">Pathway Engine</span>
            </motion.div>
          )}
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={19} />
                  {isActive && (
                    <motion.div
                      className="nav-active-bg"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                {!collapsed && (
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-desc">{item.desc}</span>
                  </div>
                )}
              </NavLink>
            );
          })}

          <div style={{ flex: 1 }} />

          <button
            className="nav-item logout-nav-btn"
            onClick={async () => {
              setMobileOpen(false);
              await logoutUser();
              navigate('/login');
            }}
          >
            <div className="nav-icon-wrapper">
              <LogOut size={19} />
            </div>
            {!collapsed && (
              <div className="nav-text">
                <span className="nav-label">Logout</span>
                <span className="nav-desc">End Session</span>
              </div>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-badge">
              <GraduationCap size={14} />
              <span>SLIIT Research</span>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="page-title">
              {navItems.find(n =>
                location.pathname === n.path ||
                (n.path !== '/dashboard' && location.pathname.startsWith(n.path))
              )?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="topbar-right">
            <button
              className="back-to-portal-btn"
              onClick={() => navigate('/home')}
              title="Return to Landing Page"
            >
              <Home size={16} />
              <span>Back to Portal</span>
            </button>
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                    className="theme-icon"
                  >
                    <Sun size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                    className="theme-icon"
                  >
                    <Moon size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className={`engine-status ${engineOnline === false ? 'offline' : ''}`}>
              <div className={`pulse-dot ${engineOnline === false ? 'offline' : ''}`} />
              <span>{engineOnline === false ? 'AI Engine Offline' : engineOnline === true ? 'AI Engine Online' : 'Connecting...'}</span>
            </div>

            {/* User Profile Chip */}
            <div className="user-profile-chip" title={`Logged in as ${userName}`}>
              <div className="user-avatar-circle">
                {(userName || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="user-profile-info">
                <span className="user-profile-name">{userName || 'Student'}</span>
                <span className="user-profile-role">Student</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

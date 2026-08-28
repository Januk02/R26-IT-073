import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_WIDTH = 260;

const publicNav = [
  { id: 'home',     label: 'Home',                 icon: '🏠' },
  { id: 'features', label: 'Features',             icon: '✨', anchor: true },
  { id: 'about',    label: 'About Us',             icon: 'ℹ️',  anchor: true },
  { id: 'students', label: 'For Students',         icon: '🎓', anchor: true },
  { id: 'mentors',  label: 'For Mentors',          icon: '🧑‍🏫', anchor: true },
  { id: 'login',    label: 'Dream Degree Advisor', icon: '🔮', requiresAuth: true },
];

const studentNav = [
  { id: 'studentHome',        label: 'Dashboard',     icon: '🏠' },
  { id: 'dreamDegreeAdvisor', label: 'Dream Advisor', icon: '🎓' },
  { id: 'courses',            label: 'Career Pathway', icon: '🚀' },
  { id: 'analytics',          label: 'Analytics',     icon: '🧠' },
  { id: 'mentorHub',          label: 'Mentor Hub',    icon: '🧑‍🏫' },
  { id: 'messages',           label: 'Messages',      icon: '💬' },
];

const mentorNav = [
  { id: 'home',          label: 'Home',         icon: '🌐' },
  { id: 'dashboard',      label: 'Dashboard',    icon: '🏠' },
  { id: 'messages',       label: 'Messages',     icon: '💬' },
  { id: 'verification',   label: 'Verification', icon: '🎤' },
  { id: 'cvVerification', label: 'CV Analysis',  icon: '📄' },
  { id: 'history',        label: 'History',      icon: '📋' },
];

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, userRole, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile drawer

  const isAuth     = !!user;
  const isMentor   = userRole === 'mentor';
  const navItems   = !isAuth ? publicNav : isMentor ? mentorNav : studentNav;

  const handleNav = (item) => {
    if (item.anchor) {
      const el = document.getElementById(item.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView(item.id);
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('home');
  };

  const isActive = (id) => currentView === id;

  return (
    <>
      <style>{`
        /* ── Hamburger (mobile only) ── */
        .sb-hamburger {
          display: none;
          position: fixed;
          top: 16px; left: 16px;
          z-index: 1100;
          background: #1e293b;
          border: none;
          border-radius: 10px;
          width: 42px; height: 42px;
          align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 20px;
          color: white;
        }

        /* ── Backdrop (mobile) ── */
        .sb-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 900;
        }

        /* ── Sidebar shell ── */
        .sb-root {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: ${SIDEBAR_WIDTH}px;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.3s ease;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Logo area ── */
        .sb-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .sb-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 900; color: white;
          flex-shrink: 0;
        }

        .sb-logo-text { line-height: 1.2; }

        .sb-logo-name {
          font-size: 17px; font-weight: 800;
          color: white;
        }

        .sb-logo-name span { color: #60a5fa; }

        .sb-logo-sub {
          font-size: 9px; letter-spacing: 2px;
          color: #64748b; font-weight: 600;
        }

        /* ── Role badge ── */
        .sb-role-badge {
          margin: 14px 16px 0;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px;
          display: flex; align-items: center; gap: 7px;
        }

        .sb-role-badge.student {
          background: rgba(29,78,216,0.18);
          color: #93c5fd;
          border: 1px solid rgba(29,78,216,0.3);
        }

        .sb-role-badge.mentor {
          background: rgba(124,58,237,0.18);
          color: #c4b5fd;
          border: 1px solid rgba(124,58,237,0.3);
        }

        /* ── Section label ── */
        .sb-section-label {
          font-size: 10px; font-weight: 700;
          color: #475569; letter-spacing: 1.5px;
          padding: 18px 20px 8px;
        }

        /* ── Nav items ── */
        .sb-nav { flex: 1; overflow-y: auto; padding: 8px 10px; }

        .sb-nav::-webkit-scrollbar { width: 4px; }
        .sb-nav::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

        .sb-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 2px;
          border: 1px solid transparent;
          font-size: 14px; font-weight: 500;
          color: #94a3b8;
        }

        .sb-item:hover {
          background: rgba(255,255,255,0.06);
          color: white;
          border-color: rgba(255,255,255,0.06);
        }

        .sb-item.active {
          background: rgba(29,78,216,0.25);
          color: #93c5fd;
          border-color: rgba(29,78,216,0.35);
          font-weight: 600;
        }

        .sb-item-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .sb-item.active .sb-item-icon {
          background: rgba(29,78,216,0.3);
        }

        .sb-item:hover .sb-item-icon {
          background: rgba(255,255,255,0.1);
        }

        /* ── Divider ── */
        .sb-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 8px 16px;
        }

        /* ── Login-required badge ── */
        .sb-login-badge {
          margin-left: auto;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.5px;
          background: rgba(250,204,21,0.15);
          color: #fbbf24;
          border: 1px solid rgba(250,204,21,0.25);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Bottom user area ── */
        .sb-bottom {
          padding: 12px 10px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        /* Auth buttons (unauthenticated) */
        .sb-auth-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          margin-bottom: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .sb-auth-btn.login {
          background: rgba(29,78,216,0.2);
          color: #93c5fd;
          border: 1px solid rgba(29,78,216,0.35);
        }

        .sb-auth-btn.login:hover {
          background: rgba(29,78,216,0.35);
        }

        .sb-auth-btn.register {
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          color: white;
          border: none;
          box-shadow: 0 4px 14px rgba(29,78,216,0.3);
        }

        .sb-auth-btn.register:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(29,78,216,0.4);
        }

        /* User card (authenticated) */
        .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .sb-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: white;
          flex-shrink: 0;
        }

        .sb-user-email {
          font-size: 12px; color: #94a3b8;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          flex: 1;
        }

        .sb-logout {
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
          font-family: inherit;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .sb-logout:hover {
          background: rgba(239,68,68,0.22);
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .sb-hamburger { display: flex; }

          .sb-root {
            transform: translateX(-100%);
          }

          .sb-root.open {
            transform: translateX(0);
          }

          .sb-backdrop.open { display: block; }
        }
      `}</style>

      {/* Hamburger toggle */}
      <button className="sb-hamburger" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile backdrop */}
      <div className={`sb-backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <div className={`sb-root ${open ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">S</div>
          <div className="sb-logo-text">
            <div className="sb-logo-name">Study<span>Fyx</span></div>
            <div className="sb-logo-sub">AI EDUCATION PLATFORM</div>
          </div>
        </div>

        {/* Role badge */}
        {isAuth && (
          <div className={`sb-role-badge ${isMentor ? 'mentor' : 'student'}`}>
            <span>{isMentor ? '🧑‍🏫' : '🎓'}</span>
            {isMentor ? 'Mentor Portal' : 'Student Portal'}
          </div>
        )}

        {/* Nav */}
        <div className="sb-nav">
          <div className="sb-section-label">
            {isAuth ? 'NAVIGATION' : 'MENU'}
          </div>

          {navItems.map((item) => (
            <div
              key={item.id}
              className={`sb-item ${isActive(item.id) ? 'active' : ''}`}
              onClick={() => handleNav(item)}
            >
              <div className="sb-item-icon">{item.icon}</div>
              {item.label}
              {item.requiresAuth && <span className="sb-login-badge">LOGIN</span>}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="sb-bottom">
          {!isAuth ? (
            <>
              <button className="sb-auth-btn login" onClick={() => { setCurrentView('login'); setOpen(false); }}>
                🔑 Sign In
              </button>
              <button className="sb-auth-btn register" onClick={() => { setCurrentView('register'); setOpen(false); }}>
                ✨ Get Started Free
              </button>
            </>
          ) : (
            <>
              <div className="sb-user">
                <div className="sb-user-avatar">
                  {(user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="sb-user-email">{user?.email}</div>
              </div>
              <button className="sb-logout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
}

export { SIDEBAR_WIDTH };

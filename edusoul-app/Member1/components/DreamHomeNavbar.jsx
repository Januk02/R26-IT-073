import React from "react";

export default function DreamHomeNavbar({
  onStart,
  onLogin,
  onLogout,
  onNavigateToDashboard,
  onViewProfile,
  language,
  changeLanguage,
  t,
  portalOpen,
  setPortalOpen,
  portalRef,
  avatarOpen,
  setAvatarOpen,
  avatarRef,
  authUser,
}) {
  return (
    <header className="navbar">

      <div className="logo">

        <div className="logo-symbol">
          D
        </div>

        <div>

          <div className="logo-name">
            Dream Degree<span> Advisor</span>
          </div>

          <div className="logo-subtitle">
            AI FUTURE GOAL GUIDE
          </div>

        </div>

      </div>

      <nav>

        <a
          href="#home"
          className="active"
        >
          Home
        </a>

        <a href="#careers">
          Explore Future Goals
        </a>

        <a href="#ai">
          AI Guidance
        </a>

        {/* <a href="#roadmap">
          Roadmap
        </a>

        <a href="#about">
          About Us
        </a> */}

      </nav>

      {/* Language Switcher */}
      <div className="language-switcher">
        <button
          onClick={() => changeLanguage('en')}
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('si')}
          className={`lang-btn ${language === 'si' ? 'active' : ''}`}
        >
          සිං
        </button>
        <button
          onClick={() => changeLanguage('ta')}
          className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
        >
          தமி
        </button>
      </div>

      {/* Portal Button */}
      <div ref={portalRef} style={{ position: 'relative' }}>
        <button className={`portal-btn ${portalOpen ? 'active' : ''}`} onClick={() => setPortalOpen(!portalOpen)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          Portal
        </button>

        {portalOpen && (
          <div className="portal-dropdown">
            {/* Header */}
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #fff7ed)' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>D</span>
                Navigation
              </p>
            </div>
            <div style={{ padding: '6px 0' }}>
              {onNavigateToDashboard && (
                <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onNavigateToDashboard(); }}>
                  <span className="portal-dropdown-icon" style={{ background: '#eff6ff' }}>
                    <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </span>
                  Dashboard
                </button>
              )}
              {onViewProfile && (
                <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onViewProfile(); }}>
                  <span className="portal-dropdown-icon" style={{ background: '#fff7ed' }}>
                    <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  My Profile
                </button>
              )}
              <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onStart(); }}>
                <span className="portal-dropdown-icon" style={{ background: '#f0fdf4' }}>
                  <svg width="16" height="16" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </span>
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      {onLogout && authUser ? (
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', fontSize: 20, fontWeight: 800,
              border: '3px solid #e0e7ff',
              boxShadow: '0 4px 16px rgba(59,130,246,0.30)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s ease', position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.30)'; }}
          >
            {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase()
              : authUser.email ? authUser.email.charAt(0).toUpperCase() : '?'}
            {/* Online dot */}
            <span style={{
              position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
              background: '#22c55e', borderRadius: '50%', border: '2px solid white',
            }} />
          </button>

          {/* Avatar Dropdown */}
          {avatarOpen && (
            <div style={{
              position: 'absolute', top: 56, right: 0, width: 260,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
              borderRadius: 16, border: '1px solid #e5e7eb',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.06)',
              zIndex: 1000, overflow: 'hidden',
              animation: 'avatarDropIn 0.2s ease-out',
            }}>
              <style>{`@keyframes avatarDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
              {/* User header */}
              <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 16,
                  }}>
                    {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase()
                      : authUser.email ? authUser.email.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {authUser.displayName || 'Student'}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {authUser.email || ''}
                    </p>
                  </div>
                </div>
              </div>
              {/* Logout */}
              <div style={{ padding: 6 }}>
                <button onClick={() => { setAvatarOpen(false); onLogout(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#ef4444', transition: 'background 0.15s', borderRadius: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontSize: 16 }}>🚪</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button className="nav-button" onClick={onLogin}>
          {t.getStarted}
          <span>→</span>
        </button>
      )}

    </header>
  );
}

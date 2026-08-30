import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ─────────────────────────────────────────────
//  Shared helpers
// ─────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─────────────────────────────────────────────
//  Styles (injected once)
// ─────────────────────────────────────────────
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    min-height: 100vh;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
    background: #f0f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  /* ── ROLE PICKER ── */
  .rp-wrap {
    width: 100%;
    max-width: 680px;
    text-align: center;
  }

  .rp-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 40px;
  }

  .rp-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #1d4ed8, #0a5cff);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 900; color: white;
  }

  .rp-logo-name {
    font-size: 24px; font-weight: 800; color: #0f172a;
  }

  .rp-logo-name span { color: #1d4ed8; }

  .rp-title {
    font-size: 32px; font-weight: 800;
    color: #0f172a; letter-spacing: -1px;
    margin-bottom: 10px;
  }

  .rp-sub {
    font-size: 15px; color: #64748b;
    margin-bottom: 44px;
  }

  .rp-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .rp-card {
    background: white;
    border: 2.5px solid #e2e8f0;
    border-radius: 20px;
    padding: 36px 28px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .rp-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.25s;
  }

  .rp-card.student::before {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
  }

  .rp-card.mentor::before {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  }

  .rp-card:hover { transform: translateY(-4px); }

  .rp-card.student:hover {
    border-color: #1d4ed8;
    box-shadow: 0 16px 40px rgba(29,78,216,0.15);
  }

  .rp-card.student:hover::before { opacity: 1; }

  .rp-card.mentor:hover {
    border-color: #7c3aed;
    box-shadow: 0 16px 40px rgba(124,58,237,0.15);
  }

  .rp-card.mentor:hover::before { opacity: 1; }

  .rp-card-icon {
    width: 72px; height: 72px;
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    margin: 0 auto 20px;
    position: relative; z-index: 1;
  }

  .rp-card.student .rp-card-icon {
    background: linear-gradient(135deg, #1d4ed8, #0a5cff);
    box-shadow: 0 8px 24px rgba(29,78,216,0.3);
  }

  .rp-card.mentor .rp-card-icon {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    box-shadow: 0 8px 24px rgba(124,58,237,0.3);
  }

  .rp-card-title {
    font-size: 20px; font-weight: 800;
    color: #0f172a; margin-bottom: 8px;
    position: relative; z-index: 1;
  }

  .rp-card-desc {
    font-size: 13px; color: #64748b;
    line-height: 1.6;
    position: relative; z-index: 1;
    margin-bottom: 20px;
  }

  .rp-card-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px; font-weight: 600;
    position: relative; z-index: 1;
  }

  .rp-card.student .rp-card-badge {
    background: #dbeafe; color: #1d4ed8;
  }

  .rp-card.mentor .rp-card-badge {
    background: #ede9fe; color: #7c3aed;
  }

  .rp-signup {
    margin-top: 32px;
    font-size: 14px; color: #64748b;
  }

  .rp-signup button {
    background: none; border: none;
    color: #1d4ed8; font-weight: 700;
    cursor: pointer; font-size: 14px;
    font-family: inherit; padding: 0;
  }

  .rp-signup button:hover { text-decoration: underline; }

  /* ── LOGIN FORM ── */
  .lf-wrap {
    width: 100%;
    max-width: 460px;
  }

  .lf-back {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: #64748b; font-size: 14px; font-weight: 500;
    cursor: pointer; margin-bottom: 32px;
    font-family: inherit; padding: 0;
    transition: color 0.2s;
  }

  .lf-back:hover { color: #0f172a; }

  .lf-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  }

  .lf-role-badge {
    display: inline-flex;
    align-items: center; gap: 8px;
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 13px; font-weight: 700;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }

  .lf-role-badge.student {
    background: #dbeafe; color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .lf-role-badge.mentor {
    background: #ede9fe; color: #7c3aed;
    border: 1px solid #ddd6fe;
  }

  .lf-heading {
    font-size: 26px; font-weight: 800;
    color: #0f172a; letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .lf-subhead {
    font-size: 14px; color: #64748b;
    margin-bottom: 28px;
  }

  .lf-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 18px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  .lf-group { margin-bottom: 18px; }

  .lf-label {
    display: block;
    font-size: 13px; font-weight: 600;
    color: #374151; margin-bottom: 7px;
  }

  .lf-input-wrap { position: relative; }

  .lf-input-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8; font-size: 15px;
    pointer-events: none;
  }

  .lf-input {
    width: 100%;
    padding: 12px 13px 12px 40px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px; color: #0f172a;
    background: #f8faff;
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .lf-input:focus {
    background: white;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-ring);
  }

  .lf-input::placeholder { color: #cbd5e1; }

  .lf-eye {
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; color: #94a3b8;
    font-size: 15px; padding: 0;
    display: flex; align-items: center;
    transition: color 0.2s;
  }

  .lf-eye:hover { color: var(--accent); }

  .lf-forgot-row {
    display: flex; justify-content: flex-end;
    margin-top: -8px; margin-bottom: 18px;
  }

  .lf-forgot {
    font-size: 12px; color: var(--accent);
    background: none; border: none;
    cursor: pointer; font-family: inherit;
    font-weight: 500; padding: 0;
  }

  .lf-forgot:hover { text-decoration: underline; }

  .lf-submit {
    width: 100%;
    padding: 13px;
    background: var(--btn-bg);
    color: white;
    font-size: 15px; font-weight: 700;
    border: none; border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
    box-shadow: var(--btn-shadow);
    display: flex; align-items: center;
    justify-content: center; gap: 8px;
    margin-bottom: 20px;
  }

  .lf-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--btn-shadow-hover);
  }

  .lf-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .lf-spinner {
    width: 17px; height: 17px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .lf-divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px;
  }

  .lf-divider-line { flex: 1; height: 1px; background: #e2e8f0; }

  .lf-divider-text {
    font-size: 12px; color: #94a3b8;
    white-space: nowrap; font-weight: 500;
  }

  .lf-google {
    width: 100%;
    padding: 12px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px; font-weight: 600;
    color: #374151; cursor: pointer;
    display: flex; align-items: center;
    justify-content: center; gap: 10px;
    transition: all 0.2s ease;
    font-family: inherit;
    margin-bottom: 24px;
  }

  .lf-google:hover:not(:disabled) {
    border-color: var(--accent);
    background: #f8faff;
  }

  .lf-google:disabled { opacity: 0.6; cursor: not-allowed; }

  .lf-bottom {
    text-align: center;
    font-size: 13px; color: #64748b;
  }

  .lf-bottom button {
    background: none; border: none;
    color: var(--accent); font-weight: 700;
    cursor: pointer; font-size: 13px;
    font-family: inherit; padding: 0;
  }

  .lf-bottom button:hover { text-decoration: underline; }

  /* student theme vars */
  .theme-student {
    --accent: #1d4ed8;
    --accent-ring: rgba(29,78,216,0.12);
    --btn-bg: linear-gradient(135deg, #1d4ed8, #0a5cff);
    --btn-shadow: 0 8px 24px rgba(29,78,216,0.28);
    --btn-shadow-hover: 0 12px 30px rgba(29,78,216,0.38);
  }

  /* mentor theme vars */
  .theme-mentor {
    --accent: #7c3aed;
    --accent-ring: rgba(124,58,237,0.12);
    --btn-bg: linear-gradient(135deg, #7c3aed, #6d28d9);
    --btn-shadow: 0 8px 24px rgba(124,58,237,0.28);
    --btn-shadow-hover: 0 12px 30px rgba(124,58,237,0.38);
  }

  @media (max-width: 600px) {
    .rp-cards { grid-template-columns: 1fr; }
    .lf-card { padding: 28px 20px; }
  }
`;

// ─────────────────────────────────────────────
//  Role Picker Screen
// ─────────────────────────────────────────────
function RolePicker({ onSelect, onNavigateToRegister, onNavigateToHome }) {
  return (
    <div className="rp-wrap">
      {onNavigateToHome && (
        <button className="lf-back" style={{ marginBottom: '20px' }} onClick={onNavigateToHome}>
          ← Back to Home
        </button>
      )}
      <div className="rp-logo">
        <div className="rp-logo-icon">E</div>
        <div className="rp-logo-name">Edu<span>Soul</span></div>
      </div>

      <h1 className="rp-title">Who are you?</h1>
      <p className="rp-sub">Choose your role to sign in to the right portal</p>

      <div className="rp-cards">
        {/* Student card */}
        <div className="rp-card student" onClick={() => onSelect('student')}>
          <div className="rp-card-icon">🎓</div>
          <div className="rp-card-title">Student</div>
          <div className="rp-card-desc">
            Discover your dream degree with AI guidance, personalized roadmaps and career insights.
          </div>
          <span className="rp-card-badge">Sign in as Student →</span>
        </div>

        {/* Mentor card */}
        <div className="rp-card mentor" onClick={() => onSelect('mentor')}>
          <div className="rp-card-icon">🧑‍🏫</div>
          <div className="rp-card-title">Mentor</div>
          <div className="rp-card-desc">
            Guide students, manage courses, complete verifications and track your mentorship impact.
          </div>
          <span className="rp-card-badge">Sign in as Mentor →</span>
        </div>
      </div>

      <div className="rp-signup">
        Don't have an account?{' '}
        <button onClick={() => onNavigateToRegister('student')}>Create one here</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Login Form (role-aware)
// ─────────────────────────────────────────────
function LoginForm({ role, onBack, onNavigateToRegister }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const isStudent = role === 'student';
  const roleLabel = isStudent ? 'Student' : 'Mentor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }

    setLoading(true);
    const result = await login(email, password, role);

    if (!result.success) {
      // Map Firebase error codes to friendly messages
      const msg = result.error || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many failed attempts. Please wait a moment and try again.');
      } else if (msg.includes('user-disabled')) {
        setError('This account has been disabled. Contact support.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle(role);
    if (!result.success) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
    // On success App.jsx routing takes over
  };

  return (
    <div className={`lf-wrap theme-${role}`}>
      <button className="lf-back" onClick={onBack}>
        ← Back
      </button>

      <div className="lf-card">
        {/* Role badge */}
        <div className={`lf-role-badge ${role}`}>
          {isStudent ? '🎓' : '🧑‍🏫'} {roleLabel} Portal
        </div>

        <h2 className="lf-heading">Welcome back, {roleLabel}!</h2>
        <p className="lf-subhead">Sign in to your {roleLabel.toLowerCase()} account to continue.</p>

        {error && (
          <div className="lf-error">
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="lf-group">
            <label className="lf-label">Email address</label>
            <div className="lf-input-wrap">
              <span className="lf-input-icon">✉</span>
              <input
                type="email"
                className="lf-input"
                placeholder={isStudent ? 'student@example.com' : 'mentor@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="lf-group">
            <label className="lf-label">Password</label>
            <div className="lf-input-wrap">
              <span className="lf-input-icon">🔒</span>
              <input
                type={showPwd ? 'text' : 'password'}
                className="lf-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="lf-eye" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="lf-forgot-row">
            <button type="button" className="lf-forgot">Forgot password?</button>
          </div>

          <button type="submit" className="lf-submit" disabled={loading}>
            {loading
              ? <><div className="lf-spinner" /> Signing in...</>
              : `Sign in as ${roleLabel} →`}
          </button>
        </form>

        <div className="lf-divider">
          <div className="lf-divider-line" />
          <span className="lf-divider-text">or continue with</span>
          <div className="lf-divider-line" />
        </div>

        <button className="lf-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="lf-bottom">
          Don't have an account?{' '}
          <button onClick={() => onNavigateToRegister(role)}>Sign up as {roleLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Login component
// ─────────────────────────────────────────────
const Login = ({ onNavigateToRegister, onNavigateToHome }) => {
  const [selectedRole, setSelectedRole] = useState(null); // null | 'student' | 'mentor'

  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">
        {selectedRole === null ? (
          <RolePicker
            onSelect={setSelectedRole}
            onNavigateToRegister={onNavigateToRegister}
            onNavigateToHome={onNavigateToHome}
          />
        ) : (
          <LoginForm
            role={selectedRole}
            onBack={() => setSelectedRole(null)}
            onNavigateToRegister={onNavigateToRegister}
          />
        )}
      </div>
    </>
  );
};

export default Login;

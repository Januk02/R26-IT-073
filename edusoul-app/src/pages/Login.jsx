import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ─────────────────────────────────────────────
//  Shared helpers
// ─────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    min-height: 100vh;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle background radials */
  .lp-root::before {
    content: '';
    position: absolute;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
    top: -200px; right: -200px;
    pointer-events: none;
  }
  .lp-root::after {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%);
    bottom: -150px; left: -150px;
    pointer-events: none;
  }

  /* Orbiting ring decoration */
  .lp-ring {
    position: absolute; top: 50%; left: 50%;
    width: 700px; height: 700px;
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: lp-ring-spin 80s linear infinite;
    pointer-events: none;
  }
  .lp-ring::after {
    content: ''; position: absolute; top: -4px; left: 50%;
    width: 8px; height: 8px; border-radius: 50%;
    background: #3b82f6; box-shadow: 0 0 12px 4px rgba(59,130,246,0.4);
  }
  .lp-ring-2 {
    position: absolute; top: 50%; left: 50%;
    width: 850px; height: 850px;
    border: 1px solid rgba(249,115,22,0.04);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: lp-ring-spin 100s linear infinite reverse;
    pointer-events: none;
  }
  .lp-ring-2::after {
    content: ''; position: absolute; bottom: -3px; right: 50%;
    width: 6px; height: 6px; border-radius: 50%;
    background: #f97316; box-shadow: 0 0 10px 3px rgba(249,115,22,0.35);
  }
  @keyframes lp-ring-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* ── ROLE PICKER ── */
  .rp-wrap {
    width: 100%;
    max-width: 700px;
    text-align: center;
    position: relative;
    z-index: 10;
    animation: lp-fade-up 0.6s cubic-bezier(.16,1,.3,1);
  }

  @keyframes lp-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .rp-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 44px;
  }

  .rp-logo-img {
    height: 48px; width: auto; object-fit: contain;
  }

  .rp-logo-name {
    font-size: 28px; font-weight: 900;
    background: linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #f97316 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: lp-brand-shine 4s ease-in-out infinite;
  }

  @keyframes lp-brand-shine {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .rp-title {
    font-size: 36px; font-weight: 900;
    color: #1e293b; letter-spacing: -1.5px;
    margin-bottom: 10px;
  }

  .rp-title .blue { color: #3b82f6; }

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
    border: 1.5px solid rgba(0,0,0,0.06);
    border-radius: 24px;
    padding: 40px 28px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }

  .rp-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    transform: scaleX(0); transition: transform 0.3s;
    transform-origin: left;
  }

  .rp-card.student::before {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
  }

  .rp-card.mentor::before {
    background: linear-gradient(90deg, #f97316, #fb923c);
  }

  .rp-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.08);
  }

  .rp-card:hover::before { transform: scaleX(1); }

  .rp-card.student:hover {
    border-color: rgba(59,130,246,0.3);
  }

  .rp-card.mentor:hover {
    border-color: rgba(249,115,22,0.3);
  }

  .rp-card-icon {
    width: 76px; height: 76px;
    border-radius: 22px;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px;
    margin: 0 auto 22px;
    position: relative; z-index: 1;
  }

  .rp-card.student .rp-card-icon {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 8px 24px rgba(59,130,246,0.25);
  }

  .rp-card.mentor .rp-card-icon {
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 8px 24px rgba(249,115,22,0.25);
  }

  .rp-card-title {
    font-size: 20px; font-weight: 800;
    color: #1e293b; margin-bottom: 8px;
    position: relative; z-index: 1;
  }

  .rp-card-desc {
    font-size: 13px; color: #64748b;
    line-height: 1.7;
    position: relative; z-index: 1;
    margin-bottom: 22px;
  }

  .rp-card-badge {
    display: inline-block;
    padding: 8px 18px;
    border-radius: 30px;
    font-size: 12px; font-weight: 700;
    position: relative; z-index: 1;
    letter-spacing: 0.3px;
    transition: all 0.2s;
  }

  .rp-card.student .rp-card-badge {
    background: rgba(59,130,246,0.08); color: #3b82f6;
    border: 1px solid rgba(59,130,246,0.15);
  }

  .rp-card.student:hover .rp-card-badge {
    background: #3b82f6; color: white;
  }

  .rp-card.mentor .rp-card-badge {
    background: rgba(249,115,22,0.08); color: #f97316;
    border: 1px solid rgba(249,115,22,0.15);
  }

  .rp-card.mentor:hover .rp-card-badge {
    background: #f97316; color: white;
  }

  .rp-signup {
    margin-top: 36px;
    font-size: 14px; color: #64748b;
  }

  .rp-signup button {
    background: none; border: none;
    color: #3b82f6; font-weight: 700;
    cursor: pointer; font-size: 14px;
    font-family: inherit; padding: 0;
    transition: color 0.2s;
  }

  .rp-signup button:hover { color: #2563eb; text-decoration: underline; }

  /* ── LOGIN FORM ── */
  .lf-wrap {
    width: 100%;
    max-width: 460px;
    position: relative;
    z-index: 10;
    animation: lp-fade-up 0.6s cubic-bezier(.16,1,.3,1);
  }

  .lf-back {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: #94a3b8; font-size: 14px; font-weight: 500;
    cursor: pointer; margin-bottom: 28px;
    font-family: inherit; padding: 0;
    transition: color 0.2s;
  }

  .lf-back:hover { color: #1e293b; }

  .lf-card {
    background: white;
    border-radius: 28px;
    padding: 44px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
  }

  .lf-role-badge {
    display: inline-flex;
    align-items: center; gap: 8px;
    padding: 8px 18px;
    border-radius: 30px;
    font-size: 12px; font-weight: 700;
    margin-bottom: 22px;
    letter-spacing: 0.5px;
  }

  .lf-role-badge.student {
    background: rgba(59,130,246,0.08); color: #3b82f6;
    border: 1px solid rgba(59,130,246,0.15);
  }

  .lf-role-badge.mentor {
    background: rgba(249,115,22,0.08); color: #f97316;
    border: 1px solid rgba(249,115,22,0.15);
  }

  .lf-heading {
    font-size: 28px; font-weight: 900;
    color: #1e293b; letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .lf-subhead {
    font-size: 14px; color: #64748b;
    margin-bottom: 30px;
  }

  .lf-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  .lf-group { margin-bottom: 20px; }

  .lf-label {
    display: block;
    font-size: 13px; font-weight: 600;
    color: #374151; margin-bottom: 8px;
  }

  .lf-input-wrap { position: relative; }

  .lf-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8; font-size: 15px;
    pointer-events: none;
  }

  .lf-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 14px; color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: all 0.25s ease;
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
    right: 14px; top: 50%;
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
    margin-top: -10px; margin-bottom: 20px;
  }

  .lf-forgot {
    font-size: 12px; color: var(--accent);
    background: none; border: none;
    cursor: pointer; font-family: inherit;
    font-weight: 600; padding: 0;
    transition: color 0.2s;
  }

  .lf-forgot:hover { text-decoration: underline; }

  .lf-submit {
    width: 100%;
    padding: 14px;
    background: var(--btn-bg);
    color: white;
    font-size: 15px; font-weight: 700;
    border: none; border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
    box-shadow: var(--btn-shadow);
    display: flex; align-items: center;
    justify-content: center; gap: 8px;
    margin-bottom: 22px;
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
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 18px;
  }

  .lf-divider-line { flex: 1; height: 1px; background: #e2e8f0; }

  .lf-divider-text {
    font-size: 12px; color: #94a3b8;
    white-space: nowrap; font-weight: 500;
  }

  .lf-google {
    width: 100%;
    padding: 13px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 14px; font-weight: 600;
    color: #374151; cursor: pointer;
    display: flex; align-items: center;
    justify-content: center; gap: 10px;
    transition: all 0.25s ease;
    font-family: inherit;
    margin-bottom: 26px;
  }

  .lf-google:hover:not(:disabled) {
    border-color: var(--accent);
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
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
    --accent: #3b82f6;
    --accent-ring: rgba(59,130,246,0.12);
    --btn-bg: linear-gradient(135deg, #3b82f6, #2563eb);
    --btn-shadow: 0 8px 24px rgba(59,130,246,0.25);
    --btn-shadow-hover: 0 14px 32px rgba(59,130,246,0.35);
  }

  /* mentor theme vars */
  .theme-mentor {
    --accent: #f97316;
    --accent-ring: rgba(249,115,22,0.12);
    --btn-bg: linear-gradient(135deg, #f97316, #ea580c);
    --btn-shadow: 0 8px 24px rgba(249,115,22,0.25);
    --btn-shadow-hover: 0 14px 32px rgba(249,115,22,0.35);
  }

  @media (max-width: 600px) {
    .rp-cards { grid-template-columns: 1fr; }
    .lf-card { padding: 28px 22px; }
    .lp-ring, .lp-ring-2 { display: none; }
  }
`;

// ─────────────────────────────────────────────
//  Role Picker Screen
// ─────────────────────────────────────────────
function RolePicker({ onSelect, onNavigateToRegister, onNavigateToHome }) {
  return (
    <div className="rp-wrap">
      {onNavigateToHome && (
        <button className="lf-back" style={{ marginBottom: '20px', justifyContent: 'center' }} onClick={onNavigateToHome}>
          ← Back to Home
        </button>
      )}

      <div className="rp-logo">
        <img src="/src/assets/studyfyxlogo.png" alt="StudyFyx" className="rp-logo-img" />
        {/* <div className="rp-logo-name">StudyFyx</div> */}
      </div>

      <h1 className="rp-title">Who are <span className="blue">you</span>?</h1>
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
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">
        {/* Decorative rings */}
        <div className="lp-ring" />
        <div className="lp-ring-2" />

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

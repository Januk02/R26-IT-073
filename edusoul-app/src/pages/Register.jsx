import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .reg-root {
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
  .reg-root::before {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%);
    top: -200px; left: -200px;
    pointer-events: none;
  }
  .reg-root::after {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%);
    bottom: -150px; right: -150px;
    pointer-events: none;
  }

  /* Orbiting ring decoration */
  .reg-ring {
    position: absolute; top: 50%; left: 50%;
    width: 800px; height: 800px;
    border: 1px solid rgba(59,130,246,0.05);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: reg-ring-spin 90s linear infinite;
    pointer-events: none;
  }
  .reg-ring::after {
    content: ''; position: absolute; top: -4px; left: 50%;
    width: 7px; height: 7px; border-radius: 50%;
    background: #3b82f6; box-shadow: 0 0 10px 3px rgba(59,130,246,0.35);
  }
  .reg-ring-2 {
    position: absolute; top: 50%; left: 50%;
    width: 950px; height: 950px;
    border: 1px solid rgba(249,115,22,0.04);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: reg-ring-spin 110s linear infinite reverse;
    pointer-events: none;
  }
  .reg-ring-2::after {
    content: ''; position: absolute; bottom: -3px; right: 50%;
    width: 5px; height: 5px; border-radius: 50%;
    background: #f97316; box-shadow: 0 0 8px 3px rgba(249,115,22,0.3);
  }
  @keyframes reg-ring-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  .reg-wrap {
    width: 100%;
    max-width: 640px;
    position: relative;
    z-index: 10;
    animation: reg-fade-up 0.6s cubic-bezier(.16,1,.3,1);
  }

  @keyframes reg-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .reg-back {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: #94a3b8; font-size: 14px; font-weight: 500;
    cursor: pointer; margin-bottom: 24px;
    font-family: inherit; padding: 0;
    transition: color 0.2s;
  }
  .reg-back:hover { color: #1e293b; }

  .reg-card {
    background: white;
    border-radius: 28px;
    padding: 44px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
  }

  .reg-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .reg-logo-img {
    height: 44px; width: auto; object-fit: contain;
  }

  .reg-logo-name {
    font-size: 24px; font-weight: 900;
    background: linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #f97316 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: reg-brand-shine 4s ease-in-out infinite;
  }

  @keyframes reg-brand-shine {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .reg-heading {
    font-size: 28px; font-weight: 900;
    color: #1e293b; letter-spacing: -0.5px;
    margin-bottom: 6px; text-align: center;
  }

  .reg-heading .blue { color: #3b82f6; }

  .reg-subhead {
    font-size: 14px; color: #64748b;
    margin-bottom: 32px; text-align: center;
  }

  .reg-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  /* Role selector */
  .reg-role-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }

  .reg-role-btn {
    padding: 16px 12px;
    border-radius: 16px;
    border: 1.5px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.25s;
    text-align: center;
    font-family: inherit;
  }

  .reg-role-btn:hover { border-color: #cbd5e1; }

  .reg-role-btn.active.student {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.04);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .reg-role-btn.active.mentor {
    border-color: #f97316;
    background: rgba(249,115,22,0.04);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }

  .reg-role-icon { font-size: 28px; margin-bottom: 6px; }

  .reg-role-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }

  .reg-role-desc { font-size: 11px; color: #94a3b8; }

  /* Form fields */
  .reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .reg-group { margin-bottom: 18px; }

  .reg-label {
    display: block;
    font-size: 13px; font-weight: 600;
    color: #374151; margin-bottom: 7px;
  }

  .reg-input-wrap { position: relative; }

  .reg-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8; font-size: 14px;
    pointer-events: none;
  }

  .reg-input {
    width: 100%;
    padding: 13px 14px 13px 40px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 14px; color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: all 0.25s ease;
    font-family: inherit;
  }

  .reg-input.no-icon { padding-left: 14px; }

  .reg-input:focus {
    background: white;
    border-color: var(--accent, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-ring, rgba(59,130,246,0.12));
  }

  .reg-input::placeholder { color: #cbd5e1; }

  .reg-textarea {
    width: 100%;
    padding: 13px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 14px; color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: all 0.25s ease;
    font-family: inherit;
    resize: none;
    min-height: 80px;
  }

  .reg-textarea:focus {
    background: white;
    border-color: var(--accent, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-ring, rgba(59,130,246,0.12));
  }

  .reg-textarea::placeholder { color: #cbd5e1; }

  /* Password strength */
  .reg-pwd-info {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 20px;
  }

  .reg-pwd-title {
    font-size: 12px; font-weight: 700;
    color: #475569; margin-bottom: 10px;
  }

  .reg-pwd-list { list-style: none; padding: 0; margin: 0; }

  .reg-pwd-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #64748b;
    margin-bottom: 5px;
  }

  .reg-pwd-check { font-size: 13px; transition: color 0.2s; }
  .reg-pwd-check.pass { color: #22c55e; }
  .reg-pwd-check.fail { color: #cbd5e1; }

  /* Terms */
  .reg-terms {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 24px;
  }

  .reg-terms input[type="checkbox"] {
    width: 18px; height: 18px;
    margin-top: 2px;
    accent-color: var(--accent, #3b82f6);
    cursor: pointer;
  }

  .reg-terms-text {
    font-size: 13px; color: #64748b; line-height: 1.5;
  }

  .reg-terms-text a {
    color: #3b82f6; font-weight: 600;
    text-decoration: none;
  }

  .reg-terms-text a:hover { text-decoration: underline; }

  /* Submit */
  .reg-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 15px; font-weight: 700;
    border: none; border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
    box-shadow: 0 8px 24px rgba(59,130,246,0.25);
    display: flex; align-items: center;
    justify-content: center; gap: 8px;
    margin-bottom: 22px;
  }

  .reg-submit.mentor-theme {
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 8px 24px rgba(249,115,22,0.25);
  }

  .reg-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(59,130,246,0.35);
  }

  .reg-submit.mentor-theme:hover:not(:disabled) {
    box-shadow: 0 14px 32px rgba(249,115,22,0.35);
  }

  .reg-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .reg-spinner {
    width: 17px; height: 17px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: reg-spin 0.75s linear infinite;
  }

  @keyframes reg-spin { to { transform: rotate(360deg); } }

  .reg-bottom {
    text-align: center;
    font-size: 13px; color: #64748b;
  }

  .reg-bottom button {
    background: none; border: none;
    color: #3b82f6; font-weight: 700;
    cursor: pointer; font-size: 13px;
    font-family: inherit; padding: 0;
  }

  .reg-bottom button:hover { text-decoration: underline; }

  @media (max-width: 600px) {
    .reg-card { padding: 28px 22px; }
    .reg-row { grid-template-columns: 1fr; }
    .reg-role-row { grid-template-columns: 1fr; }
    .reg-ring, .reg-ring-2 { display: none; }
  }
`;

const Register = ({ onNavigateToLogin, onNavigateToHome, initialRole = 'student' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    phone: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password) => {
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  };

  const isValidPhone = (phone) => /^[\d\s\-+()]{10,}$/.test(phone);

  const isStudent = formData.role === 'student';

  return (
    <>
      <style>{styles}</style>
      <div className="reg-root" style={{ '--accent': isStudent ? '#3b82f6' : '#f97316', '--accent-ring': isStudent ? 'rgba(59,130,246,0.12)' : 'rgba(249,115,22,0.12)' }}>
        {/* Decorative rings */}
        <div className="reg-ring" />
        <div className="reg-ring-2" />

        <div className="reg-wrap">
          {onNavigateToHome && (
            <button className="reg-back" onClick={onNavigateToHome}>
              ← Back to Home
            </button>
          )}

          <div className="reg-card">
            {/* Logo */}
            <div className="reg-logo">
              <img src="/src/assets/studyfyxlogo.png" alt="StudyFyx" className="reg-logo-img" />
              {/* <div className="reg-logo-name">StudyFyx</div> */}
            </div>

            <h2 className="reg-heading">Create your <span className="blue">account</span></h2>
            <p className="reg-subhead">Join StudyFyx as a Student or Mentor</p>

            {error && (
              <div className="reg-error">
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <label className="reg-label">I want to join as</label>
              <div className="reg-role-row">
                <button
                  type="button"
                  className={`reg-role-btn ${formData.role === 'student' ? 'active student' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                >
                  <div className="reg-role-icon">🎓</div>
                  <div className="reg-role-title">Student</div>
                  <div className="reg-role-desc">Learn and grow</div>
                </button>
                <button
                  type="button"
                  className={`reg-role-btn ${formData.role === 'mentor' ? 'active mentor' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'mentor' })}
                >
                  <div className="reg-role-icon">🧑‍🏫</div>
                  <div className="reg-role-title">Mentor</div>
                  <div className="reg-role-desc">Teach and guide</div>
                </button>
              </div>

              {/* Name Fields */}
              <div className="reg-row">
                <div className="reg-group">
                  <label className="reg-label">First Name *</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">👤</span>
                    <input
                      name="firstName"
                      type="text"
                      className="reg-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="reg-group">
                  <label className="reg-label">Last Name *</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">👤</span>
                    <input
                      name="lastName"
                      type="text"
                      className="reg-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="reg-group">
                <label className="reg-label">Email Address *</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">✉</span>
                  <input
                    name="email"
                    type="email"
                    className="reg-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="reg-group">
                <label className="reg-label">Phone Number *</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">📞</span>
                  <input
                    name="phone"
                    type="tel"
                    className="reg-input"
                    placeholder="+94 71 234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="reg-row">
                <div className="reg-group">
                  <label className="reg-label">Password *</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">🔒</span>
                    <input
                      name="password"
                      type="password"
                      className="reg-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="reg-group">
                  <label className="reg-label">Confirm Password *</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">🔒</span>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="reg-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="reg-pwd-info">
                <div className="reg-pwd-title">Password requirements</div>
                <ul className="reg-pwd-list">
                  <li className="reg-pwd-item">
                    <span className={`reg-pwd-check ${formData.password.length >= 8 ? 'pass' : 'fail'}`}>✓</span>
                    At least 8 characters
                  </li>
                  <li className="reg-pwd-item">
                    <span className={`reg-pwd-check ${/[A-Z]/.test(formData.password) ? 'pass' : 'fail'}`}>✓</span>
                    One uppercase letter
                  </li>
                  <li className="reg-pwd-item">
                    <span className={`reg-pwd-check ${/[a-z]/.test(formData.password) ? 'pass' : 'fail'}`}>✓</span>
                    One lowercase letter
                  </li>
                  <li className="reg-pwd-item">
                    <span className={`reg-pwd-check ${/[0-9]/.test(formData.password) ? 'pass' : 'fail'}`}>✓</span>
                    One number
                  </li>
                </ul>
              </div>

              {/* Bio */}
              <div className="reg-group">
                <label className="reg-label">Bio (Optional)</label>
                <textarea
                  name="bio"
                  className="reg-textarea"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Terms */}
              <div className="reg-terms">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms" className="reg-terms-text">
                  I agree to the{' '}
                  <a href="#">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`reg-submit ${formData.role === 'mentor' ? 'mentor-theme' : ''}`}
                disabled={loading}
              >
                {loading
                  ? <><div className="reg-spinner" /> Creating account...</>
                  : `Create ${isStudent ? 'Student' : 'Mentor'} Account →`}
              </button>
            </form>

            <div className="reg-bottom">
              Already have an account?{' '}
              <button onClick={onNavigateToLogin}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

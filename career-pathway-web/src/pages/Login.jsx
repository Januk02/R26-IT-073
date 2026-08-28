import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      console.error(err);
      // Fallback for development/testing when user forgets password
      setError('Firebase Auth failed. Redirecting in Demo Mode...');
      setTimeout(() => {
        navigate('/home');
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate('/home');
  };

  return (
    <div className="login-container">
      {/* Decorative background elements */}
      <div className="login-bg-shape shape-1" />
      <div className="login-bg-shape shape-2" />
      
      <motion.div 
        className="login-card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <div className="logo-text">
              <h2>StudyFyx</h2>
              <span>Central Student Portal</span>
            </div>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue your learning journey.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <AnimatePresence>
            {error && (
              <motion.div 
                className="login-error"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input 
                type="email" 
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <a href="#" className="forgot-link">Forgot?</a>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In to StudyFyx</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            className="login-btn"
            style={{ marginTop: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', cursor: 'pointer' }}
            onClick={handleDemoLogin}
          >
            <Zap size={18} />
            <span>Continue as Guest / Demo Mode</span>
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link></p>
          
          <div className="mentor-section">
            <span className="divider"></span>
            <p>Are you a mentor?</p>
            <button className="mentor-login-btn">
              <BookOpen size={16} />
              Mentor Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

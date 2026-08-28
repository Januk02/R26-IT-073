import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, IdCard, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.studentId) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setIsLoading(true);

    try {
      await registerStudent(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (err) {
      console.error(err);
      let errorMessage = 'An error occurred during registration.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-shape shape-1" />
      <div className="login-bg-shape shape-2" />

      <motion.div 
        className="login-card glass-card register-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: '520px' }}
      >
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <div className="logo-text">
              <h2>StudyFyx</h2>
              <span>Student Portal Registration</span>
            </div>
          </div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join the student portal to track your career readiness.</p>
        </div>

        <form className="login-form" onSubmit={handleRegister}>
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

            {success && (
              <motion.div 
                className="login-error"
                style={{ background: 'var(--success-subtle)', color: 'var(--success)', borderColor: 'var(--success)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={16} />
                <span>Account created! Redirecting to portal...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First & Last Name Row */}
          <div className="input-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>First Name *</label>
              <div className="input-wrapper">
                <User size={17} className="login-input-icon" />
                <input 
                  type="text" 
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Last Name *</label>
              <div className="input-wrapper">
                <User size={17} className="login-input-icon" />
                <input 
                  type="text" 
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Student ID */}
          <div className="input-group">
            <label>Student ID *</label>
            <div className="input-wrapper">
              <IdCard size={18} className="login-input-icon" />
              <input 
                type="text" 
                placeholder="IT20123456"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="input-group">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input 
                type="email" 
                placeholder="student@sliit.lk"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Phone Number (Optional) */}
          <div className="input-group">
            <label>Phone Number (Optional)</label>
            <div className="input-wrapper">
              <Phone size={18} className="login-input-icon" />
              <input 
                type="tel" 
                placeholder="+94 77 123 4567"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="input-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Password *</label>
              <div className="input-wrapper">
                <Lock size={17} className="login-input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={17} className="login-input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Create Student Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

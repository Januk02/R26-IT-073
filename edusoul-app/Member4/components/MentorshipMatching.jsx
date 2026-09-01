/**
 * Mentorship Matching Component — Premium v2
 * Matches the StudentDashboard architectural card style
 * Uses inline CSS, Framer Motion, Lucide icons, medal images
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Shield,
  Star,
  TrendingUp,
  Globe,
  MapPin,
  Clock,
  MessageSquare,
  Award,
  Users,
  GraduationCap,
  ArrowUpRight,
  Zap,
  ChevronDown,
  Activity,
} from 'lucide-react';
import {
  useApiHealth,
  useMentors,
  useMentees,
  useMatchPrediction,
  useFindMentors,
  useMentorshipStats,
} from '../hooks/useMentorship';

/* ───────── tiny helpers ───────── */
const MEDAL = { Gold: '🥇', Silver: '🥈', Bronze: '🥉' };
const MEDAL_IMG = {
  Gold: '/images/gold.png',
  Silver: '/images/silver.png',
  Bronze: '/images/bronze.png',
};

const MENTOR_NAMES = [
  "Dr. Samantha Gunawardena", "Eng. Tharindu Wijesekara", "Prof. Dilani Wickramasinghe",
  "Kavinda Senaratne", "Malithi Dissanayake", "Sachini Bandara",
  "Dr. Asanka Perera", "Eng. Kasun Jayawardena", "Nadeesha Senanayake",
  "Roshan Wijesinghe", "Chathura Fernando", "Dinesha Silva",
  "Anushka Ratnayake", "Pradeep Jayasuriya", "Isuru Abeywickrama",
  "Shenali Cooray", "Harsha Weerasinghe", "Nimesha Wickramasinghe",
  "Dinuka Ekanayake", "Chamari Kulatunga", "Ravindu Mendis",
  "Kusal De Silva", "Thisara Karunaratne", "Nethmi Alahakoon",
  "Damith Rajapaksha", "Buddhika Herath", "Sanduni Samarakoon",
  "Janith Pathirana", "Oshani Jayalath", "Vimukthi Ranasinghe",
  "Suren Madushanka", "Hasini Premaratne", "Nuwan Hettiarachchi",
  "Subhashini Gamage", "Ruwan Wijethunga", "Amila Senadheera",
  "Lakmali Wanigasooriya", "Gayan Jayasundara", "Piyumi Liyanage",
  "Supun Weerakkody", "Menaka Abeyrathne", "Charith Jayatissa",
  "Dhanushka Samarawickrama", "Pavithra Attanayake", "Tharaka Wickramasinghe"
];

const getMentorDisplayName = (mentor) => {
  if (!mentor) return 'Mentor';
  const rawName = mentor.name || '';
  if (rawName && !rawName.toLowerCase().startsWith('mentor_') && !rawName.toLowerCase().startsWith('mentor ')) {
    return rawName;
  }
  const digits = String(mentor.mentor_id || '' + rawName).replace(/\D/g, '');
  const num = digits ? parseInt(digits, 10) : (rawName.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return MENTOR_NAMES[num % MENTOR_NAMES.length];
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/* ═══════════════════════════════════════════════════════════ */
/*  Animated Counter                                          */
/* ═══════════════════════════════════════════════════════════ */
const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (value == null) return;
    const target = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setDisplay(Math.round(progress * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
};

/* ═══════════════════════════════════════════════════════════ */
/*  Circular Gauge — Animated conic-gradient ring             */
/* ═══════════════════════════════════════════════════════════ */
const CircularGauge = ({ score, size = 180 }) => {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return { start: '#10B981', end: '#059669', label: '#059669', bg: '#D1FAE5' };
    if (s >= 60) return { start: '#F59E0B', end: '#D97706', label: '#D97706', bg: '#FEF3C7' };
    return { start: '#EF4444', end: '#DC2626', label: '#DC2626', bg: '#FEE2E2' };
  };
  const c = getColor(score);
  const deg = (animScore / 100) * 360;

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* outer glow */}
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: c.bg, opacity: 0.5, filter: 'blur(12px)',
      }} />
      {/* track ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `conic-gradient(${c.start} 0deg, ${c.end} ${deg}deg, #F1F5F9 ${deg}deg 360deg)`,
        transition: 'all 1.4s cubic-bezier(.4,0,.2,1)',
      }} />
      {/* inner white circle */}
      <div style={{
        position: 'absolute', borderRadius: '50%',
        width: size - 24, height: size - 24,
        background: '#FFFFFF', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <span style={{
          fontSize: 42, fontWeight: 800, color: c.label,
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {Math.round(animScore)}
        </span>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                            */
/* ═══════════════════════════════════════════════════════════ */
const MentorshipMatching = ({ externalStudents = [], showRawData = false }) => {
  const { status, loading: healthLoading, isConnected } = useApiHealth();
  const { mentors, loading: mentorsLoading } = useMentors();
  const { mentees: apiMentees, loading: menteesLoading } = useMentees();
  const { stats, loading: statsLoading } = useMentorshipStats();

  const mentees = externalStudents.length > 0 ? externalStudents : apiMentees;
  const { predictMatch, result: matchResult, loading: matchLoading } = useMatchPrediction();
  const { findMentors, matches, loading: findLoading } = useFindMentors();

  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentee, setSelectedMentee] = useState('');

  const handlePredict = async () => {
    if (!selectedMentor || !selectedMentee) return;
    const menteeData = mentees.find(m => (m.mentee_id || m.id || m.student_id) === selectedMentee);
    await predictMatch(selectedMentor, selectedMentee, menteeData || null);
  };
  const handleFindMentors = async () => {
    if (!selectedMentee) return;
    const menteeData = mentees.find(m => (m.mentee_id || m.id || m.student_id) === selectedMentee);
    await findMentors(selectedMentee, 5, menteeData || null);
  };

  const BREAKDOWN_LABELS = {
    domain_match: 'Domain Match', skills_alignment: 'Skills Alignment',
    experience_match: 'Experience', location_preference: 'Location',
    language_match: 'Language', availability_match: 'Availability',
    verification_bonus: 'Mentor Level', gold_domain_bonus: 'Gold Bonus',
  };

  const BREAKDOWN_ICONS = {
    domain_match: Globe, skills_alignment: Zap, experience_match: TrendingUp,
    location_preference: MapPin, language_match: MessageSquare,
    availability_match: Clock, verification_bonus: Shield, gold_domain_bonus: Star,
  };

  /* ── Loading ── */
  if (healthLoading) {
    return (
      <>
        <style>{skeletonCSS}</style>
        <div className="mm-skeleton-wrap">
          <div className="mm-skeleton-stats">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mm-skel-stat">
                <div className="skeleton-line" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                <div className="skeleton-line" style={{ width: '40%', height: 28 }} />
              </div>
            ))}
          </div>
          <div className="mm-skel-panel">
            <div className="skeleton-line" style={{ width: 200, height: 20, marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="skeleton-line" style={{ height: 48, borderRadius: 12 }} />
              <div className="skeleton-line" style={{ height: 48, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Disconnected ── */
  if (!isConnected) {
    return (
      <>
        <style>{componentCSS}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mm-offline-card"
        >
          <div className="mm-offline-icon">
            <Activity size={32} strokeWidth={1.5} />
          </div>
          <h3 className="mm-offline-title">ML Backend Offline</h3>
          <p className="mm-offline-desc">Start the Python backend to enable AI matching</p>
          <code className="mm-offline-code">
            cd "Mentor - backend" && start.bat
          </code>
        </motion.div>
      </>
    );
  }

  /* ── Connected ── */
  return (
    <>
      <style>{componentCSS}</style>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mm-root">

        {/* ─── Header ─── */}
        <div className="mm-header">
          <div>
            <h2 className="mm-title">AI-Powered Matching Engine</h2>
            <p className="mm-subtitle">
              Connected to ML backend • {status?.mentors_count?.toLocaleString() || 0} mentors in model
            </p>
          </div>
          <div className="mm-live-pill">
            <span className="mm-live-dot" />
            <span>Connected</span>
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        {stats && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="mm-stats-grid">
            {[
              { label: 'Total Mentors', value: stats.total_mentors, icon: Users, gradient: 'linear-gradient(135deg, #7C3AED, #6366F1)' },
              { label: 'Total Mentees', value: stats.total_mentees, icon: GraduationCap, gradient: 'linear-gradient(135deg, #2563EB, #0EA5E9)' },
              { label: 'Universities', value: stats.universities_represented, icon: Globe, gradient: 'linear-gradient(135deg, #059669, #0D9488)' },
              { label: 'Gold Mentors', value: stats.verification_distribution?.Gold || 0, icon: Award, gradient: 'linear-gradient(135deg, #D97706, #F59E0B)' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} variants={fadeUp} className="mm-stat-card" style={{ background: s.gradient }}>
                  <div className="mm-stat-icon-bg"><Icon size={20} strokeWidth={1.8} /></div>
                  <div className="mm-stat-label">{s.label}</div>
                  <div className="mm-stat-value"><AnimatedNumber value={s.value} /></div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ─── Prediction Panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mm-panel"
        >
          <div className="mm-panel-header">
            <div className="mm-panel-icon"><Sparkles size={18} strokeWidth={2} /></div>
            <div>
              <div className="mm-panel-title">Predict Match Compatibility</div>
              <div className="mm-panel-desc">Select a mentor and mentee to analyze compatibility</div>
            </div>
          </div>

          {/* Selectors */}
          <div className="mm-selectors">
            <div className="mm-selector-group">
              <label className="mm-label">MENTOR</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="mm-select"
                >
                  <option value="">Choose a mentor…</option>
                  {mentors.slice(0, 30).map((mentor) => {
                    const mentorName = getMentorDisplayName(mentor);
                    const subInfo = mentor.industry_role || mentor.university || `${mentor.experience_years} yrs`;
                    return (
                      <option key={mentor.mentor_id} value={mentor.mentor_id}>
                        {MEDAL[mentor.verification_level] || ''} {mentorName} — {mentor.domain} ({subInfo})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="mm-selector-group">
              <label className="mm-label">MENTEE</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedMentee}
                  onChange={(e) => setSelectedMentee(e.target.value)}
                  className="mm-select"
                >
                  <option value="">Choose a mentee…</option>
                  {mentees.slice(0, 30).map((mentee) => {
                    let interests = mentee.interests || [];
                    if (typeof interests === 'object' && !Array.isArray(interests)) interests = Object.values(interests);
                    const display = Array.isArray(interests) && interests.length > 0
                      ? interests.slice(0, 2).join(', ')
                      : mentee.field_of_study || 'General';
                    return (
                      <option key={mentee.mentee_id || mentee.id || mentee.student_id} value={mentee.mentee_id || mentee.id || mentee.student_id}>
                        {mentee.name} — {display}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mm-actions">
            <button onClick={handlePredict} disabled={!selectedMentor || !selectedMentee || matchLoading} className="mm-btn mm-btn-primary">
              {matchLoading ? (
                <><span className="mm-spinner" /> Analyzing…</>
              ) : (
                <><Sparkles size={16} /> Predict Match</>
              )}
            </button>
            <button onClick={handleFindMentors} disabled={!selectedMentee || findLoading} className="mm-btn mm-btn-secondary">
              {findLoading ? (
                <><span className="mm-spinner" /> Searching…</>
              ) : (
                <><Search size={16} /> Find Best Mentors</>
              )}
            </button>
          </div>

          {/* ─── Match Result ─── */}
          <AnimatePresence>
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 24, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mm-result"
              >
                <div className="mm-result-inner">
                  {/* Top row */}
                  <div className="mm-result-header">
                    <h4 className="mm-result-title">
                      <Shield size={18} strokeWidth={2} /> Match Analysis
                    </h4>
                    <span className={`mm-rec-badge ${
                      matchResult.compatibility_score >= 80 ? 'rec-high'
                      : matchResult.compatibility_score >= 60 ? 'rec-mid'
                      : 'rec-low'
                    }`}>
                      {matchResult.recommendation}
                    </span>
                  </div>

                  {/* Gauge + Breakdown */}
                  <div className="mm-result-body">
                    <div className="mm-gauge-section">
                      <CircularGauge score={matchResult.compatibility_score} />
                      <div className="mm-confidence-chip">
                        <Activity size={14} />
                        ML Confidence: {Math.round(matchResult.match_probability)}%
                      </div>
                    </div>

                    <div className="mm-breakdown-section">
                      <h5 className="mm-breakdown-title">SCORE BREAKDOWN</h5>
                      <div className="mm-breakdown-list">
                        {Object.entries(matchResult.breakdown || {}).map(([key, value], i) => {
                          const rounded = Math.round(value);
                          const Icon = BREAKDOWN_ICONS[key] || Star;
                          const barColor = rounded >= 80 ? '#10B981' : rounded >= 60 ? '#F59E0B' : '#EF4444';
                          const textColor = rounded >= 80 ? '#059669' : rounded >= 60 ? '#D97706' : '#DC2626';
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.35 }}
                              className="mm-breakdown-row"
                            >
                              <div className="mm-breakdown-label">
                                <Icon size={13} strokeWidth={2} style={{ color: barColor }} />
                                <span>{BREAKDOWN_LABELS[key] || key.replace(/_/g, ' ')}</span>
                              </div>
                              <div className="mm-bar-track">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, rounded)}%` }}
                                  transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.06 }}
                                  className="mm-bar-fill"
                                  style={{ background: barColor }}
                                />
                              </div>
                              <span className="mm-breakdown-value" style={{ color: textColor }}>{rounded}%</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Top Matches ─── */}
          <AnimatePresence>
            {matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mm-matches"
              >
                <h4 className="mm-matches-title">
                  <Star size={18} strokeWidth={2} style={{ color: '#F59E0B' }} />
                  Top {matches.length} Recommended Mentors
                </h4>

                <motion.div variants={stagger} initial="hidden" animate="show" className="mm-matches-list">
                  {matches.map((match, index) => {
                    const mentorName = getMentorDisplayName(match);
                    const skillsList = typeof match.skills === 'string'
                      ? match.skills.split(',').map(s => s.trim()).filter(Boolean)
                      : Array.isArray(match.skills) ? match.skills : [];

                    return (
                      <motion.div
                        key={match.mentor_id || index}
                        variants={fadeUp}
                        className="mm-match-card"
                      >
                        <div className="mm-match-left" style={{ flex: 1 }}>
                          {/* Rank badge */}
                          <div className={`mm-rank-badge rank-${index < 3 ? index + 1 : 'other'}`}>
                            #{index + 1}
                          </div>

                          {/* Info */}
                          <div className="mm-match-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div className="mm-match-name" style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                                {mentorName}
                              </div>
                              {match.industry_role && (
                                <span style={{
                                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                  background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #DBEAFE'
                                }}>
                                  {match.industry_role}
                                </span>
                              )}
                            </div>

                            {/* Specific Details */}
                            <div className="mm-match-meta" style={{ flexWrap: 'wrap', marginTop: '4px', gap: '6px', color: '#64748B', fontSize: '12px' }}>
                              <span style={{ fontWeight: 600, color: '#4338CA' }}>{match.domain}</span>
                              <span className="mm-meta-dot">•</span>
                              {match.university && (
                                <>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <GraduationCap size={12} strokeWidth={2} />
                                    {match.university}
                                  </span>
                                  <span className="mm-meta-dot">•</span>
                                </>
                              )}
                              {match.location && (
                                <>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={12} strokeWidth={2} />
                                    {match.location}
                                  </span>
                                  <span className="mm-meta-dot">•</span>
                                </>
                              )}
                              <span>{match.experience_years} yrs exp</span>
                              {match.availability_hours && (
                                <>
                                  <span className="mm-meta-dot">•</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={12} strokeWidth={2} />
                                    {match.availability_hours}h/wk
                                  </span>
                                </>
                              )}
                              <span className="mm-meta-dot">•</span>
                              <span className="mm-verification-tag">
                                {MEDAL_IMG[match.verification_level] ? (
                                  <img src={MEDAL_IMG[match.verification_level]} alt="" className="mm-medal-img" />
                                ) : MEDAL[match.verification_level] || '🥉'}
                                {match.verification_level} Mentor
                              </span>
                            </div>

                            {/* Skills Badges */}
                            {skillsList.length > 0 && (
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                                {skillsList.slice(0, 3).map((skill, si) => (
                                  <span key={si} style={{
                                    fontSize: '10px', fontWeight: 600, padding: '1px 8px',
                                    borderRadius: '5px', background: '#F8FAFC', color: '#64748B',
                                    border: '1px solid #E2E8F0'
                                  }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="mm-match-score-wrap" style={{ marginLeft: '16px' }}>
                          <div className={`mm-match-score ${
                            match.compatibility_score >= 80 ? 'score-high'
                            : match.compatibility_score >= 60 ? 'score-mid'
                            : 'score-low'
                          }`}>
                            {Math.round(match.compatibility_score)}%
                          </div>
                          <div className="mm-match-score-label">match</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Domain Distribution ─── */}
        {stats?.mentor_domains && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mm-domains-card"
          >
            <h3 className="mm-domains-title">Domain Distribution</h3>
            <div className="mm-domains-pills">
              {Object.entries(stats.mentor_domains).map(([domain, count], i) => {
                const colors = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#E11D48', '#0284C7'];
                const color = colors[i % colors.length];
                return (
                  <span key={domain} className="mm-domain-pill" style={{ '--pill-color': color }}>
                    <span className="mm-domain-dot" style={{ background: color }} />
                    {domain}
                    <span className="mm-domain-count">{count}</span>
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Debug ─── */}
        {showRawData && selectedMentee && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mm-debug-card">
            <h3 className="mm-debug-title">📊 Selected Student Profile (Debug)</h3>
            {(() => {
              const student = mentees.find(m => (m.mentee_id || m.id || m.student_id) === selectedMentee);
              if (!student) return <p style={{ color: '#94A3B8' }}>No student selected</p>;
              return (
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <div><strong>Name:</strong> {student.name}</div>
                    <div><strong>Field:</strong> {student.field_of_study}</div>
                    <div><strong>University:</strong> {student.university}</div>
                    <div><strong>Location:</strong> {student.location}</div>
                    <div><strong>Z-Score:</strong> {student.z_score}</div>
                    <div><strong>Work Env:</strong> {student.work_environment}</div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <strong>Interests:</strong> {(() => {
                      let ints = student.interests || [];
                      if (typeof ints === 'object' && !Array.isArray(ints)) ints = Object.values(ints);
                      return Array.isArray(ints) ? ints.join(', ') : 'None';
                    })()}
                  </div>
                  {student.al_results && (
                    <div style={{ marginTop: 4 }}>
                      <strong>AL Results:</strong>{' '}
                      <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                        {Object.entries(student.al_results)
                          .filter(([_, v]) => v && typeof v === 'string' && v.length <= 2)
                          .map(([subject, grade]) => (
                            <span key={subject} style={{
                              padding: '2px 8px', borderRadius: 6, fontSize: 10,
                              fontWeight: 700, background: '#F1F5F9', border: '1px solid #E2E8F0',
                            }}>
                              {subject}: {grade}
                            </span>
                          ))}
                      </span>
                    </div>
                  )}
                  {student.career_goals?.length > 0 && (
                    <div style={{ marginTop: 4 }}><strong>Career Goals:</strong> {student.career_goals.join(', ')}</div>
                  )}
                  {student.personality_traits && (
                    <div style={{ marginTop: 4 }}>
                      <strong>Personality:</strong>{' '}
                      <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                        {Object.entries(student.personality_traits).map(([trait, value]) => (
                          <span key={trait} style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 10,
                            fontWeight: 700, background: '#F1F5F9', border: '1px solid #E2E8F0',
                          }}>
                            {trait}: {value}/5
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/*  Component CSS (inline <style>)                            */
/* ═══════════════════════════════════════════════════════════ */
const componentCSS = `
  .mm-root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
  }

  /* ── Header ── */
  .mm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .mm-title { font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.03em; margin: 0; }
  .mm-subtitle { font-size: 13px; color: #94A3B8; margin-top: 4px; font-weight: 500; }
  .mm-live-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: #ECFDF5; border: 1px solid #A7F3D0;
    font-size: 12px; font-weight: 700; color: #059669;
  }
  .mm-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #10B981;
    animation: livePulse 2s infinite;
  }

  /* ── Stats ── */
  .mm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .mm-stat-card {
    border-radius: 16px; padding: 20px; color: white; position: relative; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.18); }
  .mm-stat-icon-bg {
    width: 40px; height: 40px; border-radius: 11px;
    background: rgba(255,255,255,0.18); display: flex;
    align-items: center; justify-content: center; margin-bottom: 16px;
  }
  .mm-stat-label { font-size: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 4px; }
  .mm-stat-value { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; }

  /* ── Panel ── */
  .mm-panel {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px;
    padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 20px;
  }
  .mm-panel-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .mm-panel-icon {
    width: 44px; height: 44px; border-radius: 13px;
    background: linear-gradient(135deg, #7C3AED, #6366F1);
    color: white; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  }
  .mm-panel-title { font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em; }
  .mm-panel-desc { font-size: 13px; color: #94A3B8; margin-top: 2px; }

  /* ── Selectors ── */
  .mm-selectors { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .mm-selector-group {}
  .mm-label {
    display: block; font-size: 10px; font-weight: 800; color: #94A3B8;
    letter-spacing: 0.1em; margin-bottom: 6px;
  }
  .mm-select-wrap { position: relative; }
  .mm-select {
    width: 100%; padding: 14px 40px 14px 16px;
    background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 13px;
    font-size: 14px; color: #0F172A; outline: none; cursor: pointer;
    appearance: none; transition: all 0.25s; box-sizing: border-box;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 14px center; background-repeat: no-repeat; background-size: 18px;
  }
  .mm-select:focus {
    border-color: #7C3AED; background-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  /* ── Buttons ── */
  .mm-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .mm-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 13px; border: none;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .mm-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #6366F1); color: white;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
  }
  .mm-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4); }
  .mm-btn-secondary {
    background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
  }
  .mm-btn-secondary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4); }
  .mm-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Result ── */
  .mm-result { margin-top: 24px; overflow: hidden; }
  .mm-result-inner {
    background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 16px; padding: 28px;
  }
  .mm-result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .mm-result-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 18px; font-weight: 800; color: #0F172A;
  }
  .mm-rec-badge {
    padding: 6px 16px; border-radius: 20px; font-size: 11px;
    font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
  }
  .rec-high { background: #D1FAE5; color: #047857; }
  .rec-mid { background: #FEF3C7; color: #B45309; }
  .rec-low { background: #FEE2E2; color: #B91C1C; }

  .mm-result-body { display: flex; gap: 40px; align-items: center; }
  .mm-gauge-section { display: flex; flex-direction: column; align-items: center; gap: 12px; flex-shrink: 0; }
  .mm-confidence-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: white; border: 1px solid #E2E8F0;
    font-size: 12px; font-weight: 700; color: #64748B;
  }
  .mm-breakdown-section { flex: 1; }
  .mm-breakdown-title {
    font-size: 10px; font-weight: 800; color: #94A3B8;
    letter-spacing: 0.1em; margin-bottom: 16px;
  }
  .mm-breakdown-list { display: flex; flex-direction: column; gap: 10px; }
  .mm-breakdown-row { display: flex; align-items: center; gap: 10px; }
  .mm-breakdown-label {
    width: 120px; display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: #64748B; font-weight: 600; flex-shrink: 0;
  }
  .mm-bar-track {
    flex: 1; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;
  }
  .mm-bar-fill { height: 100%; border-radius: 4px; }
  .mm-breakdown-value { width: 42px; text-align: right; font-size: 13px; font-weight: 800; }

  /* ── Matches ── */
  .mm-matches { margin-top: 28px; }
  .mm-matches-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 17px; font-weight: 800; color: #0F172A; margin-bottom: 16px;
  }
  .mm-matches-list { display: flex; flex-direction: column; gap: 10px; }
  .mm-match-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; background: white; border: 1px solid #E2E8F0;
    border-radius: 14px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: default;
  }
  .mm-match-card:hover {
    transform: translateY(-3px); border-color: #DDD6FE;
    box-shadow: 0 12px 36px rgba(124, 58, 237, 0.08);
  }
  .mm-match-left { display: flex; align-items: center; gap: 14px; }
  .mm-rank-badge {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  .rank-1 { background: linear-gradient(135deg, #F59E0B, #D97706); }
  .rank-2 { background: linear-gradient(135deg, #94A3B8, #64748B); }
  .rank-3 { background: linear-gradient(135deg, #EA580C, #C2410C); }
  .rank-other { background: linear-gradient(135deg, #CBD5E1, #94A3B8); }
  .mm-match-info {}
  .mm-match-name { font-size: 15px; font-weight: 700; color: #0F172A; }
  .mm-match-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94A3B8; margin-top: 3px; }
  .mm-meta-dot { color: #CBD5E1; }
  .mm-verification-tag {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 1px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;
    background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;
  }
  .mm-medal-img { width: 14px; height: 14px; object-fit: contain; }
  .mm-match-score-wrap { text-align: right; }
  .mm-match-score { font-size: 22px; font-weight: 800; }
  .score-high { color: #059669; }
  .score-mid { color: #D97706; }
  .score-low { color: #DC2626; }
  .mm-match-score-label { font-size: 10px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Domains ── */
  .mm-domains-card {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px;
    padding: 24px 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.03); margin-top: 20px;
  }
  .mm-domains-title { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 16px; }
  .mm-domains-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .mm-domain-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 10px;
    background: #F8FAFC; border: 1px solid #E2E8F0;
    font-size: 13px; font-weight: 700; color: #334155;
    transition: all 0.2s;
  }
  .mm-domain-pill:hover { border-color: var(--pill-color); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  .mm-domain-dot { width: 8px; height: 8px; border-radius: 50%; }
  .mm-domain-count { font-size: 11px; color: #94A3B8; font-weight: 600; }

  /* ── Debug ── */
  .mm-debug-card {
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px;
    padding: 20px 24px; margin-top: 20px;
  }
  .mm-debug-title { font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }

  /* ── Offline ── */
  .mm-offline-card {
    text-align: center; padding: 56px 32px;
    background: linear-gradient(135deg, #FEF2F2, #FFF1F2);
    border: 1px solid #FECACA; border-radius: 20px;
  }
  .mm-offline-icon {
    width: 64px; height: 64px; border-radius: 50%; background: #FEE2E2;
    display: flex; align-items: center; justify-content: center;
    color: #EF4444; margin: 0 auto 16px;
  }
  .mm-offline-title { font-size: 20px; font-weight: 800; color: #991B1B; margin-bottom: 6px; }
  .mm-offline-desc { font-size: 14px; color: #B91C1C; margin-bottom: 16px; }
  .mm-offline-code {
    display: inline-block; padding: 10px 20px; border-radius: 12px;
    background: white; border: 1px solid #FECACA;
    font-size: 13px; color: #475569; font-family: ui-monospace, monospace;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mm-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .mm-selectors { grid-template-columns: 1fr; }
    .mm-result-body { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .mm-stats-grid { grid-template-columns: 1fr; }
    .mm-actions { flex-direction: column; }
    .mm-btn { justify-content: center; }
  }
`;

const skeletonCSS = `
  .mm-skeleton-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .mm-skeleton-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .mm-skel-stat {
    background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px;
    height: 100px;
  }
  .mm-skel-panel {
    background: white; border: 1px solid #E2E8F0; border-radius: 20px; padding: 28px;
  }
  .skeleton-line {
    border-radius: 8px;
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes livePulse {
    0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
    50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  }
  @media (max-width: 900px) { .mm-skeleton-stats { grid-template-columns: repeat(2,1fr); } }
`;

export default MentorshipMatching;

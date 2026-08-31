import React, { useState, useEffect } from 'react';
import {
  Activity, Heart, Zap, Brain, Clock, Calendar, Sparkles, RefreshCw,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Watch, Flame,
  Smile, Frown, Meh, Coffee, Play, Pause, RotateCcw, BookOpen,
  ChevronRight, BarChart3, FileText, Sliders, Thermometer, Footprints,
  Moon, Sun, Check, Target, Lightbulb, Compass, ArrowRight, Database
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  subscribeToHealthReports, pushSimulatedWatchTelemetry,
  fetchAllFirebaseHealthReports,
  DEFAULT_LATEST_REPORT, MOOD_CONFIG, STRESS_LEVELS, predictMood,
  generateAIStudyRecommendation,
  checkModelBackendHealth,
  predictMoodFromBackend
} from '../services/healthService';

export default function StressAnalyticsHome({ onViewPlanner, onViewReport }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [selectedMoodPreset, setSelectedMoodPreset] = useState('Neutral');
  const [modelOnline, setModelOnline] = useState(false);

  // Check model backend health
  useEffect(() => {
    const checkBackend = async () => {
      const res = await checkModelBackendHealth();
      setModelOnline(res.online);
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Subscribe to Firebase health_reports
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToHealthReports(user?.uid, (fetched) => {
      if (fetched && fetched.length > 0) {
        setReports(fetched);
        setLatestReport(fetched[0]);
      }
      setLoading(false);
    });

    // Also trigger direct fetch immediately
    fetchAllFirebaseHealthReports(user?.uid).then((fetched) => {
      if (fetched && fetched.length > 0) {
        setReports(fetched);
        setLatestReport(fetched[0]);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => { if (typeof unsub === 'function') unsub(); };
  }, [user]);

  // Timer
  useEffect(() => {
    let iv = null;
    if (timerActive && timerSeconds > 0) {
      iv = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(iv);
  }, [timerActive, timerSeconds]);

  // Manual Firebase Refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const fetched = await fetchAllFirebaseHealthReports(user?.uid);
      if (fetched && fetched.length > 0) {
        setReports(fetched);
        setLatestReport(fetched[0]);
      } else {
        setReports([]);
        setLatestReport(null);
      }
    } catch (e) {
      console.warn("Manual refresh error:", e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Current mood config
  const currentMood = latestReport?.mood || latestReport?.predictedMood || 'Neutral';
  const moodCfg = MOOD_CONFIG[currentMood] || MOOD_CONFIG['Neutral'];
  const stressCfg = STRESS_LEVELS[latestReport?.stressLevel || 'Moderate'] || STRESS_LEVELS['Moderate'];

  // AI Study Recommendation derived purely from Firebase data
  const aiRec = generateAIStudyRecommendation(reports, latestReport);

  // Chart data from pure Firebase reports
  const chartData = reports.length > 0
    ? [...reports].reverse().map((r, i) => ({
      time: r.timeLabel || (r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `T-${i + 1}`),
      heartRate: r.heartRate || 72,
      stressScore: r.stressScore || 40,
      spo2: r.spo2 || 98,
      mood: r.mood || 'Neutral',
    }))
    : [];

  // Daily Mood Distribution (pie from Firebase data)
  const moodCounts = {};
  reports.forEach(r => {
    const m = r.mood || r.predictedMood || 'Neutral';
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const moodPieData = Object.entries(moodCounts).map(([name, value]) => ({
    name,
    value,
    color: (MOOD_CONFIG[name] || MOOD_CONFIG['Neutral']).color,
  }));

  // Sync simulated watch data to Firebase
  const handleSync = async (preset) => {
    setSyncing(true);
    try {
      await pushSimulatedWatchTelemetry(user?.uid, preset);
      setShowSimModal(false);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setSyncing(false), 600); }
  };

  const applyAITimer = (minutes) => {
    setTimerActive(false);
    setTimerSeconds(minutes * 60);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sa-wrapper">
      <style>{`
        .sa-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh; background: #f8faff; color: #0f172a; padding-bottom: 60px;
        }

        .sa-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31104b 100%);
          padding: 36px 40px 48px; color: white; position: relative; overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(15,23,42,0.15);
        }
        .sa-hero::after {
          content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          top: -150px; right: -100px; pointer-events: none;
        }
        .sa-hero-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; position: relative; z-index: 2; }
        .sa-tag {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px;
          background: rgba(139,92,246,0.25); border: 1px solid rgba(167,139,250,0.4);
          border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
          text-transform: uppercase; color: #c4b5fd; margin-bottom: 12px;
        }
        .sa-hero-title { font-size: 32px; font-weight: 900; letter-spacing: -0.5px; margin: 0 0 8px; line-height: 1.2; }
        .sa-hero-sub { font-size: 14px; color: #cbd5e1; max-width: 620px; margin: 0; line-height: 1.5; }
        .sa-hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

        .sa-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
          border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; border: none; font-family: inherit;
        }
        .sa-btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
        }
        .sa-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        .sa-btn-glass {
          background: rgba(255,255,255,0.12); color: white;
          border: 1px solid rgba(255,255,255,0.22); backdrop-filter: blur(8px);
        }
        .sa-btn-glass:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }

        /* Watch bar */
        .sa-watch-bar {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 12px 20px; margin-top: 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; backdrop-filter: blur(12px); position: relative; z-index: 2;
        }
        .sa-watch-info { display: flex; align-items: center; gap: 12px; }
        .sa-pulse-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #10b981;
          box-shadow: 0 0 0 0 rgba(16,185,129,0.7); animation: pulse-ring 1.8s infinite;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .sa-watch-metrics { display: flex; align-items: center; gap: 24px; font-size: 13px; }
        .sa-watch-metric-item { display: flex; align-items: center; gap: 6px; color: #e2e8f0; }
        .sa-watch-metric-val { font-weight: 800; color: white; }

        /* Body */
        .sa-body { max-width: 1380px; margin: -24px auto 0; padding: 0 32px; position: relative; z-index: 5; }

        /* AI Recommendation Hero Box */
        .sa-ai-box {
          background: white; border-radius: 20px; padding: 26px 30px; margin-bottom: 24px;
          border: 2px solid; box-shadow: 0 10px 30px rgba(15,23,42,0.06);
          position: relative; overflow: hidden;
        }
        .sa-ai-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; }
        .sa-ai-title-wrap { display: flex; align-items: center; gap: 12px; }
        .sa-ai-badge { font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .sa-ai-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        .sa-ai-card-sub { background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; }
        .sa-ai-plan-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #334155; line-height: 1.45; margin-bottom: 10px; }
        .sa-ai-plan-item:last-child { margin-bottom: 0; }

        /* Empty state banner */
        .sa-empty-banner {
          background: white; border-radius: 16px; padding: 32px; text-align: center;
          border: 1.5px dashed #cbd5e1; margin-bottom: 24px;
        }

        /* Metrics grid */
        .sa-metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
        .sa-card {
          background: white; border-radius: 18px; padding: 22px 24px;
          border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15,23,42,0.04);
          transition: all 0.25s ease;
        }
        .sa-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 24px rgba(15,23,42,0.08); transform: translateY(-2px); }
        .sa-metric-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .sa-metric-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; }
        .sa-metric-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sa-metric-value { font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 4px; }
        .sa-metric-unit { font-size: 13px; font-weight: 600; color: #94a3b8; margin-left: 3px; }
        .sa-metric-footer { font-size: 11px; display: flex; align-items: center; gap: 5px; font-weight: 600; color: #64748b; }

        /* Layout grid */
        .sa-layout-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; margin-bottom: 24px; }
        .sa-panel-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .sa-panel-title { font-size: 18px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }

        /* Timer */
        .sa-timer-box {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 18px; padding: 24px; color: white; text-align: center; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .sa-timer-display { font-size: 44px; font-weight: 900; font-family: monospace; letter-spacing: 2px; color: #38bdf8; margin: 10px 0; }
        .sa-timer-controls { display: flex; justify-content: center; gap: 12px; }

        /* Schedule item */
        .sa-schedule-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 14px; background: #f8fafc;
          border: 1px solid #edf2f7; margin-bottom: 10px; transition: all 0.2s ease;
        }
        .sa-schedule-item:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .sa-sched-left { display: flex; align-items: center; gap: 14px; }
        .sa-sched-icon {
          width: 36px; height: 36px; border-radius: 10px; background: white;
          border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #6366f1;
        }
        .sa-sched-subj { font-size: 14px; font-weight: 700; color: #0f172a; }
        .sa-sched-time { font-size: 12px; color: #64748b; margin-top: 2px; }

        /* Mood pie section */
        .sa-mood-pie-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }

        /* Modal */
        .sa-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 10000;
        }
        .sa-modal-card {
          background: white; border-radius: 20px; padding: 28px;
          width: 90%; max-width: 520px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        @media (max-width: 1200px) { 
          .sa-metrics-grid { grid-template-columns: repeat(3, 1fr); }
          .sa-ai-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 1024px) {
          .sa-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .sa-layout-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sa-hero { padding: 24px 20px; }
          .sa-body { padding: 0 16px; margin-top: -16px; }
          .sa-metrics-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="sa-hero">
        <div className="sa-hero-top">
          <div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div className="sa-tag">
                <Database size={13} /> Firestore Subcollection: health_reports
              </div>
              <div
                className="sa-tag"
                style={{
                  background: modelOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                  borderColor: modelOnline ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.5)',
                  color: modelOnline ? '#6ee7b7' : '#fca5a5'
                }}
              >
                <Brain size={13} /> Stress Model (Port 8001): {modelOnline ? 'ONLINE (RandomForest)' : 'STANDBY (Local Heuristic)'}
              </div>
            </div>
            <h1 className="sa-hero-title">Study & Stress Analytics</h1>
            <p className="sa-hero-sub">
              Live biometric telemetry analyzed with trained Random Forest ML model from <code>student_wellbeing_dataset</code>.
            </p>
          </div>
          <div className="sa-hero-actions">
            <button className="sa-btn sa-btn-glass" onClick={handleManualRefresh} disabled={refreshing}>
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Fetching Firebase...' : 'Refresh Firebase'}
            </button>
            <button className="sa-btn sa-btn-glass" onClick={() => setShowSimModal(true)} disabled={syncing}>
              <Sliders size={15} /> {syncing ? 'Pushing...' : 'Simulate Watch Data'}
            </button>
            <button className="sa-btn sa-btn-glass" onClick={onViewPlanner}>
              <Calendar size={15} /> Study Planner
            </button>
            <button className="sa-btn sa-btn-primary" onClick={onViewReport}>
              <FileText size={15} /> Full Report
            </button>
          </div>
        </div>

        {/* Watch status bar */}
        <div className="sa-watch-bar">
          <div className="sa-watch-info">
            <div className="sa-pulse-dot" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>
                {latestReport ? `${latestReport.deviceName || 'SmartWatch'} (Live Firebase Data)` : 'Firebase Listener Connected'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Subcollection: <code>health_reports</code> · {reports.length} record(s) loaded from Firestore
                {latestReport?.timestamp ? ` · Last: ${new Date(latestReport.timestamp).toLocaleTimeString()}` : ''}
              </div>
            </div>
          </div>
          <div className="sa-watch-metrics">
            <div className="sa-watch-metric-item">
              <Heart size={14} color="#ef4444" /> <span>HR:</span>
              <span className="sa-watch-metric-val">{latestReport ? `${latestReport.heartRate} BPM` : '—'}</span>
            </div>
            <div className="sa-watch-metric-item">
              <Zap size={14} color="#38bdf8" /> <span>SpO2:</span>
              <span className="sa-watch-metric-val">{latestReport ? `${latestReport.spo2}%` : '—'}</span>
            </div>
            <div className="sa-watch-metric-item">
              {latestReport && (
                <>
                  <span style={{ fontSize: '22px', marginRight: 4 }}>{moodCfg.emoji}</span>
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '8px', background: moodCfg.bg, color: moodCfg.color, fontWeight: 800, border: `1px solid ${moodCfg.border}` }}>
                    {moodCfg.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="sa-body">

        {/* ── DYNAMIC AI STUDY RECOMMENDATION SECTION ── */}
        <div className="sa-ai-box" style={{ borderColor: aiRec.border }}>
          <div className="sa-ai-header">
            <div>
              <div className="sa-ai-title-wrap">
                <Sparkles size={24} color={aiRec.color} />
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  AI Study Recommendation & Strategy
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 36px' }}>
                {aiRec.modeSubtitle}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="sa-ai-badge" style={{ background: aiRec.bg, color: aiRec.color, border: `1px solid ${aiRec.border}` }}>
                {aiRec.badge}
              </span>
              <button
                onClick={() => applyAITimer(aiRec.timerMinutes)}
                style={{
                  padding: '8px 14px', borderRadius: '10px', background: aiRec.color, color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Clock size={14} /> Set Timer ({aiRec.timerMinutes}m)
              </button>
            </div>
          </div>

          <div className="sa-ai-grid">
            {/* Left: Action Plan */}
            <div className="sa-ai-card-sub" style={{ borderLeft: `4px solid ${aiRec.color}` }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color={aiRec.color} /> Personalized Action Checklist (Firebase Analyzed)
              </div>
              {aiRec.actionPlan.map((item, idx) => (
                <div key={idx} className="sa-ai-plan-item">
                  <div style={{ padding: '2px', borderRadius: '50%', background: aiRec.bg, color: aiRec.color, flexShrink: 0, marginTop: '2px' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>{item}</div>
                </div>
              ))}
            </div>

            {/* Right: Mode & Readiness Metrics */}
            <div className="sa-ai-card-sub">
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                Cognitive Readiness Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: aiRec.color }}>{aiRec.readinessScore}%</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Brain Capacity</span>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                <strong>Recommended Session:</strong> {aiRec.sessionBlock}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>
                <strong>Focus Subject Area:</strong> {aiRec.recommendedSubjectType}
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '10px', background: aiRec.bg, fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>
                {aiRec.bioAlert}
              </div>
            </div>
          </div>
        </div>

        {/* ── FIREBASE EMPTY STATE (if 0 records found) ── */}
        {!loading && reports.length === 0 && (
          <div className="sa-empty-banner">
            <Database size={36} color="#7c3aed" style={{ marginBottom: 8 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Connected to Firestore: 0 Records in <code>health_reports</code>
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '580px', margin: '0 auto 18px', lineHeight: 1.5 }}>
              The application is listening directly to Firebase subcollection <code>students/{user?.uid || '{userId}'}/health_reports</code>.
              Sync your smartwatch or click the button below to push a test record directly into your Firestore subcollection.
            </p>
            <button
              className="sa-btn sa-btn-primary"
              onClick={() => setShowSimModal(true)}
              style={{ margin: '0 auto' }}
            >
              <Sliders size={15} /> Push First Watch Record to Firebase
            </button>
          </div>
        )}

        {/* ── 5 TELEMETRY CARDS (student_wellbeing_dataset columns) ── */}
        {latestReport && (
          <div className="sa-metrics-grid">

            <div className="sa-card" style={{ borderTop: '4px solid #ef4444' }}>
              <div className="sa-metric-head">
                <span className="sa-metric-title">Heart Rate</span>
                <div className="sa-metric-icon-wrap" style={{ background: '#fee2e2', color: '#ef4444' }}><Heart size={18} /></div>
              </div>
              <div className="sa-metric-value">{latestReport.heartRate}<span className="sa-metric-unit">BPM</span></div>
              <div className="sa-metric-footer"><TrendingUp size={13} color="#ef4444" /> Resting: 60–80 BPM</div>
            </div>

            <div className="sa-card" style={{ borderTop: '4px solid #0284c7' }}>
              <div className="sa-metric-head">
                <span className="sa-metric-title">SpO2 Oxygen</span>
                <div className="sa-metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}><Activity size={18} /></div>
              </div>
              <div className="sa-metric-value">{latestReport.spo2}<span className="sa-metric-unit">%</span></div>
              <div className="sa-metric-footer"><CheckCircle2 size={13} color="#10b981" /> Normal: 95–100%</div>
            </div>

            <div className="sa-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div className="sa-metric-head">
                <span className="sa-metric-title">Sleep</span>
                <div className="sa-metric-icon-wrap" style={{ background: '#f3e8ff', color: '#8b5cf6' }}><Moon size={18} /></div>
              </div>
              <div className="sa-metric-value">{latestReport.sleep}<span className="sa-metric-unit">hrs</span></div>
              <div className="sa-metric-footer">Target: 7–9 hrs for students</div>
            </div>

            <div className="sa-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="sa-metric-head">
                <span className="sa-metric-title">Steps</span>
                <div className="sa-metric-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}><Footprints size={18} /></div>
              </div>
              <div className="sa-metric-value">{(latestReport.steps || 0).toLocaleString()}<span className="sa-metric-unit">steps</span></div>
              <div className="sa-metric-footer">Daily goal: 6,000+</div>
            </div>

            <div className="sa-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="sa-metric-head">
                <span className="sa-metric-title">Stress Score</span>
                <div className="sa-metric-icon-wrap" style={{ background: '#fffbeb', color: '#f59e0b' }}><Brain size={18} /></div>
              </div>
              <div className="sa-metric-value">{latestReport.stressScore}<span className="sa-metric-unit">/ 100</span></div>
              <div className="sa-metric-footer" style={{ color: stressCfg.color }}>
                <span style={{ padding: '1px 6px', borderRadius: '6px', background: stressCfg.bg }}>{latestReport.stressLevel || 'Moderate'}</span>
              </div>
            </div>

          </div>
        )}

        {/* ── 2-COLUMN: CHARTS + PLANNER ── */}
        <div className="sa-layout-grid">

          {/* LEFT: Real-time Chart + Daily Mood Distribution */}
          <div className="sa-card">
            <div className="sa-panel-title-bar">
              <div>
                <h3 className="sa-panel-title"><Activity size={20} color="#7c3aed" /> Real-Time Telemetry</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Heart Rate & Stress Score from Firestore <code>health_reports</code>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Heart Rate
                </span>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} /> Stress %
                </span>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 250, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 120]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: 'white', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#hrGrad)" name="Heart Rate (BPM)" />
                    <Area type="monotone" dataKey="stressScore" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#stressGrad)" name="Stress Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No telemetry chart data available yet from Firebase.
              </div>
            )}

            {/* Daily Mood Distribution */}
            <div style={{ marginTop: '24px' }}>
              <h3 className="sa-panel-title" style={{ fontSize: '16px', marginBottom: '14px' }}>
                <Sparkles size={18} color="#f59e0b" /> Daily Mood Analysis (watch_data model)
              </h3>
              {moodPieData.length > 0 ? (
                <div className="sa-mood-pie-row">
                  <div style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={moodPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                          {moodPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} readings`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    {moodPieData.map(m => (
                      <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{(MOOD_CONFIG[m.name] || MOOD_CONFIG['Neutral']).emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>
                            <span>{m.name}</span>
                            <span style={{ color: m.color }}>{m.value} readings</span>
                          </div>
                          <div style={{ height: '5px', width: '100%', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (m.value / Math.max(reports.length, 1)) * 100)}%`, background: m.color, borderRadius: '3px' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px 0' }}>
                  Awaiting mood readings from Firebase <code>health_reports</code>.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Timer + Quick Schedule */}
          <div className="sa-card">
            {/* Pomodoro Timer */}
            <div className="sa-timer-box">
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>
                Mood-Aware Study Timer
              </div>
              <div className="sa-timer-display">{formatTimer(timerSeconds)}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '14px' }}>
                {currentMood === 'Stressed' || currentMood === 'Sad'
                  ? '⚠️ Short gentle study sessions recommended'
                  : `${moodCfg.emoji} ${currentMood} mood — great time for focused study`}
              </div>
              <div className="sa-timer-controls">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: timerActive ? '#ef4444' : '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {timerActive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start Focus</>}
                </button>
                <button
                  onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Quick daily view */}
            <div className="sa-panel-title-bar">
              <h3 className="sa-panel-title" style={{ fontSize: '16px' }}>
                <Calendar size={18} color="#0284c7" /> Today's Study Slots
              </h3>
              <button onClick={onViewPlanner} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Open Planner →
              </button>
            </div>

            <div>
              {[
                { time: '08:30 – 10:00', subject: 'Morning Study Session', status: currentMood === 'Stressed' ? 'Adjusted' : 'Scheduled', color: '#10b981', icon: BookOpen },
                { time: '10:15 – 11:45', subject: 'Subject Revision', status: 'Scheduled', color: '#0284c7', icon: Activity },
                { time: '01:30 – 02:00', subject: 'Mindfulness Break', status: 'Recovery', color: '#8b5cf6', icon: Coffee },
                { time: '02:30 – 04:00', subject: 'Afternoon Study', status: 'Scheduled', color: '#64748b', icon: Zap },
              ].map((item, idx) => (
                <div key={idx} className="sa-schedule-item">
                  <div className="sa-sched-left">
                    <div className="sa-sched-icon">{React.createElement(item.icon, { size: 16 })}</div>
                    <div>
                      <div className="sa-sched-subj">{item.subject}</div>
                      <div className="sa-sched-time">{item.time}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: `${item.color}15`, color: item.color }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Dataset info */}
            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Firebase Telemetry Schema</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                <strong>Subcollection:</strong> <code>students/&#123;uid&#125;/health_reports</code><br />
                <strong>Model:</strong> watch_data.py — RandomForest<br />
                <strong>Readings:</strong> {reports.length} document(s) loaded from Firestore
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SIMULATE MODAL (Writes directly to Firebase) ── */}
      {showSimModal && (
        <div className="sa-modal-overlay">
          <div className="sa-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Watch size={20} color="#7c3aed" /> Push Telemetry to Firebase
              </h3>
              <button onClick={() => setShowSimModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.4 }}>
              Writes a new document directly into your Firebase Firestore subcollection <code>health_reports</code> so you can test real-time synchronization.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMoodPreset(key)}
                  style={{
                    padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                    border: selectedMoodPreset === key ? `2px solid ${cfg.color}` : '1px solid #e2e8f0',
                    background: selectedMoodPreset === key ? cfg.bg : '#ffffff', color: cfg.color,
                    fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{cfg.emoji}</span> {cfg.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowSimModal(false)} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => handleSync(selectedMoodPreset)}
                disabled={syncing}
                style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Writing to Firestore...' : 'Push to health_reports'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

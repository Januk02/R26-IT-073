import { useState, useMemo, useRef, useEffect, lazy, Suspense } from 'react';

const UniversityMap = lazy(() => import('../components/UniversityMap'));

const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

export default function DreamDegreeResults({ studentData, backendResults, backwardAnalysis, onBack, onHome, onViewRoadmap, onViewGuidance, onViewProfile, onNavigateToDashboard }) {
  const [language, setLanguage] = useState('en');
  const [expandedCard, setExpandedCard] = useState(0);
  const [activeTab, setActiveTab] = useState('degrees');
  const [preferredUnis, setPreferredUnis] = useState([]);
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recommendations = backendResults?.recommendations || [];
  const universityRecs = backendResults?.university_recommendations || {};
  const bestDegree = backendResults?.best_degree || 'N/A';
  const method = backendResults?.method || 'unknown';
  const modelInfo = backendResults?.model_info || {};
  const counterfactualGuidance = backendResults?.counterfactual_guidance || {};
  const backwardData = backwardAnalysis?.backward_analysis || {};
  const studentZScore = parseFloat(studentData.academicResults?.zScore) || 0;

  const governmentUnis = universityRecs.government || [];
  const privateUnis = universityRecs.private || [];
  const allUnis = [...governmentUnis.map(u => ({ ...u, type: 'Government' })), ...privateUnis.map(u => ({ ...u, type: 'Private' }))];

  const togglePreferred = (uniName) => {
    setPreferredUnis(prev => prev.includes(uniName) ? prev.filter(n => n !== uniName) : [...prev, uniName]);
  };

  const preferredResults = useMemo(() => {
    if (preferredUnis.length === 0) return null;
    return allUnis.filter(u => preferredUnis.includes(u.name));
  }, [preferredUnis, allUnis]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getBarGradient = (score) => {
    if (score >= 0.8) return 'from-emerald-400 to-emerald-500';
    if (score >= 0.6) return 'from-blue-400 to-blue-500';
    if (score >= 0.4) return 'from-amber-400 to-amber-500';
    return 'from-red-400 to-red-500';
  };

  const getCutoffStatus = (cutoff) => {
    const diff = studentZScore - cutoff;
    if (diff >= 0.3) return { label: 'Safe', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '✓' };
    if (diff >= 0) return { label: 'Borderline', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: '~' };
    if (diff >= -0.3) return { label: 'Competitive', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '!' };
    return { label: 'Below Cutoff', color: 'text-red-700 bg-red-50 border-red-200', icon: '✗' };
  };

  /* ── University Card ── */
  const renderUniCard = (uni, isGov, showPreferToggle = true) => {
    const isPref = preferredUnis.includes(uni.name);
    const accent = isGov ? 'emerald' : 'purple';

    return (
      <div key={uni.name} className={`res-card rounded-2xl p-5 transition-all hover:shadow-lg relative ${isPref ? 'ring-2 ring-amber-400/60' : ''}`}>
        {showPreferToggle && (
          <button onClick={() => togglePreferred(uni.name)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPref ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
            title={isPref ? 'Remove from preferred' : 'Add to preferred'}>
            <svg className="w-4 h-4" fill={isPref ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}

        <div className="flex justify-between items-start mb-3 pr-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{uni.name}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-gray-500 text-sm">{uni.location}</p>
              {uni.national_rank && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">#{uni.national_rank}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold text-${accent}-600`}>
              {uni.admission_probability ? `${(uni.admission_probability * 100).toFixed(0)}%` : 'N/A'}
            </div>
            <p className="text-gray-400 text-xs">Admission</p>
          </div>
        </div>

        {uni.z_score_requirements && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Cutoff vs Your Z-Score ({studentZScore})</p>
            <div className="space-y-1.5">
              {Object.entries(uni.z_score_requirements).map(([deg, cutoff]) => {
                const status = getCutoffStatus(cutoff);
                return (
                  <div key={deg} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                    <span className="text-xs text-gray-700 flex-1">{deg}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-gray-500">Cutoff: {cutoff}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${status.color}`}>{status.icon} {status.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {uni.available_degrees && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1.5 font-semibold">Available Programs</p>
            <div className="flex flex-wrap gap-1.5">
              {uni.available_degrees.map((deg, i) => (
                <span key={i} className={`text-xs bg-${accent}-50 text-${accent}-700 px-2 py-0.5 rounded-full border border-${accent}-200`}>{deg}</span>
              ))}
            </div>
          </div>
        )}

        {!isGov && uni.tuition_fee_range && typeof uni.tuition_fee_range === 'object' && Object.keys(uni.tuition_fee_range).length > 0 && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1.5 font-semibold">Tuition Fees (LKR/Year)</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(uni.tuition_fee_range).map(([deg, fee]) => (
                <span key={deg} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-100">
                  {deg}: <span className="font-bold text-purple-600">{fee}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {uni.facilities?.slice(0, 4).map((fac, i) => (
            <span key={i} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{fac}</span>
          ))}
          {uni.accreditation?.map((acc, i) => (
            <span key={`acc-${i}`} className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{acc}</span>
          ))}
        </div>

        {uni.explanation && <p className="text-gray-400 text-xs mt-3 italic">{uni.explanation}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" style={{ animation: 'bgZoom 30s ease-in-out infinite alternate' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.92] via-blue-50/[0.88] to-white/[0.93]" />
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', width: 500, height: 500, top: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, bottom: '-5%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.10), transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat 18s ease-in-out infinite' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <style>{`
        @keyframes bgZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1.12); } }
        @keyframes orbFloat { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,20px) scale(0.95); } }
        .res-card {
          background: rgba(255,255,255,0.72); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .res-card-strong {
          background: rgba(255,255,255,0.82); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
        }
      `}</style>

      {/* ===== PORTAL BUTTON ===== */}
      <div ref={portalRef} style={{ position: 'fixed', top: 20, left: 20, zIndex: 50 }}>
        <button onClick={() => setPortalOpen(!portalOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14,
            border: `2px solid ${portalOpen ? '#3b82f6' : '#e2e8f0'}`,
            background: portalOpen ? '#eff6ff' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
            color: portalOpen ? '#3b82f6' : '#475467', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
          Portal
        </button>
        {portalOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: 260, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'portalDropIn 0.2s ease-out' }}>
            <style>{`@keyframes portalDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #fff7ed)' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>D</span>
                Navigation
              </p>
            </div>
            <div style={{ padding: '6px 0' }}>
              {[
                { label: 'Home', onClick: onHome, icon: <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>, bg: '#eff6ff' },
                onViewProfile && { label: 'My Profile', onClick: onViewProfile, icon: <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, bg: '#fff7ed' },
                onNavigateToDashboard && { label: 'Dashboard', onClick: onNavigateToDashboard, icon: <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, bg: '#eef2ff' },
                { label: 'Edit Form', onClick: onBack, icon: <svg width="16" height="16" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, bg: '#f0fdf4' },
              ].filter(Boolean).map((item, i) => (
                <button key={i} onClick={() => { setPortalOpen(false); item.onClick(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#334155', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors res-card rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowModelPanel(!showModelPanel)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <span>How AI Works</span>
              </button>
              <div className="flex items-center space-x-1">
                {['en', 'si', 'ta'].map((lang) => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${language === lang ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white/60 text-gray-500 hover:bg-white/80 border border-gray-200'}`}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model Transparency Panel */}
          {showModelPanel && modelInfo && (
            <div className="mb-8 res-card-strong rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </span>
                  <span>AI Model Transparency</span>
                </h2>
                <button onClick={() => setShowModelPanel(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                    <h3 className="text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2">Prediction Model</h3>
                    <p className="text-gray-900 font-bold text-lg mb-1">{modelInfo.method_label || method}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{modelInfo.description}</p>
                  </div>
                  <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                    <h3 className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-2">Confidence Score</h3>
                    <div className="flex items-center space-x-4 mb-2">
                      <div className={`text-4xl font-bold ${getScoreColor(modelInfo.confidence_score || 0)}`}>
                        {modelInfo.confidence_score ? `${(modelInfo.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(modelInfo.confidence_score || 0)}`} style={{ width: `${(modelInfo.confidence_score || 0) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">{modelInfo.accuracy_note}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                    <h3 className="text-orange-600 font-semibold text-xs uppercase tracking-wider mb-3">Input Factors Analyzed</h3>
                    <div className="space-y-1.5">
                      {(modelInfo.factors_used || []).map((factor, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                          <span className="text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100">
                    <h3 className="text-purple-600 font-semibold text-xs uppercase tracking-wider mb-2">Database Coverage</h3>
                    <div className="flex items-center space-x-6">
                      <div><p className="text-3xl font-bold text-gray-900">{modelInfo.universities_analyzed || 0}</p><p className="text-gray-400 text-xs">Matched</p></div>
                      <div className="text-gray-300 text-2xl font-light">/</div>
                      <div><p className="text-3xl font-bold text-gray-900">{modelInfo.total_university_database || 44}</p><p className="text-gray-400 text-xs">Total Universities</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Header */}
          <div className="text-center mb-10">
            {/* <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>AI Model: {modelInfo.method_label || method}</span>
            </div> */}
            <h1 className="text-4xl md:text-5xl font-normal mb-3">
              <span className="text-slate-900">Smart insights,</span>
              <span className="text-blue-600">made for </span><span className="text-orange-500">you</span>
            </h1>
            <p className="text-slate-900 text-lg max-w-2xl mx-auto font-normal">
              Personalized degree and university recommendations for <span className="text-blue-600">{studentData.dreamJob}</span>
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Best Degree', value: bestDegree, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
              { label: 'Confidence', value: recommendations[0]?.probability ? `${(recommendations[0].probability * 100).toFixed(0)}%` : 'N/A', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
              { label: 'Your Z-Score', value: studentZScore || 'N/A', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
              { label: 'Universities', value: governmentUnis.length + privateUnis.length, gradient: 'from-amber-500 to-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
              { label: 'Preferred', value: preferredUnis.length, gradient: 'from-blue-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
            ].map((m, i) => (
              <div key={i} className={`res-card-strong rounded-2xl p-4 text-center border ${m.border}`}>
                <p className={`text-xs uppercase tracking-wider mb-1 font-semibold ${m.text}`}>{m.label}</p>
                <p className="text-xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 res-card rounded-2xl p-1.5 mb-8">
            {[
              { id: 'degrees', label: 'Degree Predictions', icon: '🎓' },
              { id: 'universities', label: 'Universities & Cutoffs', icon: '🏛️' },
              { id: 'map', label: 'Map View', icon: '🗺️' },
              { id: 'preferred', label: `Preferred (${preferredUnis.length})`, icon: '⭐' },
              { id: 'analysis', label: 'Career Analysis', icon: '🔬' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}>
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* ===== DEGREE PREDICTIONS ===== */}
          {activeTab === 'degrees' && (
            <div className="space-y-6">
              {recommendations.length === 0 ? (
                <div className="res-card-strong rounded-2xl p-8 text-center border border-amber-200 bg-amber-50/50">
                  <p className="text-amber-700 font-semibold text-lg">No degree predictions returned from the model.</p>
                  <p className="text-amber-600/60 mt-2">Try adjusting your profile or Z-Score.</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <div key={index} className="res-card-strong rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Card Header */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{rec.degree}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-gray-500 text-sm">{rec.university || 'Best match university'}</span>
                            {rec.universityType && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${rec.universityType === 'Government' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{rec.universityType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(rec.probability || rec.overall_score)}`}>
                            {((rec.probability || rec.overall_score || 0) * 100).toFixed(0)}%
                          </div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Confidence</p>
                        </div>
                        {rec.admissionProbability && (
                          <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
                            <div className="text-xl font-bold text-blue-600">{rec.admissionProbability}</div>
                            <p className="text-xs text-blue-400">Admission</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Breakdown Bars */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'skill_match', label: 'Skill Match', colors: 'from-blue-400 to-blue-500' },
                          { key: 'personality_match', label: 'Personality', colors: 'from-purple-400 to-purple-500' },
                          { key: 'academic_feasibility', label: 'Academic Fit', colors: 'from-emerald-400 to-emerald-500', single: 'z_score_feasibility' },
                          { key: 'lifestyle_compatibility', label: 'Lifestyle', colors: 'from-orange-400 to-orange-500' },
                        ].map(({ key, label, colors, single }) => {
                          const data = rec[key];
                          if (!data) return null;
                          const pct = single
                            ? data[single] * 100
                            : Object.values(data).reduce((a, b) => a + b, 0) / Object.values(data).length * 100;
                          return (
                            <div key={key}>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs font-medium">{label}</span>
                                <span className="text-gray-700 text-xs font-bold">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${colors} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="border-t border-gray-100">
                      <button onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                        className="w-full px-6 py-3 flex items-center justify-between text-gray-500 hover:text-blue-600 hover:bg-blue-50/40 transition-all">
                        <span className="text-sm font-semibold">{expandedCard === index ? 'Hide Details' : 'View Detailed Analysis'}</span>
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedCard === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedCard === index && (
                        <div className="px-6 pb-6 space-y-5">
                          {rec.explanation && (
                            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5">
                              <h4 className="text-blue-700 font-semibold mb-2 flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>AI Explanation (XAI)</span>
                              </h4>
                              <p className="text-gray-700 leading-relaxed">{rec.explanation}</p>
                            </div>
                          )}

                          {rec.academic_feasibility && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <h4 className="text-gray-900 font-semibold mb-3">Academic Feasibility Breakdown</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">Z-Score Fit</p>
                                  <p className={`text-xl font-bold ${getScoreColor(rec.academic_feasibility.z_score_feasibility)}`}>{(rec.academic_feasibility.z_score_feasibility * 100).toFixed(0)}%</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">District Adj.</p>
                                  <p className="text-xl font-bold text-blue-600">{(rec.academic_feasibility.district_adjustment * 100).toFixed(0)}%</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">Z-Score Gap</p>
                                  <p className={`text-xl font-bold ${rec.academic_feasibility.threshold_gap <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {rec.academic_feasibility.threshold_gap <= 0 ? '+' : '-'}{Math.abs(rec.academic_feasibility.threshold_gap).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {rec.skill_match && (
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3">Skill Match Breakdown</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(rec.skill_match).map(([skill, score]) => (
                                  <div key={skill} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-gray-500 text-xs capitalize mb-1">{skill.replace(/_/g, ' ')}</p>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(score)}`} style={{ width: `${score * 100}%` }} />
                                      </div>
                                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>{(score * 100).toFixed(0)}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.roadmap && rec.roadmap.length > 0 && (
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3">Future Roadmap Preview</h4>
                              <div className="space-y-2">
                                {rec.roadmap.map((step, idx) => (
                                  <div key={idx} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{idx + 1}</div>
                                    <p className="text-gray-600 text-sm">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-3 pt-2">
                            <button onClick={() => onViewRoadmap(rec)}
                              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                              Future Goal Roadmap
                            </button>
                            <button onClick={onViewGuidance}
                              className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
                              Improvement Guidance
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== UNIVERSITIES & CUTOFFS ===== */}
          {activeTab === 'universities' && (
            <div className="space-y-8">
              <div className="res-card rounded-xl p-4 border border-blue-100">
                <p className="text-gray-600 text-sm">
                  Click the <span className="text-amber-500 font-semibold">star</span> icon on any university to add it to your <span className="text-amber-600 font-semibold">Preferred</span> list.
                  Your Z-Score (<span className="text-gray-900 font-bold">{studentZScore}</span>) is compared against each program's cutoff mark.
                </p>
              </div>

              {governmentUnis.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Government Universities</h2>
                    <span className="text-emerald-600 text-sm font-medium">({governmentUnis.length} matches)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {governmentUnis.map((uni) => renderUniCard(uni, true))}
                  </div>
                </div>
              )}

              {privateUnis.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Private Universities</h2>
                    <span className="text-purple-600 text-sm font-medium">({privateUnis.length} matches)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {privateUnis.map((uni) => renderUniCard(uni, false))}
                  </div>
                </div>
              )}

              {governmentUnis.length === 0 && privateUnis.length === 0 && (
                <div className="res-card-strong rounded-2xl p-8 text-center"><p className="text-gray-500 text-lg">No university matches found for your profile.</p></div>
              )}
            </div>
          )}

          {/* ===== MAP VIEW ===== */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></span>
                  University Locations
                </h2>
                <span className="text-gray-400 text-sm">{allUnis.length} universities recommended</span>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-96 res-card-strong rounded-2xl">
                  <div className="text-center"><div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">Loading map...</p></div>
                </div>
              }>
                <UniversityMap universities={allUnis} preferredUnis={preferredUnis} />
              </Suspense>
            </div>
          )}

          {/* ===== PREFERRED ===== */}
          {activeTab === 'preferred' && (
            <div className="space-y-6">
              {preferredUnis.length === 0 ? (
                <div className="res-card-strong rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Preferred Universities Selected</h3>
                  <p className="text-gray-500 mb-4">Go to the "Universities & Cutoffs" tab and click the star icon.</p>
                  <button onClick={() => setActiveTab('universities')} className="px-6 py-3 bg-amber-50 text-amber-700 rounded-xl font-semibold border border-amber-200 hover:bg-amber-100 transition-all">Browse Universities</button>
                </div>
              ) : (
                <>
                  <div className="res-card rounded-xl p-4 border border-amber-200 bg-amber-50/50">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Your Preferred Universities ({preferredUnis.length})</h2>
                    <p className="text-amber-700/60 text-sm">Detailed comparison of your selected universities.</p>
                  </div>

                  <div className="res-card-strong rounded-2xl p-6 overflow-x-auto">
                    <h3 className="text-gray-900 font-bold mb-4">Quick Comparison</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-gray-400 pb-3 font-semibold">University</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">Type</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">Admission %</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">Cutoff ({bestDegree})</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">Your Z-Score</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {preferredResults?.map((uni) => {
                          const cutoff = uni.z_score_requirements?.[bestDegree] || uni.z_score_requirement || 'N/A';
                          const status = typeof cutoff === 'number' ? getCutoffStatus(cutoff) : { label: 'N/A', color: 'text-gray-400 bg-gray-50 border-gray-200', icon: '-' };
                          return (
                            <tr key={uni.name} className="hover:bg-blue-50/30">
                              <td className="py-3 text-gray-900 font-medium">{uni.name}</td>
                              <td className="py-3 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${uni.type === 'Government' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{uni.type}</span>
                              </td>
                              <td className="py-3 text-center text-gray-900 font-bold">{uni.admission_probability ? `${(uni.admission_probability * 100).toFixed(0)}%` : 'N/A'}</td>
                              <td className="py-3 text-center font-mono text-gray-500">{cutoff}</td>
                              <td className="py-3 text-center font-mono text-gray-900 font-bold">{studentZScore}</td>
                              <td className="py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium border ${status.color}`}>{status.icon} {status.label}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preferredResults?.map((uni) => renderUniCard(uni, uni.type === 'Government', true))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== CAREER ANALYSIS ===== */}
          {activeTab === 'analysis' && (
            <div className="space-y-8">
              {backwardData && Object.keys(backwardData).length > 0 && (
                <div className="res-card-strong rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </span>
                    <span>Future Goal Analysis: <span className="text-blue-600">{studentData.dreamJob}</span></span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {backwardData.key_skills && (
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-blue-600 font-semibold mb-3 text-xs uppercase tracking-wider">Key Skills Required</h3>
                        <div className="space-y-2">
                          {(Array.isArray(backwardData.key_skills) ? backwardData.key_skills : [backwardData.key_skills]).map((skill, i) => (
                            <div key={i} className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /><span className="text-gray-700 text-sm">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                    {backwardData.required_education && (
                      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                        <h3 className="text-emerald-600 font-semibold mb-3 text-xs uppercase tracking-wider">Required Education</h3>
                        <p className="text-gray-700 text-sm">{typeof backwardData.required_education === 'string' ? backwardData.required_education : JSON.stringify(backwardData.required_education)}</p>
                      </div>
                    )}
                    {backwardData.career_path && (
                      <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 md:col-span-2">
                        <h3 className="text-purple-600 font-semibold mb-3 text-xs uppercase tracking-wider">Career Path</h3>
                        <p className="text-gray-700 text-sm">{backwardData.career_path}</p>
                      </div>
                    )}
                    {backwardData.industries && (
                      <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                        <h3 className="text-orange-600 font-semibold mb-3 text-xs uppercase tracking-wider">Industries</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(backwardData.industries) ? backwardData.industries : [backwardData.industries]).map((ind, i) => (
                            <span key={i} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">{ind}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {backwardData.salary_range && (
                      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                        <h3 className="text-emerald-600 font-semibold mb-3 text-xs uppercase tracking-wider">Salary Range</h3>
                        <p className="text-gray-700 text-sm">{backwardData.salary_range}</p>
                      </div>
                    )}
                    {backwardData.timeline && (
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 md:col-span-2">
                        <h3 className="text-blue-600 font-semibold mb-3 text-xs uppercase tracking-wider">Timeline</h3>
                        <p className="text-gray-700 text-sm">{backwardData.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {counterfactualGuidance && Object.keys(counterfactualGuidance).length > 0 && (
                <div className="res-card-strong rounded-2xl p-6 border border-amber-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-2xl">💡</span>
                    <span>AI Improvement Guidance</span>
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(counterfactualGuidance).map(([key, value]) => (
                      <div key={key} className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                        <h3 className="text-amber-700 font-semibold mb-1 capitalize">{key.replace(/_/g, ' ')}</h3>
                        <p className="text-gray-600">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="res-card-strong rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-600 text-xs uppercase tracking-wider mb-1 font-semibold">Dream Job</p>
                    <p className="text-xl font-bold text-gray-900">{studentData.dreamJob}</p>
                  </div>
                  <div className="bg-purple-50/70 rounded-xl p-4 border border-purple-100">
                    <p className="text-purple-600 text-xs uppercase tracking-wider mb-1 font-semibold">Stream</p>
                    <p className="text-xl font-bold text-gray-900">{studentData.academicResults?.stream || 'N/A'}</p>
                  </div>
                  <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-100">
                    <p className="text-emerald-600 text-xs uppercase tracking-wider mb-1 font-semibold">District</p>
                    <p className="text-xl font-bold text-gray-900">{studentData.personalInfo?.district || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200/60">
            <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-semibold shadow-sm">
              Back to Input
            </button>
            <button onClick={onHome} className="w-full sm:w-auto px-6 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-semibold shadow-sm">
              Back to Home
            </button>
            <button onClick={onViewGuidance} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold">
              View Improvement Guidance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

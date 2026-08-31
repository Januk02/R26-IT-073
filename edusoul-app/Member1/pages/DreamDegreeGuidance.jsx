import { useState, useRef, useEffect } from 'react';
import { universities, dreamJobs } from '../data/dreamDegreeData';

const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

export default function DreamDegreeGuidance({ studentData, backendResults, onBack, onHome, onComplete, onViewProfile, onNavigateToDashboard }) {
  const [language, setLanguage] = useState('en');
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const generateCounterfactuals = () => {
    const zScore = parseFloat(studentData.academicResults.zScore) || 0;
    const dreamJob = dreamJobs.find((job) => job.title === studentData.dreamJob) || dreamJobs[0];

    const guidance = [];

    if (zScore < 2.0) {
      guidance.push({
        category: 'Academic',
        icon: '📚',
        title: 'Improve Z-Score',
        current: zScore,
        target: 2.0,
        impact: 'High',
        suggestions: [
          'Focus on improving A/L subject grades through retake or additional study',
          'Consider alternative streams with lower cutoff requirements',
          'Enroll in bridging courses to strengthen weak subjects',
          'Seek tutoring in key subjects like Mathematics and Science',
        ],
        ifThen: `If you increase your Z-Score to 2.0+, you could qualify for 3-4 more university programs.`,
      });
    } else if (zScore < 2.5) {
      guidance.push({
        category: 'Academic',
        icon: '📚',
        title: 'Strengthen Academic Profile',
        current: zScore,
        target: 2.5,
        impact: 'Medium',
        suggestions: [
          'Take advanced level courses in relevant subjects',
          'Participate in academic competitions and Olympiads',
          'Complete online certifications from recognized platforms',
          'Maintain strong performance in current studies',
        ],
        ifThen: `If you reach Z-Score 2.5+, top universities like University of Colombo become accessible.`,
      });
    }

    const lowPersonalityTraits = Object.entries(studentData.personalityScores || {})
      .filter(([, score]) => score < 6)
      .map(([trait, score]) => ({ trait, score }));

    if (lowPersonalityTraits.length > 0) {
      lowPersonalityTraits.forEach(({ trait, score }) => {
        guidance.push({
          category: 'Personality',
          icon: '🧠',
          title: `Develop ${trait.replace(/_/g, ' ')}`,
          current: score,
          target: 7,
          impact: 'Medium',
          suggestions: [
            `Join clubs and activities that require ${trait.replace(/_/g, ' ')}`,
            'Take on leadership roles in group projects',
            'Practice through real-world scenarios and challenges',
            'Seek mentorship from professionals in your field',
          ],
          ifThen: `Improving ${trait.replace(/_/g, ' ')} will better align you with ${dreamJob.title} requirements.`,
        });
      });
    }

    if (studentData.lifestylePreferences.locationPreference === 'Urban') {
      const urbanUniversities = universities.filter((u) => u.urbanLocation);
      guidance.push({
        category: 'Lifestyle',
        icon: '🏙️',
        title: 'Consider Location Flexibility',
        current: 'Urban only',
        target: 'Flexible',
        impact: 'Medium',
        suggestions: [
          'Consider universities in suburban areas for better options',
          'Evaluate hostel facilities at non-urban universities',
          'Research transportation options to various university locations',
          'Balance location preference with program quality',
        ],
        ifThen: `If you consider suburban locations, you could access ${urbanUniversities.length + 2} additional university options.`,
      });
    }

    if (studentData.personalInfo.district) {
      const districtUniversities = universities.filter((u) => u.district === studentData.personalInfo.district);
      if (districtUniversities.length === 0) {
        guidance.push({
          category: 'Strategic',
          icon: '🎯',
          title: 'Leverage District Quota',
          current: 'No district advantage',
          target: 'Maximize quota benefits',
          impact: 'High',
          suggestions: [
            'Research universities in your district with relevant programs',
            'Consider applying to multiple universities within your district',
            'Understand district quota allocation policies',
            'Prepare strong applications highlighting local ties',
          ],
          ifThen: `If you strategically use district quota, you may qualify with 0.2-0.3 lower Z-Score requirements.`,
        });
      }
    }

    guidance.push({
      category: 'Alternative',
      icon: '🔄',
      title: 'Explore Alternative Pathways',
      current: 'Traditional university route',
      target: 'Multiple pathways',
      impact: 'High',
      suggestions: [
        'Consider private universities with flexible admission',
        'Look into degree programs at international branch campuses',
        'Explore online degree programs from accredited institutions',
        'Research vocational pathways that lead to your dream job',
      ],
      ifThen: `If you explore alternative pathways, you could start your degree journey within 6-12 months.`,
    });

    return guidance;
  };

  const counterfactuals = generateCounterfactuals();

  // Merge backend counterfactual guidance if available
  const backendGuidance = backendResults?.counterfactual_guidance || {};
  if (backendGuidance.skill_improvement) {
    counterfactuals.unshift({
      category: 'AI Insight',
      icon: '🤖',
      title: 'AI Skill Improvement Advice',
      current: 'Current skills',
      target: 'Optimal level',
      impact: 'High',
      suggestions: [backendGuidance.skill_improvement],
      ifThen: backendGuidance.z_score_improvement || 'Follow the AI recommendations to improve your chances.',
    });
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-600 border border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-600 border border-amber-200';
      case 'Low':
        return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
      </div>

      <style>{`
        .guide-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .guide-card-strong {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* Portal Button — fixed top-left */}
      <div ref={portalRef} style={{ position: 'fixed', top: 18, left: 18, zIndex: 100 }}>
        <button
          onClick={() => setPortalOpen(!portalOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            border: `2px solid ${portalOpen ? '#3b82f6' : 'rgba(148,163,184,0.4)'}`,
            background: portalOpen ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            color: portalOpen ? '#2563eb' : '#475569',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          Portal
        </button>
        {portalOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: 260,
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)',
            borderRadius: 16, border: '1px solid rgba(226,232,240,0.9)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden',
            animation: 'portalDropIn 0.2s ease-out',
          }}>
            <style>{`@keyframes portalDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(226,232,240,0.6)', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(249,115,22,0.04))' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>D</span>
                Navigation
              </p>
            </div>
            <div style={{ padding: '6px 0' }}>
              <button onClick={() => { setPortalOpen(false); onHome(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#475569', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
                </span>
                Home
              </button>
              {onViewProfile && (
                <button onClick={() => { setPortalOpen(false); onViewProfile(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#475569', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  My Profile
                </button>
              )}
              {onNavigateToDashboard && (
                <button onClick={() => { setPortalOpen(false); onNavigateToDashboard(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#475569', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </span>
                  Dashboard
                </button>
              )}
              <button onClick={() => { setPortalOpen(false); onBack(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#475569', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
                Back to Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header with language selector */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Results</span>
          </button>
          <div className="flex items-center space-x-2">
            {['en', 'si', 'ta'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  language === lang
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/60 text-slate-500 hover:bg-white/80 border border-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'si' ? 'SI' : 'TA'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-normal mb-2">
            <span className="text-slate-900">Improvement </span><span className="text-blue-600">Guidance</span>
          </h1>
          <p className="text-slate-500 text-lg">Personalized improvement recommendations based on your profile</p>
        </div>

        {/* Current Profile Summary */}
        <div className="guide-card-strong rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Current Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
              <p className="text-sm text-blue-500 mb-1">Dream Job</p>
              <p className="font-bold text-slate-800">{studentData.dreamJob || 'Not selected'}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
              <p className="text-sm text-orange-500 mb-1">Z-Score</p>
              <p className="font-bold text-slate-800">{studentData.academicResults.zScore || 'N/A'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
              <p className="text-sm text-blue-500 mb-1">District</p>
              <p className="font-bold text-slate-800">{studentData.personalInfo.district || 'Not specified'}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
              <p className="text-sm text-orange-500 mb-1">Location Preference</p>
              <p className="font-bold text-slate-800">{studentData.lifestylePreferences.locationPreference || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Counterfactual Guidance */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">If-Then Improvement Scenarios</h2>

          {counterfactuals.map((item, index) => (
            <div
              key={index}
              className="guide-card-strong rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getImpactColor(item.impact)}`}>
                      {item.impact} Impact
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Current: <span className="font-medium text-slate-700">{item.current}</span></p>
                  <p className="text-sm font-bold text-orange-500">Target: {item.target}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl mb-4 border border-blue-100">
                <p className="font-medium text-slate-700">
                  <span className="text-blue-600 font-bold">If-Then Scenario:</span> {item.ifThen}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Actionable Steps:</h4>
                <ul className="space-y-2">
                  {item.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Actions */}
        <div className="guide-card-strong rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Priority Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h3 className="font-bold text-red-600 mb-2">Immediate (Next 1-3 months)</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />Focus on academic improvements</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />Research district quota benefits</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />Explore alternative pathways</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <h3 className="font-bold text-orange-600 mb-2">Short-term (3-6 months)</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />Develop key personality traits</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />Complete bridging courses</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />Build professional network</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-600 mb-2">Medium-term (6-12 months)</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />Apply to multiple universities</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />Secure internships</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />Prepare for interviews</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <h3 className="font-bold text-purple-600 mb-2">Long-term (1+ years)</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />Excel in chosen program</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />Build specialized skills</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />Plan advanced education</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="guide-card rounded-2xl p-4 mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/80 text-slate-600 rounded-xl hover:bg-white transition-colors border border-slate-200 font-medium"
            >
              Back to Results
            </button>

            <button
              onClick={onHome}
              className="px-6 py-3 bg-white/80 text-slate-600 rounded-xl hover:bg-white transition-colors border border-slate-200 font-medium"
            >
              Back to Home
            </button>

            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl hover:from-blue-700 hover:to-orange-600 transition-colors shadow-lg shadow-blue-500/20 font-medium"
            >
              View Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

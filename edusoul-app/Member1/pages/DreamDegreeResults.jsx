import { useState, useMemo, lazy, Suspense } from 'react';

const UniversityMap = lazy(() => import('../components/UniversityMap'));

export default function DreamDegreeResults({ studentData, backendResults, backwardAnalysis, onBack, onHome, onViewRoadmap, onViewGuidance }) {
  const [language, setLanguage] = useState('en');
  const [expandedCard, setExpandedCard] = useState(0);
  const [activeTab, setActiveTab] = useState('degrees');
  const [preferredUnis, setPreferredUnis] = useState([]);
  const [showModelPanel, setShowModelPanel] = useState(false);

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

  // Toggle preferred university
  const togglePreferred = (uniName) => {
    setPreferredUnis(prev =>
      prev.includes(uniName) ? prev.filter(n => n !== uniName) : [...prev, uniName]
    );
  };

  // Filter results for preferred universities
  const preferredResults = useMemo(() => {
    if (preferredUnis.length === 0) return null;
    return allUnis.filter(u => preferredUnis.includes(u.name));
  }, [preferredUnis, allUnis]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-blue-400';
    if (score >= 0.4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getCutoffStatus = (cutoff) => {
    const diff = studentZScore - cutoff;
    if (diff >= 0.3) return { label: 'Safe', color: 'text-emerald-400 bg-emerald-500/20', icon: '✓' };
    if (diff >= 0) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/20', icon: '~' };
    if (diff >= -0.3) return { label: 'Competitive', color: 'text-orange-400 bg-orange-500/20', icon: '!' };
    return { label: 'Below Cutoff', color: 'text-red-400 bg-red-500/20', icon: '✗' };
  };

  // Render a university card (used in both university tab and preferred section)
  const renderUniCard = (uni, isGov, showPreferToggle = true) => {
    const isPref = preferredUnis.includes(uni.name);
    const borderColor = isGov ? 'border-emerald-500/20' : 'border-purple-500/20';
    const hoverBorder = isGov ? 'hover:border-emerald-400/40' : 'hover:border-purple-400/40';
    const accentColor = isGov ? 'emerald' : 'purple';
    const prefBorder = isPref ? `border-2 !border-amber-400/60 ring-1 ring-amber-400/20` : borderColor;

    return (
      <div key={uni.name} className={`bg-gradient-to-br from-${accentColor}-500/10 to-${accentColor}-800/5 rounded-2xl p-5 ${prefBorder} ${hoverBorder} transition-all relative`}>
        {/* Preferred Toggle */}
        {showPreferToggle && (
          <button
            onClick={() => togglePreferred(uni.name)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPref
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'
            }`}
            title={isPref ? 'Remove from preferred' : 'Add to preferred'}
          >
            <svg className="w-4 h-4" fill={isPref ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}

        <div className="flex justify-between items-start mb-3 pr-10">
          <div>
            <h3 className="text-lg font-bold text-white">{uni.name}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className={`text-${accentColor}-300/60 text-sm`}>{uni.location}</p>
              {uni.national_rank && (
                <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">#{uni.national_rank}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold text-${accentColor}-400`}>
              {uni.admission_probability ? `${(uni.admission_probability * 100).toFixed(0)}%` : 'N/A'}
            </div>
            <p className={`text-${accentColor}-300/50 text-xs`}>Admission</p>
          </div>
        </div>

        {/* Cutoff Marks vs Student Z-Score */}
        {uni.z_score_requirements && (
          <div className="mb-3">
            <p className="text-white/50 text-xs mb-2 font-medium uppercase tracking-wider">Cutoff Marks vs Your Z-Score ({studentZScore})</p>
            <div className="space-y-1.5">
              {Object.entries(uni.z_score_requirements).map(([deg, cutoff]) => {
                const status = getCutoffStatus(cutoff);
                return (
                  <div key={deg} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                    <span className="text-xs text-white/70 flex-1">{deg}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-white/50">Cutoff: {cutoff}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Degrees */}
        {uni.available_degrees && (
          <div className="mb-3">
            <p className="text-white/50 text-xs mb-1.5">Available Programs</p>
            <div className="flex flex-wrap gap-1.5">
              {uni.available_degrees.map((deg, i) => (
                <span key={i} className={`text-xs bg-${accentColor}-500/15 text-${accentColor}-300 px-2 py-0.5 rounded-full border border-${accentColor}-500/20`}>
                  {deg}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tuition Fees (private only) */}
        {!isGov && uni.tuition_fee_range && typeof uni.tuition_fee_range === 'object' && Object.keys(uni.tuition_fee_range).length > 0 && (
          <div className="mb-3">
            <p className="text-white/50 text-xs mb-1.5">Tuition Fees (LKR/Year)</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(uni.tuition_fee_range).map(([deg, fee]) => (
                <span key={deg} className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-lg border border-white/10">
                  {deg}: <span className="font-bold text-purple-300">{fee}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Facilities & Accreditation */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {uni.facilities?.slice(0, 4).map((fac, i) => (
            <span key={i} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{fac}</span>
          ))}
          {uni.accreditation?.map((acc, i) => (
            <span key={`acc-${i}`} className="text-xs text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{acc}</span>
          ))}
        </div>

        {/* Explanation */}
        {uni.explanation && (
          <p className="text-white/40 text-xs mt-3 italic">{uni.explanation}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowModelPanel(!showModelPanel)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>How AI Works</span>
            </button>
            <div className="flex items-center space-x-1">
              {['en', 'si', 'ta'].map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${language === lang ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Model Transparency Panel (collapsible) */}
        {showModelPanel && modelInfo && (
          <div className="mb-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl border border-cyan-500/20 p-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Model Transparency</span>
              </h2>
              <button onClick={() => setShowModelPanel(false)} className="text-white/40 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Method */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-cyan-300 font-semibold text-sm uppercase tracking-wider mb-2">Prediction Model</h3>
                  <p className="text-white font-bold text-lg mb-1">{modelInfo.method_label || method}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{modelInfo.description}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-cyan-300 font-semibold text-sm uppercase tracking-wider mb-2">Confidence Score</h3>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className={`text-4xl font-bold ${getScoreColor(modelInfo.confidence_score || 0)}`}>
                      {modelInfo.confidence_score ? `${(modelInfo.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getScoreBg(modelInfo.confidence_score || 0)}`}
                          style={{ width: `${(modelInfo.confidence_score || 0) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">{modelInfo.accuracy_note}</p>
                </div>
              </div>

              {/* Factors Used */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-cyan-300 font-semibold text-sm uppercase tracking-wider mb-3">Input Factors Analyzed</h3>
                  <div className="space-y-1.5">
                    {(modelInfo.factors_used || []).map((factor, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span className="text-white/70">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-cyan-300 font-semibold text-sm uppercase tracking-wider mb-2">Database Coverage</h3>
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-3xl font-bold text-white">{modelInfo.universities_analyzed || 0}</p>
                      <p className="text-white/50 text-xs">Matched</p>
                    </div>
                    <div className="text-white/30 text-2xl">/</div>
                    <div>
                      <p className="text-3xl font-bold text-white">{modelInfo.total_university_database || 44}</p>
                      <p className="text-white/50 text-xs">Total Universities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>AI Model: {modelInfo.method_label || method}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Your AI-Powered Results</h1>
          <p className="text-blue-200/60 text-lg max-w-2xl mx-auto">
            Personalized degree and university recommendations for <span className="text-blue-300 font-semibold">{studentData.dreamJob}</span>
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-4 border border-blue-500/20 text-center">
            <p className="text-blue-300/70 text-xs uppercase tracking-wider mb-1">Best Degree</p>
            <p className="text-xl font-bold text-white">{bestDegree}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-4 border border-emerald-500/20 text-center">
            <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1">Confidence</p>
            <p className="text-xl font-bold text-white">
              {recommendations[0]?.probability ? `${(recommendations[0].probability * 100).toFixed(0)}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-4 border border-purple-500/20 text-center">
            <p className="text-purple-300/70 text-xs uppercase tracking-wider mb-1">Your Z-Score</p>
            <p className="text-xl font-bold text-white">{studentZScore || 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-2xl p-4 border border-amber-500/20 text-center">
            <p className="text-amber-300/70 text-xs uppercase tracking-wider mb-1">Universities</p>
            <p className="text-xl font-bold text-white">{governmentUnis.length + privateUnis.length}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-2xl p-4 border border-cyan-500/20 text-center">
            <p className="text-cyan-300/70 text-xs uppercase tracking-wider mb-1">Preferred</p>
            <p className="text-xl font-bold text-white">{preferredUnis.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/5 rounded-xl p-1 mb-8 border border-white/10">
          {[
            { id: 'degrees', label: 'Degree Predictions', icon: '🎓' },
            { id: 'universities', label: 'Universities & Cutoffs', icon: '🏛️' },
            { id: 'map', label: 'Map View', icon: '🗺️' },
            { id: 'preferred', label: `Preferred (${preferredUnis.length})`, icon: '⭐' },
            { id: 'analysis', label: 'Career Analysis', icon: '🔬' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ===== DEGREE PREDICTIONS TAB ===== */}
        {activeTab === 'degrees' && (
          <div className="space-y-6">
            {recommendations.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
                <p className="text-amber-300 font-medium text-lg">No degree predictions returned from the model.</p>
                <p className="text-amber-200/60 mt-2">Try adjusting your profile or Z-Score.</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                  {/* Card Header */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{rec.degree}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-blue-300/80 text-sm">{rec.university || 'Best match university'}</span>
                          {rec.universityType && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              rec.universityType === 'Government' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>{rec.universityType}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(rec.probability || rec.overall_score)}`}>
                          {((rec.probability || rec.overall_score || 0) * 100).toFixed(0)}%
                        </div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Confidence</p>
                      </div>
                      {rec.admissionProbability && (
                        <div className="text-center px-4 py-2 rounded-xl border bg-blue-500/20 border-blue-500/30">
                          <div className="text-xl font-bold text-blue-400">{rec.admissionProbability}</div>
                          <p className="text-xs text-blue-300/60">Admission</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Breakdown Bars */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'skill_match', label: 'Skill Match', colors: 'from-blue-500 to-cyan-400' },
                        { key: 'personality_match', label: 'Personality', colors: 'from-purple-500 to-pink-400' },
                        { key: 'academic_feasibility', label: 'Academic Fit', colors: 'from-emerald-500 to-teal-400', single: 'z_score_feasibility' },
                        { key: 'lifestyle_compatibility', label: 'Lifestyle', colors: 'from-amber-500 to-orange-400' },
                      ].map(({ key, label, colors, single }) => {
                        const data = rec[key];
                        if (!data) return null;
                        const pct = single
                          ? data[single] * 100
                          : Object.values(data).reduce((a, b) => a + b, 0) / Object.values(data).length * 100;
                        return (
                          <div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-white/50 text-xs">{label}</span>
                              <span className="text-white/70 text-xs font-medium">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${colors} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="border-t border-white/10">
                    <button onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      className="w-full px-6 py-3 flex items-center justify-between text-white/60 hover:text-white hover:bg-white/5 transition-all">
                      <span className="text-sm font-medium">{expandedCard === index ? 'Hide Details' : 'View Detailed Analysis'}</span>
                      <svg className={`w-5 h-5 transition-transform ${expandedCard === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedCard === index && (
                      <div className="px-6 pb-6 space-y-6">
                        {rec.explanation && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                            <h4 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>AI Explanation (XAI)</span>
                            </h4>
                            <p className="text-blue-100/80 leading-relaxed">{rec.explanation}</p>
                          </div>
                        )}

                        {/* Academic Feasibility Detail */}
                        {rec.academic_feasibility && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-3">Academic Feasibility Breakdown</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-white/50 text-xs mb-1">Z-Score Fit</p>
                                <p className={`text-xl font-bold ${getScoreColor(rec.academic_feasibility.z_score_feasibility)}`}>
                                  {(rec.academic_feasibility.z_score_feasibility * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-white/50 text-xs mb-1">District Adj.</p>
                                <p className="text-xl font-bold text-blue-400">
                                  {(rec.academic_feasibility.district_adjustment * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-white/50 text-xs mb-1">Z-Score Gap</p>
                                <p className={`text-xl font-bold ${rec.academic_feasibility.threshold_gap <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {rec.academic_feasibility.threshold_gap <= 0 ? '+' : '-'}{Math.abs(rec.academic_feasibility.threshold_gap).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Skill Match Breakdown */}
                        {rec.skill_match && (
                          <div>
                            <h4 className="text-white font-semibold mb-3">Skill Match Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(rec.skill_match).map(([skill, score]) => (
                                <div key={skill} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                  <p className="text-white/60 text-xs capitalize mb-1">{skill.replace(/_/g, ' ')}</p>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${getScoreBg(score)}`} style={{ width: `${score * 100}%` }} />
                                    </div>
                                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{(score * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Career Roadmap Preview */}
                        {rec.roadmap && rec.roadmap.length > 0 && (
                          <div>
                            <h4 className="text-white font-semibold mb-3">Career Roadmap Preview</h4>
                            <div className="space-y-2">
                              {rec.roadmap.map((step, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <p className="text-white/70 text-sm">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button onClick={() => onViewRoadmap(rec)}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20">
                            View Full Roadmap
                          </button>
                          <button onClick={onViewGuidance}
                            className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20">
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

        {/* ===== UNIVERSITIES & CUTOFFS TAB ===== */}
        {activeTab === 'universities' && (
          <div className="space-y-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
              <p className="text-white/70 text-sm">
                Click the <span className="text-amber-400">star</span> icon on any university to add it to your <span className="text-amber-400 font-medium">Preferred</span> list.
                Your Z-Score (<span className="text-white font-bold">{studentZScore}</span>) is compared against each program's cutoff mark.
              </p>
            </div>

            {governmentUnis.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <h2 className="text-xl font-bold text-white">Government Universities</h2>
                  <span className="text-emerald-400/70 text-sm">({governmentUnis.length} matches)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {governmentUnis.map((uni) => renderUniCard(uni, true))}
                </div>
              </div>
            )}

            {privateUnis.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-purple-400 rounded-full" />
                  <h2 className="text-xl font-bold text-white">Private Universities</h2>
                  <span className="text-purple-400/70 text-sm">({privateUnis.length} matches)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {privateUnis.map((uni) => renderUniCard(uni, false))}
                </div>
              </div>
            )}

            {governmentUnis.length === 0 && privateUnis.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/60 text-lg">No university matches found for your profile.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== MAP VIEW TAB ===== */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </span>
                University Locations
              </h2>
              <span className="text-white/40 text-sm">{allUnis.length} universities recommended</span>
            </div>
            <Suspense fallback={
              <div className="flex items-center justify-center h-96 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Loading map...</p>
                </div>
              </div>
            }>
              <UniversityMap universities={allUnis} preferredUnis={preferredUnis} />
            </Suspense>
          </div>
        )}

        {/* ===== PREFERRED UNIVERSITIES TAB ===== */}
        {activeTab === 'preferred' && (
          <div className="space-y-6">
            {preferredUnis.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Preferred Universities Selected</h3>
                <p className="text-white/50 mb-4">Go to the "Universities & Cutoffs" tab and click the star icon on universities you're interested in.</p>
                <button onClick={() => setActiveTab('universities')}
                  className="px-6 py-3 bg-amber-500/20 text-amber-300 rounded-xl font-medium border border-amber-500/30 hover:bg-amber-500/30 transition-all">
                  Browse Universities
                </button>
              </div>
            ) : (
              <>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <h2 className="text-lg font-bold text-white mb-1">Your Preferred Universities ({preferredUnis.length})</h2>
                  <p className="text-amber-200/60 text-sm">Detailed comparison of your selected universities with cutoff marks and admission analysis.</p>
                </div>

                {/* Comparison Summary Table */}
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6 overflow-x-auto">
                  <h3 className="text-white font-bold mb-4">Quick Comparison</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/50 pb-3 font-medium">University</th>
                        <th className="text-center text-white/50 pb-3 font-medium">Type</th>
                        <th className="text-center text-white/50 pb-3 font-medium">Admission %</th>
                        <th className="text-center text-white/50 pb-3 font-medium">Cutoff ({bestDegree})</th>
                        <th className="text-center text-white/50 pb-3 font-medium">Your Z-Score</th>
                        <th className="text-center text-white/50 pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {preferredResults?.map((uni) => {
                        const cutoff = uni.z_score_requirements?.[bestDegree] || uni.z_score_requirement || 'N/A';
                        const status = typeof cutoff === 'number' ? getCutoffStatus(cutoff) : { label: 'N/A', color: 'text-white/40 bg-white/10', icon: '-' };
                        return (
                          <tr key={uni.name} className="hover:bg-white/5">
                            <td className="py-3 text-white font-medium">{uni.name}</td>
                            <td className="py-3 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${uni.type === 'Government' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                {uni.type}
                              </span>
                            </td>
                            <td className="py-3 text-center text-white font-bold">
                              {uni.admission_probability ? `${(uni.admission_probability * 100).toFixed(0)}%` : 'N/A'}
                            </td>
                            <td className="py-3 text-center font-mono text-white/70">{cutoff}</td>
                            <td className="py-3 text-center font-mono text-white font-bold">{studentZScore}</td>
                            <td className="py-3 text-center">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>{status.icon} {status.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Detailed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preferredResults?.map((uni) => renderUniCard(uni, uni.type === 'Government', true))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== CAREER ANALYSIS TAB ===== */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {backwardData && Object.keys(backwardData).length > 0 && (
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  <span>Career Backward Analysis: {studentData.dreamJob}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backwardData.key_skills && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-blue-300 font-semibold mb-3 text-sm uppercase tracking-wider">Key Skills Required</h3>
                      <div className="space-y-2">
                        {(Array.isArray(backwardData.key_skills) ? backwardData.key_skills : [backwardData.key_skills]).map((skill, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span className="text-white/80 text-sm">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {backwardData.required_education && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-emerald-300 font-semibold mb-3 text-sm uppercase tracking-wider">Required Education</h3>
                      <p className="text-white/80 text-sm">{typeof backwardData.required_education === 'string' ? backwardData.required_education : JSON.stringify(backwardData.required_education)}</p>
                    </div>
                  )}
                  {backwardData.career_path && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
                      <h3 className="text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">Career Path</h3>
                      <p className="text-white/80 text-sm">{backwardData.career_path}</p>
                    </div>
                  )}
                  {backwardData.industries && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-amber-300 font-semibold mb-3 text-sm uppercase tracking-wider">Industries</h3>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(backwardData.industries) ? backwardData.industries : [backwardData.industries]).map((ind, i) => (
                          <span key={i} className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">{ind}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {backwardData.salary_range && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-emerald-300 font-semibold mb-3 text-sm uppercase tracking-wider">Salary Range</h3>
                      <p className="text-white/80 text-sm">{backwardData.salary_range}</p>
                    </div>
                  )}
                  {backwardData.timeline && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
                      <h3 className="text-cyan-300 font-semibold mb-3 text-sm uppercase tracking-wider">Timeline</h3>
                      <p className="text-white/80 text-sm">{backwardData.timeline}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {counterfactualGuidance && Object.keys(counterfactualGuidance).length > 0 && (
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-800/5 rounded-2xl border border-amber-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">💡</span>
                  <span>AI Improvement Guidance</span>
                </h2>
                <div className="space-y-4">
                  {Object.entries(counterfactualGuidance).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-amber-300 font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</h3>
                      <p className="text-white/70">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Profile Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-1">Dream Job</p>
                  <p className="text-xl font-bold text-white">{studentData.dreamJob}</p>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <p className="text-purple-300/60 text-xs uppercase tracking-wider mb-1">Stream</p>
                  <p className="text-xl font-bold text-white">{studentData.academicResults?.stream || 'N/A'}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-emerald-300/60 text-xs uppercase tracking-wider mb-1">District</p>
                  <p className="text-xl font-bold text-white">{studentData.personalInfo?.district || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-white/10">
          <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium">
            Back to Input
          </button>
          <button onClick={onHome} className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium">
            Back to Home
          </button>
          <button onClick={onViewGuidance} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 font-medium">
            View Improvement Guidance
          </button>
        </div>
      </div>
    </div>
  );
}

import { ScoreEvidence } from '../components/RecommendationEvidence';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { useState, useMemo, lazy, Suspense } from 'react';

const UniversityMap = lazy(() => import('../components/UniversityMap'));

import AdvisorHeader from '../components/AdvisorHeader';
import UniversityDistance from '../components/UniversityDistance';
import DegreeUniversityOptions from '../components/DegreeUniversityOptions';
import TrainedModelRecommendation from '../components/TrainedModelRecommendation';
import FutureCareerPath from '../components/FutureCareerPath';
import { resolveUniversityCoordinates } from '../data/universityDistances';
import { degreeUniversitySummary, partitionUniversities, universityStatus, universityStatusLabels, recommendationMapTarget } from '../data/universityPresentation';
import './AdvisorWorkspace.css';

export default function DreamDegreeResults({ studentData, backendResults, backwardAnalysis, onBack, onHome, onViewRoadmap, onViewGuidance, onViewProfile, onNavigateToDashboard }) {
  const tr = useAdvisorTranslation();
  const [expandedCard, setExpandedCard] = useState(0);
  const [activeTab, setActiveTab] = useState('degrees');
  const [preferredUnis, setPreferredUnis] = useState([]);
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [universityDegree, setUniversityDegree] = useState(null);
  const [mapUniversity, setMapUniversity] = useState(null);
  const recommendations = backendResults?.recommendations || [];
  const selectedDegreeRecommendation = recommendations.find(rec => rec.degree === universityDegree) || recommendations[0];
  const universityRecs = selectedDegreeRecommendation?.university_options || { government: [], private: [] };
  const bestDegree = backendResults?.best_degree || 'N/A';
  const method = backendResults?.method || 'unknown';
  const modelInfo = backendResults?.model_info || {};
  const counterfactualGuidance = backendResults?.counterfactual_guidance || {};
  const backwardData = backwardAnalysis?.backward_analysis || {};
  const studentZScore = parseFloat(studentData.academicResults?.zScore) || 0;
  const selectedDistrict = studentData.personalInfo?.district || studentData.district || backendResults?.validation?.district;

  const governmentUnis = universityRecs.government || [];
  const privateUnis = universityRecs.private || [];
  const governmentGroups = partitionUniversities(governmentUnis);
  const mapTarget = recommendationMapTarget(recommendations, backendResults?.trained_model_recommendation, universityDegree, mapUniversity);
  const allRecommendedUnis = [...(backendResults?.university_recommendations?.government || []).map(uni => ({ ...uni, type: 'Government' })), ...(backendResults?.university_recommendations?.private || []).map(uni => ({ ...uni, type: 'Private' }))];

  const togglePreferred = (uniName) => {
    setPreferredUnis(prev => prev.includes(uniName) ? prev.filter(n => n !== uniName) : [...prev, uniName]);
  };

  const preferredResults = useMemo(() => {
    if (preferredUnis.length === 0) return null;
    return allRecommendedUnis.filter(u => preferredUnis.includes(u.name));
  }, [preferredUnis, allRecommendedUnis]);

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
    if (diff >= 0.3) return { label: 'Above reference', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '✓' };
    if (diff >= 0) return { label: 'Meets reference', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: '~' };
    if (diff >= -0.3) return { label: 'Near reference', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '!' };
    return { label: 'Below reference', color: 'text-red-700 bg-red-50 border-red-200', icon: '✗' };
  };

  /* ── University Card ── */
  const renderUniCard = (uni, isGov, showPreferToggle = true) => {
    const isPref = preferredUnis.includes(uni.name);
    const accent = isGov ? 'emerald' : 'purple';
    const status = universityStatus(uni);
    const statusColor = status === 'meets_reference' ? 'bg-emerald-50 text-emerald-800' : status === 'verification_required' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-900';

    return (
      <div key={uni.name} data-testid="university-recommendation-card" data-university={uni.name} className={`res-card rounded-2xl p-5 transition-all hover:shadow-lg relative ${isPref ? 'ring-2 ring-amber-400/60' : ''}`}>
        {tr(showPreferToggle && (
          <button onClick={() => togglePreferred(uni.name)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPref ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
            title={isPref ? 'Remove from preferred' : 'Add to preferred'}>
            <svg className="w-4 h-4" fill={isPref ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}

        <div className="flex justify-between items-start mb-3 pr-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr(uni.name)}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-gray-500 text-sm">{tr(uni.location)}</p>
              {tr(uni.national_rank && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">#{tr(uni.national_rank)}</span>)}
            </div>
          </div>
        </div>

        <p className={`rounded-lg px-3 py-2 text-xs font-semibold mb-3 ${statusColor}`}>{tr(universityStatusLabels[status])}{uni.degree && <> · {tr(uni.degree)}</>}</p>

        <UniversityDistance university={uni} studentDistrict={selectedDistrict} />

        {tr(uni.z_score_requirements && Object.keys(uni.z_score_requirements).length > 0 && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">{tr("Cutoff vs Your Z-Score (")}{tr(studentZScore)})</p>
            <p className="text-xs text-slate-600 mb-2">{tr('Stored cutoffs are not district-specific. Check current requirements with the institution.')}</p>
            <div className="space-y-1.5">
              {tr(Object.entries(uni.z_score_requirements).map(([deg, cutoff]) => {
                const status = getCutoffStatus(cutoff);
                return (
                  <div key={deg} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                    <span className="text-xs text-gray-700 flex-1">{tr(deg)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-gray-500">{tr("Cutoff:")}{tr(cutoff)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${status.color}`}>{tr(status.icon)} {tr(status.label)}</span>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        ))}

        {tr(uni.available_degrees && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1.5 font-semibold">{tr('Matched degree pathways')}</p>
            <div className="flex flex-wrap gap-1.5">
              {tr(uni.available_degrees.map((deg, i) => (
                <span key={i} className={`text-xs bg-${accent}-50 text-${accent}-700 px-2 py-0.5 rounded-full border border-${accent}-200`}>{tr(deg)}</span>
              )))}
            </div>
          </div>
        ))}

        {tr(!isGov && uni.tuition_fee_range && typeof uni.tuition_fee_range === 'object' && Object.keys(uni.tuition_fee_range).length > 0 && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1.5 font-semibold">{tr("Tuition Fees (LKR/Year)")}</p>
            <div className="flex flex-wrap gap-1.5">
              {tr(Object.entries(uni.tuition_fee_range).map(([deg, fee]) => (
                <span key={deg} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-100">
                  {tr(deg)}: <span className="font-bold text-purple-600">{tr(fee)}</span>
                </span>
              )))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {tr(uni.facilities?.slice(0, 4).map((fac, i) => (
            <span key={i} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{tr(fac)}</span>
          )))}
          {tr(uni.accreditation?.map((acc, i) => (
            <span key={`acc-${i}`} className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{tr(acc)}</span>
          )))}
        </div>

        {tr(uni.explanation && <p className="text-gray-400 text-xs mt-3 italic">{tr(uni.explanation)}</p>)}
        {uni.website?.startsWith('https://') && <a className="inline-block text-sm underline text-blue-800 mt-3" href={uni.website} target="_blank" rel="noopener noreferrer">{tr('Official website')} ↗</a>}
        {resolveUniversityCoordinates(uni) && <button className="block text-sm font-semibold underline text-blue-800 mt-3" onClick={() => { setUniversityDegree(uni.degree || selectedDegreeRecommendation?.degree); setMapUniversity(uni.name); setActiveTab('map'); }}>{tr('View on map')} →</button>}
      </div>
    );
  };

  return (
    <div className="advisor-workspace advisor-results">
      <AdvisorHeader onHome={onHome} onViewProfile={onViewProfile} onNavigateToDashboard={onNavigateToDashboard} />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors res-card rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-medium">{tr("Back")}</span>
            </button>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowModelPanel(!showModelPanel)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <span>{tr("How AI Works")}</span>
              </button>

            </div>
          </div>

          {/* Model Transparency Panel */}
          {tr(showModelPanel && modelInfo && (
            <div className="mb-8 res-card-strong rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </span>
                  <span>{tr("AI Model Transparency")}</span>
                </h2>
                <button onClick={() => setShowModelPanel(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                    <h3 className="text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2">{tr("Prediction Model")}</h3>
                    <p className="text-gray-900 font-bold text-lg mb-1">{tr(modelInfo.method_label || method)}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{tr(modelInfo.description)}</p>
                  </div>
                  <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                    <h3 className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-2">{tr("Model probability")}</h3>
                    <div className="flex items-center space-x-4 mb-2">
                      <div className={`text-4xl font-bold ${getScoreColor(modelInfo.top_probability || 0)}`}>
                        {tr(modelInfo.top_probability ? `${(modelInfo.top_probability * 100).toFixed(1)}%` : 'N/A')}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(modelInfo.top_probability || 0)}`} style={{ width: `${(modelInfo.top_probability || 0) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">{tr(modelInfo.accuracy_note)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                    <h3 className="text-orange-600 font-semibold text-xs uppercase tracking-wider mb-3">{tr("Input Factors Analyzed")}</h3>
                    <div className="space-y-1.5">
                      {tr((modelInfo.factors_used || []).map((factor, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                          <span className="text-gray-700">{tr(factor)}</span>
                        </div>
                      )))}
                    </div>
                  </div>
                  <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100">
                    <h3 className="text-purple-600 font-semibold text-xs uppercase tracking-wider mb-2">{tr("Database Coverage")}</h3>
                    <div className="flex items-center space-x-6">
                      <div><p className="text-3xl font-bold text-gray-900">{tr(modelInfo.universities_analyzed || 0)}</p><p className="text-gray-400 text-xs">{tr("Matched")}</p></div>
                      <div className="text-gray-300 text-2xl font-light">/</div>
                      <div><p className="text-3xl font-bold text-gray-900">{tr(modelInfo.total_university_database ?? 'N/A')}</p><p className="text-gray-400 text-xs">{tr("Total Universities")}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Hero Header */}
          <div className="mb-8">
            {/* <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>AI Model: {modelInfo.method_label || method}</span>
            </div> */}
            <p className="advisor-eyebrow">{tr('YOUR DEGREE & CAREER PLAN')}</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{tr('Your options, explained.')}</h1>
            <p className="text-slate-600 text-sm max-w-2xl font-normal">{tr("Personalized degree and university recommendations for")} <span className="text-blue-600">{tr(studentData.dreamJob)}</span>
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {tr([
              { label: backendResults?.best_direct_degree ? 'Goal-aligned degree' : 'Exploratory degree', value: bestDegree, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
              { label: 'Suitability', value: recommendations[0]?.probability ? `${(recommendations[0].probability * 100).toFixed(0)}%` : 'N/A', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
              { label: 'Your Z-Score', value: studentZScore, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
              { label: 'Universities', value: governmentUnis.length + privateUnis.length, gradient: 'from-amber-500 to-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
              { label: 'Preferred', value: preferredUnis.length, gradient: 'from-blue-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
            ].map((m, i) => (
              <div key={i} className={`res-card-strong rounded-2xl p-4 text-center border ${m.border}`}>
                <p className={`text-xs uppercase tracking-wider mb-1 font-semibold ${m.text}`}>{tr(m.label)}</p>
                <p className="text-xl font-bold text-gray-900">{tr(m.value)}</p>
              </div>
            )))}
          </div>

          {/* Tab Navigation */}
          <div className="res-tabs flex space-x-1 res-card rounded-2xl p-1.5 mb-8">
            {tr([
              { id: 'degrees', label: 'Degree Predictions', icon: '🎓' },
              { id: 'universities', label: 'Universities & Cutoffs', icon: '🏛️' },
              { id: 'map', label: 'Map View', icon: '🗺️' },
              { id: 'preferred', label: `${tr("Preferred")} (${preferredUnis.length})`, icon: '⭐' },
              { id: 'analysis', label: 'Career Analysis', icon: '🔬' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}>
                {tr(tab.label)}
              </button>
            )))}
          </div>

          {activeTab === 'universities' && <div className="res-card rounded-xl p-4 mb-5">
            <label className="block text-sm font-semibold text-slate-700">{tr('Filter universities by degree')}
              <select value={selectedDegreeRecommendation?.degree || ''} onChange={event => { setUniversityDegree(event.target.value); setMapUniversity(null); }} className="block w-full mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                {recommendations.map(rec => <option key={rec.degree} value={rec.degree}>{tr(rec.degree)}</option>)}
              </select>
            </label>
            <p className="text-xs text-slate-600 mt-2">{tr('University matches depend on the selected degree pathway. Admission requirements must be checked separately.')}</p>
          </div>}

          {/* ===== DEGREE PREDICTIONS ===== */}
          {tr(activeTab === 'degrees' && (
            <div className="space-y-6">
              <TrainedModelRecommendation prediction={backendResults?.trained_model_recommendation}
                onViewUniversities={degree => { setUniversityDegree(degree); setActiveTab('universities'); }}
                onViewMap={(degree, name) => { setUniversityDegree(degree); setMapUniversity(name); setActiveTab('map'); }} />
              {tr(recommendations.length === 0 ? (
                <div className="res-card-strong rounded-2xl p-8 text-center border border-amber-200 bg-amber-50/50">
                  <p className="text-amber-700 font-semibold text-lg">{tr(backendResults.goal_status === 'vocational_route' ? 'A vocational qualification route is recommended.' : 'No supported degree route is available for this profile.')}</p>
                  <p className="text-amber-600/60 mt-2">{tr(backendResults.goal_status === 'vocational_route' ? 'Review the qualification route and action plan above.' : 'Try adjusting your profile or Z-Score.')}</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <div key={index} className={`res-card-strong advisor-degree-card advisor-degree-tone-${index % 4} rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100`}>
                    {/* Card Header */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-sm">
                          #{tr(index + 1)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{tr(rec.degree)}</h3>
                          {rec.goal_relation && <span className="inline-block mt-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 px-2 py-1">{tr({ direct: 'Direct career pathway', related: 'Related career pathway', alternative: 'Alternative study pathway' }[rec.goal_relation] || rec.goal_relation)}</span>}
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-gray-600 text-sm">{tr(degreeUniversitySummary(rec))}</span>
                            {tr(rec.universityType && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${rec.universityType === 'Government' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{tr(rec.universityType)}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(rec.probability || rec.overall_score)}`}>
                            {tr(((rec.probability || rec.overall_score || 0) * 100).toFixed(0))}%
                          </div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{tr("Suitability")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Match Breakdown Bars */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tr([
                          { key: 'skill_match', label: 'Skill Match', colors: 'from-blue-400 to-blue-500' },
                          { key: 'personality_match', label: 'Personality', colors: 'from-purple-400 to-purple-500' },
                          { key: 'academic_feasibility', label: 'Academic Fit', colors: 'from-emerald-400 to-emerald-500', single: 'z_score_feasibility' },
                          { key: 'lifestyle_compatibility', label: 'Lifestyle', colors: 'from-orange-400 to-orange-500' },
                        ].map(({ key, label, colors, single }) => {
                          const data = rec[key];
                          if (!data) return null;
                          const values = Object.values(data).filter(Number.isFinite);
                          const value = single ? data[single] : values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
                          const pct = Number.isFinite(value) ? value * 100 : null;
                          return (
                            <div key={key}>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-xs font-medium">{tr(label)}</span>
                                <span className="text-gray-700 text-xs font-bold">{pct == null ? tr('Not assessed') : `${pct.toFixed(0)}%`}</span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${colors} rounded-full transition-all duration-1000`} style={{ width: `${pct ?? 0}%` }} />
                              </div>
                            </div>
                          );
                        }))}
                      </div>
                    </div>

                    <DegreeUniversityOptions
                      recommendation={rec}
                      studentDistrict={selectedDistrict}
                      onViewUniversities={() => { setUniversityDegree(rec.degree); setActiveTab('universities'); }}
                      onViewMap={universityName => { setUniversityDegree(rec.degree); setMapUniversity(universityName); setActiveTab('map'); }}
                    />

                    {/* Expandable Details */}
                    <div className="border-t border-gray-100">
                      <button onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                        className="w-full px-6 py-3 flex items-center justify-between text-gray-500 hover:text-blue-600 hover:bg-blue-50/40 transition-all">
                        <span className="text-sm font-semibold">{tr(expandedCard === index ? 'Hide Details' : 'View Detailed Analysis')}</span>
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedCard === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {tr(expandedCard === index && (
                        <div className="px-6 pb-6 space-y-5">
                          <ScoreEvidence recommendation={rec} />
                          {tr(rec.explanation && (
                            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5">
                              <h4 className="text-blue-700 font-semibold mb-2 flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{tr("AI Explanation (XAI)")}</span>
                              </h4>
                              <p className="text-gray-700 leading-relaxed">{tr(rec.explanation)}</p>
                            </div>
                          ))}

                          {tr(rec.academic_feasibility && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <h4 className="text-gray-900 font-semibold mb-3">{tr("Academic Feasibility Breakdown")}</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">{tr("Z-Score Fit")}</p>
                                  <p className={`text-xl font-bold ${getScoreColor(rec.academic_feasibility.z_score_feasibility)}`}>{Number.isFinite(rec.academic_feasibility.z_score_feasibility) ? `${Math.round(rec.academic_feasibility.z_score_feasibility * 100)}%` : tr('Not assessed')}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">{tr("District Adj.")}</p>
                                  <p className="text-xl font-bold text-blue-600">{Number.isFinite(rec.academic_feasibility.district_adjustment) ? `${Math.round(rec.academic_feasibility.district_adjustment * 100)}%` : tr('Not assessed')}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs mb-1">{tr("Z-Score Gap")}</p>
                                  <p className={`text-xl font-bold ${rec.academic_feasibility.threshold_gap <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {Number.isFinite(rec.academic_feasibility.threshold_gap) ? rec.academic_feasibility.threshold_gap.toFixed(2) : tr('Not assessed')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {tr(rec.skill_match && (
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3">{tr("Skill Match Breakdown")}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {tr(Object.entries(rec.skill_match).map(([skill, score]) => (
                                  <div key={skill} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-gray-500 text-xs capitalize mb-1">{tr(skill.replace(/_/g, ' '))}</p>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(score)}`} style={{ width: `${score * 100}%` }} />
                                      </div>
                                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>{tr((score * 100).toFixed(0))}%</span>
                                    </div>
                                  </div>
                                )))}
                              </div>
                            </div>
                          ))}

                          {tr(rec.roadmap && rec.roadmap.length > 0 && (
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3">{tr("Future Roadmap Preview")}</h4>
                              <div className="space-y-2">
                                {tr(rec.roadmap.map((step, idx) => (
                                  <div key={idx} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{tr(idx + 1)}</div>
                                    <p className="text-gray-600 text-sm">{tr(step)}</p>
                                  </div>
                                )))}
                              </div>
                            </div>
                          ))}

                          <div className="flex space-x-3 pt-2">
                            <button onClick={() => onViewRoadmap(rec)}
                              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">{tr("Future Goal Roadmap")}</button>
                            <button onClick={onViewGuidance}
                              className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all">{tr("Improvement Guidance")}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ))}
            </div>
          ))}

          {/* ===== UNIVERSITIES & CUTOFFS ===== */}
          {tr(activeTab === 'universities' && (
            <div className="space-y-8">
              <div className="res-card rounded-xl p-4 border border-blue-100">
                {selectedDegreeRecommendation && <><h2 className="text-lg font-semibold text-slate-900">{tr('University options')} · {tr(selectedDegreeRecommendation.degree)}</h2><p className="text-sm text-slate-700 mt-2 mb-3">{tr(degreeUniversitySummary(selectedDegreeRecommendation))}</p></>}
                <p className="text-gray-600 text-sm">{tr('Save universities using the star. Stored cutoff comparisons apply only to central admission references; private and independent entry requirements need institution verification.')}</p>
              </div>

              {tr(governmentUnis.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">{tr("Government Universities")}</h2>
                    <span className="text-slate-600 text-sm font-medium">({governmentUnis.length} {tr('institutions listed')})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {governmentGroups.options.map(uni => renderUniCard(uni, true))}
                  </div>
                  {governmentGroups.gaps.length > 0 && <details className="mt-4 rounded-xl border border-amber-200 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-amber-900">{tr('Universities with entry gaps')} ({governmentGroups.gaps.length})</summary>
                    <p className="text-xs text-slate-600 mt-2">{tr('These options are below a stored cutoff or have unmet subject requirements. Review the gaps before applying.')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">{governmentGroups.gaps.map(uni => renderUniCard(uni, true))}</div>
                  </details>}
                </div>
              ))}

              {tr(privateUnis.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">{tr("Private Universities")}</h2>
                    <span className="text-slate-600 text-sm font-medium">({privateUnis.length} {tr('institutions listed')})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {privateUnis.map(uni => renderUniCard(uni, false))}
                  </div>
                </div>
              ))}

              {tr(governmentUnis.length === 0 && privateUnis.length === 0 && (
                <div className="res-card-strong rounded-2xl p-8 text-center"><p className="text-gray-500 text-lg">{tr("No university matches found for your profile.")}</p></div>
              ))}
            </div>
          ))}


          {/* ===== MAP VIEW ===== */}
          {tr(activeTab === 'map' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{tr('Recommended university route')}{mapTarget.degree && <> · {tr(mapTarget.degree)}</>}</h2>
              <Suspense fallback={
                <div className="flex items-center justify-center h-96 res-card-strong rounded-2xl">
                  <div className="text-center"><div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">{tr("Loading map...")}</p></div>
                </div>
              }>
                {mapTarget.university ? <UniversityMap key={`${mapTarget.degree}:${mapTarget.university.name}`} universities={[mapTarget.university]} preferredUnis={preferredUnis} studentDistrict={selectedDistrict} recommendedUniversity={mapTarget.university.name} recommendationOnly /> : <p className="res-card rounded-xl p-5 text-sm text-slate-600">{tr('Choose View on map from a university in your recommendation results.')}</p>}
              </Suspense>
            </div>
          ))}

          {/* ===== PREFERRED ===== */}
          {tr(activeTab === 'preferred' && (
            <div className="space-y-6">
              {tr(preferredUnis.length === 0 ? (
                <div className="res-card-strong rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tr("No Preferred Universities Selected")}</h3>
                  <p className="text-gray-500 mb-4">{tr("Go to the \"Universities & Cutoffs\" tab and click the star icon.")}</p>
                  <button onClick={() => setActiveTab('universities')} className="px-6 py-3 bg-amber-50 text-amber-700 rounded-xl font-semibold border border-amber-200 hover:bg-amber-100 transition-all">{tr("Browse Universities")}</button>
                </div>
              ) : (
                <>
                  <div className="res-card rounded-xl p-4 border border-amber-200 bg-amber-50/50">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{tr("Your Preferred Universities (")}{tr(preferredUnis.length)})</h2>
                    <p className="text-amber-700/60 text-sm">{tr("Detailed comparison of your selected universities.")}</p>
                  </div>

                  <div className="res-card-strong rounded-2xl p-6 overflow-x-auto">
                    <h3 className="text-gray-900 font-bold mb-4">{tr("Quick Comparison")}</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-gray-400 pb-3 font-semibold">{tr("University")}</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">{tr("Type")}</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">{tr("Readiness %")}</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">{tr("Cutoff (")}{tr(bestDegree)})</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">{tr("Your Z-Score")}</th>
                          <th className="text-center text-gray-400 pb-3 font-semibold">{tr("Status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tr(preferredResults?.map((uni) => {
                          const cutoff = uni.z_score_requirements?.[bestDegree] || uni.z_score_requirement || 'N/A';
                          const status = typeof cutoff === 'number' ? getCutoffStatus(cutoff) : { label: 'N/A', color: 'text-gray-400 bg-gray-50 border-gray-200', icon: '-' };
                          return (
                            <tr key={uni.name} className="hover:bg-blue-50/30">
                              <td className="py-3 text-gray-900 font-medium">{tr(uni.name)}</td>
                              <td className="py-3 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${uni.type === 'Government' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{tr(uni.type)}</span>
                              </td>
                              <td className="py-3 text-center text-gray-900 font-bold">{tr(Number.isFinite(uni.readiness_score) ? `${(uni.readiness_score * 100).toFixed(0)}%` : 'N/A')}</td>
                              <td className="py-3 text-center font-mono text-gray-500">{tr(cutoff)}</td>
                              <td className="py-3 text-center font-mono text-gray-900 font-bold">{tr(studentZScore)}</td>
                              <td className="py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium border ${status.color}`}>{tr(status.icon)} {tr(status.label)}</span></td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tr(preferredResults?.map((uni) => renderUniCard(uni, uni.type === 'Government', true)))}
                  </div>
                </>
              ))}
            </div>
          ))}

          {/* ===== CAREER ANALYSIS ===== */}
          {tr(activeTab === 'analysis' && (
            <div className="space-y-8">
              {tr(backwardData && Object.keys(backwardData).length > 0 && (
                <div className="res-card-strong rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </span>
                    <span>{tr("Future Goal Analysis:")}<span className="text-blue-600">{tr(studentData.dreamJob)}</span></span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tr(backwardData.key_skills && (
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-blue-600 font-semibold mb-3 text-xs uppercase tracking-wider">{tr("Key Skills Required")}</h3>
                        <div className="space-y-2">
                          {tr((Array.isArray(backwardData.key_skills) ? backwardData.key_skills : [backwardData.key_skills]).map((skill, i) => (
                            <div key={i} className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /><span className="text-gray-700 text-sm">{tr(typeof skill === 'string' ? skill : JSON.stringify(skill))}</span></div>
                          )))}
                        </div>
                      </div>
                    ))}
                    {tr(backwardData.required_education && (
                      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                        <h3 className="text-emerald-600 font-semibold mb-3 text-xs uppercase tracking-wider">{tr("Required Education")}</h3>
                        <p className="text-gray-700 text-sm">{tr(typeof backwardData.required_education === 'string' ? backwardData.required_education : JSON.stringify(backwardData.required_education))}</p>
                      </div>
                    ))}
                    <FutureCareerPath analysis={backwardData} career={studentData.dreamJob} />
                    {tr(backwardData.industries && (
                      <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                        <h3 className="text-orange-600 font-semibold mb-3 text-xs uppercase tracking-wider">{tr("Industries")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {tr((Array.isArray(backwardData.industries) ? backwardData.industries : [backwardData.industries]).map((ind, i) => (
                            <span key={i} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">{tr(ind)}</span>
                          )))}
                        </div>
                      </div>
                    ))}
                    {tr(backwardData.salary_range && (
                      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                        <h3 className="text-emerald-600 font-semibold mb-3 text-xs uppercase tracking-wider">{tr("Salary Range")}</h3>
                        <p className="text-gray-700 text-sm">{tr(backwardData.salary_range)}</p>
                      </div>
                    ))}
                    {tr(backwardData.timeline && (
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 md:col-span-2">
                        <h3 className="text-blue-600 font-semibold mb-3 text-xs uppercase tracking-wider">{tr("Timeline")}</h3>
                        <p className="text-gray-700 text-sm">{tr(backwardData.timeline)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {tr(counterfactualGuidance && Object.keys(counterfactualGuidance).length > 0 && (
                <div className="res-card-strong rounded-2xl p-6 border border-amber-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    {/* <span className="text-2xl">💡</span> */}
                    <span>{tr("AI Improvement Guidance")}</span>
                  </h2>
                  <div className="space-y-4">
                    {tr(Object.entries(counterfactualGuidance).map(([key, value]) => (
                      <div key={key} className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                        <h3 className="text-amber-700 font-semibold mb-1 capitalize">{tr(key.replace(/_/g, ' '))}</h3>
                        <p className="text-gray-600">{tr(value)}</p>
                      </div>
                    )))}
                  </div>
                </div>
              ))}

              <div className="res-card-strong rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{tr("Your Profile Summary")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-600 text-xs uppercase tracking-wider mb-1 font-semibold">{tr("Dream Job")}</p>
                    <p className="text-xl font-bold text-gray-900">{tr(studentData.dreamJob)}</p>
                  </div>
                  <div className="bg-purple-50/70 rounded-xl p-4 border border-purple-100">
                    <p className="text-purple-600 text-xs uppercase tracking-wider mb-1 font-semibold">{tr("Stream")}</p>
                    <p className="text-xl font-bold text-gray-900">{tr(studentData.academicResults?.stream || 'N/A')}</p>
                  </div>
                  <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-100">
                    <p className="text-emerald-600 text-xs uppercase tracking-wider mb-1 font-semibold">{tr("District")}</p>
                    <p className="text-xl font-bold text-gray-900">{tr(studentData.personalInfo?.district || 'N/A')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200/60">
            <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-semibold shadow-sm">{tr("Back to Input")}</button>
            <button onClick={onHome} className="w-full sm:w-auto px-6 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-semibold shadow-sm">{tr("Back to Home")}</button>
            <button onClick={onViewGuidance} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold">{tr("View Improvement Guidance")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

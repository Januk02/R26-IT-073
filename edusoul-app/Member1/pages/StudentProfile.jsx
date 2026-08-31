import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { personalityTraits, lifestyleFactors, dreamJobs } from '../data/dreamDegreeData';

const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

export default function StudentProfile({ onBack, onEditProfile }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'students', user.uid));
        if (snap.exists()) setProfile(snap.data());
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Loading / Auth / Empty states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please log in to view your profile.</p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">Go Back</button>
        </div>
      </div>
    );
  }
  if (!profile || !profile.personalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Yet</h2>
          <p className="text-gray-500 mb-6">Complete the Dream Degree form to create your student profile.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onBack} className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all">Go Back</button>
            {onEditProfile && <button onClick={onEditProfile} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">Fill Out Form</button>}
          </div>
        </div>
      </div>
    );
  }

  const { personalInfo, dreamJob, academicResults, personalityScores, lifestylePreferences } = profile;
  const personalityAvg = personalityScores
    ? Math.round(Object.values(personalityScores).reduce((a, b) => a + b, 0) / Object.values(personalityScores).length * 10) : 0;

  const completionItems = [
    { label: 'Personal Info', done: !!(personalInfo?.name && personalInfo?.district) },
    { label: 'Dream Career', done: !!dreamJob },
    { label: 'Academic Results', done: !!(academicResults?.stream && academicResults?.zScore) },
    { label: 'Personality', done: personalityScores && Object.keys(personalityScores).length >= 5 },
    { label: 'Lifestyle', done: lifestylePreferences && Object.keys(lifestylePreferences).length >= 3 },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  const getScoreColor = (v) => { if (v <= 3) return '#ef4444'; if (v <= 5) return '#f59e0b'; if (v <= 7) return '#3b82f6'; return '#22c55e'; };
  const getScoreGrad = (v) => { if (v <= 3) return 'from-red-400 to-orange-400'; if (v <= 5) return 'from-orange-400 to-yellow-400'; if (v <= 7) return 'from-blue-400 to-blue-500'; return 'from-green-400 to-emerald-500'; };
  const getGradeBg = (g) => ({ A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-yellow-500', S: 'bg-orange-500', F: 'bg-red-500' }[g] || 'bg-gray-400');
  const getGradeColor = (g) => ({ A: '#22c55e', B: '#3b82f6', C: '#eab308', S: '#f97316', F: '#ef4444' }[g] || '#9ca3af');

  const sortedTraits = personalityScores ? Object.entries(personalityScores).sort(([, a], [, b]) => b - a) : [];
  const dreamJobData = dreamJobs.find(j => j.title === dreamJob);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'personality', label: 'Personality', icon: '🧠' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 prof-bg-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.88] via-blue-50/[0.85] to-white/[0.90]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="prof-orb prof-orb-1" />
        <div className="prof-orb prof-orb-2" />
      </div>

      <style>{`
        .prof-bg-zoom { animation: profBgZoom 30s ease-in-out infinite alternate; }
        @keyframes profBgZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1.12); } }
        .prof-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.35; animation: profOrbFloat 14s ease-in-out infinite; }
        .prof-orb-1 { width: 400px; height: 400px; top: -5%; right: -5%; background: radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%); }
        .prof-orb-2 { width: 350px; height: 350px; bottom: -5%; left: -5%; background: radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%); animation-delay: -5s; }
        @keyframes profOrbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,20px) scale(1.08); } }
        .prof-card { background: rgba(255,255,255,0.70); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
        .prof-card-strong { background: rgba(255,255,255,0.82); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.85); box-shadow: 0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95); }
        .prof-card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .prof-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.2); }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* === TOP BAR === */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 prof-card rounded-xl text-gray-500 hover:text-gray-800 transition-all text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Student Profile</h1>
          {onEditProfile && (
            <button onClick={onEditProfile} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </button>
          )}
        </div>

        {/* === PROFILE HERO === */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="prof-card-strong rounded-3xl overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400 relative">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2l4 3-4 3z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
          </div>

          <div className="px-6 md:px-8 pb-8 -mt-14">
            <div className="flex flex-wrap items-end gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-5xl font-extrabold border-4 border-white shadow-xl shadow-blue-500/25">
                  {personalInfo?.name ? personalInfo.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center border-[3px] border-white">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-[200px] pb-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{personalInfo?.name || 'Student'}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {personalInfo?.age && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">🎂 {personalInfo.age} years</span>
                  )}
                  {personalInfo?.district && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">📍 {personalInfo.district}, Sri Lanka</span>
                  )}
                  {profile.email && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">✉️ {profile.email}</span>
                  )}
                </div>
              </div>

              {/* Completion Ring */}
              <div className="flex flex-col items-center pb-2">
                <div className="relative w-[76px] h-[76px]">
                  <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={completionPct === 100 ? '#22c55e' : '#3b82f6'} strokeWidth="3"
                      strokeDasharray={`${completionPct * 0.9425} 94.25`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-gray-900">{completionPct}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Complete</span>
              </div>
            </div>

            {/* Dream Career */}
            {dreamJob && (
              <div className="mt-5 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-2xl shadow-md shadow-blue-500/15">
                  {dreamJobData?.icon || '🎯'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Dream Career</p>
                  <p className="text-lg font-extrabold text-gray-900">{dreamJob}</p>
                </div>
                {dreamJobData && (
                  <div className="flex gap-5">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-blue-600">{dreamJobData.marketDemand}%</p>
                      <p className="text-[10px] text-gray-400 font-medium">Demand</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-green-600">{dreamJobData.sustainabilityScore}%</p>
                      <p className="text-[10px] text-gray-400 font-medium">Stability</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completion pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {completionItems.map(item => (
                <div key={item.label} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  item.done ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-400 border-red-200'
                }`}>
                  {item.done ? '✓' : '!'} {item.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* === NAV TABS === */}
        <div className="flex gap-1.5 mb-6 prof-card rounded-2xl p-1.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/60'
              }`}>
              <span className="text-base">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* === TAB CONTENT === */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

            {/* ===== OVERVIEW ===== */}
            {activeSection === 'overview' && (
              <div className="space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Z-Score', value: academicResults?.zScore || '—', sub: 'Out of ~3.00', gradient: 'from-blue-600 to-blue-500', icon: '📊' },
                    { label: 'A/L Stream', value: academicResults?.stream || '—', sub: 'G.C.E. Advanced Level', gradient: 'from-green-600 to-emerald-500', icon: '📖' },
                    { label: 'Personality', value: `${personalityAvg}%`, sub: `${sortedTraits.length} traits assessed`, gradient: 'from-orange-500 to-amber-500', icon: '🧠' },
                    { label: 'Lifestyle', value: lifestylePreferences ? `${Object.keys(lifestylePreferences).length} set` : '0', sub: 'Preferences', gradient: 'from-purple-500 to-pink-500', icon: '🌟' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="prof-card-strong prof-card-hover rounded-2xl p-5">
                      <span className="text-2xl">{stat.icon}</span>
                      <p className={`text-2xl font-extrabold mt-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
                      <p className="text-[10px] text-gray-300">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Two-col: Strengths + Academic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Top Strengths */}
                  <div className="prof-card-strong rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-lg">🏆</span> Top Strengths</h3>
                    {sortedTraits.length > 0 ? (
                      <div className="space-y-3">
                        {sortedTraits.slice(0, 5).map(([trait, score], idx) => {
                          const data = personalityTraits[trait];
                          const medals = ['🥇', '🥈', '🥉'];
                          return (
                            <div key={trait} className="flex items-center gap-3">
                              <span className="text-sm w-6 text-center">{idx < 3 ? medals[idx] : <span className="text-gray-300 text-xs font-bold">#{idx + 1}</span>}</span>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-semibold text-gray-700">{data?.label || trait}</span>
                                  <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>{score}/10</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${getScoreColor(score)}, ${getScoreColor(score)}aa)` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="text-gray-300 text-sm">No personality data yet.</p>}
                  </div>

                  {/* Academic Summary */}
                  <div className="prof-card-strong rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-lg">📚</span> Academic Summary</h3>
                    {academicResults?.stream ? (
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="text-xs text-gray-500">Stream</span>
                          <span className="text-xs font-bold text-blue-600">{academicResults.stream}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                          <span className="text-xs text-gray-500">Z-Score</span>
                          <span className="text-xs font-bold text-green-600">{academicResults.zScore || '—'}</span>
                        </div>
                        {academicResults.subjects && Object.keys(academicResults.subjects).length > 0 && (
                          <div className="pt-1">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject Grades</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(academicResults.subjects).map(([sub, grade]) => (
                                <div key={sub} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 shadow-sm">
                                  <span className="text-[11px] text-gray-600 truncate max-w-[100px]">{sub}</span>
                                  {grade && <span className={`${getGradeBg(grade)} text-white text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center`}>{grade}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : <p className="text-gray-300 text-sm">No academic data yet.</p>}
                  </div>
                </div>

                {/* Lifestyle Quick View */}
                {lifestylePreferences && Object.keys(lifestylePreferences).length > 0 && (
                  <div className="prof-card-strong rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-lg">🌟</span> Lifestyle at a Glance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(lifestylePreferences).map(([key, value]) => {
                        const factor = lifestyleFactors[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-white transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{factor?.icon || '📌'}</span>
                              <span className="text-xs text-gray-500">{factor?.label || key}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== ACADEMIC ===== */}
            {activeSection === 'academic' && (
              <div className="space-y-5">
                {academicResults?.stream ? (<>
                  {/* Stream */}
                  <div className="prof-card-strong rounded-2xl p-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">📖</div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Selected Stream</p>
                        <p className="text-2xl font-extrabold text-gray-900">{academicResults.stream}</p>
                      </div>
                    </div>
                  </div>

                  {/* Z-Score */}
                  <div className="prof-card-strong rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Z-Score</p>
                        <p className="text-5xl font-extrabold text-gray-900 mt-1 font-mono">{academicResults.zScore || '—'}</p>
                        <p className="text-xs text-gray-400 mt-1">Out of maximum ~3.00</p>
                      </div>
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#dcfce7" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3"
                            strokeDasharray={`${Math.min((parseFloat(academicResults.zScore || 0) / 3) * 94.25, 94.25)} 94.25`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-extrabold text-green-600">{academicResults.zScore ? `${Math.round((parseFloat(academicResults.zScore) / 3) * 100)}%` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Grades */}
                  {academicResults.subjects && Object.keys(academicResults.subjects).length > 0 && (
                    <div className="prof-card-strong rounded-2xl p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><span>📝</span> Subject Grades</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(academicResults.subjects).map(([subject, grade]) => (
                          <div key={subject} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 prof-card-hover">
                            <span className="text-sm font-semibold text-gray-700 truncate mr-3">{subject}</span>
                            {grade ? (
                              <span className={`${getGradeBg(grade)} text-white font-bold text-sm w-10 h-10 rounded-xl flex items-center justify-center shadow-md`}>{grade}</span>
                            ) : (
                              <span className="text-xs text-gray-300 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">Not set</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>) : (
                  <div className="prof-card-strong rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-400">No academic data available.</p>
                    {onEditProfile && <button onClick={onEditProfile} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Fill Out Form</button>}
                  </div>
                )}
              </div>
            )}

            {/* ===== PERSONALITY ===== */}
            {activeSection === 'personality' && (
              <div className="space-y-5">
                {sortedTraits.length > 0 ? (<>
                  {/* Overall Score */}
                  <div className="prof-card-strong rounded-2xl p-6 flex items-center justify-between flex-wrap gap-5">
                    <div>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Overall Personality Score</p>
                      <p className="text-5xl font-extrabold text-gray-900 mt-1">{personalityAvg}%</p>
                      <p className="text-xs text-gray-400 mt-1">Average across {sortedTraits.length} traits</p>
                    </div>
                    <div className="text-6xl">{personalityAvg >= 80 ? '🌟' : personalityAvg >= 60 ? '✨' : personalityAvg >= 40 ? '💡' : '🌱'}</div>
                  </div>

                  {/* Trait Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedTraits.map(([trait, score], idx) => {
                      const data = personalityTraits[trait];
                      return (
                        <motion.div key={trait} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className="prof-card-strong prof-card-hover rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{data?.icon || '📊'}</span>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{data?.label || trait}</p>
                                <p className="text-[11px] text-gray-400">{data?.description || ''}</p>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getScoreGrad(score)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>{score}</div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 0.8, delay: idx * 0.06 }}
                              className={`h-full rounded-full bg-gradient-to-r ${getScoreGrad(score)}`} />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-gray-300">{data?.lowLabel || 'Low'}</span>
                            <span className="text-[10px] text-gray-300">{data?.highLabel || 'High'}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>) : (
                  <div className="prof-card-strong rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🧩</div>
                    <p className="text-gray-400">No personality data yet.</p>
                    {onEditProfile && <button onClick={onEditProfile} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Take Assessment</button>}
                  </div>
                )}
              </div>
            )}

            {/* ===== LIFESTYLE ===== */}
            {activeSection === 'lifestyle' && (
              <div>
                {lifestylePreferences && Object.keys(lifestylePreferences).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(lifestylePreferences).map(([key, value], idx) => {
                      const factor = lifestyleFactors[key];
                      const selectedOption = factor?.options?.find(o => (typeof o === 'string' ? o : o.value) === value);
                      const optIcon = selectedOption && typeof selectedOption !== 'string' ? selectedOption.icon : null;
                      const optDesc = selectedOption && typeof selectedOption !== 'string' ? selectedOption.desc : null;
                      return (
                        <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                          className="prof-card-strong prof-card-hover rounded-2xl p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                              {optIcon || factor?.icon || '📌'}
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{factor?.label || key}</p>
                              <p className="text-lg font-extrabold text-gray-900 mt-0.5">{value}</p>
                              {optDesc && <p className="text-xs text-gray-400 mt-1">{optDesc}</p>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="prof-card-strong rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🌿</div>
                    <p className="text-gray-400">No lifestyle preferences set.</p>
                    {onEditProfile && <button onClick={onEditProfile} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Set Preferences</button>}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        {profile.updatedAt && (
          <p className="text-center text-[11px] text-gray-300 mt-8 pb-8">
            Last updated: {new Date(profile.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

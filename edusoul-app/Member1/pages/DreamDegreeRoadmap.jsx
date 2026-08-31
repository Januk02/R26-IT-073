import { useState, useRef, useEffect } from 'react';
import { dreamJobs } from '../data/dreamDegreeData';

const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

export default function DreamDegreeRoadmap({ recommendation, studentData, onBack, onHome, onViewProfile, onNavigateToDashboard }) {
  const [language, setLanguage] = useState('en');
  const [selectedPath, setSelectedPath] = useState('academic');
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const dreamJob = dreamJobs.find(job => job.title === studentData.dreamJob) || dreamJobs[0];
  const university = recommendation.university || 'Your University';
  const degree = recommendation.degree || recommendation.programs?.[0]?.name || 'Your Degree';
  const backendRoadmap = recommendation.roadmap || [];

  const generateRoadmap = () => {
    const academicPath = {
      title: 'Academic Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Foundation Building',
          description: `Complete core courses in ${degree} at ${university}. Build strong fundamentals in ${studentData.academicResults?.stream || 'your field'}.`,
          activities: [
            'Maintain GPA above 3.0',
            'Join relevant student clubs',
            'Complete 2 internships',
            'Build portfolio of projects'
          ],
          skills: ['Technical Fundamentals', 'Research Methods', 'Communication']
        },
        {
          year: 'Year 3-4',
          title: 'Specialization & Research',
          description: `Focus on ${studentData.dreamJob} specialization through electives and final year project.`,
          activities: [
            'Complete final year project',
            'Publish research paper',
            'Industry internship',
            'Build professional network'
          ],
          skills: ['Specialized Knowledge', 'Problem Solving', 'Leadership']
        },
        {
          year: 'Year 5-6',
          title: "Master's Degree (Optional)",
          description: `Pursue advanced studies in ${dreamJob.category} at top universities.`,
          activities: [
            'Apply for scholarships',
            'Research specialization',
            'Teaching assistantship',
            'Network with professors'
          ],
          skills: ['Advanced Theory', 'Research Leadership', 'Academic Writing']
        },
        {
          year: 'Year 7+',
          title: 'PhD or Senior Role',
          description: 'Reach pinnacle of academic career or industry leadership.',
          activities: [
            'Doctoral research',
            'Post-doctoral work',
            'Industry consulting',
            'Mentoring others'
          ],
          skills: ['Expert Knowledge', 'Innovation', 'Strategic Vision']
        }
      ]
    };

    const entrepreneurialPath = {
      title: 'Entrepreneurial Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Skill Acquisition',
          description: `Build technical and business foundations while at ${university}.`,
          activities: ['Learn core technical skills', 'Join entrepreneurship club', 'Participate in hackathons', 'Network with mentors'],
          skills: ['Technical Skills', 'Business Basics', 'Networking']
        },
        {
          year: 'Year 3-4',
          title: 'Idea Validation',
          description: `Identify and validate business ideas in ${dreamJob.category}.`,
          activities: ['Market research', 'Build MVP', 'Customer interviews', 'Business plan development'],
          skills: ['Market Analysis', 'Product Development', 'Pitching']
        },
        {
          year: 'Year 5-7',
          title: 'Startup Launch',
          description: `Launch and scale your venture in the ${dreamJob.category} sector.`,
          activities: ['Register company', 'Secure funding', 'Build team', 'Go-to-market strategy'],
          skills: ['Leadership', 'Financial Management', 'Team Building']
        },
        {
          year: 'Year 8+',
          title: 'Scale & Expansion',
          description: 'Grow startup into established business or explore new ventures.',
          activities: ['Scale operations', 'International expansion', 'New product lines', 'Mentor other entrepreneurs'],
          skills: ['Strategic Planning', 'Global Business', 'Innovation Management']
        }
      ]
    };

    const industryPath = {
      title: 'Industry Professional Path',
      milestones: [
        {
          year: 'Year 1-2',
          title: 'Entry Level',
          description: `Start career as Junior ${studentData.dreamJob} at leading companies.`,
          activities: ['Apply to graduate programs', 'Build technical portfolio', 'Get industry certifications', 'Learn company culture'],
          skills: ['Technical Execution', 'Team Collaboration', 'Professional Communication']
        },
        {
          year: 'Year 3-5',
          title: 'Mid-Level Professional',
          description: `Progress to Senior ${studentData.dreamJob} with increased responsibilities.`,
          activities: ['Lead small projects', 'Mentor juniors', 'Specialize in niche', 'Build industry reputation'],
          skills: ['Project Management', 'Specialization', 'Leadership']
        },
        {
          year: 'Year 6-10',
          title: 'Senior Leadership',
          description: `Reach positions like Team Lead, Manager, or Principal ${studentData.dreamJob}.`,
          activities: ['Lead large teams', 'Strategic planning', 'Cross-functional collaboration', 'Industry speaking'],
          skills: ['Strategic Leadership', 'People Management', 'Business Acumen']
        },
        {
          year: 'Year 10+',
          title: 'Executive Level',
          description: 'Reach C-suite, Director, or start your own consulting firm.',
          activities: ['Executive decision making', 'Board participation', 'Industry thought leadership', 'Strategic partnerships'],
          skills: ['Executive Leadership', 'Strategic Vision', 'Industry Influence']
        }
      ]
    };

    return { academicPath, entrepreneurialPath, industryPath };
  };

  const roadmaps = generateRoadmap();
  const currentRoadmap = roadmaps[selectedPath === 'academic' ? 'academicPath' : selectedPath === 'entrepreneurial' ? 'entrepreneurialPath' : 'industryPath'];

  const bridgingCourses = [
    { name: 'Python Programming', provider: 'Coursera', duration: '3 months', relevance: 95 },
    { name: 'Data Structures & Algorithms', provider: 'edX', duration: '4 months', relevance: 90 },
    { name: 'Business Communication', provider: 'Udemy', duration: '2 months', relevance: 85 },
    { name: 'Project Management', provider: 'LinkedIn Learning', duration: '2 months', relevance: 80 }
  ];

  const microCredentials = [
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon', validity: '2 years', demand: 'High' },
    { name: 'Google Analytics', issuer: 'Google', validity: '1 year', demand: 'Medium' },
    { name: 'Agile Scrum Master', issuer: 'Scrum Alliance', validity: '2 years', demand: 'High' },
    { name: 'Digital Marketing', issuer: 'HubSpot', validity: '1 year', demand: 'High' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
      </div>

      <style>{`
        .road-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .road-card-strong {
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
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Top Bar */}
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

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-normal mb-3">
            <span className="text-slate-900">Map your dream. </span><span className="text-blue-600">Make it real</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Personalized pathway to become a <span className="text-blue-600 font-semibold">{studentData.dreamJob}</span>
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 font-medium">
              {degree}
            </span>
            <span className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-200 font-medium">
              {university}
            </span>
          </div>
        </div>

        {/* Backend AI Roadmap (if available) */}
        {backendRoadmap.length > 0 && (
          <div className="road-card-strong rounded-2xl p-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-5 border border-blue-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <span>Your Future, One Step Ahead</span>
              </h2>
              <div className="space-y-3">
                {backendRoadmap.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4 bg-white/80 rounded-xl p-4 border border-slate-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Path Selector */}
        <div className="road-card rounded-2xl p-1.5 mb-8 flex">
          {[
            { id: 'academic', icon: '🎓', label: 'Academic Path', sub: 'Research & Teaching' },
            { id: 'entrepreneurial', icon: '🚀', label: 'Entrepreneurial', sub: 'Start Your Own Business' },
            { id: 'industry', icon: '💼', label: 'Industry Professional', sub: 'Corporate Career' }
          ].map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={`flex-1 py-4 px-4 rounded-xl transition-all text-center ${
                selectedPath === path.id
                  ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-1">{path.icon}</div>
              <h3 className="font-bold text-sm">{path.label}</h3>
              <p className={`text-xs ${selectedPath === path.id ? 'text-white/80' : 'text-slate-400'}`}>{path.sub}</p>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="road-card-strong rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">{currentRoadmap.title}</h2>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-orange-400 to-blue-400 rounded-full" />

            <div className="space-y-8">
              {currentRoadmap.milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start ml-16">
                  <div className="absolute -left-12 w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    {index + 1}
                  </div>

                  <div className="flex-1 bg-white/60 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 font-semibold">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 mt-2">{milestone.title}</h3>
                      </div>
                    </div>

                    <p className="text-slate-500 mb-4">{milestone.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-semibold text-slate-700 mb-2 text-sm">Key Activities</h4>
                        <ul className="space-y-1.5">
                          {milestone.activities.map((activity, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-100">
                        <h4 className="font-semibold text-slate-700 mb-2 text-sm">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-white text-orange-600 px-2.5 py-1 rounded-full border border-orange-200 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bridging Courses */}
          {/* <div className="road-card-strong rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <span className="text-xl">📚</span>
              <span>Recommended Bridging Courses</span>
            </h3>
            <div className="space-y-3">
              {bridgingCourses.map((course, index) => (
                <div key={index} className="bg-white/60 p-3 rounded-xl flex justify-between items-center border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{course.name}</p>
                    <p className="text-xs text-slate-400">{course.provider} &middot; {course.duration}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    course.relevance >= 90
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {course.relevance}%
                  </span>
                </div>
              ))}
            </div>
          </div> */}

          {/* Micro-Credentials */}
          {/* <div className="road-card-strong rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span>Micro-Credentials</span>
            </h3>
            <div className="space-y-3">
              {microCredentials.map((credential, index) => (
                <div key={index} className="bg-white/60 p-3 rounded-xl flex justify-between items-center border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{credential.name}</p>
                    <p className="text-xs text-slate-400">{credential.issuer} &middot; Valid: {credential.validity}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    credential.demand === 'High'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {credential.demand}
                  </span>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Navigation */}
        <div className="road-card rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 bg-white/80 text-slate-600 rounded-xl hover:bg-white transition-all border border-slate-200 font-medium"
            >
              Back to Results
            </button>
            <button
              onClick={onHome}
              className="w-full sm:w-auto px-6 py-3 bg-white/80 text-slate-600 rounded-xl hover:bg-white transition-all border border-slate-200 font-medium"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl hover:from-blue-700 hover:to-orange-600 transition-all shadow-lg shadow-blue-500/20 font-medium"
            >
              Print Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

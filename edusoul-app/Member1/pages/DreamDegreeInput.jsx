import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dreamJobs, personalityTraits, lifestyleFactors } from '../data/dreamDegreeData';
import { DiscoverYourselfAnimation, FindDegreePathAnimation, FutureCareerAnimation, StartJourneyAnimation } from '../components/OnboardingAnimations';
import { useLanguage } from '../../src/App';
import { translations } from '../data/languageTranslations';

// Background image - education/university themed
const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

// Real Sri Lankan G.C.E. A/L streams with their compulsory subjects
const STREAM_SUBJECTS = {
  'Physical Science': {
    subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
    icon: '⚛️',
    color: 'from-blue-500 to-indigo-500',
    degrees: 'Engineering, Computer Science, IT, Physical Science, Mathematics, Quantity Surveying, Surveying Science, Town Planning',
    description: 'Foundation in mathematics, physics, and chemistry for engineering and physical science careers'
  },
  'Biological Science': {
    subjects: ['Biology', 'Chemistry', 'Physics'],
    icon: '🧬',
    color: 'from-green-500 to-emerald-500',
    degrees: 'Medicine (MBBS), Dentistry (BDS), Veterinary Science, Pharmacy, Nursing, Agriculture, Food Science & Technology, Fisheries & Marine Science, Biological Science',
    description: 'For medicine, healthcare, agriculture, and biological science careers'
  },
  'Commerce': {
    subjects: ['Accounting', 'Business Studies', 'Economics'],
    icon: '💼',
    color: 'from-amber-500 to-orange-500',
    degrees: 'Business Administration, Accounting, Finance, Management, Marketing, HRM, Banking & Insurance, Estate Management',
    description: 'For business, finance, management, and accounting careers'
  },
  'Arts': {
    icon: '📖',
    color: 'from-rose-500 to-pink-500',
    degrees: 'Arts, Law (LLB), Social Sciences, Education, Languages, Fine Arts, Criminology, Social Work, Public Administration',
    description: 'Choose 3 subjects from the groups below (subject to combination rules)',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Languages': {
        icon: '🗣️',
        subjects: ['Sinhala', 'Tamil', 'English', 'Pali', 'Sanskrit', 'Arabic', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Korean', 'Malay'],
        maxFromBucket: 2,
        note: 'Maximum 2 language subjects'
      },
      'Civilizations': {
        icon: '🛕',
        subjects: ['Buddhist Civilization', 'Hindu Civilization', 'Islam Civilization', 'Christian Civilization'],
        maxFromBucket: 1,
        note: 'Maximum 1 civilization subject'
      },
      'Social Sciences': {
        icon: '📊',
        subjects: ['Political Science', 'Geography', 'History', 'Economics', 'Logic & Scientific Method', 'Home Economics', 'Communication & Media Studies'],
        maxFromBucket: 3,
        note: 'Up to 3 subjects'
      },
      'Aesthetics': {
        icon: '🎭',
        subjects: ['Art', 'Dancing (Sinhala)', 'Dancing (Bharatha)', 'Music (Oriental)', 'Music (Western)', 'Music (Carnatic)', 'Drama & Theatre (Sinhala)', 'Drama & Theatre (Tamil)'],
        maxFromBucket: 2,
        note: 'Maximum 2 aesthetic subjects'
      }
    }
  },
  'Engineering Technology': {
    subjects: ['Engineering Technology', 'Science for Technology', 'Information & Communication Technology'],
    icon: '🔧',
    color: 'from-violet-500 to-purple-500',
    degrees: 'Engineering Technology, IT, Software Engineering, Quantity Surveying, Town Planning, Surveying Science',
    description: 'Practical engineering and technology applications'
  },
  'Bio Systems Technology': {
    subjects: ['Bio Systems Technology', 'Science for Technology', 'Information & Communication Technology'],
    icon: '🌱',
    color: 'from-teal-500 to-cyan-500',
    degrees: 'Bio Systems Technology, Agriculture Technology, Food Science & Technology, Environmental Science, Fisheries',
    description: 'Biological systems combined with modern technology'
  }
};

// All 25 Sri Lankan districts
const ALL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

// Dream job category colors (light theme)
const CATEGORY_COLORS = {
  'Technology': { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', accent: 'from-violet-500 to-purple-500' },
  'Healthcare': { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', accent: 'from-emerald-500 to-teal-500' },
  'Engineering': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', accent: 'from-amber-500 to-orange-500' },
  'Business': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', accent: 'from-blue-500 to-cyan-500' },
  'Finance': { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', accent: 'from-green-500 to-emerald-500' },
  'Education': { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', accent: 'from-rose-500 to-pink-500' },
  'Legal': { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', accent: 'from-slate-500 to-gray-500' },
  'Arts': { bg: 'bg-pink-50', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700', accent: 'from-pink-500 to-rose-500' },
  'Design': { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700', accent: 'from-fuchsia-500 to-pink-500' },
  'Media': { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', accent: 'from-orange-500 to-red-500' },
  'Science': { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', accent: 'from-teal-500 to-cyan-500' },
  'Trades': { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', accent: 'from-yellow-500 to-amber-500' },
  'Hospitality': { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', accent: 'from-red-500 to-orange-500' },
  'Aviation': { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', accent: 'from-sky-500 to-blue-500' },
  'Agriculture': { bg: 'bg-lime-50', border: 'border-lime-200', badge: 'bg-lime-100 text-lime-700', accent: 'from-lime-500 to-green-500' },
  'Public Service': { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', accent: 'from-indigo-500 to-blue-500' },
  'Social Services': { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700', accent: 'from-cyan-500 to-teal-500' },
};

const DEFAULT_COLORS = { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', accent: 'from-gray-500 to-slate-500' };

export default function DreamDegreeInput({ onAnalyze, onBack, onFinishOnboarding, onViewProfile, onNavigateToDashboard, initialData }) {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  // Skip onboarding if user already has a profile (they're editing)
  const hasExistingData = !!(initialData && initialData.personalInfo);
  const [onboardingStep, setOnboardingStep] = useState(hasExistingData ? -1 : 0);
  const [step, setStep] = useState(1);
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState('All');
  const [customJob, setCustomJob] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef(null);

  // Close portal on outside click
  useEffect(() => {
    const handleClick = (e) => { if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [formData, setFormData] = useState(() => {
    if (initialData && initialData.personalInfo) {
      return {
        personalInfo: initialData.personalInfo || { name: '', age: '', district: '' },
        dreamJob: initialData.dreamJob || '',
        academicResults: initialData.academicResults || { stream: '', subjects: {}, zScore: '' },
        personalityScores: initialData.personalityScores || {},
        lifestylePreferences: initialData.lifestylePreferences || {},
      };
    }
    return {
      personalInfo: { name: '', age: '', district: '' },
      dreamJob: '',
      academicResults: { stream: '', subjects: {}, zScore: '' },
      personalityScores: {},
      lifestylePreferences: {},
    };
  });

  // Unique categories from dreamJobs
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(dreamJobs.map(j => j.category))];
    return cats;
  }, []);

  // Filtered dream jobs
  const filteredJobs = useMemo(() => {
    return dreamJobs.filter(job => {
      const matchSearch = !jobSearch ||
        job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.category.toLowerCase().includes(jobSearch.toLowerCase());
      const matchCategory = jobCategory === 'All' || job.category === jobCategory;
      return matchSearch && matchCategory;
    });
  }, [jobSearch, jobCategory]);

  // Auto-populate subjects when stream changes
  const streamInfo = STREAM_SUBJECTS[formData.academicResults.stream] || null;
  const isArtsBucket = streamInfo?.hasSubjectBuckets || false;
  const streamSubjects = isArtsBucket
    ? Object.keys(formData.academicResults.subjects)
    : (streamInfo?.subjects || []);

  const onboardingSlides = [
    { title: t.discoverYourself, subtitle: t.discoverYourselfSubtitle, message: t.discoverYourselfDesc, color: "from-blue-600 to-blue-500", accent: '#3b82f6', badge: '01' },
    { title: t.findDegreePath, subtitle: t.findDegreePathSubtitle, message: t.findDegreePathDesc, color: "from-blue-600 to-indigo-500", accent: '#6366f1', badge: '02' },
    { title: t.seeFutureCareer, subtitle: t.seeFutureCareerSubtitle, message: t.seeFutureCareerDesc, color: "from-blue-500 to-orange-500", accent: '#f97316', badge: '03' },
    { title: t.startJourney, subtitle: t.startJourneySubtitle, message: t.startJourneyDesc, color: "from-orange-500 to-blue-600", accent: '#2563eb', badge: '04', hasButton: true }
  ];

  const handleNextOnboarding = () => {
    if (onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      onFinishOnboarding ? onFinishOnboarding() : setOnboardingStep(-1);
    }
  };

  const handleSkipOnboarding = () => {
    onFinishOnboarding ? onFinishOnboarding() : setOnboardingStep(-1);
  };

  const handlePreviousOnboarding = () => {
    if (onboardingStep > 0) setOnboardingStep(onboardingStep - 1);
  };

  const handleDreamJobChange = (jobTitle) => {
    setFormData({ ...formData, dreamJob: jobTitle });
    setCustomJob('');
  };

  const handleCustomJobSelect = () => {
    if (customJob.trim()) {
      setFormData({ ...formData, dreamJob: customJob.trim() });
    }
  };

  const handlePersonalityChange = (trait, value) => {
    setFormData({
      ...formData,
      personalityScores: { ...formData.personalityScores, [trait]: value }
    });
  };

  const handleLifestyleChange = (factor, value) => {
    setFormData({
      ...formData,
      lifestylePreferences: { ...formData.lifestylePreferences, [factor]: value }
    });
  };

  const handleStreamChange = (stream) => {
    const info = STREAM_SUBJECTS[stream];
    const subjects = {};
    if (info && !info.hasSubjectBuckets) {
      (info.subjects || []).forEach(s => { subjects[s] = ''; });
    }
    setFormData({
      ...formData,
      academicResults: { ...formData.academicResults, stream, subjects }
    });
  };

  const handleArtsSubjectToggle = (subject, bucketName) => {
    const currentSubjects = { ...formData.academicResults.subjects };
    const streamData = STREAM_SUBJECTS[formData.academicResults.stream];

    if (currentSubjects.hasOwnProperty(subject)) {
      delete currentSubjects[subject];
    } else {
      if (Object.keys(currentSubjects).length >= 3) return;
      const bucket = streamData.subjectBuckets[bucketName];
      const countFromBucket = bucket.subjects.filter(s => currentSubjects.hasOwnProperty(s)).length;
      if (countFromBucket >= bucket.maxFromBucket) return;
      currentSubjects[subject] = '';
    }

    setFormData({
      ...formData,
      academicResults: {
        ...formData.academicResults,
        subjects: currentSubjects
      }
    });
  };

  const getSubjectBucket = (subject) => {
    if (!streamInfo?.subjectBuckets) return null;
    for (const [bucketName, bucket] of Object.entries(streamInfo.subjectBuckets)) {
      if (bucket.subjects.includes(subject)) return bucketName;
    }
    return null;
  };

  const handleSubjectGradeChange = (subject, grade) => {
    setFormData({
      ...formData,
      academicResults: {
        ...formData.academicResults,
        subjects: { ...formData.academicResults.subjects, [subject]: grade }
      }
    });
  };

  const handleUseDummyData = () => {
    setFormData({
      personalInfo: { name: 'John Doe', age: '18', district: 'Colombo' },
      dreamJob: 'Software Engineer',
      academicResults: {
        stream: 'Engineering Technology',
        subjects: { 'Engineering Technology': 'A', 'Science for Technology': 'A', 'ICT': 'B' },
        zScore: '1.65'
      },
      personalityScores: {
        analytical_thinking: 8, creativity: 7, leadership: 6, communication: 7,
        problem_solving: 9, teamwork: 6, adaptability: 8, attention_to_detail: 7
      },
      lifestylePreferences: {
        locationPreference: 'Urban', familyAttachment: 'Moderate',
        workLifeBalance: 'Important', salaryExpectation: 'High',
        careerGrowth: 'Very Important', stressTolerance: 'Medium',
        socialImpact: 'Moderate'
      }
    });
    setStep(4);
  };

  const nextStep = () => { if (step < 4) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const stepTitles = [
    { icon: '🎯', title: t.futureGoal, subtitle: t.futureGoalSubtitle },
    { icon: '📚', title: t.academicResults, subtitle: t.academicResultsSubtitle },
    { icon: '🧠', title: t.personality, subtitle: t.personalitySubtitle },
    { icon: '🌟', title: t.lifestyle, subtitle: t.lifestyleSubtitle }
  ];

  const isStepComplete = (s) => {
    switch (s) {
      case 1: return formData.personalInfo.name && formData.personalInfo.district && formData.dreamJob;
      case 2: return formData.academicResults.stream && formData.academicResults.zScore;
      case 3: return Object.keys(formData.personalityScores).length >= 5;
      case 4: return Object.keys(formData.lifestylePreferences).length >= 3;
      default: return false;
    }
  };

  const allStepsComplete = isStepComplete(1) && isStepComplete(2) && isStepComplete(3) && isStepComplete(4);

  const handleSubmit = () => {
    if (!allStepsComplete) {
      for (let s = 1; s <= 4; s++) {
        if (!isStepComplete(s)) {
          setStep(s);
          return;
        }
      }
      return;
    }
    onAnalyze(formData);
  };

  const getScoreColor = (value) => {
    if (value <= 3) return 'from-red-400 to-orange-400';
    if (value <= 5) return 'from-orange-400 to-yellow-400';
    if (value <= 7) return 'from-yellow-400 to-green-400';
    return 'from-green-400 to-emerald-500';
  };

  const getScoreBarWidth = (value) => `${(value / 10) * 100}%`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND IMAGE + WHITE OVERLAY ===== */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 bg-img-zoom" />
        {/* White/light overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.88] via-blue-50/[0.85] to-white/[0.90]" />
        {/* Animated color orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Animated floating particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="particle-dot" style={{
            '--size': `${Math.random() * 5 + 2}px`,
            '--x-start': `${Math.random() * 100}%`,
            '--y-start': `${Math.random() * 100}%`,
            '--x-drift': `${(Math.random() - 0.5) * 80}px`,
            '--y-drift': `${-Math.random() * 120 - 40}px`,
            '--opacity': Math.random() * 0.25 + 0.08,
            '--delay': `${Math.random() * 8}s`,
            '--duration': `${Math.random() * 6 + 6}s`,
          }} />
        ))}
      </div>

      {/* Aurora streaks */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
      </div>

      {/* ===== PORTAL BUTTON (top-left) ===== */}
      <div ref={portalRef} style={{ position: 'fixed', top: 20, left: 20, zIndex: 50 }}>
        <button
          onClick={() => setPortalOpen(!portalOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 14,
            border: `2px solid ${portalOpen ? '#3b82f6' : '#e2e8f0'}`,
            background: portalOpen ? '#eff6ff' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            color: portalOpen ? '#3b82f6' : '#475467',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { if (!portalOpen) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
          onMouseLeave={e => { if (!portalOpen) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475467'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          Portal
        </button>

        {/* Portal Dropdown */}
        <AnimatePresence>
          {portalOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: 260,
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)',
                borderRadius: 16, border: '1px solid #e5e7eb',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #fff7ed)' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>D</span>
                  Navigation
                </p>
              </div>
              <div style={{ padding: '6px 0' }}>
                <button onClick={() => { setPortalOpen(false); onBack(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#334155', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
                  </span>
                  Home
                </button>

                {onViewProfile && (
                  <button onClick={() => { setPortalOpen(false); onViewProfile(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#334155', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    My Profile
                  </button>
                )}

                {onNavigateToDashboard && (
                  <button onClick={() => { setPortalOpen(false); onNavigateToDashboard(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#334155', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </span>
                    Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 py-8 px-4">
        <style>{`
          /* ===== Background image slow zoom ===== */
          .bg-img-zoom { animation: bgZoom 30s ease-in-out infinite alternate; }
          @keyframes bgZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1.12); } }

          /* ===== Animated gradient orbs (light theme) ===== */
          .orb {
            position: absolute; border-radius: 50%;
            filter: blur(100px); opacity: 0.4;
            animation: orbFloat 12s ease-in-out infinite;
          }
          .orb-1 {
            width: 500px; height: 500px; top: -10%; right: -5%;
            background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%);
            animation-duration: 14s;
          }
          .orb-2 {
            width: 400px; height: 400px; bottom: -5%; left: -5%;
            background: radial-gradient(circle, rgba(249,115,22,0.2), transparent 70%);
            animation-duration: 18s; animation-delay: -4s;
          }
          .orb-3 {
            width: 350px; height: 350px; top: 40%; left: 50%;
            background: radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%);
            animation-duration: 16s; animation-delay: -8s;
          }
          @keyframes orbFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -40px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.95); }
            75% { transform: translate(15px, 35px) scale(1.05); }
          }

          /* ===== Floating particles (light theme - blue/orange dots) ===== */
          .particle-dot {
            position: absolute; border-radius: 50%;
            width: var(--size); height: var(--size);
            left: var(--x-start); top: var(--y-start);
            background: rgba(59, 130, 246, var(--opacity));
            box-shadow: 0 0 8px rgba(59, 130, 246, calc(var(--opacity) * 0.4));
            animation: particleDrift var(--duration) var(--delay) infinite ease-in-out;
          }
          .particle-dot:nth-child(3n) {
            background: rgba(249, 115, 22, var(--opacity));
            box-shadow: 0 0 8px rgba(249, 115, 22, calc(var(--opacity) * 0.4));
          }
          @keyframes particleDrift {
            0%, 100% { transform: translate(0, 0); opacity: var(--opacity); }
            50% { transform: translate(var(--x-drift), var(--y-drift)); opacity: calc(var(--opacity) * 0.4); }
          }

          /* ===== Aurora streaks (light theme) ===== */
          .aurora {
            position: absolute; width: 150%; height: 200px;
            opacity: 0.05; filter: blur(80px);
            animation: auroraShift 20s ease-in-out infinite;
          }
          .aurora-1 {
            top: 15%; left: -25%;
            background: linear-gradient(90deg, transparent, #3b82f6, #f97316, transparent);
            animation-duration: 18s;
          }
          .aurora-2 {
            top: 65%; left: -25%;
            background: linear-gradient(90deg, transparent, #f97316, #3b82f6, transparent);
            animation-duration: 24s; animation-delay: -6s;
            transform: rotate(-3deg);
          }
          @keyframes auroraShift {
            0%, 100% { transform: translateX(-5%) rotate(-2deg) scaleY(1); opacity: 0.04; }
            50% { transform: translateX(5%) rotate(2deg) scaleY(1.5); opacity: 0.08; }
          }

          /* ===== Glass morphism (white/light) ===== */
          .glass {
            background: rgba(255,255,255,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          }
          .glass-strong {
            background: rgba(255,255,255,0.75); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
            border: 1px solid rgba(255,255,255,0.8);
            box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
          }
          .glass-subtle {
            background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.5);
          }

          /* ===== Onboarding card (white glass) ===== */
          .onboarding-card {
            background: rgba(255,255,255,0.82); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
            border-radius: 2rem; position: relative; overflow: hidden;
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            border: 1px solid rgba(255,255,255,0.92);
            box-shadow: 0 25px 60px -12px rgba(0,0,0,0.1),
                        0 4px 20px rgba(0,0,0,0.04),
                        inset 0 1px 0 rgba(255,255,255,1);
          }
          .onboarding-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 35px 70px -15px rgba(59,130,246,0.12),
                        0 8px 30px rgba(0,0,0,0.06),
                        inset 0 1px 0 rgba(255,255,255,1);
          }
          .onboarding-gradient { position: absolute; inset: 0; opacity: 0.04; transition: opacity 0.5s ease; }
          .onboarding-card:hover .onboarding-gradient { opacity: 0.08; }

          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
          .onboarding-icon { animation: float 3s ease-in-out infinite; }

          /* ===== Inputs (light glass) ===== */
          .glass-input {
            background: rgba(255,255,255,0.6); border: 1px solid #e2e8f0;
            color: #1e293b; transition: all 0.3s ease;
          }
          .glass-input::placeholder { color: #94a3b8; }
          .glass-input:focus {
            background: rgba(255,255,255,0.9); border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08);
            outline: none;
          }
          .glass-select {
            background: rgba(255,255,255,0.6); border: 1px solid #e2e8f0;
            color: #1e293b; transition: all 0.3s ease;
          }
          .glass-select:focus {
            background: rgba(255,255,255,0.9); border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08);
            outline: none;
          }
          .glass-select option { background: white; color: #1e293b; }

          /* ===== Range slider (blue theme) ===== */
          input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
          input[type="range"]::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; background: #e2e8f0; }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 24px; height: 24px; border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            margin-top: -8px; box-shadow: 0 2px 8px rgba(59,130,246,0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 3px solid white;
          }
          input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.25); box-shadow: 0 2px 16px rgba(59,130,246,0.6); }
          input[type="range"]::-moz-range-track { height: 8px; border-radius: 999px; background: #e2e8f0; border: none; }
          input[type="range"]::-moz-range-thumb {
            width: 24px; height: 24px; border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            box-shadow: 0 2px 8px rgba(59,130,246,0.4);
            border: 3px solid white; cursor: pointer;
          }

          /* ===== Interactive cards ===== */
          .job-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden;
          }
          .job-card::before {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(59,130,246,0.04), transparent);
            opacity: 0; transition: opacity 0.3s ease;
          }
          .job-card:hover { transform: translateY(-4px) scale(1.02); }
          .job-card:hover::before { opacity: 1; }

          .lifestyle-option {
            transition: all 0.3s ease; cursor: pointer;
            position: relative; overflow: hidden;
          }
          .lifestyle-option::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(59,130,246,0.04), transparent);
            transition: left 0.5s ease;
          }
          .lifestyle-option:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
          .lifestyle-option:hover::before { left: 100%; }

          .grade-btn { transition: all 0.2s ease; }
          .grade-btn:hover { transform: scale(1.12); }
          .grade-btn.selected { transform: scale(1.1); }

          /* ===== Scrollbar ===== */
          .custom-scroll::-webkit-scrollbar { width: 5px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

          /* ===== Glow effects ===== */
          .glow-blue { box-shadow: 0 0 20px rgba(59,130,246,0.25), 0 0 40px rgba(59,130,246,0.08); }

          /* ===== Step card entrance ===== */
          .step-card-enter { animation: stepReveal 0.5s ease-out; }
          @keyframes stepReveal {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* ===== Shimmer border ===== */
          .shimmer-border { position: relative; }
          .shimmer-border::after {
            content: ''; position: absolute; inset: -2px; border-radius: inherit;
            background: linear-gradient(135deg, #3b82f6, #f97316, #3b82f6);
            background-size: 300% 300%;
            animation: shimmerRotate 3s linear infinite;
            z-index: -1; opacity: 0.6;
          }
          @keyframes shimmerRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* ===== Pulse ring ===== */
          .pulse-ring::before {
            content: ''; position: absolute; inset: -4px; border-radius: inherit;
            border: 2px solid rgba(59,130,246,0.35);
            animation: pulseExpand 2s ease-out infinite;
          }
          @keyframes pulseExpand {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.3); opacity: 0; }
          }
        `}</style>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* ============ ONBOARDING ============ */}
          {onboardingStep >= 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.94 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-20 flex flex-col justify-center items-center px-4"
              >
                {/* Step counter — top right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-lg border border-white/80 shadow-sm"
                >
                  <span className="text-xs font-bold text-gray-400">STEP</span>
                  <span className="text-sm font-black" style={{ color: onboardingSlides[onboardingStep].accent }}>
                    {onboardingSlides[onboardingStep].badge}
                  </span>
                  <span className="text-xs text-gray-300 font-bold">/04</span>
                </motion.div>

                <div className="onboarding-card p-6 md:p-8 max-w-3xl w-full text-center relative">
                  {/* Gradient overlay */}
                  <div className={`onboarding-gradient bg-gradient-to-br ${onboardingSlides[onboardingStep].color}`} />

                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 opacity-[0.07] pointer-events-none"
                    style={{ background: `radial-gradient(circle at top left, ${onboardingSlides[onboardingStep].accent}, transparent 70%)` }} />
                  <div className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.05] pointer-events-none"
                    style={{ background: `radial-gradient(circle at bottom right, ${onboardingSlides[onboardingStep].accent}, transparent 70%)` }} />

                  {/* Illustration */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 mb-2"
                  >
                    {onboardingStep === 0 && <DiscoverYourselfAnimation />}
                    {onboardingStep === 1 && <FindDegreePathAnimation />}
                    {onboardingStep === 2 && <FutureCareerAnimation />}
                    {onboardingStep === 3 && <StartJourneyAnimation />}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="relative z-10 text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
                  >
                    {onboardingSlides[onboardingStep].title}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="relative z-10 text-lg font-semibold mb-4"
                    style={{ color: onboardingSlides[onboardingStep].accent, opacity: 0.75 }}
                  >
                    {onboardingSlides[onboardingStep].subtitle}
                  </motion.p>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="relative z-10 text-base text-gray-500 mb-6 max-w-xl mx-auto leading-relaxed"
                  >
                    {onboardingSlides[onboardingStep].message}
                  </motion.p>

                  {/* Progress Bar — segmented */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative z-10 flex justify-center gap-2.5 mb-5"
                  >
                    {onboardingSlides.map((slide, index) => (
                      <button
                        key={index}
                        onClick={() => setOnboardingStep(index)}
                        className="relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
                        style={{ width: index === onboardingStep ? 48 : 16, background: '#e2e8f0' }}
                      >
                        {index <= onboardingStep && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: index === onboardingStep
                              ? `linear-gradient(90deg, ${slide.accent}, ${onboardingSlides[Math.min(index + 1, 3)].accent})`
                              : slide.accent }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: index === onboardingStep ? 0.3 : 0 }}
                            layoutId={`progress-${index}`}
                          />
                        )}
                      </button>
                    ))}
                  </motion.div>

                  {/* Navigation Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="relative z-10 flex justify-center items-center gap-3 flex-wrap"
                  >
                    {onboardingStep > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handlePreviousOnboarding}
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.back}
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSkipOnboarding}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/70 text-gray-400 border border-gray-100 hover:bg-white hover:text-gray-500 transition-all"
                    >
                      {t.skip}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 12px 28px rgba(59,130,246,0.35)' }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleNextOnboarding}
                      className="px-7 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${onboardingSlides[onboardingStep].accent}, ${onboardingSlides[Math.min(onboardingStep + 1, 3)].accent})`,
                        boxShadow: `0 8px 24px ${onboardingSlides[onboardingStep].accent}40`,
                      }}
                    >
                      {onboardingStep === onboardingSlides.length - 1 ? (
                        <>
                          {t.getStarted}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      ) : (
                        <>
                          {t.next}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ============ MAIN FORM ============ */}
          {onboardingStep === -1 && (
            <>
              {/* Language Switcher */}
              <div className="flex justify-end mb-6 space-x-2">
                {['en', 'si', 'ta'].map((lang) => (
                  <button key={lang} onClick={() => changeLanguage(lang)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      language === lang
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'glass text-gray-500 hover:text-gray-700'
                    }`}>
                    {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </button>
                ))}
              </div>

              {/* Update banner */}
              {hasExistingData && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-strong rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-sm">✏️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Updating Your Profile</p>
                    <p className="text-xs text-gray-500">Your previous data has been loaded. Edit any section and re-analyze.</p>
                  </div>
                </motion.div>
              )}

              {/* Header */}
              <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
                    <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent">
                      {t.title || 'Future Dream Degree Advisor'}
                    </span>
                  </h1>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-4">
                    {t.subtitle || 'Discover your ideal academic pathway based on your future goal'}
                  </p>
                  
                </motion.div>
              </div>

              {/* ========== PROGRESS STEPPER ========== */}
              <div className="flex justify-center mb-10">
                <div className="flex items-center glass rounded-2xl px-6 py-4">
                  {stepTitles.map((info, index) => (
                    <div key={index} className="flex items-center">
                      <button onClick={() => setStep(index + 1)}
                        className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 cursor-pointer ${
                          step === index + 1
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-110 glow-blue pulse-ring'
                            : isStepComplete(index + 1)
                              ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                        }`}>
                        <span className="text-lg">{isStepComplete(index + 1) && step !== index + 1 ? '✓' : info.icon}</span>
                      </button>
                      {index < 3 && (
                        <div className={`w-10 md:w-16 h-1 mx-1.5 rounded-full transition-all duration-500 ${
                          isStepComplete(index + 1) ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Step Title */}
              <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-3">
                  <span>{stepTitles[step - 1].icon}</span>
                  {stepTitles[step - 1].title}
                  <span className="text-sm font-normal text-orange-400 ml-2 bg-orange-50 px-2 py-0.5 rounded-full">Step {step}/4</span>
                </h2>
                <p className="text-gray-500">{stepTitles[step - 1].subtitle}</p>
              </motion.div>

              {/* ========== STEP CONTENT ========== */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-strong rounded-3xl p-6 md:p-8 step-card-enter"
                >

                  {/* ===== STEP 1: Personal Info + Dream Job ===== */}
                  {step === 1 && (
                    <div className="space-y-8">
                      {/* Personal Info Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.name || 'Your Name'} <span className="text-orange-500">*</span></label>
                          <input type="text" value={formData.personalInfo.name}
                            onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, name: e.target.value } })}
                            className="w-full px-4 py-3.5 glass-input rounded-xl"
                            placeholder="Enter your name" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.age || 'Age'}</label>
                          <input type="number" min="15" max="30" value={formData.personalInfo.age}
                            onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, age: e.target.value } })}
                            className="w-full px-4 py-3.5 glass-input rounded-xl"
                            placeholder="e.g. 18" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.district || 'District'} <span className="text-orange-500">*</span></label>
                          <select value={formData.personalInfo.district}
                            onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, district: e.target.value } })}
                            className="w-full px-4 py-3.5 glass-select rounded-xl">
                            <option value="">Select district</option>
                            {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Dream Job Section */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-4">Select Your Dream Career <span className="text-orange-500">*</span></label>

                        {/* Search + Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-3 mb-5">
                          <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl"
                              placeholder={t.searchPlaceholder || 'Search careers...'} />
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                            {categories.map(cat => (
                              <button key={cat} onClick={() => setJobCategory(cat)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                  jobCategory === cat
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                    : 'bg-white/70 text-gray-500 hover:bg-white hover:text-gray-700 border border-gray-200'
                                }`}>
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Job Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto custom-scroll pr-1">
                          {filteredJobs.map((job) => {
                            const colors = CATEGORY_COLORS[job.category] || DEFAULT_COLORS;
                            const isSelected = formData.dreamJob === job.title;
                            return (
                              <div key={job.id} onClick={() => handleDreamJobChange(job.title)}
                                className={`job-card relative p-5 rounded-2xl border-2 cursor-pointer ${
                                  isSelected
                                    ? `${colors.bg} border-blue-500 shadow-lg shadow-blue-500/15`
                                    : `bg-white/60 ${colors.border} hover:shadow-md hover:bg-white/80`
                                }`}>
                                {isSelected && (
                                  <div className={`absolute top-3 right-3 w-7 h-7 bg-gradient-to-br ${colors.accent} rounded-full flex items-center justify-center shadow-md`}>
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                <div className="text-3xl mb-2">{job.icon}</div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">{job.title}</h3>
                                <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${colors.badge}`}>
                                  {job.category}
                                </span>
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-xs text-gray-400">Demand</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${colors.accent} rounded-full`} style={{ width: `${job.marketDemand}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{job.marketDemand}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Custom Job Input */}
                        <div className="mt-4 p-4 glass-subtle rounded-2xl border border-dashed border-orange-300">
                          <p className="text-sm text-gray-500 mb-2">Can't find your dream career? Type it below:</p>
                          <div className="flex gap-3">
                            <input type="text" value={customJob} onChange={(e) => setCustomJob(e.target.value)}
                              className="flex-1 px-4 py-3 glass-input rounded-xl"
                              placeholder="e.g. Marine Biologist, Game Designer..." />
                            <button onClick={handleCustomJobSelect} disabled={!customJob.trim()}
                              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-orange-500/20">
                              Select
                            </button>
                          </div>
                        </div>

                        {formData.dreamJob && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Selected Career</p>
                              <p className="text-lg font-bold text-gray-900">{formData.dreamJob}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 2: Academic Results ===== */}
                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Stream Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          G.C.E. A/L Stream <span className="text-orange-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(STREAM_SUBJECTS).map(([stream, info]) => {
                            const isSelected = formData.academicResults.stream === stream;
                            return (
                              <button key={stream} onClick={() => handleStreamChange(stream)}
                                className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                                    : 'border-gray-200 bg-white/60 hover:border-blue-300 hover:shadow-md hover:bg-white/80'
                                }`}>
                                {isSelected && (
                                  <div className={`absolute top-3 right-3 w-6 h-6 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center`}>
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                <span className="text-2xl block mb-2">{info.icon}</span>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{stream}</h4>
                                <p className="text-xs text-gray-400 leading-snug">
                                  {info.hasSubjectBuckets ? 'Choose 3 from subject groups' : info.subjects.join(', ')}
                                </p>
                                <div className="mt-2">
                                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Leads to:</span>
                                  <p className="text-xs text-blue-600 font-medium">{info.degrees}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Z-Score + Subject Grades */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Z-Score <span className="text-orange-500">*</span>
                          </label>
                          <input type="number" step="0.01" min="0" max="3.5"
                            value={formData.academicResults.zScore}
                            onChange={(e) => setFormData({ ...formData, academicResults: { ...formData.academicResults, zScore: e.target.value } })}
                            className="w-full px-4 py-3.5 glass-input rounded-xl text-lg font-mono"
                            placeholder="e.g. 1.85" />
                          <p className="text-xs text-gray-400 mt-1.5">Typical range: 0.00 - 3.00. Medicine requires ~1.90+</p>
                        </div>

                        {!isArtsBucket && streamSubjects.length > 0 && (
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <span>📝</span> Subject Grades
                              <span className="text-xs font-normal text-gray-400">(Optional)</span>
                            </h3>
                            <div className="space-y-3">
                              {streamSubjects.map(subject => (
                                <div key={subject} className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700 min-w-[140px] truncate">{subject}</span>
                                  <div className="flex gap-2">
                                    {['A', 'B', 'C', 'S', 'F'].map(grade => {
                                      const isGradeSelected = formData.academicResults.subjects[subject] === grade;
                                      const gradeColors = {
                                        'A': 'bg-green-500 text-white shadow-green-500/30',
                                        'B': 'bg-blue-500 text-white shadow-blue-500/30',
                                        'C': 'bg-yellow-500 text-white shadow-yellow-500/30',
                                        'S': 'bg-orange-500 text-white shadow-orange-500/30',
                                        'F': 'bg-red-500 text-white shadow-red-500/30',
                                      };
                                      return (
                                        <button key={grade} onClick={() => handleSubjectGradeChange(subject, grade)}
                                          className={`grade-btn w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                                            isGradeSelected
                                              ? `${gradeColors[grade]} shadow-md selected`
                                              : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                                          }`}>
                                          {grade}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arts Stream Buckets */}
                      {isArtsBucket && streamInfo?.subjectBuckets && (
                        <div className="mt-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              <span>📖</span> Select Your 3 A/L Subjects
                            </h3>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              Object.keys(formData.academicResults.subjects).length === 3
                                ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {Object.keys(formData.academicResults.subjects).length}/3 selected
                            </span>
                          </div>

                          {Object.entries(streamInfo.subjectBuckets).map(([bucketName, bucket]) => {
                            const selectedFromBucket = bucket.subjects.filter(s => formData.academicResults.subjects.hasOwnProperty(s)).length;
                            const bucketFull = selectedFromBucket >= bucket.maxFromBucket;
                            const totalFull = Object.keys(formData.academicResults.subjects).length >= 3;
                            return (
                              <div key={bucketName} className="p-4 glass-subtle rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{bucket.icon}</span>
                                    <h4 className="font-semibold text-gray-800">{bucketName}</h4>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    bucketFull ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                                  }`}>{bucket.note}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {bucket.subjects.map(subject => {
                                    const isSelected = formData.academicResults.subjects.hasOwnProperty(subject);
                                    const isDisabled = !isSelected && (totalFull || bucketFull);
                                    return (
                                      <button key={subject}
                                        onClick={() => !isDisabled && handleArtsSubjectToggle(subject, bucketName)}
                                        disabled={isDisabled}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                          isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : isDisabled
                                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                              : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'
                                        }`}>{subject}</button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          {streamSubjects.length > 0 && (
                            <div className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📝</span> Subject Grades
                                <span className="text-xs font-normal text-gray-400">(Optional — Z-score is the primary factor)</span>
                              </h3>
                              <div className="space-y-3">
                                {streamSubjects.map(subject => (
                                  <div key={subject} className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 min-w-[180px]">
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">{getSubjectBucket(subject)}</span>
                                      <span className="text-sm font-medium text-gray-700 truncate">{subject}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      {['A', 'B', 'C', 'S', 'F'].map(grade => {
                                        const isGradeSelected = formData.academicResults.subjects[subject] === grade;
                                        const gradeColors = {
                                          'A': 'bg-green-500 text-white shadow-green-500/30',
                                          'B': 'bg-blue-500 text-white shadow-blue-500/30',
                                          'C': 'bg-yellow-500 text-white shadow-yellow-500/30',
                                          'S': 'bg-orange-500 text-white shadow-orange-500/30',
                                          'F': 'bg-red-500 text-white shadow-red-500/30',
                                        };
                                        return (
                                          <button key={grade} onClick={() => handleSubjectGradeChange(subject, grade)}
                                            className={`grade-btn w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                                              isGradeSelected
                                                ? `${gradeColors[grade]} shadow-md selected`
                                                : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                                            }`}>{grade}</button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 3: Personality Assessment ===== */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <p className="text-sm text-gray-500 mb-2">Rate yourself on each trait from 1 (lowest) to 10 (highest)</p>
                      {Object.entries(personalityTraits).map(([trait, data]) => {
                        const value = formData.personalityScores[trait] || 5;
                        return (
                          <div key={trait} className="p-5 glass-subtle rounded-2xl hover:bg-white/60 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{data.icon}</span>
                                <div>
                                  <h3 className="font-bold text-gray-900">{data.label}</h3>
                                  <p className="text-xs text-gray-500">{data.description}</p>
                                </div>
                              </div>
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreColor(value)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                {value}
                              </div>
                            </div>

                            <div className="relative h-2 bg-gray-100 rounded-full mb-2 overflow-hidden">
                              <motion.div
                                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreColor(value)}`}
                                initial={false}
                                animate={{ width: getScoreBarWidth(value) }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>

                            <input type="range" min="1" max="10" value={value}
                              onChange={(e) => handlePersonalityChange(trait, parseInt(e.target.value))}
                              className="w-full" />

                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-400">{data.lowLabel}</span>
                              <span className="text-gray-400">{data.highLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ===== STEP 4: Lifestyle Preferences ===== */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-500 mb-2">Choose what matters most to you in your future career</p>
                      {Object.entries(lifestyleFactors).map(([factor, data]) => (
                        <div key={factor} className="p-5 glass-subtle rounded-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{data.icon}</span>
                            <div>
                              <h3 className="font-bold text-gray-900">{data.label}</h3>
                              <p className="text-xs text-gray-500">{data.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {data.options.map((option) => {
                              const optionValue = typeof option === 'string' ? option : option.value;
                              const optionLabel = typeof option === 'string' ? option : option.label;
                              const optionIcon = typeof option === 'string' ? null : option.icon;
                              const optionDesc = typeof option === 'string' ? null : option.desc;
                              const isSelected = formData.lifestylePreferences[factor] === optionValue;
                              return (
                                <button key={optionValue} onClick={() => handleLifestyleChange(factor, optionValue)}
                                  className={`lifestyle-option p-3 rounded-xl border-2 text-left ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                                      : 'border-gray-200 bg-white/60 hover:border-blue-300 hover:bg-white/80'
                                  }`}>
                                  {optionIcon && <span className="text-xl block mb-1">{optionIcon}</span>}
                                  <span className={`text-sm font-semibold block ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {optionLabel}
                                  </span>
                                  {optionDesc && <span className="text-xs text-gray-400 block mt-0.5">{optionDesc}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ========== NAVIGATION BUTTONS ========== */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200/60">
                    <button onClick={onBack}
                      className="px-6 py-3 bg-white text-gray-500 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2 text-sm border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Exit
                    </button>

                    <div className="flex gap-3">
                      {step > 1 && (
                        <button onClick={prevStep}
                          className="px-6 py-3 bg-white text-gray-500 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2 text-sm border border-gray-200 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                      )}
                      {step < 4 ? (
                        <button onClick={nextStep}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 font-medium flex items-center gap-2 text-sm">
                          Next
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <motion.button onClick={handleSubmit}
                          whileHover={{ scale: allStepsComplete ? 1.03 : 1 }}
                          whileTap={{ scale: allStepsComplete ? 0.97 : 1 }}
                          className={`px-8 py-3.5 rounded-xl shadow-xl font-semibold flex items-center gap-2 transition-all ${
                            allStepsComplete
                              ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-blue-500/30 shimmer-border'
                              : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                          }`}>
                          <span>{allStepsComplete ? '🚀' : '⚠️'}</span>
                          {allStepsComplete
                            ? (t.analyze || 'Analyze My Pathway')
                            : 'Complete all steps first'
                          }
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

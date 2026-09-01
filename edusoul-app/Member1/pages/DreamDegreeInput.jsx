import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dreamJobs, personalityTraits, lifestyleFactors } from '../data/dreamDegreeData';
import { useLanguage } from '../../src/App';
import { translations } from '../data/languageTranslations';
import './DreamDegreeInput.css';

// ── Split components ──────────────────────────────
import InputOnboarding from '../components/InputOnboarding';
import InputStepPersonal from '../components/InputStepPersonal';
import InputStepAcademic from '../components/InputStepAcademic';
import InputStepPersonality from '../components/InputStepPersonality';
import InputStepLifestyle from '../components/InputStepLifestyle';

// Background image - education/university themed
const BG_IMAGE_URL = 'https://i.pinimg.com/1200x/d7/76/5d/d7765d7445ccfecafbd6546e8e36b813.jpg';

// Real Sri Lankan G.C.E. A/L streams with their compulsory subjects
const STREAM_SUBJECTS = {
  'Physical Science': {
    icon: '⚛️',
    color: 'from-blue-500 to-indigo-500',
    degrees: 'Engineering, Computer Science, IT, Physical Science, Mathematics, Quantity Surveying, Surveying Science, Town Planning',
    description: 'Foundation in mathematics, physics, and chemistry for engineering and physical science careers',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '🔬',
        subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
        maxFromBucket: 3,
        note: 'Core science subjects'
      },
      'Optional Subjects': {
        icon: '📐',
        subjects: ['Applied Mathematics', 'Statistics', 'Computer Science'],
        maxFromBucket: 2,
        note: 'Maximum 2 optional subjects'
      }
    }
  },
  'Biological Science': {
    icon: '🧬',
    color: 'from-green-500 to-emerald-500',
    degrees: 'Medicine (MBBS), Dentistry (BDS), Veterinary Science, Pharmacy, Nursing, Agriculture, Food Science & Technology, Fisheries & Marine Science, Biological Science',
    description: 'For medicine, healthcare, agriculture, and biological science careers',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '🔬',
        subjects: ['Biology', 'Chemistry', 'Physics'],
        maxFromBucket: 3,
        note: 'Core science subjects'
      },
      'Optional Subjects': {
        icon: '🌱',
        subjects: ['Agricultural Science', 'Health Science', 'Environmental Science'],
        maxFromBucket: 2,
        note: 'Maximum 2 optional subjects'
      }
    }
  },
  'Commerce': {
    icon: '💼',
    color: 'from-amber-500 to-orange-500',
    degrees: 'Business Administration, Accounting, Finance, Management, Marketing, HRM, Banking & Insurance, Estate Management',
    description: 'Choose 3 subjects from the groups below',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '📊',
        subjects: ['Accounting', 'Business Studies', 'Economics'],
        maxFromBucket: 3,
        note: 'Core commerce subjects'
      },
      'Optional Subjects': {
        icon: '📚',
        subjects: ['Statistics', 'Geography', 'Political Science', 'History', 'Logic & Scientific Method'],
        maxFromBucket: 2,
        note: 'Maximum 2 optional subjects'
      }
    }
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
    icon: '🔧',
    color: 'from-violet-500 to-purple-500',
    degrees: 'Engineering Technology, IT, Software Engineering, Quantity Surveying, Town Planning, Surveying Science',
    description: 'Practical engineering and technology applications',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '⚙️',
        subjects: ['Engineering Technology', 'Science for Technology', 'Information & Communication Technology'],
        maxFromBucket: 3,
        note: 'Core technology subjects'
      },
      'Optional Subjects': {
        icon: '🔌',
        subjects: ['Electronics', 'Automotive Technology', 'Civil Technology'],
        maxFromBucket: 2,
        note: 'Maximum 2 optional subjects'
      }
    }
  },
  'Bio Systems Technology': {
    icon: '🌱',
    color: 'from-teal-500 to-cyan-500',
    degrees: 'Bio Systems Technology, Agriculture Technology, Food Science & Technology, Environmental Science, Fisheries',
    description: 'Biological systems combined with modern technology',
    hasSubjectBuckets: true,
    subjectBuckets: {
      'Core Subjects': {
        icon: '🧪',
        subjects: ['Bio Systems Technology', 'Science for Technology', 'Information & Communication Technology'],
        maxFromBucket: 3,
        note: 'Core bio-technology subjects'
      },
      'Optional Subjects': {
        icon: '🌾',
        subjects: ['Agricultural Science', 'Food Technology', 'Marine Biology'],
        maxFromBucket: 2,
        note: 'Maximum 2 optional subjects'
      }
    }
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
        academicResults: initialData.academicResults || { stream: '', subjects: {}, zScore: '', predictedPerformance: { improvement: 'Medium', potentialZScore: '' } },
        personalityScores: initialData.personalityScores || {},
        lifestylePreferences: initialData.lifestylePreferences || {},
      };
    }
    return {
      personalInfo: { name: '', age: '', district: '' },
      dreamJob: '',
      academicResults: { stream: '', subjects: {}, zScore: '', predictedPerformance: { improvement: 'Medium', potentialZScore: '' } },
      personalityScores: {},
      lifestylePreferences: {},
    };
  });

  // Unique categories from dreamJobs
  const categories = useMemo(() => {
    return ['All', ...new Set(dreamJobs.map(j => j.category))];
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
  const hasSubjectBuckets = streamInfo?.hasSubjectBuckets || false;
  const streamSubjects = hasSubjectBuckets
    ? Object.keys(formData.academicResults.subjects)
    : (streamInfo?.subjects || []);

  // ── Onboarding slides ──────────────────────────
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

  // ── Form handlers ──────────────────────────────
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
      // For streams without buckets, auto-select all subjects
      (info.subjects || []).forEach(s => { subjects[s] = ''; });
    } else if (info && info.hasSubjectBuckets && info.subjectBuckets) {
      // For streams with buckets, auto-select core subjects
      const coreBucket = info.subjectBuckets['Core Subjects'];
      if (coreBucket && coreBucket.subjects) {
        coreBucket.subjects.forEach(s => { subjects[s] = ''; });
      }
    }
    setFormData({
      ...formData,
      academicResults: { ...formData.academicResults, stream, subjects }
    });
  };

  const handleSubjectToggle = (subject, bucketName) => {
    const currentSubjects = { ...formData.academicResults.subjects };
    const streamData = STREAM_SUBJECTS[formData.academicResults.stream];

    if (currentSubjects.hasOwnProperty(subject)) {
      delete currentSubjects[subject];
    } else {
      const bucket = streamData.subjectBuckets[bucketName];
      const countFromBucket = bucket.subjects.filter(s => currentSubjects.hasOwnProperty(s)).length;

      // For Core Subjects bucket, allow all subjects to be selected
      // For other buckets, check maxFromBucket limit
      if (bucketName !== 'Core Subjects' && countFromBucket >= bucket.maxFromBucket) return;

      // For Arts stream, limit total to 3 subjects
      // For other streams with buckets, allow core + optional subjects
      if (formData.academicResults.stream === 'Arts' && Object.keys(currentSubjects).length >= 3) return;

      currentSubjects[subject] = '';
    }

    setFormData({
      ...formData,
      academicResults: { ...formData.academicResults, subjects: currentSubjects }
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
        if (!isStepComplete(s)) { setStep(s); return; }
      }
      return;
    }

    // Transform frontend data to backend format
    const backendData = {
      district: formData.personalInfo.district,
      stream: formData.academicResults.stream,
      z_score: parseFloat(formData.academicResults.zScore) || 0,
      dream_job: formData.dreamJob,
      // Personality traits - map frontend names to backend names
      analytical_skill: formData.personalityScores.analytical_thinking || 0,
      creativity: formData.personalityScores.creativity || 0,
      leadership: formData.personalityScores.leadership || 0,
      risk_taking: formData.personalityScores.risk_taking || 0,
      communication_skill: formData.personalityScores.communication || 0,
      problem_solving: formData.personalityScores.problem_solving || 0,
      teamwork: formData.personalityScores.teamwork || 0,
      entrepreneural_mindset: formData.personalityScores.entrepreneurial_mindset || 0,
      business_acumen: formData.personalityScores.business_acumen || 0,
      // Lifestyle - convert strings to integers
      preferred_location: formData.lifestylePreferences.locationPreference || 'Urban',
      travel_tolerance: formData.lifestylePreferences.travelTolerance || 'Medium',
      stress_tolerance: formData.lifestylePreferences.stressTolerance || 'Medium',
      social_preference: formData.lifestylePreferences.socialInteraction || 'Ambivert',
      work_life_balance_priority: convertToPriority(formData.lifestylePreferences.workLifeBalance),
      family_attachment_level: convertToPriority(formData.lifestylePreferences.familyAttachment),
      financial_stability_need: convertToPriority(formData.lifestylePreferences.salaryExpectation),
      // Missing backend fields - provide defaults
      ol_results: 'Not Provided',
      al_predicted: formData.academicResults.predictedPerformance?.potentialZScore || parseFloat(formData.academicResults.zScore) || 0,
      subject_strength: 'Moderate',
      career_sustainability_priority: convertToPriority(formData.lifestylePreferences.careerGrowth),
      innovation_interest: formData.personalityScores.creativity || 0,
      social_impact_priority: convertToPriority(formData.lifestylePreferences.socialImpact)
    };

    onAnalyze(backendData);
  };

  // Helper function to convert string priorities to integers
  const convertToPriority = (value) => {
    const priorityMap = {
      'Very Important': 5,
      'Very High': 5,
      'Important': 4,
      'High': 4,
      'Moderate': 3,
      'Medium': 3,
      'Not Important': 1,
      'Low': 1
    };
    return priorityMap[value] || 3;
  };

  const getScoreColor = (value) => {
    if (value <= 3) return 'from-red-400 to-orange-400';
    if (value <= 5) return 'from-orange-400 to-yellow-400';
    if (value <= 7) return 'from-yellow-400 to-green-400';
    return 'from-green-400 to-emerald-500';
  };

  const getScoreBarWidth = (value) => `${(value / 10) * 100}%`;

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND IMAGE + WHITE OVERLAY ===== */}
      <div className="fixed inset-0 z-0">
        <img src={BG_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 bg-img-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.88] via-blue-50/[0.85] to-white/[0.90]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
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

        <div className="max-w-5xl mx-auto relative z-10">
          {/* ============ ONBOARDING ============ */}
          {onboardingStep >= 0 && (
            <InputOnboarding
              onboardingStep={onboardingStep}
              setOnboardingStep={setOnboardingStep}
              onboardingSlides={onboardingSlides}
              handleNextOnboarding={handleNextOnboarding}
              handleSkipOnboarding={handleSkipOnboarding}
              handlePreviousOnboarding={handlePreviousOnboarding}
              t={t}
            />
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
                    <InputStepPersonal
                      formData={formData} setFormData={setFormData}
                      jobSearch={jobSearch} setJobSearch={setJobSearch}
                      jobCategory={jobCategory} setJobCategory={setJobCategory}
                      categories={categories} filteredJobs={filteredJobs}
                      customJob={customJob} setCustomJob={setCustomJob}
                      handleDreamJobChange={handleDreamJobChange}
                      handleCustomJobSelect={handleCustomJobSelect}
                      t={t} CATEGORY_COLORS={CATEGORY_COLORS}
                      DEFAULT_COLORS={DEFAULT_COLORS} ALL_DISTRICTS={ALL_DISTRICTS}
                    />
                  )}

                  {/* ===== STEP 2: Academic Results ===== */}
                  {step === 2 && (
                    <InputStepAcademic
                      formData={formData} setFormData={setFormData}
                      handleStreamChange={handleStreamChange}
                      handleSubjectGradeChange={handleSubjectGradeChange}
                      handleSubjectToggle={handleSubjectToggle}
                      getSubjectBucket={getSubjectBucket}
                      streamInfo={streamInfo} hasSubjectBuckets={hasSubjectBuckets}
                      streamSubjects={streamSubjects}
                      STREAM_SUBJECTS={STREAM_SUBJECTS}
                    />
                  )}

                  {/* ===== STEP 3: Personality Traits ===== */}
                  {step === 3 && (
                    <InputStepPersonality
                      formData={formData}
                      handlePersonalityChange={handlePersonalityChange}
                      personalityTraits={personalityTraits}
                      getScoreColor={getScoreColor}
                      getScoreBarWidth={getScoreBarWidth}
                    />
                  )}

                  {/* ===== STEP 4: Lifestyle Preferences ===== */}
                  {step === 4 && (
                    <InputStepLifestyle
                      formData={formData}
                      handleLifestyleChange={handleLifestyleChange}
                      lifestyleFactors={lifestyleFactors}
                    />
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

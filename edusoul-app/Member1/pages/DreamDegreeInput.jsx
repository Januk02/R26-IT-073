import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dreamJobs, personalityTraits, lifestyleFactors } from '../data/dreamDegreeData';
import { DiscoverYourselfAnimation, FindDegreePathAnimation, FutureCareerAnimation, StartJourneyAnimation } from '../components/OnboardingAnimations';
import { useLanguage } from '../../src/App';
import { translations } from '../data/languageTranslations';

// Real Sri Lankan G.C.E. A/L streams with their compulsory subjects
// Source: Department of Examinations, Sri Lanka (www.doenets.lk)
// Reference: University Grants Commission (UGC) Handbook
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

// Dream job category colors
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

export default function DreamDegreeInput({ onAnalyze, onBack, onFinishOnboarding }) {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [step, setStep] = useState(1);
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState('All');
  const [customJob, setCustomJob] = useState('');
  const [formData, setFormData] = useState({
    personalInfo: { name: '', age: '', district: '' },
    dreamJob: '',
    academicResults: { stream: '', subjects: {}, zScore: '' },
    personalityScores: {},
    lifestylePreferences: {}
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
    { title: t.discoverYourself, subtitle: t.discoverYourselfSubtitle, message: t.discoverYourselfDesc, color: "from-blue-600 to-blue-500" },
    { title: t.findDegreePath, subtitle: t.findDegreePathSubtitle, message: t.findDegreePathDesc, color: "from-blue-600 to-blue-500" },
    { title: t.seeFutureCareer, subtitle: t.seeFutureCareerSubtitle, message: t.seeFutureCareerDesc, color: "from-blue-600 to-blue-500" },
    { title: t.startJourney, subtitle: t.startJourneySubtitle, message: t.startJourneyDesc, color: "from-blue-600 to-blue-500", hasButton: true }
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
      // Fixed-subject streams: auto-populate all subjects
      (info.subjects || []).forEach(s => { subjects[s] = ''; });
    }
    // Bucket-based streams (Arts): subjects start empty, user selects from buckets
    setFormData({
      ...formData,
      academicResults: { ...formData.academicResults, stream, subjects }
    });
  };

  // Handle Arts stream subject selection from buckets
  const handleArtsSubjectToggle = (subject, bucketName) => {
    const currentSubjects = { ...formData.academicResults.subjects };
    const streamData = STREAM_SUBJECTS[formData.academicResults.stream];

    if (currentSubjects.hasOwnProperty(subject)) {
      // Deselect subject
      delete currentSubjects[subject];
    } else {
      // Check total limit (max 3 subjects)
      if (Object.keys(currentSubjects).length >= 3) return;

      // Check bucket limit
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

  // Helper: find which bucket a subject belongs to
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

  // Check if step is complete
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

  // Get personality score color based on value
  const getScoreColor = (value) => {
    if (value <= 3) return 'from-red-400 to-orange-400';
    if (value <= 5) return 'from-orange-400 to-yellow-400';
    if (value <= 7) return 'from-yellow-400 to-green-400';
    return 'from-green-400 to-emerald-500';
  };

  const getScoreBarWidth = (value) => `${(value / 10) * 100}%`;

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)'
    }}>
      <style>{`
        .onboarding-slide { animation: slideIn 0.6s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .onboarding-icon { animation: float 3s ease-in-out infinite; }

        .onboarding-card {
          background: white; border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.15);
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #edf2f7;
        }
        .onboarding-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 35px 60px -15px rgba(37, 99, 235, 0.25); }
        .onboarding-gradient { position: absolute; inset: 0; opacity: 0.08; transition: opacity 0.4s ease; }
        .onboarding-card:hover .onboarding-gradient { opacity: 0.15; }

        .particle { position: absolute; border-radius: 50%; pointer-events: none; animation: particleFloat 8s infinite ease-in-out; }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
          50% { transform: translateY(-40px) translateX(-10px); opacity: 0.4; }
        }

        /* Custom range slider */
        input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
        input[type="range"]::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; background: #e2e8f0; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          margin-top: -8px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
          transition: transform 0.15s ease; border: 3px solid white;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-track { height: 8px; border-radius: 999px; background: #e2e8f0; border: none; }
        input[type="range"]::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
          border: 3px solid white; cursor: pointer;
        }

        /* Job card hover */
        .job-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .job-card:hover { transform: translateY(-4px); }
        .job-card.selected { ring: 2px; }

        /* Lifestyle option card */
        .lifestyle-option { transition: all 0.2s ease; cursor: pointer; }
        .lifestyle-option:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .lifestyle-option.selected { border-color: #3b82f6; background: linear-gradient(135deg, #eff6ff, #dbeafe); }

        /* Scrollbar */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Grade button */
        .grade-btn { transition: all 0.15s ease; }
        .grade-btn:hover { transform: scale(1.08); }
        .grade-btn.selected { transform: scale(1.08); }
      `}</style>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* ============ ONBOARDING ============ */}
        {onboardingStep >= 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="min-h-[70vh] flex flex-col justify-center items-center onboarding-slide relative"
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="particle" style={{
                  width: `${Math.random() * 8 + 4}px`, height: `${Math.random() * 8 + 4}px`,
                  background: `rgba(37, 99, 235, ${Math.random() * 0.25 + 0.05})`,
                  left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 5 + 5}s`
                }} />
              ))}

              <div className="onboarding-card p-12 max-w-3xl w-full text-center">
                <div className={`onboarding-gradient bg-gradient-to-br ${onboardingSlides[onboardingStep].color}`} />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10 mb-6">
                  {onboardingStep === 0 && <DiscoverYourselfAnimation />}
                  {onboardingStep === 1 && <FindDegreePathAnimation />}
                  {onboardingStep === 2 && <FutureCareerAnimation />}
                  {onboardingStep === 3 && <StartJourneyAnimation />}
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-10 text-4xl font-bold text-gray-900 mb-4">
                  {onboardingSlides[onboardingStep].title}
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative z-10 text-xl text-gray-600 mb-6">
                  {onboardingSlides[onboardingStep].subtitle}
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative z-10 text-lg text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                  {onboardingSlides[onboardingStep].message}
                </motion.p>

                {/* Progress Dots */}
                <div className="relative z-10 flex justify-center space-x-3 mb-8">
                  {onboardingSlides.map((_, index) => (
                    <motion.div key={index} animate={{ width: index === onboardingStep ? 32 : 8 }} transition={{ duration: 0.3 }}
                      className={`h-2 rounded-full ${index === onboardingStep ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-200'}`} />
                  ))}
                </div>

                {/* Nav Buttons */}
                <div className="relative z-10 flex justify-center space-x-4">
                  {onboardingStep > 0 && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePreviousOnboarding}
                      className="px-6 py-3 rounded-xl font-semibold bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50 transition-all">
                      ← {t.back}
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSkipOnboarding}
                    className="px-6 py-3 rounded-xl font-semibold bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50 transition-all">
                    {t.skip} →
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextOnboarding}
                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all">
                    {onboardingStep === onboardingSlides.length - 1 ? t.getStarted : `${t.next} →`}
                  </motion.button>
                </div>
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
                  }`}>
                  {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t.title || 'Future Dream Degree Advisor'}</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-4">
                {t.subtitle || 'Discover your ideal academic pathway based on your future goal'}
              </p>
              <button onClick={handleUseDummyData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium border border-blue-200 shadow-sm">
                <span>🎯</span> {t.useDummyData || 'Use Sample Data'}
              </button>
            </div>

            {/* ========== PROGRESS STEPPER ========== */}
            <div className="flex justify-center mb-10">
              <div className="flex items-center">
                {stepTitles.map((info, index) => (
                  <div key={index} className="flex items-center">
                    <button onClick={() => setStep(index + 1)}
                      className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 cursor-pointer ${
                        step === index + 1
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 scale-110'
                          : isStepComplete(index + 1)
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                            : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                      }`}>
                      <span className="text-xl">{isStepComplete(index + 1) && step !== index + 1 ? '✓' : info.icon}</span>
                    </button>
                    {index < 3 && (
                      <div className={`w-12 md:w-20 h-1 mx-1 rounded-full transition-all duration-500 ${
                        isStepComplete(index + 1) ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-200'
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
                <span className="text-sm font-normal text-gray-400 ml-2">Step {step}/4</span>
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
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-xl shadow-gray-200/50"
              >

                {/* ===== STEP 1: Personal Info + Dream Job ===== */}
                {step === 1 && (
                  <div className="space-y-8">
                    {/* Personal Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.name || 'Your Name'} <span className="text-red-400">*</span></label>
                        <input type="text" value={formData.personalInfo.name}
                          onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, name: e.target.value } })}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="Enter your name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.age || 'Age'}</label>
                        <input type="number" min="15" max="30" value={formData.personalInfo.age}
                          onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, age: e.target.value } })}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="e.g. 18" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.district || 'District'} <span className="text-red-400">*</span></label>
                        <select value={formData.personalInfo.district}
                          onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, district: e.target.value } })}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all">
                          <option value="">Select district</option>
                          {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Dream Job Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">Select Your Dream Career <span className="text-red-400">*</span></label>

                      {/* Search + Filter Bar */}
                      <div className="flex flex-col md:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input type="text" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                            placeholder={t.searchPlaceholder || 'Search careers...'} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => setJobCategory(cat)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                jobCategory === cat
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                  : `bg-white ${colors.border} hover:shadow-md`
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
                                <span className="text-xs text-gray-500">Demand</span>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full bg-gradient-to-r ${colors.accent} rounded-full`} style={{ width: `${job.marketDemand}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{job.marketDemand}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Job Input */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 mb-2">Can't find your dream career? Type it below:</p>
                        <div className="flex gap-3">
                          <input type="text" value={customJob} onChange={(e) => setCustomJob(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Marine Biologist, Game Designer..." />
                          <button onClick={handleCustomJobSelect} disabled={!customJob.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20">
                            Select
                          </button>
                        </div>
                      </div>

                      {formData.dreamJob && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Selected Career</p>
                            <p className="text-lg font-bold text-blue-900">{formData.dreamJob}</p>
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
                        G.C.E. A/L Stream <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(STREAM_SUBJECTS).map(([stream, info]) => {
                          const isSelected = formData.academicResults.stream === stream;
                          return (
                            <button key={stream} onClick={() => handleStreamChange(stream)}
                              className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/15'
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
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
                                {info.hasSubjectBuckets
                                  ? 'Choose 3 from subject groups'
                                  : info.subjects.join(', ')}
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
                          Z-Score <span className="text-red-400">*</span>
                        </label>
                        <input type="number" step="0.01" min="0" max="3.5"
                          value={formData.academicResults.zScore}
                          onChange={(e) => setFormData({ ...formData, academicResults: { ...formData.academicResults, zScore: e.target.value } })}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-lg font-mono"
                          placeholder="e.g. 1.85" />
                        <p className="text-xs text-gray-400 mt-1.5">Typical range: 0.00 - 3.00. Medicine requires ~1.90+</p>
                      </div>

                      {/* Subject Grades for fixed-subject streams */}
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

                    {/* ===== Arts Stream: Bucket-based Subject Selection ===== */}
                    {isArtsBucket && streamInfo?.subjectBuckets && (
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span>📖</span> Select Your 3 A/L Subjects
                          </h3>
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            Object.keys(formData.academicResults.subjects).length === 3
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {Object.keys(formData.academicResults.subjects).length}/3 selected
                          </span>
                        </div>

                        {Object.entries(streamInfo.subjectBuckets).map(([bucketName, bucket]) => {
                          const selectedFromBucket = bucket.subjects.filter(s => formData.academicResults.subjects.hasOwnProperty(s)).length;
                          const bucketFull = selectedFromBucket >= bucket.maxFromBucket;
                          const totalFull = Object.keys(formData.academicResults.subjects).length >= 3;

                          return (
                            <div key={bucketName} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{bucket.icon}</span>
                                  <h4 className="font-semibold text-gray-800">{bucketName}</h4>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  bucketFull ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {bucket.note}
                                </span>
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
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'
                                      }`}>
                                      {subject}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Grade selection for selected Arts subjects */}
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
                        <div key={trait} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
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

                          {/* Progress bar */}
                          <div className="relative h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                            <motion.div
                              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreColor(value)}`}
                              initial={false}
                              animate={{ width: getScoreBarWidth(value) }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>

                          {/* Slider */}
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
                      <div key={factor} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
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
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-500/10 selected'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}>
                                {optionIcon && <span className="text-xl block mb-1">{optionIcon}</span>}
                                <span className={`text-sm font-semibold block ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
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
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                  <button onClick={onBack}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 font-medium flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Exit
                  </button>

                  <div className="flex gap-3">
                    {step > 1 && (
                      <button onClick={prevStep}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 font-medium flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                    )}
                    {step < 4 ? (
                      <button onClick={nextStep}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-medium flex items-center gap-2 text-sm">
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
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/30'
                            : 'bg-gray-300 text-gray-500 shadow-none cursor-not-allowed'
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
  );
}

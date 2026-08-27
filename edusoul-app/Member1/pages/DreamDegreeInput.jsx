import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dreamJobs, personalityTraits, lifestyleFactors, languageTranslations } from '../data/dreamDegreeData';
import { DiscoverYourselfAnimation, FindDegreePathAnimation, FutureCareerAnimation, StartJourneyAnimation } from '../components/OnboardingAnimations';
import { useLanguage } from '../../src/App';
import { translations } from '../data/languageTranslations';

export default function DreamDegreeInput({ onAnalyze, onBack, onFinishOnboarding }) {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      age: '',
      district: ''
    },
    dreamJob: '',
    academicResults: {
      stream: '',
      subjects: {},
      zScore: ''
    },
    personalityScores: {},
    lifestylePreferences: {}
  });

  const onboardingSlides = [
    {
      title: t.discoverYourself,
      subtitle: t.discoverYourselfSubtitle,
      icon: "🌱",
      message: t.discoverYourselfDesc,
      color: "from-blue-600 to-blue-500"
    },
    {
      title: t.findDegreePath,
      subtitle: t.findDegreePathSubtitle,
      icon: "🎓",
      message: t.findDegreePathDesc,
      color: "from-blue-600 to-blue-500"
    },
    {
      title: t.seeFutureCareer,
      subtitle: t.seeFutureCareerSubtitle,
      icon: "🚀",
      message: t.seeFutureCareerDesc,
      color: "from-blue-600 to-blue-500"
    },
    {
      title: t.startJourney,
      subtitle: t.startJourneySubtitle,
      icon: "🧭",
      message: t.startJourneyDesc,
      color: "from-blue-600 to-blue-500",
      hasButton: true
    }
  ];

  const handleNextOnboarding = () => {
    if (onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      if (onFinishOnboarding) {
        onFinishOnboarding();
      } else {
        setOnboardingStep(-1); // Move to form
      }
    }
  };

  const handleSkipOnboarding = () => {
    if (onFinishOnboarding) {
      onFinishOnboarding();
    } else {
      setOnboardingStep(-1); // Skip to form directly
    }
  };

  const handlePreviousOnboarding = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleDreamJobChange = (jobId) => {
    const selectedJob = dreamJobs.find(job => job.id === jobId);
    setFormData({ ...formData, dreamJob: selectedJob.title });
  };

  const handlePersonalityChange = (trait, value) => {
    setFormData({
      ...formData,
      personalityScores: {
        ...formData.personalityScores,
        [trait]: value
      }
    });
  };

  const handleLifestyleChange = (factor, value) => {
    setFormData({
      ...formData,
      lifestylePreferences: {
        ...formData.lifestylePreferences,
        [factor]: value
      }
    });
  };

  const handleSubmit = () => {
    onAnalyze(formData);
  };

  const handleUseDummyData = () => {
    const dummyData = {
      personalInfo: {
        name: 'John Doe',
        age: '18',
        district: 'Colombo'
      },
      dreamJob: 'Software Engineer',
      academicResults: {
        stream: 'Mathematics',
        subjects: {
          'Combined Mathematics': 'A',
          'Physics': 'A',
          'Chemistry': 'B'
        },
        zScore: '1.85'
      },
      personalityScores: {
        analytical_thinking: 8,
        creativity: 7,
        leadership: 6,
        communication: 7,
        problem_solving: 9,
        teamwork: 6,
        adaptability: 8,
        attention_to_detail: 7
      },
      lifestylePreferences: {
        locationPreference: 'Urban',
        familyAttachment: 'Medium',
        workLifeBalance: 'Important',
        salaryExpectation: 'High',
        careerGrowth: 'Very Important'
      }
    };
    setFormData(dummyData);
    setStep(4);
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepTitles = [
    { icon: '🎯', title: t.futureGoal, subtitle: t.futureGoalSubtitle },
    { icon: '📚', title: t.academicResults, subtitle: t.academicResultsSubtitle },
    { icon: '🧠', title: t.personality, subtitle: t.personalitySubtitle },
    { icon: '🌟', title: t.lifestyle, subtitle: t.lifestyleSubtitle }
  ];

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{
      background: 'radial-gradient(circle at 78% 50%, rgba(219, 237, 255, 0.65), transparent 32%), #ffffff'
    }}>
      <style>{`
        /* Onboarding Slide Styles */
        .onboarding-slide {
          animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .onboarding-icon {
          animation: float 3s ease-in-out infinite;
        }

        .onboarding-icon-rotate {
          animation: rotateIn 0.8s ease-out, float 3s ease-in-out infinite 0.8s;
        }

        .onboarding-icon-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .onboarding-card {
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.15);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #edf2f7;
        }

        .onboarding-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 35px 60px -15px rgba(37, 99, 235, 0.25);
        }

        .onboarding-gradient {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          transition: opacity 0.4s ease;
        }

        .onboarding-card:hover .onboarding-gradient {
          opacity: 0.15;
        }

        .onboarding-progress-dot {
          height: 0.5rem;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }

        .onboarding-progress-dot.active {
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          width: 2rem;
        }

        .onboarding-progress-dot.inactive {
          background: #e2e8f0;
          width: 0.5rem;
        }

        .onboarding-button {
          padding: 0.75rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .onboarding-button-primary {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }

        .onboarding-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        .onboarding-button-secondary {
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
        }

        .onboarding-button-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
        }

        /* Particle effect styles */
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 8s infinite ease-in-out;
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-40px) translateX(-10px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(20px) rotate(270deg);
            opacity: 0.7;
          }
        }

        /* SVG animation styles */
        .svg-icon {
          animation: svgDraw 2s ease-in-out infinite;
        }

        @keyframes svgDraw {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 100;
          }
        }

        /* Text reveal animation */
        .text-reveal {
          animation: textReveal 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes textReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Onboarding Slides */}
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
              {/* Particle Effects */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    background: `rgba(37, 99, 235, ${Math.random() * 0.3 + 0.1})`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 5 + 5}s`
                  }}
                />
              ))}

              {/* Slide Content */}
              <div className="onboarding-card p-12 max-w-3xl w-full text-center">
                {/* Gradient Background */}
                <div className={`onboarding-gradient bg-gradient-to-br ${onboardingSlides[onboardingStep].color}`} />
                
                {/* SVG Animation based on slide */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="relative z-10 mb-6"
                >
                  {onboardingStep === 0 && <DiscoverYourselfAnimation />}
                  {onboardingStep === 1 && <FindDegreePathAnimation />}
                  {onboardingStep === 2 && <FutureCareerAnimation />}
                  {onboardingStep === 3 && <StartJourneyAnimation />}
                </motion.div>

                {/* Title with reveal */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative z-10 text-4xl font-bold text-gray-900 mb-4 text-reveal"
                >
                  {onboardingSlides[onboardingStep].title}
                </motion.h2>

                {/* Subtitle with reveal */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="relative z-10 text-xl text-gray-600 mb-6 text-reveal"
                >
                  {onboardingSlides[onboardingStep].subtitle}
                </motion.p>

                {/* Message with reveal */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="relative z-10 text-lg text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed text-reveal"
                >
                  {onboardingSlides[onboardingStep].message}
                </motion.p>

                {/* Progress Dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="relative z-10 flex justify-center space-x-3 mb-8"
                >
                  {onboardingSlides.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ width: 8 }}
                      animate={{ width: index === onboardingStep ? 32 : 8 }}
                      transition={{ duration: 0.3 }}
                      className={`onboarding-progress-dot ${index === onboardingStep ? 'active' : 'inactive'}`}
                    />
                  ))}
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="relative z-10 flex justify-center space-x-4"
                >
                  {onboardingStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePreviousOnboarding}
                      className="onboarding-button onboarding-button-secondary"
                    >
                      ← {t.back}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSkipOnboarding}
                    className="onboarding-button onboarding-button-secondary"
                  >
                    {t.skip} →
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextOnboarding}
                    className={`onboarding-button onboarding-button-primary bg-gradient-to-r ${onboardingSlides[onboardingStep].color}`}
                  >
                    {onboardingStep === onboardingSlides.length - 1 ? t.getStarted : `${t.next} →`}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Main Form */}
        {onboardingStep === -1 && (
          <>
            {/* Language Switcher */}
            <div className="flex justify-end mb-6 space-x-2">
              {['en', 'si', 'ta'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm ${
                    language === lang
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-4">
                {t.subtitle}
              </p>
              <button
                onClick={handleUseDummyData}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium border border-blue-200"
              >
                🎯 {t.useDummyData}
              </button>
            </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {stepTitles.map((stepInfo, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 ${
                    step >= index + 1
                      ? 'step-indicator text-white scale-110'
                      : 'step-indicator-inactive'
                  }`}
                >
                  <span className="text-2xl">{stepInfo.icon}</span>
                  {step > index + 1 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-24 h-2 mx-2 rounded-full transition-all duration-500 ${
                      step > index + 1
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <span className="mr-3">{stepTitles[step - 1].icon}</span>
            {stepTitles[step - 1].title}
          </h2>
          <p className="text-gray-600">{stepTitles[step - 1].subtitle}</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: {
                        ...formData.personalInfo,
                        name: e.target.value
                      }
                    })
                  }
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">
                  District
                </label>
                <select
                  value={formData.personalInfo.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: {
                        ...formData.personalInfo,
                        district: e.target.value
                      }
                    })
                  }
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                >
                  <option value="">Select your district</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Matara">Matara</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-gray-700 font-medium mb-4">
                  Select Your Dream Job
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dreamJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleDreamJobChange(job.id)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        formData.dreamJob === job.title
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-orange-50 shadow-xl shadow-blue-500/30'
                          : 'border-gray-200 bg-white hover:border-blue-500/50 hover:bg-blue-50'
                      }`}
                    >
                      {formData.dreamJob === job.title && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{job.category}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300">
                          📈 Demand: {job.marketDemand}%
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-300">
                          💰 {job.averageSalary}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">
                  A/L Stream
                </label>
                <select
                  value={formData.academicResults.stream}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicResults: {
                        ...formData.academicResults,
                        stream: e.target.value
                      }
                    })
                  }
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                >
                  <option value="">Select your stream</option>
                  <option value="Physical Science">Physical Science</option>
                  <option value="Biological Science">Biological Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Z-Score (if available)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.academicResults.zScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicResults: {
                        ...formData.academicResults,
                        zScore: e.target.value
                      }
                    })
                  }
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Enter your Z-Score"
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Subject Grades (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Subject 1', 'Subject 2', 'Subject 3'].map((subject, idx) => (
                    <div key={idx} className="space-y-2">
                      <input
                        type="text"
                        placeholder={`${subject} Name`}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Grade</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="S">S</option>
                        <option value="F">F</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              {Object.entries(personalityTraits).map(([trait, data], index) => (
                <div key={trait} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {trait.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <p className="text-gray-600 text-sm">{data.description}</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
                      {formData.personalityScores[trait] || 5}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.personalityScores[trait] || 5}
                    onChange={(e) =>
                      handlePersonalityChange(trait, parseInt(e.target.value))
                    }
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span>Low (1)</span>
                    <span className="font-bold text-gray-900">High (10)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {Object.entries(lifestyleFactors).map(([factor, data], index) => (
                <div key={factor} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-blue-500/30 transition-all">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {factor.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{data.description}</p>
                  <select
                    value={formData.lifestylePreferences[factor] || ''}
                    onChange={(e) => handleLifestyleChange(factor, e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                  >
                    <option value="">Select preference</option>
                    {data.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border border-gray-300 font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Exit</span>
            </button>
            
            <div className="flex space-x-4">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border border-gray-300 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-500/30 font-medium flex items-center space-x-2"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-500/30 font-medium flex items-center space-x-2 animate-pulse"
                >
                  <span>🚀 {t.analyze}</span>
                </button>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

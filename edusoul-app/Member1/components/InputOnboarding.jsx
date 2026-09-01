import { motion, AnimatePresence } from 'framer-motion';
import { DiscoverYourselfAnimation, FindDegreePathAnimation, FutureCareerAnimation, StartJourneyAnimation } from './OnboardingAnimations';

export default function InputOnboarding({ onboardingStep, setOnboardingStep, onboardingSlides, handleNextOnboarding, handleSkipOnboarding, handlePreviousOnboarding, t }) {
  return (
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
  );
}

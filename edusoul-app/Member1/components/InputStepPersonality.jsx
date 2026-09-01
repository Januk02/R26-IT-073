import { motion } from 'framer-motion';

export default function InputStepPersonality({ formData, handlePersonalityChange, personalityTraits, getScoreColor, getScoreBarWidth }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 mb-2">Rate yourself on each trait from 0 (lowest) to 10 (highest)</p>
      {Object.entries(personalityTraits).map(([trait, data]) => {
        const value = formData.personalityScores[trait] || 0;
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

            <input type="range" min="0" max="10" value={value}
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
  );
}

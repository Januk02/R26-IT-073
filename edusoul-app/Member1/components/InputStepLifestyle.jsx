import { useAdvisorTranslation } from '../data/advisorTranslations';
export default function InputStepLifestyle({ formData, handleLifestyleChange, lifestyleFactors }) {
  const tr = useAdvisorTranslation();
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 mb-2">{tr("Choose what matters most to you in your future career")}</p>
      {tr(Object.entries(lifestyleFactors).map(([factor, data]) => (
        <div key={factor} className="p-5 glass-subtle rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{tr(data.icon)}</span>
            <div>
              <h3 className="font-bold text-gray-900">{tr(data.label)}</h3>
              <p className="text-xs text-gray-500">{tr(data.description)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tr(data.options.map((option) => {
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
                  {tr(optionIcon && <span className="text-xl block mb-1">{tr(optionIcon)}</span>)}
                  <span className={`text-sm font-semibold block ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {tr(optionLabel)}
                  </span>
                  {tr(optionDesc && <span className="text-xs text-gray-400 block mt-0.5">{tr(optionDesc)}</span>)}
                </button>
              );
            }))}
          </div>
        </div>
      )))}
    </div>
  );
}

export default function InputStepLifestyle({ formData, handleLifestyleChange, lifestyleFactors }) {
  return (
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
  );
}

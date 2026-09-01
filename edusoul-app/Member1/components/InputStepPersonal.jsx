export default function InputStepPersonal({ formData, setFormData, jobSearch, setJobSearch, jobCategory, setJobCategory, categories, filteredJobs, customJob, setCustomJob, handleDreamJobChange, handleCustomJobSelect, t, CATEGORY_COLORS, DEFAULT_COLORS, ALL_DISTRICTS }) {
  return (
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
  );
}

import { useAdvisorTranslation } from '../data/advisorTranslations';
export default function InputStepAcademic({ formData, setFormData, handleStreamChange, handleSubjectGradeChange, handleSubjectToggle, getSubjectBucket, streamInfo, hasSubjectBuckets, streamSubjects, STREAM_SUBJECTS }) {
  const tr = useAdvisorTranslation();
  return (
    <div className="space-y-6">
      {/* Stream Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">{tr("G.C.E. A/L Stream")}<span className="text-orange-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tr(Object.entries(STREAM_SUBJECTS).map(([stream, info]) => {
            const isSelected = formData.academicResults.stream === stream;
            return (
              <button key={stream} onClick={() => handleStreamChange(stream)}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                    : 'border-gray-200 bg-white/60 hover:border-blue-300 hover:shadow-md hover:bg-white/80'
                }`}>
                {tr(isSelected && (
                  <div className={`absolute top-3 right-3 w-6 h-6 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center`}>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
                <span className="text-2xl block mb-2">{tr(info.icon)}</span>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{tr(stream)}</h4>
                <p className="text-xs text-gray-400 leading-snug">
                  {tr(info.hasSubjectBuckets ? 'Choose 3 from subject groups' : info.subjects.join(', '))}
                </p>
                <div className="mt-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{tr("Leads to:")}</span>
                  <p className="text-xs text-blue-600 font-medium">{tr(info.degrees)}</p>
                </div>
              </button>
            );
          }))}
        </div>
      </div>

      {/* Z-Score + Subject Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{tr("Z-Score")}<span className="text-orange-500">*</span>
          </label>
          <input type="number" step="0.01" min="-4" max="4"
            value={formData.academicResults.zScore}
            onChange={(e) => setFormData({ ...formData, academicResults: { ...formData.academicResults, zScore: e.target.value } })}
            className="w-full px-4 py-3.5 glass-input rounded-xl text-lg font-mono"
            placeholder={tr("e.g. 1.85")} />
          <p className="text-xs text-gray-400 mt-1.5">{tr("Enter your official Z-score. Course and district cutoffs must be checked separately.")}</p>
        </div>

        <label className="block text-sm font-semibold text-gray-700">
          {tr('Common General Test mark (optional)')}
          <input type="number" min="0" max="100" value={formData.academicResults.commonGeneralTest ?? ''} onChange={event => setFormData({ ...formData, academicResults: { ...formData.academicResults, commonGeneralTest: event.target.value === '' ? undefined : Number(event.target.value) } })} className="block w-full mt-2 px-4 py-3 glass-input rounded-xl" />
        </label>

        {tr(!hasSubjectBuckets && streamSubjects.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span>{tr("Subject Grades")}<span className="text-xs font-normal text-gray-400">{tr("(Optional)")}</span>
            </h3>
            <div className="space-y-3">
              {tr(streamSubjects.map(subject => (
                <div key={subject} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 min-w-[140px] truncate">{tr(subject)}</span>
                  <div className="flex gap-2">
                    {tr(['A', 'B', 'C', 'S', 'F'].map(grade => {
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
                          {tr(grade)}
                        </button>
                      );
                    }))}
                  </div>
                </div>
              )))}
            </div>
          </div>
        ))}
      </div>

      {/* Predicted Performance */}
      <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📈</span>{tr("Predicted Performance")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tr("Expected Improvement")}</label>
            <select
              value={formData.academicResults.predictedPerformance?.improvement || "Medium"}
              onChange={(e) => setFormData({
                ...formData,
                academicResults: {
                  ...formData.academicResults,
                  predictedPerformance: {
                    ...formData.academicResults.predictedPerformance,
                    improvement: e.target.value
                  }
                }
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
            >
              <option value="Low">{tr("Low")}</option>
              <option value="Medium">{tr("Medium")}</option>
              <option value="High">{tr("High")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tr("Potential Z-Score")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="3.5"
              value={formData.academicResults.predictedPerformance?.potentialZScore || ""}
              onChange={(e) => setFormData({
                ...formData,
                academicResults: {
                  ...formData.academicResults,
                  predictedPerformance: {
                    ...formData.academicResults.predictedPerformance,
                    potentialZScore: parseFloat(e.target.value) || ""
                  }
                }
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
              placeholder={tr("e.g. 2.5")}
            />
          </div>
        </div>
      </div>

      {/* Subject Buckets */}
      {tr(hasSubjectBuckets && streamInfo?.subjectBuckets && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📖</span>{tr("Select Your A/L Subjects")}</h3>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              formData.academicResults.stream === 'Arts' && Object.keys(formData.academicResults.subjects).length === 3
                ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {tr(formData.academicResults.stream === 'Arts'
                ? `${Object.keys(formData.academicResults.subjects).length}/3 selected`
                : `${Object.keys(formData.academicResults.subjects).length} subjects selected`)
              }
            </span>
          </div>

          {tr(Object.entries(streamInfo.subjectBuckets).map(([bucketName, bucket]) => {
            const selectedFromBucket = bucket.subjects.filter(s => formData.academicResults.subjects.hasOwnProperty(s)).length;
            const bucketFull = selectedFromBucket >= bucket.maxFromBucket;
            // For Arts stream, limit to 3 total subjects. For other streams, allow core + optional
            const totalFull = Object.keys(formData.academicResults.subjects).length >= 3;
            return (
              <div key={bucketName} className="p-4 glass-subtle rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tr(bucket.icon)}</span>
                    <h4 className="font-semibold text-gray-800">{tr(bucketName)}</h4>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    bucketFull ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                  }`}>{tr(bucket.note)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tr(bucket.subjects.map(subject => {
                    const isSelected = formData.academicResults.subjects.hasOwnProperty(subject);
                    const isDisabled = !isSelected && (totalFull || bucketFull);
                    return (
                      <button key={subject}
                        onClick={() => !isDisabled && handleSubjectToggle(subject, bucketName)}
                        disabled={isDisabled}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : isDisabled
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'
                        }`}>{tr(subject)}</button>
                    );
                  }))}
                </div>
              </div>
            );
          }))}

          {tr(streamSubjects.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📝</span>{tr("Subject Grades")}<span className="text-xs font-normal text-gray-400">{tr("(Optional \u2014 Z-score is the primary factor)")}</span>
              </h3>
              <div className="space-y-3">
                {tr(streamSubjects.map(subject => (
                  <div key={subject} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">{tr(getSubjectBucket(subject))}</span>
                      <span className="text-sm font-medium text-gray-700 truncate">{tr(subject)}</span>
                    </div>
                    <div className="flex gap-2">
                      {tr(['A', 'B', 'C', 'S', 'F'].map(grade => {
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
                            }`}>{tr(grade)}</button>
                        );
                      }))}
                    </div>
                  </div>
                )))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

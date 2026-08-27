import { useState } from 'react';
import { universities, dreamJobs, languageTranslations } from '../data/dreamDegreeData';

export default function DreamDegreeResults({ studentData, onBack, onHome, onViewRoadmap, onViewGuidance }) {
  const [language, setLanguage] = useState('en');
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const t = languageTranslations[language];

  // Mock analysis logic - in real implementation, this would use the AI model
  const analyzeResults = () => {
    const dreamJob = dreamJobs.find(job => job.title === studentData.dreamJob);
    const zScore = parseFloat(studentData.academicResults.zScore) || 0;
    
    const recommendations = universities
      .map(university => {
        const matchingPrograms = university.programs.filter(program => {
          const matchesQualification = dreamJob.requiredQualifications.some(q => 
            q.toLowerCase().includes(program.name.toLowerCase()) || 
            program.name.toLowerCase().includes(q.toLowerCase().split(' ')[1])
          );
          const meetsZScore = zScore >= program.zScoreCutoff - 0.3; // Small buffer
          return matchesQualification && meetsZScore;
        });

        if (matchingPrograms.length === 0) return null;

        const matchScore = calculateMatchScore(university, studentData, dreamJob);

        return {
          university,
          programs: matchingPrograms,
          matchScore,
          explanations: generateXAIExplanation(university, studentData, dreamJob, matchScore)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    return recommendations;
  };

  const calculateMatchScore = (university, studentData, dreamJob) => {
    let score = 0;
    
    // Academic match (40%)
    const zScore = parseFloat(studentData.academicResults.zScore) || 0;
    const avgCutoff = university.programs.reduce((sum, p) => sum + p.zScoreCutoff, 0) / university.programs.length;
    score += Math.min(40, (zScore / avgCutoff) * 40);

    // Personality match (30%)
    const personalityMatch = dreamJob.personalityMatch.filter(trait => 
      (studentData.personalityScores[trait] || 5) >= 6
    ).length;
    score += (personalityMatch / dreamJob.personalityMatch.length) * 30;

    // Lifestyle match (20%)
    if (studentData.lifestylePreferences.locationPreference === 'Urban' && university.urbanLocation) {
      score += 10;
    }
    if (studentData.lifestylePreferences.familyAttachment === 'Low - independent' || university.district === studentData.personalInfo.district) {
      score += 10;
    }

    // Market demand (10%)
    score += (dreamJob.marketDemand / 100) * 10;

    return Math.min(100, Math.round(score));
  };

  const generateXAIExplanation = (university, studentData, dreamJob, matchScore) => {
    const explanations = [];
    
    // Academic explanation
    const zScore = parseFloat(studentData.academicResults.zScore) || 0;
    const avgCutoff = university.programs.reduce((sum, p) => sum + p.zScoreCutoff, 0) / university.programs.length;
    if (zScore >= avgCutoff) {
      explanations.push({
        type: 'academic',
        icon: '📚',
        title: 'Strong Academic Match',
        text: `Your Z-Score of ${zScore} meets the required cutoff of ${avgCutoff.toFixed(2)} for ${university.name}.`
      });
    } else if (zScore >= avgCutoff - 0.3) {
      explanations.push({
        type: 'academic',
        icon: '📚',
        title: 'Competitive Academic Standing',
        text: `Your Z-Score of ${zScore} is close to the cutoff of ${avgCutoff.toFixed(2)}. Consider district quota benefits.`
      });
    }

    // Personality explanation
    const matchingTraits = dreamJob.personalityMatch.filter(trait => 
      (studentData.personalityScores[trait] || 5) >= 6
    );
    if (matchingTraits.length > 0) {
      explanations.push({
        type: 'personality',
        icon: '🧠',
        title: 'Personality Alignment',
        text: `Your strong ${matchingTraits.join(', ')} traits align well with ${dreamJob.title} requirements.`
      });
    }

    // Lifestyle explanation
    if (studentData.lifestylePreferences.locationPreference === 'Urban' && university.urbanLocation) {
      explanations.push({
        type: 'lifestyle',
        icon: '🏙️',
        title: 'Location Compatibility',
        text: `${university.name} is in an urban area, matching your preference for city life.`
      });
    }

    if (university.district === studentData.personalInfo.district) {
      explanations.push({
        type: 'lifestyle',
        icon: '🏠',
        title: 'District Advantage',
        text: `Being in your home district (${university.district}) may provide admission quota benefits.`
      });
    }

    // Market demand explanation
    if (dreamJob.marketDemand >= 85) {
      explanations.push({
        type: 'market',
        icon: '📈',
        title: 'High Market Demand',
        text: `${dreamJob.title} has ${dreamJob.marketDemand}% market demand, ensuring strong future goal prospects.`
      });
    }

    return explanations;
  };

  const recommendations = analyzeResults();

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-blue-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6 space-x-2">
          {['en', 'si', 'ta'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === lang
                  ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.results}</h1>
          <p className="text-gray-600 text-lg">
            University recommendations based on your profile
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">University Recommendations</h2>
          
          {recommendations.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-800 font-medium">
                No direct matches found based on your current Z-Score. Consider viewing the improvement guidance for suggestions.
              </p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={rec.university.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* University Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">{rec.university.name}</h3>
                      <p className="text-purple-100">{rec.university.district} District</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{rec.matchScore}%</div>
                      <p className="text-sm text-purple-100">Match Score</p>
                    </div>
                  </div>
                </div>

                {/* Programs */}
                <div className="p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Recommended Programs</h4>
                  <div className="space-y-2 mb-6">
                    {rec.programs.map((program, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{program.name}</p>
                          <p className="text-sm text-gray-600">{program.stream} • {program.duration}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Cutoff: {program.zScoreCutoff}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* XAI Explanations */}
                  <h4 className="font-bold text-gray-800 mb-3">Why This Recommendation?</h4>
                  <div className="space-y-3">
                    {rec.explanations.map((explanation, idx) => (
                      <div key={idx} className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                        <span className="text-2xl">{explanation.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800">{explanation.title}</p>
                          <p className="text-sm text-gray-600">{explanation.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => onViewRoadmap(rec)}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Future Goal Roadmap
                    </button>
                    <button
                      onClick={() => setSelectedUniversity(rec)}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Detailed Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Dream Job</p>
              <p className="text-xl font-bold text-purple-600">{studentData.dreamJob}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Z-Score</p>
              <p className="text-xl font-bold text-blue-600">{studentData.academicResults.zScore || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recommendations Found</p>
              <p className="text-xl font-bold text-green-600">{recommendations.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Input
          </button>

          <button
            onClick={onHome}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>

          <button
            onClick={onViewGuidance}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            View Improvement Guidance
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mentorship Matching Component
 * Demonstrates integration with the Python Flask backend
 */

import React, { useState } from 'react';
import {
  useApiHealth,
  useMentors,
  useMentees,
  useMatchPrediction,
  useFindMentors,
  useMentorshipStats,
} from '../hooks/useMentorship';

const MentorshipMatching = ({ externalStudents = [], showRawData = false }) => {
  // API health status
  const { status, loading: healthLoading, isConnected } = useApiHealth();

  // Data fetching
  const { mentors, loading: mentorsLoading } = useMentors();
  const { mentees: apiMentees, loading: menteesLoading } = useMentees();
  const { stats, loading: statsLoading } = useMentorshipStats();

  // Use external students if provided, otherwise fall back to API mentees
  const mentees = externalStudents.length > 0 ? externalStudents : apiMentees;

  // Actions
  const { predictMatch, result: matchResult, loading: matchLoading } = useMatchPrediction();
  const { findMentors, matches, loading: findLoading } = useFindMentors();

  // Local state
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentee, setSelectedMentee] = useState('');

  // Handle match prediction
  const handlePredict = async () => {
    if (!selectedMentor || !selectedMentee) return;
    
    // Find the selected mentee's full data
    const selectedMenteeData = mentees.find(m => 
      (m.mentee_id || m.id || m.student_id) === selectedMentee
    );
    
    // Pass the full mentee data to the API
    await predictMatch(selectedMentor, selectedMentee, selectedMenteeData || null);
  };

  // Handle find mentors
  const handleFindMentors = async () => {
    if (!selectedMentee) return;
    
    // Find the selected mentee's full data
    const selectedMenteeData = mentees.find(m => 
      (m.mentee_id || m.id || m.student_id) === selectedMentee
    );
    
    // Pass the full mentee data to the API
    await findMentors(selectedMentee, 5, selectedMenteeData || null);
  };

  if (healthLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          <span>Connecting to ML backend...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Backend Not Connected</h3>
        <p className="text-red-600 text-sm">
          Please start the Python backend server first:
        </p>
        <code className="block mt-2 p-2 bg-white rounded text-sm text-gray-700">
          cd backend && start.bat
        </code>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-purple-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Mentorship Matching</h2>
          <p className="text-gray-600 text-sm mt-1">
            Connected to ML backend • {status?.mentors_count?.toLocaleString() || 0} mentors available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-green-600 font-medium">Connected</span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Mentors" value={stats.total_mentors} color="purple" />
          <StatCard label="Total Mentees" value={stats.total_mentees} color="blue" />
          <StatCard label="Universities" value={stats.universities_represented} color="green" />
          <StatCard label="Gold Mentors" value={stats.verification_distribution?.Gold || 0} color="yellow" />
        </div>
      )}

      {/* Match Prediction */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-4">🔮 Predict Match Compatibility</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a Mentor</option>
            {mentors.slice(0, 20).map((mentor) => (
              <option key={mentor.mentor_id} value={mentor.mentor_id}>
                {mentor.name} • {mentor.domain} • {mentor.verification_level}
              </option>
            ))}
          </select>

          <select
            value={selectedMentee}
            onChange={(e) => setSelectedMentee(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a Mentee</option>
            {mentees.slice(0, 20).map((mentee) => {
              // Safely handle interests - could be array, object, or undefined
              let interests = mentee.interests || [];
              if (typeof interests === 'object' && !Array.isArray(interests)) {
                interests = Object.values(interests);
              }
              const interestsDisplay = Array.isArray(interests) && interests.length > 0
                ? interests.slice(0, 2).join(', ')
                : mentee.field_of_study || 'General';
              
              return (
                <option key={mentee.mentee_id || mentee.id || mentee.student_id} value={mentee.mentee_id || mentee.id || mentee.student_id}>
                  {mentee.name} • {interestsDisplay}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePredict}
            disabled={!selectedMentor || !selectedMentee || matchLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {matchLoading ? 'Analyzing...' : 'Predict Match'}
          </button>

          <button
            onClick={handleFindMentors}
            disabled={!selectedMentee || findLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {findLoading ? 'Searching...' : 'Find Best Mentors'}
          </button>
        </div>

        {/* Match Result */}
        {matchResult && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Match Result</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                matchResult.compatibility_score >= 80 ? 'bg-green-100 text-green-800' :
                matchResult.compatibility_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {matchResult.recommendation}
              </span>
            </div>

            {/* Overall Score Display */}
            <div className="text-center mb-4">
              <div className="inline-flex flex-col items-center p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                <span className="text-sm text-gray-600 mb-1">Overall Match Score</span>
                <div className="text-5xl font-bold text-purple-700">
                  {Math.round(matchResult.compatibility_score)}
                  <span className="text-2xl text-purple-500">/100</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                  ML Confidence: {Math.round(matchResult.match_probability)}%
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h5>
              <div className="space-y-3">
                {Object.entries(matchResult.breakdown || {}).map(([key, value]) => {
                  const roundedValue = Math.round(value);
                  const getColor = (val) => {
                    if (val >= 80) return 'bg-green-500';
                    if (val >= 60) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };
                  const getLabel = (k) => {
                    const labels = {
                      'domain_match': 'Domain Match',
                      'skills_alignment': 'Skills Match',
                      'experience_match': 'Experience',
                      'location_preference': 'Location',
                      'language_match': 'Language',
                      'availability_match': 'Availability',
                      'verification_bonus': 'Mentor Level',
                      'gold_domain_bonus': 'Gold Bonus'
                    };
                    return labels[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-32 text-xs text-gray-600">{getLabel(key)}</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getColor(roundedValue)} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, roundedValue)}%` }}
                        ></div>
                      </div>
                      <span className={`w-10 text-right text-sm font-semibold ${
                        roundedValue >= 80 ? 'text-green-600' :
                        roundedValue >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {roundedValue}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Top Matches */}
        {matches.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Top {matches.length} Recommended Mentors</h4>
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div
                  key={match.mentor_id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{match.name}</div>
                      <div className="text-xs text-gray-500">
                        {match.domain} • {match.experience_years} years • {match.verification_level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {match.compatibility_score}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain Distribution */}
      {stats?.mentor_domains && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Domain Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(stats.mentor_domains).map(([domain, count]) => (
              <div key={domain} className="p-2 bg-gray-50 rounded-lg text-sm">
                <div className="font-medium text-gray-700">{domain}</div>
                <div className="text-xs text-gray-500">{count} mentors</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug: Show raw data for selected student */}
      {showRawData && selectedMentee && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Selected Student Profile (Debug)</h3>
          {(() => {
            const student = mentees.find(m => (m.mentee_id || m.id || m.student_id) === selectedMentee);
            if (!student) return <p className="text-gray-500">No student selected</p>;
            return (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Name:</span> {student.name}</div>
                  <div><span className="font-medium">Field:</span> {student.field_of_study}</div>
                  <div><span className="font-medium">University:</span> {student.university}</div>
                  <div><span className="font-medium">Location:</span> {student.location}</div>
                  <div><span className="font-medium">Z-Score:</span> {student.z_score}</div>
                  <div><span className="font-medium">Work Env:</span> {student.work_environment}</div>
                </div>
                <div>
                  <span className="font-medium">Interests:</span> {(() => {
                    let ints = student.interests || [];
                    if (typeof ints === 'object' && !Array.isArray(ints)) {
                      ints = Object.values(ints);
                    }
                    return Array.isArray(ints) ? ints.join(', ') : 'None';
                  })()}
                </div>
                {student.al_results && (
                  <div>
                    <span className="font-medium">AL Results:</span>
                    <div className="ml-2 grid grid-cols-3 gap-1">
                      {Object.entries(student.al_results)
                        .filter(([_, v]) => v && typeof v === 'string' && v.length <= 2)
                        .map(([subject, grade]) => (
                          <span key={subject} className="bg-white px-2 py-1 rounded border">
                            {subject}: {grade}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                {student.career_goals?.length > 0 && (
                  <div>
                    <span className="font-medium">Career Goals:</span> {student.career_goals.join(', ')}
                  </div>
                )}
                {student.personality_traits && (
                  <div>
                    <span className="font-medium">Personality:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {Object.entries(student.personality_traits).map(([trait, value]) => (
                        <span key={trait} className="bg-white px-2 py-1 rounded border">
                          {trait}: {value}/5
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colors = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color] || colors.purple}`}>
      <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
};

export default MentorshipMatching;

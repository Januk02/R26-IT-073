import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MedalBadge, { getMedalTier, getMedalInfo } from './MedalBadge';

const MentorMedals = ({ mentorId, publicView = false }) => {
  const { user } = useAuth();
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    averageScore: 0,
    highestTier: null,
    bestVerification: null,
    interviewCount: 0,
    cvCount: 0,
    interviewAvg: 0,
    cvAvg: 0,
    combinedScore: 0
  });

  const targetMentorId = mentorId || user?.uid;

  useEffect(() => {
    if (targetMentorId) {
      fetchMedals();
    }
  }, [targetMentorId]);

  const fetchMedals = async () => {
    try {
      setLoading(true);
      
      // Fetch interview verifications
      const interviewQuery = query(
        collection(db, 'verifications'),
        where('mentorId', '==', targetMentorId)
      );
      const interviewSnapshot = await getDocs(interviewQuery);
      const interviews = interviewSnapshot.docs.map(doc => ({
        ...doc.data(),
        type: 'interview',
        id: doc.id
      }));

      // Fetch CV verifications
      const cvQuery = query(
        collection(db, 'cvVerifications'),
        where('mentorId', '==', targetMentorId)
      );
      const cvSnapshot = await getDocs(cvQuery);
      const cvs = cvSnapshot.docs.map(doc => ({
        ...doc.data(),
        type: 'cv',
        id: doc.id
      }));

      // Combine all verifications
      const allVerifications = [...interviews, ...cvs];
      
      // Sort by date (newest first)
      allVerifications.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt);
        const dateB = new Date(b.createdAt || b.uploadedAt);
        return dateB - dateA;
      });

      // Calculate medals
      const earnedMedals = allVerifications.map(v => ({
        tier: getMedalTier(v.overallScore),
        score: v.overallScore,
        date: v.createdAt || v.uploadedAt,
        type: v.type,
        id: v.id,
        details: v
      }));

      // Calculate stats
      const uniqueTiers = [...new Set(earnedMedals.map(m => m.tier))];
      const highestTier = uniqueTiers.reduce((highest, tier) => {
        const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'rising', 'participant'];
        return tierOrder.indexOf(tier) < tierOrder.indexOf(highest) ? tier : highest;
      }, 'participant');

      // Calculate separate averages for interview and CV
      const interviewMedals = earnedMedals.filter(m => m.type === 'interview');
      const cvMedals = earnedMedals.filter(m => m.type === 'cv');
      
      const interviewAvg = interviewMedals.length > 0
        ? interviewMedals.reduce((sum, m) => sum + m.score, 0) / interviewMedals.length
        : 0;
      
      const cvAvg = cvMedals.length > 0
        ? cvMedals.reduce((sum, m) => sum + m.score, 0) / cvMedals.length
        : 0;

      // Combined score: if both exist, average them; otherwise use available one
      const combinedScore = (interviewAvg > 0 && cvAvg > 0) 
        ? (interviewAvg + cvAvg) / 2
        : (interviewAvg > 0 ? interviewAvg : cvAvg);

      const avgScore = earnedMedals.length > 0
        ? earnedMedals.reduce((sum, m) => sum + m.score, 0) / earnedMedals.length
        : 0;

      setMedals(earnedMedals);
      setStats({
        totalVerifications: earnedMedals.length,
        averageScore: avgScore.toFixed(1),
        highestTier,
        bestVerification: earnedMedals.length > 0 
          ? earnedMedals.reduce((best, current) => current.score > best.score ? current : best)
          : null,
        interviewCount: interviewMedals.length,
        cvCount: cvMedals.length,
        interviewAvg: interviewAvg.toFixed(1),
        cvAvg: cvAvg.toFixed(1),
        combinedScore: combinedScore.toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching medals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (medals.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No Medals Yet</h3>
        <p className="text-sm text-gray-500">
          Complete verifications to earn achievement medals
        </p>
      </div>
    );
  }

  // Get unique tiers (medal types) earned
  const uniqueMedalTiers = [...new Set(medals.map(m => m.tier))];
  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'rising', 'participant'];
  const sortedTiers = uniqueMedalTiers.sort((a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b));

  // Get the most recent medal of each tier
  const displayMedals = sortedTiers.map(tier => {
    const tierMedals = medals.filter(m => m.tier === tier);
    return tierMedals[0]; // Most recent of this tier
  });

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{stats.totalVerifications}</p>
          <p className="text-xs text-purple-600">Total Verifications</p>
          <div className="flex justify-center gap-2 mt-1 text-xs text-purple-500">
            <span>{stats.interviewCount} Interview</span>
            <span>•</span>
            <span>{stats.cvCount} CV</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.combinedScore}%</p>
          <p className="text-xs text-blue-600">Combined Score</p>
          {(stats.interviewAvg > 0 || stats.cvAvg > 0) && (
            <div className="flex justify-center gap-1 mt-1 text-xs text-blue-500">
              {stats.interviewAvg > 0 && <span>Int: {stats.interviewAvg}%</span>}
              {stats.interviewAvg > 0 && stats.cvAvg > 0 && <span>|</span>}
              {stats.cvAvg > 0 && <span>CV: {stats.cvAvg}%</span>}
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
          <p className="text-2xl font-bold text-green-700">{displayMedals.length}</p>
          <p className="text-xs text-green-600">Medals Earned</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
          <p className="text-lg font-bold text-yellow-700 truncate">
            {stats.highestTier ? getMedalInfo(stats.highestTier).name : '-'}
          </p>
          <p className="text-xs text-yellow-600">Highest Rank</p>
        </div>
      </div>

      {/* Best Achievement Highlight */}
      {stats.bestVerification && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0">
              <MedalBadge 
                tier={stats.bestVerification.tier} 
                size="sm" 
                showLabel={false} 
                animated={true}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-200 mb-1">Best Achievement</p>
              <h3 className="text-xl font-bold">
                {getMedalInfo(stats.bestVerification.tier).name}
              </h3>
              <p className="text-purple-200 text-sm">
                Score: {stats.bestVerification.score}% • {new Date(stats.bestVerification.date).toLocaleDateString()}
              </p>
            </div>
            {/* Fully Verified Badge */}
            {stats.interviewCount > 0 && stats.cvCount > 0 && (
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                <div className="text-2xl">🏆</div>
                <p className="text-xs font-semibold">Fully Verified</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medal Collection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Medal Collection
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {displayMedals.map((medal, index) => (
            <div 
              key={index}
              className="cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => setSelectedMedal(medal)}
            >
              <MedalBadge 
                tier={medal.tier} 
                size="md" 
                showLabel={true}
                animated={index === 0}
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Earned {new Date(medal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Medal History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Recent Verifications</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {medals.slice(0, 5).map((medal, index) => (
            <div key={index} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50">
              <div className="w-10 h-10 flex-shrink-0">
                <MedalBadge tier={medal.tier} size="sm" showLabel={false} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {getMedalInfo(medal.tier).name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    medal.type === 'cv' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {medal.type === 'cv' ? (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    )}
                    {medal.type === 'cv' ? 'CV' : 'Interview'}
                  </span>
                  <span>•</span>
                  <span>{new Date(medal.date).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{medal.score}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medal Detail Modal */}
      {selectedMedal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedal(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto mb-3">
                <MedalBadge 
                  tier={selectedMedal.tier} 
                  size="lg" 
                  showLabel={false}
                  animated={true}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {getMedalInfo(selectedMedal.tier).name}
              </h3>
              <p className="text-gray-600">
                Score: {selectedMedal.score}%
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Verification Type</span>
                <span className="font-medium flex items-center gap-2">
                  {selectedMedal.type === 'cv' ? (
                    <>
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-600">CV Analysis</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="text-purple-600">Interview</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Date Earned</span>
                <span className="font-medium">
                  {new Date(selectedMedal.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-medium capitalize">
                  {selectedMedal.tier === 'platinum' ? 'Exceptional Excellence' :
                   selectedMedal.tier === 'gold' ? 'Outstanding Performance' :
                   selectedMedal.tier === 'silver' ? 'Strong Performance' :
                   selectedMedal.tier === 'bronze' ? 'Good Foundation' :
                   selectedMedal.tier === 'rising' ? 'Emerging Talent' : 'Participation'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMedal(null)}
              className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMedals;

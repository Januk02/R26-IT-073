import { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
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

      const pendingKey = `pendingCvVerification:${targetMentorId}`;
      const pendingWrite = localStorage.getItem(pendingKey);
      if (pendingWrite) {
        const pendingVerifications = JSON.parse(pendingWrite);
        const records = Array.isArray(pendingVerifications)
          ? pendingVerifications
          : [pendingVerifications];
        const saveResults = await Promise.allSettled(records.map((pendingVerification) => (
          setDoc(doc(db, 'cvVerifications', pendingVerification.id), pendingVerification)
            .then(() => pendingVerification.id)
        )));
        const savedIds = saveResults
          .filter(({ status }) => status === 'fulfilled')
          .map(({ value }) => value);
        const remaining = records.filter(({ id }) => !savedIds.includes(id));
        if (remaining.length > 0) {
          localStorage.setItem(pendingKey, JSON.stringify(remaining));
        } else {
          localStorage.removeItem(pendingKey);
        }
      }
      
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
        averageScore: Math.round(avgScore),
        highestTier,
        bestVerification: earnedMedals.length > 0 
          ? earnedMedals.reduce((best, current) => current.score > best.score ? current : best)
          : null,
        interviewCount: interviewMedals.length,
        cvCount: cvMedals.length,
        interviewAvg: Math.round(interviewAvg),
        cvAvg: Math.round(cvAvg),
        combinedScore: Math.round(combinedScore)
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
          <p className="text-xs text-purple-600 font-medium">Total Verifications</p>
          <div className="flex justify-center gap-2 mt-1 text-xs text-purple-500">
            <span>{stats.interviewCount} Interview</span>
            <span>•</span>
            <span>{stats.cvCount} CV</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200 shadow-sm ring-2 ring-blue-400/30">
          <p className="text-2xl font-extrabold text-blue-700">{stats.combinedScore}%</p>
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Final Combined Score</p>
          {(stats.interviewAvg > 0 || stats.cvAvg > 0) && (
            <div className="flex justify-center gap-1 mt-1 text-xs text-blue-600 font-medium">
              {stats.interviewAvg > 0 && <span>Int: {stats.interviewAvg}%</span>}
              {stats.interviewAvg > 0 && stats.cvAvg > 0 && <span>|</span>}
              {stats.cvAvg > 0 && <span>CV: {stats.cvAvg}%</span>}
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
          <p className="text-2xl font-bold text-green-700">{displayMedals.length}</p>
          <p className="text-xs text-green-600 font-medium">Medals Earned</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center border border-amber-200">
          <p className="text-lg font-extrabold text-amber-700 truncate">
            {getMedalInfo(getMedalTier(stats.combinedScore)).name}
          </p>
          <p className="text-xs font-semibold text-amber-600">Overall Combined Rank</p>
        </div>
      </div>

      {/* Main Combined Score & Qualification Status Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 flex-shrink-0 bg-white/10 rounded-2xl p-2 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <MedalBadge 
                tier={getMedalTier(stats.combinedScore)} 
                size="sm" 
                showLabel={false} 
                animated={true}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-bold text-purple-200 bg-purple-500/30 px-2.5 py-0.5 rounded-full border border-purple-300/30">
                  Primary Mentor Status
                </span>
                {stats.interviewCount > 0 && stats.cvCount > 0 ? (
                  <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    ✓ Full Dual-Evaluation (Interview + CV)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    ⚠️ Partial Evaluation
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Overall Rank: {getMedalInfo(getMedalTier(stats.combinedScore)).name}
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                Combined Final Score: <span className="font-bold text-yellow-300 text-lg">{stats.combinedScore}%</span>
                <span className="text-purple-300 text-xs ml-2">
                  (Interview Avg: {stats.interviewAvg}% • CV Avg: {stats.cvAvg}%)
                </span>
              </p>
            </div>
          </div>

          {/* Qualification Badge & Result Status */}
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            {stats.combinedScore >= 50 ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-4 py-2.5 rounded-xl backdrop-blur-sm text-left md:text-right w-full md:w-auto">
                <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Qualification Verdict</p>
                <p className="text-base font-extrabold text-emerald-100 flex items-center gap-1.5">
                  <span>🏆</span> QUALIFIED MENTOR
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/25 border border-amber-400/50 text-amber-100 px-4 py-2.5 rounded-xl backdrop-blur-sm text-left md:text-right w-full md:w-auto">
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Qualification Verdict</p>
                <p className="text-base font-extrabold text-amber-200 flex items-center gap-1.5">
                  <span>⚠️</span> Needs Re-attempt (&lt; 50%)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed guidance message regarding combined score */}
        <div className="mt-5 pt-3 border-t border-purple-500/30 text-xs text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            {stats.combinedScore >= 50 
              ? "Your combined score meets the qualification threshold (50%+) for mentorship matching." 
              : `Your overall mentor qualification is based on the Combined Score (Interview 50% + CV 50%). Your current combined score is ${stats.combinedScore}%. Minimum 50% combined score required.`}
          </span>
          {stats.combinedScore < 50 && (
            <span className="font-semibold text-yellow-300 bg-yellow-400/20 px-2.5 py-1 rounded-md border border-yellow-400/30 text-xs flex-shrink-0">
              Score Breakdown: Interview {stats.interviewAvg}% | CV {stats.cvAvg}%
            </span>
          )}
        </div>
      </div>

      {/* Medal Collection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Medal Collection
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Featured Combined Score Medal Card */}
          <div 
            className="cursor-pointer transform hover:scale-105 transition-transform bg-gradient-to-b from-purple-50 to-indigo-50 p-3 rounded-2xl border-2 border-purple-300/80 shadow-sm text-center relative"
            onClick={() => setSelectedMedal({
              tier: getMedalTier(stats.combinedScore),
              score: stats.combinedScore,
              date: new Date().toISOString(),
              type: 'combined',
              id: 'combined-final'
            })}
          >
            <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              Overall Rank
            </span>
            <div className="mt-2">
              <MedalBadge 
                tier={getMedalTier(stats.combinedScore)} 
                size="md" 
                showLabel={true}
                animated={true}
              />
            </div>
            <p className="text-xs font-bold text-purple-800 mt-2">
              {stats.combinedScore}% Combined
            </p>
          </div>

          {displayMedals.map((medal, index) => (
            <div 
              key={index}
              className="cursor-pointer transform hover:scale-105 transition-transform p-3 rounded-2xl border border-gray-100 hover:border-purple-200"
              onClick={() => setSelectedMedal(medal)}
            >
              <MedalBadge 
                tier={medal.tier} 
                size="md" 
                showLabel={true}
                animated={false}
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
                <p className="font-bold text-gray-900">{Math.round(medal.score)}%</p>
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
                Score: {Math.round(selectedMedal.score)}%
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Verification Type</span>
                <span className="font-medium flex items-center gap-2">
                  {selectedMedal.type === 'combined' ? (
                    <>
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-purple-700 font-bold">Overall Combined Final Score</span>
                    </>
                  ) : selectedMedal.type === 'cv' ? (
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

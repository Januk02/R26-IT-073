import { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import MedalBadge, { getMedalTier } from '../components/MedalBadge';

const VerificationHistory = ({ onClose }) => {
  const { user } = useAuth();
  const [interviewVerifications, setInterviewVerifications] = useState([]);
  const [cvVerifications, setCvVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('interview');
  const [expandedCV, setExpandedCV] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchVerificationHistory();
  }, [user]);

  const fetchVerificationHistory = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      await Promise.all([fetchInterviewVerifications(), fetchCVVerifications()]);
    } catch (error) {
      console.error('Error fetching verification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewVerifications = async () => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'verifications'),
      where('mentorId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      type: 'interview'
    }));
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setInterviewVerifications(history);
  };

  const fetchCVVerifications = async () => {
    if (!user?.uid) return;
    const pendingKey = `pendingCvVerification:${user.uid}`;
    const pendingWrite = localStorage.getItem(pendingKey);

    if (pendingWrite) {
      try {
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
      } catch (error) {
        console.error('Error retrying pending CV verification:', error);
      }
    }

    const q = query(
      collection(db, 'cvVerifications'),
      where('mentorId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      type: 'cv'
    }));
    history.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    setCvVerifications(history);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const toggleCVCollapse = (index) => {
    setExpandedCV(expandedCV === index ? null : index);
  };

  const deleteInterviewVerification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview verification?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'verifications', id));
      setInterviewVerifications(interviewVerifications.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting interview verification:', error);
      alert('Failed to delete verification. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const deleteCVVerification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CV analysis?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'cvVerifications', id));
      setCvVerifications(cvVerifications.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting CV verification:', error);
      alert('Failed to delete CV analysis. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading verification history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verification History</h2>
            <p className="text-gray-600">View your mentorship verification results</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'interview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Interview Verifications ({interviewVerifications.length})
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'cv'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            CV Analysis ({cvVerifications.length})
          </button>
        </div>

        {/* Interview Verifications Tab */}
        {activeTab === 'interview' && (
          <>
            {interviewVerifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Verifications Yet</h3>
                <p className="text-gray-600 mb-4">You haven't completed any verification interviews yet.</p>
                <button
                  onClick={onClose}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Your First Verification
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewVerifications.map((verification, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <MedalBadge
                            tier={getMedalTier(verification.overallScore)}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{formatDate(verification.createdAt)}</p>
                          <h3 className="font-semibold text-gray-900">Interview #{interviewVerifications.length - index}</h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI Interview</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(verification.overallScore)}`}>
                          {verification.overallScore ? Math.round(verification.overallScore) : 0}%
                        </p>
                        <p className={`text-sm font-medium ${getScoreColor(verification.overallScore)}`}>
                          {getScoreLabel(verification.overallScore)}
                        </p>
                        <button
                          onClick={() => deleteInterviewVerification(verification.id)}
                          disabled={deletingId === verification.id}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {deletingId === verification.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Question Scores:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.isArray(verification.questions) && Array.isArray(verification.questionDomains) ? (
                          verification.questions.map((question, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs text-purple-600 font-medium">{verification.questionDomains[qIndex] || 'General'}</p>
                                <span className="text-sm font-bold text-gray-900">
                                  {verification.scores?.[qIndex] || 0}/10
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {typeof question === 'string' ? question : 'Question text not available'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 col-span-2">Question data not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CV Verifications Tab */}
        {activeTab === 'cv' && (
          <>
            {cvVerifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No CV Analysis Yet</h3>
                <p className="text-gray-600 mb-4">You haven't uploaded any CVs for analysis yet.</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Your CV
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cvVerifications.map((verification, index) => (
                  <div key={index} className={`rounded-xl p-6 border ${getScoreBgColor(verification.overallScore)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <MedalBadge
                            tier={getMedalTier(verification.overallScore)}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{formatDate(verification.uploadedAt)}</p>
                          <h3 className="font-semibold text-gray-900">{verification.fileName}</h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">CV Analysis</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(verification.overallScore)}`}>
                          {verification.overallScore ? Math.round(verification.overallScore) : 0}%
                        </p>
                        <p className={`text-sm font-medium ${getScoreColor(verification.overallScore)}`}>
                          {verification.verdict}
                        </p>
                        <button
                          onClick={() => deleteCVVerification(verification.id)}
                          disabled={deletingId === verification.id}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {deletingId === verification.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => toggleCVCollapse(index)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-gray-900"
                      >
                        <span>View Detailed Analysis</span>
                        <svg className={`w-5 h-5 transition-transform ${expandedCV === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedCV === index && (
                        <div className="mt-4 space-y-4">
                          {/* Criteria Scores */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {verification.criteriaScores?.map((criterion, cIndex) => (
                              <div key={cIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-xs font-medium text-gray-700">{criterion.name}</p>
                                  <span className="text-sm font-bold text-gray-900">{criterion.score}/{criterion.maxScore}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`${getScoreColor(criterion.percentage).replace('text-', 'bg-')} h-1.5 rounded-full`}
                                    style={{ width: `${criterion.percentage}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{criterion.percentage}% match</p>
                              </div>
                            ))}
                          </div>

                          {/* Strengths */}
                          {verification.strengths?.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <h5 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Key Strengths
                              </h5>
                              <ul className="space-y-1">
                                {verification.strengths.map((strength, sIndex) => (
                                  <li key={sIndex} className="text-xs text-green-700 flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Feedback */}
                          {verification.feedback?.length > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <h5 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Suggestions for Improvement
                              </h5>
                              <ul className="space-y-1">
                                {verification.feedback.map((item, fIndex) => (
                                  <li key={fIndex} className="text-xs text-yellow-700 flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-yellow-500 rounded-full flex-shrink-0"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerificationHistory;


import { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import MentorMedals from '../components/MentorMedals';
import BrandHeader from '../components/BrandHeader';
import ChatList from '../components/ChatList';

const MentorDashboard = ({ 
  onStartVerification, 
  onViewHistory, 
  onStartCVVerification, 
  onMentorshipMatching,
  onNavigateToMessages
}) => {
  const { user, userRole, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);

  const mentorName = user?.displayName || user?.email?.split('@')[0] || 'Mentor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BrandHeader 
              title="StudiFyx"
              subtitle="Mentor Dashboard"
              logoSize="w-12 h-12"
            />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                <p className="text-xs text-purple-600 capitalize font-medium">Mentor</p>
              </div>
              <button
                onClick={logout}
                className="bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 transition-all duration-200 text-sm font-medium shadow-lg shadow-slate-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome back, {mentorName}
          </h1>
          <p className="text-gray-600 text-lg">Track your verification progress and manage your mentorship profile</p>
        </div>

        {/* Quick Actions - Prominent Placement */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Verification */}
            <button 
              onClick={onStartVerification}
              className="group relative bg-white rounded-xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 text-left"
            >
              <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="pt-8">
                <h3 className="font-semibold text-gray-900 mb-1">Start Verification</h3>
                <p className="text-sm text-gray-500">Begin AI mentorship assessment</p>
              </div>
            </button>

            {/* View History */}
            <button 
              onClick={onViewHistory}
              className="group relative bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 text-left"
            >
              <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="pt-8">
                <h3 className="font-semibold text-gray-900 mb-1">View History</h3>
                <p className="text-sm text-gray-500">Review past verifications</p>
              </div>
            </button>

            {/* CV Analysis */}
            <button 
              onClick={onStartCVVerification}
              className="group relative bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 text-left"
            >
              <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="pt-8">
                <h3 className="font-semibold text-gray-900 mb-1">CV Analysis</h3>
                <p className="text-sm text-gray-500">Upload CV for evaluation</p>
              </div>
            </button>

            {/* AI Matching */}
            <button 
              onClick={onMentorshipMatching}
              className="group relative bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100 transition-all duration-300 text-left"
            >
              <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="pt-8">
                <h3 className="font-semibold text-gray-900 mb-1">AI Matching</h3>
                <p className="text-sm text-gray-500">Find mentorship opportunities</p>
                <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">New</span>
              </div>
            </button>
          </div>
        </div>

        {/* Achievements & Medals Section */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">My Achievements</h2>
            </div>
            <button 
              onClick={onViewHistory}
              className="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <MentorMedals />
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-40"
        title="Open Chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <ChatList onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;

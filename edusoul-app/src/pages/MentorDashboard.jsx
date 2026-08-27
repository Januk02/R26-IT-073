import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MentorMedals from '../components/MentorMedals';
import { subscribeToUserChats } from '../services/chatService';

const MentorDashboard = ({ 
  onStartVerification, 
  onViewHistory, 
  onStartCVVerification,
  onNavigateToMessages 
}) => {
  const { user, logout } = useAuth();
  const [studentChats, setStudentChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserChats(
      user.uid,
      'mentor',
      (chats) => {
        setStudentChats(chats);
        const totalUnread = chats.reduce((acc, c) => acc + (c.unreadMentor || 0), 0);
        setUnreadCount(totalUnread);
      }
    );
    return () => unsubscribe();
  }, [user?.uid]);

  const uniqueStudentCount = new Set(studentChats.map(c => c.studentId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">StudyFyx</span>
            </div>
            <div className="flex items-center gap-4">
              {onNavigateToMessages && (
                <button
                  onClick={onNavigateToMessages}
                  className="relative p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                  title="Open Student Messages"
                >
                  <span>💬 Messages</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-purple-600 capitalize font-semibold">Mentor</p>
              </div>
              <button
                onClick={logout}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Mentor!
          </h1>
          <p className="text-gray-600">Manage your courses, guide students in real-time, and verify your expertise</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-md p-6 border border-purple-100 cursor-pointer hover:border-purple-300 transition-all"
            onClick={onNavigateToMessages}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueStudentCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-md p-6 border border-purple-100 cursor-pointer hover:border-purple-300 transition-all"
            onClick={onNavigateToMessages}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">5.0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Medals Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">My Achievements</h2>
            </div>
            <button 
              onClick={onViewHistory}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <MentorMedals />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Create New Course
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">No courses created yet</h3>
                      <p className="text-sm text-gray-600">Start by creating your first course</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {uniqueStudentCount} students
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          0 lessons
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Section with Live Firebase Chats */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Inquiries</h2>
              {onNavigateToMessages && (
                <button 
                  onClick={onNavigateToMessages}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Open Chat Hub →
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {studentChats.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">No student messages yet</p>
                  <p className="text-xs text-gray-500">When students message you from Mentor Hub, their chats appear here in real-time</p>
                </div>
              ) : (
                studentChats.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={onNavigateToMessages}
                    className="p-3 bg-purple-50/60 hover:bg-purple-100/60 rounded-xl border border-purple-100 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                        {c.studentName?.[0] || 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{c.studentName || 'Student'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[160px]">{c.lastMessage || 'Sent a message'}</div>
                      </div>
                    </div>
                    {c.unreadMentor > 0 && (
                      <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {c.unreadMentor}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={onNavigateToMessages}
                  className="w-full text-left px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-between border border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">Open Real-Time Chat Hub</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button 
                  onClick={onStartVerification}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 border border-gray-200"
                >
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-700">Start Verification Interview</span>
                </button>

                <button 
                  onClick={onStartCVVerification}
                  className="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3 border border-blue-200"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">Upload CV for Analysis</span>
                </button>

                <button 
                  onClick={onViewHistory}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">View Verification History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

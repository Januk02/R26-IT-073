import { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import ChatService from '../services/chatService';
import SecureChat from './SecureChat';
import { format } from 'date-fns';

const ChatList = ({ onClose }) => {
  const { user } = useAuth();
  const currentUid = user?.uid || 'mentor_current';
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy data for demo
  const dummyChatRooms = [
    {
      id: 'dummy1',
      participants: {
        studentId: 'student123',
        mentorId: currentUid
      },
      lastMessage: 'Thank you for the guidance on my project!',
      lastMessageAt: new Date(Date.now() - 300000), // 5 minutes ago
      unreadCount: {
        [currentUid]: 2
      },
      status: 'active'
    },
    {
      id: 'dummy2',
      participants: {
        studentId: 'student456',
        mentorId: currentUid
      },
      lastMessage: 'Can you help me with React hooks?',
      lastMessageAt: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: {
        [currentUid]: 0
      },
      status: 'active'
    },
    {
      id: 'dummy3',
      participants: {
        studentId: 'student789',
        mentorId: currentUid
      },
      lastMessage: 'The mentorship session was very helpful',
      lastMessageAt: new Date(Date.now() - 86400000), // 1 day ago
      unreadCount: {
        [currentUid]: 0
      },
      status: 'active'
    }
  ];

  useEffect(() => {
    // Use dummy data for demo
    setChatRooms(dummyChatRooms);
    setLoading(false);

    // Uncomment below to use real Firebase data
    /*
    if (user?.uid) {
      const unsubscribe = ChatService.getUserChatRooms(user.uid, (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
      });

      return () => unsubscribe();
    }
    */
  }, [user?.uid]);

  const handleSelectChat = (chatRoom) => {
    const isStudent = chatRoom.participants.studentId === currentUid;
    const otherUserId = isStudent ? chatRoom.participants.mentorId : chatRoom.participants.studentId;
    const studentNames = {
      'student123': 'Sarah Johnson',
      'student456': 'Michael Chen',
      'student789': 'Emma Williams'
    };
    const otherUserName = studentNames[otherUserId] || 'Student';
    
    setSelectedChat({
      id: chatRoom.id,
      mentorId: otherUserId,
      mentorName: otherUserName
    });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return format(date, 'MMM d');
  };

  if (selectedChat) {
    return (
      <SecureChat
        mentorId={selectedChat.mentorId}
        mentorName={selectedChat.mentorName}
        onClose={() => setSelectedChat(null)}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl border border-purple-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500">Connect with your students</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-md transition-all border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-purple-600"></div>
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start mentoring to begin chatting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chatRooms.map((chatRoom) => {
            const studentNames = {
              'student123': 'Sarah Johnson',
              'student456': 'Michael Chen',
              'student789': 'Emma Williams'
            };
            const otherUserId = chatRoom.participants.studentId === currentUid ? chatRoom.participants.mentorId : chatRoom.participants.studentId;
            const studentName = studentNames[otherUserId] || 'Student';
            const initials = studentName.split(' ').map(n => n[0]).join('');
            
            return (
              <div
                key={chatRoom.id}
                onClick={() => handleSelectChat(chatRoom)}
                className="group relative bg-white rounded-2xl p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-all duration-300 border border-gray-200 hover:border-purple-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                      {initials}
                    </div>
                    {chatRoom.unreadCount && chatRoom.unreadCount[currentUid] > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                        {chatRoom.unreadCount[currentUid]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {studentName}
                      </h3>
                      <span className="text-xs text-purple-500 font-medium">
                        {chatRoom.lastMessageAt ? formatTime(chatRoom.lastMessageAt) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                      {chatRoom.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;

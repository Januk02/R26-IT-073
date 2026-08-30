import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import ChatService from '../services/chatService';
import { format } from 'date-fns';

const SecureChat = ({ mentorId, mentorName, onClose, onBack }) => {
  const { user } = useAuth();
  const currentUid = user?.uid || 'mentor_current';
  const currentEmail = user?.email || 'mentor@studyfyx.com';
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Dummy messages for demo
  const dummyMessages = [
    {
      id: 'msg1',
      senderId: mentorId,
      senderName: mentorName,
      senderRole: 'student',
      text: 'Hi! I have a question about my React project. Can you help me?',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg2',
      senderId: currentUid,
      senderName: currentEmail,
      senderRole: 'mentor',
      text: 'Of course! What specific issue are you facing with your React project?',
      timestamp: new Date(Date.now() - 1500000), // 25 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg3',
      senderId: mentorId,
      senderName: mentorName,
      senderRole: 'student',
      text: 'I\'m having trouble with useEffect and understanding when to use it. Can you explain?',
      timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg4',
      senderId: currentUid,
      senderName: currentEmail,
      senderRole: 'mentor',
      text: 'useEffect is a React Hook that lets you perform side effects in functional components. It runs after every render by default, but you can control when it runs using the dependency array.',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg5',
      senderId: mentorId,
      senderName: mentorName,
      senderRole: 'student',
      text: 'That makes sense! Can you give me an example?',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg6',
      senderId: currentUid,
      senderName: currentEmail,
      senderRole: 'mentor',
      text: 'Sure! Here\'s a simple example:\n\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n\nThis effect runs whenever the count variable changes.',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: 'text',
      read: true,
      metadata: { encrypted: false }
    },
    {
      id: 'msg7',
      senderId: mentorId,
      senderName: mentorName,
      senderRole: 'student',
      text: 'Thank you so much! That really helps. I\'ll try implementing it in my project.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      type: 'text',
      read: false,
      metadata: { encrypted: false }
    }
  ];

  useEffect(() => {
    // Use dummy messages for demo
    setMessages(dummyMessages);
    setLoading(false);

    // Uncomment below to use real Firebase data
    /*
    if (user?.uid) {
      const initializeChat = async () => {
        try {
          setLoading(true);
          const roomId = await ChatService.getOrCreateChatRoom(user.uid, mentorId);
          setChatRoomId(roomId);

          const unsubscribe = ChatService.getMessages(roomId, (msgs) => {
            setMessages(msgs);
            setLoading(false);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error('Error initializing chat:', error);
          setLoading(false);
        }
      };

      initializeChat();
    }
    */
  }, [mentorId, user?.uid, mentorName, user?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // For demo, add message locally
    const newMsg = {
      id: `msg${Date.now()}`,
      senderId: currentUid,
      senderName: currentEmail,
      senderRole: 'mentor',
      text: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      read: false,
      metadata: { encrypted: false }
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
    scrollToBottom();

    // Uncomment below to use real Firebase
    /*
    if (!chatRoomId) return;

    try {
      await ChatService.sendMessage(
        chatRoomId,
        user.uid,
        user.email,
        'student',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    */
  };

  const handleMarkAsRead = async () => {
    // For demo, mark all as read
    setMessages(messages.map(msg => ({ ...msg, read: true })));

    // Uncomment below to use real Firebase
    /*
    if (chatRoomId) {
      await ChatService.markAsRead(chatRoomId, user.uid);
    }
    */
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl border border-purple-100 flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 rounded-t-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getInitials(mentorName)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{mentorName}</h3>
              <p className="text-xs text-purple-200 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-purple-50/30">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUid;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                onClick={handleMarkAsRead}
              >
                <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {showAvatar && !isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                      {getInitials(message.senderName)}
                    </div>
                  )}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-md ${
                        isOwn
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-purple-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-xs ${isOwn ? 'text-purple-300' : 'text-gray-400'}`}>
                        {message.timestamp ? formatTime(message.timestamp) : ''}
                      </p>
                      {isOwn && (
                        <svg className="w-3 h-3 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-5 border-t border-purple-100 bg-white rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-5 py-3 bg-purple-50 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none pr-12 transition-all"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecureChat;

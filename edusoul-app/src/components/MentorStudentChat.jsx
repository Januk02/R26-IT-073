import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getOrCreateChat, 
  subscribeToUserChats, 
  subscribeToMessages, 
  sendMessage, 
  markChatAsRead,
  fetchRegisteredMentors
} from '../services/chatService';

// Default verified mentors
const DEFAULT_MENTORS = [
  { id: 'mentor_1', name: 'Dr. Sarah Williams', field: 'Software Engineering', avatar: 'SW', color: '#1d4ed8', exp: '12 yrs', available: true },
  { id: 'mentor_2', name: 'Prof. Kamal Perera', field: 'Data Science & ML', avatar: 'KP', color: '#7c3aed', exp: '15 yrs', available: true },
  { id: 'mentor_3', name: 'Ms. Dilani Silva', field: 'Business & Management', avatar: 'DS', color: '#0d9488', exp: '8 yrs', available: true },
  { id: 'mentor_4', name: 'Mr. Rohan Jayasuriya', field: 'Mobile Development', avatar: 'RJ', color: '#d97706', exp: '7 yrs', available: true },
  { id: 'mentor_5', name: 'Dr. Nimal Fernando', field: 'Biomedical Research', avatar: 'NF', color: '#be185d', exp: '18 yrs', available: true },
];

const QUICK_QUESTIONS_STUDENT = [
  '🎓 Which degree specialization should I pursue?',
  '💼 What skills are tech companies in Sri Lanka looking for?',
  '🗺️ Can you review my dream degree roadmap?',
  '🧠 How do you manage exam stress and study planning?'
];

const QUICK_QUESTIONS_MENTOR = [
  '👋 Welcome! What area of your studies can I help with today?',
  '📚 Have you explored the curated courses for your stream?',
  '🎯 Let’s set some milestones for your academic roadmap.',
  '💡 Feel free to ask any university admission questions!'
];

export default function MentorStudentChat({ initialMentor = null, isEmbedded = false, onClose = null }) {
  const { user, userRole } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mentorsList, setMentorsList] = useState(DEFAULT_MENTORS);
  const [showMentorPicker, setShowMentorPicker] = useState(false);
  const [mobileTab, setMobileTab] = useState('chat'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);

  const isMentor = userRole === 'mentor';
  const currentUserId = user?.uid || (isMentor ? 'mentor_me' : 'student_me');
  const currentUserName = user?.displayName || user?.email?.split('@')[0] || (isMentor ? 'Mentor' : 'Student');

  // Load mentors from Firestore and combine with default expert mentors
  useEffect(() => {
    let isMounted = true;
    const loadMentors = async () => {
      const registered = await fetchRegisteredMentors();
      if (isMounted && registered && registered.length > 0) {
        const merged = [...registered, ...DEFAULT_MENTORS.filter(d => !registered.some(r => r.id === d.id))];
        setMentorsList(merged);
      }
    };
    loadMentors();
    return () => { isMounted = false; };
  }, []);

  // Subscribe to real-time chats list
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const unsubscribe = subscribeToUserChats(
      currentUserId,
      userRole,
      (updatedChats) => {
        setChats(updatedChats);
        setLoading(false);

        // Auto-select active chat if not chosen yet
        if (updatedChats.length > 0 && !activeChat) {
          if (initialMentor) {
            const mId = String(initialMentor.uid || initialMentor.id);
            const found = updatedChats.find(c => c.mentorId === mId);
            if (found) {
              setActiveChat(found);
              setMobileTab('chat');
              return;
            }
          }
          setActiveChat(updatedChats[0]);
        }
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [currentUserId, userRole]);

  // If initialMentor is passed (e.g. clicked "Book/Chat" in MentorHub), open immediately
  useEffect(() => {
    if (initialMentor && user) {
      const initChat = async () => {
        try {
          const chat = await getOrCreateChat({
            student: {
              uid: user.uid,
              displayName: currentUserName,
              email: user.email,
            },
            mentor: initialMentor
          });
          setActiveChat(chat);
          setMobileTab('chat');
        } catch (err) {
          console.error('Error starting initial chat:', err);
        }
      };
      initChat();
    }
  }, [initialMentor, user]);

  // Subscribe to real-time messages when activeChat changes
  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    markChatAsRead(activeChat.id, userRole);

    const unsubscribe = subscribeToMessages(
      activeChat.id,
      (newMsgs) => {
        setMessages(newMsgs);
      },
      (err) => console.warn('Messages stream note:', err)
    );

    return () => unsubscribe();
  }, [activeChat?.id, userRole]);

  // Smooth scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Send message
  const handleSend = async (customText = null) => {
    const text = (customText || inputText).trim();
    if (!text || !activeChat?.id) return;

    setInputText('');
    setSending(true);

    const sent = await sendMessage({
      chatId: activeChat.id,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: isMentor ? 'mentor' : 'student',
      text: text
    });

    if (sent) {
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    }
    setSending(false);
  };

  // Launch chat with mentor from picker
  const handleSelectMentorToChat = async (mentor) => {
    if (!user) return;
    try {
      const chat = await getOrCreateChat({
        student: {
          uid: user.uid,
          displayName: currentUserName,
          email: user.email,
        },
        mentor: mentor
      });
      setActiveChat(chat);
      setShowMentorPicker(false);
      setMobileTab('chat');
    } catch (err) {
      console.error('Error creating chat with mentor:', err);
    }
  };

  const getPeerName = (chat) => {
    if (!chat) return 'Chat';
    return isMentor ? (chat.studentName || 'Student Mentee') : (chat.mentorName || 'Mentor');
  };

  const getPeerSubtitle = (chat) => {
    if (!chat) return '';
    return isMentor ? (chat.studentEmail || 'Student') : (chat.mentorField || 'Verified Academic Mentor');
  };

  const getPeerAvatar = (chat) => {
    if (!chat) return 'U';
    if (isMentor) {
      return (chat.studentName?.[0] || 'S').toUpperCase();
    }
    return (chat.mentorAvatar || chat.mentorName?.[0] || 'M').toUpperCase();
  };

  const quickPrompts = isMentor ? QUICK_QUESTIONS_MENTOR : QUICK_QUESTIONS_STUDENT;

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════════
           RESPONSIVE FIREBASE CHAT PLATFORM
        ══════════════════════════════════════════ */
        .msc-wrapper {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: ${isEmbedded ? '560px' : 'calc(100vh - 130px)'};
          min-height: 480px;
          max-height: 820px;
          overflow: hidden;
          position: relative;
        }

        /* Mobile Tab Switcher */
        .msc-mobile-tabs {
          display: none;
          background: #f1f5f9;
          padding: 6px;
          border-bottom: 1px solid #e2e8f0;
          gap: 6px;
        }

        .msc-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .msc-tab-btn.active {
          background: white;
          color: #1d4ed8;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .msc-body-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ── Sidebar (Conversations) ── */
        .msc-sidebar {
          width: 320px;
          background: #f8faff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .msc-sidebar-head {
          padding: 16px 18px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .msc-sidebar-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .msc-badge-live {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .msc-new-chat-trigger {
          margin: 10px 14px 6px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
        }

        .msc-new-chat-trigger:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .msc-chats-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .msc-chat-card {
          padding: 12px 14px;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }

        .msc-chat-card:hover {
          background: white;
          border-color: #e2e8f0;
        }

        .msc-chat-card.active {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.12);
        }

        .msc-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .msc-card-meta {
          flex: 1;
          min-width: 0;
        }

        .msc-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3px;
        }

        .msc-card-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msc-card-preview {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msc-unread-badge {
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 10px;
        }

        /* ── Main Chat Stage ── */
        .msc-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow: hidden;
        }

        /* Chat Stage Header */
        .msc-stage-head {
          padding: 14px 22px;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .msc-stage-peer {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .msc-back-mobile {
          display: none;
          background: #f1f5f9;
          border: none;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }

        .msc-peer-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .msc-peer-status {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .msc-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }

        /* Messages Window */
        .msc-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fafbfe;
        }

        .msc-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .msc-messages-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        /* Message Bubble Rows */
        .msc-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          max-width: 76%;
        }

        .msc-row.mine {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .msc-row.peer {
          align-self: flex-start;
        }

        .msc-row.system {
          align-self: center;
          max-width: 90%;
        }

        .msc-msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #e2e8f0;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .msc-row.peer .msc-msg-avatar {
          background: linear-gradient(135deg, #7c3aed, #be185d);
          color: white;
        }

        .msc-row.mine .msc-msg-avatar {
          background: #1d4ed8;
          color: white;
        }

        .msc-bubble-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .msc-sender-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 2px;
        }

        .msc-row.mine .msc-sender-label {
          text-align: right;
        }

        .msc-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .msc-row.peer .msc-bubble {
          background: white;
          color: #0f172a;
          border: 1.5px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }

        .msc-row.mine .msc-bubble {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: #ffffff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.22);
        }

        .msc-row.system .msc-bubble {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          font-size: 12.5px;
          text-align: center;
          padding: 8px 16px;
        }

        .msc-msg-timestamp {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 3px;
          text-align: right;
        }

        .msc-row.mine .msc-msg-timestamp {
          color: rgba(255, 255, 255, 0.75);
        }

        /* Quick Prompt Chips */
        .msc-prompts-bar {
          padding: 8px 16px;
          background: #f8faff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
        }

        .msc-prompts-bar::-webkit-scrollbar {
          height: 3px;
        }

        .msc-prompt-chip {
          padding: 6px 12px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .msc-prompt-chip:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
          transform: translateY(-1px);
        }

        /* Message Input Bar */
        .msc-input-bar {
          padding: 12px 18px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .msc-input {
          flex: 1;
          padding: 11px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .msc-input:focus {
          border-color: #2563eb;
        }

        .msc-send-btn {
          padding: 11px 20px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.1s;
        }

        .msc-send-btn:hover {
          opacity: 0.92;
        }

        .msc-send-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Empty Stage */
        .msc-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
        }

        .msc-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        /* Mentor Picker Modal */
        .msc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .msc-modal-card {
          background: white;
          border-radius: 20px;
          max-width: 520px;
          width: 100%;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }

        .msc-picker-list {
          overflow-y: auto;
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .msc-mentor-row {
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .msc-mentor-row:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }

        /* ── Mobile Breakpoints ── */
        @media (max-width: 768px) {
          .msc-wrapper {
            height: calc(100vh - 100px);
            border-radius: 12px;
            max-height: 100%;
          }

          .msc-mobile-tabs {
            display: flex;
          }

          .msc-sidebar {
            width: 100%;
            display: ${mobileTab === 'list' ? 'flex' : 'none'};
            border-right: none;
          }

          .msc-stage {
            display: ${mobileTab === 'chat' ? 'flex' : 'none'};
          }

          .msc-back-mobile {
            display: inline-flex;
          }

          .msc-row {
            max-width: 88%;
          }
        }
      `}</style>

      <div className="msc-wrapper">
        {/* Mobile Tab Navigation */}
        <div className="msc-mobile-tabs">
          <button 
            className={`msc-tab-btn ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileTab('list')}
          >
            📋 Conversations ({chats.length})
          </button>
          <button 
            className={`msc-tab-btn ${mobileTab === 'chat' ? 'active' : ''}`}
            onClick={() => setMobileTab('chat')}
          >
            💬 Active Chat {activeChat ? `(${getPeerName(activeChat).split(' ')[0]})` : ''}
          </button>
        </div>

        <div className="msc-body-layout">
          {/* Sidebar / Conversation List */}
          <div className="msc-sidebar">
            <div className="msc-sidebar-head">
              <div className="msc-sidebar-title">
                <span>💬 Conversations</span>
                <span className="msc-badge-live">Live</span>
              </div>
              {onClose && (
                <button 
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              )}
            </div>

            {!isMentor && (
              <button 
                className="msc-new-chat-trigger"
                onClick={() => setShowMentorPicker(true)}
              >
                <span>+</span> Connect with a Mentor
              </button>
            )}

            <div className="msc-chats-scroll">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: 13 }}>
                  Connecting to Firestore…
                </div>
              ) : chats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b', fontSize: 13 }}>
                  <p style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>No active chats yet</p>
                  {!isMentor && (
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>
                      Click "Connect with a Mentor" to begin real-time messaging.
                    </p>
                  )}
                </div>
              ) : (
                chats.map((chat) => {
                  const isSelected = activeChat?.id === chat.id;
                  const unread = isMentor ? (chat.unreadMentor || 0) : (chat.unreadStudent || 0);
                  return (
                    <div
                      key={chat.id}
                      className={`msc-chat-card ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setActiveChat(chat);
                        setMobileTab('chat');
                      }}
                    >
                      <div 
                        className="msc-avatar" 
                        style={{ background: chat.mentorColor || '#7c3aed' }}
                      >
                        {getPeerAvatar(chat)}
                      </div>
                      <div className="msc-card-meta">
                        <div className="msc-card-top">
                          <span className="msc-card-name">{getPeerName(chat)}</span>
                          {unread > 0 && <span className="msc-unread-badge">{unread}</span>}
                        </div>
                        <div className="msc-card-preview">
                          {chat.lastMessage || 'Say hello!'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Conversation Stage */}
          <div className="msc-stage">
            {activeChat ? (
              <>
                {/* Header */}
                <div className="msc-stage-head">
                  <div className="msc-stage-peer">
                    <button 
                      className="msc-back-mobile"
                      onClick={() => setMobileTab('list')}
                    >
                      ← Chats
                    </button>
                    <div 
                      className="msc-avatar"
                      style={{ background: activeChat.mentorColor || '#7c3aed', width: 38, height: 38 }}
                    >
                      {getPeerAvatar(activeChat)}
                    </div>
                    <div>
                      <div className="msc-peer-title">{getPeerName(activeChat)}</div>
                      <div className="msc-peer-status">
                        <span className="msc-online-dot" />
                        <span>{getPeerSubtitle(activeChat)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="msc-messages-container">
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        Conversation with {getPeerName(activeChat)}
                      </p>
                      <p style={{ fontSize: 13 }}>Send a message or tap one of the suggested starter questions.</p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isMine = String(m.senderId) === String(currentUserId);
                      const isSys = m.isInitial;
                      const timeStr = m.createdAt 
                        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : '';

                      if (isSys) {
                        return (
                          <div key={m.id || index} className="msc-row system">
                            <div className="msc-bubble">
                              {m.text}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={m.id || index} 
                          className={`msc-row ${isMine ? 'mine' : 'peer'}`}
                        >
                          <div className="msc-msg-avatar">
                            {isMine ? 'Me' : (m.senderName?.[0] || 'U').toUpperCase()}
                          </div>
                          <div className="msc-bubble-box">
                            <div className="msc-sender-label">
                              {isMine ? 'You' : `${m.senderName || 'Mentor'} ${m.senderRole === 'mentor' ? '🧑‍🏫' : '🎓'}`}
                            </div>
                            <div className="msc-bubble">
                              {m.text}
                              <div className="msc-msg-timestamp">{timeStr}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="msc-prompts-bar">
                  {quickPrompts.map((qp, qpIdx) => (
                    <button 
                      key={qpIdx} 
                      className="msc-prompt-chip"
                      onClick={() => handleSend(qp)}
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="msc-input-bar">
                  <input
                    className="msc-input"
                    placeholder={`Type your message to ${getPeerName(activeChat)}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    className="msc-send-btn"
                    onClick={() => handleSend()}
                    disabled={sending || !inputText.trim()}
                  >
                    <span>Send</span> ➤
                  </button>
                </div>
              </>
            ) : (
              <div className="msc-empty-state">
                <div className="msc-empty-icon">💬</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Firebase Mentorship Chat
                </h3>
                <p style={{ color: '#64748b', maxWidth: 360, lineHeight: 1.6, fontSize: 13.5 }}>
                  {isMentor 
                    ? 'Select an active student inquiry from the sidebar to start guiding them through their academic pathway.'
                    : 'Reach out to verified industry experts and university mentors for 1-on-1 personalized academic guidance.'}
                </p>
                {!isMentor && (
                  <button 
                    className="msc-new-chat-trigger" 
                    style={{ marginTop: 18 }}
                    onClick={() => setShowMentorPicker(true)}
                  >
                    Connect with a Mentor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mentor Picker Modal */}
      {showMentorPicker && (
        <div className="msc-modal-overlay" onClick={() => setShowMentorPicker(false)}>
          <div className="msc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Select a Mentor to Message
              </h3>
              <button 
                onClick={() => setShowMentorPicker(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 12 }}>
              Choose a mentor to launch an instant 1-on-1 Firebase conversation.
            </p>

            <div className="msc-picker-list">
              {mentorsList.map((m) => (
                <div 
                  key={m.id} 
                  className="msc-mentor-row"
                  onClick={() => handleSelectMentorToChat(m)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div 
                      className="msc-avatar"
                      style={{ background: m.color || '#7c3aed', width: 40, height: 40 }}
                    >
                      {m.avatar || 'M'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{m.field} · {m.exp}</div>
                    </div>
                  </div>
                  <button 
                    style={{
                      padding: '6px 14px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Start Chat →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

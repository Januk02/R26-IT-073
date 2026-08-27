import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ── Bot Knowledge Base with Member Function Mapping ──────────────
const BOT_KNOWLEDGE = [
  // ── Member 1: Dream Degree Advisor ──
  {
    matches: [/dream degree/i, /advisor/i, /z.?score/i, /stream/i, /which degree/i, /degree recommend/i, /roadmap/i, /university match/i, /career path/i, /xai/i, /explain/i],
    reply: "🎓 **Member 1: Dream Degree Advisor**\nOur AI analyzes your A/L stream, Z-Score, district, and career ambitions to predict the ideal university degree and generates a step-by-step career roadmap with Explainable AI (XAI) breakdown.",
    actions: [
      { label: '🚀 Launch Dream Advisor', view: 'dreamDegreeAdvisor' },
      { label: '🗺️ View Career Roadmap', view: 'dreamDegreeAdvisor' }
    ]
  },

  // ── Member 2: Courses & Learning ──
  {
    matches: [/course/i, /learn/i, /lesson/i, /curriculum/i, /study material/i, /skills/i, /programming/i, /web dev/i, /data science course/i, /mylearning/i],
    reply: "📚 **Member 2: Career Pathways & Courses**\nExplore specialized course pathways tailored to fill your skill gaps. Track your modules, practice exercises, and build industry-ready skills for software engineering, data science, and business.",
    actions: [
      { label: '📚 Browse Courses', view: 'courses' }
    ]
  },

  // ── Member 3: Stress Analysis & Academic Analytics ──
  {
    matches: [/stress/i, /mental/i, /wellbeing/i, /study plan/i, /planner/i, /burnout/i, /analytic/i, /progress report/i, /hours/i, /exam prep/i],
    reply: "🧠 **Member 3: Stress Analysis & Planner**\nTrack your weekly study patterns, workload balance, and academic stress indicators. Access personalized study schedules and comprehensive progress reports to optimize performance without burnout.",
    actions: [
      { label: '🧠 Open Stress Analytics', view: 'analytics' }
    ]
  },

  // ── Member 4: Mentor Hub & Live Firebase Chat ──
  {
    matches: [/mentor/i, /expert/i, /guidance/i, /book mentor/i, /find mentor/i, /consult/i, /message mentor/i, /chat mentor/i, /talk to mentor/i],
    reply: "🧑‍🏫 **Member 4: Mentorship & Firebase Chat**\nConnect directly with verified industry professionals and university lecturers. Book 1-on-1 sessions and send live real-time messages via our Firebase chat portal.",
    actions: [
      { label: '🧑‍🏫 Explore Mentor Hub', view: 'mentorHub' },
      { label: '💬 Open Live Chat', view: 'messages' }
    ]
  },

  // ── Mentor Specific Verifications (Member 4) ──
  {
    matches: [/verification/i, /interview/i, /cv/i, /resume/i, /badge/i, /medal/i, /mentor portal/i, /verify mentor/i],
    reply: "🎤 **Mentor Verification & AI CV Analysis**\nMentors can undergo AI-assisted verification interviews and upload their CVs for suitability analysis, earning prestigious achievement medals displayed on their profiles.",
    actions: [
      { label: '🎤 Verification Interview', view: 'verification' },
      { label: '📄 AI CV Analysis', view: 'cvVerification' },
      { label: '📋 View History', view: 'history' }
    ]
  },

  // ── General / All Member Functions ──
  {
    matches: [/help/i, /feature/i, /what can you do/i, /member/i, /functions/i, /overview/i, /capabilities/i],
    reply: "✨ **StudyFyx All-in-One Capabilities:**\n\n• **1. Dream Degree Advisor**: AI Degree & University matching with roadmaps\n• **2. Career Pathways**: Curated skill courses & progress tracking\n• **3. Stress Analytics**: Study habit analysis & weekly smart planner\n• **4. Mentor Hub & Chat**: Live 1-on-1 Firebase chat with verified mentors",
    actions: [
      { label: '🎓 Dream Advisor', view: 'dreamDegreeAdvisor' },
      { label: '📚 Courses', view: 'courses' },
      { label: '🧠 Stress Analytics', view: 'analytics' },
      { label: '🧑‍🏫 Mentor Hub', view: 'mentorHub' }
    ]
  },

  // ── Greetings ──
  {
    matches: [/hello/i, /hi/i, /hey/i, /good (morning|afternoon|evening)/i, /greetings/i],
    reply: "👋 Hello! I am **StudyBot**, your 24/7 AI academic companion. I can guide you through career recommendations, course pathways, stress monitoring, or connect you with mentors. What would you like to explore?",
    actions: [
      { label: '🎓 Degree Recommendation', view: 'dreamDegreeAdvisor' },
      { label: '🧠 Stress Check', view: 'analytics' },
      { label: '💬 Chat with Mentor', view: 'messages' }
    ]
  }
];

const DEFAULT_REPLY = {
  reply: "🤖 I'm here to assist you across all StudyFyx features! You can ask about **Degree Advising**, **Courses**, **Stress Analytics**, or **Connecting with a Mentor**.",
  actions: [
    { label: '🎓 Degree Advisor', view: 'dreamDegreeAdvisor' },
    { label: '📚 Courses', view: 'courses' },
    { label: '🧠 Stress Analytics', view: 'analytics' },
    { label: '🧑‍🏫 Mentor Hub', view: 'mentorHub' },
  ]
};

const QUICK_PROMPTS = [
  '🎓 How does the Dream Degree Advisor work?',
  '📚 What courses are available?',
  '🧠 How do I track my study stress?',
  '🧑‍🏫 How do I chat with a mentor?',
  '✨ Show all member features'
];

export default function StudyBot({ onNavigate, currentView }) {
  const { user, userRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [badge, setBadge] = useState(true);
  const messagesEndRef = useRef(null);

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || (userRole === 'mentor' ? 'Mentor' : 'Student');

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `👋 Hi **${userName}**! I'm **StudyBot**.\nAsk me anything about your degree pathway, courses, stress tracking, or mentor chats!`,
      actions: [
        { label: '🎓 Dream Advisor', view: 'dreamDegreeAdvisor' },
        { label: '📚 Courses', view: 'courses' },
        { label: '🧠 Stress Planner', view: 'analytics' },
        { label: '💬 Mentor Chat', view: 'messages' },
      ]
    }
  ]);

  useEffect(() => {
    if (open) {
      setBadge(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = (text) => {
    const q = (text || input).trim();
    if (!q) return;

    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: q }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      let match = null;
      for (const item of BOT_KNOWLEDGE) {
        if (item.matches.some(rx => rx.test(q))) {
          match = item;
          break;
        }
      }

      const res = match || DEFAULT_REPLY;
      setMessages(prev => [
        ...prev,
        {
          from: 'bot',
          text: res.reply,
          actions: res.actions || []
        }
      ]);
    }, 600 + Math.random() * 300);
  };

  const handleActionClick = (view) => {
    if (onNavigate && view) {
      onNavigate(view);
      // Optional: keep open or collapse
    }
  };

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════════
           STUDYBOT 3D FLOATING COMPONENT
        ══════════════════════════════════════════ */
        .sbot-fab {
          position: fixed;
          bottom: 24px;
          right: 28px;
          z-index: 8999;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
          transition: transform 0.25s ease;
        }

        .sbot-fab:hover {
          transform: scale(1.06);
        }

        .sbot-badge {
          position: absolute;
          top: 8px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid white;
          color: white;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(239,68,68,0.5);
          animation: sbot-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes sbot-pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        /* ── 3D Robot Figure ── */
        .sbot-robot-wrap {
          width: 74px;
          height: 98px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          animation: sbot-float 3.5s ease-in-out infinite;
          position: relative;
        }

        @keyframes sbot-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }

        /* Antenna */
        .sbot-ant {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: -2px;
          position: relative;
          z-index: 3;
          animation: sbot-ant-lean 4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        @keyframes sbot-ant-lean {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(6deg); }
          75% { transform: rotate(-6deg); }
        }

        .sbot-ant-orb {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #67e8f9, #0284c7);
          box-shadow: 0 0 10px 3px rgba(6,182,212,0.8), 0 0 20px rgba(6,182,212,0.5);
          animation: sbot-glow 1.5s ease-in-out infinite alternate;
        }

        @keyframes sbot-glow {
          from { box-shadow: 0 0 6px 2px rgba(6,182,212,0.6); }
          to { box-shadow: 0 0 16px 5px rgba(6,182,212,0.95), 0 0 26px rgba(14,165,233,0.6); }
        }

        .sbot-ant-rod {
          width: 3px;
          height: 16px;
          background: linear-gradient(to bottom, #7dd3fc, #1d4ed8);
          border-radius: 2px;
        }

        /* Head */
        .sbot-head {
          width: 56px;
          height: 48px;
          background: linear-gradient(145deg, #60a5fa 0%, #2563eb 45%, #1d4ed8 75%, #1e3a8a 100%);
          border-radius: 14px 14px 10px 10px;
          position: relative;
          box-shadow:
            3px 3px 0px #1e3a8a,
            6px 6px 14px rgba(0,0,0,0.25),
            inset 0 1px 1px rgba(255,255,255,0.4),
            inset -2px -2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .sbot-ear {
          position: absolute;
          width: 6px;
          height: 14px;
          background: #1e3a8a;
          border-radius: 3px;
          top: 17px;
        }
        .sbot-ear.left { left: -4px; }
        .sbot-ear.right { right: -4px; }

        .sbot-visor {
          width: 44px;
          height: 30px;
          background: #090d16;
          border-radius: 9px;
          border: 1.5px solid #38bdf8;
          box-shadow: inset 0 0 8px rgba(56,189,248,0.4), 0 0 8px rgba(56,189,248,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          padding: 3px 0;
        }

        .sbot-eyes {
          display: flex;
          gap: 10px;
        }

        .sbot-eye {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8, 0 0 14px #0284c7;
          animation: sbot-blink 4.2s infinite;
        }

        @keyframes sbot-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        .sbot-mouth {
          display: flex;
          gap: 2.5px;
        }

        .sbot-mouth-dot {
          width: 2.5px;
          height: 2.5px;
          border-radius: 50%;
          background: #38bdf8;
          opacity: 0.85;
        }

        /* Neck */
        .sbot-neck {
          width: 14px;
          height: 5px;
          background: #1e293b;
          border-radius: 2px;
          margin-top: -1px;
          z-index: 1;
        }

        /* Body */
        .sbot-body {
          width: 44px;
          height: 22px;
          background: linear-gradient(145deg, #3b82f6, #1d4ed8);
          border-radius: 8px 8px 12px 12px;
          box-shadow: 2px 2px 0px #1e3a8a, inset 0 1px 0 rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          z-index: 1;
        }

        .sbot-led {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }
        .sbot-led.g { background: #4ade80; box-shadow: 0 0 5px #4ade80; animation: sbot-pulse 1.2s infinite alternate; }
        .sbot-led.r { background: #f87171; box-shadow: 0 0 5px #f87171; animation: sbot-pulse 1.8s infinite alternate; }
        .sbot-led.y { background: #facc15; box-shadow: 0 0 5px #facc15; animation: sbot-pulse 1.5s infinite alternate; }

        @keyframes sbot-pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }

        .sbot-shadow {
          position: absolute;
          bottom: -4px;
          width: 46px;
          height: 8px;
          border-radius: 50%;
          background: rgba(15,23,42,0.22);
          filter: blur(2px);
          animation: sbot-shadow 3.5s ease-in-out infinite;
        }

        @keyframes sbot-shadow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(0.75); opacity: 0.15; }
        }

        /* ══════════════════════════════════════════
           CHAT PANEL (DRAWER / MODAL)
        ══════════════════════════════════════════ */
        .sbot-panel {
          position: fixed;
          bottom: 120px;
          right: 28px;
          width: 410px;
          max-width: calc(100vw - 40px);
          height: 580px;
          max-height: calc(100vh - 140px);
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 24px 64px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          z-index: 9000;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          animation: sbot-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes sbot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .sbot-panel-head {
          background: linear-gradient(135deg, #1e3a8a, #2563eb, #7c3aed);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .sbot-head-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sbot-mini-face {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #0f172a;
          border: 1.5px solid #38bdf8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          box-shadow: 0 0 10px rgba(56,189,248,0.4);
        }

        .sbot-mini-eyes {
          display: flex;
          gap: 6px;
        }

        .sbot-mini-eye {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 6px #38bdf8;
        }

        .sbot-mini-mouth {
          display: flex;
          gap: 2px;
        }

        .sbot-mini-dot {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #38bdf8;
        }

        .sbot-head-title {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .sbot-head-sub {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sbot-online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
        }

        .sbot-head-close {
          background: rgba(255, 255, 255, 0.16);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s;
        }

        .sbot-head-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Message Stream */
        .sbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #f8faff;
        }

        .sbot-messages::-webkit-scrollbar {
          width: 5px;
        }
        .sbot-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .sbot-msg-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .sbot-msg-row.user {
          flex-direction: row-reverse;
        }

        .sbot-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .sbot-msg-row.bot .sbot-msg-avatar {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
        }

        .sbot-bubble-wrap {
          max-width: 82%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sbot-bubble {
          padding: 12px 15px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .sbot-msg-row.bot .sbot-bubble {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .sbot-msg-row.user .sbot-bubble {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          border-top-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
        }

        /* Interactive Action Chips inside Bot Messages */
        .sbot-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .sbot-action-btn {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sbot-action-btn:hover {
          background: #1d4ed8;
          color: white;
          border-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(29,78,216,0.25);
        }

        /* Typing Dots */
        .sbot-typing {
          display: flex;
          gap: 4px;
          padding: 4px 2px;
        }
        .sbot-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: sbot-bounce 1.4s infinite ease-in-out both;
        }
        .sbot-typing span:nth-child(1) { animation-delay: -0.32s; }
        .sbot-typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes sbot-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Quick Prompt Suggestions */
        .sbot-quick-wrap {
          padding: 8px 14px;
          background: white;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          white-space: nowrap;
        }

        .sbot-quick-wrap::-webkit-scrollbar {
          height: 3px;
        }
        .sbot-quick-wrap::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }

        .sbot-qchip {
          padding: 5px 11px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 11.5px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .sbot-qchip:hover {
          background: #e0f2fe;
          color: #0369a1;
          border-color: #bae6fd;
        }

        /* Input Row */
        .sbot-input-bar {
          padding: 12px 14px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .sbot-input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .sbot-input:focus {
          border-color: #2563eb;
        }

        .sbot-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .sbot-send-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          .sbot-panel {
            right: 12px;
            bottom: 96px;
            width: calc(100vw - 24px);
            height: calc(100vh - 120px);
          }
          .sbot-fab {
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>

      {/* Floating 3D Robot FAB */}
      <button
        className="sbot-fab"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Open StudyBot AI Assistant"
        title="StudyBot - AI Educational Assistant"
      >
        {badge && !open && <span className="sbot-badge">1</span>}

        <div className="sbot-robot-wrap">
          {/* Glowing Antenna */}
          <div className="sbot-ant">
            <div className="sbot-ant-orb" />
            <div className="sbot-ant-rod" />
          </div>

          {/* 3D Robot Head */}
          <div className="sbot-head">
            <div className="sbot-ear left" />
            <div className="sbot-ear right" />
            <div className="sbot-visor">
              <div className="sbot-eyes">
                <div className="sbot-eye" />
                <div className="sbot-eye" />
              </div>
              <div className="sbot-mouth">
                {[0, 1, 2, 3].map(i => <div key={i} className="sbot-mouth-dot" />)}
              </div>
            </div>
          </div>

          {/* Neck */}
          <div className="sbot-neck" />

          {/* Body with status LEDs */}
          <div className="sbot-body">
            <div className="sbot-led g" />
            <div className="sbot-led r" />
            <div className="sbot-led y" />
          </div>

          {/* Ground Float Shadow */}
          <div className="sbot-shadow" />
        </div>
      </button>

      {/* Expandable Chat Panel */}
      {open && (
        <div className="sbot-panel">
          {/* Header */}
          <div className="sbot-panel-head">
            <div className="sbot-head-left">
              <div className="sbot-mini-face">
                <div className="sbot-mini-eyes">
                  <div className="sbot-mini-eye" />
                  <div className="sbot-mini-eye" />
                </div>
                <div className="sbot-mini-mouth">
                  {[0, 1, 2].map(i => <div key={i} className="sbot-mini-dot" />)}
                </div>
              </div>
              <div>
                <div className="sbot-head-title">StudyBot AI</div>
                <div className="sbot-head-sub">
                  <span className="sbot-online-dot" /> Member Functions & Guidance
                </div>
              </div>
            </div>

            <button className="sbot-head-close" onClick={() => setOpen(false)} title="Close Chat">
              ✕
            </button>
          </div>

          {/* Messages Stream */}
          <div className="sbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`sbot-msg-row ${m.from}`}>
                <div className="sbot-msg-avatar">
                  {m.from === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="sbot-bubble-wrap">
                  <div className="sbot-bubble">{m.text}</div>
                  {m.actions && m.actions.length > 0 && (
                    <div className="sbot-actions">
                      {m.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          className="sbot-action-btn"
                          onClick={() => handleActionClick(act.view)}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="sbot-msg-row bot">
                <div className="sbot-msg-avatar">🤖</div>
                <div className="sbot-bubble">
                  <div className="sbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="sbot-quick-wrap">
            {QUICK_PROMPTS.map((qp, qpIdx) => (
              <button key={qpIdx} className="sbot-qchip" onClick={() => handleSend(qp)}>
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="sbot-input-bar">
            <input
              className="sbot-input"
              placeholder="Ask StudyBot about degrees, courses, stress, mentors..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="sbot-send-btn" onClick={() => handleSend()} title="Send">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

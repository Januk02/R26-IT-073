import { useState, useRef, useEffect } from 'react';

// ── Chatbot knowledge base ────────────────────────────────────
const BOT_RULES = [
  { match: /hello|hi|hey|hiya|good (morning|evening|afternoon)/i,
    reply: "👋 Hi there! I'm StudyBot, your StudyFyx assistant. Ask me anything about our features — Dream Degree Advisor, Courses, Stress Analysis, or Mentorship!" },
  { match: /dream degree|career (advice|guidance)|degree (advice|recommendation)|what degree|which degree/i,
    reply: "🎓 Our **Dream Degree Advisor** uses AI to analyse your A/L stream, Z-Score, personality and goals, then recommends the best degree and university for you. It even generates a step-by-step career roadmap!" },
  { match: /course|learning|lesson|study material|career pathway/i,
    reply: "📚 The **Career Pathway** section gives you access to curated courses across Software Engineering, Data Science, Business and more. You can track your progress and earn certificates too!" },
  { match: /stress|mental health|wellbeing|anxiety|analytic|study pattern|performance/i,
    reply: "🧠 **Stress Analysis** tracks your weekly study hours, subject performance, and mental well-being. You get a detailed progress report with milestones and personalised insights." },
  { match: /mentor|expert|guide|session|book|connect with/i,
    reply: "🧑‍🏫 **Mentorship** connects you with verified Sri Lankan professionals. Search by field, view their ratings and bios, then book a 1-on-1 session directly from the Mentor Hub!" },
  { match: /university|moratuwa|colombo|sliit|nsbm|iit|ucsc|z.?score/i,
    reply: "🏛️ StudyFyx matches you with universities based on your Z-Score, stream, and district — including UoM, UoC, SLIIT, NSBM, IIT and UCSC. Each match comes with admission guidance!" },
  { match: /language|sinhala|tamil|english|multilingual/i,
    reply: "🌐 StudyFyx is fully available in **English, Sinhala (සිංහල) and Tamil (தமிழ்)** — making quality guidance accessible to every Sri Lankan student." },
  { match: /xai|explain|transparent|how does (the )?ai|why (did|does)/i,
    reply: "🔍 StudyFyx uses **Explainable AI (XAI)** — we don't just give recommendations, we show you exactly *why* a degree or university was recommended, step by step." },
  { match: /register|sign up|create account|join/i,
    reply: "✨ Creating an account is free and takes less than a minute! Click **Create Account** at the top — choose *Student* to get AI guidance, or *Mentor* if you're a professional who wants to guide students." },
  { match: /login|sign in|access|password/i,
    reply: "🔑 Click the **Login** button in the header or below to sign in. You can log in with your email & password, or use Google sign-in for a faster experience." },
  { match: /free|cost|price|paid|subscription/i,
    reply: "💸 StudyFyx is **completely free** for students! Create your account and access the Dream Degree Advisor, Courses, Stress Analysis, and Mentorship at no cost." },
  { match: /who|what is studyfyx|about|team/i,
    reply: "🌟 StudyFyx is an AI-powered education platform built specifically for Sri Lankan A/L students. We combine AI, expert mentors, and multilingual support to help every student find their dream career path." },
  { match: /help|what can you do|features|capabilities/i,
    reply: "I can help you with:\n• 🎓 Dream Degree Advisor\n• 📚 Career Pathway & Courses\n• 🧠 Stress Analysis\n• 🧑‍🏫 Mentorship & Mentor Hub\n• 🏛️ University Matching\n• 🌐 Language options\n\nJust ask anything!" },
];

const QUICK_REPLIES = [
  'What is the Dream Degree Advisor?',
  'Tell me about Courses',
  'What is Stress Analysis?',
  'How do I find a mentor?',
  'Is it free?',
];

function getBotReply(text) {
  for (const rule of BOT_RULES) {
    if (rule.match.test(text)) return rule.reply;
  }
  return "🤔 I'm not sure about that — but you can ask me about our **Dream Degree Advisor**, **Courses**, **Stress Analysis**, **Mentorship**, or how to get started! Or click the quick-reply buttons below.";
}

export default function HomePage({ onNavigateToLogin, onNavigateToRegister }) {
  // ── Chatbot state ──
  const [chatOpen, setChatOpen]   = useState(false);
  const [messages, setMessages]   = useState([
    { from: 'bot', text: "👋 Hi! I'm **StudyBot**, your StudyFyx assistant.\nAsk me anything about our features, or tap a quick reply below!" },
  ]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef            = useRef(null);

  useEffect(() => {
    if (chatOpen) {
      setShowBadge(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOpen, messages]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getBotReply(msg) }]);
    }, 700 + Math.random() * 400);
  };

  const features = [
    { icon: '🧠', title: 'AI Dream Advisor',      desc: 'Our AI analyses your academic profile, personality and goals to recommend the perfect degree path tailored just for you.', color: '#1d4ed8', bg: '#eff6ff' },
    { icon: '⌚', title: 'Study & Stress Analytics', desc: 'Real-time smartwatch health telemetry via Firebase health_reports. Biometric stress tracking and adaptive AI study planning.', color: '#0284c7', bg: '#f0f9ff' },
    { icon: '🏛️', title: 'University Matching',   desc: 'Smart matching with Sri Lankan universities based on your Z-Score, stream, district, and career aspirations.',              color: '#0891b2', bg: '#ecfeff' },
    { icon: '🗺️', title: 'Career Roadmaps',       desc: 'Get a personalised step-by-step roadmap from where you are now to your dream career — with milestones and resources.',     color: '#7c3aed', bg: '#f5f3ff' },
    { icon: '🧑‍🏫', title: 'Expert Mentors',      desc: 'Connect with verified mentors who have walked the path. Get real guidance from professionals in your target field.',        color: '#0d9488', bg: '#f0fdfa' },
    { icon: '📊', title: 'Explainable AI (XAI)',   desc: "We don't just give recommendations — we explain WHY, using transparent AI that shows exactly how each decision was made.", color: '#be185d', bg: '#fdf2f8' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Account', desc: 'Register as a Student or Mentor in seconds. Choose your role to get the right experience.' },
    { num: '02', title: 'Build Your Profile',  desc: 'Enter your A/L stream, Z-Score, personality traits, and your dream career goal.' },
    { num: '03', title: 'Get AI Guidance',     desc: 'Receive personalised university recommendations, roadmaps, and connect with a mentor.' },
  ];

  const stats = [
    { value: '1,000+', label: 'Students Guided',        icon: '🎓' },
    { value: '500+',   label: 'Career Goals Explored',  icon: '🎯' },
    { value: '95%',    label: 'Success Rate',            icon: '🏆' },
    { value: '4.9/5',  label: 'Student Rating',          icon: '⭐' },
  ];

  const universities = [
    'University of Moratuwa', 'University of Colombo',
    'SLIIT', 'NSBM Green University', 'IIT Sri Lanka', 'UCSC Sri Lanka',
  ];

  return (
    <>
      <style>{`
        .hp-root {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          color: #0f172a;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* ════════════════════════════════
           HEADER / NAVBAR
        ════════════════════════════════ */
        .hp-header {
          position: sticky;
          top: 0; left: 0; right: 0;
          height: 68px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          z-index: 200;
        }

        .hp-header-logo {
          display: flex; align-items: center; gap: 11px;
          text-decoration: none;
        }

        .hp-header-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 900; color: white;
        }

        .hp-header-logo-name {
          font-size: 19px; font-weight: 800; color: #0f172a;
        }

        .hp-header-logo-name span { color: #1d4ed8; }

        .hp-header-nav {
          display: flex; align-items: center; gap: 32px;
        }

        .hp-header-link {
          font-size: 14px; font-weight: 500;
          color: #475569; cursor: pointer;
          background: none; border: none;
          font-family: inherit; padding: 0;
          transition: color 0.2s;
          text-decoration: none;
        }

        .hp-header-link:hover { color: #1d4ed8; }

        .hp-header-actions {
          display: flex; align-items: center; gap: 10px;
        }

        .hp-btn-login {
          padding: 9px 20px;
          background: white;
          color: #1d4ed8;
          font-size: 14px; font-weight: 700;
          border: 1.5px solid #bfdbfe;
          border-radius: 9px;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s ease;
        }

        .hp-btn-login:hover {
          background: #eff6ff;
          border-color: #1d4ed8;
        }

        .hp-btn-register {
          padding: 9px 20px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          color: white;
          font-size: 14px; font-weight: 700;
          border: none;
          border-radius: 9px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 14px rgba(29,78,216,0.28);
          transition: all 0.2s ease;
        }

        .hp-btn-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(29,78,216,0.35);
        }

        /* ════════════════════════════════
           HERO
        ════════════════════════════════ */
        .hp-hero {
          min-height: 88vh;
          display: flex; align-items: center;
          background:
            radial-gradient(ellipse at 72% 40%, rgba(219,234,254,0.65) 0%, transparent 55%),
            radial-gradient(ellipse at 18% 80%, rgba(237,233,254,0.45) 0%, transparent 50%),
            #ffffff;
          padding: 60px 60px 60px;
          position: relative; overflow: hidden;
        }

        .hp-hero::before {
          content: '';
          position: absolute;
          width: 550px; height: 550px; border-radius: 50%;
          border: 1px solid rgba(29,78,216,0.07);
          right: -80px; top: -80px; pointer-events: none;
        }

        .hp-hero-inner { max-width: 860px; position: relative; z-index: 2; }

        .hp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 30px;
          font-size: 11px; font-weight: 700; color: #1d4ed8; letter-spacing: 1px;
          margin-bottom: 26px;
        }

        .hp-hero h1 {
          font-size: clamp(38px, 5vw, 68px);
          font-weight: 900; line-height: 1.05; letter-spacing: -2.5px;
          color: #0f172a; margin-bottom: 22px;
        }

        .hp-hero h1 span { color: #1d4ed8; }

        .hp-hero-desc {
          font-size: 17px; line-height: 1.75; color: #475569;
          max-width: 560px; margin-bottom: 36px;
        }

        .hp-hero-actions {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }

        .hp-btn-primary {
          padding: 13px 28px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          color: white; font-size: 15px; font-weight: 700;
          border: none; border-radius: 11px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 24px rgba(29,78,216,0.3);
          transition: all 0.25s ease;
        }

        .hp-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(29,78,216,0.38);
        }

        .hp-btn-secondary {
          padding: 12px 26px;
          background: white; color: #1d4ed8;
          font-size: 15px; font-weight: 700;
          border: 2px solid #bfdbfe; border-radius: 11px;
          cursor: pointer; font-family: inherit;
          transition: all 0.25s ease;
        }

        .hp-btn-secondary:hover {
          border-color: #1d4ed8; background: #eff6ff;
          transform: translateY(-2px);
        }

        .hp-hero-badges {
          display: flex; gap: 10px; flex-wrap: wrap; margin-top: 44px;
        }

        .hp-hero-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px;
          background: white; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 12px; color: #475569; font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ════════════════════════════════
           STATS
        ════════════════════════════════ */
        .hp-stats {
          background: #0f172a; padding: 52px 60px;
        }

        .hp-stats-grid {
          max-width: 900px; margin: auto;
          display: grid; grid-template-columns: repeat(4,1fr); gap: 20px;
        }

        .hp-stat {
          text-align: center; padding: 24px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
        }

        .hp-stat-icon { font-size: 24px; margin-bottom: 10px; }
        .hp-stat-val  { font-size: 32px; font-weight: 900; color: #60a5fa; letter-spacing: -1px; margin-bottom: 6px; }
        .hp-stat-label { font-size: 13px; color: #94a3b8; }

        /* ════════════════════════════════
           SECTION COMMON
        ════════════════════════════════ */
        .hp-section      { padding: 90px 60px; }
        .hp-section-alt  { background: #f8faff; }

        .hp-section-head { text-align: center; margin-bottom: 56px; }
        .hp-section-label { font-size: 11px; font-weight: 800; color: #1d4ed8; letter-spacing: 2px; margin-bottom: 12px; }

        .hp-section-head h2 {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 900; letter-spacing: -1.5px; color: #0f172a; margin-bottom: 12px;
        }

        .hp-section-head h2 span { color: #1d4ed8; }

        .hp-section-head p {
          font-size: 16px; color: #64748b; line-height: 1.7;
          max-width: 520px; margin: auto;
        }

        /* ════════════════════════════════
           FEATURES
        ════════════════════════════════ */
        .hp-features-grid {
          max-width: 960px; margin: auto;
          display: grid; grid-template-columns: repeat(3,1fr); gap: 20px;
        }

        .hp-feature-card {
          background: white; border: 1.5px solid #e2e8f0;
          border-radius: 18px; padding: 28px;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }

        .hp-feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent); transform: scaleX(0);
          transition: transform 0.3s ease; transform-origin: left;
        }

        .hp-feature-card:hover { transform: translateY(-6px); border-color: transparent; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .hp-feature-card:hover::before { transform: scaleX(1); }

        .hp-feature-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 18px; background: var(--bg); }
        .hp-feature-card h3 { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .hp-feature-card p  { font-size: 13px; color: #64748b; line-height: 1.7; }

        /* ════════════════════════════════
           HOW IT WORKS
        ════════════════════════════════ */
        .hp-steps {
          max-width: 820px; margin: auto;
          display: grid; grid-template-columns: repeat(3,1fr); gap: 24px;
          position: relative;
        }

        .hp-steps::before {
          content: ''; position: absolute;
          top: 36px; left: 18%; right: 18%; height: 2px;
          background: linear-gradient(90deg, #bfdbfe, #1d4ed8, #bfdbfe);
        }

        .hp-step { text-align: center; padding: 0 16px; position: relative; z-index: 2; }

        .hp-step-num {
          width: 72px; height: 72px; border-radius: 50%;
          background: white; border: 2.5px solid #bfdbfe;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; font-size: 22px; font-weight: 900; color: #1d4ed8;
          box-shadow: 0 4px 16px rgba(29,78,216,0.12);
        }

        .hp-step h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .hp-step p  { font-size: 13px; color: #64748b; line-height: 1.7; }

        /* ════════════════════════════════
           PORTAL CARDS
        ════════════════════════════════ */
        .hp-portals {
          max-width: 900px; margin: auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }

        .hp-portal-card {
          border-radius: 22px; padding: 36px 30px;
          position: relative; overflow: hidden;
        }

        .hp-portal-card.student { background: linear-gradient(145deg, #1e40af, #1d4ed8, #2563eb); }
        .hp-portal-card.mentor  { background: linear-gradient(145deg, #5b21b6, #7c3aed, #6d28d9); }

        .hp-portal-card * { color: white; }

        .hp-portal-icon { font-size: 44px; margin-bottom: 14px; }

        .hp-portal-card h3 { font-size: 22px; font-weight: 800; margin-bottom: 10px; }

        .hp-portal-desc {
          font-size: 14px; line-height: 1.7;
          opacity: 0.82; margin-bottom: 22px;
        }

        .hp-portal-list {
          list-style: none; padding: 0; margin-bottom: 28px;
        }

        .hp-portal-list li {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 500; margin-bottom: 9px; opacity: 0.9;
        }

        .hp-portal-list li::before {
          content: '✓'; width: 20px; height: 20px;
          background: rgba(255,255,255,0.18); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
        }

        /* Two-button row inside portal card */
        .hp-portal-actions {
          display: flex; gap: 10px; flex-wrap: wrap;
        }

        .hp-portal-btn-login {
          flex: 1;
          padding: 11px 18px;
          background: rgba(255,255,255,0.15);
          color: white; font-size: 13px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 10px;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
          white-space: nowrap;
        }

        .hp-portal-btn-login:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .hp-portal-btn-register {
          flex: 1;
          padding: 11px 18px;
          background: white;
          font-size: 13px; font-weight: 700;
          border: none; border-radius: 10px;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .hp-portal-card.student .hp-portal-btn-register { color: #1d4ed8; }
        .hp-portal-card.mentor  .hp-portal-btn-register { color: #7c3aed; }

        .hp-portal-btn-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        /* ════════════════════════════════
           UNIVERSITIES
        ════════════════════════════════ */
        .hp-unis {
          text-align: center; padding: 56px 60px;
          border-top: 1px solid #f1f5f9; background: white;
        }

        .hp-unis-label {
          font-size: 11px; font-weight: 700; color: #94a3b8;
          letter-spacing: 2px; margin-bottom: 28px;
        }

        .hp-unis-list {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
        }

        .hp-uni-tag {
          padding: 8px 18px; background: #f8faff;
          border: 1px solid #e2e8f0; border-radius: 30px;
          font-size: 13px; font-weight: 600; color: #475569;
        }

        /* ════════════════════════════════
           CTA BANNER
        ════════════════════════════════ */
        .hp-cta {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 80px 60px; text-align: center;
          position: relative; overflow: hidden;
        }

        .hp-cta::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: rgba(29,78,216,0.1); top: -150px; right: -100px; pointer-events: none;
        }

        .hp-cta h2 {
          font-size: clamp(26px, 3.5vw, 44px); font-weight: 900;
          letter-spacing: -1.5px; color: white; margin-bottom: 12px;
          position: relative; z-index: 2;
        }

        .hp-cta h2 span { color: #60a5fa; }

        .hp-cta p {
          font-size: 16px; color: #94a3b8; margin-bottom: 32px;
          position: relative; z-index: 2;
        }

        .hp-cta-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          position: relative; z-index: 2;
        }

        .hp-cta-btn-register {
          padding: 13px 28px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          color: white; font-size: 15px; font-weight: 700;
          border: none; border-radius: 11px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 24px rgba(29,78,216,0.3);
          transition: all 0.25s;
        }

        .hp-cta-btn-register:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(29,78,216,0.4);
        }

        .hp-cta-btn-login {
          padding: 12px 28px;
          background: rgba(255,255,255,0.08);
          color: #cbd5e1; font-size: 15px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.18); border-radius: 11px;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }

        .hp-cta-btn-login:hover { background: rgba(255,255,255,0.14); color: white; }

        /* ════════════════════════════════
           FOOTER
        ════════════════════════════════ */
        .hp-footer {
          background: #0f172a; padding: 28px 60px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; gap: 10px;
        }

        .hp-footer-logo { font-size: 17px; font-weight: 800; color: white; }
        .hp-footer-logo span { color: #60a5fa; }
        .hp-footer-copy { font-size: 12px; color: #475569; }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media (max-width: 900px) {
          .hp-header    { padding: 0 24px; }
          .hp-header-nav { display: none; }
          .hp-hero      { padding: 60px 28px; }
          .hp-section   { padding: 70px 28px; }
          .hp-stats      { padding: 48px 28px; }
          .hp-stats-grid { grid-template-columns: repeat(2,1fr); }
          .hp-features-grid { grid-template-columns: 1fr 1fr; }
          .hp-portals   { grid-template-columns: 1fr; }
          .hp-unis      { padding: 44px 28px; }
          .hp-cta       { padding: 60px 28px; }
          .hp-footer    { padding: 24px 28px; }
        }

        @media (max-width: 600px) {
          .hp-features-grid { grid-template-columns: 1fr; }
          .hp-steps { grid-template-columns: 1fr; }
          .hp-steps::before { display: none; }
          .hp-hero-badges { display: none; }
          .hp-portal-actions { flex-direction: column; }
        }

        /* ════════════════════════════════
           3D ROBOT CHATBOT
        ════════════════════════════════ */

        /* ── FAB container ── */
        .cb-fab {
          position: fixed; bottom: 24px; right: 28px; z-index: 9000;
          width: 76px; height: 110px;
          background: none; border: none; cursor: pointer; padding: 0;
        }

        .cb-badge {
          position: absolute; top: 10px; right: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #ef4444; border: 2px solid white;
          font-size: 10px; font-weight: 800; color: white;
          display: flex; align-items: center; justify-content: center;
          z-index: 2; animation: badge-pop 0.4s ease;
        }

        @keyframes badge-pop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* ── Robot wrapper — bobs up and down ── */
        .robot-wrap {
          width: 76px; height: 100px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          animation: robot-bob 3.2s ease-in-out infinite;
        }

        @keyframes robot-bob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        /* ── Antenna ── */
        .robot-ant-wrap {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: -1px; position: relative; z-index: 2;
          animation: ant-lean 4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        @keyframes ant-lean {
          0%, 100% { transform: rotate(0deg); }
          30%      { transform: rotate(7deg); }
          70%      { transform: rotate(-7deg); }
        }

        .robot-ant-ball {
          width: 10px; height: 10px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #a5f3fc, #06b6d4);
          box-shadow: 0 0 8px 3px rgba(6,182,212,0.75), 0 0 18px rgba(6,182,212,0.4);
          animation: ant-glow 1.4s ease-in-out infinite alternate;
        }

        @keyframes ant-glow {
          from { box-shadow: 0 0 6px 2px rgba(6,182,212,0.6); }
          to   { box-shadow: 0 0 14px 6px rgba(6,182,212,1), 0 0 28px rgba(6,182,212,0.5); }
        }

        .robot-ant-stick {
          width: 3px; height: 18px;
          background: linear-gradient(to bottom, #67e8f9, #1d4ed8);
          border-radius: 2px;
        }

        /* ── Head ── */
        .robot-head {
          width: 58px; height: 50px;
          background: linear-gradient(145deg, #93c5fd 0%, #3b82f6 35%, #1d4ed8 70%, #1e3a8a 100%);
          border-radius: 14px 14px 10px 10px;
          position: relative;
          box-shadow:
            4px 4px 0px #1e3a8a,
            8px 8px 0px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset -2px -2px 6px rgba(0,0,0,0.25),
            0 0 24px rgba(29,78,216,0.35);
          transform: perspective(180px) rotateX(6deg) rotateY(-4deg);
        }

        /* ── Ears ── */
        .robot-ear {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 8px; height: 20px; border-radius: 3px;
        }

        .robot-ear-l {
          left: -8px;
          background: linear-gradient(to right, #1e3a8a, #1d4ed8);
          box-shadow: -3px 3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          border-radius: 4px 0 0 4px;
        }

        .robot-ear-r {
          right: -8px;
          background: linear-gradient(to left, #1e3a8a, #1d4ed8);
          box-shadow: 3px 3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          border-radius: 0 4px 4px 0;
        }

        /* ── Visor / face panel ── */
        .robot-visor {
          position: absolute; top: 9px; left: 9px; right: 9px; bottom: 9px;
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
          border-radius: 8px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
          box-shadow:
            inset 0 2px 8px rgba(0,0,0,0.6),
            inset 0 0 0 1px rgba(96,165,250,0.15),
            0 0 8px rgba(6,182,212,0.15);
          overflow: hidden;
        }

        /* scan-line shimmer */
        .robot-visor::after {
          content: '';
          position: absolute; top: -100%; left: 0; right: 0; height: 40%;
          background: linear-gradient(to bottom, transparent, rgba(96,165,250,0.06), transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0%   { top: -40%; }
          100% { top: 120%; }
        }

        /* ── Eyes ── */
        .robot-eyes { display: flex; gap: 9px; position: relative; z-index: 1; }

        .robot-eye {
          width: 11px; height: 11px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #bfdbfe, #0ea5e9);
          box-shadow:
            0 0 6px 3px rgba(14,165,233,0.85),
            0 0 14px 4px rgba(14,165,233,0.45);
          animation: eye-blink 5s ease-in-out infinite;
        }

        .robot-eye:nth-child(2) { animation-delay: 0.08s; }

        @keyframes eye-blink {
          0%, 88%, 96%, 100% { transform: scaleY(1); }
          92%                { transform: scaleY(0.08); }
        }

        /* ── Mouth ── */
        .robot-mouth { display: flex; gap: 3px; position: relative; z-index: 1; }

        .robot-mouth-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 4px rgba(34,211,238,0.8);
          animation: mouth-pulse 2s ease-in-out infinite;
        }

        .robot-mouth-dot:nth-child(1) { animation-delay: 0s; }
        .robot-mouth-dot:nth-child(2) { animation-delay: 0.15s; }
        .robot-mouth-dot:nth-child(3) { animation-delay: 0.30s; }
        .robot-mouth-dot:nth-child(4) { animation-delay: 0.15s; }
        .robot-mouth-dot:nth-child(5) { animation-delay: 0s; }

        @keyframes mouth-pulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%      { opacity: 1;   transform: scaleY(1.5); }
        }

        /* ── Neck connector ── */
        .robot-neck {
          width: 22px; height: 7px;
          background: linear-gradient(to bottom, #1d4ed8, #1e3a8a);
          border-radius: 0 0 4px 4px;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.25);
          margin-top: -1px; position: relative; z-index: 1;
        }

        /* ── Body ── */
        .robot-body {
          width: 50px; height: 20px;
          background: linear-gradient(145deg, #60a5fa, #2563eb, #1e40af);
          border-radius: 6px 6px 10px 10px;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          box-shadow:
            3px 3px 0 #1e3a8a,
            6px 6px 0 rgba(0,0,0,0.22),
            inset 0 1px 0 rgba(255,255,255,0.2);
          margin-top: -1px;
        }

        .rbl {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .rbl.g { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
        .rbl.r { background: #f87171; box-shadow: 0 0 6px #f87171; animation: blink-r 1.8s ease-in-out infinite; }
        .rbl.y { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: blink-y 2.4s ease-in-out infinite; }

        @keyframes blink-r { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes blink-y { 0%,100%{opacity:0.3} 50%{opacity:1} }

        /* ── Ground glow ── */
        .robot-shadow {
          width: 54px; height: 10px; margin-top: 5px;
          background: radial-gradient(ellipse, rgba(29,78,216,0.55) 0%, transparent 75%);
          border-radius: 50%;
          animation: shadow-pulse 3.2s ease-in-out infinite;
        }

        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1);   opacity: 0.55; }
          50%      { transform: scaleX(0.75); opacity: 0.3; }
        }

        /* ── Close state: robot looks away ── */
        .cb-fab.open .robot-eye { background: radial-gradient(circle at 35% 30%, #fca5a5, #ef4444); box-shadow: 0 0 6px 3px rgba(239,68,68,0.75); }

        /* ── Chat panel ── */
        .cb-panel {
          position: fixed; bottom: 145px; right: 28px; z-index: 8999;
          width: 360px; max-height: 520px;
          background: white; border-radius: 22px;
          box-shadow: 0 28px 70px rgba(0,0,0,0.18);
          display: flex; flex-direction: column;
          border: 1.5px solid #e2e8f0;
          animation: cb-pop 0.28s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }

        @keyframes cb-pop {
          from { opacity: 0; transform: translateY(20px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* ── Panel header with mini robot ── */
        .cb-head {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* Mini robot face in header */
        .cb-robot-mini {
          width: 42px; height: 42px;
          background: linear-gradient(145deg, #93c5fd, #2563eb, #1e40af);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 5px;
          flex-shrink: 0;
          box-shadow: 2px 2px 0 #1e3a8a, 4px 4px 0 rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.25);
          position: relative; overflow: hidden;
        }

        .cb-robot-mini-eyes {
          display: flex; gap: 7px;
        }

        .cb-robot-mini-eye {
          width: 8px; height: 8px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #bfdbfe, #0ea5e9);
          box-shadow: 0 0 5px 2px rgba(14,165,233,0.8);
          animation: eye-blink 5s ease-in-out infinite;
        }

        .cb-robot-mini-mouth {
          display: flex; gap: 2px;
        }

        .cb-robot-mini-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 3px rgba(34,211,238,0.8);
        }

        .cb-head-info { flex: 1; }
        .cb-head-name { font-size: 14px; font-weight: 800; color: white; margin-bottom: 2px; }
        .cb-head-status { font-size: 11px; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 5px; }
        .cb-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: dot-pulse 2s ease-in-out infinite; }

        @keyframes dot-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50%     { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
        }

        .cb-close {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          font-size: 13px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .cb-close:hover { background: rgba(255,255,255,0.18); color: white; }

        /* ── Messages ── */
        .cb-messages {
          flex: 1; overflow-y: auto; padding: 14px 14px 10px;
          display: flex; flex-direction: column; gap: 10px;
          min-height: 0; background: #f8faff;
        }

        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .cb-msg { display: flex; gap: 8px; align-items: flex-end; animation: cb-msg-in 0.22s ease; }

        @keyframes cb-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cb-msg.user { flex-direction: row-reverse; }

        .cb-msg-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; color: white;
          box-shadow: 0 2px 6px rgba(29,78,216,0.3);
        }

        .cb-msg.user .cb-msg-avatar {
          background: linear-gradient(135deg, #475569, #334155);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .cb-bubble {
          max-width: 78%; padding: 10px 13px;
          border-radius: 16px; font-size: 13px; line-height: 1.6;
          white-space: pre-wrap;
        }

        .cb-msg.bot  .cb-bubble { background: white; color: #0f172a; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e2e8f0; }
        .cb-msg.user .cb-bubble { background: linear-gradient(135deg, #1d4ed8, #0a5cff); color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(29,78,216,0.3); }

        .cb-typing { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
        .cb-typing span { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; animation: cb-blink 1.2s infinite; }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cb-blink { 0%,80%,100%{opacity:0.25} 40%{opacity:1} }

        /* ── Quick replies ── */
        .cb-quick { padding: 8px 12px 10px; flex-shrink: 0; display: flex; gap: 6px; flex-wrap: wrap; background: white; border-top: 1px solid #f1f5f9; }

        .cb-qbtn {
          padding: 5px 11px; background: #eff6ff;
          border: 1px solid #bfdbfe; border-radius: 20px;
          font-size: 11px; font-weight: 600; color: #1d4ed8;
          cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
        }
        .cb-qbtn:hover { background: #dbeafe; border-color: #93c5fd; transform: translateY(-1px); }

        /* ── Input row ── */
        .cb-input-row { display: flex; gap: 8px; padding: 10px 12px 13px; flex-shrink: 0; border-top: 1px solid #f1f5f9; background: white; }

        .cb-input {
          flex: 1; padding: 9px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 22px;
          font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s; background: #f8faff;
        }
        .cb-input:focus { border-color: #1d4ed8; background: white; }

        .cb-send {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          border: none; cursor: pointer; color: white;
          font-size: 14px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(29,78,216,0.35);
        }
        .cb-send:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(29,78,216,0.45); }

        @media (max-width: 420px) {
          .cb-panel { width: calc(100vw - 24px); right: 12px; bottom: 155px; }
          .cb-fab   { right: 16px; bottom: 20px; }
        }
      `}</style>

      <div className="hp-root">

        {/* ══════════════ HEADER ══════════════ */}
        <header className="hp-header">

          <div className="hp-header-logo">
            <div className="hp-header-logo-icon">S</div>
            <div className="hp-header-logo-name">Study<span>Fyx</span></div>
          </div>

          <nav className="hp-header-nav">
            {[
              { label: 'Home',         anchor: 'home' },
              { label: 'Features',     anchor: 'features' },
              { label: 'How It Works', anchor: 'how' },
              { label: 'For Students', anchor: 'students' },
              { label: 'For Mentors',  anchor: 'mentors' },
            ].map((n) => (
              <a
                key={n.label}
                className="hp-header-link"
                href={`#${n.anchor}`}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hp-header-actions">
            <button className="hp-btn-login" onClick={onNavigateToLogin}>
              Login
            </button>
            <button className="hp-btn-register" onClick={() => onNavigateToRegister('student')}>
              Create Account
            </button>
          </div>

        </header>

        {/* ══════════════ HERO ══════════════ */}
        <section className="hp-hero" id="home">
          <div className="hp-hero-inner">

            <div className="hp-eyebrow">
              <span>✦</span> AI-POWERED EDUCATION PLATFORM
            </div>

            <h1>
              Find Your <span>Dream Degree</span><br />
              with the Power of AI
            </h1>

            <p className="hp-hero-desc">
              StudyFyx helps Sri Lankan A/L students discover the perfect university degree
              through personalised AI guidance — in English, Sinhala and Tamil.
            </p>

            <div className="hp-hero-actions">
              <button className="hp-btn-primary" onClick={() => onNavigateToRegister('student')}>
                Create Account →
              </button>
              <button className="hp-btn-secondary" onClick={onNavigateToLogin}>
                Login
              </button>
            </div>

            <div className="hp-hero-badges">
              {[
                { icon: '🧠', text: 'AI-Powered Guidance' },
                { icon: '🏛️', text: '6 Top Universities' },
                { icon: '🌐', text: 'English · සිංහල · தமிழ்' },
                { icon: '🔍', text: 'Explainable AI (XAI)' },
              ].map((b) => (
                <div className="hp-hero-badge" key={b.text}>
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ STATS ══════════════ */}
        <section className="hp-stats">
          <div className="hp-stats-grid">
            {stats.map((s) => (
              <div className="hp-stat" key={s.label}>
                <div className="hp-stat-icon">{s.icon}</div>
                <div className="hp-stat-val">{s.value}</div>
                <div className="hp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section className="hp-section" id="features">
          <div className="hp-section-head">
            <div className="hp-section-label">PLATFORM FEATURES</div>
            <h2>Everything you need to <span>succeed.</span></h2>
            <p>From AI-powered recommendations to expert mentors, StudyFyx has the tools to guide your academic future.</p>
          </div>

          <div className="hp-features-grid">
            {features.map((f) => (
              <div className="hp-feature-card" key={f.title} style={{ '--accent': f.color, '--bg': f.bg }}>
                <div className="hp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section className="hp-section hp-section-alt" id="how">
          <div className="hp-section-head">
            <div className="hp-section-label">HOW IT WORKS</div>
            <h2>Three steps to your <span>dream career.</span></h2>
          </div>

          <div className="hp-steps">
            {steps.map((s) => (
              <div className="hp-step" key={s.num}>
                <div className="hp-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ PORTALS ══════════════ */}
        <section className="hp-section">
          <div className="hp-section-head">
            <div className="hp-section-label">WHO IS IT FOR?</div>
            <h2>Built for <span>Students</span> and <span>Mentors.</span></h2>
            <p>Create a free account in your role, or sign in if you already have one.</p>
          </div>

          <div className="hp-portals">

            {/* ── Student Card ── */}
            <div className="hp-portal-card student" id="students">
              <div className="hp-portal-icon">🎓</div>
              <h3>Student Portal</h3>
              <p className="hp-portal-desc">
                Discover your ideal degree path with AI that understands your academic results, personality and dreams.
              </p>
              <ul className="hp-portal-list">
                <li>AI Dream Degree Advisor</li>
                <li>University & program matching</li>
                <li>Career roadmaps & guidance</li>
                <li>Multi-language (EN / SI / TA)</li>
              </ul>

              <div className="hp-portal-actions">
                <button
                  className="hp-portal-btn-register"
                  onClick={() => onNavigateToRegister('student')}
                >
                  Create Student Account
                </button>
                <button
                  className="hp-portal-btn-login"
                  onClick={onNavigateToLogin}
                >
                  Student Login →
                </button>
              </div>
            </div>

            {/* ── Mentor Card ── */}
            <div className="hp-portal-card mentor" id="mentors">
              <div className="hp-portal-icon">🧑‍🏫</div>
              <h3>Mentor Portal</h3>
              <p className="hp-portal-desc">
                Guide students, verify your expertise, manage courses, and build your mentorship reputation.
              </p>
              <ul className="hp-portal-list">
                <li>Mentor verification interview</li>
                <li>CV analysis & medal system</li>
                <li>Course & student management</li>
                <li>Verification history & reports</li>
              </ul>

              <div className="hp-portal-actions">
                <button
                  className="hp-portal-btn-register"
                  onClick={() => onNavigateToRegister('mentor')}
                >
                  Create Mentor Account
                </button>
                <button
                  className="hp-portal-btn-login"
                  onClick={onNavigateToLogin}
                >
                  Mentor Login →
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════ UNIVERSITIES ══════════════ */}
        <div className="hp-unis">
          <div className="hp-unis-label">TRUSTED BY STUDENTS TARGETING THESE UNIVERSITIES</div>
          <div className="hp-unis-list">
            {universities.map((u) => (
              <div className="hp-uni-tag" key={u}>{u}</div>
            ))}
          </div>
        </div>

        {/* ══════════════ CTA BANNER ══════════════ */}
        <section className="hp-cta">
          <h2>Your future is <span>waiting.</span></h2>
          <p>Join thousands of Sri Lankan students already using StudyFyx to plan their academic future.</p>
          <div className="hp-cta-actions">
            <button className="hp-cta-btn-register" onClick={() => onNavigateToRegister('student')}>
              Create Free Account →
            </button>
            <button className="hp-cta-btn-login" onClick={onNavigateToLogin}>
              Login
            </button>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer className="hp-footer">
          <div className="hp-footer-logo">Study<span>Fyx</span></div>
          <div className="hp-footer-copy">© 2026 StudyFyx. AI-powered education for Sri Lanka.</div>
        </footer>

        {/* ══════════════ 3D ROBOT CHATBOT ══════════════ */}

        {/* 3D Robot FAB */}
        <button
          className={`cb-fab ${chatOpen ? 'open' : ''}`}
          onClick={() => setChatOpen(o => !o)}
          aria-label="Open StudyBot"
        >
          {showBadge && !chatOpen && <span className="cb-badge">1</span>}
          <div className="robot-wrap">
            {/* Antenna */}
            <div className="robot-ant-wrap">
              <div className="robot-ant-ball" />
              <div className="robot-ant-stick" />
            </div>
            {/* Head */}
            <div className="robot-head">
              <div className="robot-ear robot-ear-l" />
              <div className="robot-ear robot-ear-r" />
              <div className="robot-visor">
                <div className="robot-eyes">
                  <div className="robot-eye" />
                  <div className="robot-eye" />
                </div>
                <div className="robot-mouth">
                  {[0,1,2,3,4].map(i => <div key={i} className="robot-mouth-dot" />)}
                </div>
              </div>
            </div>
            {/* Neck */}
            <div className="robot-neck" />
            {/* Body */}
            <div className="robot-body">
              <div className="rbl g" /><div className="rbl r" /><div className="rbl y" />
            </div>
            {/* Ground glow */}
            <div className="robot-shadow" />
          </div>
        </button>

        {/* Chat panel */}
        {chatOpen && (
          <div className="cb-panel">

            {/* Header with mini robot face */}
            <div className="cb-head">
              <div className="cb-robot-mini">
                <div className="cb-robot-mini-eyes">
                  <div className="cb-robot-mini-eye" />
                  <div className="cb-robot-mini-eye" />
                </div>
                <div className="cb-robot-mini-mouth">
                  {[0,1,2,3].map(i => <div key={i} className="cb-robot-mini-dot" />)}
                </div>
              </div>
              <div className="cb-head-info">
                <div className="cb-head-name">StudyBot</div>
                <div className="cb-head-status">
                  <span className="cb-dot" /> Online · StudyFyx Assistant
                </div>
              </div>
              <button className="cb-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="cb-messages">
              {messages.map((m, i) => (
                <div key={i} className={`cb-msg ${m.from}`}>
                  <div className="cb-msg-avatar">{m.from === 'bot' ? '🤖' : '👤'}</div>
                  <div className="cb-bubble">{m.text}</div>
                </div>
              ))}
              {typing && (
                <div className="cb-msg bot">
                  <div className="cb-msg-avatar">🤖</div>
                  <div className="cb-bubble">
                    <div className="cb-typing"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="cb-quick">
              {QUICK_REPLIES.map(q => (
                <button key={q} className="cb-qbtn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            {/* Input */}
            <div className="cb-input-row">
              <input
                className="cb-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="cb-send" onClick={() => sendMessage()}>➤</button>
            </div>

          </div>
        )}

      </div>
    </>
  );
}

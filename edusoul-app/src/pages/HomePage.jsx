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

  // Scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('hp-visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.hp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    { icon: '🧠', title: 'AI Dream Advisor',        desc: 'AI analyses your academic profile, personality and goals to recommend the perfect degree path.', color: '#3b82f6' },
    { icon: '⌚', title: 'Stress Analytics',          desc: 'Smartwatch health telemetry with biometric stress tracking and adaptive AI study planning.', color: '#f97316' },
    { icon: '🏛️', title: 'University Matching',     desc: 'Smart matching with Sri Lankan universities based on Z-Score, stream, and career aspirations.', color: '#3b82f6' },
    { icon: '🗺️', title: 'Career Roadmaps',         desc: 'Step-by-step roadmap from where you are now to your dream career with milestones.', color: '#f97316' },
    { icon: '🧑‍🏫', title: 'Expert Mentors',        desc: 'Connect with verified professionals. Get real guidance from experts in your target field.', color: '#3b82f6' },
    { icon: '📊', title: 'Explainable AI',            desc: "Transparent AI that shows exactly how each recommendation decision was made.", color: '#f97316' },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Register as Student or Mentor in seconds.', icon: '👤' },
    { num: '02', title: 'Build Profile',  desc: 'Enter A/L stream, Z-Score, personality, and dream career.', icon: '📝' },
    { num: '03', title: 'Get AI Guidance', desc: 'Receive personalised university recommendations and roadmaps.', icon: '🚀' },
  ];

  const stats = [
    { value: '1,000+', label: 'Students Guided',  icon: '🎓' },
    { value: '500+',   label: 'Goals Explored',   icon: '🎯' },
    { value: '95%',    label: 'Success Rate',      icon: '🏆' },
    { value: '4.9/5',  label: 'Student Rating',    icon: '⭐' },
  ];

  const universities = [
    'University of Moratuwa', 'University of Colombo',
    'SLIIT', 'NSBM Green University', 'IIT Sri Lanka', 'UCSC Sri Lanka',
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════
           ROOT
        ═══════════════════════════════════════ */
        .hp-root {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          color: #334155; background: #ffffff; overflow-x: hidden;
        }

        .hp-reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        .hp-visible { opacity: 1; transform: translateY(0); }
        .hp-delay-1 { transition-delay: 0.12s; }
        .hp-delay-2 { transition-delay: 0.24s; }
        .hp-delay-3 { transition-delay: 0.36s; }
        .hp-delay-4 { transition-delay: 0.48s; }

        /* ═══════════════════════════════════════
           HEADER
        ═══════════════════════════════════════ */
        .hp-header {
          position: fixed; top: 0; left: 0; right: 0; height: 64px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; z-index: 200;
        }
        .hp-header-logo { display: flex; align-items: center; gap: 10px; }
        .hp-header-logo-icon { height: 48px; width: auto; object-fit: contain; }
        .hp-header-nav { display: flex; align-items: center; gap: 8px; }
        .hp-header-link {
          font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.5);
          cursor: pointer; background: none; border: none;
          font-family: inherit; padding: 8px 14px; border-radius: 8px;
          transition: all 0.2s; text-decoration: none;
        }
        .hp-header-link:hover { color: #1e293b; background: rgba(0,0,0,0.04); }
        .hp-header-actions { display: flex; align-items: center; gap: 10px; }
        .hp-btn-login {
          padding: 8px 18px; background: transparent; color: #475569;
          font-size: 13px; font-weight: 600;
          border: 1.5px solid rgba(0,0,0,0.15); border-radius: 10px;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .hp-btn-login:hover { color: #1e293b; border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.03); }
        .hp-btn-register {
          padding: 8px 18px; background: #1e293b; color: white;
          font-size: 13px; font-weight: 700;
          border: 1.5px solid #1e293b; border-radius: 10px;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .hp-btn-register:hover { background: #334155; transform: translateY(-1px); }

        /* ═══════════════════════════════════════
           HERO — cinematic centered
        ═══════════════════════════════════════ */
        .hp-hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; position: relative; overflow: hidden;
          padding: 100px 40px 60px;
          background: radial-gradient(ellipse at 50% 60%, rgba(37,99,235,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.04) 0%, transparent 50%),
                      #ffffff;
        }

        /* Glowing orb behind brand */
        .hp-hero::before {
          content: ''; position: absolute;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 40%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; animation: hp-orb-pulse 6s ease-in-out infinite;
        }
        @keyframes hp-orb-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50%      { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }

        /* Orbiting ring */
        .hp-hero-ring {
          position: absolute; top: 50%; left: 50%;
          width: 520px; height: 520px;
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: hp-ring-spin 60s linear infinite;
          pointer-events: none;
        }
        .hp-hero-ring::after {
          content: ''; position: absolute; top: -4px; left: 50%;
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6; box-shadow: 0 0 12px 4px rgba(59,130,246,0.6);
        }
        @keyframes hp-ring-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

        .hp-hero-ring-2 {
          position: absolute; top: 50%; left: 50%;
          width: 650px; height: 650px;
          border: 1px solid rgba(249,115,22,0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: hp-ring-spin-r 80s linear infinite reverse;
          pointer-events: none;
        }
        .hp-hero-ring-2::after {
          content: ''; position: absolute; bottom: -4px; right: 50%;
          width: 6px; height: 6px; border-radius: 50%;
          background: #f97316; box-shadow: 0 0 10px 3px rgba(249,115,22,0.5);
        }
        @keyframes hp-ring-spin-r { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

        .hp-hero-content { position: relative; z-index: 10; }

        .hp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2); border-radius: 30px;
          font-size: 11px; font-weight: 600; color: #3b82f6;
          letter-spacing: 2px; margin-bottom: 32px;
        }

        /* Brand name */
        .hp-brand-name {
          font-size: clamp(64px, 10vw, 130px);
          font-weight: 900; letter-spacing: -4px; line-height: 1;
          margin-bottom: 24px; position: relative;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 30%, #2563eb 50%, #f97316 70%, #1e293b 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: hp-brand-shine 4s ease-in-out infinite;
        }
        @keyframes hp-brand-shine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hp-brand-name::after {
          content: ''; position: absolute;
          bottom: -8px; left: 50%; transform: translateX(-50%);
          width: 120px; height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, #f97316, transparent);
          border-radius: 2px;
          animation: hp-underline-glow 3s ease-in-out infinite;
        }
        @keyframes hp-underline-glow {
          0%, 100% { opacity: 0.5; width: 80px; }
          50%      { opacity: 1; width: 160px; }
        }

        .hp-hero-subtitle {
          font-size: 16px; line-height: 1.8; color: #64748b;
          max-width: 480px; margin: 0 auto 40px;
        }

        .hp-hero-cta {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 32px; background: transparent;
          color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1.5px;
          border: 1.5px solid rgba(0,0,0,0.2); border-radius: 50px;
          cursor: pointer; font-family: inherit; transition: all 0.3s;
        }
        .hp-hero-cta:hover { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.4); transform: translateY(-2px); }

        /* Side floating elements */
        .hp-hero-side {
          position: absolute; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 10;
        }
        .hp-hero-side.left  { left: 60px; }
        .hp-hero-side.right { right: 60px; }
        .hp-hero-side-orb {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.08);
          backdrop-filter: blur(8px); box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          animation: hp-float 4s ease-in-out infinite;
        }
        .hp-hero-side-orb.delay { animation-delay: 1s; }
        @keyframes hp-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .hp-hero-side-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; }

        /* Bottom arc glow */
        .hp-hero-arc {
          position: absolute; bottom: -280px; left: 50%;
          width: 900px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 40%, transparent 70%);
          transform: translateX(-50%);
          pointer-events: none;
          animation: hp-arc-glow 5s ease-in-out infinite;
        }
        @keyframes hp-arc-glow {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        .hp-hero-arc-line {
          position: absolute; bottom: 120px; left: 50%;
          width: 700px; height: 350px; border-radius: 50%;
          border-top: 2px solid rgba(59,130,246,0.12);
          transform: translateX(-50%);
          pointer-events: none;
        }

        /* Scroll indicator */
        .hp-scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 10; animation: hp-scroll-bob 2s ease-in-out infinite;
        }
        @keyframes hp-scroll-bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        .hp-scroll-arrow {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.12);
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8; font-size: 16px;
        }

        /* ═══════════════════════════════════════
           STATS
        ═══════════════════════════════════════ */
        .hp-stats { background: #f8fafc; padding: 60px 60px; border-top: 1px solid rgba(0,0,0,0.04); }
        .hp-stats-grid { max-width: 900px; margin: auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .hp-stat {
          text-align: center; padding: 28px 16px;
          background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px; transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .hp-stat:hover { background: white; transform: translateY(-4px); border-color: rgba(59,130,246,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .hp-stat-icon { font-size: 28px; margin-bottom: 12px; }
        .hp-stat-val {
          font-size: 32px; font-weight: 900; letter-spacing: -1px; margin-bottom: 6px;
          background: linear-gradient(135deg, #60a5fa, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hp-stat-label { font-size: 13px; color: #94a3b8; }

        /* ═══════════════════════════════════════
           SECTIONS
        ═══════════════════════════════════════ */
        .hp-section { padding: 100px 60px; }
        .hp-section-alt { background: #f8fafc; }
        .hp-section-head { text-align: center; margin-bottom: 60px; }
        .hp-section-label {
          font-size: 11px; font-weight: 700; color: #3b82f6;
          letter-spacing: 2.5px; margin-bottom: 14px;
        }
        .hp-section-head h2 {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 900; letter-spacing: -1.5px; color: #1e293b; margin-bottom: 14px;
        }
        .hp-section-head h2 .blue { color: #3b82f6; }
        .hp-section-head h2 .orange { color: #f97316; }
        .hp-section-head p { font-size: 15px; color: #64748b; line-height: 1.7; max-width: 480px; margin: auto; }

        /* ═══════════════════════════════════════
           FEATURES
        ═══════════════════════════════════════ */
        .hp-features-grid { max-width: 1000px; margin: auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .hp-feature-card {
          background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px; padding: 30px;
          transition: all 0.35s; position: relative; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .hp-feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent); transform: scaleX(0);
          transition: transform 0.35s; transform-origin: left;
        }
        .hp-feature-card:hover { transform: translateY(-6px); background: white; border-color: rgba(59,130,246,0.15); box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
        .hp-feature-card:hover::before { transform: scaleX(1); }
        .hp-feature-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 18px;
          background: #f8fafc; border: 1px solid rgba(0,0,0,0.06);
        }
        .hp-feature-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
        .hp-feature-card p { font-size: 13px; color: #64748b; line-height: 1.75; }

        /* ═══════════════════════════════════════
           HOW IT WORKS
        ═══════════════════════════════════════ */
        .hp-steps { max-width: 860px; margin: auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; position: relative; }
        .hp-steps::before {
          content: ''; position: absolute;
          top: 44px; left: 16%; right: 16%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(249,115,22,0.3), transparent);
        }
        .hp-step { text-align: center; padding: 0 16px; position: relative; z-index: 2; }
        .hp-step-num {
          width: 88px; height: 88px; border-radius: 50%;
          background: white; border: 1px solid rgba(0,0,0,0.08);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; font-size: 32px;
          transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .hp-step:hover .hp-step-num { border-color: rgba(59,130,246,0.4); transform: scale(1.08); background: rgba(59,130,246,0.04); }
        .hp-step-label { font-size: 11px; font-weight: 700; color: #3b82f6; letter-spacing: 1.5px; margin-bottom: 6px; }
        .hp-step h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
        .hp-step p { font-size: 13px; color: #64748b; line-height: 1.7; }

        /* ═══════════════════════════════════════
           PORTALS
        ═══════════════════════════════════════ */
        .hp-portals { max-width: 920px; margin: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .hp-portal-card {
          border-radius: 24px; padding: 40px 32px;
          position: relative; overflow: hidden; transition: transform 0.3s;
        }
        .hp-portal-card:hover { transform: translateY(-4px); }
        .hp-portal-card.student { background: linear-gradient(145deg, #1e3a5f, #1e40af); border: 1px solid rgba(59,130,246,0.2); }
        .hp-portal-card.mentor  { background: linear-gradient(145deg, #5c2d0e, #c2410c); border: 1px solid rgba(249,115,22,0.2); }
        .hp-portal-card * { color: white; }
        .hp-portal-icon { font-size: 48px; margin-bottom: 16px; }
        .hp-portal-card h3 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .hp-portal-desc { font-size: 14px; line-height: 1.75; opacity: 0.7; margin-bottom: 24px; }
        .hp-portal-list { list-style: none; padding: 0; margin-bottom: 28px; }
        .hp-portal-list li { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; margin-bottom: 9px; opacity: 0.8; }
        .hp-portal-list li::before {
          content: '✓'; width: 20px; height: 20px;
          background: rgba(255,255,255,0.12); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
        }
        .hp-portal-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .hp-portal-btn-register {
          flex: 1; padding: 12px 18px; background: white;
          font-size: 13px; font-weight: 700; border: none; border-radius: 12px;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
          white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .hp-portal-card.student .hp-portal-btn-register { color: #1e40af; }
        .hp-portal-card.mentor  .hp-portal-btn-register { color: #c2410c; }
        .hp-portal-btn-register:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .hp-portal-btn-login {
          flex: 1; padding: 12px 18px;
          background: rgba(255,255,255,0.15); color: white;
          font-size: 13px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 12px; cursor: pointer; font-family: inherit;
          transition: all 0.2s; white-space: nowrap;
        }
        .hp-portal-btn-login:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px); }

        /* ═══════════════════════════════════════
           UNIVERSITIES
        ═══════════════════════════════════════ */
        .hp-unis { text-align: center; padding: 60px; border-top: 1px solid rgba(0,0,0,0.04); }
        .hp-unis-label { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; margin-bottom: 28px; }
        .hp-unis-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        .hp-uni-tag {
          padding: 9px 20px; background: #f8fafc;
          border: 1px solid rgba(0,0,0,0.06); border-radius: 30px;
          font-size: 13px; font-weight: 600; color: #64748b;
          transition: all 0.2s;
        }
        .hp-uni-tag:hover { border-color: rgba(59,130,246,0.3); color: #3b82f6; background: rgba(59,130,246,0.04); }

        /* ═══════════════════════════════════════
           CTA
        ═══════════════════════════════════════ */
        .hp-cta {
          padding: 100px 60px; text-align: center; position: relative; overflow: hidden;
          background: radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.04) 0%, transparent 50%),
                      #f8fafc;
        }
        .hp-cta h2 {
          font-size: clamp(28px, 4vw, 52px); font-weight: 900;
          letter-spacing: -2px; color: #1e293b; margin-bottom: 16px;
        }
        .hp-cta h2 .blue { color: #3b82f6; }
        .hp-cta p { font-size: 16px; color: #64748b; margin-bottom: 36px; }
        .hp-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .hp-cta-btn-register {
          padding: 14px 32px;
          background: linear-gradient(135deg, #3b82f6, #f97316);
          color: white; font-size: 15px; font-weight: 700;
          border: none; border-radius: 50px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 30px rgba(59,130,246,0.3);
          transition: all 0.25s;
        }
        .hp-cta-btn-register:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(59,130,246,0.4); }
        .hp-cta-btn-login {
          padding: 13px 28px; background: transparent;
          color: #475569; font-size: 15px; font-weight: 700;
          border: 1.5px solid rgba(0,0,0,0.15); border-radius: 50px;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .hp-cta-btn-login:hover { color: #1e293b; border-color: rgba(0,0,0,0.3); }

        /* ═══════════════════════════════════════
           FOOTER
        ═══════════════════════════════════════ */
        .hp-footer {
          background: #f1f5f9; padding: 28px 60px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.06); flex-wrap: wrap; gap: 10px;
        }
        .hp-footer-logo { font-size: 17px; font-weight: 800; color: #1e293b; }
        .hp-footer-logo .blue { color: #3b82f6; }
        .hp-footer-logo .orange { color: #f97316; }
        .hp-footer-copy { font-size: 12px; color: #94a3b8; }

        /* ═══════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════ */
        @media (max-width: 900px) {
          .hp-header { padding: 0 24px; }
          .hp-header-nav { display: none; }
          .hp-hero { padding: 100px 28px 80px; }
          .hp-hero-side { display: none; }
          .hp-section { padding: 70px 28px; }
          .hp-stats { padding: 48px 28px; }
          .hp-stats-grid { grid-template-columns: repeat(2,1fr); }
          .hp-features-grid { grid-template-columns: 1fr 1fr; }
          .hp-portals { grid-template-columns: 1fr; }
          .hp-unis { padding: 44px 28px; }
          .hp-cta { padding: 70px 28px; }
          .hp-footer { padding: 24px 28px; }
        }
        @media (max-width: 600px) {
          .hp-features-grid { grid-template-columns: 1fr; }
          .hp-steps { grid-template-columns: 1fr; }
          .hp-steps::before { display: none; }
          .hp-portal-actions { flex-direction: column; }
          .hp-hero-ring, .hp-hero-ring-2 { display: none; }
        }

        /* ═══════════════════════════════════════
           CHATBOT
        ═══════════════════════════════════════ */
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
        @keyframes badge-pop { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
        .robot-wrap {
          width: 76px; height: 100px;
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          animation: robot-bob 3.2s ease-in-out infinite;
        }
        @keyframes robot-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .robot-ant-wrap {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: -1px; position: relative; z-index: 2;
          animation: ant-lean 4s ease-in-out infinite; transform-origin: bottom center;
        }
        @keyframes ant-lean { 0%,100%{transform:rotate(0)} 30%{transform:rotate(7deg)} 70%{transform:rotate(-7deg)} }
        .robot-ant-ball {
          width: 10px; height: 10px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #a5f3fc, #06b6d4);
          box-shadow: 0 0 8px 3px rgba(6,182,212,0.75);
          animation: ant-glow 1.4s ease-in-out infinite alternate;
        }
        @keyframes ant-glow { from{box-shadow:0 0 6px 2px rgba(6,182,212,0.6)} to{box-shadow:0 0 14px 6px rgba(6,182,212,1)} }
        .robot-ant-stick { width: 3px; height: 18px; background: linear-gradient(to bottom, #67e8f9, #2563eb); border-radius: 2px; }
        .robot-head {
          width: 58px; height: 50px;
          background: linear-gradient(145deg, #93c5fd 0%, #3b82f6 35%, #1d4ed8 70%, #1e3a8a 100%);
          border-radius: 14px 14px 10px 10px; position: relative;
          box-shadow: 4px 4px 0px #1e3a8a, 8px 8px 0px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 24px rgba(29,78,216,0.35);
          transform: perspective(180px) rotateX(6deg) rotateY(-4deg);
        }
        .robot-ear { position: absolute; top: 50%; transform: translateY(-50%); width: 8px; height: 20px; }
        .robot-ear-l { left: -8px; background: linear-gradient(to right, #1e3a8a, #1d4ed8); border-radius: 4px 0 0 4px; box-shadow: -3px 3px 0 rgba(0,0,0,0.3); }
        .robot-ear-r { right: -8px; background: linear-gradient(to left, #1e3a8a, #1d4ed8); border-radius: 0 4px 4px 0; box-shadow: 3px 3px 0 rgba(0,0,0,0.3); }
        .robot-visor {
          position: absolute; top: 9px; left: 9px; right: 9px; bottom: 9px;
          background: linear-gradient(160deg, #0f172a, #1e293b 60%, #0f172a);
          border-radius: 8px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.6); overflow: hidden;
        }
        .robot-visor::after {
          content: ''; position: absolute; top: -100%; left: 0; right: 0; height: 40%;
          background: linear-gradient(to bottom, transparent, rgba(96,165,250,0.06), transparent);
          animation: scan 3s linear infinite;
        }
        @keyframes scan { 0%{top:-40%} 100%{top:120%} }
        .robot-eyes { display: flex; gap: 9px; position: relative; z-index: 1; }
        .robot-eye {
          width: 11px; height: 11px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #bfdbfe, #0ea5e9);
          box-shadow: 0 0 6px 3px rgba(14,165,233,0.85);
          animation: eye-blink 5s ease-in-out infinite;
        }
        .robot-eye:nth-child(2) { animation-delay: 0.08s; }
        @keyframes eye-blink { 0%,88%,96%,100%{transform:scaleY(1)} 92%{transform:scaleY(0.08)} }
        .robot-mouth { display: flex; gap: 3px; position: relative; z-index: 1; }
        .robot-mouth-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #22d3ee; box-shadow: 0 0 4px rgba(34,211,238,0.8);
          animation: mouth-pulse 2s ease-in-out infinite;
        }
        .robot-mouth-dot:nth-child(1) { animation-delay: 0s; }
        .robot-mouth-dot:nth-child(2) { animation-delay: 0.15s; }
        .robot-mouth-dot:nth-child(3) { animation-delay: 0.30s; }
        .robot-mouth-dot:nth-child(4) { animation-delay: 0.15s; }
        .robot-mouth-dot:nth-child(5) { animation-delay: 0s; }
        @keyframes mouth-pulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.5)} }
        .robot-neck { width: 22px; height: 7px; background: linear-gradient(to bottom, #1d4ed8, #1e3a8a); border-radius: 0 0 4px 4px; box-shadow: 2px 2px 0 rgba(0,0,0,0.25); margin-top: -1px; }
        .robot-body {
          width: 50px; height: 20px;
          background: linear-gradient(145deg, #60a5fa, #2563eb, #1e40af);
          border-radius: 6px 6px 10px 10px;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          box-shadow: 3px 3px 0 #1e3a8a, 6px 6px 0 rgba(0,0,0,0.22); margin-top: -1px;
        }
        .rbl { width: 6px; height: 6px; border-radius: 50%; }
        .rbl.g { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
        .rbl.r { background: #f87171; box-shadow: 0 0 6px #f87171; animation: blink-r 1.8s ease-in-out infinite; }
        .rbl.y { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: blink-y 2.4s ease-in-out infinite; }
        @keyframes blink-r { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes blink-y { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .robot-shadow {
          width: 54px; height: 10px; margin-top: 5px;
          background: radial-gradient(ellipse, rgba(29,78,216,0.55) 0%, transparent 75%);
          border-radius: 50%; animation: shadow-pulse 3.2s ease-in-out infinite;
        }
        @keyframes shadow-pulse { 0%,100%{transform:scaleX(1);opacity:0.55} 50%{transform:scaleX(0.75);opacity:0.3} }
        .cb-fab.open .robot-eye { background: radial-gradient(circle at 35% 30%, #fca5a5, #ef4444); box-shadow: 0 0 6px 3px rgba(239,68,68,0.75); }
        .cb-panel {
          position: fixed; bottom: 145px; right: 28px; z-index: 8999;
          width: 360px; max-height: 520px;
          background: #0f1423; border-radius: 22px;
          box-shadow: 0 28px 70px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
          border: 1px solid rgba(255,255,255,0.08);
          animation: cb-pop 0.28s cubic-bezier(0.34,1.56,0.64,1); overflow: hidden;
        }
        @keyframes cb-pop { from{opacity:0;transform:translateY(20px) scale(0.93)} to{opacity:1;transform:translateY(0) scale(1)} }
        .cb-head {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 14px 16px; display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cb-robot-mini {
          width: 42px; height: 42px;
          background: linear-gradient(145deg, #93c5fd, #2563eb, #1e40af);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 5px; flex-shrink: 0;
          box-shadow: 2px 2px 0 #1e3a8a; position: relative; overflow: hidden;
        }
        .cb-robot-mini-eyes { display: flex; gap: 7px; }
        .cb-robot-mini-eye {
          width: 8px; height: 8px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #bfdbfe, #0ea5e9);
          box-shadow: 0 0 5px 2px rgba(14,165,233,0.8);
          animation: eye-blink 5s ease-in-out infinite;
        }
        .cb-robot-mini-mouth { display: flex; gap: 2px; }
        .cb-robot-mini-dot { width: 3px; height: 3px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 3px rgba(34,211,238,0.8); }
        .cb-head-info { flex: 1; }
        .cb-head-name { font-size: 14px; font-weight: 800; color: white; margin-bottom: 2px; }
        .cb-head-status { font-size: 11px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 5px; }
        .cb-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: dot-pulse 2s ease-in-out infinite; }
        @keyframes dot-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5)} 50%{box-shadow:0 0 0 4px rgba(74,222,128,0)} }
        .cb-close {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .cb-close:hover { background: rgba(255,255,255,0.12); color: white; }
        .cb-messages {
          flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
          min-height: 0; background: #0a0e1a;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .cb-msg { display: flex; gap: 8px; align-items: flex-end; animation: cb-msg-in 0.22s ease; }
        @keyframes cb-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cb-msg.user { flex-direction: row-reverse; }
        .cb-msg-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; color: white;
        }
        .cb-msg.user .cb-msg-avatar { background: linear-gradient(135deg, #475569, #334155); }
        .cb-bubble { max-width: 78%; padding: 10px 13px; border-radius: 16px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
        .cb-msg.bot .cb-bubble { background: rgba(255,255,255,0.05); color: #e2e8f0; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.06); }
        .cb-msg.user .cb-bubble { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border-bottom-right-radius: 4px; }
        .cb-typing { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
        .cb-typing span { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.3); animation: cb-blink 1.2s infinite; }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cb-blink { 0%,80%,100%{opacity:0.25} 40%{opacity:1} }
        .cb-quick { padding: 8px 12px 10px; flex-shrink: 0; display: flex; gap: 6px; flex-wrap: wrap; background: #0d1221; border-top: 1px solid rgba(255,255,255,0.04); }
        .cb-qbtn {
          padding: 5px 11px; background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2); border-radius: 20px;
          font-size: 11px; font-weight: 600; color: #60a5fa;
          cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
        }
        .cb-qbtn:hover { background: rgba(59,130,246,0.15); transform: translateY(-1px); }
        .cb-input-row { display: flex; gap: 8px; padding: 10px 12px 13px; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.04); background: #0d1221; }
        .cb-input {
          flex: 1; padding: 9px 14px;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 22px;
          font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s; background: rgba(255,255,255,0.04); color: #e2e8f0;
        }
        .cb-input::placeholder { color: rgba(255,255,255,0.25); }
        .cb-input:focus { border-color: rgba(59,130,246,0.4); background: rgba(255,255,255,0.06); }
        .cb-send {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border: none; cursor: pointer; color: white;
          font-size: 14px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .cb-send:hover { transform: scale(1.1); }
        @media (max-width: 420px) {
          .cb-panel { width: calc(100vw - 24px); right: 12px; bottom: 155px; }
          .cb-fab { right: 16px; bottom: 20px; }
        }
      `}</style>

      <div className="hp-root">

        {/* ══════════════ HEADER ══════════════ */}
        <header className="hp-header">
          <div className="hp-header-logo">
            <img src="/src/assets/studyfyxlogo.png" alt="StudyFyx" className="hp-header-logo-icon" />
          </div>

          <nav className="hp-header-nav">
            {['Home', 'Features', 'How It Works', 'Students', 'Mentors'].map((label) => (
              <a key={label} className="hp-header-link" href={`#${label.toLowerCase().replace(/\s+/g, '')}`}>{label}</a>
            ))}
          </nav>

          <div className="hp-header-actions">
            <button className="hp-btn-login" onClick={onNavigateToLogin}>Login</button>
            <button className="hp-btn-register" onClick={() => onNavigateToRegister('student')}>Enroll</button>
          </div>
        </header>

        {/* ══════════════ HERO — Cinematic Centered ══════════════ */}
        <section className="hp-hero" id="home">
          {/* Orbiting rings */}
          <div className="hp-hero-ring" />
          <div className="hp-hero-ring-2" />

          {/* Side floating orbs */}
          <div className="hp-hero-side left">
            <div className="hp-hero-side-orb">🎓</div>
            <span className="hp-hero-side-label">STUDENT</span>
          </div>
          <div className="hp-hero-side right">
            <div className="hp-hero-side-orb delay">🧑‍🏫</div>
            <span className="hp-hero-side-label">MENTOR</span>
          </div>

          {/* Center content */}
          <div className="hp-hero-content">
            <div className="hp-eyebrow">
              <span>✦</span> AI-POWERED EDUCATION PLATFORM
            </div>

            <div className="hp-brand-name">StudyFyx</div>

            <p className="hp-hero-subtitle">
              Discover your ideal university degree through personalised AI guidance — built for Sri Lankan A/L students.
            </p>

            <button className="hp-hero-cta" onClick={() => onNavigateToRegister('student')}>
              GET STARTED
            </button>
          </div>

          {/* Bottom arc */}
          <div className="hp-hero-arc" />
          <div className="hp-hero-arc-line" />

          {/* Scroll indicator */}
          <div className="hp-scroll-hint">
            <div className="hp-scroll-arrow">↓</div>
          </div>
        </section>

        {/* ══════════════ STATS ══════════════ */}
        <section className="hp-stats">
          <div className="hp-stats-grid">
            {stats.map((s, i) => (
              <div className={`hp-stat hp-reveal hp-delay-${i + 1}`} key={s.label}>
                <div className="hp-stat-icon">{s.icon}</div>
                <div className="hp-stat-val">{s.value}</div>
                <div className="hp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section className="hp-section" id="features">
          <div className="hp-section-head hp-reveal">
            <div className="hp-section-label">PLATFORM FEATURES</div>
            <h2>Everything you need to <span className="blue">succeed</span></h2>
            <p>From AI-powered recommendations to expert mentors, StudyFyx has the tools to guide your academic future.</p>
          </div>

          <div className="hp-features-grid">
            {features.map((f, i) => (
              <div className={`hp-feature-card hp-reveal hp-delay-${(i % 3) + 1}`} key={f.title} style={{ '--accent': f.color }}>
                <div className="hp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section className="hp-section hp-section-alt" id="howitworks">
          <div className="hp-section-head hp-reveal">
            <div className="hp-section-label">HOW IT WORKS</div>
            <h2>Three steps to your <span className="blue">dream</span> <span className="orange">career</span></h2>
          </div>

          <div className="hp-steps">
            {steps.map((s, i) => (
              <div className={`hp-step hp-reveal hp-delay-${i + 1}`} key={s.num}>
                <div className="hp-step-num">{s.icon}</div>
                <div className="hp-step-label">STEP {s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ PORTALS ══════════════ */}
        <section className="hp-section">
          <div className="hp-section-head hp-reveal">
            <div className="hp-section-label">WHO IS IT FOR?</div>
            <h2>Built for <span className="blue">Students</span> and <span className="orange">Mentors</span></h2>
            <p>Create a free account in your role, or sign in if you already have one.</p>
          </div>

          <div className="hp-portals">
            <div className="hp-portal-card student hp-reveal hp-delay-1" id="students">
              <div className="hp-portal-icon">🎓</div>
              <h3>Student Portal</h3>
              <p className="hp-portal-desc">Discover your ideal degree path with AI that understands your academic results, personality and dreams.</p>
              <ul className="hp-portal-list">
                <li>AI Dream Degree Advisor</li>
                <li>University & program matching</li>
                <li>Career roadmaps & guidance</li>
                <li>Multi-language (EN / SI / TA)</li>
              </ul>
              <div className="hp-portal-actions">
                <button className="hp-portal-btn-register" onClick={() => onNavigateToRegister('student')}>Create Student Account</button>
                <button className="hp-portal-btn-login" onClick={onNavigateToLogin}>Student Login →</button>
              </div>
            </div>

            <div className="hp-portal-card mentor hp-reveal hp-delay-2" id="mentors">
              <div className="hp-portal-icon">🧑‍🏫</div>
              <h3>Mentor Portal</h3>
              <p className="hp-portal-desc">Guide students, verify your expertise, manage courses, and build your mentorship reputation.</p>
              <ul className="hp-portal-list">
                <li>Mentor verification interview</li>
                <li>CV analysis & medal system</li>
                <li>Course & student management</li>
                <li>Verification history & reports</li>
              </ul>
              <div className="hp-portal-actions">
                <button className="hp-portal-btn-register" onClick={() => onNavigateToRegister('mentor')}>Create Mentor Account</button>
                <button className="hp-portal-btn-login" onClick={onNavigateToLogin}>Mentor Login →</button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ UNIVERSITIES ══════════════ */}
        <div className="hp-unis hp-reveal">
          <div className="hp-unis-label">TRUSTED BY STUDENTS TARGETING THESE UNIVERSITIES</div>
          <div className="hp-unis-list">
            {universities.map((u) => <div className="hp-uni-tag" key={u}>{u}</div>)}
          </div>
        </div>

        {/* ══════════════ CTA ══════════════ */}
        <section className="hp-cta">
          <h2 className="hp-reveal">Your future is <span className="blue">waiting</span></h2>
          <p className="hp-reveal hp-delay-1">Join thousands of Sri Lankan students already using StudyFyx to plan their academic future.</p>
          <div className="hp-cta-actions hp-reveal hp-delay-2">
            <button className="hp-cta-btn-register" onClick={() => onNavigateToRegister('student')}>Create Free Account →</button>
            <button className="hp-cta-btn-login" onClick={onNavigateToLogin}>Login</button>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer className="hp-footer">
          <div className="hp-footer-logo">Study<span className="blue">F</span><span className="orange">yx</span></div>
          <div className="hp-footer-copy">© 2026 StudyFyx. AI-powered education for Sri Lanka.</div>
        </footer>

        {/* ══════════════ ROBOT CHATBOT ══════════════ */}
        <button className={`cb-fab ${chatOpen ? 'open' : ''}`} onClick={() => setChatOpen(o => !o)} aria-label="Open StudyBot">
          {showBadge && !chatOpen && <span className="cb-badge">1</span>}
          <div className="robot-wrap">
            <div className="robot-ant-wrap">
              <div className="robot-ant-ball" />
              <div className="robot-ant-stick" />
            </div>
            <div className="robot-head">
              <div className="robot-ear robot-ear-l" />
              <div className="robot-ear robot-ear-r" />
              <div className="robot-visor">
                <div className="robot-eyes"><div className="robot-eye" /><div className="robot-eye" /></div>
                <div className="robot-mouth">{[0,1,2,3,4].map(i => <div key={i} className="robot-mouth-dot" />)}</div>
              </div>
            </div>
            <div className="robot-neck" />
            <div className="robot-body"><div className="rbl g" /><div className="rbl r" /><div className="rbl y" /></div>
            <div className="robot-shadow" />
          </div>
        </button>

        {chatOpen && (
          <div className="cb-panel">
            <div className="cb-head">
              <div className="cb-robot-mini">
                <div className="cb-robot-mini-eyes"><div className="cb-robot-mini-eye" /><div className="cb-robot-mini-eye" /></div>
                <div className="cb-robot-mini-mouth">{[0,1,2,3].map(i => <div key={i} className="cb-robot-mini-dot" />)}</div>
              </div>
              <div className="cb-head-info">
                <div className="cb-head-name">StudyBot</div>
                <div className="cb-head-status"><span className="cb-dot" /> Online · StudyFyx Assistant</div>
              </div>
              <button className="cb-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>
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
                  <div className="cb-bubble"><div className="cb-typing"><span /><span /><span /></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="cb-quick">
              {QUICK_REPLIES.map(q => <button key={q} className="cb-qbtn" onClick={() => sendMessage(q)}>{q}</button>)}
            </div>
            <div className="cb-input-row">
              <input className="cb-input" placeholder="Ask me anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button className="cb-send" onClick={() => sendMessage()}>➤</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

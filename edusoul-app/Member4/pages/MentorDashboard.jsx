import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../src/contexts/AuthContext';
import MentorMedals from '../components/MentorMedals';
import BrandHeader from '../components/BrandHeader';
import ChatList from '../components/ChatList';
import { useApiHealth, useMentorshipStats } from '../hooks/useMentorship';
import {
  ShieldCheck,
  History,
  FileText,
  Sparkles,
  MessageSquare,
  Award,
  Users,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  Globe,
  Star,
  LogOut,
  Target,
  BadgeCheck,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';

const MentorDashboard = ({ 
  onStartVerification, 
  onViewHistory, 
  onStartCVVerification, 
  onMentorshipMatching,
  onNavigateToMessages
}) => {
  const { user, userRole, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const { isConnected, health, loading: healthLoading } = useApiHealth();
  const { stats, loading: statsLoading } = useMentorshipStats();

  const mentorName = user?.displayName || user?.email?.split('@')[0] || 'Mentor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <style>{`
        /* ════════════════════════════════════════════════════════
           Executive Mentor Command Center UI — Status-First Architecture
           ════════════════════════════════════════════════════════ */
        .mentor-exec-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          padding-bottom: 90px;
        }

        /* ── Top Faculty Navigation Bar ── */
        .mentor-exec-nav {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #E2E8F0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .mentor-exec-nav-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 40px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Hero Command Banner ── */
        .mentor-exec-hero {
          position: relative;
          width: 100%;
          min-height: 300px;
          background: #0B0F19;
          overflow: hidden;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #1E293B;
        }

        .mentor-exec-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          opacity: 0.45;
          transform: scale(1.01);
          transition: transform 8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mentor-exec-hero:hover .mentor-exec-hero-bg {
          transform: scale(1.03);
        }

        .mentor-exec-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(11, 15, 25, 0.96) 0%,
            rgba(15, 23, 42, 0.88) 45%,
            rgba(67, 24, 114, 0.42) 100%
          );
        }

        .mentor-exec-hero-content {
          position: relative;
          z-index: 2;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .hero-mentor-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 58, 237, 0.25);
          border: 1px solid rgba(167, 139, 250, 0.4);
          padding: 5px 14px;
          border-radius: 100px;
          color: #DDD6FE;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .hero-mentor-title {
          font-size: 36px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        }

        .hero-mentor-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.82);
          margin: 0 0 20px 0;
          max-width: 580px;
          line-height: 1.55;
        }

        .hero-telemetry-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-telemetry-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 100px;
          padding: 7px 15px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
        }

        .hero-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* ── 3D Live Faculty Card ── */
        .hero-faculty-card {
          position: relative;
          width: 300px;
          height: 200px;
          border-radius: 22px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-faculty-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-tag-bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          padding: 7px 13px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          color: #0F172A;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
          z-index: 5;
          animation: floatTag 3.8s ease-in-out infinite;
        }

        .tag-bubble-top { top: 12px; left: -12px; animation-delay: 0s; }
        .tag-bubble-bottom { bottom: 12px; right: -12px; animation-delay: 1.9s; }

        @keyframes floatTag {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }

        /* ── Executive Command Center Body Layout ── */
        .mentor-exec-body {
          max-width: 1440px;
          margin: -36px auto 0;
          padding: 0 40px;
          position: relative;
          z-index: 3;
        }

        /* ── Action Capabilities Grid (4 Columns) ── */
        .exec-actions-container {
          margin: 32px 0;
        }

        .exec-actions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .exec-actions-title {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .exec-capabilities-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .exec-action-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          min-height: 230px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }

        .exec-action-card:hover {
          transform: translateY(-6px);
          background: var(--tile-hover-bg) !important;
          border-color: transparent !important;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
        }

        .action-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .action-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: var(--tile-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .exec-action-card:hover .action-icon-box {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          transform: rotate(6deg) scale(1.08);
        }

        .action-tag-label {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--tile-accent);
          margin-bottom: 6px;
          display: block;
          transition: color 0.3s ease;
        }

        .exec-action-card:hover .action-tag-label {
          color: #E0E7FF;
        }

        .action-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }

        .exec-action-card:hover .action-title {
          color: #FFFFFF;
        }

        .action-desc {
          font-size: 12px;
          line-height: 1.5;
          color: #64748B;
          transition: color 0.3s ease;
        }

        .exec-action-card:hover .action-desc {
          color: rgba(255, 255, 255, 0.88);
        }

        .action-arrow-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #E2E8F0;
          margin-top: 14px;
          transition: border-color 0.3s ease;
        }

        .exec-action-card:hover .action-arrow-link {
          border-top-color: rgba(255, 255, 255, 0.25);
        }

        .action-btn-text {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          transition: color 0.3s ease;
        }

        .exec-action-card:hover .action-btn-text {
          color: #FFFFFF;
        }

        /* ── Responsive Rules ── */
        @media (max-width: 1200px) {
          .exec-capabilities-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-faculty-card { display: none; }
        }

        @media (max-width: 768px) {
          .exec-capabilities-grid { grid-template-columns: 1fr; }
          .mentor-exec-nav-inner { padding: 0 20px; }
          .mentor-exec-hero-content { padding: 36px 20px; }
          .mentor-exec-body { padding: 0 20px; }
          .hero-mentor-title { font-size: 28px; }
        }
      `}</style>

      <div className="mentor-exec-root">
        {/* ── Top Faculty Navigation Bar ── */}
        <header className="mentor-exec-nav">
          <div className="mentor-exec-nav-inner">
            <BrandHeader 
              title="StudiFyx"
              subtitle="Faculty Mentor Command Portal"
              logoSize="w-12 h-12"
            />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">{user?.email}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                  <p className="text-xs text-purple-700 font-extrabold uppercase tracking-wider">Faculty Mentor</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all duration-200 text-xs font-bold shadow-md shadow-slate-300 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── 3D Hero Command Banner with Executive Faculty Art ── */}
        <div className="mentor-exec-hero">
          <img 
            src="/executive_mentor_hero.jpg" 
            alt="Faculty Mentor Command Center" 
            className="mentor-exec-hero-bg"
          />
          <div className="mentor-exec-hero-overlay" />

          <div className="mentor-exec-hero-content">
            <div>
              <div className="hero-mentor-eyebrow">
                <BadgeCheck size={14} className="text-purple-300" />
                <span>Faculty Mentor Command Portal</span>
              </div>

              <motion.h1
                className="hero-mentor-title"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {greeting}, {mentorName}
              </motion.h1>
              <motion.p
                className="hero-mentor-desc"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Your verified faculty status, evaluation telemetry, and mentorship actions at a glance.
              </motion.p>

              <motion.div 
                className="hero-telemetry-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="hero-telemetry-chip">
                  <span 
                    className="hero-pulse-dot" 
                    style={{ background: isConnected ? '#10B981' : '#F59E0B' }} 
                  />
                  <span>{isConnected ? 'ML Engine Live (Port 5000)' : 'Firebase Standby'}</span>
                </div>

                <div className="hero-telemetry-chip">
                  <Users size={14} className="text-purple-300" />
                  <span>{stats?.total_mentors ? `${stats.total_mentors} Active Mentors` : '11,000+ Verified Pool'}</span>
                </div>

                <div className="hero-telemetry-chip">
                  <BrainCircuit size={14} className="text-cyan-300" />
                  <span>AI Rubric Active</span>
                </div>
              </motion.div>
            </div>

            {/* 3D Live Faculty Card with Floating Bubbles */}
            <motion.div 
              className="hero-faculty-card"
              initial={{ opacity: 0, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <img src="/executive_mentor_hero.jpg" alt="Faculty Mentor AI" />
              
              <div className="hero-tag-bubble tag-bubble-top">
                <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white text-[10px]">
                  <Sparkles size={11} />
                </div>
                <span>Pedagogy AI</span>
              </div>

              <div className="hero-tag-bubble tag-bubble-bottom">
                <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px]">
                  <ShieldCheck size={11} />
                </div>
                <span>Accredited</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Main Executive Body: Status Shown First ── */}
        <div className="mentor-exec-body">

          {/* ════════ 1. PRIMARY STATUS & ACCREDITATION TELEMETRY (SHOWN FIRST) ════════ */}
          <MentorMedals />

          {/* ════════ 2. ACTION CAPABILITIES COMMAND HUB ════════ */}
          <div className="exec-actions-container">
            <div className="exec-actions-header">
              <h3 className="exec-actions-title">
                <Zap size={20} className="text-purple-600" />
                <span>Faculty Actions & Capabilities</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Click any module to launch assessment or tools
              </span>
            </div>

            <div className="exec-capabilities-grid">
              {/* Action 1: AI Oral Verification */}
              <div 
                className="exec-action-card"
                style={{
                  '--tile-hover-bg': 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  '--tile-accent': '#7C3AED'
                }}
                onClick={onStartVerification}
              >
                <div>
                  <div className="action-card-head">
                    <div className="action-icon-box">
                      <ShieldCheck size={24} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">60% WT</span>
                  </div>
                  <span className="action-tag-label">AI ORAL ASSESSMENT</span>
                  <h4 className="action-title">AI Oral Interview</h4>
                  <p className="action-desc">AI-scored interview evaluating pedagogical empathy & boundaries.</p>
                </div>
                <div className="action-arrow-link">
                  <span className="action-btn-text">Start Interview</span>
                  <ArrowUpRight size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Action 2: CV Evaluation */}
              <div 
                className="exec-action-card"
                style={{
                  '--tile-hover-bg': 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
                  '--tile-accent': '#059669'
                }}
                onClick={onStartCVVerification}
              >
                <div>
                  <div className="action-card-head">
                    <div className="action-icon-box">
                      <FileText size={24} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">40% WT</span>
                  </div>
                  <span className="action-tag-label">NLP DOCUMENT AI</span>
                  <h4 className="action-title">CV & Skill Audit</h4>
                  <p className="action-desc">Upload credentials for semantic qualification & domain benchmarking.</p>
                </div>
                <div className="action-arrow-link">
                  <span className="action-btn-text">Upload CV</span>
                  <ArrowUpRight size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Action 3: AI Mentee Matching */}
              <div 
                className="exec-action-card"
                style={{
                  '--tile-hover-bg': 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                  '--tile-accent': '#2563EB'
                }}
                onClick={onMentorshipMatching}
              >
                <div>
                  <div className="action-card-head">
                    <div className="action-icon-box">
                      <Sparkles size={24} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">ML ENGINE</span>
                  </div>
                  <span className="action-tag-label">MATCHING ENGINE</span>
                  <h4 className="action-title">AI Mentee Matching</h4>
                  <p className="action-desc">Discover undergraduates needing your domain guidance.</p>
                </div>
                <div className="action-arrow-link">
                  <span className="action-btn-text">Find Mentees</span>
                  <ArrowUpRight size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Action 4: Mentee Chat */}
              <div 
                className="exec-action-card"
                style={{
                  '--tile-hover-bg': 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                  '--tile-accent': '#4338CA'
                }}
                onClick={onNavigateToMessages ? onNavigateToMessages : () => setShowChat(true)}
              >
                <div>
                  <div className="action-card-head">
                    <div className="action-icon-box">
                      <MessageSquare size={24} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">SYNC HUB</span>
                  </div>
                  <span className="action-tag-label">COLLABORATION</span>
                  <h4 className="action-title">Mentee Live Chat</h4>
                  <p className="action-desc">Direct 1-on-1 messaging channel with your assigned students.</p>
                </div>
                <div className="action-arrow-link">
                  <span className="action-btn-text">Open Chat Hub</span>
                  <ArrowUpRight size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chat Hub Button */}
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-40 flex items-center justify-center cursor-pointer border border-purple-300/40"
          title="Open Mentee Chat Hub"
        >
          <MessageSquare size={22} />
        </button>

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200">
              <ChatList onClose={() => setShowChat(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MentorDashboard;

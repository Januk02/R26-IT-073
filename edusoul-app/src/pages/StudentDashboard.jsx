import React from 'react';
import { 
  GraduationCap, 
  Rocket, 
  Brain, 
  Users, 
  MessageSquare, 
  ArrowUpRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = ({
  onStartDreamDegreeAdvisor,
  onNavigateToCourses,
  onNavigateToAnalytics,
  onNavigateToMentorHub,
  onNavigateToMessages,
}) => {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const modules = [
    {
      id: 'degree',
      num: '01',
      icon: GraduationCap,
      tag: 'DEGREE INTELLIGENCE',
      title: 'FutureDream Degree Advisor',
      desc: 'Discover personalized university degrees and optimal academic pathways matched to your dream career goals.',
      btnLabel: 'Explore Degrees',
      hoverBg: '#147df5',
      accentColor: '#147df5',
      onClick: onStartDreamDegreeAdvisor,
    },
    {
      id: 'career',
      num: '02',
      icon: Rocket,
      tag: 'SKILL-GAP & CAREER AI',
      title: 'Adaptive Career Pathway & Skill-Gap AI',
      desc: 'Calculate your real-time Skill-Gap Index (SGI), explore high-demand industry roles, and generate an adaptive roadmap.',
      btnLabel: 'Launch Career AI',
      hoverBg: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
      accentColor: '#7C3AED',
      onClick: onNavigateToCourses,
    },
    {
      id: 'wellness',
      num: '03',
      icon: Brain,
      tag: 'COGNITIVE & WELLNESS',
      title: 'Study & Stress Analytics',
      desc: 'Monitor study workload patterns, track cognitive stress telemetry, and optimize your daily academic performance.',
      btnLabel: 'View Analytics',
      hoverBg: '#0284C7',
      accentColor: '#0284C7',
      onClick: onNavigateToAnalytics,
    },
    {
      id: 'mentors',
      num: '04',
      icon: Users,
      tag: 'VERIFIED MENTORS',
      title: 'Professional Mentorship Hub',
      desc: 'Connect 1-on-1 with verified industry leaders and university lecturers for structured career guidance.',
      btnLabel: 'Find Mentors',
      hoverBg: '#0D9488',
      accentColor: '#0D9488',
      onClick: onNavigateToMentorHub,
    },
    {
      id: 'messages',
      num: '05',
      icon: MessageSquare,
      tag: 'LIVE MESSAGING',
      title: 'Mentor Chat & Support',
      desc: 'Direct 1-on-1 real-time messaging with your mentors for academic advice, portfolio review, and document sharing.',
      btnLabel: 'Open Messages',
      hoverBg: '#334155',
      accentColor: '#475569',
      onClick: onNavigateToMessages || onNavigateToMentorHub,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        /* ── Page canvas: soft dot grid + colour washes ── */
        .cominvi-root {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          min-height: 100vh;
          color: #0F172A;
          padding: 24px 0 80px;
          position: relative;
          background:
            radial-gradient(60% 40% at 15% 0%, rgba(99, 102, 241, 0.10) 0%, transparent 70%),
            radial-gradient(50% 35% at 90% 5%, rgba(56, 189, 248, 0.10) 0%, transparent 70%),
            #F6F7FB;
        }

        .cominvi-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: linear-gradient(180deg, black 0%, transparent 55%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 55%);
          pointer-events: none;
        }

        .cominvi-root > * { position: relative; }

        /* ── Aurora Hero Card ── */
        .aurora-wrap {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .aurora-hero {
          position: relative;
          min-height: 280px;
          border-radius: 28px;
          overflow: hidden;
          background: #0B1020;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 30px 60px -20px rgba(49, 46, 129, 0.45), 0 0 0 1px rgba(99, 102, 241, 0.08);
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          isolation: isolate;
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.75;
          z-index: -1;
          animation: aurora-drift 16s ease-in-out infinite alternate;
        }

        .aurora-blob.b1 { width: 420px; height: 420px; background: #4F46E5; top: -180px; left: -80px; }
        .aurora-blob.b2 { width: 360px; height: 360px; background: #7C3AED; bottom: -200px; left: 30%; animation-delay: -5s; opacity: 0.6; }
        .aurora-blob.b3 { width: 300px; height: 300px; background: #0EA5E9; top: -120px; right: 18%; animation-delay: -9s; opacity: 0.45; }

        @keyframes aurora-drift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(40px, 20px) scale(1.08); }
          100% { transform: translate(-30px, 30px) scale(0.95); }
        }

        .aurora-grid {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 70% 90% at 30% 50%, black 0%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 90% at 30% 50%, black 0%, transparent 75%);
        }

        .aurora-content {
          padding: 44px 48px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 2;
        }

        .aurora-chip {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          color: #CBD5E1;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .aurora-chip-icon {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(129, 140, 248, 0.25);
          color: #C7D2FE;
          display: flex; align-items: center; justify-content: center;
        }

        .aurora-content h1 {
          font-size: 40px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin: 0 0 14px 0;
        }

        .aurora-name {
          background: linear-gradient(120deg, #A5B4FC 0%, #C4B5FD 45%, #7DD3FC 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: capitalize;
        }

        .aurora-content p {
          font-size: 15.5px;
          color: #94A3B8;
          margin: 0;
          max-width: 540px;
          line-height: 1.65;
        }

        /* Illustration blended into the card */
        .aurora-visual {
          position: relative;
          overflow: hidden;
        }

        .aurora-visual img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          mask-image: linear-gradient(90deg, transparent 0%, black 38%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 38%);
          opacity: 0.92;
          transform: scale(1.02);
          transition: transform 8s ease;
        }

        .aurora-hero:hover .aurora-visual img { transform: scale(1.07); }

        .aurora-visual::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(11,16,32,0) 55%, rgba(11,16,32,0.55) 100%);
        }

        /* ── Section heading above cards ── */
        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin: 36px 0 18px;
        }

        .section-head h2 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #0F172A;
          margin: 0 0 4px;
        }

        .section-head p {
          font-size: 13.5px;
          color: #64748B;
          margin: 0;
        }

        .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          font-size: 12px;
          font-weight: 700;
          color: #4F46E5;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        /* ── Main Interactive Section ── */
        .cominvi-body {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 3;
        }

        /* ── Architectural Cards Grid ── */
        .cards-track {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        /* ── High-End Interactive Card ── */
        .arch-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          min-height: 380px;
          padding: 30px 24px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .arch-card:hover {
          transform: translateY(-8px);
          background: var(--card-hover-bg) !important;
          border-color: transparent !important;
          box-shadow: 0 20px 44px rgba(0, 0, 0, 0.18);
        }

        /* Top Bar in Card */
        .card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .icon-symbol {
          width: 50px;
          height: 50px;
          border-radius: 13px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s ease;
        }

        .arch-card:hover .icon-symbol {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.28);
          color: #FFFFFF;
          transform: rotate(5deg) scale(1.06);
        }

        .index-num {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #94A3B8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
          transition: color 0.3s ease;
        }

        .arch-card:hover .index-num {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Lower Content in Card */
        .card-content {
          margin-top: auto;
          position: relative;
          z-index: 2;
        }

        .tag-line {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent);
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
          transition: color 0.3s ease;
        }

        .arch-card:hover .tag-line {
          color: #E0E7FF;
        }

        .card-main-title {
          font-size: 19px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em;
          line-height: 1.25;
          margin-bottom: 10px;
          transition: color 0.3s ease;
        }

        .arch-card:hover .card-main-title {
          color: #FFFFFF;
        }

        .card-expanded-desc {
          font-size: 13px;
          line-height: 1.55;
          color: #64748B;
          margin-bottom: 20px;
          transition: color 0.3s ease;
        }

        .arch-card:hover .card-expanded-desc {
          color: rgba(255, 255, 255, 0.88);
        }

        /* Bottom Action Link */
        .card-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #E2E8F0;
          transition: border-color 0.3s ease;
        }

        .arch-card:hover .card-action-row {
          border-top-color: rgba(255, 255, 255, 0.2);
        }

        .action-text {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
          transition: color 0.3s ease;
        }

        .arch-card:hover .action-text {
          color: #FFFFFF;
        }

        .arrow-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F1F5F9;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .arch-card:hover .arrow-circle {
          background: #FFFFFF;
          color: #0F172A;
          transform: translateX(4px);
        }

        /* ── Responsive ── */
        @media (max-width: 1280px) {
          .cards-track { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1100px) {
          .aurora-hero { grid-template-columns: 1fr; }
          .aurora-visual { position: absolute; inset: 0; z-index: -1; opacity: 0.35; }
        }

        @media (max-width: 900px) {
          .cards-track { grid-template-columns: repeat(2, 1fr); }
          .aurora-wrap, .cominvi-body { padding: 0 20px; }
          .aurora-content { padding: 36px 28px; }
          .cominvi-root { padding-top: 72px; }
        }

        @media (max-width: 600px) {
          .cards-track { grid-template-columns: 1fr; }
          .aurora-content h1 { font-size: 30px; }
          .section-head { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>

      <div className="cominvi-root">
        {/* ── Aurora Hero Card (Clean without extra buttons) ── */}
        <div className="aurora-wrap">
          <section className="aurora-hero">
            <div className="aurora-blob b1" />
            <div className="aurora-blob b2" />
            <div className="aurora-blob b3" />
            <div className="aurora-grid" />

            <div className="aurora-content">
              <span className="aurora-chip">
                <span className="aurora-chip-icon"><Calendar size={11} strokeWidth={2.5} /></span>
                {today}
              </span>
              <h1>{greeting}, <span className="aurora-name">{firstName}</span></h1>
              <p>Explore your personalized degree recommendations, career pathways, study wellness, and verified mentorship.</p>
            </div>

            <div className="aurora-visual">
              <img src="/dashboard_banner.jpg" alt="Students collaborating in a study lounge" />
            </div>
          </section>
        </div>

        {/* ── Core Modules: Cominvi-Style Interactive Architecture ── */}
        <div className="cominvi-body">
          <div className="section-head">
            <div>
              <h2>Your learning workspace</h2>
              <p>Five AI-powered modules to plan, grow and stay balanced.</p>
            </div>
            <span className="section-pill"><Sparkles size={13} /> AI-powered</span>
          </div>
          
          <div className="cards-track">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="arch-card"
                  style={{
                    '--card-hover-bg': m.hoverBg,
                    '--accent': m.accentColor
                  }}
                  onClick={m.onClick}
                >
                  {/* Top Bar: Icon + Index */}
                  <div className="card-head">
                    <div className="icon-symbol">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <span className="index-num">{m.num}</span>
                  </div>

                  {/* Bottom / Expanded Content */}
                  <div className="card-content">
                    <span className="tag-line">{m.tag}</span>
                    <div className="card-main-title">{m.title}</div>
                    <div className="card-expanded-desc">{m.desc}</div>

                    <div className="card-action-row">
                      <span className="action-text">{m.btnLabel}</span>
                      <div className="arrow-circle">
                        <ArrowUpRight size={16} strokeWidth={2.2} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;

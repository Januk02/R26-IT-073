import React from 'react';
import { 
  GraduationCap, 
  Rocket, 
  Brain, 
  Users, 
  MessageSquare, 
  ArrowUpRight
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
        /* ── Modern Architectural Editorial UI ── */
        .cominvi-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          padding-bottom: 80px;
        }

        /* ── Animated 3D Students Hero Banner ── */
        .cominvi-hero {
          position: relative;
          width: 100%;
          min-height: 290px;
          background: #0F172A;
          overflow: hidden;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #E2E8F0;
        }

        .cominvi-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          opacity: 0.88;
          transform: scale(1.01);
          transition: transform 6s ease;
        }

        .cominvi-hero:hover .cominvi-hero-bg {
          transform: scale(1.03);
        }

        .cominvi-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(15, 23, 42, 0.90) 0%,
            rgba(15, 23, 42, 0.72) 42%,
            rgba(15, 23, 42, 0.28) 100%
          );
        }

        .cominvi-hero-container {
          position: relative;
          z-index: 2;
          max-width: 1380px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 48px;
        }

        .hero-title-group h1 {
          font-size: 38px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .hero-title-group p {
          font-size: 15.5px;
          color: rgba(255, 255, 255, 0.82);
          margin: 0;
          max-width: 580px;
          line-height: 1.6;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
        }

        /* ── Main Interactive Section ── */
        .cominvi-body {
          max-width: 1380px;
          margin: -32px auto 0;
          padding: 0 48px;
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

        @media (max-width: 900px) {
          .cards-track { grid-template-columns: repeat(2, 1fr); }
          .cominvi-hero-container { padding: 32px 24px; }
          .cominvi-body { padding: 0 24px; }
        }

        @media (max-width: 600px) {
          .cards-track { grid-template-columns: 1fr; }
          .hero-title-group h1 { font-size: 28px; }
        }
      `}</style>

      <div className="cominvi-root">
        {/* ── 3D Animated Students Hero Banner ── */}
        <div className="cominvi-hero">
          <img 
            src="/dashboard_banner.jpg" 
            alt="Students Collaborating in Study Lounge" 
            className="cominvi-hero-bg"
          />
          <div className="cominvi-hero-overlay" />
          
          <div className="cominvi-hero-container">
            <div className="hero-title-group">
              <h1>{greeting}, {firstName}</h1>
              <p>Explore your personalized degree recommendations, career pathways, study wellness, and verified mentorship.</p>
            </div>
          </div>
        </div>

        {/* ── Core Modules: Cominvi-Style Interactive Architecture ── */}
        <div className="cominvi-body">
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

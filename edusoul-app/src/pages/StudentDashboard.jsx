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

  const features = [
    {
      id: 'career',
      icon: '🚀',
      title: 'Career Pathway',
      desc: 'Explore curated courses and build the skills needed for your dream career.',
      color: '#1d4ed8',
      bg: '#eff6ff',
      shadow: 'rgba(29,78,216,0.18)',
      btnLabel: 'Explore Courses',
      onClick: onNavigateToCourses,
    },
    {
      id: 'stress',
      icon: '🧠',
      title: 'Stress Analysis',
      desc: 'Track your study patterns, mental well-being, and academic performance.',
      color: '#7c3aed',
      bg: '#f5f3ff',
      shadow: 'rgba(124,58,237,0.18)',
      btnLabel: 'View Analytics',
      onClick: onNavigateToAnalytics,
    },
    {
      id: 'mentorship',
      icon: '🧑‍🏫',
      title: 'Mentorship Hub',
      desc: 'Browse verified industry mentors and university lecturers across Sri Lanka.',
      color: '#be185d',
      bg: '#fdf2f8',
      shadow: 'rgba(190,24,93,0.18)',
      btnLabel: 'Find a Mentor',
      onClick: onNavigateToMentorHub,
    },
    {
      id: 'livechat',
      icon: '💬',
      title: 'Mentor Chat',
      desc: 'Real-time 1-on-1 Firebase messaging with your mentors for academic advice.',
      color: '#0d9488',
      bg: '#f0fdfa',
      shadow: 'rgba(13,148,136,0.18)',
      btnLabel: 'Open Chat',
      onClick: onNavigateToMessages || onNavigateToMentorHub,
    },
  ];

  return (
    <>
      <style>{`
        .sd-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .sd-header {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          padding: 36px 48px; color: white; position: relative; overflow: hidden;
        }

        .sd-header::before {
          content: ''; position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.06); top: -120px; right: -80px;
        }

        .sd-header::after {
          content: ''; position: absolute;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.04); bottom: -60px; left: 200px;
        }

        .sd-greeting {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.65); margin-bottom: 6px;
          position: relative; z-index: 2;
        }

        .sd-header h1 {
          font-size: 30px; font-weight: 900;
          color: white; margin-bottom: 6px;
          position: relative; z-index: 2;
        }

        .sd-header p {
          font-size: 13px; color: rgba(255,255,255,0.70);
          position: relative; z-index: 2;
        }

        .sd-body { padding: 36px 48px; }

        /* ── Dream Advisor Banner ── */
        .sd-advisor {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 18px; padding: 26px 30px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; margin-bottom: 36px;
          box-shadow: 0 12px 36px rgba(124,58,237,0.25);
        }

        .sd-advisor-left { display: flex; align-items: center; gap: 18px; }

        .sd-advisor-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0;
        }

        .sd-advisor h2 { font-size: 20px; font-weight: 800; color: white; margin-bottom: 4px; }
        .sd-advisor p  { font-size: 13px; color: rgba(255,255,255,0.72); }

        .sd-advisor-btn {
          padding: 11px 24px;
          background: white; color: #7c3aed;
          font-size: 13px; font-weight: 800;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: inherit; flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        .sd-advisor-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.2); }

        /* ── Section title ── */
        .sd-section-title {
          font-size: 18px; font-weight: 800; color: #0f172a;
          margin-bottom: 20px;
        }

        /* ── Feature cards grid ── */
        .sd-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }

        .sd-feature-card {
          background: white; border-radius: 18px;
          border: 1.5px solid #e2e8f0; padding: 28px 24px;
          display: flex; flex-direction: column;
          transition: all 0.3s ease;
          cursor: default;
        }

        .sd-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px var(--shadow);
          border-color: var(--color);
        }

        .sd-feature-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--bg); display: flex; align-items: center;
          justify-content: center; font-size: 26px; margin-bottom: 18px;
        }

        .sd-feature-title {
          font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 10px;
        }

        .sd-feature-desc {
          font-size: 13px; color: #64748b; line-height: 1.6; flex: 1; margin-bottom: 22px;
        }

        .sd-feature-btn {
          padding: 11px 20px;
          background: var(--color); color: white;
          font-size: 13px; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: inherit; transition: opacity 0.2s; width: 100%;
        }

        .sd-feature-btn:hover { opacity: 0.88; }

        @media (max-width: 900px) {
          .sd-header { padding: 28px 24px; }
          .sd-body { padding: 24px; }
          .sd-features { grid-template-columns: 1fr; }
          .sd-advisor { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 640px) {
          .sd-advisor-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="sd-root">
        <div className="sd-header">
          <div className="sd-greeting">👋 Welcome back</div>
          <h1>{firstName}'s Dashboard</h1>
          <p>Your personalised learning hub — everything you need in one place</p>
        </div>

        <div className="sd-body">
          {/* Dream Degree Advisor Banner */}
          <div className="sd-advisor">
            <div className="sd-advisor-left">
              <div className="sd-advisor-icon">🎓</div>
              <div>
                <h2>Dream Degree Advisor</h2>
                <p>AI-powered career guidance based on your dream job and academic profile</p>
              </div>
            </div>
            <button className="sd-advisor-btn" onClick={onStartDreamDegreeAdvisor}>
              Start Analysis →
            </button>
          </div>

          {/* Feature Cards */}
          <div className="sd-section-title">Explore Features</div>
          <div className="sd-features">
            {features.map(f => (
              <div
                key={f.id}
                className="sd-feature-card"
                style={{ '--color': f.color, '--bg': f.bg, '--shadow': f.shadow }}
              >
                <div className="sd-feature-icon">{f.icon}</div>
                <div className="sd-feature-title">{f.title}</div>
                <div className="sd-feature-desc">{f.desc}</div>
                <button className="sd-feature-btn" onClick={f.onClick}>{f.btnLabel}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;

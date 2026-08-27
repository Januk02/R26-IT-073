import { useState } from 'react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const studyHours = [2, 3.5, 1.5, 4, 2.5, 5, 3];
const subjectData = [
  { name: 'Combined Maths', score: 78, color: '#1d4ed8', hours: 14 },
  { name: 'Physics',        score: 65, color: '#0891b2', hours: 10 },
  { name: 'Chemistry',      score: 72, color: '#7c3aed', hours: 12 },
];

const insights = [
  { icon: '📈', title: 'Best Study Day', value: 'Saturday', sub: '5 hrs average', color: '#1d4ed8', bg: '#eff6ff' },
  { icon: '⏰', title: 'Weekly Hours', value: '21.5 hrs', sub: 'This week', color: '#0d9488', bg: '#f0fdfa' },
  { icon: '🎯', title: 'Top Subject', value: 'Combined Maths', sub: 'Score: 78%', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: '🔥', title: 'Study Streak', value: '7 Days', sub: 'Keep it up!', color: '#d97706', bg: '#fffbeb' },
];

export default function AnalyticsDashboard({ onViewPlanner, onViewReport }) {
  const maxHours = Math.max(...studyHours);

  return (
    <>
      <style>{`
        .ad-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .ad-header {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          padding: 40px 48px; color: white; position: relative; overflow: hidden;
        }

        .ad-header::before {
          content: ''; position: absolute;
          width: 380px; height: 380px; border-radius: 50%;
          background: rgba(255,255,255,0.06); top: -110px; right: -60px;
        }

        .ad-header h1 { font-size: 32px; font-weight: 900; margin-bottom: 6px; position: relative; z-index: 2; }
        .ad-header p  { font-size: 14px; color: rgba(255,255,255,0.72); position: relative; z-index: 2; }

        .ad-header-actions {
          display: flex; gap: 10px; margin-top: 22px; position: relative; z-index: 2;
        }

        .ad-header-btn {
          padding: 9px 20px;
          background: rgba(255,255,255,0.15);
          color: white; font-size: 13px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.28);
          border-radius: 9px; cursor: pointer; font-family: inherit;
          transition: all 0.2s; backdrop-filter: blur(4px);
        }

        .ad-header-btn:hover { background: rgba(255,255,255,0.25); }

        .ad-body { padding: 36px 48px; }

        /* Insight cards */
        .ad-insights {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 14px; margin-bottom: 32px;
        }

        .ad-insight {
          background: white; border-radius: 14px; padding: 20px;
          border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 14px;
        }

        .ad-insight-icon {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
          background: var(--bg);
        }

        .ad-insight-val { font-size: 18px; font-weight: 900; color: var(--color); margin-bottom: 2px; }
        .ad-insight-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .ad-insight-sub { font-size: 11px; color: #94a3b8; }

        /* Grid row */
        .ad-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

        .ad-card {
          background: white; border-radius: 16px; padding: 24px;
          border: 1.5px solid #e2e8f0;
        }

        .ad-card-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }

        /* Bar chart */
        .ad-bar-chart {
          display: flex; align-items: flex-end; gap: 10px; height: 120px;
        }

        .ad-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }

        .ad-bar {
          width: 100%; border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, #7c3aed, #6d28d9);
          transition: height 0.5s ease;
          min-height: 4px;
        }

        .ad-bar-label { font-size: 10px; color: #94a3b8; font-weight: 600; }
        .ad-bar-val   { font-size: 11px; color: #7c3aed; font-weight: 700; }

        /* Subject scores */
        .ad-subject { margin-bottom: 16px; }

        .ad-subject-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .ad-subject-name  { font-size: 13px; font-weight: 600; color: #0f172a; }
        .ad-subject-score { font-size: 13px; font-weight: 800; color: var(--color); }

        .ad-subject-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .ad-subject-fill { height: 8px; border-radius: 4px; background: var(--color); transition: width 0.6s ease; }

        /* Calendar heatmap */
        .ad-heatmap { display: flex; gap: 5px; flex-wrap: wrap; }

        .ad-heatmap-day {
          width: 16px; height: 16px; border-radius: 3px;
          background: var(--bg, #f1f5f9);
        }

        .ad-legend { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 11px; color: #94a3b8; }
        .ad-legend-box { width: 12px; height: 12px; border-radius: 2px; }

        @media (max-width: 900px) {
          .ad-header { padding: 28px 24px; }
          .ad-body { padding: 24px; }
          .ad-insights { grid-template-columns: 1fr 1fr; }
          .ad-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ad-root">
        <div className="ad-header">
          <h1>📊 Learning Analytics</h1>
          <p>Track your study patterns, performance, and progress over time</p>
          <div className="ad-header-actions">
            <button className="ad-header-btn" onClick={onViewPlanner}>📅 Study Planner</button>
            <button className="ad-header-btn" onClick={onViewReport}>📄 Full Report</button>
          </div>
        </div>

        <div className="ad-body">
          {/* Insights */}
          <div className="ad-insights">
            {insights.map(i => (
              <div key={i.title} className="ad-insight" style={{ '--color': i.color, '--bg': i.bg }}>
                <div className="ad-insight-icon">{i.icon}</div>
                <div>
                  <div className="ad-insight-title">{i.title}</div>
                  <div className="ad-insight-val">{i.value}</div>
                  <div className="ad-insight-sub">{i.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="ad-row">
            {/* Weekly study hours */}
            <div className="ad-card">
              <div className="ad-card-title">Study Hours This Week</div>
              <div className="ad-bar-chart">
                {weekDays.map((day, i) => (
                  <div key={day} className="ad-bar-wrap">
                    <div className="ad-bar-val">{studyHours[i]}h</div>
                    <div className="ad-bar" style={{ height: `${(studyHours[i] / maxHours) * 90}%` }} />
                    <div className="ad-bar-label">{day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject scores */}
            <div className="ad-card">
              <div className="ad-card-title">Subject Performance</div>
              {subjectData.map(s => (
                <div key={s.name} className="ad-subject" style={{ '--color': s.color }}>
                  <div className="ad-subject-header">
                    <span className="ad-subject-name">{s.name}</span>
                    <span className="ad-subject-score">{s.score}%</span>
                  </div>
                  <div className="ad-subject-bar">
                    <div className="ad-subject-fill" style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="ad-card">
            <div className="ad-card-title">Study Activity — Last 12 Weeks</div>
            <div className="ad-heatmap">
              {Array.from({ length: 84 }).map((_, i) => {
                const intensity = Math.random();
                let bg = '#f1f5f9';
                if (intensity > 0.7) bg = '#7c3aed';
                else if (intensity > 0.5) bg = '#a78bfa';
                else if (intensity > 0.3) bg = '#ddd6fe';
                return <div key={i} className="ad-heatmap-day" style={{ background: bg }} />;
              })}
            </div>
            <div className="ad-legend">
              Less
              <div className="ad-legend-box" style={{ background: '#f1f5f9' }} />
              <div className="ad-legend-box" style={{ background: '#ddd6fe' }} />
              <div className="ad-legend-box" style={{ background: '#a78bfa' }} />
              <div className="ad-legend-box" style={{ background: '#7c3aed' }} />
              More
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

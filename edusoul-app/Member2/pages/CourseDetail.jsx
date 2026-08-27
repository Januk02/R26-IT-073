import { useState } from 'react';

export default function CourseDetail({ course, onBack, onEnroll }) {
  const [enrolled, setEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const curriculum = [
    { week: 1, title: 'Getting Started', lessons: ['Introduction & Setup', 'Core Concepts', 'First Project'], done: false },
    { week: 2, title: 'Building Foundations', lessons: ['Deep Dive Part 1', 'Deep Dive Part 2', 'Practice Exercises'], done: false },
    { week: 3, title: 'Intermediate Skills', lessons: ['Advanced Topics', 'Real-world Examples', 'Mini Assignment'], done: false },
    { week: 4, title: 'Practical Applications', lessons: ['Project Workshop', 'Peer Review', 'Q&A Session'], done: false },
  ];

  const reviews = [
    { name: 'Kasun P.', rating: 5, text: 'Excellent course! Clear explanations and very practical exercises.', date: '2 weeks ago' },
    { name: 'Nilufar S.', rating: 5, text: 'This changed the way I think about the subject. Highly recommended!', date: '1 month ago' },
    { name: 'Thilina M.', rating: 4, text: 'Great content. Would love more advanced exercises.', date: '1 month ago' },
  ];

  const handleEnroll = () => {
    setEnrolled(true);
    onEnroll(course);
  };

  if (!course) return null;

  return (
    <>
      <style>{`
        .cd-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .cd-hero {
          background: var(--color);
          background: linear-gradient(135deg, var(--color), var(--color-dark));
          padding: 40px 48px;
          color: white; position: relative; overflow: hidden;
        }

        .cd-hero::before {
          content: ''; position: absolute;
          width: 350px; height: 350px; border-radius: 50%;
          background: rgba(255,255,255,0.07);
          top: -100px; right: -60px;
        }

        .cd-back {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.25);
          color: white; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 8px;
          cursor: pointer; font-family: inherit;
          margin-bottom: 24px; transition: all 0.2s;
          width: fit-content;
        }

        .cd-back:hover { background: rgba(255,255,255,0.25); }

        .cd-hero-content { position: relative; z-index: 2; max-width: 680px; }

        .cd-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          background: rgba(255,255,255,0.15);
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          margin-bottom: 14px;
        }

        .cd-hero h1 { font-size: 28px; font-weight: 900; margin-bottom: 10px; line-height: 1.2; }

        .cd-hero-meta {
          display: flex; gap: 20px; flex-wrap: wrap;
          font-size: 13px; opacity: 0.85; margin-top: 14px;
        }

        .cd-hero-meta span { display: flex; align-items: center; gap: 6px; }

        .cd-enroll-bar {
          background: white; padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          position: sticky; top: 0; z-index: 100;
          flex-wrap: wrap; gap: 12px;
        }

        .cd-enroll-info { font-size: 14px; color: #64748b; }
        .cd-enroll-info strong { color: #0f172a; font-size: 16px; }

        .cd-enroll-btn {
          padding: 12px 32px;
          background: var(--color);
          color: white; font-size: 15px; font-weight: 700;
          border: none; border-radius: 10px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }

        .cd-enroll-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.2); }
        .cd-enroll-btn:disabled { background: #22c55e; cursor: default; }

        .cd-body { padding: 32px 48px; max-width: 860px; }

        .cd-tabs { display: flex; gap: 4px; margin-bottom: 28px; background: white; padding: 6px; border-radius: 12px; border: 1px solid #e2e8f0; width: fit-content; }

        .cd-tab {
          padding: 9px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; border: none; background: none;
          font-family: inherit; color: #64748b; transition: all 0.2s;
        }

        .cd-tab.active { background: var(--color); color: white; }

        .cd-section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }

        .cd-overview-card {
          background: white; border-radius: 14px; padding: 24px;
          border: 1.5px solid #e2e8f0; margin-bottom: 20px;
        }

        .cd-what-learn { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cd-what-learn li { display: flex; gap: 10px; font-size: 13px; color: #374151; }
        .cd-what-learn li::before { content: '✓'; color: var(--color); font-weight: 800; flex-shrink: 0; }

        .cd-week {
          background: white; border-radius: 12px; padding: 18px 22px;
          border: 1.5px solid #e2e8f0; margin-bottom: 12px;
        }

        .cd-week-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .cd-week-label { font-size: 13px; font-weight: 700; color: var(--color); }
        .cd-week h4 { font-size: 15px; font-weight: 700; color: #0f172a; }

        .cd-lessons { list-style: none; padding: 0; }
        .cd-lessons li { font-size: 13px; color: #64748b; padding: 6px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; }
        .cd-lessons li:last-child { border-bottom: none; }
        .cd-lessons li::before { content: '▶'; font-size: 9px; color: var(--color); }

        .cd-review {
          background: white; border-radius: 12px; padding: 20px;
          border: 1.5px solid #e2e8f0; margin-bottom: 12px;
        }

        .cd-review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .cd-review-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .cd-review-stars { color: #f59e0b; font-size: 13px; }
        .cd-review-text { font-size: 13px; color: #475569; line-height: 1.6; }
        .cd-review-date { font-size: 11px; color: #94a3b8; margin-top: 8px; }

        @media (max-width: 768px) {
          .cd-hero { padding: 28px 24px; }
          .cd-enroll-bar { padding: 16px 24px; }
          .cd-body { padding: 24px; }
          .cd-what-learn { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="cd-root"
        style={{
          '--color': course.color,
          '--color-dark': course.color + 'dd',
        }}
      >
        {/* Hero */}
        <div className="cd-hero">
          <button className="cd-back" onClick={onBack}>← Back to Courses</button>
          <div className="cd-hero-content">
            <div className="cd-badge">{course.icon} {course.category}</div>
            <h1>{course.title}</h1>
            <div className="cd-hero-meta">
              <span>👤 {course.instructor}</span>
              <span>⏱ {course.duration}</span>
              <span>📖 {course.lessons} lessons</span>
              <span>👥 {course.students} students</span>
              <span>⭐ {course.rating} rating</span>
            </div>
          </div>
        </div>

        {/* Sticky enroll bar */}
        <div className="cd-enroll-bar">
          <div className="cd-enroll-info">
            <strong>{course.level}</strong> · {course.duration} · {course.lessons} lessons
          </div>
          <button
            className="cd-enroll-btn"
            onClick={handleEnroll}
            disabled={enrolled}
          >
            {enrolled ? '✓ Enrolled!' : 'Enroll Now — Free'}
          </button>
        </div>

        {/* Body */}
        <div className="cd-body">
          <div className="cd-tabs">
            {['overview', 'curriculum', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`cd-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="cd-overview-card">
                <div className="cd-section-title">What You'll Learn</div>
                <ul className="cd-what-learn">
                  {['Core fundamentals and theory', 'Practical hands-on projects', 'Industry-standard tools', 'Problem solving techniques', 'Real-world applications', 'Career-ready skills'].map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="cd-overview-card">
                <div className="cd-section-title">Skills You'll Gain</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {course.tags.map(t => (
                    <span key={t} style={{ padding: '6px 14px', background: course.color + '18', color: course.color, borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'curriculum' && (
            <>
              <div className="cd-section-title">Course Curriculum</div>
              {curriculum.map(week => (
                <div key={week.week} className="cd-week">
                  <div className="cd-week-header">
                    <div>
                      <div className="cd-week-label">Week {week.week}</div>
                      <h4>{week.title}</h4>
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{week.lessons.length} lessons</span>
                  </div>
                  <ul className="cd-lessons">
                    {week.lessons.map(l => <li key={l}>{l}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <div className="cd-section-title">Student Reviews</div>
              {reviews.map((r, i) => (
                <div key={i} className="cd-review">
                  <div className="cd-review-top">
                    <div className="cd-review-name">{r.name}</div>
                    <div className="cd-review-stars">{'⭐'.repeat(r.rating)}</div>
                  </div>
                  <div className="cd-review-text">{r.text}</div>
                  <div className="cd-review-date">{r.date}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

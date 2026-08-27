export default function MyLearning({ enrolledCourses, onBack, onResume }) {
  const hasCourses = enrolledCourses && enrolledCourses.length > 0;

  return (
    <>
      <style>{`
        .ml-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .ml-header {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 40px 48px; color: white;
        }

        .ml-back {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          color: white; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 8px;
          cursor: pointer; font-family: inherit;
          margin-bottom: 20px; transition: all 0.2s;
          width: fit-content;
        }

        .ml-back:hover { background: rgba(255,255,255,0.18); }

        .ml-header h1 { font-size: 30px; font-weight: 900; margin-bottom: 6px; }
        .ml-header p  { font-size: 14px; color: rgba(255,255,255,0.65); }

        .ml-body { padding: 36px 48px; }

        .ml-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 36px;
        }

        .ml-stat {
          background: white; border-radius: 14px; padding: 20px 22px;
          border: 1.5px solid #e2e8f0; text-align: center;
        }

        .ml-stat-icon { font-size: 28px; margin-bottom: 8px; }
        .ml-stat-val  { font-size: 28px; font-weight: 900; color: #1d4ed8; margin-bottom: 4px; }
        .ml-stat-label { font-size: 12px; color: #64748b; }

        .ml-section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 18px; }

        .ml-empty {
          background: white; border-radius: 16px; padding: 60px 32px;
          text-align: center; border: 2px dashed #e2e8f0;
        }

        .ml-empty-icon { font-size: 52px; margin-bottom: 14px; }
        .ml-empty h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .ml-empty p { font-size: 14px; color: #64748b; margin-bottom: 24px; }

        .ml-browse-btn {
          padding: 11px 26px;
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          color: white; font-size: 14px; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: inherit; box-shadow: 0 6px 18px rgba(29,78,216,0.28);
          transition: all 0.2s;
        }

        .ml-browse-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(29,78,216,0.35); }

        .ml-course {
          background: white; border-radius: 14px; padding: 22px;
          border: 1.5px solid #e2e8f0; margin-bottom: 14px;
          display: flex; align-items: center; gap: 18px;
        }

        .ml-course-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0;
          background: var(--bg);
        }

        .ml-course-info { flex: 1; min-width: 0; }

        .ml-course-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }

        .ml-course-instructor { font-size: 12px; color: #64748b; margin-bottom: 10px; }

        .ml-progress-bar {
          height: 6px; background: #f1f5f9; border-radius: 3px; margin-bottom: 4px;
        }

        .ml-progress-fill {
          height: 6px; border-radius: 3px;
          background: var(--color);
          width: var(--progress);
          transition: width 0.5s ease;
        }

        .ml-progress-label { font-size: 11px; color: #94a3b8; }

        .ml-resume-btn {
          padding: 9px 20px;
          background: var(--color);
          color: white; font-size: 13px; font-weight: 700;
          border: none; border-radius: 9px;
          cursor: pointer; font-family: inherit;
          flex-shrink: 0; transition: opacity 0.2s;
        }

        .ml-resume-btn:hover { opacity: 0.85; }

        @media (max-width: 768px) {
          .ml-header { padding: 28px 24px; }
          .ml-body { padding: 24px; }
          .ml-stats { grid-template-columns: 1fr 1fr; }
          .ml-course { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="ml-root">
        <div className="ml-header">
          <button className="ml-back" onClick={onBack}>← Back to Courses</button>
          <h1>My Learning</h1>
          <p>Track your progress and continue where you left off</p>
        </div>

        <div className="ml-body">
          <div className="ml-stats">
            {[
              { icon: '📚', val: hasCourses ? enrolledCourses.length : 0, label: 'Enrolled Courses' },
              { icon: '✅', val: 0, label: 'Completed' },
              { icon: '🏅', val: 0, label: 'Certificates' },
            ].map(s => (
              <div key={s.label} className="ml-stat">
                <div className="ml-stat-icon">{s.icon}</div>
                <div className="ml-stat-val">{s.val}</div>
                <div className="ml-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="ml-section-title">In Progress</div>

          {!hasCourses ? (
            <div className="ml-empty">
              <div className="ml-empty-icon">📖</div>
              <h3>No courses yet</h3>
              <p>Enroll in a course to start your learning journey</p>
              <button className="ml-browse-btn" onClick={onBack}>Browse Courses →</button>
            </div>
          ) : (
            enrolledCourses.map(course => (
              <div
                key={course.id}
                className="ml-course"
                style={{ '--color': course.color, '--bg': course.color + '18' }}
              >
                <div className="ml-course-icon">{course.icon}</div>
                <div className="ml-course-info">
                  <div className="ml-course-title">{course.title}</div>
                  <div className="ml-course-instructor">👤 {course.instructor}</div>
                  <div className="ml-progress-bar">
                    <div className="ml-progress-fill" style={{ '--progress': '5%' }} />
                  </div>
                  <div className="ml-progress-label">5% complete · 0 of {course.lessons} lessons done</div>
                </div>
                <button className="ml-resume-btn" onClick={() => onResume(course)}>
                  Resume →
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default function ProgressReport({ onBack }) {
  const subjects = [
    { name: 'Combined Maths', current: 78, target: 90, hours: 14, color: '#1d4ed8' },
    { name: 'Physics',        current: 65, target: 80, hours: 10, color: '#0891b2' },
    { name: 'Chemistry',      current: 72, target: 85, hours: 12, color: '#7c3aed' },
    { name: 'General English',current: 81, target: 85, hours: 8,  color: '#0d9488' },
  ];

  const milestones = [
    { title: 'Complete Calculus Chapter',     done: true,  date: 'Aug 12' },
    { title: 'Physics Past Papers 2019–2022', done: true,  date: 'Aug 18' },
    { title: 'Chemistry Organic Full Revision',done: false, date: 'Sep 02' },
    { title: 'Mock Exam — Full Paper',        done: false,  date: 'Sep 15' },
    { title: 'University Application Deadline',done: false, date: 'Oct 30' },
  ];

  const getGrade = (score) => {
    if (score >= 85) return { grade: 'A', color: '#22c55e' };
    if (score >= 70) return { grade: 'B', color: '#1d4ed8' };
    if (score >= 55) return { grade: 'C', color: '#d97706' };
    return { grade: 'S', color: '#94a3b8' };
  };

  return (
    <>
      <style>{`
        .pr-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .pr-header {
          background: linear-gradient(135deg, #059669, #0d9488);
          padding: 36px 48px; color: white; position: relative; overflow: hidden;
        }

        .pr-header::before {
          content: ''; position: absolute;
          width: 350px; height: 350px; border-radius: 50%;
          background: rgba(255,255,255,0.06); top: -100px; right: -60px;
        }

        .pr-back {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25);
          color: white; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 8px;
          cursor: pointer; font-family: inherit; margin-bottom: 18px;
          transition: all 0.2s; width: fit-content; position: relative; z-index: 2;
        }

        .pr-back:hover { background: rgba(255,255,255,0.25); }

        .pr-header h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; position: relative; z-index: 2; }
        .pr-header p  { font-size: 13px; color: rgba(255,255,255,0.72); position: relative; z-index: 2; }

        .pr-body { padding: 32px 48px; max-width: 900px; }

        .pr-section-title { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 16px; margin-top: 28px; }

        /* Subject table */
        .pr-table { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; overflow: hidden; }

        .pr-table-head {
          display: grid; grid-template-columns: 1fr 80px 80px 80px 100px;
          background: #f8faff; border-bottom: 1px solid #e2e8f0;
          padding: 12px 20px; gap: 12px;
        }

        .pr-table-head span { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }

        .pr-table-row {
          display: grid; grid-template-columns: 1fr 80px 80px 80px 100px;
          padding: 16px 20px; gap: 12px; border-bottom: 1px solid #f1f5f9;
          align-items: center;
        }

        .pr-table-row:last-child { border-bottom: none; }

        .pr-subj-name { font-size: 14px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .pr-subj-dot  { width: 10px; height: 10px; border-radius: 50%; background: var(--color); flex-shrink: 0; }

        .pr-score { font-size: 15px; font-weight: 900; color: #0f172a; }

        .pr-grade {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 900; color: white;
          background: var(--g-color);
        }

        .pr-gap {
          font-size: 12px; font-weight: 700;
          color: #f59e0b;
        }

        .pr-gap.met { color: #22c55e; }

        /* Mini progress inside table */
        .pr-mini-bar { height: 6px; background: #f1f5f9; border-radius: 3px; flex: 1; }
        .pr-mini-fill { height: 6px; border-radius: 3px; background: var(--color); }

        /* Milestones */
        .pr-milestones { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 20px; }

        .pr-milestone {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f1f5f9;
        }

        .pr-milestone:last-child { border-bottom: none; }

        .pr-milestone-check {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0;
        }

        .pr-milestone-check.done { background: #22c55e; color: white; }
        .pr-milestone-check.todo { background: #f1f5f9; border: 2px solid #cbd5e1; }

        .pr-milestone-title { font-size: 13px; font-weight: 600; color: #0f172a; flex: 1; }
        .pr-milestone-title.done { color: #94a3b8; text-decoration: line-through; }
        .pr-milestone-date { font-size: 11px; color: #94a3b8; }

        /* Summary */
        .pr-summary {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px;
        }

        .pr-sum-card {
          background: white; border-radius: 12px; padding: 18px;
          border: 1.5px solid #e2e8f0; text-align: center;
        }

        .pr-sum-val   { font-size: 26px; font-weight: 900; color: #0d9488; margin-bottom: 4px; }
        .pr-sum-label { font-size: 12px; color: #64748b; }

        @media (max-width: 768px) {
          .pr-header { padding: 28px 24px; }
          .pr-body { padding: 24px; }
          .pr-table-head, .pr-table-row { grid-template-columns: 1fr 60px 60px; }
          .pr-summary { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="pr-root">
        <div className="pr-header">
          <button className="pr-back" onClick={onBack}>← Back to Analytics</button>
          <h1>📄 Progress Report</h1>
          <p>A detailed snapshot of your academic performance and milestones</p>
        </div>

        <div className="pr-body">
          <div className="pr-summary">
            {[
              { val: '74%', label: 'Overall Average' },
              { val: '44h', label: 'Total Study Hours' },
              { val: '2/4', label: 'Milestones Done' },
            ].map(s => (
              <div key={s.label} className="pr-sum-card">
                <div className="pr-sum-val">{s.val}</div>
                <div className="pr-sum-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="pr-section-title">Subject Breakdown</div>
          <div className="pr-table">
            <div className="pr-table-head">
              <span>SUBJECT</span>
              <span>SCORE</span>
              <span>GRADE</span>
              <span>TARGET</span>
              <span>GAP</span>
            </div>
            {subjects.map(s => {
              const { grade, color: gc } = getGrade(s.current);
              const gap = s.target - s.current;
              return (
                <div key={s.name} className="pr-table-row" style={{ '--color': s.color }}>
                  <div className="pr-subj-name">
                    <div className="pr-subj-dot" />
                    {s.name}
                  </div>
                  <div className="pr-score">{s.current}%</div>
                  <div className="pr-grade" style={{ '--g-color': gc }}>{grade}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{s.target}%</div>
                  <div className={`pr-gap ${gap <= 0 ? 'met' : ''}`}>
                    {gap <= 0 ? '✓ Met' : `+${gap}% to go`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pr-section-title">Milestones</div>
          <div className="pr-milestones">
            {milestones.map((m, i) => (
              <div key={i} className="pr-milestone">
                <div className={`pr-milestone-check ${m.done ? 'done' : 'todo'}`}>
                  {m.done ? '✓' : ''}
                </div>
                <div className={`pr-milestone-title ${m.done ? 'done' : ''}`}>{m.title}</div>
                <div className="pr-milestone-date">{m.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

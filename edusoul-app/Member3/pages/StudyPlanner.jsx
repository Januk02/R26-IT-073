import { useState } from 'react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
const subjects = [
  { name: 'Combined Maths', color: '#1d4ed8' },
  { name: 'Physics',        color: '#0891b2' },
  { name: 'Chemistry',      color: '#7c3aed' },
  { name: 'General English', color: '#0d9488' },
  { name: 'Break / Rest',   color: '#94a3b8' },
];

const initialSchedule = {
  'Mon-8:00 AM':  { subject: 'Combined Maths', color: '#1d4ed8' },
  'Mon-10:00 AM': { subject: 'Physics',        color: '#0891b2' },
  'Tue-9:00 AM':  { subject: 'Chemistry',      color: '#7c3aed' },
  'Wed-8:00 AM':  { subject: 'Combined Maths', color: '#1d4ed8' },
  'Thu-7:00 PM':  { subject: 'Physics',        color: '#0891b2' },
  'Fri-6:00 PM':  { subject: 'Chemistry',      color: '#7c3aed' },
  'Sat-9:00 AM':  { subject: 'Combined Maths', color: '#1d4ed8' },
  'Sat-11:00 AM': { subject: 'General English', color: '#0d9488' },
  'Sun-10:00 AM': { subject: 'Break / Rest',   color: '#94a3b8' },
};

export default function StudyPlanner({ onBack }) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selected, setSelected] = useState(subjects[0]);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete Chapter 5 exercises', done: false, subject: 'Combined Maths' },
    { id: 2, text: 'Review wave optics notes',    done: true,  subject: 'Physics' },
    { id: 3, text: 'Past paper 2022 — Section A', done: false, subject: 'Chemistry' },
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleCell = (key) => {
    setSchedule(prev => {
      const updated = { ...prev };
      if (updated[key]?.subject === selected.name) {
        delete updated[key];
      } else {
        updated[key] = { subject: selected.name, color: selected.color };
      }
      return updated;
    });
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask, done: false, subject: selected.name }]);
    setNewTask('');
  };

  return (
    <>
      <style>{`
        .sp-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .sp-header {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 36px 48px; color: white;
        }

        .sp-back {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.18);
          color: white; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 8px;
          cursor: pointer; font-family: inherit; margin-bottom: 18px;
          transition: all 0.2s; width: fit-content;
        }

        .sp-back:hover { background: rgba(255,255,255,0.18); }

        .sp-header h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
        .sp-header p  { font-size: 13px; color: rgba(255,255,255,0.65); }

        .sp-body { padding: 28px 48px; display: grid; grid-template-columns: 1fr 300px; gap: 24px; }

        /* Timetable */
        .sp-timetable { background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; }

        .sp-table-header {
          display: grid; grid-template-columns: 90px repeat(7, 1fr);
          background: #f8faff; border-bottom: 1px solid #e2e8f0;
        }

        .sp-table-cell { padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 700; color: #64748b; }

        .sp-table-row {
          display: grid; grid-template-columns: 90px repeat(7, 1fr);
          border-bottom: 1px solid #f1f5f9;
        }

        .sp-table-row:last-child { border-bottom: none; }

        .sp-time-cell { padding: 10px 12px; font-size: 11px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; }

        .sp-slot {
          padding: 4px; border-right: 1px solid #f1f5f9; cursor: pointer;
          transition: all 0.15s; min-height: 44px; display: flex; align-items: center; justify-content: center;
        }

        .sp-slot:last-child { border-right: none; }
        .sp-slot:hover { background: #f8faff; }

        .sp-slot-filled {
          border-radius: 6px; font-size: 9px; font-weight: 700;
          color: white; text-align: center; padding: 4px 3px;
          line-height: 1.3; width: 100%; min-height: 36px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Subject picker */
        .sp-sidebar {}

        .sp-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 20px; margin-bottom: 16px; }
        .sp-card-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 14px; }

        .sp-subject-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px; border-radius: 9px;
          cursor: pointer; border: 1.5px solid #e2e8f0;
          background: white; font-family: inherit; font-size: 13px; font-weight: 600;
          color: #374151; margin-bottom: 8px; transition: all 0.2s;
          text-align: left;
        }

        .sp-subject-btn.active { border-color: var(--color); background: var(--bg); color: var(--color); }
        .sp-subject-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--color); flex-shrink: 0; }

        /* Tasks */
        .sp-task {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0; border-bottom: 1px solid #f1f5f9;
        }

        .sp-task:last-of-type { border-bottom: none; }

        .sp-task-check {
          width: 18px; height: 18px; border-radius: 5px;
          border: 2px solid #cbd5e1; background: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s; margin-top: 1px;
          font-size: 11px;
        }

        .sp-task-check.done { background: #22c55e; border-color: #22c55e; color: white; }

        .sp-task-text { font-size: 13px; color: #374151; line-height: 1.4; }
        .sp-task-text.done { text-decoration: line-through; color: #94a3b8; }
        .sp-task-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }

        .sp-add-task { display: flex; gap: 8px; margin-top: 12px; }

        .sp-add-input {
          flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s;
        }

        .sp-add-input:focus { border-color: #7c3aed; }

        .sp-add-btn {
          padding: 9px 14px; background: #7c3aed; color: white;
          border: none; border-radius: 8px; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 700; transition: opacity 0.2s;
        }

        .sp-add-btn:hover { opacity: 0.85; }

        .sp-hint { font-size: 11px; color: #94a3b8; margin-top: 10px; }

        @media (max-width: 1024px) {
          .sp-body { grid-template-columns: 1fr; }
          .sp-header { padding: 28px 24px; }
          .sp-body { padding: 24px; }
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-header">
          <button className="sp-back" onClick={onBack}>← Back to Analytics</button>
          <h1>📅 Study Planner</h1>
          <p>Click a cell to assign a subject · Click again to clear</p>
        </div>

        <div className="sp-body">
          {/* Timetable */}
          <div className="sp-timetable">
            <div className="sp-table-header">
              <div className="sp-table-cell">Time</div>
              {days.map(d => <div key={d} className="sp-table-cell">{d}</div>)}
            </div>
            {timeSlots.map(time => (
              <div key={time} className="sp-table-row">
                <div className="sp-time-cell">{time}</div>
                {days.map(day => {
                  const key = `${day}-${time}`;
                  const filled = schedule[key];
                  return (
                    <div key={day} className="sp-slot" onClick={() => toggleCell(key)}>
                      {filled && (
                        <div className="sp-slot-filled" style={{ background: filled.color }}>
                          {filled.subject.split(' ')[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="sp-sidebar">
            {/* Subject picker */}
            <div className="sp-card">
              <div className="sp-card-title">Select Subject to Place</div>
              {subjects.map(s => (
                <button
                  key={s.name}
                  className={`sp-subject-btn ${selected.name === s.name ? 'active' : ''}`}
                  style={{ '--color': s.color, '--bg': s.color + '18' }}
                  onClick={() => setSelected(s)}
                >
                  <div className="sp-subject-dot" style={{ '--color': s.color }} />
                  {s.name}
                </button>
              ))}
              <p className="sp-hint">Tap a timetable cell to place or remove</p>
            </div>

            {/* Tasks */}
            <div className="sp-card">
              <div className="sp-card-title">Today's Tasks</div>
              {tasks.map(t => (
                <div key={t.id} className="sp-task" onClick={() => toggleTask(t.id)}>
                  <div className={`sp-task-check ${t.done ? 'done' : ''}`}>
                    {t.done ? '✓' : ''}
                  </div>
                  <div>
                    <div className={`sp-task-text ${t.done ? 'done' : ''}`}>{t.text}</div>
                    <div className="sp-task-sub">{t.subject}</div>
                  </div>
                </div>
              ))}
              <div className="sp-add-task">
                <input
                  className="sp-add-input"
                  placeholder="Add task..."
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                />
                <button className="sp-add-btn" onClick={addTask}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

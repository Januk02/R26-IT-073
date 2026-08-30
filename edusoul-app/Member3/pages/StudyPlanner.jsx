import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, BookOpen, Clock, CheckCircle2, 
  Calendar, Palette, X 
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

// Color palette for custom subjects
const SUBJECT_COLORS = [
  '#1d4ed8', '#0891b2', '#7c3aed', '#0d9488', '#dc2626',
  '#d97706', '#059669', '#be185d', '#4f46e5', '#0369a1',
  '#c026d3', '#ea580c', '#2563eb', '#16a34a', '#9333ea',
];

// Default subjects the student starts with — can add/remove freely
const DEFAULT_SUBJECTS = [
  { name: 'Break / Rest', color: '#94a3b8' },
];

export default function StudyPlanner({ onBack }) {
  const { user } = useAuth();

  // Subjects: fully dynamic — student can type any name
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [selected, setSelected] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [nextColorIdx, setNextColorIdx] = useState(0);

  // Schedule: { 'Day-Time': { subject, color } }
  const [schedule, setSchedule] = useState({});

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Load saved study plan from Firebase
  useEffect(() => {
    if (!user?.uid || !db) return;
    const loadPlan = async () => {
      try {
        const ref = doc(db, 'students', user.uid, 'study_plan', 'current');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.subjects && data.subjects.length > 0) setSubjects(data.subjects);
          if (data.schedule) setSchedule(data.schedule);
          if (data.tasks) setTasks(data.tasks);
        }
      } catch (e) {
        console.warn('Could not load study plan:', e);
      }
    };
    loadPlan();
  }, [user]);

  // Save study plan to Firebase (debounced auto-save)
  useEffect(() => {
    if (!user?.uid || !db) return;
    const timer = setTimeout(async () => {
      try {
        const ref = doc(db, 'students', user.uid, 'study_plan', 'current');
        await setDoc(ref, { subjects, schedule, tasks, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.warn('Auto-save failed:', e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [subjects, schedule, tasks, user]);

  // Add a new subject typed by the student
  const addSubject = () => {
    const name = newSubjectName.trim();
    if (!name || subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    const color = SUBJECT_COLORS[nextColorIdx % SUBJECT_COLORS.length];
    const newSub = { name, color };
    setSubjects(prev => [...prev, newSub]);
    setSelected(newSub);
    setNewSubjectName('');
    setShowAddSubject(false);
    setNextColorIdx(prev => prev + 1);
  };

  // Remove a subject
  const removeSubject = (subName) => {
    setSubjects(prev => prev.filter(s => s.name !== subName));
    // Also clear from schedule
    setSchedule(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key]?.subject === subName) delete updated[key];
      });
      return updated;
    });
    if (selected?.name === subName) setSelected(subjects[0] || null);
  };

  // Toggle cell in timetable
  const toggleCell = (key) => {
    if (!selected) return;
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

  // Tasks
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), done: false, subject: selected?.name || 'General' }]);
    setNewTask('');
  };
  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // Count scheduled hours per subject
  const subjectHours = {};
  Object.values(schedule).forEach(slot => {
    subjectHours[slot.subject] = (subjectHours[slot.subject] || 0) + 1;
  });

  return (
    <>
      <style>{`
        .sp-root { font-family: Inter, -apple-system, sans-serif; min-height: 100vh; background: #f8faff; }

        .sp-header {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 32px 40px; color: white;
        }
        .sp-back {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.18);
          color: white; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 8px;
          cursor: pointer; font-family: inherit; margin-bottom: 16px;
          transition: all 0.2s; width: fit-content;
        }
        .sp-back:hover { background: rgba(255,255,255,0.18); }
        .sp-header h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
        .sp-header p { font-size: 13px; color: rgba(255,255,255,0.65); }

        .sp-body { padding: 28px 40px; display: grid; grid-template-columns: 1fr 320px; gap: 24px; }

        /* Timetable */
        .sp-timetable { background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: auto; }
        .sp-table-header {
          display: grid; grid-template-columns: 80px repeat(7, 1fr);
          background: #f8faff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 2;
        }
        .sp-table-cell { padding: 10px 6px; text-align: center; font-size: 12px; font-weight: 700; color: #64748b; }
        .sp-table-row { display: grid; grid-template-columns: 80px repeat(7, 1fr); border-bottom: 1px solid #f1f5f9; }
        .sp-table-row:last-child { border-bottom: none; }
        .sp-time-cell { padding: 8px 8px; font-size: 11px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; }

        .sp-slot {
          padding: 3px; border-right: 1px solid #f1f5f9; cursor: pointer;
          transition: all 0.15s; min-height: 40px; display: flex; align-items: center; justify-content: center;
        }
        .sp-slot:last-child { border-right: none; }
        .sp-slot:hover { background: #f0f9ff; }

        .sp-slot-filled {
          border-radius: 6px; font-size: 9px; font-weight: 700;
          color: white; text-align: center; padding: 4px 3px;
          line-height: 1.2; width: 100%; min-height: 34px;
          display: flex; align-items: center; justify-content: center;
          word-break: break-word;
        }

        /* Sidebar */
        .sp-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 18px; margin-bottom: 14px; }
        .sp-card-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

        .sp-subject-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px; border-radius: 9px;
          cursor: pointer; border: 1.5px solid #e2e8f0;
          background: white; font-family: inherit; font-size: 13px; font-weight: 600;
          color: #374151; margin-bottom: 6px; transition: all 0.2s; text-align: left;
          position: relative;
        }
        .sp-subject-btn.active { border-color: var(--color); background: var(--bg); color: var(--color); }
        .sp-subject-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--color); flex-shrink: 0; }
        .sp-subject-remove {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #cbd5e1; padding: 2px;
          display: flex; align-items: center; transition: color 0.2s;
        }
        .sp-subject-remove:hover { color: #ef4444; }

        .sp-add-subject-row { display: flex; gap: 6px; margin-top: 8px; }
        .sp-add-subject-input {
          flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; font-family: inherit; outline: none;
        }
        .sp-add-subject-input:focus { border-color: #7c3aed; }
        .sp-add-subject-input::placeholder { color: #cbd5e1; }

        .sp-icon-btn {
          width: 36px; height: 36px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }

        /* Tasks */
        .sp-task {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #f1f5f9;
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
        .sp-task-text { font-size: 13px; color: #374151; line-height: 1.4; flex: 1; }
        .sp-task-text.done { text-decoration: line-through; color: #94a3b8; }
        .sp-task-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }

        .sp-add-task { display: flex; gap: 6px; margin-top: 10px; }
        .sp-add-input {
          flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; font-family: inherit; outline: none;
        }
        .sp-add-input:focus { border-color: #7c3aed; }
        .sp-add-btn {
          padding: 9px 14px; background: #7c3aed; color: white;
          border: none; border-radius: 8px; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 700;
        }

        /* Hours summary */
        .sp-hours-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .sp-hours-label { font-size: 12px; font-weight: 600; color: #374151; min-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-hours-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .sp-hours-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        .sp-hours-count { font-size: 12px; font-weight: 800; min-width: 36px; text-align: right; }

        .sp-hint { font-size: 11px; color: #94a3b8; margin-top: 8px; }

        @media (max-width: 1024px) {
          .sp-body { grid-template-columns: 1fr; }
          .sp-header { padding: 24px; }
          .sp-body { padding: 20px; }
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-header">
          <button className="sp-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Analytics
          </button>
          <h1>📅 Study Planner</h1>
          <p>Add your own subjects · Click cells to build your timetable · Auto-saved to Firebase</p>
        </div>

        <div className="sp-body">
          {/* ── TIMETABLE ── */}
          <div className="sp-timetable">
            <div className="sp-table-header">
              <div className="sp-table-cell">Time</div>
              {DAYS.map(d => <div key={d} className="sp-table-cell">{d}</div>)}
            </div>
            {TIME_SLOTS.map(time => (
              <div key={time} className="sp-table-row">
                <div className="sp-time-cell">{time}</div>
                {DAYS.map(day => {
                  const key = `${day}-${time}`;
                  const filled = schedule[key];
                  return (
                    <div key={day} className="sp-slot" onClick={() => toggleCell(key)}
                      title={filled ? `${filled.subject} — click to clear` : selected ? `Place ${selected.name}` : 'Select a subject first'}
                    >
                      {filled && (
                        <div className="sp-slot-filled" style={{ background: filled.color }}>
                          {filled.subject.length > 12 ? filled.subject.substring(0, 11) + '…' : filled.subject}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── SIDEBAR ── */}
          <div>
            {/* Subject Picker — Type Any Name */}
            <div className="sp-card">
              <div className="sp-card-title"><Palette size={16} color="#7c3aed" /> My Subjects</div>

              {subjects.map(s => (
                <button
                  key={s.name}
                  className={`sp-subject-btn ${selected?.name === s.name ? 'active' : ''}`}
                  style={{ '--color': s.color, '--bg': s.color + '18' }}
                  onClick={() => setSelected(s)}
                >
                  <div className="sp-subject-dot" style={{ '--color': s.color }} />
                  {s.name}
                  {s.name !== 'Break / Rest' && (
                    <span className="sp-subject-remove" onClick={(e) => { e.stopPropagation(); removeSubject(s.name); }}>
                      <X size={14} />
                    </span>
                  )}
                </button>
              ))}

              {/* Add new subject */}
              {showAddSubject ? (
                <div className="sp-add-subject-row">
                  <input
                    className="sp-add-subject-input"
                    placeholder="Type subject name..."
                    value={newSubjectName}
                    onChange={e => setNewSubjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubject()}
                    autoFocus
                  />
                  <button
                    className="sp-icon-btn"
                    style={{ background: '#7c3aed', color: 'white' }}
                    onClick={addSubject}
                    disabled={!newSubjectName.trim()}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    className="sp-icon-btn"
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                    onClick={() => { setShowAddSubject(false); setNewSubjectName(''); }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  className="sp-subject-btn"
                  style={{ '--color': '#7c3aed', '--bg': '#f5f3ff', borderStyle: 'dashed', justifyContent: 'center' }}
                  onClick={() => setShowAddSubject(true)}
                >
                  <Plus size={14} /> Add Subject
                </button>
              )}

              <p className="sp-hint">
                {selected
                  ? `Selected: ${selected.name} — click timetable cells to place`
                  : 'Select or add a subject, then click timetable cells'}
              </p>
            </div>

            {/* Weekly Hours Summary */}
            <div className="sp-card">
              <div className="sp-card-title"><Clock size={16} color="#0284c7" /> Weekly Hours</div>
              {subjects.filter(s => subjectHours[s.name]).map(s => (
                <div key={s.name} className="sp-hours-bar">
                  <span className="sp-hours-label">{s.name}</span>
                  <div className="sp-hours-track">
                    <div className="sp-hours-fill" style={{ width: `${Math.min(100, (subjectHours[s.name] / 20) * 100)}%`, background: s.color }} />
                  </div>
                  <span className="sp-hours-count" style={{ color: s.color }}>{subjectHours[s.name]}h</span>
                </div>
              ))}
              {Object.keys(subjectHours).length === 0 && (
                <p className="sp-hint">No slots assigned yet. Click the timetable to start.</p>
              )}
            </div>

            {/* Tasks */}
            <div className="sp-card">
              <div className="sp-card-title"><CheckCircle2 size={16} color="#10b981" /> Study Tasks</div>
              {tasks.map(t => (
                <div key={t.id} className="sp-task">
                  <div
                    className={`sp-task-check ${t.done ? 'done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                  >
                    {t.done ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={`sp-task-text ${t.done ? 'done' : ''}`}>{t.text}</div>
                    <div className="sp-task-sub">{t.subject}</div>
                  </div>
                  <button
                    onClick={() => removeTask(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="sp-add-task">
                <input
                  className="sp-add-input"
                  placeholder="Add study task..."
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

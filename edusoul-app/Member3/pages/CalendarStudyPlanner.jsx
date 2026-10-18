import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../src/contexts/AuthContext";
import { db } from "../../src/firebase";
import {
  MOOD_CONFIG,
  subscribeToHealthReports,
} from "../services/healthService";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOODS = Object.keys(MOOD_CONFIG);

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const shiftMonth = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthCells = (month) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(
    first.getFullYear(),
    first.getMonth(),
    1 - mondayOffset,
  );
  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
};

const summarizeReports = (reports = []) => {
  const moodCounts = {};
  reports.forEach((report) => {
    const mood = report.mood || report.predictedMood || "Neutral";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });
  const dominantMood =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const average = (key) => {
    const values = reports
      .map((report) => Number(report[key]))
      .filter(Number.isFinite);
    return values.length
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length,
        )
      : null;
  };

  return {
    count: reports.length,
    dominantMood,
    averageStress: average("stressScore"),
    averageSleep: average("sleep"),
    averageHeartRate: average("heartRate"),
  };
};

const getRecurringEvents = (weeklySchedule, date) => {
  const weekday = WEEKDAYS[(date.getDay() + 6) % 7];
  return Object.entries(weeklySchedule || {}).flatMap(([key, slot]) => {
    const prefix = `${weekday}-`;
    if (!key.startsWith(prefix) || !slot?.subject) return [];
    const time = key.slice(prefix.length);
    return [
      {
        id: `weekly-${key}`,
        date: dateKey(date),
        title: slot.subject,
        subject: slot.subject,
        startTime: time,
        endTime: "",
        mood: slot.mood || "",
        color: slot.color || "#0F766E",
        recurring: true,
      },
    ];
  });
};

const CalendarGrid = ({
  month,
  selectedDate,
  eventCounts,
  dailyMoods,
  onSelect,
  compact = false,
}) => {
  const cells = getMonthCells(month);
  return (
    <div className={`sc-grid ${compact ? "sc-grid-compact" : ""}`}>
      {WEEKDAYS.map((day) => (
        <span className="sc-weekday" key={day}>
          {day}
        </span>
      ))}
      {cells.map((date) => {
        const key = dateKey(date);
        const mood = dailyMoods[key];
        const moodConfig = mood
          ? MOOD_CONFIG[mood] || MOOD_CONFIG.Neutral
          : null;
        const outsideMonth = date.getMonth() !== month.getMonth();
        const isToday = key === dateKey(new Date());
        return (
          <button
            key={key}
            type="button"
            className={`sc-day ${outsideMonth ? "sc-day-outside" : ""} ${key === selectedDate ? "sc-day-selected" : ""} ${isToday ? "sc-day-today" : ""}`}
            onClick={() => onSelect(key)}
            aria-pressed={key === selectedDate}
            aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}${eventCounts[key] ? `, ${eventCounts[key]} schedules` : ""}${mood ? `, mood ${mood}` : ""}`}
          >
            <span className="sc-day-number">{date.getDate()}</span>
            <span className="sc-day-meta">
              {eventCounts[key] > 0 && (
                <span className="sc-event-count">
                  {eventCounts[key]} plan{eventCounts[key] === 1 ? "" : "s"}
                </span>
              )}
              {moodConfig && (
                <span
                  title={`Overall mood: ${mood}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 2,
                    maxWidth: "100%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    borderRadius: 9,
                    padding: compact ? "1px 3px" : "1px 4px",
                    background: moodConfig.bg,
                    color: moodConfig.color,
                    fontSize: compact ? 9 : 10,
                    fontWeight: 800,
                  }}
                >
                  {moodConfig.emoji}
                  {!compact && <span>{mood}</span>}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default function CalendarStudyPlanner({ onBack }) {
  const { user } = useAuth();
  const today = dateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [events, setEvents] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadedForUser, setLoadedForUser] = useState(null);
  const [planError, setPlanError] = useState("");
  const [healthError, setHealthError] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    date: today,
    startTime: "09:00",
    endTime: "10:00",
    mood: "Neutral",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!user?.uid || !db) return undefined;
    let active = true;
    const ref = doc(db, "students", user.uid, "study_plan", "current");
    getDoc(ref)
      .then((snapshot) => {
        if (!active) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          setEvents(
            Array.isArray(data.calendarEvents) ? data.calendarEvents : [],
          );
          setWeeklySchedule(data.schedule || {});
          setTasks(Array.isArray(data.tasks) ? data.tasks : []);
          setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        }
        setPlanError("");
        setLoadedForUser(user.uid);
      })
      .catch((error) => {
        if (active)
          setPlanError(error.message || "Could not load your saved plan.");
      });
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !db) return undefined;
    return subscribeToHealthReports(
      user.uid,
      (userReports) => {
        setReports(userReports || []);
        setHealthError("");
      },
      (error) => {
        setHealthError(
          error.message || "Wellness reports could not be loaded.",
        );
      },
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !db || loadedForUser !== user.uid) return undefined;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await setDoc(
          doc(db, "students", user.uid, "study_plan", "current"),
          {
            calendarEvents: events,
            schedule: weeklySchedule,
            tasks,
            subjects,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        setPlanError("");
      } catch (error) {
        setPlanError(error.message || "Could not save your schedule.");
      } finally {
        setSaving(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [events, weeklySchedule, tasks, subjects, user?.uid, loadedForUser]);

  const reportsByDate = useMemo(() => {
    const grouped = {};
    reports.forEach((report) => {
      const date =
        report.timestamp instanceof Date
          ? report.timestamp
          : new Date(report.timestamp);
      if (Number.isNaN(date.getTime())) return;
      const key = dateKey(date);
      (grouped[key] ||= []).push(report);
    });
    return grouped;
  }, [reports]);

  const dailySummaries = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(reportsByDate).map(([key, dayReports]) => [
          key,
          summarizeReports(dayReports),
        ]),
      ),
    [reportsByDate],
  );

  const eventsForDate = (key) =>
    [
      ...events.filter((event) => event.date === key),
      ...getRecurringEvents(weeklySchedule, parseDateKey(key)),
    ].sort((first, second) =>
      (first.startTime || "").localeCompare(second.startTime || ""),
    );

  const eventCounts = useMemo(() => {
    const counts = {};
    getMonthCells(month).forEach((date) => {
      const key = dateKey(date);
      const weekday = WEEKDAYS[(date.getDay() + 6) % 7];
      const recurringCount = Object.keys(weeklySchedule).filter((slotKey) =>
        slotKey.startsWith(`${weekday}-`),
      ).length;
      counts[key] =
        events.filter((event) => event.date === key).length + recurringCount;
    });
    return counts;
  }, [events, weeklySchedule, month]);

  const dailyEvents = eventsForDate(selectedDate);
  const dayReports = reportsByDate[selectedDate] || [];
  const moodProgression = dayReports
    .slice()
    .sort((first, second) => first.timestamp - second.timestamp)
    .map((report) => report.mood || report.predictedMood || "Neutral")
    .filter((mood, index, moods) => index === 0 || mood !== moods[index - 1]);
  const daySummary = summarizeReports(dayReports);
  const actualMoodConfig = daySummary.dominantMood
    ? MOOD_CONFIG[daySummary.dominantMood] || MOOD_CONFIG.Neutral
    : null;

  const selectDate = (key) => {
    setSelectedDate(key);
    const date = parseDateKey(key);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const openNewSchedule = (key = selectedDate) => {
    setForm({
      title: "",
      subject: "",
      date: key,
      startTime: "09:00",
      endTime: "10:00",
      mood: dailySummaries[key]?.dominantMood || "Neutral",
      notes: "",
    });
    setShowScheduleModal(true);
  };

  const saveSchedule = (event) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      form.endTime <= form.startTime
    )
      return;
    setEvents((current) => [
      ...current,
      {
        ...form,
        id: globalThis.crypto?.randomUUID?.() || `schedule-${Date.now()}`,
        title: form.title.trim(),
        subject: form.subject.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    selectDate(form.date);
    setShowScheduleModal(false);
  };

  const deleteSchedule = (id) =>
    setEvents((current) => current.filter((event) => event.id !== id));
  const addTask = (event) => {
    event.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    setTasks((current) => [
      ...current,
      {
        id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
        text,
        done: false,
        date: selectedDate,
      },
    ]);
    setNewTask("");
  };

  const updateTask = (id, patch) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    );
  const removeTask = (id) =>
    setTasks((current) => current.filter((task) => task.id !== id));
  const dateTasks = tasks.filter((task) => task.date === selectedDate);
  const unscheduledTasks = tasks.filter((task) => !task.date);

  return (
    <>
      <style>{`
        .sc-root{--sc-ink:#132b35;--sc-muted:#667b83;--sc-teal:#0f766e;--sc-line:#dce7e8;min-height:100vh;background:#f4f8f8;color:var(--sc-ink);font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding-bottom:48px}
        .sc-header{padding:26px clamp(18px,4vw,52px);background:#12313a;color:#fff;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap}
        .sc-back,.sc-header-action,.sc-month-button,.sc-add-event{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.24);border-radius:8px;min-height:38px;padding:8px 12px;background:rgba(255,255,255,.08);color:#fff;font-size:13px;font-weight:700;cursor:pointer}
        .sc-back{margin-bottom:16px}.sc-back:hover,.sc-header-action:hover{background:rgba(255,255,255,.15)}.sc-header h1{margin:0;font-size:clamp(24px,3vw,32px);font-weight:800}.sc-header p{margin:6px 0 0;color:#bbd0d3;font-size:13px}.sc-header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.sc-saving{font-size:12px;color:#b7d9d4;margin-right:6px}
        .sc-layout{max-width:1440px;margin:0 auto;padding:24px clamp(14px,3vw,40px);display:grid;grid-template-columns:minmax(0,1.5fr) minmax(310px,.85fr);gap:18px;align-items:start}.sc-panel{background:#fff;border:1px solid var(--sc-line);border-radius:10px;overflow:hidden}.sc-panel-head{padding:17px 18px;border-bottom:1px solid #e9eff0;display:flex;align-items:center;justify-content:space-between;gap:12px}.sc-panel-head h2{font-size:15px;margin:0;font-weight:800}.sc-panel-head p{font-size:12px;color:var(--sc-muted);margin:4px 0 0}.sc-month-controls{display:flex;align-items:center;gap:8px}.sc-month-title{min-width:148px;text-align:center;font-size:15px;font-weight:800}.sc-month-button{background:#fff;color:#435a62;border:1px solid var(--sc-line);width:34px;height:34px;min-height:34px;padding:0}.sc-month-button:hover{background:#f1f7f7}.sc-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));padding:10px;gap:4px}.sc-weekday{text-align:center;font-size:10px;font-weight:800;color:#789097;padding:7px 2px;text-transform:uppercase}.sc-day{min-height:84px;border:1px solid transparent;border-radius:7px;background:#fff;color:var(--sc-ink);padding:7px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;cursor:pointer}.sc-day:hover{background:#f3f8f7;border-color:#d5e5e2}.sc-day-selected{background:#e8f5f2;border-color:#7bbcb0}.sc-day-today .sc-day-number{outline:1px solid #0f766e;outline-offset:3px;border-radius:4px}.sc-day-outside{opacity:.36}.sc-day-number{font-size:12px;font-weight:750}.sc-day-meta{min-height:16px;width:100%;display:flex;justify-content:space-between;align-items:center;gap:3px}.sc-event-count{font-size:9px;font-weight:700;color:#0f766e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sc-mood-dot{height:8px;width:8px;flex:0 0 8px;border-radius:50%}.sc-calendar-legend{display:flex;gap:16px;align-items:center;padding:0 18px 14px;color:var(--sc-muted);font-size:11px}.sc-legend-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:5px}
        .sc-day-summary{padding:17px 18px}.sc-date-title{font-size:18px;font-weight:800;margin:0}.sc-date-sub{color:var(--sc-muted);font-size:12px;margin:4px 0 15px}.sc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px}.sc-stat{background:#f5f9f8;border:1px solid #e6eeee;border-radius:8px;padding:10px}.sc-stat-label{font-size:10px;color:#71868b;font-weight:750;text-transform:uppercase}.sc-stat-value{margin-top:5px;font-size:17px;font-weight:800}.sc-mood{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:750}.sc-section-title{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b8086;font-weight:800;margin:18px 0 9px}.sc-event{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:10px;align-items:start;padding:12px 0;border-top:1px solid #edf1f1}.sc-event-time{font-variant-numeric:tabular-nums;font-size:12px;font-weight:800;color:#0f766e}.sc-event-title{font-size:13px;font-weight:750;margin:0}.sc-event-meta{font-size:11px;color:var(--sc-muted);margin:4px 0 0}.sc-event-mood{display:inline-flex;align-items:center;gap:4px;margin-top:6px;font-size:10px;font-weight:750}.sc-event-delete{border:0;background:none;color:#87999e;padding:5px;cursor:pointer;border-radius:5px}.sc-event-delete:hover{background:#fff1f0;color:#be123c}.sc-recurring{font-size:9px;color:#64748b;font-weight:700}.sc-empty{padding:16px;border:1px dashed #cad9d9;border-radius:8px;color:#73868b;font-size:12px;text-align:center}.sc-task-row{display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid #edf1f1}.sc-task-row input[type=checkbox]{accent-color:#0f766e;margin-top:2px}.sc-task-text{font-size:12px;flex:1}.sc-task-done{text-decoration:line-through;color:#87999e}.sc-task-form{display:flex;gap:6px;margin-top:8px}.sc-task-form input{flex:1;min-width:0;border:1px solid var(--sc-line);border-radius:6px;padding:8px;font-size:12px}.sc-task-form button{width:34px;border:0;border-radius:6px;background:#0f766e;color:#fff;cursor:pointer}
        .sc-error{margin:12px 18px;color:#9f302b;font-size:12px}.sc-health-error{color:#9f302b;font-size:11px;margin:10px 0}.sc-modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(10,30,35,.58);display:flex;align-items:center;justify-content:center;padding:16px}.sc-modal{width:min(880px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:12px;box-shadow:0 24px 80px rgba(4,25,30,.28)}.sc-modal-head{position:sticky;top:0;z-index:2;background:#fff;border-bottom:1px solid var(--sc-line);display:flex;align-items:flex-start;justify-content:space-between;padding:17px 20px}.sc-modal-head h2{font-size:18px;margin:0;font-weight:800}.sc-modal-head p{font-size:12px;color:var(--sc-muted);margin:5px 0 0}.sc-close{border:0;background:#f0f5f4;color:#4c6469;border-radius:7px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.sc-modal-content{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:0}.sc-modal-calendar{padding:16px;border-right:1px solid var(--sc-line)}.sc-grid-compact{padding:6px;gap:2px}.sc-grid-compact .sc-day{min-height:52px;padding:5px}.sc-grid-compact .sc-event-count{display:none}.sc-form{padding:18px;display:grid;gap:11px;align-content:start}.sc-form label{display:grid;gap:5px;font-size:11px;font-weight:800;color:#496169}.sc-form input,.sc-form select,.sc-form textarea{width:100%;min-width:0;border:1px solid #cfdddd;border-radius:7px;padding:9px 10px;background:white;color:#18363c;font:inherit;font-size:13px;outline:none}.sc-form input:focus,.sc-form select:focus,.sc-form textarea:focus{border-color:#0f766e;box-shadow:0 0 0 3px rgba(15,118,110,.11)}.sc-time-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.sc-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:3px}.sc-cancel{border:1px solid #cfdddd;background:white;color:#526a70;border-radius:7px;padding:9px 13px;font-weight:700;cursor:pointer}.sc-submit{display:inline-flex;align-items:center;gap:7px;border:0;background:#0f766e;color:white;border-radius:7px;padding:9px 14px;font-weight:750;cursor:pointer}.sc-submit:disabled{opacity:.5;cursor:not-allowed}
        @media(max-width:920px){.sc-layout{grid-template-columns:1fr}.sc-modal-content{grid-template-columns:1fr}.sc-modal-calendar{border-right:0;border-bottom:1px solid var(--sc-line)}.sc-grid-compact .sc-day{min-height:42px}}
        @media(max-width:560px){.sc-header{align-items:flex-start}.sc-header-actions{width:100%}.sc-grid{padding:6px;gap:2px}.sc-day{min-height:58px;padding:5px}.sc-event-count{font-size:8px}.sc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-modal-overlay{padding:8px}.sc-time-grid{grid-template-columns:1fr 1fr}}
      `}</style>

      <main className="sc-root">
        <header className="sc-header">
          <div>
            <button className="sc-back" type="button" onClick={onBack}>
              <ArrowLeft size={15} /> Analytics
            </button>
            <h1>Study calendar</h1>
            <p>
              Plan timed study sessions and review your day alongside wellness
              and mood reports.
            </p>
          </div>
          <div className="sc-header-actions">
            <span className="sc-saving">
              {saving
                ? "Saving…"
                : loadedForUser === user?.uid
                  ? "Saved to your account"
                  : "Loading your plan"}
            </span>
            <button
              type="button"
              className="sc-header-action"
              onClick={() => openNewSchedule()}
            >
              <Plus size={15} /> Add schedule
            </button>
          </div>
        </header>

        <div className="sc-layout">
          <section className="sc-panel" aria-label="Monthly study calendar">
            <div className="sc-panel-head">
              <div>
                <h2>Schedule calendar</h2>
                <p>
                  Choose a date to see planned sessions and that day’s wellness
                  report.
                </p>
              </div>
              <div className="sc-month-controls">
                <button
                  type="button"
                  className="sc-month-button"
                  aria-label="Previous month"
                  onClick={() => setMonth((current) => shiftMonth(current, -1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="sc-month-title">
                  {month.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  className="sc-month-button"
                  aria-label="Next month"
                  onClick={() => setMonth((current) => shiftMonth(current, 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <CalendarGrid
              month={month}
              selectedDate={selectedDate}
              eventCounts={eventCounts}
              dailyMoods={Object.fromEntries(
                Object.entries(dailySummaries).map(([key, summary]) => [
                  key,
                  summary.dominantMood,
                ]),
              )}
              onSelect={selectDate}
            />
            <div className="sc-calendar-legend">
              <span>
                <i
                  className="sc-legend-dot"
                  style={{ background: "#0f766e" }}
                />
                Planned sessions
              </span>
              <span>
                <i
                  className="sc-legend-dot"
                  style={{ background: "#d97706" }}
                />
                Mood report available
              </span>
            </div>
          </section>

          <aside className="sc-panel" aria-live="polite">
            <div className="sc-day-summary">
              <h2 className="sc-date-title">
                {parseDateKey(selectedDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="sc-date-sub">Daily plan and wellness summary</p>

              <div className="sc-stats">
                <div className="sc-stat">
                  <div className="sc-stat-label">Sessions</div>
                  <div className="sc-stat-value">{dailyEvents.length}</div>
                </div>
                <div className="sc-stat">
                  <div className="sc-stat-label">Health reports</div>
                  <div className="sc-stat-value">{daySummary.count}</div>
                </div>
                <div className="sc-stat">
                  <div className="sc-stat-label">Avg. stress</div>
                  <div className="sc-stat-value">
                    {daySummary.averageStress === null
                      ? "—"
                      : `${daySummary.averageStress}/100`}
                  </div>
                </div>
                <div className="sc-stat">
                  <div className="sc-stat-label">Avg. sleep</div>
                  <div className="sc-stat-value">
                    {daySummary.averageSleep === null
                      ? "—"
                      : `${daySummary.averageSleep}h`}
                  </div>
                </div>
                {actualMoodConfig && (
                  <div className="sc-stat">
                    <div className="sc-stat-label">Observed mood</div>
                    <div className="sc-stat-value sc-mood">
                      <span>{actualMoodConfig.emoji}</span>
                      {daySummary.dominantMood}
                    </div>
                  </div>
                )}
                {daySummary.averageHeartRate !== null && (
                  <div className="sc-stat">
                    <div className="sc-stat-label">Avg. heart rate</div>
                    <div className="sc-stat-value">
                      {daySummary.averageHeartRate} bpm
                    </div>
                  </div>
                )}
              </div>

              {healthError && <p className="sc-health-error">{healthError}</p>}
              <div className="sc-section-title">Mood through the day</div>
              {moodProgression.length ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 7,
                    }}
                  >
                    {moodProgression.map((mood, index) => {
                      const config = MOOD_CONFIG[mood] || MOOD_CONFIG.Neutral;
                      return (
                        <span
                          key={`${mood}-${index}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: config.bg,
                              color: config.color,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {config.emoji} {mood}
                          </span>
                          {index < moodProgression.length - 1 && (
                            <ChevronRight
                              size={14}
                              color="#91a4a8"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <p className="sc-event-meta" style={{ marginTop: 7 }}>
                    {moodProgression.length > 1
                      ? `Mood shifted from ${moodProgression[0]} to ${moodProgression[moodProgression.length - 1]} across ${dayReports.length} reports.`
                      : `${moodProgression[0]} was recorded in ${dayReports.length} report${dayReports.length === 1 ? "" : "s"} for this day.`}
                  </p>
                </div>
              ) : (
                <p className="sc-event-meta">
                  No mood reports recorded for this day.
                </p>
              )}
              <div className="sc-section-title">Wellness report details</div>
              {dayReports.length ? (
                dayReports.map((report) => {
                  const mood = report.mood || report.predictedMood || "Neutral";
                  const moodConfig = MOOD_CONFIG[mood] || MOOD_CONFIG.Neutral;
                  return (
                    <div
                      key={report.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "58px 1fr 1fr",
                        gap: "6px 8px",
                        alignItems: "center",
                        padding: "9px 0",
                        borderTop: "1px solid #edf1f1",
                        fontSize: 10,
                        color: "#60777d",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#243f46",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {report.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span
                        style={{ color: moodConfig.color, fontWeight: 750 }}
                      >
                        {moodConfig.emoji} {mood}
                      </span>
                      <span>Stress {Math.round(report.stressScore ?? 0)}</span>
                      <span style={{ gridColumn: "2 / 4" }}>
                        HR {Math.round(report.heartRate ?? 0)} bpm · Sleep{" "}
                        {Number(report.sleep ?? 0).toFixed(1)}h · SpO2{" "}
                        {Math.round(report.spo2 ?? 0)}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="sc-event-meta">
                  No wellness readings recorded for this day.
                </p>
              )}
              <div className="sc-section-title">Schedule</div>
              {dailyEvents.length ? (
                dailyEvents.map((event) => {
                  const moodConfig = event.mood
                    ? MOOD_CONFIG[event.mood] || MOOD_CONFIG.Neutral
                    : null;
                  return (
                    <article className="sc-event" key={event.id}>
                      <div className="sc-event-time">
                        {event.startTime || "Any time"}
                        {event.endTime ? `–${event.endTime}` : ""}
                      </div>
                      <div>
                        <h3 className="sc-event-title">
                          {event.title || event.subject}
                        </h3>
                        <p className="sc-event-meta">
                          {event.subject}
                          {event.recurring ? " · Weekly" : ""}
                        </p>
                        {moodConfig && (
                          <span
                            className="sc-event-mood"
                            style={{ color: moodConfig.color }}
                          >
                            {moodConfig.emoji} Planned mood: {event.mood}
                          </span>
                        )}
                        {event.notes && (
                          <p className="sc-event-meta">{event.notes}</p>
                        )}
                      </div>
                      {!event.recurring && (
                        <button
                          className="sc-event-delete"
                          type="button"
                          aria-label={`Delete ${event.title || event.subject}`}
                          onClick={() => deleteSchedule(event.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {event.recurring && (
                        <span className="sc-recurring">REPEATS</span>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="sc-empty">
                  No sessions planned for this day. Add a timed session to get
                  started.
                </div>
              )}

              <div className="sc-section-title">Daily tasks</div>
              {dateTasks.map((task) => (
                <div className="sc-task-row" key={task.id}>
                  <input
                    type="checkbox"
                    checked={Boolean(task.done)}
                    onChange={(event) =>
                      updateTask(task.id, { done: event.target.checked })
                    }
                    aria-label={`Mark ${task.text} complete`}
                  />
                  <span
                    className={`sc-task-text ${task.done ? "sc-task-done" : ""}`}
                  >
                    {task.text}
                  </span>
                  <button
                    className="sc-event-delete"
                    type="button"
                    aria-label={`Delete task ${task.text}`}
                    onClick={() => removeTask(task.id)}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <form className="sc-task-form" onSubmit={addTask}>
                <input
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  placeholder="Add a task for this day"
                  aria-label="New task"
                />
                <button type="submit" aria-label="Add task">
                  <Plus size={16} />
                </button>
              </form>
              {unscheduledTasks.length > 0 && (
                <>
                  <div className="sc-section-title">Unscheduled tasks</div>
                  {unscheduledTasks.map((task) => (
                    <div className="sc-task-row" key={task.id}>
                      <input
                        type="checkbox"
                        checked={Boolean(task.done)}
                        onChange={(event) =>
                          updateTask(task.id, { done: event.target.checked })
                        }
                        aria-label={`Mark ${task.text} complete`}
                      />
                      <span
                        className={`sc-task-text ${task.done ? "sc-task-done" : ""}`}
                      >
                        {task.text}
                      </span>
                      <button
                        className="sc-event-delete"
                        type="button"
                        aria-label={`Delete task ${task.text}`}
                        onClick={() => removeTask(task.id)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
            {planError && (
              <p className="sc-error" role="alert">
                {planError}
              </p>
            )}
          </aside>
        </div>
      </main>

      {showScheduleModal && (
        <div
          className="sc-modal-overlay"
          onClick={() => setShowScheduleModal(false)}
        >
          <section
            className="sc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sc-modal-head">
              <div>
                <h2 id="sc-modal-title">Plan a study session</h2>
                <p>
                  Select a day on the calendar, then add the subject, time, and
                  expected mood.
                </p>
              </div>
              <button
                type="button"
                className="sc-close"
                aria-label="Close schedule form"
                onClick={() => setShowScheduleModal(false)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="sc-modal-content">
              <div className="sc-modal-calendar">
                <div
                  className="sc-panel-head"
                  style={{ padding: "0 0 12px", border: 0 }}
                >
                  <div className="sc-month-controls">
                    <button
                      type="button"
                      className="sc-month-button"
                      aria-label="Previous month"
                      onClick={() =>
                        setMonth((current) => shiftMonth(current, -1))
                      }
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="sc-month-title">
                      {month.toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      className="sc-month-button"
                      aria-label="Next month"
                      onClick={() =>
                        setMonth((current) => shiftMonth(current, 1))
                      }
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <CalendarGrid
                  compact
                  month={month}
                  selectedDate={form.date}
                  eventCounts={eventCounts}
                  dailyMoods={Object.fromEntries(
                    Object.entries(dailySummaries).map(([key, summary]) => [
                      key,
                      summary.dominantMood,
                    ]),
                  )}
                  onSelect={(key) =>
                    setForm((current) => ({
                      ...current,
                      date: key,
                      mood: dailySummaries[key]?.dominantMood || current.mood,
                    }))
                  }
                />
                <p className="sc-date-sub">
                  Selected:{" "}
                  {parseDateKey(form.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <form className="sc-form" onSubmit={saveSchedule}>
                <label>
                  Session title
                  <input
                    autoFocus
                    required
                    maxLength={80}
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Physics problem set"
                  />
                </label>
                <label>
                  Subject
                  <input
                    required
                    maxLength={60}
                    list="sc-subject-options"
                    value={form.subject}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Enter a subject"
                  />
                  <datalist id="sc-subject-options">
                    {subjects.map((subject) => (
                      <option key={subject.name} value={subject.name} />
                    ))}
                  </datalist>
                </label>
                <div className="sc-time-grid">
                  <label>
                    Start time
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          startTime: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    End time
                    <input
                      type="time"
                      required
                      min={form.startTime}
                      value={form.endTime}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          endTime: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <label>
                  Expected mood
                  <select
                    value={form.mood}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        mood: event.target.value,
                      }))
                    }
                  >
                    {MOODS.map((mood) => (
                      <option key={mood} value={mood}>
                        {MOOD_CONFIG[mood].emoji} {mood}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    rows="3"
                    maxLength={300}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional focus, materials, or break notes"
                  />
                </label>
                <div className="sc-form-actions">
                  <button
                    type="button"
                    className="sc-cancel"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sc-submit"
                    disabled={
                      !form.title.trim() ||
                      !form.subject.trim() ||
                      form.endTime <= form.startTime
                    }
                  >
                    <Check size={15} /> Save session
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

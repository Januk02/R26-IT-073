import { useState } from 'react';

const courses = [
  { id: 1, title: 'Introduction to Programming', instructor: 'Dr. Kamal Perera', category: 'Technology', level: 'Beginner', duration: '8 weeks', lessons: 24, students: 312, rating: 4.8, color: '#1d4ed8', icon: '💻', tags: ['Python', 'Basics', 'Logic'] },
  { id: 2, title: 'Web Development Fundamentals', instructor: 'Ms. Dilani Silva', category: 'Technology', level: 'Beginner', duration: '10 weeks', lessons: 32, students: 256, rating: 4.7, color: '#0891b2', icon: '🌐', tags: ['HTML', 'CSS', 'JavaScript'] },
  { id: 3, title: 'Data Science with Python', instructor: 'Prof. Nimal Fernando', category: 'Data Science', level: 'Intermediate', duration: '12 weeks', lessons: 40, students: 189, rating: 4.9, color: '#7c3aed', icon: '📊', tags: ['Python', 'ML', 'Statistics'] },
  { id: 4, title: 'Mobile App Development', instructor: 'Mr. Rohan Jayasuriya', category: 'Technology', level: 'Intermediate', duration: '10 weeks', lessons: 36, students: 145, rating: 4.6, color: '#0d9488', icon: '📱', tags: ['React Native', 'Flutter', 'UI'] },
  { id: 5, title: 'Business Management Essentials', instructor: 'Dr. Priya Wickramasinghe', category: 'Business', level: 'Beginner', duration: '6 weeks', lessons: 20, students: 421, rating: 4.5, color: '#d97706', icon: '💼', tags: ['Management', 'Strategy', 'Finance'] },
  { id: 6, title: 'Digital Marketing Mastery', instructor: 'Ms. Harsha Dias', category: 'Marketing', level: 'Beginner', duration: '8 weeks', lessons: 28, students: 367, rating: 4.7, color: '#be185d', icon: '📣', tags: ['SEO', 'Social Media', 'Analytics'] },
  { id: 7, title: 'Machine Learning Fundamentals', instructor: 'Dr. Saman Kumara', category: 'Data Science', level: 'Advanced', duration: '14 weeks', lessons: 48, students: 98, rating: 4.9, color: '#059669', icon: '🤖', tags: ['TensorFlow', 'Neural Networks', 'AI'] },
  { id: 8, title: 'UI/UX Design Principles', instructor: 'Ms. Chamari Rathnayake', category: 'Design', level: 'Beginner', duration: '8 weeks', lessons: 26, students: 278, rating: 4.8, color: '#dc2626', icon: '🎨', tags: ['Figma', 'Design Thinking', 'Prototyping'] },
];

const categories = ['All', 'Technology', 'Data Science', 'Business', 'Marketing', 'Design'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesHome({ onSelectCourse, onViewMyLearning }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat   = category === 'All' || c.category === category;
    const matchLevel = level === 'All Levels' || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <>
      <style>{`
        .ch-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .ch-header {
          background: linear-gradient(135deg, #1d4ed8, #0a5cff);
          padding: 48px 48px 60px;
          position: relative; overflow: hidden;
        }

        .ch-header::before {
          content: ''; position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -120px; right: -80px;
        }

        .ch-header h1 { font-size: 34px; font-weight: 900; color: white; margin-bottom: 8px; position: relative; z-index: 2; }
        .ch-header p  { font-size: 15px; color: rgba(255,255,255,0.75); position: relative; z-index: 2; }

        .ch-header-actions {
          display: flex; gap: 12px; margin-top: 24px; position: relative; z-index: 2;
        }

        .ch-btn-my-learning {
          padding: 10px 22px;
          background: rgba(255,255,255,0.15);
          color: white; font-size: 14px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 10px; cursor: pointer; font-family: inherit;
          transition: all 0.2s; backdrop-filter: blur(4px);
        }

        .ch-btn-my-learning:hover { background: rgba(255,255,255,0.25); }

        .ch-search-bar {
          background: white; border-radius: 16px;
          padding: 20px 32px;
          margin: -28px 48px 0;
          box-shadow: 0 8px 32px rgba(29,78,216,0.12);
          display: flex; gap: 12px; align-items: center;
          flex-wrap: wrap;
          position: relative; z-index: 10;
        }

        .ch-search-input {
          flex: 1; min-width: 200px;
          padding: 10px 16px 10px 40px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: inherit; outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: 12px center;
          transition: border-color 0.2s;
        }

        .ch-search-input:focus { border-color: #1d4ed8; }

        .ch-select {
          padding: 10px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-size: 13px; font-family: inherit;
          color: #374151; background: white; outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }

        .ch-select:focus { border-color: #1d4ed8; }

        .ch-body { padding: 40px 48px; }

        .ch-results-label {
          font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 24px;
        }

        .ch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 20px;
        }

        .ch-card {
          background: white; border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .ch-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.1);
          border-color: transparent;
        }

        .ch-card-banner {
          height: 8px;
          background: var(--color);
        }

        .ch-card-body { padding: 22px; }

        .ch-card-top {
          display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
        }

        .ch-card-icon {
          width: 48px; height: 48px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
          background: var(--bg);
        }

        .ch-card-meta { flex: 1; }

        .ch-card-cat {
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          color: var(--color); margin-bottom: 4px;
        }

        .ch-card-level {
          display: inline-block;
          padding: 2px 8px; border-radius: 20px;
          font-size: 10px; font-weight: 600;
          background: #f1f5f9; color: #64748b;
        }

        .ch-card h3 {
          font-size: 16px; font-weight: 700; color: #0f172a;
          margin-bottom: 6px; line-height: 1.3;
        }

        .ch-card-instructor {
          font-size: 12px; color: #64748b; margin-bottom: 12px;
        }

        .ch-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }

        .ch-tag {
          padding: 3px 10px; background: #f1f5f9; border-radius: 20px;
          font-size: 11px; color: #475569; font-weight: 500;
        }

        .ch-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px; border-top: 1px solid #f1f5f9;
        }

        .ch-card-stats { display: flex; gap: 14px; }

        .ch-card-stat { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }

        .ch-card-rating { font-size: 13px; font-weight: 700; color: #f59e0b; }

        .ch-enroll-btn {
          padding: 7px 16px;
          background: var(--color);
          color: white; font-size: 12px; font-weight: 700;
          border: none; border-radius: 8px;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.2s;
        }

        .ch-enroll-btn:hover { opacity: 0.85; }

        .ch-empty {
          text-align: center; padding: 80px 20px;
          color: #94a3b8; font-size: 15px;
        }

        @media (max-width: 768px) {
          .ch-header { padding: 36px 24px 52px; }
          .ch-search-bar { margin: -24px 24px 0; padding: 16px 20px; }
          .ch-body { padding: 32px 24px; }
        }
      `}</style>

      <div className="ch-root">
        <div className="ch-header">
          <h1>📚 Course Library</h1>
          <p>Explore {courses.length} courses designed for Sri Lankan A/L students and beyond</p>
          <div className="ch-header-actions">
            <button className="ch-btn-my-learning" onClick={onViewMyLearning}>
              My Learning →
            </button>
          </div>
        </div>

        <div className="ch-search-bar">
          <input
            className="ch-search-input"
            placeholder="Search courses or instructors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="ch-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="ch-select" value={level} onChange={e => setLevel(e.target.value)}>
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="ch-body">
          <div className="ch-results-label">
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </div>

          {filtered.length === 0 ? (
            <div className="ch-empty">😕 No courses match your search. Try different keywords.</div>
          ) : (
            <div className="ch-grid">
              {filtered.map(course => (
                <div
                  key={course.id}
                  className="ch-card"
                  style={{ '--color': course.color, '--bg': course.color + '18' }}
                  onClick={() => onSelectCourse(course)}
                >
                  <div className="ch-card-banner" />
                  <div className="ch-card-body">
                    <div className="ch-card-top">
                      <div className="ch-card-icon">{course.icon}</div>
                      <div className="ch-card-meta">
                        <div className="ch-card-cat">{course.category}</div>
                        <span className="ch-card-level">{course.level}</span>
                      </div>
                    </div>
                    <h3>{course.title}</h3>
                    <div className="ch-card-instructor">👤 {course.instructor}</div>
                    <div className="ch-card-tags">
                      {course.tags.map(t => <span key={t} className="ch-tag">{t}</span>)}
                    </div>
                    <div className="ch-card-footer">
                      <div className="ch-card-stats">
                        <span className="ch-card-stat">⏱ {course.duration}</span>
                        <span className="ch-card-stat">📖 {course.lessons}</span>
                        <span className="ch-card-rating">⭐ {course.rating}</span>
                      </div>
                      <button className="ch-enroll-btn" onClick={e => { e.stopPropagation(); onSelectCourse(course); }}>
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

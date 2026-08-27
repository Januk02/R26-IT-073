import { useState } from 'react';

const mentors = [
  { id: 1, name: 'Dr. Sarah Williams',    field: 'Software Engineering',  exp: '12 yrs', rating: 4.9, sessions: 148, avatar: 'SW', color: '#1d4ed8', tags: ['Web Dev', 'React', 'Node.js'],  bio: 'Senior software engineer and architect with 12 years of industry experience. Passionate about guiding students into tech careers.', available: true  },
  { id: 2, name: 'Prof. Kamal Perera',    field: 'Data Science & ML',     exp: '15 yrs', rating: 4.8, sessions: 203, avatar: 'KP', color: '#7c3aed', tags: ['Python', 'ML', 'Statistics'],  bio: 'Professor at University of Moratuwa. Research focus on machine learning applications for education.',                          available: true  },
  { id: 3, name: 'Ms. Dilani Silva',      field: 'Business & Management', exp: '8 yrs',  rating: 4.7, sessions: 96,  avatar: 'DS', color: '#0d9488', tags: ['Strategy', 'Finance', 'MBA'], bio: 'MBA graduate from University of Colombo. Worked in corporate strategy for top Sri Lankan firms.',                                available: false },
  { id: 4, name: 'Mr. Rohan Jayasuriya', field: 'Mobile Development',    exp: '7 yrs',  rating: 4.8, sessions: 112, avatar: 'RJ', color: '#d97706', tags: ['Flutter', 'iOS', 'Android'],  bio: 'Lead mobile developer who has shipped 20+ apps. Specialises in cross-platform development.',                                    available: true  },
  { id: 5, name: 'Dr. Nimal Fernando',   field: 'Biomedical Research',   exp: '18 yrs', rating: 5.0, sessions: 87,  avatar: 'NF', color: '#be185d', tags: ['Medicine', 'Research', 'Lab'], bio: 'Senior researcher and MBBS holder. Guides students aspiring to medicine and biomedical sciences.',                                available: true  },
  { id: 6, name: 'Ms. Harsha Dias',      field: 'Digital Marketing',     exp: '6 yrs',  rating: 4.6, sessions: 134, avatar: 'HD', color: '#059669', tags: ['SEO', 'Content', 'Analytics'],'bio': 'Growth marketing specialist with expertise in building brands from scratch in Sri Lanka.',                                       available: false },
];

const fields = ['All Fields', 'Software Engineering', 'Data Science & ML', 'Business & Management', 'Mobile Development', 'Biomedical Research', 'Digital Marketing'];

export default function MentorHub({ onSelectMentor }) {
  const [search, setSearch]     = useState('');
  const [field, setField]       = useState('All Fields');
  const [onlyAvail, setOnlyAvail] = useState(false);

  const filtered = mentors.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.field.toLowerCase().includes(search.toLowerCase());
    const matchField  = field === 'All Fields' || m.field === field;
    const matchAvail  = !onlyAvail || m.available;
    return matchSearch && matchField && matchAvail;
  });

  return (
    <>
      <style>{`
        .mh-root { font-family: Inter, sans-serif; min-height: 100vh; background: #f8faff; }

        .mh-header {
          background: linear-gradient(135deg, #be185d, #9d174d);
          padding: 44px 48px; color: white; position: relative; overflow: hidden;
        }

        .mh-header::before {
          content: ''; position: absolute;
          width: 420px; height: 420px; border-radius: 50%;
          background: rgba(255,255,255,0.06); top: -120px; right: -80px;
        }

        .mh-header h1 { font-size: 32px; font-weight: 900; margin-bottom: 6px; position: relative; z-index: 2; }
        .mh-header p  { font-size: 14px; color: rgba(255,255,255,0.72); position: relative; z-index: 2; }

        .mh-filters {
          background: white; border-radius: 14px; padding: 18px 24px;
          margin: -22px 48px 0; box-shadow: 0 8px 28px rgba(190,24,93,0.1);
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
          position: relative; z-index: 10;
        }

        .mh-search {
          flex: 1; min-width: 180px;
          padding: 10px 16px 10px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: inherit; outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: 12px center;
          transition: border-color 0.2s;
        }

        .mh-search:focus { border-color: #be185d; }

        .mh-select {
          padding: 10px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-size: 13px; font-family: inherit;
          color: #374151; outline: none; cursor: pointer;
        }

        .mh-avail-toggle {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
        }

        .mh-toggle {
          width: 36px; height: 20px; border-radius: 10px;
          background: #e2e8f0; position: relative; transition: background 0.2s;
          cursor: pointer; border: none;
        }

        .mh-toggle.on { background: #22c55e; }

        .mh-toggle::after {
          content: ''; position: absolute;
          width: 16px; height: 16px; border-radius: 50%; background: white;
          top: 2px; left: 2px; transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }

        .mh-toggle.on::after { left: 18px; }

        .mh-body { padding: 40px 48px; }

        .mh-results { font-size: 13px; color: #64748b; margin-bottom: 22px; font-weight: 500; }

        .mh-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 18px;
        }

        .mh-card {
          background: white; border-radius: 16px; border: 1.5px solid #e2e8f0;
          padding: 24px; cursor: pointer;
          transition: all 0.3s ease;
        }

        .mh-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.09);
          border-color: var(--color);
        }

        .mh-card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }

        .mh-avatar {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: white;
          background: var(--color); flex-shrink: 0;
          box-shadow: 0 4px 12px var(--color-shadow);
        }

        .mh-card-info { flex: 1; }

        .mh-card-name { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }

        .mh-card-field { font-size: 12px; font-weight: 600; color: var(--color); }

        .mh-avail-dot {
          width: 8px; height: 8px; border-radius: 50%;
          margin-top: 4px; flex-shrink: 0;
        }

        .mh-avail-dot.on  { background: #22c55e; }
        .mh-avail-dot.off { background: #e2e8f0; }

        .mh-bio {
          font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 14px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .mh-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }

        .mh-tag {
          padding: 3px 10px; background: var(--tag-bg);
          border-radius: 20px; font-size: 11px; font-weight: 600; color: var(--color);
        }

        .mh-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px; border-top: 1px solid #f1f5f9;
        }

        .mh-card-stats { display: flex; gap: 14px; }
        .mh-card-stat  { font-size: 11px; color: #64748b; }
        .mh-card-stat strong { color: #0f172a; }

        .mh-book-btn {
          padding: 8px 18px;
          background: var(--color); color: white;
          font-size: 12px; font-weight: 700;
          border: none; border-radius: 8px; cursor: pointer;
          font-family: inherit; transition: opacity 0.2s;
        }

        .mh-book-btn:hover { opacity: 0.85; }
        .mh-book-btn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

        @media (max-width: 768px) {
          .mh-header { padding: 32px 24px 44px; }
          .mh-filters { margin: -20px 24px 0; padding: 14px 16px; }
          .mh-body { padding: 32px 24px; }
        }
      `}</style>

      <div className="mh-root">
        <div className="mh-header">
          <h1>🧑‍🏫 Find a Mentor</h1>
          <p>Connect with verified experts who can guide your academic and career journey</p>
        </div>

        <div className="mh-filters">
          <input
            className="mh-search"
            placeholder="Search by name or field..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="mh-select" value={field} onChange={e => setField(e.target.value)}>
            {fields.map(f => <option key={f}>{f}</option>)}
          </select>
          <label className="mh-avail-toggle">
            <button
              className={`mh-toggle ${onlyAvail ? 'on' : ''}`}
              onClick={() => setOnlyAvail(p => !p)}
            />
            Available only
          </label>
        </div>

        <div className="mh-body">
          <div className="mh-results">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found</div>
          <div className="mh-grid">
            {filtered.map(m => (
              <div
                key={m.id}
                className="mh-card"
                style={{ '--color': m.color, '--color-shadow': m.color + '44', '--tag-bg': m.color + '18' }}
                onClick={() => onSelectMentor(m)}
              >
                <div className="mh-card-top">
                  <div className="mh-avatar">{m.avatar}</div>
                  <div className="mh-card-info">
                    <div className="mh-card-name">{m.name}</div>
                    <div className="mh-card-field">{m.field}</div>
                  </div>
                  <div className={`mh-avail-dot ${m.available ? 'on' : 'off'}`} title={m.available ? 'Available' : 'Unavailable'} />
                </div>

                <div className="mh-bio">{m.bio}</div>

                <div className="mh-tags">
                  {m.tags.map(t => <span key={t} className="mh-tag">{t}</span>)}
                </div>

                <div className="mh-card-footer">
                  <div className="mh-card-stats">
                    <div className="mh-card-stat">⭐ <strong>{m.rating}</strong></div>
                    <div className="mh-card-stat">🎓 <strong>{m.sessions}</strong> sessions</div>
                    <div className="mh-card-stat">⏳ <strong>{m.exp}</strong></div>
                  </div>
                  <button
                    className="mh-book-btn"
                    disabled={!m.available}
                    onClick={e => { e.stopPropagation(); onSelectMentor(m); }}
                  >
                    {m.available ? 'Book' : 'Busy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Zap, Target, Briefcase, Compass, Share2, ChevronRight,
  TrendingUp, Info, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import API from '../../config/api';
import { useCareerData } from '../../context/CareerContext';
import './GraphExplorer.css';

const PALETTE = {
  target_role:  '#6366F1', // Indigo
  skill_owned:  '#10B981', // Green
  skill_missing:'#EF4444', // Red
  pivot_role:   '#F59E0B', // Amber
};

const ICONS = {
  target_role:  Target,
  skill_owned:  CheckCircle2,
  skill_missing:XCircle,
  pivot_role:   Compass,
};

function computePipelineLayout(nodes) {
  const target  = nodes.find(n => n.group === 'target_role');
  const owned   = nodes.filter(n => n.group === 'skill_owned');
  const missing = nodes.filter(n => n.group === 'skill_missing');
  const pivots  = nodes.filter(n => n.group === 'pivot_role');

  const out = [];

  owned.forEach((n, i) => {
    const spacing = 100 / (owned.length + 1);
    out.push({ ...n, px: 10, py: spacing * (i + 1) });
  });

  if (target) {
    out.push({ ...target, px: 35, py: 50 });
  }

  missing.forEach((n, i) => {
    const spacing = 100 / (missing.length + 1);
    out.push({ ...n, px: 60, py: spacing * (i + 1) });
  });

  pivots.forEach((n, i) => {
    const spacing = 100 / (pivots.length + 1);
    out.push({ ...n, px: 80, py: spacing * (i + 1) });
  });

  return out;
}

function BezierLines({ posMap, links, hoveredId }) {
  const getBezierPath = (s, t) => {
    const cx1 = s.px + (t.px - s.px) * 0.4;
    const cy1 = s.py;
    const cx2 = s.px + (t.px - s.px) * 0.6;
    const cy2 = t.py;
    return `M ${s.px} ${s.py} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.px} ${t.py}`;
  };

  return (
    <svg className="ge-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g-req-ok"  x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1" stopOpacity="0.45"/><stop offset="100%" stopColor="#10B981" stopOpacity="0.45"/></linearGradient>
        <linearGradient id="g-req-gap" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1" stopOpacity="0.3"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0.3"/></linearGradient>
        <linearGradient id="g-pivot"   x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0.45"/></linearGradient>
        <linearGradient id="g-pivot-g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.2"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0.45"/></linearGradient>
      </defs>

      {links.map((l, i) => {
        const s = posMap[l.source];
        const t = posMap[l.target];
        if (!s || !t) return null;

        const lit = hoveredId && (hoveredId === l.source || hoveredId === l.target);
        const dim = hoveredId && !lit;

        let gid = 'g-req-gap';
        if (l.type === 'REQUIRES' && t.group === 'skill_owned')  gid = 'g-req-ok';
        if (l.type === 'UNLOCKS'  && s.group === 'skill_owned')  gid = 'g-pivot';
        if (l.type === 'UNLOCKS'  && s.group === 'skill_missing') gid = 'g-pivot-g';

        const isDashed = (l.type === 'REQUIRES' && t.group === 'skill_missing') || (l.type === 'UNLOCKS' && s.group === 'skill_missing');

        return (
          <path key={i}
            d={getBezierPath(s, t)}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={lit ? 0.6 : 0.25}
            strokeDasharray={isDashed ? '1.5 1' : 'none'}
            opacity={dim ? 0.05 : 0.8}
            style={{ transition: 'all 0.25s ease' }}
          />
        );
      })}
    </svg>
  );
}

function GNode({ n, lit, onEnter, onLeave, onClick, idx }) {
  const Icon  = ICONS[n.group]  || Target;
  const color = PALETTE[n.group] || '#6366F1';
  const isTarget = n.group === 'target_role';

  return (
    <motion.div
      className={`gn ${n.group} ${isTarget ? 'gn--target' : ''} ${lit ? 'gn--lit' : ''}`}
      style={{ left: `${n.px}%`, top: `${n.py}%`, '--c': color }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.015, type: 'spring', stiffness: 320, damping: 24 }}
      onMouseEnter={() => onEnter(n.id)}
      onMouseLeave={onLeave}
      onClick={() => onClick(n)}
    >
      <div className="gn__card">
        <div className="gn__icon"><Icon size={isTarget ? 16 : 12} /></div>
        <span className="gn__label">{n.label}</span>
      </div>
    </motion.div>
  );
}

function Panel({ node, links, posMap }) {
  if (!node) return null;
  const color = PALETTE[node.group];
  const Icon  = ICONS[node.group];

  const descriptions = {
    target_role:  'Your active target role. The pipeline visualizes your progression and transferable opportunities for this role.',
    skill_owned:  'A verified skill you possess. This acts as a foundation, connecting you to your target role and potential pivot tracks.',
    skill_missing:'A critical skill gap. Acquiring this skill completes your target pathway and unlocks additional bonus careers.',
    pivot_role:   'A career pivot path. This role shares key skills with your target profile — learning them opens doors to both roles.',
  };

  let connected = [];
  let connLabel = '';
  if (node.group === 'skill_owned' || node.group === 'skill_missing') {
    connLabel = 'Connects to Pivot Roles:';
    connected = links
      .filter(l => l.source === node.id && l.type === 'UNLOCKS')
      .map(l => posMap[l.target]?.label).filter(Boolean);
  } else if (node.group === 'pivot_role') {
    connLabel = 'Synergized Skills:';
    connected = links
      .filter(l => l.target === node.id && l.type === 'UNLOCKS')
      .map(l => posMap[l.source]?.label).filter(Boolean);
  }

  return (
    <motion.aside className="ge-panel"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
    >
      <div className="ge-panel__head" style={{ '--pc': color }}>
        <div className="ge-panel__icon"><Icon size={18} /></div>
        <div>
          <span className="ge-panel__type">{node.group.replace(/_/g, ' ')}</span>
          <h4 className="ge-panel__name">{node.label}</h4>
        </div>
      </div>

      <p className="ge-panel__desc">{descriptions[node.group]}</p>

      {node.weight > 0 && node.group !== 'target_role' && (
        <div className="ge-panel__stat">
          <TrendingUp size={13} />
          <span>Market Weight: <strong>{Number(node.weight).toFixed(1)} / 10.0</strong></span>
        </div>
      )}

      {connected.length > 0 && (
        <div className="ge-panel__related">
          <h5><Share2 size={12} /> {connLabel}</h5>
          <ul>{connected.map((c, i) => <li key={i}><ChevronRight size={12} />{c}</li>)}</ul>
        </div>
      )}
    </motion.aside>
  );
}

export default function GraphExplorer() {
  const { recentPathways, selectedPathway, setSelectedPathway } = useCareerData();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [raw, setRaw]             = useState(null);
  const [hovered, setHovered]     = useState(null);
  const [selected, setSelected]   = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);

  const [isMovable, setIsMovable] = useState(false);
  const [scale, setScale]         = useState(1);
  const viewportRef               = useRef(null);

  const handleDoubleClick = useCallback((e) => {
    if (
      e.target.closest('.gn') || 
      e.target.closest('.ge-legend') || 
      e.target.closest('.ge-mode-toggle') ||
      e.target.closest('.ge-overlay')
    ) {
      return;
    }
    
    setIsMovable(prev => {
      const next = !prev;
      if (!next) {
        setScale(1);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      if (!isMovable) return;
      e.preventDefault();
      const zoomFactor = 0.05;
      const direction = e.deltaY < 0 ? 1 : -1;
      setScale(prev => Math.min(Math.max(prev + direction * zoomFactor, 0.4), 2.5));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [isMovable]);

  useEffect(() => {
    if (!selectedPathway && recentPathways.length > 0) {
      setSelectedPathway(recentPathways[0]);
    }
  }, [recentPathways, selectedPathway, setSelectedPathway]);

  const role = selectedPathway?.role || '';
  const userSkills = useMemo(() =>
    (selectedPathway?.current_skills || []).join(','), [selectedPathway]);

  const fetchGraph = useCallback(async () => {
    if (!role) return;
    setLoading(true); setError(null); setRaw(null); setSelected(null);

    try {
      const { data } = await axios.get(API.GRAPH_DATA, {
        params: { role, user_skills: userSkills }, timeout: 20000,
      });
      if (!data.nodes?.length) { setError('No career transition data found.'); return; }
      setRaw(data);
    } catch (e) {
      console.error(e);
      setError('Could not load the transition graph. Verify the AI server is running.');
    } finally { setLoading(false); }
  }, [role, userSkills]);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  const positioned = useMemo(() => raw ? computePipelineLayout(raw.nodes) : [], [raw]);
  const posMap     = useMemo(() => {
    const m = {};
    positioned.forEach(n => { m[n.id] = n; });
    return m;
  }, [positioned]);

  const litSet = useMemo(() => {
    if (!hovered || !raw) return new Set();
    const s = new Set([hovered]);
    raw.links.forEach(l => {
      if (l.source === hovered) s.add(l.target);
      if (l.target === hovered) s.add(l.source);
    });
    return s;
  }, [hovered, raw]);

  const stats = raw ? {
    owned:   raw.nodes.filter(n => n.group === 'skill_owned').length,
    missing: raw.nodes.filter(n => n.group === 'skill_missing').length,
    pivots:  raw.nodes.filter(n => n.group === 'pivot_role').length,
  } : null;

  return (
    <div className="graph-explorer">
      <header className="ge-header-row">
        <div className="ge-header-left">
          <div className="ge-badge"><Network size={14} /> KNOWLEDGE PATHWAY WEB</div>
          <h2 className="ge-title">Career Transition & <span className="gradient-text">Skill Synergy</span></h2>
          <p className="ge-desc">
            Visualise your skill portfolio as a left-to-right progression pipeline. See how your existing profile bridges into your target goal, and explore alternate pivot paths unlocked by your skills.
          </p>
        </div>

        {recentPathways.length > 0 && (
          <div className="ge-dropdown">
            <span className="ge-dropdown-label">SELECT CAREER JOURNEY</span>
            <div className="ge-dd-wrap">
              <button className="ge-dd-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <Briefcase size={16} />
                <span>{role || 'Select Pathway...'}</span>
                <ChevronDown size={14} className={menuOpen ? 'rot' : ''} />
              </button>
              
              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    className="ge-dd-menu"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    {recentPathways.map((path) => (
                      <button
                        key={path.id}
                        className={`ge-dd-item ${path.role === role ? 'on' : ''}`}
                        onClick={() => {
                          setSelectedPathway(path);
                          setMenuOpen(false);
                        }}
                      >
                        <Target size={12} />
                        <span>{path.role}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {stats && !loading && (
          <motion.div className="ge-stats"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <div className="ge-stat ge-stat--green"><CheckCircle2 size={15}/><b>{stats.owned}</b><span>Mastered Skills</span></div>
            <div className="ge-stat ge-stat--red"><XCircle size={15}/><b>{stats.missing}</b><span>Core Skill Gaps</span></div>
            <div className="ge-stat ge-stat--amber"><Compass size={15}/><b>{stats.pivots}</b><span>Pivot Opportunities</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ge-body">
        <div 
          ref={viewportRef}
          className={`ge-viewport ${isMovable ? 'movable' : ''}`}
          onDoubleClick={handleDoubleClick}
        >
          {!role && (
            <div className="ge-overlay">
              <Target size={32} />
              <h4>No Active Career Path Selected</h4>
              <p>Please select a career journey from the dropdown above or run a scan in the Analyzer.</p>
            </div>
          )}
          
          {loading && (
            <div className="ge-overlay">
              <Loader2 size={28} className="ge-spin" />
              <p>Mapping transition paths and market pivots...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="ge-overlay ge-overlay--err">
              <AlertTriangle size={28} />
              <p>{error}</p>
            </div>
          )}

          {role && positioned.length > 0 && raw && !loading && (
            <>
              <motion.div
                className="ge-canvas"
                drag={isMovable}
                dragConstraints={{ left: -1000, right: 1000, top: -600, bottom: 600 }}
                dragElastic={0.1}
                dragMomentum={true}
                animate={isMovable ? undefined : { x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  cursor: isMovable ? 'grab' : 'default',
                  scale: isMovable ? scale : undefined,
                }}
              >
                <BezierLines posMap={posMap} links={raw.links} hoveredId={hovered} />

                {positioned.map((n, i) => (
                  <GNode key={n.id} n={n} idx={i}
                    lit={litSet.has(n.id)}
                    onEnter={setHovered}
                    onLeave={() => setHovered(null)}
                    onClick={nd => setSelected(prev => prev?.id === nd.id ? null : nd)}
                  />
                ))}

                <span className="ge-col-label" style={{ left: '10%' }}>MY SKILLS</span>
                <span className="ge-col-label" style={{ left: '35%' }}>TARGET CAREER</span>
                <span className="ge-col-label" style={{ left: '60%' }}>SKILL GAPS</span>
                <span className="ge-col-label" style={{ left: '80%' }}>PIVOT PATHS</span>
              </motion.div>

              <AnimatePresence>
                {isMovable && (
                  <motion.div
                    className="ge-toast"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Zap size={12} className="ge-toast-icon" />
                    <span>Drag to Pan • Scroll to Zoom • Double-click to Lock</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                className={`ge-mode-toggle ${isMovable ? 'active' : ''}`}
                onClick={() => {
                  setIsMovable(!isMovable);
                  if (isMovable) {
                    setScale(1);
                  }
                }}
                title="Toggle free-move mode (or double-click empty graph area)"
              >
                {isMovable ? <Zap size={13} /> : <Network size={13} />}
                <span>{isMovable ? 'Free Move: On' : 'Fixed Layout'}</span>
              </button>

              <div className="ge-legend">
                <span><i style={{ background: '#10B981' }}/> Mastered</span>
                <span><i style={{ background: '#6366F1' }}/> Target</span>
                <span><i style={{ background: '#EF4444' }}/> Gap</span>
                <span><i style={{ background: '#F59E0B' }}/> Pivot Role</span>
              </div>
            </>
          )}
        </div>

        <AnimatePresence>
          {selected && <Panel node={selected} links={raw?.links || []} posMap={posMap} />}
        </AnimatePresence>
      </div>

      <div className="ge-footer">
        <Info size={14} />
        <span>This transition map is fully integrated with your active profile. Learning or checking off skills in your Roadmap will dynamically update your status here.</span>
      </div>
    </div>
  );
}

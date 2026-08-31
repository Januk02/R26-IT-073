import { motion } from 'framer-motion';

/* ─── helpers ─── */
const ring = (cx, cy, r, stroke, delay, dash = '6,4') => (
  <motion.circle
    cx={cx} cy={cy} r={r} fill="none"
    stroke={stroke} strokeWidth="1.5" strokeDasharray={dash}
    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.5, scale: 1 }}
    transition={{ duration: 1, delay }}
  />
);

const floatY = (delay = 0) => ({
  y: [0, -6, 0],
  transition: { duration: 2.8, repeat: Infinity, delay, ease: 'easeInOut' },
});

/* ===================================================================
   SLIDE 1 — Discover Yourself
   Central student silhouette with orbiting trait icons
   =================================================================== */
export const DiscoverYourselfAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-4">
    <defs>
      <radialGradient id="d1-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="d1-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* Background glow */}
    <motion.circle cx="200" cy="148" r="120" fill="url(#d1-glow)"
      initial={{ scale: 0 }} animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 4, repeat: Infinity }} />

    {/* Orbit rings */}
    {ring(200, 148, 90, '#93c5fd', 0.3)}
    {ring(200, 148, 115, '#bfdbfe', 0.5, '3,6')}

    {/* Rotating orbit dots */}
    <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '200px 148px' }}>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        return <circle key={i} cx={200 + 90 * Math.cos(a)} cy={148 + 90 * Math.sin(a)} r="2.5" fill="#93c5fd" opacity="0.6" />;
      })}
    </motion.g>

    {/* Student silhouette */}
    <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 200 }}>
      {/* Body */}
      <ellipse cx="200" cy="175" rx="28" ry="22" fill="url(#d1-body)" />
      {/* Head */}
      <circle cx="200" cy="140" r="20" fill="url(#d1-body)" />
      {/* Face highlight */}
      <circle cx="200" cy="137" r="14" fill="#60a5fa" opacity="0.4" />
      {/* Smile */}
      <path d="M193 144 Q200 150 207 144" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </motion.g>

    {/* Orbiting trait icons */}
    {[
      { icon: '🧠', label: 'Mind', deg: 0, color: '#dbeafe' },
      { icon: '💡', label: 'Ideas', deg: 60, color: '#fef3c7' },
      { icon: '🎨', label: 'Create', deg: 120, color: '#fce7f3' },
      { icon: '⚡', label: 'Energy', deg: 180, color: '#fff7ed' },
      { icon: '❤️', label: 'Passion', deg: 240, color: '#fde2e2' },
      { icon: '🔬', label: 'Explore', deg: 300, color: '#dcfce7' },
    ].map((t, i) => {
      const a = (t.deg * Math.PI) / 180;
      const x = 200 + 115 * Math.cos(a);
      const y = 148 + 115 * Math.sin(a);
      return (
        <motion.g key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, ...floatY(i * 0.4) }}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}>
          <circle cx={x} cy={y} r="22" fill={t.color} stroke="white" strokeWidth="2" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="16">{t.icon}</text>
        </motion.g>
      );
    })}

    {/* Pulse ring */}
    <motion.circle cx="200" cy="148" r="48" fill="none" stroke="#3b82f6" strokeWidth="2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
  </svg>
);

/* ===================================================================
   SLIDE 2 — Find Your Degree Path
   Branching paths with a spotlight on the "right" one
   =================================================================== */
export const FindDegreePathAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-4">
    <defs>
      <linearGradient id="d2-active" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <filter id="d2-glow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    {/* Inactive paths (dimmed) */}
    {[
      'M 200 240 C 120 200 60 160 70 80',
      'M 200 240 C 180 190 140 140 160 65',
      'M 200 240 C 260 200 320 160 340 100',
    ].map((d, i) => (
      <motion.path key={i} d={d} fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }} opacity="0.5" />
    ))}

    {/* Active/highlighted path */}
    <motion.path d="M 200 240 C 230 190 280 130 290 60" fill="none" stroke="url(#d2-active)"
      strokeWidth="4" strokeLinecap="round" filter="url(#d2-glow)"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1.4, delay: 0.5 }} />

    {/* Student at base */}
    <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}>
      <circle cx="200" cy="250" r="18" fill="#2563eb" />
      <circle cx="200" cy="238" r="12" fill="#3b82f6" />
      <path d="M195 241 Q200 245 205 241" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </motion.g>

    {/* Destination nodes */}
    {[
      { x: 70, y: 80, icon: '📐', dim: true },
      { x: 160, y: 65, icon: '⚖️', dim: true },
      { x: 290, y: 55, icon: '🎓', dim: false },
      { x: 340, y: 100, icon: '📊', dim: true },
    ].map((n, i) => (
      <motion.g key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: n.dim ? 0.45 : 1, scale: n.dim ? 0.9 : 1, ...(!n.dim ? floatY(0.5) : {}) }}
        transition={{ duration: 0.5, delay: 1 + i * 0.12 }}>
        <circle cx={n.x} cy={n.y} r={n.dim ? 20 : 26} fill={n.dim ? '#f1f5f9' : '#dbeafe'} stroke={n.dim ? '#e2e8f0' : '#3b82f6'} strokeWidth={n.dim ? 1 : 2.5} />
        <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={n.dim ? 14 : 20}>{n.icon}</text>
      </motion.g>
    ))}

    {/* Glow ring on active destination */}
    <motion.circle cx="290" cy="55" r="32" fill="none" stroke="#3b82f6" strokeWidth="2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />

    {/* Moving particle along active path */}
    <motion.circle r="5" fill="#f97316"
      animate={{ cx: [200, 215, 240, 265, 280, 290], cy: [240, 210, 170, 130, 90, 60] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 1.8, ease: 'easeInOut' }} />

    {/* "Best Fit" badge */}
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1.8, type: 'spring' }}>
      <rect x="310" y="35" width="60" height="22" rx="11" fill="#2563eb" />
      <text x="340" y="50" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">BEST FIT</text>
    </motion.g>
  </svg>
);

/* ===================================================================
   SLIDE 3 — See Your Future Career
   Timeline: Student → Graduate → Professional with floating icons
   =================================================================== */
export const FutureCareerAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-4">
    <defs>
      <linearGradient id="d3-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>

    {/* Timeline line */}
    <motion.line x1="60" y1="200" x2="340" y2="200" stroke="url(#d3-line)" strokeWidth="4" strokeLinecap="round"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }} style={{ transformOrigin: 'left' }} />

    {/* Dots on timeline */}
    {[60, 200, 340].map((x, i) => (
      <motion.circle key={i} cx={x} cy={200} r="6" fill={i === 2 ? '#f97316' : '#3b82f6'}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.6 + i * 0.3, type: 'spring', stiffness: 300 }} />
    ))}

    {/* Stage 1 – Student */}
    <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}>
      <circle cx="60" cy="160" r="24" fill="#dbeafe" />
      <text x="60" y="167" textAnchor="middle" fontSize="22">🧑‍🎓</text>
      <text x="60" y="228" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Student</text>
    </motion.g>

    {/* Stage 2 – Graduate */}
    <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}>
      <circle cx="200" cy="155" r="28" fill="#dbeafe" />
      <motion.text x="200" y="163" textAnchor="middle" fontSize="26"
        animate={{ y: [163, 158, 163] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}>
        🎓
      </motion.text>
      <text x="200" y="228" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Graduate</text>
    </motion.g>

    {/* Stage 3 – Professional */}
    <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.1 }}>
      <circle cx="340" cy="150" r="32" fill="#fff7ed" stroke="#f97316" strokeWidth="2" />
      <text x="340" y="158" textAnchor="middle" fontSize="28">💼</text>
      <text x="340" y="228" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">Professional</text>
    </motion.g>

    {/* Floating career aspiration icons */}
    {[
      { icon: '🚀', x: 90, y: 90, d: 0 },
      { icon: '💰', x: 160, y: 75, d: 0.6 },
      { icon: '🏆', x: 240, y: 70, d: 1.2 },
      { icon: '🌍', x: 310, y: 85, d: 0.3 },
    ].map((f, i) => (
      <motion.g key={i}
        initial={{ opacity: 0, y: f.y + 20 }}
        animate={{ opacity: 1, y: f.y, ...floatY(f.d) }}
        transition={{ duration: 0.5, delay: 1.3 + i * 0.15 }}>
        <circle cx={f.x} cy={f.y} r="16" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <text x={f.x} y={f.y + 5} textAnchor="middle" fontSize="14">{f.icon}</text>
      </motion.g>
    ))}

    {/* Arrow connectors */}
    {[{ x1: 90, x2: 168 }, { x1: 230, x2: 305 }].map((a, i) => (
      <motion.line key={i} x1={a.x1} y1="200" x2={a.x2} y2="200"
        stroke="#3b82f6" strokeWidth="0" markerEnd=""
        initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
        transition={{ delay: 0.9 + i * 0.3 }} />
    ))}

    {/* Progress shimmer */}
    <motion.rect x="60" y="198" width="20" height="4" rx="2" fill="white" opacity="0.7"
      animate={{ x: [60, 340] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.5, ease: 'easeInOut' }} />
  </svg>
);

/* ===================================================================
   SLIDE 4 — Start Your Journey
   Winding road with checkpoints leading to a glowing star
   =================================================================== */
export const StartJourneyAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-4">
    <defs>
      <linearGradient id="d4-road" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="60%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      <radialGradient id="d4-star-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Road path */}
    <motion.path
      d="M 40 260 C 80 230 100 200 130 185 S 180 160 200 150 S 250 120 280 100 S 320 70 360 45"
      fill="none" stroke="url(#d4-road)" strokeWidth="5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }} />

    {/* Road shadow */}
    <motion.path
      d="M 40 260 C 80 230 100 200 130 185 S 180 160 200 150 S 250 120 280 100 S 320 70 360 45"
      fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" opacity="0.06"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }} />

    {/* Checkpoints */}
    {[
      { x: 40, y: 260, label: 'You', icon: '🧑', delay: 0.5 },
      { x: 130, y: 185, label: 'Profile', icon: '📝', delay: 0.9 },
      { x: 200, y: 150, label: 'Analysis', icon: '🔍', delay: 1.3 },
      { x: 280, y: 100, label: 'Degree', icon: '🎓', delay: 1.7 },
    ].map((cp, i) => (
      <motion.g key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: cp.delay, type: 'spring', stiffness: 250 }}>
        <circle cx={cp.x} cy={cp.y} r="18" fill="white" stroke="#3b82f6" strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(59,130,246,0.2))' }} />
        <text x={cp.x} y={cp.y + 5} textAnchor="middle" fontSize="14">{cp.icon}</text>
        <text x={cp.x} y={cp.y + 32} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">{cp.label}</text>
      </motion.g>
    ))}

    {/* Destination star glow */}
    <motion.circle cx="360" cy="45" r="40" fill="url(#d4-star-glow)"
      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, delay: 2 }} />

    {/* Destination node */}
    <motion.g initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 2, type: 'spring' }}>
      <circle cx="360" cy="45" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
      <text x="360" y="52" textAnchor="middle" fontSize="20">⭐</text>
      <text x="360" y="78" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="700">YOUR GOAL</text>
    </motion.g>

    {/* Moving traveler dot */}
    <motion.circle r="6" fill="#f97316" style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.6))' }}
      animate={{
        cx: [40, 85, 130, 165, 200, 240, 280, 320, 360],
        cy: [260, 220, 185, 168, 150, 125, 100, 72, 45],
      }}
      transition={{ duration: 3.5, repeat: Infinity, delay: 2.5, ease: 'easeInOut' }} />

    {/* Sparkle particles */}
    {[
      { x: 100, y: 210, d: 1 },
      { x: 170, y: 155, d: 1.5 },
      { x: 250, y: 110, d: 2 },
      { x: 330, y: 65, d: 2.5 },
    ].map((s, i) => (
      <motion.circle key={i} cx={s.x} cy={s.y} r="2" fill="#fbbf24"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: s.d }} />
    ))}

    {/* Decorative connecting arcs */}
    <motion.path d="M 130 185 Q 165 165 200 150" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,4" opacity="0.3"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1.5 }} />
  </svg>
);

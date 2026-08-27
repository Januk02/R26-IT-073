import { motion } from 'framer-motion';

export const DiscoverYourselfAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-6">
    {/* Central student figure */}
    <motion.circle
      cx="200"
      cy="150"
      r="40"
      fill="#2563eb"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    <motion.circle
      cx="200"
      cy="130"
      r="25"
      fill="#3b82f6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    />
    
    {/* Orbiting interests */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * (Math.PI / 180);
      const radius = 80;
      const x = 200 + radius * Math.cos(angle);
      const y = 150 + radius * Math.sin(angle);
      const icons = ['💻', '🎨', '⚕️', '🔬', '📊', '🎵'];
      
      return (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
        >
          <circle cx={x} cy={y} r="20" fill="#dbeafe" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="16">
            {icons[i]}
          </text>
        </motion.g>
      );
    })}
    
    {/* Orbit paths */}
    <motion.circle
      cx="200"
      cy="150"
      r="80"
      fill="none"
      stroke="#93c5fd"
      strokeWidth="2"
      strokeDasharray="5,5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    />
  </svg>
);

export const FindDegreePathAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-6">
    {/* Student at center */}
    <motion.circle
      cx="200"
      cy="220"
      r="35"
      fill="#2563eb"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    <motion.circle
      cx="200"
      cy="200"
      r="22"
      fill="#3b82f6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    />
    
    {/* Multiple paths */}
    {[
      { endX: 80, endY: 80, color: '#e2e8f0', active: false },
      { endX: 200, endY: 60, color: '#e2e8f0', active: false },
      { endX: 320, endY: 80, color: '#2563eb', active: true },
    ].map((path, i) => (
      <motion.path
        key={i}
        d={`M 200 220 Q ${path.endX} 150 ${path.endX} ${path.endY}`}
        fill="none"
        stroke={path.color}
        strokeWidth={path.active ? 4 : 2}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: path.active ? 1 : 0.5 }}
        transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
      />
    ))}
    
    {/* Degree destinations */}
    {[
      { x: 80, y: 80, icon: '🎓', active: false },
      { x: 200, y: 60, icon: '📚', active: false },
      { x: 320, y: 80, icon: '✨', active: true },
    ].map((dest, i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: dest.active ? 1 : 0.5, scale: dest.active ? 1.2 : 1 }}
        transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
      >
        <circle cx={dest.x} cy={dest.y} r="25" fill={dest.active ? '#dbeafe' : '#f1f5f9'} />
        <text x={dest.x} y={dest.y + 5} textAnchor="middle" fontSize="18">
          {dest.icon}
        </text>
      </motion.g>
    ))}
    
    {/* Glow effect on active path */}
    <motion.circle
      cx="320"
      cy="80"
      r="30"
      fill="none"
      stroke="#2563eb"
      strokeWidth="3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
    />
  </svg>
);

export const FutureCareerAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-6">
    {/* Progress line */}
    <motion.line
      x1="50"
      y1="200"
      x2="350"
      y2="200"
      stroke="#e2e8f0"
      strokeWidth="4"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      transformOrigin="left"
    />
    
    {/* Student */}
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <circle cx="80" cy="200" r="30" fill="#2563eb" />
      <circle cx="80" cy="185" r="18" fill="#3b82f6" />
      <text x="80" y="245" textAnchor="middle" fontSize="12" fill="#64748b">Student</text>
    </motion.g>
    
    {/* Graduation cap */}
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <circle cx="200" cy="200" r="30" fill="#2563eb" />
      <circle cx="200" cy="185" r="18" fill="#3b82f6" />
      <motion.text
        x="200"
        y="180"
        textAnchor="middle"
        fontSize="20"
        initial={{ y: 170 }}
        animate={{ y: [170, 175, 170] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.8 }}
      >
        🎓
      </motion.text>
      <text x="200" y="245" textAnchor="middle" fontSize="12" fill="#64748b">Graduate</text>
    </motion.g>
    
    {/* Professional */}
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <circle cx="320" cy="200" r="30" fill="#2563eb" />
      <circle cx="320" cy="185" r="18" fill="#3b82f6" />
      <text x="320" y="180" textAnchor="middle" fontSize="20">💼</text>
      <text x="320" y="245" textAnchor="middle" fontSize="12" fill="#64748b">Professional</text>
    </motion.g>
    
    {/* Career icons floating above */}
    {['🚀', '⚡', '🎯'].map((icon, i) => (
      <motion.text
        key={i}
        x={100 + i * 100}
        y={120 + Math.sin(i) * 20}
        textAnchor="middle"
        fontSize="24"
        initial={{ opacity: 0, y: 150 }}
        animate={{ 
          opacity: 1, 
          y: [120 + Math.sin(i) * 20, 110 + Math.sin(i) * 20, 120 + Math.sin(i) * 20]
        }}
        transition={{ 
          duration: 0.5, 
          delay: 1 + i * 0.2,
          y: { duration: 2, repeat: Infinity, delay: 1.2 + i * 0.2 }
        }}
      >
        {icon}
      </motion.text>
    ))}
  </svg>
);

export const StartJourneyAnimation = () => (
  <svg viewBox="0 0 400 300" className="w-full h-64 mb-6">
    {/* Roadmap path */}
    <motion.path
      d="M 50 250 Q 100 200 150 180 T 250 140 T 350 80"
      fill="none"
      stroke="#2563eb"
      strokeWidth="4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
    />
    
    {/* Milestones */}
    {[50, 150, 250, 350].map((x, i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 + i * 0.3 }}
      >
        <circle cx={x} cy={i === 0 ? 250 : i === 1 ? 180 : i === 2 ? 140 : 80} r="12" fill="#3b82f6" />
        <circle cx={x} cy={i === 0 ? 250 : i === 1 ? 180 : i === 2 ? 140 : 80} r="6" fill="white" />
      </motion.g>
    ))}
    
    {/* Destination glow */}
    <motion.circle
      cx="350"
      cy="80"
      r="25"
      fill="none"
      stroke="#2563eb"
      strokeWidth="3"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0.3, 0.8, 0.3], 
        scale: [1, 1.3, 1] 
      }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
    />
    
    {/* Destination star */}
    <motion.text
      x="350"
      y="85"
      textAnchor="middle"
      fontSize="24"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      ⭐
    </motion.text>
    
    {/* Moving dot along path */}
    <motion.circle
      r="8"
      fill="#fbbf24"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        cx: [50, 100, 150, 200, 250, 300, 350],
        cy: [250, 225, 180, 160, 140, 110, 80]
      }}
      transition={{ duration: 3, repeat: Infinity, delay: 1.8, ease: "easeInOut" }}
    />
    
    {/* Labels */}
    <motion.text
      x="50"
      y="280"
      textAnchor="middle"
      fontSize="11"
      fill="#64748b"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      Start
    </motion.text>
    <motion.text
      x="350"
      y="115"
      textAnchor="middle"
      fontSize="11"
      fill="#64748b"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4 }}
    >
      Goal
    </motion.text>
  </svg>
);

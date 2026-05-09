const MedalBadge = ({ tier, size = 'md', showLabel = true, animated = false }) => {
  const medals = {
    platinum: {
      name: 'Platinum Mentor',
      description: 'Exceptional excellence - Score 95%+',
      image: null, // Uses SVG fallback
      color: 'from-slate-300 via-slate-100 to-slate-300',
      borderColor: 'border-slate-400',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
      glow: 'shadow-[0_0_30px_rgba(148,163,184,0.6)]'
    },
    gold: {
      name: 'Gold Mentor',
      description: 'Outstanding performance - Score 80-94%',
      image: '/images/gold.png',
      color: 'from-yellow-400 via-yellow-200 to-yellow-400',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      glow: 'shadow-[0_0_30px_rgba(250,204,21,0.6)]'
    },
    silver: {
      name: 'Silver Mentor',
      description: 'Strong performance - Score 65-79%',
      image: '/images/silver.png',
      color: 'from-gray-300 via-gray-100 to-gray-300',
      borderColor: 'border-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-100',
      glow: 'shadow-[0_0_25px_rgba(156,163,175,0.5)]'
    },
    bronze: {
      name: 'Bronze Mentor',
      description: 'Good foundation - Score 50-64%',
      image: '/images/bronze.png',
      color: 'from-orange-400 via-orange-200 to-orange-400',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-100',
      glow: 'shadow-[0_0_20px_rgba(251,146,60,0.5)]'
    },
    rising: {
      name: 'Rising Star',
      description: 'Emerging mentor - Score 35-49%',
      image: null, // Uses SVG fallback
      color: 'from-green-400 via-green-200 to-green-400',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-100',
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.5)]'
    },
    participant: {
      name: 'Verified Mentor',
      description: 'Completed verification - Score <35%',
      image: null, // Uses SVG fallback
      color: 'from-blue-400 via-blue-200 to-blue-400',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]'
    }
  };

  const medal = medals[tier] || medals.participant;

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // SVG fallback icons for tiers without images
  const renderIcon = () => {
    if (medal.image) {
      return (
        <img 
          src={medal.image} 
          alt={medal.name}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      );
    }

    // SVG fallbacks for platinum, rising, participant
    const icons = {
      platinum: (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="plat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#plat-grad)" stroke="#64748b" strokeWidth="3"/>
          <text x="50" y="45" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#475569">★</text>
          <text x="50" y="68" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">PLATINUM</text>
        </svg>
      ),
      rising: (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="rising-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#rising-grad)" stroke="#16a34a" strokeWidth="3"/>
          <text x="50" y="45" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#14532d">↑</text>
          <text x="50" y="68" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#14532d">RISING</text>
        </svg>
      ),
      participant: (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="part-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#part-grad)" stroke="#2563eb" strokeWidth="3"/>
          <text x="50" y="45" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1e3a8a">✓</text>
          <text x="50" y="68" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e3a8a">VERIFIED</text>
        </svg>
      )
    };
    return icons[tier] || icons.participant;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          relative ${sizeClasses[size]} rounded-full p-2
          ${medal.bgColor}
          border-4 ${medal.borderColor}
          ${animated ? `animate-pulse ${medal.glow}` : 'shadow-xl'}
          transition-all duration-300 hover:scale-110 hover:shadow-2xl
          flex items-center justify-center overflow-hidden
        `}
        title={medal.description}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent transform -rotate-45" />
        </div>
        
        {/* Medal content */}
        <div className="w-full h-full relative z-10 p-1">
          {renderIcon()}
        </div>

        {/* Sparkle decorations for higher tiers */}
        {(tier === 'platinum' || tier === 'gold') && (
          <>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-200 rounded-full animate-pulse" />
          </>
        )}
      </div>

      {showLabel && (
        <div className="mt-3 text-center">
          <p className={`font-bold ${labelSizeClasses[size]} ${medal.textColor}`}>
            {medal.name}
          </p>
          <p className="text-xs text-gray-500 max-w-[140px] leading-tight mt-1">
            {medal.description}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to determine medal tier based on score
export const getMedalTier = (score) => {
  if (score >= 95) return 'platinum';
  if (score >= 80) return 'gold';
  if (score >= 65) return 'silver';
  if (score >= 50) return 'bronze';
  if (score >= 35) return 'rising';
  return 'participant';
};

// Helper function to get medal info
export const getMedalInfo = (tier) => {
  const medals = {
    platinum: { name: 'Platinum Mentor', color: 'slate', minScore: 95 },
    gold: { name: 'Gold Mentor', color: 'yellow', minScore: 80 },
    silver: { name: 'Silver Mentor', color: 'gray', minScore: 65 },
    bronze: { name: 'Bronze Mentor', color: 'orange', minScore: 50 },
    rising: { name: 'Rising Star', color: 'green', minScore: 35 },
    participant: { name: 'Verified Mentor', color: 'blue', minScore: 0 }
  };
  return medals[tier] || medals.participant;
};

export default MedalBadge;

import React from 'react';

const StudiFyxLogo = ({ 
  className = "", 
  size = "w-12 h-12",
  variant = "default" // default, white, large
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "w-8 h-8":
        return "w-8 h-8";
      case "w-10 h-10":
        return "w-10 h-10";
      case "w-12 h-12":
        return "w-12 h-12";
      case "w-14 h-14":
        return "w-14 h-14";
      case "w-16 h-16":
        return "w-16 h-16";
      case "w-20 h-20":
        return "w-20 h-20";
      case "w-24 h-24":
        return "w-24 h-24";
      case "w-32 h-32":
        return "w-32 h-32";
      default:
        return "w-12 h-12";
    }
  };

  const getLogoVariant = () => {
    switch (variant) {
      case "white":
        return "/src/assets/main name colour logo .png"; // Assuming same logo works for white variant
      case "large":
        return "/src/assets/main name colour logo .png";
      default:
        return "/src/assets/main name colour logo .png";
    }
  };

  return (
    <div className={`relative ${getSizeClasses()} ${className}`}>
      <img 
        src={getLogoVariant()} 
        alt="StudiFyx - Professional Mentorship Platform" 
        className={`w-full h-full object-contain transition-all duration-300 hover:scale-105`}
        style={{
          filter: variant === "white" ? "brightness(0) invert(1)" : "none"
        }}
        onError={(e) => {
          // Fallback to text-based logo if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback text logo */}
      <div 
        className="w-full h-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg font-bold text-white flex"
        style={{ display: 'none' }}
      >
        <span className="text-sm sm:text-base">SF</span>
      </div>
    </div>
  );
};

export default StudiFyxLogo;

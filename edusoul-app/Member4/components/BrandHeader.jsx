import React from 'react';
import StudiFyxLogo from './StudiFyxLogo';

const BrandHeader = ({ 
  title = "StudiFyx",
  subtitle = "",
  showLogo = true,
  logoSize = "w-10 h-10",
  className = "",
  centered = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''} ${className}`}>
      {showLogo && (
        <div className="flex-shrink-0">
          <StudiFyxLogo size={logoSize} />
        </div>
      )}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-500 leading-tight">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandHeader;

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        relative overflow-hidden
        bg-glass-surface backdrop-blur-xl 
        border border-glass-border 
        rounded-2xl shadow-2xl
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:bg-glass-highlight hover:border-white/20 hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

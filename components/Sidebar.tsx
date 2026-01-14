import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, CheckSquare, Trophy, StickyNote } from 'lucide-react';

export type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'achievements' | 'notes';

interface SidebarProps {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView }) => {
  const menuItems: { id: ViewType; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard', label: 'Briefing', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Focus', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'notes', label: 'Scratchpad', icon: StickyNote },
  ];

  return (
    <div className="w-20 lg:w-64 flex flex-col h-full bg-glass-surface backdrop-blur-xl border-r border-glass-border pt-8 pb-4 transition-all duration-300">
      <div className="px-4 mb-8 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-cyan to-electric-purple flex-shrink-0" />
        <h1 className="hidden lg:block font-display font-bold text-xl tracking-tight text-white">
          NeonFlow
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-electric-purple/20 text-white shadow-[0_0_15px_rgba(176,38,255,0.3)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={22} className={isActive ? 'text-electric-cyan' : 'group-hover:text-gray-200'} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-electric-cyan shadow-[0_0_10px_#00f3ff]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 text-center lg:text-left">
        <p className="hidden lg:block text-xs text-gray-600 font-mono">v1.2.0 Beta</p>
      </div>
    </div>
  );
};

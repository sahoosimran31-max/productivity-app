import React from 'react';
import { Task, CalendarEvent } from '../types';
import { GlassCard } from './GlassCard';
import { Sun, AlertTriangle, CheckCircle } from 'lucide-react';
import { isTomorrow, isToday, parseISO } from 'date-fns';

interface MorningBriefingProps {
  todoCount: number;
  events: CalendarEvent[];
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({ todoCount, events }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const urgentEvent = events.find(e => {
    const date = parseISO(e.date);
    return (isToday(date) || isTomorrow(date)) && e.isUrgent;
  });

  const upcomingEvent = events.find(e => {
    const date = parseISO(e.date);
    return isToday(date) || isTomorrow(date);
  });

  const displayEvent = urgentEvent || upcomingEvent;

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sun size={100} />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-display font-bold text-white mb-1">
          {getGreeting()}, Chief.
        </h2>
        <p className="text-gray-400 mb-6">Here is your daily briefing.</p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
             <div className="bg-electric-blue/20 p-2 rounded-lg text-electric-blue">
               <CheckCircle size={20} />
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Tasks Pending</p>
               <p className="text-xl font-bold text-white">{todoCount} <span className="text-sm font-normal text-gray-500">items</span></p>
             </div>
          </div>

          {displayEvent && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${displayEvent.isUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
               <div className={`p-2 rounded-lg ${displayEvent.isUrgent ? 'bg-red-500/20 text-red-500' : 'bg-electric-purple/20 text-electric-purple'}`}>
                 <AlertTriangle size={20} />
               </div>
               <div>
                 <p className={`text-xs uppercase tracking-wider font-bold ${displayEvent.isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
                   {isToday(parseISO(displayEvent.date)) ? 'Happening Today' : 'Reminder for Tomorrow'}
                 </p>
                 <p className="text-white font-medium truncate max-w-[200px]">{displayEvent.title}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

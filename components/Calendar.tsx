import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setNewEventTitle('');
    setIsUrgent(false);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newEventTitle.trim(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      isUrgent
    };

    onAddEvent(newEvent);
    setSelectedDate(null);
  };

  return (
    <GlassCard className="p-4 md:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {calendarDays.map((day, idx) => {
          const dayEvents = events.filter(evt => isSameDay(new Date(evt.date + 'T00:00:00'), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div 
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[60px] p-1 rounded-lg border border-transparent transition-all cursor-pointer relative group
                ${isCurrentMonth ? 'bg-white/5 hover:bg-white/10' : 'bg-transparent text-gray-600'}
                ${isDayToday ? 'border-electric-cyan/30 bg-electric-cyan/5' : ''}
              `}
            >
              <span className={`text-xs ${isDayToday ? 'text-electric-cyan font-bold' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </span>
              
              {/* Event Dots */}
              <div className="flex flex-col gap-1 mt-1">
                {dayEvents.slice(0, 3).map(evt => (
                  <div 
                    key={evt.id} 
                    className={`h-1.5 w-full rounded-full ${evt.isUrgent ? 'bg-red-500' : 'bg-electric-purple'}`} 
                    title={evt.title}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="h-1 w-1 bg-gray-500 rounded-full mx-auto" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal Overlay */}
      {selectedDate && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-4">
          <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                Events for {format(selectedDate, 'MMM d')}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Existing Events List for Selected Day */}
            <div className="mb-4 max-h-40 overflow-y-auto space-y-2">
              {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).map(evt => (
                 <div key={evt.id} className="flex items-center justify-between bg-white/5 p-2 rounded text-sm">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${evt.isUrgent ? 'bg-red-500' : 'bg-electric-purple'}`} />
                      <span className="text-gray-200 truncate max-w-[150px]">{evt.title}</span>
                   </div>
                   <button onClick={() => onDeleteEvent(evt.id)} className="text-gray-500 hover:text-red-400">
                     <TrashIcon />
                   </button>
                 </div>
              ))}
               {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                 <p className="text-gray-500 text-xs italic">No events scheduled.</p>
               )}
            </div>

            <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
              <input
                autoFocus
                type="text"
                placeholder="New Event Title"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-electric-cyan outline-none"
              />
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isUrgent} 
                  onChange={e => setIsUrgent(e.target.checked)}
                  className="rounded border-gray-600 bg-transparent text-electric-cyan focus:ring-offset-0 focus:ring-0" 
                />
                Mark as Urgent
              </label>
              <button 
                type="submit" 
                className="bg-electric-cyan text-black font-bold py-2 rounded-lg hover:bg-cyan-400 transition-colors text-sm"
              >
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

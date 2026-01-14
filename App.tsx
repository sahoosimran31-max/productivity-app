import React, { useState, useEffect } from 'react';
import { Plus, ListTodo, Clock, PenLine, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, TaskStatus, CalendarEvent } from './types';
import { LOCAL_STORAGE_KEY, NOTES_STORAGE_KEY, EVENTS_STORAGE_KEY, COLUMNS } from './constants';
import { GlassCard } from './components/GlassCard';
import { TaskCard } from './components/TaskCard';
import { Calendar } from './components/Calendar';
import { MorningBriefing } from './components/MorningBriefing';
import { AchievementsHeader } from './components/AchievementsHeader';
import { Sidebar, ViewType } from './components/Sidebar';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Failed to parse events", e);
      }
    }
    
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    setIsLoaded(true);
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (isLoaded) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(NOTES_STORAGE_KEY, notes);
  }, [notes, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events, isLoaded]);

  // Calendar Logic
  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };
  
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Task Logic
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      status: TaskStatus.TODO,
      createdAt: Date.now(),
      elapsedTime: 0,
      isTimerRunning: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const updateTaskText = (id: string, newText: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      const updates: Partial<Task> = { status: newStatus };
      
      // Moving TO In-Progress
      if (newStatus === TaskStatus.IN_PROGRESS && t.status !== TaskStatus.IN_PROGRESS) {
        updates.startedAt = t.startedAt || Date.now();
      }
      
      // Moving TO Done
      if (newStatus === TaskStatus.DONE) {
        updates.completedAt = Date.now();
        updates.isTimerRunning = false;
        // Finalize time
        if (t.isTimerRunning && t.lastTimerStartTime) {
          updates.elapsedTime = t.elapsedTime + (Date.now() - t.lastTimerStartTime);
          updates.lastTimerStartTime = undefined;
        }
        
        // Trigger Celebration
        if (t.status !== TaskStatus.DONE) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b026ff', '#00f3ff', '#ffffff']
          });
        }
      }

      // Moving FROM In-Progress (Pause timer if running)
      if (t.status === TaskStatus.IN_PROGRESS && newStatus !== TaskStatus.IN_PROGRESS) {
        updates.isTimerRunning = false;
        if (t.isTimerRunning && t.lastTimerStartTime) {
           updates.elapsedTime = t.elapsedTime + (Date.now() - t.lastTimerStartTime);
           updates.lastTimerStartTime = undefined;
        }
      }

      return { ...t, ...updates };
    }));
  };

  const toggleTimer = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;

      if (t.isTimerRunning) {
        // Pause
        return {
          ...t,
          isTimerRunning: false,
          elapsedTime: t.elapsedTime + (Date.now() - (t.lastTimerStartTime || Date.now())),
          lastTimerStartTime: undefined
        };
      } else {
        // Start
        return {
          ...t,
          isTimerRunning: true,
          lastTimerStartTime: Date.now()
        };
      }
    }));
  };

  const resetTimer = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        elapsedTime: 0,
        isTimerRunning: false,
        lastTimerStartTime: undefined
      };
    }));
  };

  const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).sort((a, b) => b.createdAt - a.createdAt);
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
  const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  // Render Views
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto pt-6">
            <MorningBriefing todoCount={todoTasks.length} events={events} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                 <h3 className="text-xl font-bold mb-4 text-electric-cyan">Quick Focus</h3>
                 {inProgressTasks.length > 0 ? (
                    inProgressTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="mb-4">
                        <TaskCard 
                          task={task}
                          onDelete={deleteTask}
                          onMove={moveTask}
                          onToggleTimer={toggleTimer}
                          onResetTimer={resetTimer}
                          onUpdateText={updateTaskText}
                        />
                      </div>
                    ))
                 ) : (
                   <p className="text-gray-500 italic">No active tasks. Check your todo list.</p>
                 )}
                 <button onClick={() => setActiveView('tasks')} className="mt-2 text-sm text-electric-purple hover:text-white transition-colors">Go to Tasks &rarr;</button>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Upcoming Events</h3>
                 <div className="space-y-2">
                   {events.slice(0, 3).map(evt => (
                     <div key={evt.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                       <div className={`w-2 h-2 rounded-full ${evt.isUrgent ? 'bg-red-500' : 'bg-electric-cyan'}`} />
                       <div className="flex-1 overflow-hidden">
                         <p className="text-sm font-medium text-gray-200 truncate">{evt.title}</p>
                         <p className="text-xs text-gray-500">{evt.date}</p>
                       </div>
                     </div>
                   ))}
                   {events.length === 0 && <p className="text-gray-500 italic">No upcoming events.</p>}
                 </div>
                 <button onClick={() => setActiveView('calendar')} className="mt-4 text-sm text-electric-cyan hover:text-white transition-colors">View Calendar &rarr;</button>
              </GlassCard>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-w-6xl mx-auto pt-6">
             {/* TODO Column */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${COLUMNS.TODO.color}`}>
                  <ListTodo className="w-5 h-5" />
                  {COLUMNS.TODO.title}
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">{todoTasks.length}</span>
                </h2>
              </div>
              
              <GlassCard className="p-1.5">
                <form onSubmit={addTask} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="New Task..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 px-3 py-2 text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newTaskText.trim()}
                    className="bg-white/10 hover:bg-electric-purple hover:text-white text-gray-400 p-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </form>
              </GlassCard>

              <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-20">
                {todoTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onDelete={deleteTask}
                    onMove={moveTask}
                    onToggleTimer={toggleTimer}
                    onResetTimer={resetTimer}
                    onUpdateText={updateTaskText}
                  />
                ))}
              </div>
            </section>

            {/* In Progress Column */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${COLUMNS.IN_PROGRESS.color}`}>
                  <Clock className="w-5 h-5 animate-pulse-slow" />
                  {COLUMNS.IN_PROGRESS.title}
                  <span className="text-xs bg-electric-cyan/20 px-2 py-0.5 rounded-full text-electric-cyan">{inProgressTasks.length}</span>
                </h2>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-20">
                {inProgressTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-700 italic border-2 border-dashed border-gray-800 rounded-xl text-sm">
                    Focus zone empty. Start a task!
                  </div>
                )}
                {inProgressTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onDelete={deleteTask}
                    onMove={moveTask}
                    onToggleTimer={toggleTimer}
                    onResetTimer={resetTimer}
                    onUpdateText={updateTaskText}
                  />
                ))}
              </div>
            </section>
          </div>
        );

      case 'calendar':
        return (
          <div className="h-full pt-6 max-w-5xl mx-auto">
            <Calendar events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
          </div>
        );

      case 'achievements':
        return (
           <div className="max-w-3xl mx-auto pt-6 flex flex-col gap-6 h-full">
              <AchievementsHeader tasks={tasks} />
              <div className="flex flex-col gap-4 overflow-y-auto pb-20">
                {doneTasks.length === 0 && (
                  <div className="text-center py-12 text-gray-600 italic">
                    <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                    Complete tasks to build your wall of fame.
                  </div>
                )}
                {doneTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onDelete={deleteTask}
                    onMove={moveTask}
                    onToggleTimer={toggleTimer}
                    onResetTimer={resetTimer}
                    onUpdateText={updateTaskText}
                  />
                ))}
              </div>
           </div>
        );

      case 'notes':
        return (
          <div className="h-full pt-6 max-w-5xl mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-6 px-2">
              <PenLine className="text-electric-purple" size={24} />
              <h2 className="text-2xl font-bold text-white">Scratchpad</h2>
            </div>
            <GlassCard className="flex-1 flex flex-col p-0 mb-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start typing your ideas, drafts, or random thoughts..."
                className="flex-1 w-full bg-transparent border-none outline-none text-base text-gray-200 placeholder-gray-600 resize-none font-mono p-8 leading-relaxed"
                spellCheck={false}
              />
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

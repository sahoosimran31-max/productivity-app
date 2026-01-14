import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerDisplayProps {
  task: Task;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ task, onToggle, onReset }) => {
  // Local state to force re-render for the running timer
  const [, setTick] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (task.isTimerRunning) {
      interval = window.setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [task.isTimerRunning]);

  const getCurrentTotalTime = () => {
    let total = task.elapsedTime;
    if (task.isTimerRunning && task.lastTimerStartTime) {
      total += Date.now() - task.lastTimerStartTime;
    }
    return total;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
      <div className={`font-mono text-lg font-bold tracking-wider ${task.isTimerRunning ? 'text-electric-cyan animate-pulse' : 'text-gray-400'}`}>
        {formatTime(getCurrentTotalTime())}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onReset(task.id); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`
            flex items-center justify-center p-1.5 rounded-lg transition-all duration-300
            ${task.isTimerRunning 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
              : 'bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30'}
          `}
          title={task.isTimerRunning ? "Pause" : "Start"}
        >
          {task.isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

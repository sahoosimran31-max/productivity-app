import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { GlassCard } from './GlassCard';
import { TimerDisplay } from './TimerDisplay';
import { Trash2, Clock, Trophy, ArrowRight, CheckCircle2, Edit2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onUpdateText: (id: string, newText: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onMove,
  onToggleTimer,
  onResetTimer,
  onUpdateText
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // adjust height
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateText(task.id, editText.trim());
      setIsEditing(false);
    } else {
      // If empty, revert
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') handleCancel();
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  };

  return (
    <GlassCard className="p-4 group" hoverEffect>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              rows={1}
              className="w-full bg-white/5 border border-electric-cyan/30 rounded px-2 py-1 text-white focus:outline-none focus:border-electric-cyan resize-none overflow-hidden font-medium leading-snug"
            />
          ) : (
            <div 
              className="group/text cursor-text"
              onDoubleClick={() => setIsEditing(true)}
            >
              <p className="text-gray-100 font-medium leading-snug break-words whitespace-pre-wrap">
                {task.text}
              </p>
              <div className="text-xs text-gray-500 mt-2 font-mono flex flex-wrap gap-2 items-center">
                {task.status === TaskStatus.IN_PROGRESS && task.startedAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> Started: {formatDate(task.startedAt)}
                  </span>
                )}
                {task.status === TaskStatus.DONE && task.completedAt && (
                   <span className="flex items-center gap-1 text-electric-purple">
                   <Trophy size={10} /> Achieved: {formatDate(task.completedAt)}
                 </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-electric-cyan transition-colors p-1"
              title="Edit Task"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button 
            onClick={() => onDelete(task.id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Timer Section for In-Progress */}
      {task.status === TaskStatus.IN_PROGRESS && (
        <TimerDisplay 
          task={task} 
          onToggle={onToggleTimer} 
          onReset={onResetTimer} 
        />
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-2">
        {task.status === TaskStatus.TODO && (
          <button
            onClick={() => onMove(task.id, TaskStatus.IN_PROGRESS)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-electric-cyan bg-electric-cyan/10 hover:bg-electric-cyan/20 rounded-lg transition-colors"
          >
            Start Working <ArrowRight size={14} />
          </button>
        )}
        
        {task.status === TaskStatus.IN_PROGRESS && (
          <button
            onClick={() => onMove(task.id, TaskStatus.DONE)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-400 bg-green-400/10 hover:bg-green-400/20 rounded-lg transition-colors"
          >
            Complete <CheckCircle2 size={14} />
          </button>
        )}

        {task.status === TaskStatus.DONE && (
          <button
            onClick={() => onMove(task.id, TaskStatus.TODO)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2"
          >
            Reopen
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: number;
  startedAt?: number; // Timestamp when moved to In-Progress
  completedAt?: number; // Timestamp when moved to Done
  
  // Timer related properties
  elapsedTime: number; // Total accumulated time in milliseconds (excluding current session)
  isTimerRunning: boolean;
  lastTimerStartTime?: number; // Timestamp of the most recent start/resume
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  isUrgent: boolean;
}

export type TimerAction = 'START' | 'PAUSE' | 'RESET';

import React from 'react';
import { Task, TaskStatus } from '../types';
import { Medal, Trophy, Star } from 'lucide-react';

interface AchievementsHeaderProps {
  tasks: Task[];
}

export const AchievementsHeader: React.FC<AchievementsHeaderProps> = ({ tasks }) => {
  const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);
  const totalMs = doneTasks.reduce((acc, t) => acc + (t.elapsedTime || 0), 0);
  const totalHours = (totalMs / (1000 * 60 * 60)).toFixed(1);
  const count = doneTasks.length;

  let BadgeIcon = Star;
  let badgeColor = "text-gray-500";
  let badgeName = "Rookie";
  
  if (count >= 30 || totalHours as any > 50) {
    BadgeIcon = Trophy;
    badgeColor = "text-yellow-400";
    badgeName = "Gold";
  } else if (count >= 10 || totalHours as any > 10) {
    BadgeIcon = Medal;
    badgeColor = "text-gray-300";
    badgeName = "Silver";
  } else if (count >= 1) {
    BadgeIcon = Medal;
    badgeColor = "text-orange-400";
    badgeName = "Bronze";
  }

  return (
    <div className="mb-4 bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Focus</p>
        <p className="text-2xl font-mono font-bold text-electric-cyan">{totalHours} <span className="text-sm text-gray-500">hrs</span></p>
      </div>
      <div className="flex flex-col items-end">
        <BadgeIcon className={`w-8 h-8 ${badgeColor} mb-1 drop-shadow-glow`} />
        <span className={`text-xs font-bold uppercase ${badgeColor} tracking-wider`}>{badgeName}</span>
      </div>
    </div>
  );
};

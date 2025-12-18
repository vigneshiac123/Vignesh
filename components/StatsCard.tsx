import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, trendUp, color = 'indigo' }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${trendUp ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
    </div>
  );
};
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  packets: number;
  alerts: number;
}

interface NetworkChartProps {
  data: ChartData[];
}

export const NetworkChart: React.FC<NetworkChartProps> = ({ data }) => {
  return (
    <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Network Traffic Volume (Last 60s)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10} 
              tickMargin={10} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="packets" 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorPackets)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="alerts" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorAlerts)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
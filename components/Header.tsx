import React from 'react';
import { Shield, Activity, Wifi } from 'lucide-react';

export const Header: React.FC<{ running: boolean; toggleRunning: () => void }> = ({ running, toggleRunning }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">CyberGuard <span className="text-indigo-400">NIDS</span></h1>
          <p className="text-xs text-slate-400 font-mono">Real-Time Intrusion Detection System</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
          <Wifi className={`w-4 h-4 ${running ? 'text-green-500 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-mono text-slate-300">{running ? 'CAPTURING' : 'PAUSED'}</span>
        </div>
        
        <button
          onClick={toggleRunning}
          className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
            running 
              ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
              : 'bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20'
          }`}
        >
          {running ? 'Stop Capture' : 'Start Capture'}
        </button>
      </div>
    </header>
  );
};
import React, { useState } from 'react';
import { Alert, Severity } from '../types';
import { AlertTriangle, ShieldAlert, XCircle, Activity, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';
import { analyzeAlertWithGemini } from '../services/geminiService';

interface AlertFeedProps {
  alerts: Alert[];
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts }) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return 'text-red-500 border-red-500/50 bg-red-500/10';
      case Severity.HIGH: return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case Severity.MEDIUM: return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      case Severity.LOW: return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
      default: return 'text-slate-500 border-slate-500/50 bg-slate-500/10';
    }
  };

  const handleAiAnalysis = async (alert: Alert) => {
    if (aiAnalysis[alert.id]) {
      setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id);
      return;
    }
    
    setLoadingAi(alert.id);
    setSelectedAlertId(alert.id);
    
    const analysis = await analyzeAlertWithGemini(alert);
    
    setAiAnalysis(prev => ({ ...prev, [alert.id]: analysis }));
    setLoadingAi(null);
  };

  // Sort alerts by timestamp desc
  const sortedAlerts = [...alerts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl h-[400px] flex flex-col">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-red-900/5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Intrusion Alerts
        </h2>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
            <ShieldAlert className="w-12 h-12 mb-2" />
            <p>No active threats detected</p>
          </div>
        ) : (
          sortedAlerts.map(alert => (
            <div key={alert.id} className="group">
              <div className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${getSeverityColor(alert.severity)}`}>
                <div className="mt-1">
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm uppercase tracking-wide">{alert.type}</h3>
                    <span className="text-[10px] opacity-75 font-mono">
                      {format(alert.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{alert.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[10px] font-mono opacity-75">
                      SRC: <span className="font-bold">{alert.srcIp}</span> ➔ TGT: {alert.targetIp}
                    </div>
                    
                    <button 
                      onClick={() => handleAiAnalysis(alert)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900/50 hover:bg-slate-900/80 px-2 py-1 rounded transition-colors"
                    >
                      <BrainCircuit className="w-3 h-3" />
                      {loadingAi === alert.id ? 'Analyzing...' : 'AI Analysis'}
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Analysis Drawer */}
              {selectedAlertId === alert.id && (
                <div className="mt-2 ml-8 p-3 bg-slate-800/80 rounded border border-slate-700 text-sm text-slate-300 animate-in slide-in-from-top-2 fade-in duration-200">
                  <h4 className="text-indigo-400 font-bold text-xs mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" />
                    GEMINI AI INSIGHTS
                  </h4>
                  {loadingAi === alert.id ? (
                     <div className="flex items-center gap-2 text-slate-500">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75" />
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" />
                     </div>
                  ) : (
                    <div className="prose prose-invert prose-xs max-w-none">
                       {/* Basic markdown rendering for simple list support */}
                       {aiAnalysis[alert.id].split('\n').map((line, i) => (
                         <p key={i} className="mb-1 leading-relaxed">
                           {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^#+\s/, '')}
                         </p>
                       ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
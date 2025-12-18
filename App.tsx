import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { TrafficLog } from './components/TrafficLog';
import { AlertFeed } from './components/AlertFeed';
import { NetworkChart } from './components/NetworkChart';
import { generatePacket } from './services/trafficSimulator';
import { analyzeTraffic } from './services/detectionEngine';
import { Packet, Alert, AttackType } from './types';
import { Activity, Radio, Shield, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { SIMULATION_INTERVAL_MS, HISTORY_LIMIT } from './constants';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<{ time: string; packets: number; alerts: number }[]>([]);
  const [totalPackets, setTotalPackets] = useState(0);
  
  // Use Refs for mutable data in the interval to avoid dependency loops
  const packetsRef = useRef<Packet[]>([]);
  const alertsRef = useRef<Alert[]>([]);

  const simulationLoop = useCallback(() => {
    if (!isRunning) return;

    // 1. Generate Traffic (Variable burst size)
    const burstSize = Math.floor(Math.random() * 3) + 1; // 1-3 packets per tick
    const newPackets: Packet[] = [];
    
    for (let i = 0; i < burstSize; i++) {
       newPackets.push(generatePacket());
    }

    // 2. Update Packet State
    packetsRef.current = [...newPackets, ...packetsRef.current].slice(0, HISTORY_LIMIT);
    
    // 3. Run Detection Engine
    // We only analyze the "new" packets combined with recent history for context
    const recentHistory = packetsRef.current.slice(0, 500); // Analyze last 500
    const newAlerts = analyzeTraffic(newPackets, recentHistory);

    // Dedup alerts: Avoid adding same alert type for same IP in last 5 seconds
    const uniqueNewAlerts = newAlerts.filter(na => {
       const recentSame = alertsRef.current.find(ea => 
         ea.type === na.type && 
         ea.srcIp === na.srcIp && 
         (na.timestamp - ea.timestamp < 5000)
       );
       return !recentSame;
    });

    if (uniqueNewAlerts.length > 0) {
      alertsRef.current = [...uniqueNewAlerts, ...alertsRef.current].slice(0, 50);
    }

    // 4. Update UI State in batch
    setPackets([...packetsRef.current]); // Create new ref for React render
    setAlerts([...alertsRef.current]);
    setTotalPackets(prev => prev + burstSize);

    // 5. Update Chart Data (aggregated per second roughly)
    const nowStr = format(new Date(), 'HH:mm:ss');
    setChartData(prev => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint && lastPoint.time === nowStr) {
        // Update existing point
        const newPrev = [...prev];
        newPrev[newPrev.length - 1] = {
           ...lastPoint,
           packets: lastPoint.packets + burstSize,
           alerts: lastPoint.alerts + uniqueNewAlerts.length
        };
        return newPrev;
      } else {
        // New point
        return [...prev.slice(-20), { time: nowStr, packets: burstSize, alerts: uniqueNewAlerts.length }];
      }
    });

  }, [isRunning]);

  useEffect(() => {
    const interval = setInterval(simulationLoop, SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [simulationLoop]);

  // Handler to inject specific attacks manually for demo
  const triggerAttack = (type: AttackType) => {
    if (!isRunning) setIsRunning(true);
    // Inject 10 attack packets immediately
    const attackPackets = Array.from({ length: 15 }, () => generatePacket(type));
    packetsRef.current = [...attackPackets, ...packetsRef.current].slice(0, HISTORY_LIMIT);
    setPackets([...packetsRef.current]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-10">
      <Header running={isRunning} toggleRunning={() => setIsRunning(!isRunning)} />

      <main className="container mx-auto px-4 pt-6 max-w-7xl">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Total Packets" 
            value={totalPackets.toLocaleString()} 
            icon={<Activity className="w-5 h-5" />}
            trend="+12/s"
          />
          <StatsCard 
            title="Active Threats" 
            value={alerts.length} 
            icon={<Shield className="w-5 h-5" />}
            trend={alerts.length > 0 ? "CRITICAL" : "SAFE"}
            trendUp={alerts.length > 0}
          />
          <StatsCard 
            title="Network Load" 
            value={`${Math.floor(Math.random() * 30) + 20} Mbps`} 
            icon={<Radio className="w-5 h-5" />}
          />
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col justify-center">
             <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Simulate Attack</h3>
             <div className="flex gap-2">
               <button onClick={() => triggerAttack(AttackType.PORT_SCAN)} className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-300 text-xs py-2 px-1 rounded transition">Port Scan</button>
               <button onClick={() => triggerAttack(AttackType.BRUTE_FORCE)} className="flex-1 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-800 text-orange-300 text-xs py-2 px-1 rounded transition">Brute Force</button>
             </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
           {/* Left: Traffic Chart & Alerts */}
           <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex-1 min-h-[250px]">
                <NetworkChart data={chartData} />
              </div>
              <div className="flex-1 min-h-[300px]">
                <TrafficLog packets={packets} />
              </div>
           </div>

           {/* Right: Alert Feed */}
           <div className="lg:col-span-1 h-full">
              <AlertFeed alerts={alerts} />
           </div>
        </div>
        
        {/* Info Section */}
        <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
           <h2 className="text-xl font-bold text-white mb-4">How it Works</h2>
           <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
             <div>
               <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Zap className="w-4 h-4"/> 1. Traffic Capture</h3>
               <p>Simulates a raw socket interface (like AF_PACKET in Python) to capture TCP/UDP/ICMP packets in real-time. In a real deployment, this would use <code>libpcap</code>.</p>
             </div>
             <div>
               <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> 2. Anomaly Detection</h3>
               <p>Uses a statistical heuristic engine. It analyzes packet frequency, flag combinations (e.g., SYN-ACK ratio), and payload signatures to identify patterns like <strong>SYN Floods</strong> or <strong>SSH Brute Forcing</strong>.</p>
             </div>
             <div>
               <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4"/> 3. AI Analysis</h3>
               <p>Integrates with Google Gemini 2.5 Flash to provide context-aware analysis of detected alerts, offering explanation and immediate mitigation commands (e.g., <code>iptables</code> rules).</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
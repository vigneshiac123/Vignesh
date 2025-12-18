import React, { useRef, useEffect } from 'react';
import { Packet, Protocol } from '../types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

interface TrafficLogProps {
  packets: Packet[];
}

const ProtocolBadge: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
  const colors = {
    [Protocol.TCP]: 'bg-blue-900/30 text-blue-400 border-blue-800',
    [Protocol.UDP]: 'bg-orange-900/30 text-orange-400 border-orange-800',
    [Protocol.ICMP]: 'bg-green-900/30 text-green-400 border-green-800',
    [Protocol.HTTP]: 'bg-purple-900/30 text-purple-400 border-purple-800',
    [Protocol.HTTPS]: 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
    [Protocol.SSH]: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono border rounded ${colors[protocol]}`}>
      {protocol}
    </span>
  );
};

export const TrafficLog: React.FC<TrafficLogProps> = ({ packets }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only if already near bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packets]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Live Packet Capture</h2>
        <span className="text-xs text-slate-500 font-mono">{packets.length} packets buffered</span>
      </div>
      
      <div className="flex-1 overflow-auto p-0" ref={scrollRef}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/80 sticky top-0 text-xs uppercase text-slate-400 font-mono">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Source</th>
              <th className="p-3">Dest</th>
              <th className="p-3">Proto</th>
              <th className="p-3">Len</th>
              <th className="p-3">Info</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono divide-y divide-slate-800/50">
            {packets.map((pkt) => (
              <tr key={pkt.id} className={`hover:bg-slate-800/30 transition-colors ${pkt.suspicious ? 'bg-red-900/10' : ''}`}>
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  {format(pkt.timestamp, 'HH:mm:ss.SSS')}
                </td>
                <td className="p-3 text-cyan-300">
                  {pkt.srcIp}:{pkt.srcPort}
                </td>
                <td className="p-3 text-indigo-300">
                  {pkt.dstIp}:{pkt.dstPort}
                </td>
                <td className="p-3">
                  <ProtocolBadge protocol={pkt.protocol} />
                </td>
                <td className="p-3 text-slate-400">{pkt.length}</td>
                <td className={`p-3 truncate max-w-[200px] ${pkt.suspicious ? 'text-red-400' : 'text-slate-500'}`}>
                  [{pkt.flags.join(',')}] {pkt.payload}
                </td>
              </tr>
            ))}
            {packets.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-600 italic">
                  Waiting for traffic...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
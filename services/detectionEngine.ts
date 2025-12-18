import { Packet, Alert, AttackType, Severity, Protocol } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Simple heuristic-based detection engine
export const analyzeTraffic = (packets: Packet[], recentPackets: Packet[]): Alert[] => {
  const alerts: Alert[] = [];
  const now = Date.now();
  const windowMs = 2000; // Look at last 2 seconds for high frequency attacks

  // Group by Source IP
  const packetsBySrc = recentPackets.reduce((acc, pkt) => {
    if (!acc[pkt.srcIp]) acc[pkt.srcIp] = [];
    acc[pkt.srcIp].push(pkt);
    return acc;
  }, {} as Record<string, Packet[]>);

  Object.entries(packetsBySrc).forEach(([srcIp, pkts]) => {
    // 1. Detect Port Scanning
    // Rule: Single Source contacting > 5 distinct ports in < 2 seconds
    const distinctPorts = new Set(pkts.map(p => p.dstPort));
    if (distinctPorts.size > 5) {
      alerts.push({
        id: uuidv4(),
        timestamp: now,
        type: AttackType.PORT_SCAN,
        severity: Severity.MEDIUM,
        srcIp,
        targetIp: pkts[0].dstIp, // Assuming scanning one target mostly
        description: `Detected rapid connection attempts to ${distinctPorts.size} different ports.`,
        count: pkts.length
      });
    }

    // 2. Detect SYN Flood
    // Rule: High volume of SYN packets with no corresponding traffic, mostly TCP
    const synPackets = pkts.filter(p => p.flags.includes('SYN') && !p.flags.includes('ACK'));
    if (synPackets.length > 15) {
      alerts.push({
        id: uuidv4(),
        timestamp: now,
        type: AttackType.SYN_FLOOD,
        severity: Severity.HIGH,
        srcIp,
        targetIp: pkts[0].dstIp,
        description: `Abnormal volume of SYN packets (${synPackets.length}) detected. Possible DoS attempt.`,
        count: synPackets.length
      });
    }

    // 3. Detect SSH Brute Force
    // Rule: Repeated SSH traffic with similar payload size (auth attempts)
    const sshPackets = pkts.filter(p => p.protocol === Protocol.SSH && p.dstPort === 22);
    if (sshPackets.length > 8) {
      alerts.push({
        id: uuidv4(),
        timestamp: now,
        type: AttackType.BRUTE_FORCE,
        severity: Severity.CRITICAL,
        srcIp,
        targetIp: pkts[0].dstIp,
        description: `Multiple SSH connection attempts (${sshPackets.length}) detected in short duration.`,
        count: sshPackets.length
      });
    }

     // 4. SQL Injection Signature (Simple Payload Check)
     const sqli = pkts.find(p => p.payload?.includes("' OR '1'='1"));
     if (sqli) {
       alerts.push({
         id: uuidv4(),
         timestamp: now,
         type: AttackType.SQL_INJECTION,
         severity: Severity.HIGH,
         srcIp,
         targetIp: sqli.dstIp,
         description: "SQL Injection signature detected in HTTP payload.",
         count: 1
       });
     }
  });

  return alerts;
};
export enum Protocol {
  TCP = 'TCP',
  UDP = 'UDP',
  ICMP = 'ICMP',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  SSH = 'SSH'
}

export enum AttackType {
  NONE = 'Normal',
  PORT_SCAN = 'Port Scan',
  SYN_FLOOD = 'SYN Flood',
  BRUTE_FORCE = 'Brute Force',
  MALWARE_C2 = 'Malware C2',
  SQL_INJECTION = 'SQL Injection'
}

export enum Severity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Packet {
  id: string;
  timestamp: number;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  length: number; // bytes
  flags: string[]; // e.g., SYN, ACK, FIN
  payload?: string;
  suspicious: boolean;
}

export interface Alert {
  id: string;
  timestamp: number;
  type: AttackType;
  severity: Severity;
  srcIp: string;
  targetIp: string;
  description: string;
  count: number; // How many packets triggered this
  aiAnalysis?: string; // Filled by Gemini
}

export interface TrafficStats {
  totalPackets: number;
  bytesTransferred: number;
  packetsPerSecond: number;
  activeConnections: number;
}
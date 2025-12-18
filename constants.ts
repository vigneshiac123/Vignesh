export const SIMULATION_INTERVAL_MS = 200; // Generate packets every 200ms
export const HISTORY_LIMIT = 500; // Keep last 500 packets in memory
export const CHART_POINTS = 30; // Seconds of history on chart

export const LOCAL_NET_PREFIX = '192.168.1.';
export const EXTERNAL_NET_PREFIXES = ['104.21.', '172.67.', '45.33.', '185.199.', '203.0.', '8.8.'];

// Known malicious IPs for simulation
export const THREAT_IPS = [
  '45.33.22.11', // Known scanner
  '185.199.11.22', // C2 Server
  '203.0.113.5' // Botnet
];

export const COMMON_PORTS = [80, 443, 22, 53, 3306, 8080, 21];

export const ATTACK_PATTERNS = {
  PORT_SCAN_SPEED: 50, // ms between packets
  BRUTE_FORCE_ATTEMPTS: 5,
  SYN_FLOOD_THRESHOLD: 100 // packets per second
};
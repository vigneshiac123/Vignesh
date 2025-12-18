import { Packet, Protocol, AttackType } from '../types';
import { LOCAL_NET_PREFIX, EXTERNAL_NET_PREFIXES, COMMON_PORTS, THREAT_IPS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Helper to get random item
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomIp = (prefix: string) => `${prefix}${randomInt(1, 254)}`;

let packetCounter = 0;

export const generatePacket = (forceAttack?: AttackType): Packet => {
  packetCounter++;
  const now = Date.now();
  const isIncoming = Math.random() > 0.3; // 70% incoming traffic

  let srcIp: string;
  let dstIp: string;
  let protocol = randomChoice(Object.values(Protocol));
  let srcPort = randomInt(1024, 65535);
  let dstPort = randomChoice(COMMON_PORTS);
  let flags: string[] = ['ACK'];
  let payload = 'DATA';
  let suspicious = false;

  if (isIncoming) {
    srcIp = randomIp(randomChoice(EXTERNAL_NET_PREFIXES));
    dstIp = randomIp(LOCAL_NET_PREFIX);
  } else {
    srcIp = randomIp(LOCAL_NET_PREFIX);
    dstIp = randomIp(randomChoice(EXTERNAL_NET_PREFIXES));
  }

  // SIMULATE ATTACKS
  const attackRoll = Math.random();
  const activeAttack = forceAttack || (attackRoll < 0.05 ? randomChoice(Object.values(AttackType)) : AttackType.NONE);

  if (activeAttack !== AttackType.NONE) {
    suspicious = true;
    switch (activeAttack) {
      case AttackType.PORT_SCAN:
        srcIp = THREAT_IPS[0]; // Specific attacker
        dstPort = randomInt(20, 1000); // Random low ports
        flags = ['SYN'];
        protocol = Protocol.TCP;
        payload = '';
        break;
      case AttackType.SYN_FLOOD:
        srcIp = THREAT_IPS[1];
        flags = ['SYN'];
        protocol = Protocol.TCP;
        break;
      case AttackType.BRUTE_FORCE:
        srcIp = THREAT_IPS[2];
        dstPort = 22; // SSH
        protocol = Protocol.SSH;
        payload = 'AUTH_REQUEST';
        break;
      case AttackType.SQL_INJECTION:
        dstPort = 80;
        protocol = Protocol.HTTP;
        payload = "' OR '1'='1";
        break;
      default:
        suspicious = false;
    }
  }

  // Normal Traffic Variations
  if (!suspicious) {
    if (protocol === Protocol.HTTPS) {
      dstPort = 443;
      flags.push('PSH');
      payload = 'ENCRYPTED_DATA';
    } else if (protocol === Protocol.HTTP) {
      dstPort = 80;
      payload = 'GET /index.html';
    }
  }

  return {
    id: uuidv4(),
    timestamp: now,
    srcIp,
    dstIp,
    srcPort,
    dstPort,
    protocol,
    length: randomInt(64, 1500),
    flags,
    payload,
    suspicious
  };
};
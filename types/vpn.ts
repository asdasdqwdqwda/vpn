export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

export interface VpnServer {
  id: string;
  name: string;
  location: string;
  protocol: 'TCP' | 'UDP';
  port: number;
  ping: number;
  load: number;
  premium: boolean;
  flag: string;
  priority?: number;
  speed?: string;
}

export interface VpnConfig {
  client: string;
  dev: string;
  proto: string;
  remote: string;
  port: number;
  priority?: number;
  ca: string;
  cert: string;
  key: string;
}

export interface ConnectionStats {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  duration: number;
  speed: {
    download: number;
    upload: number;
  };
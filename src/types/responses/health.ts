/**
 * Health controller response interfaces
 */

export interface ServerStatus {
  status: 'OK' | 'ERROR';
  timestamp: string;
  services: {
    server: 'running' | 'stopped';
    redis: 'connected' | 'disconnected';
    websocket: 'active' | 'inactive';
  };
  error?: string;
}

export interface PingResponse {
  message: string;
  timestamp: string;
}

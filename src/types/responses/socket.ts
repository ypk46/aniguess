/**
 * Socket/WebSocket response interfaces
 */

export interface WelcomeMessage {
  message: string;
  socketId: string;
  timestamp: string;
}

export interface PongMessage {
  timestamp: string;
}

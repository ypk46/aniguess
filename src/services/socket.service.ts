import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import {
  WelcomeMessage,
  SocketMessage,
  PongMessage,
} from '../types/responses/socket';

/**
 * Socket Service
 * Handles WebSocket connections and events
 */
export class SocketService {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    // Initialize Socket.IO with CORS configuration
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.initializeSocketHandlers();
  }

  /**
   * Initialize all socket event handlers
   */
  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket: Socket): void => {
      console.log(`Client connected: ${socket.id}`);

      this.handleConnection(socket);
      this.handleMessages(socket);
      this.handlePing(socket);
      this.handleDisconnection(socket);
      this.handleErrors(socket);
    });
  }

  /**
   * Handle new client connections
   */
  private handleConnection(socket: Socket): void {
    // Send welcome message
    const welcomeMessage: WelcomeMessage = {
      message: 'Connected to AniGuess server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    };

    socket.emit('welcome', welcomeMessage);
  }

  /**
   * Handle client messages
   */
  private handleMessages(socket: Socket): void {
    socket.on('message', (data: unknown): void => {
      console.log(`Message from ${socket.id}:`, data);

      // Echo the message back to the sender
      const messageResponse: SocketMessage = {
        echo: true,
        originalMessage: data,
        timestamp: new Date().toISOString(),
      };

      socket.emit('message', messageResponse);
    });
  }

  /**
   * Handle ping/pong for connection testing
   */
  private handlePing(socket: Socket): void {
    socket.on('ping', (): void => {
      const pongMessage: PongMessage = {
        timestamp: new Date().toISOString(),
      };

      socket.emit('pong', pongMessage);
    });
  }

  /**
   * Handle client disconnections
   */
  private handleDisconnection(socket: Socket): void {
    socket.on('disconnect', (reason: string): void => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  }

  /**
   * Handle connection errors
   */
  private handleErrors(socket: Socket): void {
    socket.on('error', (error: Error): void => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Send a message to a specific socket
   */
  public sendToSocket(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Get the number of connected clients
   */
  public getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Close all socket connections
   */
  public close(): void {
    this.io.close();
  }
}

// Export factory function to create socket service
export function createSocketService(server: HttpServer): SocketService {
  return new SocketService(server);
}

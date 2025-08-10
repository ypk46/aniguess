import { SocketService } from './socket.service';

/**
 * Socket Registry - Singleton to manage socket service instance
 * This prevents circular dependencies by providing a central registry
 */
class SocketRegistry {
  private static instance: SocketRegistry;
  private socketService: SocketService | null = null;

  private constructor() {}

  public static getInstance(): SocketRegistry {
    if (!SocketRegistry.instance) {
      SocketRegistry.instance = new SocketRegistry();
    }
    return SocketRegistry.instance;
  }

  public setSocketService(socketService: SocketService): void {
    this.socketService = socketService;
  }

  public getSocketService(): SocketService {
    if (!this.socketService) {
      throw new Error(
        'SocketService has not been initialized. Make sure to call setSocketService() first.'
      );
    }
    return this.socketService;
  }

  public isInitialized(): boolean {
    return this.socketService !== null;
  }
}

export const socketRegistry = SocketRegistry.getInstance();

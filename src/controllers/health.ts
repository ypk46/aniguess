import { Request, Response } from 'express';
import redisClient from '../config/redis';
import { ServerStatus, PingResponse } from '../types/responses/health';

export class HealthController {
  constructor() {
    this.getHealthStatus = this.getHealthStatus.bind(this);
    this.ping = this.ping.bind(this);
  }

  /**
   * Health check endpoint.
   */
  public async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      await redisClient.ping();

      const healthResponse: ServerStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
          server: 'running',
          redis: 'connected',
          websocket: 'active',
        },
      };

      res.status(200).json(healthResponse);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const errorResponse: ServerStatus = {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: errorMessage,
        services: {
          server: 'running',
          redis: 'disconnected',
          websocket: 'active',
        },
      };

      res.status(503).json(errorResponse);
    }
  }

  /**
   * Ping endpoint.
   */
  public ping(req: Request, res: Response): void {
    const pingResponse: PingResponse = {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(pingResponse);
  }
}

export const healthController = new HealthController();

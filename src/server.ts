import 'reflect-metadata';
import express, { Request, Response, NextFunction, Application } from 'express';
import http from 'http';
import cors from 'cors';
import redisClient from './config/redis';
import { initializeDatabase, closeDatabase } from './config/database';
import { serverConfig } from './config';
import { routes } from './routes';
import { createSocketService, SocketService } from './services';
import { ErrorResponse } from './types/responses';

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket service
const socketService: SocketService = createSocketService(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use('/', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Server error:', err);

  const errorResponse: ErrorResponse = {
    status: 'ERROR',
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(errorResponse);
});

// Start server
async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // Test Redis connection
    await redisClient.connect();
    console.log('✅ Redis connected successfully');

    server.listen(serverConfig.port, (): void => {
      console.log(`🚀 Server running on port ${serverConfig.port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`💾 Database connected (PostgreSQL)`);
      console.log(
        `🩺 Health check: http://localhost:${serverConfig.port}/health`
      );
      console.log(`🌐 API: http://localhost:${serverConfig.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('Shutting down gracefully...');
  server.close(async (): Promise<void> => {
    try {
      await closeDatabase();
      await redisClient.quit();
      console.log('✅ All connections closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer().catch((error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, server, socketService };

import { createClient, RedisClientType } from 'redis';
import { redisConfig } from './index';

// Create Redis client with centralized configuration
const redisClient: RedisClientType = createClient({
  url: redisConfig.url,
  socket: {
    reconnectStrategy: (retries: number) => {
      // Reconnect after max 3 seconds
      return Math.min(retries * 100, 3000);
    },
  },
});

// Error handling
redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('end', () => {
  console.log('Redis Client Disconnected');
});

export default redisClient;

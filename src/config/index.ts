import { config as loadEnv } from 'dotenv';
import { ServerConfig, RedisConfig } from '../types/config';

// Load environment variables
loadEnv();

/**
 * Centralized configuration object
 * All environment variables should be accessed through this config
 */
class Config {
  // Server configuration
  public readonly port: number;
  public readonly nodeEnv: string;

  // Redis configuration
  public readonly redis: RedisConfig;

  constructor() {
    // Server settings
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.nodeEnv = process.env.NODE_ENV || 'development';

    // Redis settings
    this.redis = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retryDelayOnFailover: parseInt(
        process.env.REDIS_RETRY_DELAY || '100',
        10
      ),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
    };

    // Validate required configuration
    this.validate();
  }

  /**
   * Validate configuration values
   */
  private validate(): void {
    if (this.port < 1 || this.port > 65535) {
      throw new Error(
        `Invalid port number: ${this.port}. Must be between 1 and 65535.`
      );
    }

    if (!this.redis.url) {
      throw new Error('Redis URL is required');
    }
  }

  /**
   * Get server configuration object (for backward compatibility)
   */
  public getServerConfig(): ServerConfig {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      redis: this.redis,
    };
  }

  /**
   * Check if running in production
   */
  public get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   */
  public get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Check if running in test
   */
  public get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

// Export singleton instance
export const config = new Config();

// Export individual config sections for convenience
export const serverConfig = config.getServerConfig();
export const redisConfig = config.redis;

// Export the class for testing purposes
export { Config };

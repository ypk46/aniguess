import { config as loadEnv } from 'dotenv';
import { ServerConfig, RedisConfig, DatabaseConfig } from '../types/config';

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

  // Database configuration
  public readonly database: DatabaseConfig;

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

    // Database settings
    this.database = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'aniguess',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true',
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
      database: this.database,
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
export const databaseConfig = config.database;

// Export the class for testing purposes
export { Config };

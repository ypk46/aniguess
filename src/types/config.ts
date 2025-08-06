export interface RedisConfig {
  url: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  ssl?: boolean;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  redis: RedisConfig;
  database: DatabaseConfig;
}

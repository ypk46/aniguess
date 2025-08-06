export interface RedisConfig {
  url: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  redis: RedisConfig;
}

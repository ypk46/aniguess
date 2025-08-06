import { DataSource } from 'typeorm';
import 'reflect-metadata';
import { config } from './src/config';

/**
 * TypeORM CLI configuration for migrations
 * This file is used by the TypeORM CLI to generate and run migrations
 */
export default new DataSource({
  type: 'postgres',
  ...config.database,
  entities: ['src/models/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  migrationsTableName: 'migrations',
});

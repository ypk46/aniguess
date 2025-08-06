import { DataSource } from 'typeorm';
import { config } from './index';

/**
 * TypeORM DataSource configuration
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  ...config.database,
  entities: ['src/models/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  migrationsRun: false,
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error establishing database connection:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed successfully');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

// Export database configuration for external use
export const databaseConfig = config.database;

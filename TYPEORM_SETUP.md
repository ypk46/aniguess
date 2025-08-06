# TypeORM & PostgreSQL Setup

This document describes the TypeORM and PostgreSQL setup for the AniGuess project.

## Overview

The project now includes:

- TypeORM as the ORM for database operations
- PostgreSQL database support
- Repository pattern for database operations

## Database Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=aniguess
DB_PASSWORD=aniguess_dev_password
DB_NAME=aniguess_dev
DB_SYNCHRONIZE=false
DB_LOGGING=true
DB_SSL=false
```

## TypeORM Scripts

The following npm scripts are available:

```bash
# TypeORM CLI commands
npm run typeorm                                    # Run TypeORM CLI
npm run migration:generate src/migrations/<name>   # Generate migration
npm run migration:run                              # Run pending migrations
npm run migration:revert                           # Revert last migration
npm run schema:sync                                # Sync schema (development only)
npm run schema:drop                                # Drop all tables (careful!)
```

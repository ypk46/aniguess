# AniGuess

A wordle-inspired Anime guessing game with multiplayer support and real-time score visualization.

## Features

TBD

## Prerequisites

- Node.js v22+ (see `.nvmrc`)
- npm package manager
- Docker and Docker Compose (for containerized development)

## Installation

### Local Development

1. Clone the repository
2. Use the correct Node.js version:

   ```bash
   nvm use
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy environment configuration:

   ```bash
   cp .env.example .env
   ```

5. Start Redis and PostgreSQL:
   ```bash
   npm run docker:dev
   ```

## Running the Application

### Development mode (with auto-restart and TypeScript compilation):

```bash
npm run dev
```

### Build for production:

```bash
npm run build
```

### Production mode:

```bash
npm start
```

### Code formatting and linting:

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking only
npm run type-check
```

## Docker Development

### Quick Start with Docker

```bash
# Start Redis and PostgreSQL
npm run docker:dev

# Start with GUI tools (Redis Commander + pgAdmin)
npm run docker:dev:tools

# Stop services
npm run docker:dev:stop

# View logs
npm run docker:dev:logs

# Check status
npm run docker:dev:status

# Clean up everything
npm run docker:dev:cleanup
```

### Docker Services

When using `npm run docker:dev`, the following services are available:

- **Redis**: `localhost:6379`
- **PostgreSQL**: `localhost:5432`
  - Database: `aniguess_dev`
  - Username: `aniguess`
  - Password: `aniguess_dev_password`

### Using the Development Script

The `scripts/dev-env.sh` script provides convenient commands:

```bash
# Start environment
./scripts/dev-env.sh start

# Connect to Redis CLI
./scripts/dev-env.sh redis-cli

# Connect to PostgreSQL
./scripts/dev-env.sh postgres

# View help
./scripts/dev-env.sh help
```

## Production Deployment

### Building the Docker Image

```bash
npm run docker:build
```

### Deployment

TBD

## Project Structure

```
aniguess/
├── src/
│   ├── config/
│   │   └── redis.ts             # Redis configuration
│   ├── types/
│   │   ├── api.ts               # API response types
│   │   └── config.ts            # Configuration types
│   └── server.ts                # Main server file
├── scripts/
│   └── dev-env.sh              # Development environment manager
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-init.sh      # PostgreSQL initialization script
├── dist/                        # Compiled JavaScript output
├── .env                         # Environment variables
├── .env.example                # Environment template
├── .env.production.example     # Production environment template
├── .nvmrc                      # Node.js version
├── .prettierrc                 # Prettier configuration
├── .eslintrc.js               # ESLint configuration
├── tsconfig.json              # TypeScript configuration
├── Dockerfile                 # Production Docker image
├── .dockerignore              # Docker ignore file
├── docker-compose.dev.yml     # Development Docker Compose
├── docker-compose.prod.yml    # Production Docker Compose
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Testing the Setup

1. Run the setup verification script:

   ```bash
   ./test-setup.sh
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Test the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

## Troubleshooting

### Redis Connection Issues

- Ensure Redis server is running: `redis-cli ping`
- Check Redis URL in `.env` file
- Verify Redis server is accessible

### Port Already in Use

- Change the PORT in `.env` file
- Kill the process using the port: `lsof -ti:3000 | xargs kill`

## License

ISC

# AniGuess

A wordle-inspired Anime guessing game with multiplayer support and real-time score visualization.

## 🎮 Demo

**Play the game now:** [https://aniguess.onrender.com/](https://aniguess.onrender.com/)

## Features

- **Multiplayer Gameplay**: Up to 4 players can join a room and compete simultaneously
- **Real-time Communication**: Live updates using Socket.IO for seamless multiplayer experience
- **Character Guessing**: Guess anime characters based on detailed attribute feedback
- **Smart Hint System**: Get hints with color-coded feedback (correct, partial, higher/lower)
- **Multiple Anime Support**: Choose from a variety of popular anime series
- **Customizable Game Settings**:
  - Adjustable number of rounds (1-10)
  - Configurable round timers (30-300 seconds)
- **Visual Feedback**: Character images and detailed attribute comparisons
- **Score Tracking**: Complete scoring system with winner determination
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Room Management**: Easy room creation and joining with 6-character codes

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

The application is deployed on Render.com with the following configuration:

#### Backend Deployment

- **Service Type**: Web Service
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=3000`
  - `REDIS_URL` (provided by Render Redis add-on)
  - `DATABASE_URL` (provided by Render PostgreSQL add-on)

#### Frontend Deployment

- **Service Type**: Static Site
- **Build Command**: `cd web && npm install && npm run build`
- **Publish Directory**: `web/dist/aniguess-web`

#### Required Add-ons

- **Redis**: For session management and game state
- **PostgreSQL**: For persistent data storage

#### Environment Setup

1. Create a new web service on Render
2. Connect your GitHub repository
3. Add Redis and PostgreSQL add-ons
4. Set environment variables as listed above
5. Deploy the application

The application automatically handles database migrations and Redis setup on startup.

## Testing the Setup

1. Run the setup verification script:

   ```bash
   ./test-setup.sh
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Start the frontend development server (in a separate terminal):

   ```bash
   cd web
   npm install
   npm start
   ```

4. Test the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

5. Access the application:
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`

## Troubleshooting

### Redis Connection Issues

- Ensure Redis server is running: `redis-cli ping`
- Check Redis URL in `.env` file
- Verify Redis server is accessible

### Database Connection Issues

- Ensure PostgreSQL is running and accessible
- Check DATABASE_URL in `.env` file
- Run database migrations: `npm run migration:run`
- Verify database credentials and permissions

### Port Already in Use

- Change the PORT in `.env` file
- Kill the process using the port: `lsof -ti:3000 | xargs kill`

### Frontend Build Issues

- Clear node_modules: `rm -rf web/node_modules && cd web && npm install`
- Check Angular CLI version: `ng version`
- Rebuild: `cd web && npm run build`

### Docker Issues

- Clean up containers: `npm run docker:dev:cleanup`
- Rebuild containers: `docker-compose -f docker-compose.dev.yml build --no-cache`
- Check container logs: `npm run docker:dev:logs`

### Common Development Issues

1. **CORS Errors**: Ensure frontend proxy is configured correctly in `angular.json`
2. **Socket Connection Failed**: Check if backend server is running on correct port
3. **Character Images Not Loading**: Verify image URLs in database are accessible
4. **Game State Issues**: Clear Redis cache: `redis-cli FLUSHALL`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Commit your changes: `git commit -m "Add new feature"`
6. Push to the branch: `git push origin feature/new-feature`
7. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add appropriate error handling
- Test both frontend and backend changes
- Ensure responsive design for frontend changes
- Document new API endpoints

## License

ISC

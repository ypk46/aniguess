#!/bin/bash

# Docker development environment management script

set -e

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="aniguess-dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    print_success "Development environment started!"
    print_status "Services available:"
    echo "  • Redis: localhost:6379"
    echo "  • PostgreSQL: localhost:5432"
    echo "    - Database: aniguess_dev"
    echo "    - User: aniguess"
    echo "    - Password: aniguess_dev_password"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    print_success "Development environment stopped!"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting development environment..."
    stop_dev
    start_dev
}

# Function to show logs
show_logs() {
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f "${@:2}"
}

# Function to show status
show_status() {
    print_status "Development environment status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
}

# Function to clean up everything
cleanup() {
    print_warning "This will remove all containers, volumes, and networks for the development environment."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up development environment..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to connect to Redis CLI
redis_cli() {
    docker exec -it aniguess-redis redis-cli
}

# Function to connect to PostgreSQL
postgres_cli() {
    docker exec -it aniguess-postgres psql -U aniguess -d aniguess_dev
}

# Help function
show_help() {
    echo "AniGuess Development Environment Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start development environment"
    echo "  stop        Stop development environment"
    echo "  restart     Restart development environment"
    echo "  status      Show environment status"
    echo "  logs        Show logs (optionally for specific service)"
    echo "  cleanup     Remove all containers, volumes, and networks"
    echo "  redis-cli   Connect to Redis CLI"
    echo "  postgres    Connect to PostgreSQL CLI"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs redis"
    echo "  $0 postgres"
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    cleanup)
        cleanup
        ;;
    redis-cli)
        redis_cli
        ;;
    postgres)
        postgres_cli
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

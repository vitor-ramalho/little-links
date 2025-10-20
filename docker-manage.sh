#!/bin/bash

# Little Links - Docker Management Script
# Usage: ./docker-manage.sh [command] [environment]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  start-db        Start only the database services"
    echo "  stop-db         Stop the database services"
    echo "  start-dev       Start development environment (apps only)"
    echo "  start-prod      Start production environment (apps only)"
    echo "  start-full-dev  Start full development environment (db + apps)"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  logs            Show logs for all services"
    echo "  logs-db         Show database logs"
    echo "  logs-api        Show API logs"
    echo "  logs-web        Show web logs"
    echo "  build           Build all images"
    echo "  clean           Remove all containers and volumes"
    echo "  status          Show status of all services"
    echo ""
    echo "Examples:"
    echo "  $0 start-db                 # Start database only"
    echo "  $0 start-dev                # Start development apps (assumes DB running)"
    echo "  $0 start-full-dev           # Start everything for development"
    echo "  $0 start-prod               # Start production apps (assumes DB running)"
}

check_network() {
    if ! docker network inspect little-links-network >/dev/null 2>&1; then
        echo -e "${YELLOW}Creating little-links-network...${NC}"
        docker network create little-links-network
    fi
}

start_database() {
    echo -e "${BLUE}Starting database services...${NC}"
    check_network
    docker-compose -f docker-compose.db.yml up -d
    echo -e "${GREEN}Database services started!${NC}"
    echo -e "${YELLOW}PostgreSQL is available at localhost:5432${NC}"
    echo -e "${YELLOW}PgAdmin is available at http://localhost:5050${NC}"
    echo -e "${YELLOW}  - Email: admin@littlelinks.com${NC}"
    echo -e "${YELLOW}  - Password: admin123${NC}"
}

stop_database() {
    echo -e "${BLUE}Stopping database services...${NC}"
    docker-compose -f docker-compose.db.yml down
    echo -e "${GREEN}Database services stopped!${NC}"
}

start_development() {
    echo -e "${BLUE}Starting development application services...${NC}"
    check_network
    if [ -f .env ]; then
        docker-compose --env-file .env up -d
    else
        echo -e "${YELLOW}No .env file found, using default values...${NC}"
        docker-compose up -d
    fi
    echo -e "${GREEN}Development services started!${NC}"
    echo -e "${YELLOW}API is available at http://localhost:3000${NC}"
    echo -e "${YELLOW}Web app is available at http://localhost:3001${NC}"
}

start_production() {
    echo -e "${BLUE}Starting production application services...${NC}"
    check_network
    if [ ! -f .env ]; then
        echo -e "${RED}Error: .env file is required for production deployment${NC}"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml --env-file .env up -d
    echo -e "${GREEN}Production services started!${NC}"
    echo -e "${YELLOW}API is available at http://localhost:3000${NC}"
    echo -e "${YELLOW}Web app is available at http://localhost:3001${NC}"
}

start_full_development() {
    echo -e "${BLUE}Starting full development environment...${NC}"
    start_database
    sleep 10  # Wait for database to be ready
    start_development
}

stop_all() {
    echo -e "${BLUE}Stopping all services...${NC}"
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker-compose -f docker-compose.db.yml down 2>/dev/null || true
    echo -e "${GREEN}All services stopped!${NC}"
}

show_logs() {
    case $2 in
        "db")
            docker-compose -f docker-compose.db.yml logs -f
            ;;
        "api")
            docker-compose logs -f api 2>/dev/null || docker-compose -f docker-compose.prod.yml logs -f api
            ;;
        "web")
            docker-compose logs -f web 2>/dev/null || docker-compose -f docker-compose.prod.yml logs -f web
            ;;
        *)
            echo -e "${BLUE}Showing logs for all services...${NC}"
            docker-compose logs -f 2>/dev/null || docker-compose -f docker-compose.prod.yml logs -f
            ;;
    esac
}

build_images() {
    echo -e "${BLUE}Building all images...${NC}"
    docker-compose build
    docker-compose -f docker-compose.prod.yml build
    echo -e "${GREEN}All images built!${NC}"
}

clean_all() {
    echo -e "${RED}This will remove all containers, images, and volumes. Are you sure? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}Cleaning up...${NC}"
        stop_all
        docker-compose -f docker-compose.db.yml down -v --remove-orphans
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}Cleanup complete!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

show_status() {
    echo -e "${BLUE}Service Status:${NC}"
    echo ""
    echo "Database Services:"
    docker-compose -f docker-compose.db.yml ps
    echo ""
    echo "Application Services (Development):"
    docker-compose ps 2>/dev/null || echo "No development services running"
    echo ""
    echo "Application Services (Production):"
    docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "No production services running"
}

# Main command processing
case $1 in
    "start-db")
        start_database
        ;;
    "stop-db")
        stop_database
        ;;
    "start-dev")
        start_development
        ;;
    "start-prod")
        start_production
        ;;
    "start-full-dev")
        start_full_development
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        stop_all
        sleep 2
        start_full_development
        ;;
    "logs")
        show_logs $@
        ;;
    "logs-db")
        show_logs logs db
        ;;
    "logs-api")
        show_logs logs api
        ;;
    "logs-web")
        show_logs logs web
        ;;
    "build")
        build_images
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    *)
        print_usage
        exit 1
        ;;
esac

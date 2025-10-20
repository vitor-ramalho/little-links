#!/bin/bash

# Simple Docker management for Little Links

case $1 in
  "db")
    echo "Starting PostgreSQL database..."
    docker-compose -f docker-compose.database.yml up -d
    echo "Database is running on localhost:5432"
    echo "  - Database: little_link"
    echo "  - User: postgres"
    echo "  - Password: postgres"
    ;;
  
  "app")
    echo "Starting application..."
    docker-compose up -d
    echo "API is running on http://localhost:3000"
    ;;
  
  "stop")
    echo "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.database.yml down
    echo "All services stopped"
    ;;
  
  "logs")
    if [ "$2" = "db" ]; then
      docker-compose -f docker-compose.database.yml logs -f
    else
      docker-compose logs -f
    fi
    ;;
  
  *)
    echo "Usage: $0 {db|app|stop|logs}"
    echo ""
    echo "  db    - Start PostgreSQL database"
    echo "  app   - Start the application"
    echo "  stop  - Stop all services"
    echo "  logs  - Show application logs (use 'logs db' for database logs)"
    echo ""
    echo "Example workflow:"
    echo "  $0 db     # Start database first"
    echo "  $0 app    # Then start the application"
    echo "  $0 stop   # Stop everything when done"
    ;;
esac

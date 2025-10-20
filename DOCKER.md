# Docker Setup for Little Links

This project now has a simple, separated Docker setup:

## Files

- `docker-compose.database.yml` - PostgreSQL database only
- `docker-compose.yml` - Application services (API)
- `start.sh` - Simple management script

## Quick Start

1. **Start the database:**
   ```bash
   ./start.sh db
   ```

2. **Start the application:**
   ```bash
   ./start.sh app
   ```

3. **Stop everything:**
   ```bash
   ./start.sh stop
   ```

## Manual Commands

If you prefer using docker-compose directly:

```bash
# Start database
docker-compose -f docker-compose.database.yml up -d

# Start application
docker-compose up -d

# Stop everything
docker-compose down
docker-compose -f docker-compose.database.yml down
```

## Database Connection

- **Host:** localhost
- **Port:** 5432
- **Database:** little_link
- **Username:** postgres
- **Password:** postgres

## Services

- **Database:** http://localhost:5432
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs (Swagger)

## Development

The application service mounts your code as volumes, so changes will be reflected automatically during development.

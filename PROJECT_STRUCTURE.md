# Project Structure

The Little Link project is organized as follows:

## Root
- `docker-compose.yml` - Docker Compose configuration for running the application
- `.gitignore` - Git ignore file
- `README.md` - Main documentation

## API Directory
- `Dockerfile` - Container configuration for the API
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration

### Source Code (`src/`)
- `main.ts` - Application entry point
- `app.module.ts` - Root application module

#### Feature Modules
- `auth/` - Authentication and authorization
  - JWT-based authentication
  - User registration and login
  - Auth guards and strategies
  
- `users/` - User management 
  - User creation and retrieval
  - User entity and DTOs
  
- `links/` - URL shortening functionality
  - URL shortening logic
  - URL redirection and tracking
  - Link management (CRUD operations)

#### Supporting Files
- `common/` - Shared utilities, middleware and interfaces
  - Request interfaces
  - Performance monitoring middleware
  - System monitoring service
  
- `config/` - Application configuration
  - Database connection setup
  - Environment-based configuration

- `scripts/` - Production deployment scripts
  - Multi-core process management
  - System optimization scripts

## Database
The application uses PostgreSQL with the following entities:
- User - User accounts
- Link - Shortened URLs with owner relationships
- Analytics - Click tracking and statistics

## Architecture
The application follows a modular architecture with:
- Clear separation of concerns between modules
- TypeORM for database access
- NestJS dependency injection
- Route protection with JWT authentication
- Swagger/OpenAPI for API documentation

## Getting Started
See the README.md file for setup and usage instructions.

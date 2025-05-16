# Little Link API

This is the backend service for the Little Link URL shortener application, built with NestJS and TypeORM.

## Architecture

This API is built using the following technologies:

- **Framework**: NestJS 11+
- **Language**: TypeScript
- **Database ORM**: TypeORM with PostgreSQL
- **Authentication**: JWT-based authentication
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Project Structure

```
src/
├── app.module.ts             # Main application module
├── main.ts                   # Application entry point
├── auth/                     # Authentication module
│   ├── guards/               # JWT guards
│   └── strategies/           # JWT strategy
├── users/                    # User management
├── links/                    # URL shortening functionality
├── common/                   # Shared utilities
└── config/                   # Configuration files
```

## Database Schema

The application uses the following entities:

- **User**: Stores user authentication and profile data
- **Link**: Stores original URLs and their shortened codes
- **Analytics**: Records access statistics for each link

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode with cluster and vertical scaling
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=little_link

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRATION=3600

# App
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get a JWT token

### URL Management

- `POST /api/links` - Create a short URL (works with or without authentication)
- `GET /api/links` - List all URLs created by the authenticated user
- `PATCH /api/links/:id` - Update a URL's destination
- `DELETE /api/links/:id` - Delete a URL

### URL Redirection

- `GET /:shortCode` - Redirect to the original URL and track the visit

## Swagger Documentation

Swagger documentation is available at the `/docs` endpoint when the application is running.

## Performance Considerations

- The API implements proper caching headers
- Database queries are optimized
- Soft deletion is used instead of hard deletion
- JWT authentication minimizes database load

## Vertical Scaling Optimizations

Este projeto foi projetado para escalabilidade vertical, permitindo aproveitar recursos adicionais em um único servidor.

### Running in Production Cluster Mode

For production deployment with optimal vertical scaling:

```bash
# Build the application
npm run build

# Start in production cluster mode (recommended)
npm run start:prod
```

This starts the application using our advanced clustering implementation with:
- Automatic utilization of all available CPU cores
- Optimized memory settings
- Worker process health monitoring
- Automatic recovery from crashes
- Detailed performance logging to `scripts/cluster-log.txt`
- Dynamic resource allocation based on server capabilities

### Otimizações de Node.js
- Configuração do cluster Node.js para utilizar múltiplos núcleos de CPU
- Gerenciamento de memória otimizado com configurações de heap apropriadas
- Uso de streams para processamento eficiente de grandes conjuntos de dados

### Otimizações de Banco de Dados
- Pool de conexões configurável baseado nos recursos do servidor
- Índices otimizados para consultas frequentes
- Consultas parametrizadas e otimizadas

### Monitoramento e Ajuste
- Registros de desempenho para identificar gargalos
- Capacidade de ajuste de timeouts e limites de conexão
- Configurações ajustáveis via variáveis de ambiente

Para configurar o aplicativo para servidores maiores, ajuste as seguintes variáveis de ambiente:

```bash
# Para servidores com mais recursos
NODE_OPTIONS="--max-old-space-size=8192"  # Para servidores com 16GB+ RAM
DB_POOL_SIZE=50                          # Aumentar para servidores com mais recursos
```

## Security Measures

- All passwords are hashed using bcrypt
- JWT tokens have a configurable expiration time
- Input validation using class-validator
- Route protection with JWT guards

## Continuous Integration/Deployment

This project uses GitHub Actions for CI/CD with the following workflows:

- **Lint**: Runs ESLint to check code quality on both TypeScript and JavaScript files
- **Tests**: Runs Jest unit tests to verify functionality
- **Deploy**: Builds the application and prepares it for deployment

We also use Git hooks via Husky to ensure code quality:

- **pre-commit**: Runs linting and tests on staged files before allowing commits

## License

This project is [MIT licensed](LICENSE).

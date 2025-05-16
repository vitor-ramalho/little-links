# Little Link - URL Shortener

A URL shortener service built with NestJS, TypeORM, and PostgreSQL.

## Features

- User authentication and registration
- URL shortening with 6-character short codes
- URL analytics and click tracking
- User management of links (list, edit, delete)
- Soft deletion of records
- Multi-core optimization

## Prerequisites

- Node.js 22 or later
- Docker and Docker Compose (for local development)
- PostgreSQL 16 (standalone or via Docker)

## Local Development Setup

### Using Docker Compose (recommended)

1. Clone the repository
2. Create a `.env` file in the `api` directory based on the provided `.env.example`
3. Run Docker Compose:

```bash
docker-compose up
```

The API will be available at http://localhost:3000/api and the Swagger documentation at http://localhost:3000/docs

### Manual Setup

1. Clone the repository
2. Create a `.env` file in the `api` directory based on the provided `.env.example`
3. Install dependencies:

```bash
cd api
npm install
```

4. Make sure you have a PostgreSQL database running and update your `.env` file accordingly
5. Start the application in development mode:

```bash
npm run start:dev
```

### Running in Production Mode

1. Configure the environment and build the application:
```bash
cd api
npm run build
```

2. Run the application in production mode:
```bash
npm run start:prod
```

This will start the application using all available CPU cores with optimized settings.

### Monitoring

You can monitor the application using:

```bash
# View application logs
tail -f api/scripts/cluster-log.txt
```

## API Documentation

Once the application is running, you can access the Swagger documentation at http://localhost:3000/docs

## Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```

- `POST /api/auth/login` - Login and get a JWT token
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
  Response:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
  ```

### URL Shortening

- `POST /api/links` - Create a short URL
  ```json
  {
    "originalUrl": "https://example.com/very-long-url-that-needs-shortening"
  }
  ```
  Response:
  ```json
  {
    "id": "uuid-here",
    "originalUrl": "https://example.com/very-long-url-that-needs-shortening",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    "clicks": 0,
    "createdAt": "2023-11-01T12:00:00.000Z"
  }
  ```

- `GET /api/links` - List all URLs created by the authenticated user
  
  Requires: Authorization header with JWT token
  
  Response:
  ```json
  [
    {
      "id": "uuid-here",
      "originalUrl": "https://example.com/very-long-url",
      "shortCode": "abc123",
      "shortUrl": "http://localhost:3000/abc123",
      "clicks": 5,
      "createdAt": "2023-11-01T12:00:00.000Z"
    },
    {
      "id": "another-uuid",
      "originalUrl": "https://example.com/another-url",
      "shortCode": "def456",
      "shortUrl": "http://localhost:3000/def456",
      "clicks": 10,
      "createdAt": "2023-11-02T12:00:00.000Z"
    }
  ]
  ```

- `GET /api/links/:id` - Get a specific link by ID
  
  Requires: Authorization header with JWT token

- `PATCH /api/links/:id` - Update a URL's destination
  ```json
  {
    "originalUrl": "https://example.com/updated-url"
  }
  ```
  
  Requires: Authorization header with JWT token
  
- `DELETE /api/links/:id` - Delete a URL
  
  Requires: Authorization header with JWT token

### URL Redirection

- `GET /:shortCode` - Redirect to the original URL and track the visit
  
  This endpoint will:
  1. Look up the original URL in the database
  2. Record analytics (IP, user agent, referrer)
  3. Increment the click counter
  4. Redirect the user to the original URL
  
  Works without authentication

## System Design

The application is designed with the following considerations:

1. **Database Optimization**: Proper database indexing, query optimization, and connection pooling.
2. **Resource Utilization**: Efficient use of system resources including memory and CPU cores.
3. **Performance**: Asynchronous operations and optimized data processing.
4. **Error Handling**: Comprehensive error management and recovery mechanisms.
5. **Monitoring**: Built-in performance monitoring to identify bottlenecks.

## Future Improvements

- Custom short URL support
- Advanced analytics
- Role-based access control
- Rate limiting
- URL expiration
- QR code generation for short URLs

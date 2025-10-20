#!/bin/bash
set -e

# Create additional databases for testing if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create test database
    CREATE DATABASE little_link_test;
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE little_link TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE little_link_test TO postgres;
    
    -- Create extensions if needed
    \c little_link;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \c little_link_test;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "Database initialization completed!"

#!/bin/bash
# PostgreSQL Initial Setup Script
# This script creates the database and user for TaskFlow

# Default values
DB_HOST="${1:-localhost}"
DB_PORT="${2:-5432}"
DB_USER="taskflow_user"
DB_NAME="taskflow_dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not running or not accessible at $DB_HOST:$DB_PORT${NC}"
    echo "Please ensure PostgreSQL is running and try again."
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Prompt for password
echo ""
read -sp "Enter password for $DB_USER: " DB_PASSWORD
echo ""

# Create database
echo -e "\n${YELLOW}Creating database '$DB_NAME'...${NC}"
if ! psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
    createdb -U postgres -h "$DB_HOST" -p "$DB_PORT" -O postgres "$DB_NAME"
    echo -e "${GREEN}✓ Database '$DB_NAME' created${NC}"
else
    echo -e "${YELLOW}⚠ Database '$DB_NAME' already exists${NC}"
fi

# Create user/role
echo -e "\n${YELLOW}Creating user '$DB_USER'...${NC}"
if ! psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -tAc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1; then
    psql -U postgres -h "$DB_HOST" -p "$DB_PORT" << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF
    echo -e "${GREEN}✓ User '$DB_USER' created${NC}"
else
    echo -e "${YELLOW}⚠ User '$DB_USER' already exists${NC}"
    psql -U postgres -h "$DB_HOST" -p "$DB_PORT" << EOF
ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
    echo -e "${GREEN}✓ User password updated${NC}"
fi

# Grant schema privileges
echo -e "\n${YELLOW}Setting up schema privileges...${NC}"
psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" << EOF
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
ALTER SCHEMA public OWNER TO $DB_USER;
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;
EOF
echo -e "${GREEN}✓ Schema privileges granted${NC}"

# Create .env file
echo -e "\n${YELLOW}Creating .env file...${NC}"
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_DIALECT=postgres
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
EOF
echo -e "${GREEN}✓ .env file created${NC}"

# Test connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ Connection successful!${NC}"
    echo ""
    echo -e "${GREEN}✅ PostgreSQL setup complete!${NC}"
    echo ""
    echo "Connection Details:"
    echo "├─ Host: $DB_HOST"
    echo "├─ Port: $DB_PORT"
    echo "├─ User: $DB_USER"
    echo "├─ Database: $DB_NAME"
    echo "└─ Password: (saved to .env)"
else
    echo -e "${RED}✗ Connection failed!${NC}"
    exit 1
fi

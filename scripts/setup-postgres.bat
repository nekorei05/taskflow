@echo off
REM PostgreSQL Initial Setup Script for Windows
REM This script creates the database and user for TaskFlow

setlocal enabledelayedexpansion

REM Default values
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=taskflow_user
set DB_NAME=taskflow_dev

echo.
echo ========================================
echo PostgreSQL Setup for TaskFlow
echo ========================================
echo.

REM Check if PostgreSQL is running
echo Checking PostgreSQL connection...
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo Error: PostgreSQL is not running or not accessible at %DB_HOST%:%DB_PORT%
    echo Please ensure PostgreSQL is running and try again.
    pause
    exit /b 1
)
echo OK - PostgreSQL is running
echo.

REM Prompt for password
set /p DB_PASSWORD="Enter password for %DB_USER%: "
echo.

REM Create database
echo Creating database '%DB_NAME%'...
psql -U postgres -h %DB_HOST% -p %DB_PORT% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | find "1" >nul
if errorlevel 1 (
    createdb -U postgres -h %DB_HOST% -p %DB_PORT% -O postgres %DB_NAME%
    echo OK - Database '%DB_NAME%' created
) else (
    echo WARNING - Database '%DB_NAME%' already exists
)
echo.

REM Create user/role
echo Creating user '%DB_USER%'...
psql -U postgres -h %DB_HOST% -p %DB_PORT% -tAc "SELECT 1 FROM pg_user WHERE usename = '%DB_USER%'" | find "1" >nul
if errorlevel 1 (
    psql -U postgres -h %DB_HOST% -p %DB_PORT% << EOF
CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';
GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;
ALTER USER %DB_USER% CREATEDB;
EOF
    echo OK - User '%DB_USER%' created
) else (
    echo WARNING - User '%DB_USER%' already exists
    psql -U postgres -h %DB_HOST% -p %DB_PORT% << EOF
ALTER USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';
GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;
EOF
    echo OK - User password updated
)
echo.

REM Grant schema privileges
echo Setting up schema privileges...
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% << EOF
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %DB_USER%;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %DB_USER%;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO %DB_USER%;
ALTER SCHEMA public OWNER TO %DB_USER%;
GRANT USAGE ON SCHEMA public TO %DB_USER%;
GRANT CREATE ON SCHEMA public TO %DB_USER%;
EOF
echo OK - Schema privileges granted
echo.

REM Create .env file
echo Creating .env file...
(
    echo # Server Configuration
    echo PORT=5000
    echo NODE_ENV=development
    echo.
    echo # PostgreSQL Configuration
    echo DB_HOST=%DB_HOST%
    echo DB_PORT=%DB_PORT%
    echo DB_USER=%DB_USER%
    echo DB_PASSWORD=%DB_PASSWORD%
    echo DB_NAME=%DB_NAME%
    echo DB_DIALECT=postgres
    echo DB_SSL=false
    echo.
    echo # JWT Configuration
    echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
    echo JWT_EXPIRES_IN=15m
    echo JWT_REFRESH_SECRET=your_refresh_secret_key
    echo JWT_REFRESH_EXPIRES_IN=7d
    echo.
    echo # Rate Limiting
    echo RATE_LIMIT_WINDOW_MS=900000
    echo RATE_LIMIT_MAX=100
    echo.
    echo # CORS
    echo CLIENT_URL=http://localhost:3000
    echo.
    echo # Logging
    echo LOG_LEVEL=debug
) > .env
echo OK - .env file created
echo.

REM Test connection
echo Testing database connection...
setlocal
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "SELECT 1" >nul 2>&1
endlocal
if errorlevel 1 (
    echo ERROR: Connection failed!
    pause
    exit /b 1
) else (
    echo OK - Connection successful!
)

echo.
echo ========================================
echo PostgreSQL setup complete!
echo ========================================
echo.
echo Connection Details:
echo - Host: %DB_HOST%
echo - Port: %DB_PORT%
echo - User: %DB_USER%
echo - Database: %DB_NAME%
echo - Password: (saved to .env)
echo.
echo Next steps:
echo 1. npm install
echo 2. npm run dev
echo.
pause

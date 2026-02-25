#!/bin/bash
set -e

echo "=============================================="
echo "[entrypoint] DevOps Maturity Backend Startup"
echo "=============================================="

# Wait for PostgreSQL to be ready
echo "[entrypoint] Waiting for PostgreSQL..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if pg_isready -h postgres -p 5432 -U devops > /dev/null 2>&1; then
        echo "[entrypoint] PostgreSQL is ready!"
        break
    fi
    retry_count=$((retry_count + 1))
    echo "[entrypoint] PostgreSQL not ready yet (attempt $retry_count/$max_retries)..."
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "[entrypoint] ERROR: PostgreSQL did not become ready in time!"
    exit 1
fi

# Run database migrations
echo "[entrypoint] Running database migrations..."
alembic upgrade head
echo "[entrypoint] Migrations complete!"

# Run database initialization (admin user + frameworks)
echo "[entrypoint] Running database initialization..."
python -m app.scripts.init_database
echo "[entrypoint] Initialization complete!"

# Start the application
echo "[entrypoint] Starting FastAPI application..."
exec "$@"

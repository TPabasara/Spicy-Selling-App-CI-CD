#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h postgres -U spice_user -d spice_shop; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Run database migrations
echo "Running database migrations..."
cd /app
alembic upgrade head

# Initialize database with seed data
echo "Initializing database with seed data..."
python -m app.core.init_db

# Start the application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
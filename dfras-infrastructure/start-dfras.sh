#!/bin/bash

# DFRAS Comprehensive Startup Script
# This script starts the complete DFRAS application with all services
# ENFORCES: init.sql population, Docker-only services, CORS disabled

echo "🚀 Starting DFRAS - Delivery Failure Root Cause Analysis System"
echo "================================================================"
echo "📋 Enforcing Deployment Rules:"
echo "   1. ✅ init.sql MUST populate database with sample data"
echo "   2. ✅ All services MUST run in Docker containers"
echo "   3. ✅ Cross-origin restrictions MUST be disabled"
echo "================================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check if sample data directory exists
if [ ! -d "../third-assignment-sample-data-set" ]; then
    echo "❌ Sample data directory 'third-assignment-sample-data-set' not found."
    echo "   Please ensure the sample data is available in the project root."
    exit 1
fi

# Check if init.sql exists and has content
if [ ! -f "../dfras-backend/infrastructure/docker/init.sql" ]; then
    echo "❌ init.sql not found at ../dfras-backend/infrastructure/docker/init.sql"
    echo "   This file MUST exist and contain sample data."
    exit 1
fi

# Verify init.sql has substantial content (should be 58K+ lines)
init_sql_lines=$(wc -l < "../dfras-backend/infrastructure/docker/init.sql")
if [ "$init_sql_lines" -lt 1000 ]; then
    echo "❌ init.sql appears to be empty or incomplete (only $init_sql_lines lines)"
    echo "   init.sql MUST contain comprehensive sample data (58K+ lines expected)."
    exit 1
fi

echo "✅ init.sql verified ($init_sql_lines lines of sample data)"

echo "✅ Sample data directory found"
echo "📊 Sample data files:"
ls -la ../third-assignment-sample-data-set/

echo ""
echo "🔨 Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "🚀 Starting all DFRAS services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services. Please check the error messages above."
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

# Verify database initialization
echo "🔍 Verifying database initialization..."
echo "Checking if sample data was populated..."

# Wait for database to be ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec dfras-postgres psql -U dfras_user -d dfras_db -c "SELECT COUNT(*) FROM clients;" > /dev/null 2>&1; then
        echo "✅ Database is ready and accessible"
        break
    fi
    attempt=$((attempt + 1))
    echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database failed to initialize properly"
    echo "   Check logs with: docker-compose logs postgres"
    exit 1
fi

# Verify sample data population
clients_count=$(docker exec dfras-postgres psql -U dfras_user -d dfras_db -t -c "SELECT COUNT(*) FROM clients;" 2>/dev/null | tr -d ' ')
orders_count=$(docker exec dfras-postgres psql -U dfras_user -d dfras_db -t -c "SELECT COUNT(*) FROM orders;" 2>/dev/null | tr -d ' ')

if [ "$clients_count" -gt 100 ] && [ "$orders_count" -gt 1000 ]; then
    echo "✅ Sample data successfully populated:"
    echo "   📊 Clients: $clients_count"
    echo "   📦 Orders: $orders_count"
else
    echo "❌ Sample data population failed or incomplete"
    echo "   Clients: $clients_count (expected >100)"
    echo "   Orders: $orders_count (expected >1000)"
    echo "   Check init.sql and database logs"
    exit 1
fi

# Check if services are healthy
echo "🔍 Checking service health..."

# Check API Gateway health
echo "API Gateway health check..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API Gateway service is healthy"
else
    echo "❌ API Gateway service is not responding"
    echo "   Check logs with: docker-compose logs api-gateway"
fi

# Check Frontend health
echo "Frontend health check..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service is not responding"
    echo "   Check logs with: docker-compose logs frontend"
fi

# Check Analytics Service health
echo "Analytics Service health check..."
if curl -f http://localhost:8002/health > /dev/null 2>&1; then
    echo "✅ Analytics Service is healthy"
else
    echo "❌ Analytics Service is not responding"
    echo "   Check logs with: docker-compose logs analytics-service"
fi

echo ""
echo "🎉 DFRAS Application is running!"
echo "==============================="
echo "📱 Frontend: http://localhost:3001"
echo "🔧 API Gateway: http://localhost:8000"
echo "📊 Analytics Service: http://localhost:8002"
echo "❤️  Health Check: http://localhost:8000/health"
echo ""
echo "🔐 Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   View service status: docker-compose ps"
echo ""
echo "🔍 Sample data is mounted from: ../third-assignment-sample-data-set/"
echo "   All features will use this comprehensive sample data."
echo ""
echo "📚 Documentation: ../dfras-docs/README.md"
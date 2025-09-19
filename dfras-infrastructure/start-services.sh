#!/bin/bash

# DFRAS Services Startup Script
# Phase 1: Backend Foundation

echo "🚀 Starting DFRAS Services - Phase 1"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Navigate to backend directory
cd ../dfras-backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://dfras_user:dfras_password@localhost:5432/dfras_db
JWT_SECRET_KEY=dfras-secret-key-change-in-production
DATA_SERVICE_URL=http://data-service:8001
ANALYTICS_SERVICE_URL=http://analytics-service:8002
CORRELATION_SERVICE_URL=http://correlation-service:8003
ML_SERVICE_URL=http://ml-service:8004
NOTIFICATION_SERVICE_URL=http://notification-service:8005
EOF
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose -f ../dfras-infrastructure/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("postgres:5432" "redis:6379" "api-gateway:8000" "data-service:8001" "analytics-service:8002" "correlation-service:8003" "ml-service:8004" "notification-service:8005")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if nc -z localhost $port; then
        echo "✅ $name is running on port $port"
    else
        echo "❌ $name is not responding on port $port"
    fi
done

echo ""
echo "🎉 DFRAS Services are starting up!"
echo ""
echo "📊 Service URLs:"
echo "  API Gateway: http://localhost:8000"
echo "  Data Service: http://localhost:8001"
echo "  Analytics Service: http://localhost:8002"
echo "  Correlation Service: http://localhost:8003"
echo "  ML Service: http://localhost:8004"
echo "  Notification Service: http://localhost:8005"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo ""
echo "📚 API Documentation:"
echo "  Swagger UI: http://localhost:8000/docs"
echo "  ReDoc: http://localhost:8000/redoc"
echo ""
echo "🔐 Demo Credentials:"
echo "  admin / admin123 (Full Access)"
echo "  operations_manager / ops123"
echo "  fleet_manager / fleet123"
echo "  warehouse_manager / warehouse123"
echo "  data_analyst / analyst123"
echo ""
echo "📝 Next Steps:"
echo "  1. Import sample data: POST http://localhost:8000/api/data/import/sample"
echo "  2. Start frontend: cd ../dfras-frontend && npm start"
echo "  3. Access application: http://localhost:3000"
echo ""
echo "🛑 To stop services: docker-compose -f ../dfras-infrastructure/docker-compose.yml down"

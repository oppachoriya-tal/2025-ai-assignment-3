#!/bin/bash

# DFRAS Comprehensive Stop Script
# This script stops all DFRAS services and cleans up resources

echo "🛑 Stopping DFRAS - Delivery Failure Root Cause Analysis System"
echo "==============================================================="

# Stop and remove containers
echo "Stopping all DFRAS services..."
docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ All services stopped successfully"
else
    echo "❌ Failed to stop some services"
    echo "   Check logs with: docker-compose logs"
fi

# Optional cleanup (uncomment if you want to clean up)
echo ""
echo "🧹 Optional cleanup options:"
echo "   To remove all images: docker-compose down --rmi all"
echo "   To remove volumes: docker-compose down -v"
echo "   To remove networks: docker-compose down --remove-orphans"

echo ""
echo "🎯 DFRAS Application has been stopped."
echo "   To start again, run: ./start-dfras.sh"
echo ""
echo "📋 Service Status:"
docker-compose ps

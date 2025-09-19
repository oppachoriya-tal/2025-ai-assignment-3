#!/bin/bash

# DFRAS Rule Enforcement Script
# This script enforces the three mandatory deployment rules

echo "🔒 DFRAS Rule Enforcement Script"
echo "================================"
echo "Enforcing mandatory deployment rules:"
echo "1. init.sql MUST populate database with sample data"
echo "2. All services MUST run in Docker containers"
echo "3. Cross-origin restrictions MUST be disabled"
echo "================================"

# Rule 1: Check init.sql exists and has content
echo ""
echo "📋 Rule 1: Database Initialization Check"
echo "----------------------------------------"

if [ ! -f "../dfras-backend/infrastructure/docker/init.sql" ]; then
    echo "❌ VIOLATION: init.sql not found"
    echo "   Expected location: ../dfras-backend/infrastructure/docker/init.sql"
    echo "   This file MUST exist and contain sample data."
    exit 1
fi

init_sql_lines=$(wc -l < "../dfras-backend/infrastructure/docker/init.sql")
if [ "$init_sql_lines" -lt 1000 ]; then
    echo "❌ VIOLATION: init.sql appears incomplete"
    echo "   Current lines: $init_sql_lines"
    echo "   Expected: 58,000+ lines of sample data"
    exit 1
fi

echo "✅ PASS: init.sql verified ($init_sql_lines lines)"

# Rule 2: Check all services are Dockerized
echo ""
echo "📋 Rule 2: Docker-Only Services Check"
echo "-------------------------------------"

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ VIOLATION: docker-compose.yml not found"
    echo "   All services MUST be defined in docker-compose.yml"
    exit 1
fi

# Check for required services in docker-compose.yml
required_services=("postgres" "redis" "api-gateway" "analytics-service" "data-service" "frontend")
for service in "${required_services[@]}"; do
    if ! grep -q "^  $service:" docker-compose.yml; then
        echo "❌ VIOLATION: Service '$service' not found in docker-compose.yml"
        echo "   All services MUST be containerized"
        exit 1
    fi
done

echo "✅ PASS: All services are Dockerized"

# Rule 3: Check CORS is disabled
echo ""
echo "📋 Rule 3: CORS Disabled Check"
echo "------------------------------"

# Check API Gateway CORS configuration
if grep -q 'allow_origins=\["\*"\]' ../dfras-backend/services/api-gateway/main.py; then
    echo "✅ PASS: API Gateway CORS disabled (wildcard origins)"
else
    echo "❌ VIOLATION: API Gateway CORS not properly disabled"
    echo "   Expected: allow_origins=['*']"
    exit 1
fi

if grep -q 'allow_methods=\["\*"\]' ../dfras-backend/services/api-gateway/main.py; then
    echo "✅ PASS: API Gateway allows all methods"
else
    echo "❌ VIOLATION: API Gateway methods not fully allowed"
    echo "   Expected: allow_methods=['*']"
    exit 1
fi

if grep -q 'allow_headers=\["\*"\]' ../dfras-backend/services/api-gateway/main.py; then
    echo "✅ PASS: API Gateway allows all headers"
else
    echo "❌ VIOLATION: API Gateway headers not fully allowed"
    echo "   Expected: allow_headers=['*']"
    exit 1
fi

echo ""
echo "🎉 ALL RULES ENFORCED SUCCESSFULLY!"
echo "===================================="
echo "✅ Rule 1: init.sql populates database ($init_sql_lines lines)"
echo "✅ Rule 2: All services are Dockerized"
echo "✅ Rule 3: CORS restrictions are disabled"
echo ""
echo "🚀 System is ready for deployment!"
echo "   Run: ./start-dfras.sh"

#!/bin/bash

# DFRAS Kubernetes Deployment Script
# This script deploys the complete DFRAS application on Kubernetes with comprehensive CORS policies

set -e

echo "🚀 Starting DFRAS Kubernetes Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if Kubernetes cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster."
    print_warning "Please enable Kubernetes in Docker Desktop:"
    print_warning "1. Open Docker Desktop"
    print_warning "2. Go to Settings → Kubernetes"
    print_warning "3. Check 'Enable Kubernetes'"
    print_warning "4. Click 'Apply & Restart'"
    print_warning "5. Wait for Kubernetes to start (green indicator)"
    print_warning "6. Then run this script again"
    exit 1
fi

print_success "Kubernetes cluster is accessible"

# Create namespace
print_status "Creating namespace..."
kubectl apply -f namespace.yaml

# Wait for namespace to be ready
kubectl wait --for=condition=Ready namespace/dfras --timeout=60s

# Deploy PostgreSQL
print_status "Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=Ready pod -l app=postgres -n dfras --timeout=300s

# Deploy Redis
print_status "Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
kubectl wait --for=condition=Ready pod -l app=redis -n dfras --timeout=300s

# Deploy API Gateway
print_status "Deploying API Gateway..."
kubectl apply -f api-gateway.yaml

# Wait for API Gateway to be ready
print_status "Waiting for API Gateway to be ready..."
kubectl wait --for=condition=Ready pod -l app=api-gateway -n dfras --timeout=300s

# Deploy Analytics Service
print_status "Deploying Analytics Service..."
kubectl apply -f analytics-service.yaml

# Wait for Analytics Service to be ready
print_status "Waiting for Analytics Service to be ready..."
kubectl wait --for=condition=Ready pod -l app=analytics-service -n dfras --timeout=300s

# Deploy Data Service
print_status "Deploying Data Service..."
kubectl apply -f data-service.yaml

# Wait for Data Service to be ready
print_status "Waiting for Data Service to be ready..."
kubectl wait --for=condition=Ready pod -l app=data-service -n dfras --timeout=300s

# Deploy AI Query Service
print_status "Deploying AI Query Service..."
kubectl apply -f ai-query-service.yaml

# Wait for AI Query Service to be ready
print_status "Waiting for AI Query Service to be ready..."
kubectl wait --for=condition=Ready pod -l app=ai-query-service -n dfras --timeout=300s

# Deploy Data Ingestion Service
print_status "Deploying Data Ingestion Service..."
kubectl apply -f data-ingestion-service.yaml

# Wait for Data Ingestion Service to be ready
print_status "Waiting for Data Ingestion Service to be ready..."
kubectl wait --for=condition=Ready pod -l app=data-ingestion-service -n dfras --timeout=300s

# Deploy Frontend
print_status "Deploying Frontend..."
kubectl apply -f frontend.yaml

# Wait for Frontend to be ready
print_status "Waiting for Frontend to be ready..."
kubectl wait --for=condition=Ready pod -l app=frontend -n dfras --timeout=300s

# Deploy Ingress
print_status "Deploying Ingress..."
kubectl apply -f ingress.yaml

# Wait for Ingress to be ready
print_status "Waiting for Ingress to be ready..."
kubectl wait --for=condition=Ready ingress/dfras-ingress -n dfras --timeout=300s

# Set up port forwarding
print_status "Setting up port forwarding..."

# Kill existing port-forward processes
pkill -f "kubectl port-forward" || true

# Start port forwarding in background
kubectl port-forward -n dfras service/api-gateway-service 8000:8000 &
kubectl port-forward -n dfras service/frontend-service 3001:3000 &

# Wait a moment for port forwarding to start
sleep 5

# Display deployment status
print_success "DFRAS deployment completed successfully!"

echo ""
echo "📊 Deployment Status:"
kubectl get pods -n dfras

echo ""
echo "🌐 Access URLs:"
echo "Frontend: http://localhost:3001"
echo "API Gateway: http://localhost:8000"
echo ""

echo "🔧 Useful Commands:"
echo "View pods: kubectl get pods -n dfras"
echo "View services: kubectl get services -n dfras"
echo "View logs: kubectl logs -f deployment/<service-name> -n dfras"
echo "Delete deployment: kubectl delete namespace dfras"
echo ""

print_success "DFRAS is now running on Kubernetes with comprehensive CORS policies!"
print_warning "Note: Make sure to log in with admin/admin123 credentials"
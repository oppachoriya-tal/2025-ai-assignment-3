# DFRAS Kubernetes Deployment Guide

This guide provides comprehensive instructions for deploying the DFRAS application on Kubernetes with enhanced CORS policies to ensure cross-origin issues don't impact any deployment mode.

## Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** installed and configured
3. **All Docker images built** (completed in previous step)

## Step 1: Enable Kubernetes in Docker Desktop

### Option A: Through Docker Desktop GUI
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start (green indicator)

### Option B: Through Command Line (if available)
```bash
# Check if Kubernetes is enabled
kubectl get nodes

# If not enabled, you may need to enable it through Docker Desktop GUI
```

## Step 2: Deploy DFRAS on Kubernetes

### Quick Deployment
```bash
# Navigate to Kubernetes manifests directory
cd /Users/opachoriya/Project/AI_Assignments/Assignment_3/dfras-backend/infrastructure/kubernetes

# Run the automated deployment script
./deploy.sh
```

### Manual Deployment (if automated script fails)
```bash
# Create namespace
kubectl apply -f namespace.yaml

# Deploy infrastructure services
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=Ready pod -l app=postgres -n dfras --timeout=300s
kubectl wait --for=condition=Ready pod -l app=redis -n dfras --timeout=300s

# Deploy backend services
kubectl apply -f api-gateway.yaml
kubectl apply -f analytics-service.yaml
kubectl apply -f data-service.yaml
kubectl apply -f ai-query-service.yaml
kubectl apply -f data-ingestion-service.yaml
kubectl apply -f intelligence-service.yaml
kubectl apply -f ml-service.yaml
kubectl apply -f notification-service.yaml
kubectl apply -f correlation-service.yaml
kubectl apply -f enhanced-analytics-service.yaml
kubectl apply -f deep-learning-service.yaml

# Deploy frontend
kubectl apply -f frontend.yaml

# Deploy ingress
kubectl apply -f ingress.yaml

# Set up port forwarding
kubectl port-forward -n dfras service/api-gateway-service 8000:8000 &
kubectl port-forward -n dfras service/frontend-service 3001:3000 &
```

## Step 3: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n dfras

# Check services
kubectl get services -n dfras

# Check ingress
kubectl get ingress -n dfras
```

## Step 4: Access the Application

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:8000
- **Login Credentials**: admin / admin123

## CORS Configuration

The deployment includes comprehensive CORS policies:

### Backend Services CORS
- **Allow Origins**: `*` (all origins for development)
- **Allow Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allow Headers**: Authorization, Content-Type, X-Requested-With, etc.
- **Allow Credentials**: true

### Ingress CORS
- **NGINX Ingress Controller** with CORS annotations
- **Cross-Origin Headers** automatically added
- **Preflight Request Handling** for OPTIONS requests

### Frontend Configuration
- **Environment Variables** for API URLs
- **Token Expiration Handling** with automatic redirect
- **Error Handling** for network issues

## Troubleshooting

### Common Issues

1. **Kubernetes Not Starting**
   ```bash
   # Check Docker Desktop status
   docker info
   
   # Restart Docker Desktop
   # Enable Kubernetes in Settings → Kubernetes
   ```

2. **Pods Not Starting**
   ```bash
   # Check pod logs
   kubectl logs -f deployment/<service-name> -n dfras
   
   # Check pod status
   kubectl describe pod <pod-name> -n dfras
   ```

3. **Image Pull Errors**
   ```bash
   # Ensure images are built locally
   docker images | grep dfras-infrastructure
   
   # Rebuild if needed
   cd /Users/opachoriya/Project/AI_Assignments/Assignment_3/dfras-infrastructure
   docker-compose build
   ```

4. **Port Forwarding Issues**
   ```bash
   # Kill existing port forwards
   pkill -f "kubectl port-forward"
   
   # Restart port forwarding
   kubectl port-forward -n dfras service/api-gateway-service 8000:8000 &
   kubectl port-forward -n dfras service/frontend-service 3001:3000 &
   ```

### Health Checks

```bash
# Check API Gateway health
curl http://localhost:8000/health

# Check Frontend
curl http://localhost:3001

# Check all services
kubectl get pods -n dfras -o wide
```

## Cleanup

```bash
# Delete entire namespace (removes all resources)
kubectl delete namespace dfras

# Or delete individual resources
kubectl delete -f . -n dfras
```

## Production Considerations

For production deployment:

1. **Security**: Replace `*` CORS origins with specific domains
2. **Resources**: Add resource limits and requests
3. **Scaling**: Configure horizontal pod autoscaling
4. **Monitoring**: Add monitoring and logging
5. **SSL/TLS**: Configure HTTPS with certificates
6. **Secrets**: Use Kubernetes secrets for sensitive data

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend       │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Services      │
│   Port: 3001    │    │   Port: 8000    │    │   Ports: 8002+  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   PostgreSQL    │    │   Redis         │
│   (NGINX)       │    │   Database      │    │   Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3001 | React application |
| API Gateway | 8000 | Main API entry point |
| Analytics Service | 8002 | Data analytics |
| Data Service | 8003 | Data management |
| AI Query Service | 8004 | AI/ML queries |
| Data Ingestion | 8005 | Data ingestion |
| Intelligence Service | 8006 | Business intelligence |
| ML Service | 8007 | Machine learning |
| Notification Service | 8008 | Notifications |
| Correlation Service | 8009 | Data correlation |
| Enhanced Analytics | 8010 | Advanced analytics |
| Deep Learning | 8011 | Deep learning models |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

This deployment ensures that cross-origin policies are properly configured and won't impact the application in any deployment mode.

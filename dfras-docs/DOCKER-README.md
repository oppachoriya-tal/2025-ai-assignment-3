# DFRAS Docker Implementation - Phase 1

Complete end-to-end Docker implementation of the Delivery Failure Root Cause Analysis System.

## 🐳 Quick Start

### Prerequisites
- Docker Desktop (latest version)
- Docker Compose (included with Docker Desktop)
- At least 4GB RAM available for Docker
- Ports 3000, 5432, 6379, 8000-8002 available

### One-Command Startup

```bash
# Clone and navigate to the project
git clone <repository-url>
cd Assignment_3

# Start the entire system
./dfras-infrastructure/start-dfras.sh
```

This single command will:
- ✅ Build all Docker images
- ✅ Start all services (PostgreSQL, Redis, API Gateway, Data Service, Analytics Service, Frontend)
- ✅ Wait for services to be healthy
- ✅ Import sample data automatically
- ✅ Display all access URLs and credentials

## 🏗️ Architecture Overview

### Services Running

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **Frontend** | 3001 | React app with Material-UI | http://localhost:3001 |
| **API Gateway** | 8000 | Authentication & routing | http://localhost:8000/health |
| **Data Service** | 8001 | Order & entity management | http://localhost:8001/health |
| **Analytics Service** | 8002 | Dashboard & analytics | http://localhost:8002/health |
| **PostgreSQL** | 5433 | Primary database | pg_isready |
| **Redis** | 6380 | Caching & sessions | redis-cli ping |

### Docker Images Built

- `dfras-frontend`: React app with Nginx
- `dfras-api-gateway`: FastAPI gateway service
- `dfras-data-service`: FastAPI data service
- `dfras-analytics-service`: FastAPI analytics service
- `postgres:15`: Database
- `redis:7-alpine`: Cache

## 🌐 Access Points

### Frontend Application
- **URL**: http://localhost:3000
- **Features**: Login, Dashboard, Orders Management, Analytics
- **Responsive**: Works on desktop, tablet, and mobile

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Interactive**: Test APIs directly from browser

### Direct API Access
- **API Gateway**: http://localhost:8000
- **Data Service**: http://localhost:8001
- **Analytics Service**: http://localhost:8002

## 🔐 Authentication

### Demo Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | admin | admin123 | Full Access |
| **Operations Manager** | operations_manager | ops123 | Operations |
| **Fleet Manager** | fleet_manager | fleet123 | Fleet Management |
| **Warehouse Manager** | warehouse_manager | warehouse123 | Warehouse |
| **Data Analyst** | data_analyst | analyst123 | Analytics |
| **Customer Service** | customer_service | cs123 | Read Only |

## 📊 Sample Data

The system automatically imports comprehensive sample data:

- **14,949 orders** across multiple states and cities
- **750 clients** with complete contact information
- **52 warehouses** with capacity and manager details
- **2,002 drivers** from multiple partner companies
- **10,002 warehouse logs** with picking and dispatch times
- **10,002 fleet logs** with GPS and route information
- **10,002 external factors** including weather and traffic
- **10,002 customer feedback** with sentiment analysis

## 🛠️ Development Commands

### View Logs
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Service Management
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart api-gateway

# Rebuild and restart
docker-compose up --build -d

# View running containers
docker-compose ps
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it dfras-postgres psql -U dfras_user -d dfras_db

# Connect to Redis
docker exec -it dfras-redis redis-cli
```

### Frontend Development
```bash
# Access frontend container
docker exec -it dfras-frontend sh

# View frontend logs
docker-compose logs -f frontend
```

## 🔧 Configuration

### Environment Variables

The system uses the following environment variables:

```bash
# Database
DATABASE_URL=postgresql://dfras_user:dfras_password@postgres:5432/dfras_db

# Security
JWT_SECRET_KEY=dfras-secret-key-change-in-production

# Service URLs
DATA_SERVICE_URL=http://data-service:8001
ANALYTICS_SERVICE_URL=http://analytics-service:8002

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### Custom Configuration

To modify configuration:

1. Edit the `.env` file in the project root
2. Navigate to dfras-infrastructure directory: `cd dfras-infrastructure`
3. Restart services: `docker-compose restart`

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Stop conflicting services
sudo kill -9 <PID>
```

#### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker

# Check Docker status
docker info
```

#### Services Not Starting
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Check service logs
docker-compose logs api-gateway
docker-compose logs postgres

# Check service health
docker-compose ps
```

#### Database Connection Issues
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Wait for database to be ready
docker-compose logs postgres

# Check database health
docker exec dfras-postgres pg_isready -U dfras_user -d dfras_db
```

#### Frontend Not Loading
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Check frontend logs
docker-compose logs frontend

# Check nginx configuration
docker exec dfras-frontend cat /etc/nginx/nginx.conf
```

### Health Checks

All services include health checks:

```bash
# Check all service health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:3000/
```

### Performance Issues

#### Memory Usage
```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
```

#### Slow Startup
```bash
# Increase startup timeout
docker-compose up --build -d --timeout 300
```

## 📈 Monitoring

### Service Status
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# View all containers
docker-compose ps

# View resource usage
docker stats

# View service health
docker-compose exec api-gateway curl localhost:8000/health
```

### Logs
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Real-time logs
docker-compose logs -f

# Logs with timestamps
docker-compose logs -f -t

# Last 100 lines
docker-compose logs --tail=100
```

## 🔄 Updates and Maintenance

### Updating Services
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose up --build -d
```

### Data Backup
```bash
# Backup database
docker exec dfras-postgres pg_dump -U dfras_user dfras_db > backup.sql

# Restore database
docker exec -i dfras-postgres psql -U dfras_user dfras_db < backup.sql
```

### Cleanup
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a
```

## 🚀 Production Deployment

### Security Considerations
- Change default passwords
- Use environment-specific JWT secrets
- Enable HTTPS
- Configure firewall rules
- Use secrets management

### Scaling
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Scale services
docker-compose up --scale data-service=3 -d
docker-compose up --scale analytics-service=2 -d
```

### Load Balancing
- Use nginx or traefik for load balancing
- Configure health checks
- Implement circuit breakers

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **System Architecture**: See `Design.md`
- **Database Schema**: See `DB.md`
- **User Stories**: See `User_Stories.md`
- **Task List**: See `TaskList.md`

## 🎯 Next Steps

### Phase 2 (Planned)
- Correlation Service
- ML Service
- Notification Service
- Advanced Analytics

### Phase 3 (Future)
- Root Cause Analysis Engine
- Simulation Engine
- Optimization Engine
- Real-time Streaming

---

**Status**: Phase 1 Complete ✅ | **Ready for Production** 🚀

For support or questions, check the logs first, then refer to the troubleshooting section above.

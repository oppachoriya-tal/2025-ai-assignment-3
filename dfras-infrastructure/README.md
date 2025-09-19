# DFRAS Infrastructure

This directory contains all infrastructure and deployment-related files for the DFRAS (Delivery Failure Root Cause Analysis System) project.

## 📁 Contents

- **`start-services.sh`** - Backend services startup script (PostgreSQL, Redis, API Gateway, Data Service, Analytics Service)
- **`start-dfras.sh`** - Complete system startup script (includes frontend and automatic data import)
- **`docker-compose.yml`** - Docker Compose configuration for all services

## 🚀 Quick Start

### Backend Services Only
```bash
# From project root
./dfras-infrastructure/start-services.sh
```

### Complete System (Recommended)
```bash
# From project root
./dfras-infrastructure/start-dfras.sh
```

### Manual Docker Commands
```bash
# Navigate to infrastructure directory
cd dfras-infrastructure

# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🏗️ Architecture

The infrastructure includes:

- **PostgreSQL** (port 5433) - Primary database
- **Redis** (port 6380) - Caching and sessions
- **API Gateway** (port 8000) - Authentication and routing
- **Data Service** (port 8001) - Core data management
- **Analytics Service** (port 8002) - Analytics and reporting
- **Frontend** (port 3001) - React application

## 📋 Service URLs

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:8000
- **Data Service**: http://localhost:8001
- **Analytics Service**: http://localhost:8002
- **API Documentation**: http://localhost:8000/docs

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Operations Manager | operations_manager | ops123 |
| Fleet Manager | fleet_manager | fleet123 |
| Warehouse Manager | warehouse_manager | warehouse123 |
| Data Analyst | data_analyst | analyst123 |
| Customer Service | customer_service | cs123 |

## 🛠️ Development

### View Logs
```bash
cd dfras-infrastructure
docker-compose logs -f [service-name]
```

### Restart Services
```bash
cd dfras-infrastructure
docker-compose restart [service-name]
```

### Database Access
```bash
# PostgreSQL
docker exec -it dfras-postgres psql -U dfras_user -d dfras_db

# Redis
docker exec -it dfras-redis redis-cli
```

## 📚 Documentation

For detailed documentation, see:
- **Main README**: `../README.md`
- **Docker Documentation**: `../dfras-docs/DOCKER-README.md`
- **System Design**: `../dfras-docs/Design.md`
- **Database Schema**: `../dfras-docs/DB.md`

## 🔧 Configuration

Environment variables are managed in the `.env` file at the project root. The infrastructure scripts will create this file automatically if it doesn't exist.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001, 5433, 6380, 8000-8002 are available
2. **Docker not running**: Start Docker Desktop before running services
3. **Services not starting**: Check logs with `docker-compose logs -f`
4. **Database connection**: Wait for PostgreSQL to fully start (30-45 seconds)

### Health Checks

```bash
# Check service health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:3001/

# Check database
docker exec dfras-postgres pg_isready -U dfras_user -d dfras_db
```

---

**Note**: All infrastructure files have been moved to this directory to maintain a clean separation between application code and deployment configuration. This follows the user's preference for organizing infrastructure-related files at the same level.

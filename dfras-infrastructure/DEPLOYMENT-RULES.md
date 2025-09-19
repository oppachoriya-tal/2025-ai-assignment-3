# DFRAS Deployment Rules

## 🎯 Core Deployment Rules

### Rule 1: Database Initialization
**MANDATORY**: `dfras-backend/infrastructure/docker/init.sql` MUST always populate the database with sample data.

- ✅ **File Location**: `dfras-backend/infrastructure/docker/init.sql`
- ✅ **Data Source**: `third-assignment-sample-data-set/` directory
- ✅ **Mount Point**: `/docker-entrypoint-initdb.d/init.sql` in PostgreSQL container
- ✅ **Auto-Execution**: Runs automatically on first database startup
- ✅ **Data Volume**: 58,000+ lines of comprehensive sample data

### Rule 2: Docker-Only Services
**MANDATORY**: All services MUST run in Docker containers.

- ✅ **No Local Services**: No services should run outside Docker
- ✅ **Containerized**: All 12+ microservices in Docker containers
- ✅ **Orchestrated**: Managed via `docker-compose.yml`
- ✅ **Isolated**: Each service in its own container
- ✅ **Scalable**: Kubernetes-ready container definitions

### Rule 3: Cross-Origin Policy
**MANDATORY**: Cross-origin restrictions MUST be disabled/ignored.

- ✅ **CORS Disabled**: All services configured to ignore CORS
- ✅ **Wildcard Origins**: `*` allowed for all origins
- ✅ **All Methods**: GET, POST, PUT, DELETE, OPTIONS allowed
- ✅ **All Headers**: All headers allowed
- ✅ **Credentials**: Cross-origin credentials enabled

## 🐳 Docker Configuration

### Database Initialization
```yaml
postgres:
  image: postgres:15
  volumes:
    - ../dfras-backend/infrastructure/docker/init.sql:/docker-entrypoint-initdb.d/init.sql
```

### CORS Configuration
All services include comprehensive CORS middleware:
```python
CORSMiddleware(
    app,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Deployment Commands

### Start All Services
```bash
cd dfras-infrastructure
./start-dfras.sh
```

### Stop All Services
```bash
cd dfras-infrastructure
./stop-dfras.sh
```

### Verify Database Population
```bash
# Check if data is populated
docker exec dfras-postgres psql -U dfras_user -d dfras_db -c "SELECT COUNT(*) FROM clients;"
docker exec dfras-postgres psql -U dfras_user -d dfras_db -c "SELECT COUNT(*) FROM orders;"
```

## 📊 Service Architecture

### Core Services (Docker)
1. **postgres** - Database with init.sql data
2. **redis** - Caching layer
3. **api-gateway** - Central API entry point
4. **analytics-service** - Data analysis
5. **data-service** - Core data operations
6. **ai-query-service** - AI/ML queries
7. **data-ingestion-service** - Data upload
8. **intelligence-service** - Predictive insights
9. **ml-service** - Machine learning
10. **notification-service** - Notifications
11. **correlation-service** - Pattern analysis
12. **enhanced-analytics-service** - Advanced analytics
13. **deep-learning-service** - Deep learning models
14. **frontend** - React application

### Data Flow
```
Frontend (3001) → API Gateway (8000) → Microservices → PostgreSQL (5433)
                                                      ↓
                                              init.sql populates
                                              sample data
```

## 🔧 Configuration Files

### Required Files
- ✅ `dfras-backend/infrastructure/docker/init.sql` - Database initialization
- ✅ `dfras-infrastructure/docker-compose.yml` - Service orchestration
- ✅ `dfras-infrastructure/start-dfras.sh` - Startup script
- ✅ `dfras-infrastructure/stop-dfras.sh` - Stop script

### Environment Variables
All services configured with:
- Database connection strings
- CORS wildcard settings
- Service discovery URLs
- Sample data paths

## ⚠️ Violation Prevention

### Database Rule Violations
- ❌ **Never** run services without Docker
- ❌ **Never** use empty init.sql
- ❌ **Never** skip database initialization
- ❌ **Never** use local database connections

### CORS Rule Violations
- ❌ **Never** restrict origins to specific domains
- ❌ **Never** disable credentials
- ❌ **Never** limit HTTP methods
- ❌ **Never** block headers

## 🎯 Compliance Checklist

### Pre-Deployment
- [ ] `init.sql` contains sample data (58K+ lines)
- [ ] All services defined in `docker-compose.yml`
- [ ] CORS configured with wildcard origins
- [ ] Database volume mounted correctly

### Post-Deployment
- [ ] All containers running
- [ ] Database populated with sample data
- [ ] Frontend accessible at http://localhost:3001
- [ ] API Gateway accessible at http://localhost:8000
- [ ] No CORS errors in browser console
- [ ] Sample data visible in analytics

## 📞 Enforcement

These rules are **MANDATORY** and **NON-NEGOTIABLE**:

1. **Database**: init.sql MUST populate data
2. **Docker**: All services MUST be containerized
3. **CORS**: Cross-origin MUST be ignored

**Violation of these rules will result in deployment failure.**

---

**DFRAS Deployment Rules - Version 1.0**
**Last Updated**: 2025-09-19

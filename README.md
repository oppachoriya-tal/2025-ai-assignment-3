# DFRAS - Delivery Failure Root Cause Analysis System

A comprehensive AI-powered microservices platform for analyzing delivery failures and providing predictive insights for logistics operations. This system addresses the critical challenge of fragmented logistics data by providing intelligent root cause analysis and actionable recommendations.

## 📋 Assignment Overview

This project implements a complete solution for **Assignment 3: Delivery Failure Root Cause Analysis System** as specified in the requirements. The system aggregates multi-domain data from orders, fleet logs, warehouse records, customer feedback, and external factors to provide intelligent insights into delivery failures.

### Key Deliverables:
- ✅ **Comprehensive Write-up**: `assignment-write-up.md` with problem analysis, solution details, and architecture
- ✅ **Working System**: Complete microservices-based application with AI integration
- ✅ **Sample Data Integration**: Full integration with `third-assignment-sample-data-set`
- ✅ **Demo Capabilities**: Interactive web interface for all use cases
- ✅ **Documentation**: Complete API documentation and deployment guides

## 🏗️ Project Structure

```
Assignment_3/
├── dfras-backend/                 # Backend microservices
│   ├── services/                  # Individual microservices
│   │   ├── api-gateway/           # API Gateway (Port 8000)
│   │   ├── analytics-service/    # Analytics Service (Port 8002)
│   │   ├── data-service/         # Data Service (Port 8003)
│   │   ├── ai-query-service/     # AI Query Service (Port 8004)
│   │   ├── data-ingestion-service/ # Data Ingestion (Port 8005)
│   │   ├── intelligence-service/ # Intelligence Service (Port 8006)
│   │   ├── ml-service/           # ML Service (Port 8007)
│   │   ├── notification-service/ # Notification Service (Port 8008)
│   │   ├── correlation-service/  # Correlation Service (Port 8009)
│   │   ├── enhanced-analytics-service/ # Enhanced Analytics (Port 8010)
│   │   └── deep-learning-service/ # Deep Learning Service (Port 8011)
│   ├── infrastructure/           # Infrastructure configurations
│   │   ├── docker/              # Docker configurations
│   │   │   ├── init.sql         # Database initialization with sample data
│   │   │   └── Dockerfile.*     # Service-specific Dockerfiles
│   │   └── kubernetes/          # Kubernetes configurations
│   │       ├── deploy.sh        # Kubernetes deployment script
│   │       └── *.yaml           # Service manifests
│   └── shared/                  # Shared utilities and models
├── dfras-frontend/              # React frontend application
│   ├── src/components/         # React components
│   ├── src/contexts/          # React contexts
│   └── Dockerfile             # Frontend Dockerfile
├── dfras-infrastructure/       # Infrastructure orchestration
│   ├── docker-compose.yml     # Complete Docker Compose setup
│   ├── start-dfras.sh         # Start all services
│   ├── stop-dfras.sh          # Stop all services
│   └── README.md              # Infrastructure documentation
├── dfras-docs/                # Comprehensive documentation
│   ├── README.md              # Main documentation
│   ├── DFRAS-Comprehensive-Solution-Document.md
│   ├── API-Documentation.md   # API documentation
│   └── *.md                   # Additional documentation
└── third-assignment-sample-data-set/ # Sample data
    ├── clients.csv
    ├── orders.csv
    ├── warehouses.csv
    ├── drivers.csv
    └── *.csv                   # Additional data files
```

## 🔒 Mandatory Deployment Rules

**THESE RULES ARE NON-NEGOTIABLE AND ENFORCED:**

1. **✅ Database Initialization**: `dfras-backend/infrastructure/docker/init.sql` MUST populate database with sample data (58K+ lines)
2. **✅ Docker-Only Services**: All services MUST run in Docker containers (no local services)
3. **✅ CORS Disabled**: Cross-origin restrictions MUST be completely disabled (`allow_origins=["*"]`)

### Rule Enforcement
```bash
cd dfras-infrastructure
./enforce-rules.sh  # Verify all rules are met
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Enforce Rules (Mandatory)
```bash
cd dfras-infrastructure
./enforce-rules.sh
```

### 2. Start the Complete Application
```bash
# Start all services (enforces rules automatically)
./start-dfras.sh
```

### 2. Access the Application

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

### 3. Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🐳 Docker Deployment

### Start Services
```bash
cd dfras-infrastructure
./start-dfras.sh
```

### Stop Services
```bash
cd dfras-infrastructure
./stop-dfras.sh
```

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f [service-name]
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Docker Desktop Kubernetes enabled)
- kubectl configured

### Deploy to Kubernetes
```bash
cd dfras-backend/infrastructure/kubernetes
./deploy.sh
```

### Access via Port Forwarding
```bash
# API Gateway
kubectl port-forward -n dfras service/api-gateway-service 8000:8000

# Frontend
kubectl port-forward -n dfras service/frontend-service 3001:3000
```

## 📊 Features

### Core Functionality
- **Real-time Monitoring**: Live dashboard with delivery metrics
- **Predictive Analytics**: ML-powered failure prediction
- **Root Cause Analysis**: Deep analysis of delivery failures
- **Data Ingestion**: CSV upload and processing
- **AI Query Interface**: Natural language queries
- **Correlation Analysis**: Pattern discovery across data
- **Sample Data Analytics**: Comprehensive sample data analysis

### Sample Data
The system includes comprehensive sample data from `third-assignment-sample-data-set`:
- **750 clients** across multiple cities
- **15,000+ orders** with delivery status
- **50 warehouses** with capacity data
- **200+ drivers** with performance metrics
- **External factors** (weather, traffic, events)
- **Customer feedback** and ratings
- **Fleet logs** and warehouse operations

## 🔧 Development

### Backend Services
Each microservice is independently deployable and follows REST API standards:

- **API Gateway**: Central entry point with authentication
- **Analytics Service**: Data analysis and reporting
- **Data Service**: Core data operations
- **AI Query Service**: Natural language processing with LLM (all-MiniLM-L6-v2)
- **Data Ingestion Service**: CSV upload and sample data processing

### API Documentation
- **Swagger/OpenAPI**: Complete API specification in `dfras-api-swagger.yaml`
- **Postman Collection**: Ready-to-use API collection in `dfras-api-collection.postman_collection.json`
- **Interactive Testing**: Import the Postman collection for immediate API testing

### Frontend
React-based SPA with:
- Material-UI components
- Real-time WebSocket connections
- Responsive design
- Authentication context
- Error handling and notifications

## 📚 Documentation

Comprehensive documentation is available:

- **assignment-write-up.md**: Complete assignment solution with problem analysis, architecture, and implementation details
- **DELIVERY-SUMMARY.md**: Comprehensive summary of completed assignment deliverables
- **PROJECT-ORGANIZATION.md**: Detailed project structure and organization guide
- **dfras-api-swagger.yaml**: OpenAPI/Swagger specification for all APIs
- **dfras-api-collection.postman_collection.json**: Postman collection for API testing
- **dfras-docs/DFRAS-Comprehensive-Solution-Document.md**: Detailed technical solution document
- **dfras-docs/API-Documentation.md**: Complete API endpoints and usage guide
- **dfras-docs/DOCKER-README.md**: Docker deployment guide
- **dfras-infrastructure/README.md**: Infrastructure setup and deployment

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3001, 8000-8011 are available
2. **Docker Issues**: Check Docker is running and has sufficient resources
3. **Database Connection**: Verify PostgreSQL is running and accessible
4. **Sample Data**: Ensure `third-assignment-sample-data-set` directory exists

### Health Checks
```bash
# Check API Gateway
curl http://localhost:8000/health

# Check Analytics Service
curl http://localhost:8002/health

# Check Frontend
curl http://localhost:3001
```

## 📈 Performance

- **Database**: PostgreSQL with optimized indexes
- **Caching**: Redis for session and data caching
- **Load Balancing**: Kubernetes-ready with horizontal scaling
- **Monitoring**: Built-in health checks and metrics

## 🔒 Security

- **Authentication**: JWT-based authentication
- **CORS**: Comprehensive cross-origin policies
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Parameterized queries and ORM protection

## 📞 Support

For issues and questions:
1. Check the documentation in `dfras-docs/`
2. Review service logs: `docker-compose logs [service-name]`
3. Verify health endpoints are responding
4. Ensure all prerequisites are met

---

**DFRAS - Empowering logistics with intelligent failure analysis** 🚀
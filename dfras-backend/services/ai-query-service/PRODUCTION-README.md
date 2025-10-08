# AI Query Service - Production Ready Setup

## Overview
The AI Query Service has been enhanced for production deployment with robust error handling, SSL configuration, and offline capabilities.

## Key Production Features

### 1. SSL Certificate Handling
- Automatic SSL certificate configuration for production environments
- Fallback mechanisms when SSL verification fails
- Environment variables for SSL configuration

### 2. Offline Mode Support
- Graceful degradation when LLM models are unavailable
- Fallback analysis using TF-IDF and pattern matching
- Continues operation even without internet connectivity

### 3. Enhanced Error Handling
- Database connection retries with exponential backoff
- Comprehensive error logging
- Graceful service startup even with partial failures

### 4. Production Security
- Non-root user execution
- Secure environment variable handling
- Certificate management

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `DATA_SERVICE_URL`: Data service endpoint
- `ANALYTICS_SERVICE_URL`: Analytics service endpoint

### Optional
- `AI_SIMILARITY_THRESHOLD`: Similarity threshold for analysis (default: 0.7)
- `AI_KMEANS_CLUSTERS`: Number of clusters for analysis (default: 5)
- `BUSINESS_INR_RATE`: Business conversion rate (default: 83.0)
- `SSL_VERIFY`: SSL verification setting (default: false for production)

## Docker Deployment

### Build the Image
```bash
docker build -f infrastructure/docker/Dockerfile.ai-query-service -t dfras-ai-query-service .
```

### Run the Container
```bash
docker run -d \
  --name ai-query-service \
  -p 8010:8010 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e DATA_SERVICE_URL="http://data-service:8001" \
  -e ANALYTICS_SERVICE_URL="http://analytics-service:8002" \
  dfras-ai-query-service
```

## Health Checks

The service provides comprehensive health checks:

### Basic Health Check
```bash
curl http://localhost:8010/health
```

### Model Information
```bash
curl http://localhost:8010/api/ai/model-info
```

## API Endpoints

### 1. Basic Analysis
```bash
POST /api/ai/analyze
Content-Type: application/json

{
  "query": "What are the main failure patterns in our system?"
}
```

### 2. Advanced Analysis
```bash
POST /api/ai/advanced-analyze
Content-Type: application/json

{
  "query": "Analyze delivery performance trends"
}
```

### 3. Semantic Search
```bash
GET /api/ai/semantic-search?query=delivery%20delays
```

## Offline Mode

When LLM models are unavailable, the service automatically switches to offline mode:

- **TF-IDF Analysis**: Basic text analysis using scikit-learn
- **Pattern Matching**: Statistical pattern detection
- **Fallback Responses**: Graceful degradation with reduced functionality

## Monitoring and Logging

### Log Files
- Application logs: `/app/logs/ai-query-service.log`
- Health check logs: Available via Docker logs

### Key Metrics to Monitor
- Model availability status
- Analysis confidence scores
- Processing times
- Error rates

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Service automatically handles SSL issues
   - Check `SSL_VERIFY` environment variable
   - Verify certificate paths

2. **Model Loading Failures**
   - Service falls back to offline mode
   - Check network connectivity
   - Verify model download permissions

3. **Database Connection Issues**
   - Service retries with exponential backoff
   - Check database URL configuration
   - Verify database availability

### Debug Mode
Set `LOG_LEVEL=DEBUG` for detailed logging.

## Performance Optimization

### Production Settings
- Single worker process for stability
- Optimized health check intervals
- Efficient memory usage
- Cached embeddings when available

### Scaling Considerations
- Use load balancer for multiple instances
- Consider Redis for shared caching
- Monitor memory usage with large datasets

## Data Sources

The service uses the `third-assignment-sample-data-set` with the following files:
- `orders.csv`: Order data
- `warehouses.csv`: Warehouse information
- `fleet_logs.csv`: Fleet tracking data
- `external_factors.csv`: External conditions
- `clients.csv`: Client information
- `drivers.csv`: Driver data
- `feedback.csv`: Customer feedback
- `warehouse_logs.csv`: Warehouse operations

## Security Considerations

- Non-root user execution
- Secure environment variable handling
- SSL/TLS configuration
- Input validation and sanitization
- Error message sanitization

## Support

For production issues:
1. Check health endpoints
2. Review application logs
3. Verify environment configuration
4. Test with sample queries

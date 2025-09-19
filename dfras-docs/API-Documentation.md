# DFRAS API Documentation

**Document Version:** 1.0  
**Date:** December 2024  
**System:** Delivery Failure Root Cause Analysis System (DFRAS)  
**Base URL:** `http://localhost:8000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Data Management APIs](#data-management-apis)
3. [Analytics APIs](#analytics-apis)
4. [Data Ingestion APIs](#data-ingestion-apis)
5. [Enhanced Analytics APIs](#enhanced-analytics-apis)
6. [Machine Learning APIs](#machine-learning-apis)
7. [Intelligence Service APIs](#intelligence-service-apis)
8. [Deep Learning APIs](#deep-learning-apis)
9. [Notification APIs](#notification-apis)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Examples](#examples)

---

## Authentication

### Overview
DFRAS uses JWT (JSON Web Tokens) for authentication. All API endpoints (except login) require a valid JWT token in the Authorization header.

### Login
**Endpoint:** `POST /auth/login`  
**Description:** Authenticate user and receive JWT token  
**Authentication:** None required

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "username": "admin",
    "role": "admin",
    "permissions": ["*"]
  }
}
```

#### Example
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Current User
**Endpoint:** `GET /auth/me`  
**Description:** Get current authenticated user information  
**Authentication:** Required

#### Response
```json
{
  "username": "admin",
  "role": "admin",
  "permissions": ["*"]
}
```

---

## Data Management APIs

### Get Orders
**Endpoint:** `GET /api/data/orders`  
**Description:** Retrieve orders with pagination and filtering  
**Authentication:** Required

#### Query Parameters
- `limit` (integer, optional): Number of orders to return (default: 100)
- `offset` (integer, optional): Number of orders to skip (default: 0)
- `status` (string, optional): Filter by order status
- `warehouse_id` (integer, optional): Filter by warehouse ID
- `client_id` (integer, optional): Filter by client ID

#### Response
```json
{
  "orders": [
    {
      "order_id": 1,
      "client_id": 101,
      "warehouse_id": 1,
      "driver_id": 201,
      "order_date": "2024-01-15T10:30:00Z",
      "delivery_date": "2024-01-16T14:00:00Z",
      "status": "Delivered",
      "total_amount": 150.75,
      "distance_km": 25.5
    }
  ],
  "total_count": 14949,
  "limit": 10,
  "offset": 0
}
```

### Get Order by ID
**Endpoint:** `GET /api/data/orders/{order_id}`  
**Description:** Retrieve specific order details  
**Authentication:** Required

#### Response
```json
{
  "order_id": 1,
  "client_id": 101,
  "warehouse_id": 1,
  "driver_id": 201,
  "order_date": "2024-01-15T10:30:00Z",
  "delivery_date": "2024-01-16T14:00:00Z",
  "actual_delivery_date": "2024-01-16T13:45:00Z",
  "status": "Delivered",
  "total_amount": 150.75,
  "distance_km": 25.5,
  "failure_reason": null,
  "client": {
    "client_id": 101,
    "name": "ABC Corporation",
    "city": "New York",
    "state": "NY"
  },
  "warehouse": {
    "warehouse_id": 1,
    "name": "NYC Warehouse",
    "city": "New York",
    "capacity": 1000
  }
}
```

### Get Warehouses
**Endpoint:** `GET /api/data/warehouses`  
**Description:** Retrieve warehouse information  
**Authentication:** Required

#### Response
```json
{
  "warehouses": [
    {
      "warehouse_id": 1,
      "name": "NYC Warehouse",
      "city": "New York",
      "state": "NY",
      "capacity": 1000,
      "manager_name": "John Smith",
      "phone": "+1-555-0123"
    }
  ],
  "total_count": 52
}
```

### Get Drivers
**Endpoint:** `GET /api/data/drivers`  
**Description:** Retrieve driver information  
**Authentication:** Required

#### Response
```json
{
  "drivers": [
    {
      "driver_id": 201,
      "name": "Mike Johnson",
      "company": "FastDelivery Inc",
      "phone": "+1-555-0456",
      "experience_years": 5,
      "license_number": "DL123456"
    }
  ],
  "total_count": 2002
}
```

### Get Clients
**Endpoint:** `GET /api/data/clients`  
**Description:** Retrieve client information  
**Authentication:** Required

#### Response
```json
{
  "clients": [
    {
      "client_id": 101,
      "name": "ABC Corporation",
      "email": "contact@abc.com",
      "phone": "+1-555-0789",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001"
    }
  ],
  "total_count": 750
}
```

---

## Analytics APIs

### Dashboard Metrics
**Endpoint:** `GET /api/analytics/dashboard`  
**Description:** Get comprehensive dashboard metrics  
**Authentication:** Required

#### Response
```json
{
  "total_orders": 14949,
  "success_rate": 0.85,
  "failed_orders": 2242,
  "pending_orders": 150,
  "in_transit_orders": 300,
  "cancelled_orders": 50,
  "on_time_deliveries": 12000,
  "late_deliveries": 749,
  "average_delivery_time": 2.5,
  "top_failure_reasons": [
    {"reason": "Weather", "count": 450},
    {"reason": "Traffic", "count": 380},
    {"reason": "Vehicle Breakdown", "count": 320}
  ],
  "warehouse_performance": [
    {"warehouse_id": 1, "name": "NYC Warehouse", "success_rate": 0.92}
  ],
  "driver_performance": [
    {"driver_id": 201, "name": "Mike Johnson", "success_rate": 0.88}
  ]
}
```

### Failure Analysis
**Endpoint:** `GET /api/analytics/failures`  
**Description:** Get detailed failure analysis  
**Authentication:** Required

#### Query Parameters
- `time_period` (string, optional): Time period for analysis (7d, 30d, 90d)
- `warehouse_id` (integer, optional): Filter by warehouse
- `failure_type` (string, optional): Filter by failure type

#### Response
```json
{
  "failure_summary": {
    "total_failures": 2242,
    "failure_rate": 0.15,
    "trend": "decreasing"
  },
  "failure_breakdown": [
    {
      "reason": "Weather",
      "count": 450,
      "percentage": 20.1,
      "trend": "stable"
    }
  ],
  "geographic_analysis": [
    {
      "city": "New York",
      "failure_count": 180,
      "failure_rate": 0.12
    }
  ],
  "temporal_analysis": [
    {
      "date": "2024-01-15",
      "failure_count": 25,
      "failure_rate": 0.18
    }
  ]
}
```

### Warehouse Performance
**Endpoint:** `GET /api/analytics/performance/warehouses`  
**Description:** Get warehouse performance metrics  
**Authentication:** Required

#### Response
```json
{
  "warehouses": [
    {
      "warehouse_id": 1,
      "name": "NYC Warehouse",
      "total_orders": 2500,
      "successful_orders": 2300,
      "success_rate": 0.92,
      "average_processing_time": 1.5,
      "capacity_utilization": 0.75,
      "rank": 1
    }
  ],
  "summary": {
    "best_performer": "NYC Warehouse",
    "worst_performer": "LA Warehouse",
    "average_success_rate": 0.85
  }
}
```

### Driver Performance
**Endpoint:** `GET /api/analytics/performance/drivers`  
**Description:** Get driver performance metrics  
**Authentication:** Required

#### Response
```json
{
  "drivers": [
    {
      "driver_id": 201,
      "name": "Mike Johnson",
      "total_deliveries": 150,
      "successful_deliveries": 132,
      "success_rate": 0.88,
      "average_delivery_time": 2.2,
      "customer_rating": 4.5,
      "rank": 1
    }
  ],
  "summary": {
    "top_driver": "Mike Johnson",
    "average_success_rate": 0.82,
    "total_drivers": 2002
  }
}
```

---

## Data Ingestion APIs

### Upload CSV File
**Endpoint:** `POST /api/data-ingestion/upload`  
**Description:** Upload and process CSV files  
**Authentication:** Required

#### Request Body (multipart/form-data)
- `file` (file): CSV file to upload
- `table_name` (string): Target table name

#### Response
```json
{
  "status": "success",
  "message": "File uploaded and processed successfully",
  "file_id": "upload_123",
  "rows_processed": 1000,
  "processing_time": 15.5,
  "quality_score": 0.95
}
```

### Data Quality Report
**Endpoint:** `GET /api/data-ingestion/quality-report`  
**Description:** Get data quality metrics  
**Authentication:** Required

#### Response
```json
{
  "overall_quality_score": 0.92,
  "completeness": 0.95,
  "accuracy": 0.90,
  "consistency": 0.91,
  "timeliness": 0.89,
  "table_quality": [
    {
      "table_name": "orders",
      "quality_score": 0.94,
      "issues": [
        {
          "type": "missing_values",
          "count": 25,
          "severity": "low"
        }
      ]
    }
  ]
}
```

### Processing Status
**Endpoint:** `GET /api/data-ingestion/status`  
**Description:** Get data processing status  
**Authentication:** Required

#### Response
```json
{
  "status": "processing",
  "current_file": "orders.csv",
  "progress": 75,
  "estimated_completion": "2024-01-15T15:30:00Z",
  "files_processed": 5,
  "total_files": 7
}
```

---

## Enhanced Analytics APIs

### Get Insights
**Endpoint:** `GET /api/enhanced-analytics/insights`  
**Description:** Get advanced analytical insights  
**Authentication:** Required

#### Query Parameters
- `insight_type` (string, optional): Type of insight (trend, pattern, anomaly)
- `time_range` (string, optional): Time range for analysis

#### Response
```json
{
  "insights": [
    {
      "id": "insight_001",
      "type": "trend",
      "title": "Increasing Failure Rate in NYC",
      "description": "Failure rate has increased by 15% in NYC over the last 30 days",
      "confidence": 0.85,
      "impact": "high",
      "recommendations": [
        "Increase driver capacity in NYC",
        "Implement weather-based routing"
      ],
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "total_insights": 15,
    "high_impact": 3,
    "medium_impact": 8,
    "low_impact": 4
  }
}
```

### Get Trends
**Endpoint:** `GET /api/enhanced-analytics/trends`  
**Description:** Get trend analysis  
**Authentication:** Required

#### Response
```json
{
  "trends": [
    {
      "metric": "failure_rate",
      "trend": "decreasing",
      "change_percentage": -5.2,
      "time_period": "30d",
      "data_points": [
        {"date": "2024-01-01", "value": 0.18},
        {"date": "2024-01-02", "value": 0.17}
      ]
    }
  ]
}
```

### Get Correlations
**Endpoint:** `GET /api/enhanced-analytics/correlations`  
**Description:** Get correlation analysis  
**Authentication:** Required

#### Response
```json
{
  "correlations": [
    {
      "variable1": "weather_score",
      "variable2": "failure_rate",
      "correlation": -0.75,
      "significance": 0.95,
      "interpretation": "Strong negative correlation between weather and failure rate"
    }
  ]
}
```

---

## Machine Learning APIs

### Train Model
**Endpoint:** `POST /api/ml/models/train`  
**Description:** Train machine learning models  
**Authentication:** Required

#### Request Body
```json
{
  "model_type": "failure_prediction",
  "features": {
    "distance_km": 25,
    "weather_score": 0.3,
    "traffic_score": 0.4,
    "warehouse_capacity": 0.8,
    "driver_experience": 7
  },
  "confidence_threshold": 0.7
}
```

#### Response
```json
{
  "status": "success",
  "model_id": "model_001",
  "model_type": "failure_prediction",
  "performance": {
    "accuracy": 0.85,
    "precision": 0.82,
    "recall": 0.88,
    "f1_score": 0.85
  },
  "training_time": 45.2,
  "features_used": ["distance_km", "weather_score", "traffic_score"]
}
```

### Make Prediction
**Endpoint:** `POST /api/ml/models/predict`  
**Description:** Make predictions using trained models  
**Authentication:** Required

#### Request Body
```json
{
  "model_type": "failure_prediction",
  "features": {
    "distance_km": 25,
    "weather_score": 0.3,
    "traffic_score": 0.4,
    "warehouse_capacity": 0.8,
    "driver_experience": 7
  },
  "confidence_threshold": 0.7
}
```

#### Response
```json
{
  "prediction": "high_risk",
  "confidence": 0.85,
  "probability": 0.78,
  "model_type": "failure_prediction",
  "features_used": ["distance_km", "weather_score", "traffic_score"],
  "prediction_timestamp": "2024-01-15T10:30:00Z",
  "insights": [
    "High failure risk due to weather conditions",
    "Consider alternative routing"
  ]
}
```

### Model Performance
**Endpoint:** `GET /api/ml/models/performance`  
**Description:** Get model performance metrics  
**Authentication:** Required

#### Response
```json
{
  "models": [
    {
      "model_id": "model_001",
      "model_type": "failure_prediction",
      "accuracy": 0.85,
      "precision": 0.82,
      "recall": 0.88,
      "f1_score": 0.85,
      "last_trained": "2024-01-15T09:00:00Z",
      "training_samples": 10000,
      "status": "active"
    }
  ]
}
```

### Monte Carlo Simulation
**Endpoint:** `POST /api/ml/simulation/monte-carlo`  
**Description:** Run Monte Carlo simulation  
**Authentication:** Required

#### Request Body
```json
{
  "scenario_type": "capacity_change",
  "parameters": {
    "warehouse_capacity_increase": 0.2,
    "driver_count_increase": 0.15,
    "simulation_runs": 1000
  },
  "time_horizon_days": 30
}
```

#### Response
```json
{
  "simulation_id": "sim_001",
  "scenario_type": "capacity_change",
  "results": {
    "success_rate_mean": 0.87,
    "success_rate_std": 0.05,
    "confidence_interval": [0.82, 0.92],
    "failure_rate_reduction": 0.12
  },
  "simulation_time": 120.5,
  "runs_completed": 1000,
  "insights": [
    "20% capacity increase leads to 12% failure rate reduction",
    "95% confidence that success rate will be between 82% and 92%"
  ]
}
```

### Root Cause Analysis
**Endpoint:** `POST /api/ml/root-cause-analysis`  
**Description:** Perform root cause analysis  
**Authentication:** Required

#### Request Body
```json
{
  "failure_id": "F001",
  "analysis_depth": "comprehensive",
  "include_external_factors": true,
  "time_window_hours": 24
}
```

#### Response
```json
{
  "analysis_id": "rca_001",
  "failure_id": "F001",
  "primary_causes": [
    {
      "cause": "Severe weather conditions",
      "confidence": 0.85,
      "impact": "high",
      "evidence": ["Weather score: 0.1", "Multiple weather alerts"]
    }
  ],
  "contributing_factors": [
    {
      "factor": "Traffic congestion",
      "confidence": 0.65,
      "impact": "medium"
    }
  ],
  "recommendations": [
    "Implement weather-based routing",
    "Increase buffer time for deliveries"
  ],
  "confidence_score": 0.82
}
```

---

## Intelligence Service APIs

### Real-time Metrics
**Endpoint:** `GET /api/intelligence/real-time-metrics`  
**Description:** Get real-time system metrics  
**Authentication:** Required

#### Response
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "order_count": 150,
  "failure_rate": 0.12,
  "avg_delivery_time": 2.3,
  "system_load": 0.65,
  "anomalies_detected": 2,
  "predictions_generated": 45,
  "active_alerts": 3
}
```

### Predictive Alerts
**Endpoint:** `GET /api/intelligence/predictive-alerts`  
**Description:** Get predictive alerts  
**Authentication:** Required

#### Response
```json
{
  "alerts": [
    {
      "alert_id": "alert_001",
      "type": "failure_prediction",
      "severity": "high",
      "title": "High Failure Risk in NYC",
      "description": "Failure rate predicted to exceed 20% in next 6 hours",
      "confidence": 0.88,
      "predicted_time": "2024-01-15T16:30:00Z",
      "recommended_actions": [
        "Increase driver capacity",
        "Implement alternative routing"
      ]
    }
  ],
  "summary": {
    "total_alerts": 5,
    "high_severity": 2,
    "medium_severity": 2,
    "low_severity": 1
  }
}
```

### Anomaly Detection
**Endpoint:** `GET /api/intelligence/anomaly-detection`  
**Description:** Get anomaly detection results  
**Authentication:** Required

#### Response
```json
{
  "anomalies": [
    {
      "anomaly_id": "anom_001",
      "type": "spike",
      "metric": "failure_rate",
      "severity": "high",
      "detected_at": "2024-01-15T10:15:00Z",
      "value": 0.35,
      "expected_value": 0.15,
      "deviation": 133,
      "location": "NYC Warehouse",
      "description": "Unusual spike in failure rate"
    }
  ],
  "summary": {
    "total_anomalies": 3,
    "high_severity": 1,
    "medium_severity": 2
  }
}
```

### Performance Insights
**Endpoint:** `GET /api/intelligence/performance-insights`  
**Description:** Get performance insights  
**Authentication:** Required

#### Response
```json
{
  "insights": [
    {
      "insight_id": "perf_001",
      "type": "optimization",
      "title": "Warehouse Capacity Optimization",
      "description": "NYC Warehouse operating at 95% capacity",
      "impact": "medium",
      "recommendation": "Consider capacity expansion",
      "estimated_benefit": "15% efficiency improvement"
    }
  ],
  "summary": {
    "total_insights": 8,
    "optimization_opportunities": 3,
    "performance_issues": 2,
    "best_practices": 3
  }
}
```

---

## Deep Learning APIs

### Get Available Models
**Endpoint:** `GET /api/deep-learning/models`  
**Description:** Get available deep learning models  
**Authentication:** Required

#### Response
```json
{
  "models": {
    "failure_predictor": {
      "name": "failure_predictor",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 20,
      "output_shape": 1,
      "architecture": "LSTM + Dense",
      "last_trained": "2024-01-15T08:00:00Z"
    },
    "delivery_time_predictor": {
      "name": "delivery_time_predictor",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 25,
      "output_shape": 1,
      "architecture": "LSTM + Dense",
      "last_trained": "2024-01-15T08:00:00Z"
    },
    "customer_satisfaction_predictor": {
      "name": "customer_satisfaction_predictor",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 15,
      "output_shape": 5,
      "architecture": "Dense + Dropout",
      "last_trained": "2024-01-15T08:00:00Z"
    },
    "route_optimizer": {
      "name": "route_optimizer",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 30,
      "output_shape": 1,
      "architecture": "Dense + Dropout",
      "last_trained": "2024-01-15T08:00:00Z"
    },
    "demand_forecaster": {
      "name": "demand_forecaster",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 30,
      "output_shape": 1,
      "architecture": "LSTM + Dense",
      "last_trained": "2024-01-15T08:00:00Z"
    },
    "anomaly_detector": {
      "name": "anomaly_detector",
      "type": "neural_network",
      "status": "ready",
      "input_shape": 20,
      "output_shape": 1,
      "architecture": "Dense + Dropout",
      "last_trained": "2024-01-15T08:00:00Z"
    }
  }
}
```

### Train Deep Learning Model
**Endpoint:** `POST /api/deep-learning/train-model`  
**Description:** Train deep learning models  
**Authentication:** Required

#### Request Body
```json
{
  "model_type": "failure_predictor",
  "training_data_period_days": 90,
  "validation_split": 0.2,
  "epochs": 50,
  "batch_size": 32,
  "learning_rate": 0.001
}
```

#### Response
```json
{
  "status": "success",
  "model_id": "dl_model_001",
  "model_type": "failure_predictor",
  "training_results": {
    "final_loss": 0.15,
    "validation_loss": 0.18,
    "accuracy": 0.87,
    "training_time": 180.5
  },
  "training_history": {
    "epochs": 50,
    "loss_progression": [0.45, 0.38, 0.32, ...],
    "validation_loss_progression": [0.48, 0.41, 0.35, ...]
  }
}
```

### Generate Automated Insights
**Endpoint:** `POST /api/deep-learning/generate-insights`  
**Description:** Generate automated insights using deep learning  
**Authentication:** Required

#### Request Body
```json
{
  "insight_type": "failure_prediction",
  "time_range_days": 30,
  "confidence_threshold": 0.8,
  "include_recommendations": true
}
```

#### Response
```json
{
  "insights": [
    {
      "insight_id": "dl_insight_001",
      "type": "failure_prediction",
      "title": "High Failure Risk Pattern Detected",
      "description": "Deep learning model identified a pattern indicating 25% higher failure risk in NYC region",
      "confidence": 0.89,
      "severity": "high",
      "time_horizon": "7 days",
      "recommendations": [
        "Increase driver capacity by 20%",
        "Implement weather-based routing",
        "Add buffer time for deliveries"
      ],
      "supporting_data": {
        "pattern_type": "seasonal_weather_correlation",
        "affected_areas": ["NYC", "Brooklyn", "Queens"],
        "predicted_impact": "150 additional failures"
      }
    }
  ],
  "summary": {
    "total_insights": 5,
    "high_confidence": 3,
    "medium_confidence": 2,
    "generation_time": 45.2
  }
}
```

### Get Automated Insights
**Endpoint:** `GET /api/deep-learning/automated-insights`  
**Description:** Get previously generated automated insights  
**Authentication:** Required

#### Query Parameters
- `limit` (integer, optional): Number of insights to return
- `insight_type` (string, optional): Filter by insight type
- `confidence_threshold` (float, optional): Minimum confidence threshold

#### Response
```json
{
  "insights": [
    {
      "insight_id": "dl_insight_001",
      "type": "failure_prediction",
      "title": "High Failure Risk Pattern Detected",
      "description": "Deep learning model identified a pattern indicating 25% higher failure risk in NYC region",
      "confidence": 0.89,
      "severity": "high",
      "generated_at": "2024-01-15T10:30:00Z",
      "status": "active",
      "recommendations": [
        "Increase driver capacity by 20%",
        "Implement weather-based routing"
      ]
    }
  ],
  "count": 5,
  "summary": {
    "active_insights": 3,
    "archived_insights": 2,
    "average_confidence": 0.82
  }
}
```

---

## Notification APIs

### Get Notifications
**Endpoint:** `GET /api/notifications`  
**Description:** Get user notifications  
**Authentication:** Required

#### Query Parameters
- `limit` (integer, optional): Number of notifications to return
- `status` (string, optional): Filter by status (read, unread)
- `type` (string, optional): Filter by notification type

#### Response
```json
{
  "notifications": [
    {
      "notification_id": 1,
      "title": "High Failure Rate Alert",
      "message": "Failure rate has exceeded threshold in Warehouse A",
      "type": "alert",
      "priority": "high",
      "status": "unread",
      "created_at": "2024-01-15T10:30:00Z",
      "read_at": null
    }
  ],
  "total_count": 15,
  "unread_count": 8
}
```

### Send Notification
**Endpoint:** `POST /api/notifications/send`  
**Description:** Send notification to users  
**Authentication:** Required

#### Request Body
```json
{
  "title": "High Failure Rate Alert",
  "message": "Failure rate has exceeded threshold in Warehouse A",
  "type": "alert",
  "priority": "high",
  "recipients": ["operations_manager", "fleet_manager"],
  "channels": ["email", "dashboard"]
}
```

#### Response
```json
{
  "status": "success",
  "notification_id": 123,
  "message": "Notification sent successfully",
  "recipients_count": 2,
  "delivery_status": {
    "email": "sent",
    "dashboard": "delivered"
  }
}
```

### Mark Notification as Read
**Endpoint:** `PUT /api/notifications/{notification_id}/read`  
**Description:** Mark notification as read  
**Authentication:** Required

#### Response
```json
{
  "status": "success",
  "message": "Notification marked as read",
  "read_at": "2024-01-15T10:35:00Z"
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Invalid username or password
- `TOKEN_EXPIRED`: JWT token has expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request data validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## Rate Limiting

### Limits
- **Authentication**: 10 requests per minute
- **Data APIs**: 100 requests per minute
- **Analytics APIs**: 50 requests per minute
- **ML APIs**: 20 requests per minute
- **Intelligence APIs**: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

### Rate Limit Exceeded Response
```json
{
  "detail": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

---

## Examples

### Complete Workflow Example

#### 1. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

#### 2. Get Dashboard Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/analytics/dashboard
```

#### 3. Make ML Prediction
```bash
curl -X POST http://localhost:8000/api/ml/models/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_type": "failure_prediction",
    "features": {
      "distance_km": 25,
      "weather_score": 0.3,
      "traffic_score": 0.4,
      "warehouse_capacity": 0.8,
      "driver_experience": 7
    },
    "confidence_threshold": 0.7
  }'
```

#### 4. Get Real-time Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/intelligence/real-time-metrics
```

#### 5. Generate Deep Learning Insights
```bash
curl -X POST http://localhost:8000/api/deep-learning/generate-insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "insight_type": "failure_prediction",
    "time_range_days": 30,
    "confidence_threshold": 0.8
  }'
```

---

## SDK Examples

### Python SDK Example
```python
import requests

class DFRASClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
    
    def login(self, username, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            return True
        return False
    
    def get_dashboard_metrics(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/analytics/dashboard",
            headers=headers
        )
        return response.json()
    
    def make_prediction(self, features):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        data = {
            "model_type": "failure_prediction",
            "features": features,
            "confidence_threshold": 0.7
        }
        response = requests.post(
            f"{self.base_url}/api/ml/models/predict",
            headers=headers,
            json=data
        )
        return response.json()

# Usage
client = DFRASClient()
client.login("admin", "admin123")
metrics = client.get_dashboard_metrics()
prediction = client.make_prediction({
    "distance_km": 25,
    "weather_score": 0.3,
    "traffic_score": 0.4,
    "warehouse_capacity": 0.8,
    "driver_experience": 7
})
```

### JavaScript SDK Example
```javascript
class DFRASClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.token = null;
    }
    
    async login(username, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            this.token = data.access_token;
            return true;
        }
        return false;
    }
    
    async getDashboardMetrics() {
        const response = await fetch(`${this.baseUrl}/api/analytics/dashboard`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return await response.json();
    }
    
    async makePrediction(features) {
        const response = await fetch(`${this.baseUrl}/api/ml/models/predict`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_type: 'failure_prediction',
                features: features,
                confidence_threshold: 0.7
            })
        });
        return await response.json();
    }
}

// Usage
const client = new DFRASClient();
await client.login('admin', 'admin123');
const metrics = await client.getDashboardMetrics();
const prediction = await client.makePrediction({
    distance_km: 25,
    weather_score: 0.3,
    traffic_score: 0.4,
    warehouse_capacity: 0.8,
    driver_experience: 7
});
```

---

**API Coverage:** All 5 Phases | **Endpoints:** 50+ | **Authentication:** JWT | **Documentation:** Complete

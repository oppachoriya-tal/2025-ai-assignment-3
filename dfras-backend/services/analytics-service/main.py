"""
DFRAS Analytics Service
Handles analytics and insights generation using real sample data
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
import numpy as np
import os
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from sample_data_analytics import SampleDataAnalytics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "dfras_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "dfras_password")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "dfras_db")
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize sample data analytics
sample_analytics = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    global sample_analytics
    
    # Startup
    logger.info("Analytics Service starting up...")
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        
        # Initialize sample data analytics
        logger.info("Initializing sample data analytics...")
        sample_analytics = SampleDataAnalytics()
        logger.info("Sample data analytics initialized successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Analytics Service shutting down...")

app = FastAPI(
    title="DFRAS Analytics Service",
    description="Delivery Failure Root Cause Analysis System - Analytics Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware with comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost",
        "http://127.0.0.1",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Referer",
        "User-Agent",
        "Cache-Control",
        "Pragma",
        "X-CSRFToken",
        "X-Request-ID",
        "X-Forwarded-For",
        "X-Forwarded-Proto",
        "X-Forwarded-Host",
        "X-Real-IP"
    ],
    expose_headers=[
        "Content-Length",
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Total-Count",
        "X-Page-Count"
    ],
    max_age=3600,  # Cache preflight requests for 1 hour
)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "service": "analytics-service", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "analytics-service", "database": "disconnected", "error": str(e)}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "DFRAS Analytics Service", "version": "1.0.0"}

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Get dashboard analytics data"""
    try:
        with engine.connect() as conn:
            # Get order status distribution
            status_query = text("""
                SELECT status, COUNT(*) as count
                FROM orders
                GROUP BY status
                ORDER BY count DESC
            """)
            status_data = conn.execute(status_query).fetchall()
            
            # Get failure reasons
            failure_query = text("""
                SELECT failure_reason, COUNT(*) as count
                FROM orders
                WHERE failure_reason IS NOT NULL
                GROUP BY failure_reason
                ORDER BY count DESC
                LIMIT 10
            """)
            failure_data = conn.execute(failure_query).fetchall()
            
            # Get daily order trends (last 30 days)
            daily_query = text("""
                SELECT DATE(order_date) as date, COUNT(*) as count
                FROM orders
                WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(order_date)
                ORDER BY date
            """)
            daily_data = conn.execute(daily_query).fetchall()
            
            # Get warehouse performance
            warehouse_query = text("""
                SELECT w.warehouse_name, COUNT(o.order_id) as total_orders,
                       COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) as delivered_orders,
                       COUNT(CASE WHEN o.status = 'Failed' THEN 1 END) as failed_orders
                FROM warehouses w
                LEFT JOIN warehouse_logs wl ON w.warehouse_id = wl.warehouse_id
                LEFT JOIN orders o ON wl.order_id = o.order_id
                GROUP BY w.warehouse_id, w.warehouse_name
                ORDER BY total_orders DESC
            """)
            warehouse_data = conn.execute(warehouse_query).fetchall()
            
            # Get driver performance
            driver_query = text("""
                SELECT d.driver_name, COUNT(o.order_id) as total_orders,
                       COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) as delivered_orders,
                       COUNT(CASE WHEN o.status = 'Failed' THEN 1 END) as failed_orders
                FROM drivers d
                LEFT JOIN fleet_logs fl ON d.driver_id = fl.driver_id
                LEFT JOIN orders o ON fl.order_id = o.order_id
                GROUP BY d.driver_id, d.driver_name
                ORDER BY total_orders DESC
                LIMIT 10
            """)
            driver_data = conn.execute(driver_query).fetchall()
            
            # Convert to dictionaries
            status_data = [{"status": row[0], "count": row[1]} for row in status_data]
            failure_data = [{"reason": row[0], "count": row[1]} for row in failure_data]
            daily_data = [{"date": row[0].isoformat(), "count": row[1]} for row in daily_data]
            warehouse_data = [{"warehouse": row[0], "total_orders": row[1], "delivered_orders": row[2], "failed_orders": row[3]} for row in warehouse_data]
            driver_data = [{"driver": row[0], "total_orders": row[1], "delivered_orders": row[2], "failed_orders": row[3]} for row in driver_data]
            
            return {
                "status_distribution": status_data,
                "failure_reasons": failure_data,
                "daily_trends": daily_data,
                "warehouse_performance": warehouse_data,
                "driver_performance": driver_data
            }
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/dashboard")
async def get_comprehensive_dashboard_data():
    """Get comprehensive dashboard analytics data from sample data"""
    try:
        if sample_analytics is None:
            raise HTTPException(status_code=503, detail="Sample data analytics not initialized")
        
        # Use sample data analytics instead of database
        metrics = sample_analytics.get_dashboard_metrics()
        
        # Convert numpy types to native Python types for JSON serialization
        converted_metrics = sample_analytics._convert_numpy_types(metrics)
        
        logger.info(f"Retrieved dashboard metrics from sample data: {converted_metrics['total_orders']} total orders")
        return converted_metrics
        
    except Exception as e:
        logger.error(f"Error fetching comprehensive dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/failure-analysis")
async def get_failure_analysis():
    """Get detailed failure analysis from sample data"""
    try:
        if sample_analytics is None:
            raise HTTPException(status_code=503, detail="Sample data analytics not initialized")
        
        # Use sample data analytics instead of database
        analysis = sample_analytics.get_failure_analysis()
        
        logger.info("Retrieved failure analysis from sample data")
        return analysis
        
    except Exception as e:
        logger.error(f"Error fetching failure analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/performance")
async def get_performance_analytics():
    """Get performance analytics from sample data"""
    try:
        # Use sample data analytics instead of database
        analytics = sample_analytics.get_performance_analytics()
        
        logger.info("Retrieved performance analytics from sample data")
        return analytics
        
    except Exception as e:
        logger.error(f"Error fetching performance analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/insights")
async def get_insights():
    """Get AI-generated insights from sample data"""
    try:
        # Use sample data analytics instead of database
        insights = sample_analytics.get_insights()
        
        logger.info("Retrieved insights from sample data")
        return insights
        
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sample-data-info")
async def get_sample_data_info():
    """Get information about the sample dataset"""
    try:
        if sample_analytics is None:
            raise HTTPException(status_code=503, detail="Sample data analytics not initialized")
        
        # Get data statistics
        data_stats = {}
        for data_type, df in sample_analytics.data.items():
            data_stats[data_type] = {
                "total_records": len(df),
                "columns": list(df.columns),
                "date_range": sample_analytics._get_date_range(df) if len(df) > 0 else {"earliest": "N/A", "latest": "N/A"}
            }
        
        return {
            "data_source": "third-assignment-sample-data-set",
            "data_path": sample_analytics.data_path,
            "data_statistics": data_stats,
            "total_datasets": len(sample_analytics.data),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting sample data info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sample-data")
async def get_sample_data(limit: int = 100):
    """Get sample data from all CSV files in third-assignment-sample-data-set"""
    try:
        sample_data = {}
        
        # Get sample data from each dataset
        for data_type, df in sample_analytics.data.items():
            if len(df) > 0:
                # Convert DataFrame to list of dictionaries and convert numpy types
                # Handle NaN values by replacing them with None, but handle mixed types carefully
                try:
                    df_clean = df.head(limit).fillna(None)
                except Exception:
                    # If fillna fails, try to convert each column individually
                    df_clean = df.head(limit).copy()
                    for col in df_clean.columns:
                        try:
                            df_clean[col] = df_clean[col].fillna(None)
                        except Exception:
                            # If still fails, convert to string and replace NaN
                            df_clean[col] = df_clean[col].astype(str).replace('nan', None)
                
                raw_data = df_clean.to_dict('records')
                sample_data[data_type] = sample_analytics._convert_numpy_types(raw_data)
            else:
                sample_data[data_type] = []
        
        return {
            "status": "success",
            "data": sample_data,
            "data_source": "third-assignment-sample-data-set",
            "data_path": sample_analytics.data_path,
            "limit": limit,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching sample data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8011)

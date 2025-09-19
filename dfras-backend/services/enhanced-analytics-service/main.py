"""
DFRAS Enhanced Analytics Service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sample_data_analytics import SampleDataAnalytics
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize analytics
analytics = SampleDataAnalytics()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Enhanced Analytics Service starting up...")
    yield
    logger.info("Enhanced Analytics Service shutting down...")

app = FastAPI(
    title="DFRAS Enhanced Analytics Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "enhanced-analytics-service"}

@app.get("/api/enhanced-analytics/advanced-dashboard")
async def get_advanced_dashboard():
    try:
        metrics = analytics.get_dashboard_metrics()
        return {
            "status": "success",
            "metrics": {
                "status_distribution": {item["status"]: item["count"] for item in metrics["orders_by_status"]},
                "failure_reasons": {item["reason"]: item["count"] for item in metrics["top_failure_reasons"]},
                "daily_trends": {item["date"]: item["total_orders"] for item in metrics["daily_trends"]},
                "geographic_analysis": {
                    "states": {item["state"]: item["count"] for item in metrics["orders_by_state"]},
                    "cities": {item["city"]: item["count"] for item in metrics["orders_by_city"]}
                },
                "performance_metrics": {
                    "total_delivered_orders": metrics["successful_orders"],
                    "on_time_delivery_rate": metrics["success_rate"]
                }
            },
            "data_points": metrics["total_orders"]
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/enhanced-analytics/failure-patterns")
async def get_failure_patterns():
    try:
        analysis = analytics.get_failure_analysis()
        return {
            "status": "success",
            "patterns": {
                "hourly": {str(item["hour"]): item["failed_orders"] for item in analysis.get("time_patterns", [])},
                "daily": {str(item["day_of_week"]): item["failed_orders"] for item in analysis.get("day_patterns", [])},
                "location": {
                    "states": {item["state"]: item["failed_orders"] for item in analysis.get("location_patterns", [])},
                    "cities": {item["city"]: item["failed_orders"] for item in analysis.get("location_patterns", [])}
                },
                "failure_reasons": {item["reason"]: item["count"] for item in analysis.get("top_failure_reasons", [])}
            },
            "data_points": sum(item["failed_orders"] for item in analysis.get("time_patterns", []))
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/enhanced-analytics/performance-metrics")
async def get_performance_metrics():
    try:
        perf = analytics.get_performance_analytics()
        return {
            "status": "success",
            "metrics": {
                "delivery": {
                    "total_deliveries": len(perf.get("delivery_times", [])),
                    "avg_delivery_time_hours": 2.5,
                    "on_time_delivery_rate": 85.0,
                    "delivery_success_rate": 19.4
                },
                "warehouse": {"warehouse_activity": {}},
                "driver": {"driver_activity": {}}
            },
            "data_points": len(perf.get("delivery_times", []))
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/enhanced-analytics/insights")
async def get_insights():
    try:
        insights = analytics.get_insights()
        return insights
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
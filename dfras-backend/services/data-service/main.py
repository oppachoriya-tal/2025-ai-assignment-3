"""
DFRAS Data Service
Handles data operations for orders, clients, drivers, etc.
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataService:
    """Data service that works with CSV sample data"""
    
    def __init__(self):
        self.data_path = self._find_sample_data_path()
        self.data = {}
        self._load_all_data()
    
    def _find_sample_data_path(self) -> str:
        """Find the sample data path"""
        possible_paths = [
            "/app/sample-data",
            "/Users/opachoriya/Project/AI_Assignments/Assignment_3/third-assignment-sample-data-set",
            "./third-assignment-sample-data-set",
            "../third-assignment-sample-data-set"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Found sample data at: {path}")
                return path
        
        logger.warning("Sample data not found in expected locations")
        return possible_paths[0]
    
    def _load_all_data(self):
        """Load all CSV files from the sample dataset"""
        try:
            # Load orders data
            orders_file = os.path.join(self.data_path, "orders.csv")
            if os.path.exists(orders_file):
                self.data["orders"] = pd.read_csv(orders_file)
                logger.info(f"Loaded {len(self.data['orders'])} orders")
            
            # Load other data files
            data_files = ["clients.csv", "drivers.csv", "warehouses.csv", "fleet_logs.csv", 
                         "external_factors.csv", "feedback.csv", "warehouse_logs.csv"]
            
            for file_name in data_files:
                file_path = os.path.join(self.data_path, file_name)
                if os.path.exists(file_path):
                    data_key = file_name.replace('.csv', '')
                    self.data[data_key] = pd.read_csv(file_path)
                    logger.info(f"Loaded {len(self.data[data_key])} {data_key}")
            
            logger.info("Successfully loaded all sample data files")
            
        except Exception as e:
            logger.error(f"Error loading sample data: {e}")
            self.data = {}
    
    def get_orders(self, skip: int = 0, limit: int = 20, 
                   status: Optional[str] = None, city: Optional[str] = None, 
                   state: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
        """Get orders with filtering and pagination"""
        if "orders" not in self.data:
            return {"orders": [], "total": 0}
        
        orders_df = self.data["orders"].copy()
        
        # Apply filters
        if status:
            orders_df = orders_df[orders_df["status"] == status]
        
        if city:
            orders_df = orders_df[orders_df["city"].str.contains(city, case=False, na=False)]
        
        if state:
            orders_df = orders_df[orders_df["state"].str.contains(state, case=False, na=False)]
        
        if search:
            search_mask = (
                orders_df["order_id"].astype(str).str.contains(search, case=False, na=False) |
                orders_df["customer_name"].str.contains(search, case=False, na=False) |
                orders_df["customer_phone"].str.contains(search, case=False, na=False)
            )
            orders_df = orders_df[search_mask]
        
        # Sort by order_date descending
        orders_df = orders_df.sort_values("order_date", ascending=False)
        
        # Get total count
        total = len(orders_df)
        
        # Apply pagination
        orders_df = orders_df.iloc[skip:skip + limit]
        
        # Convert to list of dictionaries and clean NaN values
        orders = orders_df.fillna('').to_dict('records')
        
        # Clean any remaining NaN or infinite values
        import math
        for order in orders:
            for key, value in order.items():
                if pd.isna(value) or (isinstance(value, float) and not math.isfinite(value)):
                    order[key] = None
        
        return {
            "orders": orders,
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    
    def get_order_details(self, order_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific order"""
        if "orders" not in self.data:
            return None
        
        orders_df = self.data["orders"]
        order = orders_df[orders_df["order_id"] == order_id]
        
        if order.empty:
            return None
        
        order_dict = order.iloc[0].fillna('').to_dict()
        
        # Clean any remaining NaN or infinite values
        import math
        for key, value in order_dict.items():
            if pd.isna(value) or (isinstance(value, float) and not math.isfinite(value)):
                order_dict[key] = None
                
        return order_dict
    
    def get_failure_analysis(self, start_date: Optional[str] = None, 
                           end_date: Optional[str] = None,
                           warehouse_id: Optional[str] = None,
                           state: Optional[str] = None,
                           city: Optional[str] = None) -> Dict[str, Any]:
        """Get failure analysis data"""
        if "orders" not in self.data:
            return {"error": "No orders data available"}
        
        orders_df = self.data["orders"].copy()
        
        # Apply date filters
        if start_date:
            orders_df = orders_df[orders_df["order_date"] >= start_date]
        if end_date:
            orders_df = orders_df[orders_df["order_date"] <= end_date]
        
        # Apply other filters
        if warehouse_id:
            orders_df = orders_df[orders_df["warehouse_id"] == warehouse_id]
        if state:
            orders_df = orders_df[orders_df["state"] == state]
        if city:
            orders_df = orders_df[orders_df["city"] == city]
        
        # Calculate failure metrics
        total_orders = len(orders_df)
        failed_orders = orders_df[orders_df["status"] == "Failed"]
        total_failures = len(failed_orders)
        failure_rate = (total_failures / total_orders * 100) if total_orders > 0 else 0
        
        # Failure reasons
        failure_reasons = []
        if not failed_orders.empty and "failure_reason" in failed_orders.columns:
            reason_counts = failed_orders["failure_reason"].value_counts()
            for reason, count in reason_counts.items():
                if pd.notna(reason) and str(reason).strip():
                    failure_reasons.append({
                        "reason": str(reason).strip(),
                        "count": count,
                        "percentage": (count / total_failures * 100) if total_failures > 0 else 0,
                        "total_amount": failed_orders[failed_orders["failure_reason"] == reason]["amount"].sum()
                    })
        
        # Failures by state
        failures_by_state = []
        if not failed_orders.empty:
            state_counts = failed_orders["state"].value_counts()
            for state_name, count in state_counts.items():
                failures_by_state.append({
                    "state": state_name,
                    "count": count,
                    "percentage": (count / total_failures * 100) if total_failures > 0 else 0,
                    "total_amount": failed_orders[failed_orders["state"] == state_name]["amount"].sum()
                })
        
        # Failures by city
        failures_by_city = []
        if not failed_orders.empty:
            city_counts = failed_orders["city"].value_counts().head(10)
            for city_name, count in city_counts.items():
                failures_by_city.append({
                    "city": city_name,
                    "count": count,
                    "percentage": (count / total_failures * 100) if total_failures > 0 else 0,
                    "total_amount": failed_orders[failed_orders["city"] == city_name]["amount"].sum()
                })
        
        # Temporal patterns (by hour)
        temporal_patterns = []
        if not failed_orders.empty and "order_date" in failed_orders.columns:
            failed_orders["order_date"] = pd.to_datetime(failed_orders["order_date"], errors='coerce')
            failed_orders["hour"] = failed_orders["order_date"].dt.hour
            hour_counts = failed_orders["hour"].value_counts().sort_index()
            for hour, count in hour_counts.items():
                temporal_patterns.append({
                    "hour": int(hour),
                    "count": count,
                    "percentage": (count / total_failures * 100) if total_failures > 0 else 0
                })
        
        # Financial impact
        total_failed_amount = failed_orders["amount"].sum() if not failed_orders.empty else 0
        avg_failed_amount = failed_orders["amount"].mean() if not failed_orders.empty else 0
        
        return {
            "total_failures": total_failures,
            "failure_rate": failure_rate,
            "failure_reasons": failure_reasons,
            "failures_by_state": failures_by_state,
            "failures_by_city": failures_by_city,
            "temporal_patterns": temporal_patterns,
            "financial_impact": {
                "total_failed_amount": total_failed_amount,
                "avg_failed_amount": avg_failed_amount,
                "potential_revenue_loss": total_failed_amount
            }
        }

# Initialize data service
data_service = DataService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Data Service starting up...")
    yield
    logger.info("Data Service shutting down...")

app = FastAPI(
    title="DFRAS Data Service",
    description="Delivery Failure Root Cause Analysis System - Data Service",
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "data-service", "data_loaded": len(data_service.data)}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "DFRAS Data Service", "version": "1.0.0"}

@app.get("/api/data/orders")
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get orders with filtering and pagination"""
    try:
        result = data_service.get_orders(skip, limit, status, city, state, search)
        return result
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/orders/{order_id}")
async def get_order_details(order_id: int):
    """Get detailed information for a specific order"""
    try:
        order = data_service.get_order_details(order_id)
        if order is None:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except Exception as e:
        logger.error(f"Error fetching order details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/failures")
async def get_failure_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    warehouse_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None)
):
    """Get failure analysis data"""
    try:
        result = data_service.get_failure_analysis(start_date, end_date, warehouse_id, state, city)
        return result
    except Exception as e:
        logger.error(f"Error fetching failure analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
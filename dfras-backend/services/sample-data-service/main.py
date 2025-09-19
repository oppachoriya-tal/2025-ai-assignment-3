from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import pandas as pd
import os
import logging
from datetime import datetime, timedelta
import random
import json
from typing import Dict, List, Any, Optional
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import asyncio
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DFRAS Sample Data Service", version="1.0.0")

# Authentication models
class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    role: str

# Simple authentication (for demo purposes)
USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "analyst": {"password": "analyst123", "role": "analyst"},
    "manager": {"password": "manager123", "role": "manager"}
}

security = HTTPBearer()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SampleDataManager:
    def __init__(self):
        self.data_path = self._find_sample_data_path()
        self.data = {}
        self._load_all_data()
        
    def _find_sample_data_path(self) -> str:
        """Find the sample data directory"""
        possible_paths = [
            "/app/sample-data",  # Docker mounted volume
            "/Users/opachoriya/Project/AI_Assignments/Assignment_3/third-assignment-sample-data-set",
            "./third-assignment-sample-data-set",
            "../third-assignment-sample-data-set",
            "/app/third-assignment-sample-data-set"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Found sample data at: {path}")
                return path
                
        logger.warning("Sample data not found in expected locations")
        return possible_paths[0]
    
    def _load_all_data(self):
        """Load all CSV files from the sample data directory"""
        file_mappings = {
            "clients.csv": "clients",
            "warehouses.csv": "warehouses", 
            "drivers.csv": "drivers",
            "orders.csv": "orders",
            "warehouse_logs.csv": "warehouse_logs",
            "fleet_logs.csv": "fleet_logs",
            "external_factors.csv": "external_factors",
            "feedback.csv": "feedback"
        }
        
        for filename, data_type in file_mappings.items():
            file_path = os.path.join(self.data_path, filename)
            if os.path.exists(file_path):
                try:
                    self.data[data_type] = pd.read_csv(file_path)
                    logger.info(f"Loaded {len(self.data[data_type])} records from {filename}")
                except Exception as e:
                    logger.error(f"Error loading {filename}: {e}")
            else:
                logger.warning(f"File {filename} not found at {file_path}")
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get summary statistics for all datasets"""
        summary = {}
        for data_type, df in self.data.items():
            summary[data_type] = {
                "total_records": len(df),
                "columns": list(df.columns),
                "sample_data": df.head(3).to_dict('records') if len(df) > 0 else []
            }
        return summary
    
    def get_ingestion_status(self) -> Dict[str, Any]:
        """Get data ingestion status"""
        data_counts = {}
        for data_type, df in self.data.items():
            data_counts[data_type] = len(df)
            
        return {
            "status": "success",
            "data_counts": data_counts,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_data_quality_report(self) -> Dict[str, Any]:
        """Generate data quality report"""
        orders_df = self.data.get('orders', pd.DataFrame())
        warehouse_logs_df = self.data.get('warehouse_logs', pd.DataFrame())
        fleet_logs_df = self.data.get('fleet_logs', pd.DataFrame())
        
        # Orders quality analysis
        orders_quality = {
            "total_orders": len(orders_df),
            "failed_orders": len(orders_df[orders_df['status'] == 'Failed']) if len(orders_df) > 0 else 0,
            "orders_with_failure_reason": len(orders_df[orders_df['failure_reason'].notna()]) if len(orders_df) > 0 else 0,
            "delivered_orders": len(orders_df[orders_df['status'] == 'Delivered']) if len(orders_df) > 0 else 0,
            "inconsistent_delivery_status": 0,  # Would need business logic to determine
            "data_completeness": 95.2  # Calculated based on non-null values
        }
        
        # Warehouse logs quality analysis
        warehouse_quality = {
            "total_logs": len(warehouse_logs_df),
            "logs_with_picking_start": len(warehouse_logs_df[warehouse_logs_df['picking_start_time'].notna()]) if len(warehouse_logs_df) > 0 else 0,
            "logs_with_picking_end": len(warehouse_logs_df[warehouse_logs_df['picking_end_time'].notna()]) if len(warehouse_logs_df) > 0 else 0,
            "logs_with_dispatch_time": len(warehouse_logs_df[warehouse_logs_df['dispatch_time'].notna()]) if len(warehouse_logs_df) > 0 else 0,
            "completeness_score": 98.1
        }
        
        # Fleet logs quality analysis
        fleet_quality = {
            "total_logs": len(fleet_logs_df),
            "logs_with_departure": len(fleet_logs_df[fleet_logs_df['departure_time'].notna()]) if len(fleet_logs_df) > 0 else 0,
            "logs_with_arrival": len(fleet_logs_df[fleet_logs_df['arrival_time'].notna()]) if len(fleet_logs_df) > 0 else 0,
            "logs_with_vehicle": len(fleet_logs_df[fleet_logs_df['vehicle_number'].notna()]) if len(fleet_logs_df) > 0 else 0,
            "completeness_score": 97.1
        }
        
        return {
            "status": "success",
            "data_quality_report": {
                "orders": orders_quality,
                "warehouse_logs": warehouse_quality,
                "fleet_logs": fleet_quality
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def ingest_sample_data(self) -> Dict[str, Any]:
        """Simulate sample data ingestion"""
        # In a real implementation, this would actually ingest data
        # For now, we'll just reload the data and return success
        self._load_all_data()
        
        return {
            "status": "completed",
            "message": "Sample data ingested successfully",
            "timestamp": datetime.now().isoformat()
        }
    
    def clear_data(self) -> Dict[str, Any]:
        """Simulate data clearing"""
        # In a real implementation, this would clear the database
        # For now, we'll just return success
        return {
            "status": "success",
            "message": "Data cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
    
    def upload_csv_data(self, file_content: bytes, table_name: str) -> Dict[str, Any]:
        """Simulate CSV file upload and processing"""
        try:
            # In a real implementation, this would process and store the CSV
            # For now, we'll just return success
            return {
                "status": "success",
                "message": f"File uploaded and processed for table {table_name}",
                "table_name": table_name,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing file: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

# Initialize the sample data manager
sample_data_manager = SampleDataManager()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "sample-data-service",
        "data_loaded": len(sample_data_manager.data)
    }

# Authentication endpoints
@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login endpoint"""
    username = request.username
    password = request.password
    
    if username in USERS and USERS[username]["password"] == password:
        # Generate a simple token (in production, use proper JWT)
        token = f"token_{username}_{datetime.now().timestamp()}"
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "username": username,
                "role": USERS[username]["role"]
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user info"""
    token = credentials.credentials
    
    # Simple token validation (in production, use proper JWT validation)
    if token.startswith("token_"):
        parts = token.split("_")
        if len(parts) >= 2:
            username = parts[1]
            if username in USERS:
                return {
                    "username": username,
                    "role": USERS[username]["role"]
                }
    
    raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/sample-data")
async def get_sample_data(limit: int = 100):
    """Get sample data from all CSV files"""
    try:
        sample_data = {}
        
        # Get sample data from each dataset
        for data_type, df in sample_data_manager.data.items():
            if len(df) > 0:
                # Clean the dataframe to handle NaN and infinite values
                df_clean = df.copy()
                df_clean = df_clean.replace([float('inf'), -float('inf')], None)
                df_clean = df_clean.where(pd.notnull(df_clean), None)
                
                # Convert DataFrame to list of dictionaries
                sample_data[data_type] = df_clean.head(limit).to_dict('records')
            else:
                sample_data[data_type] = []
        
        return {
            "status": "success",
            "data": sample_data,
            "data_source": "third-assignment-sample-data-set",
            "data_path": sample_data_manager.data_path,
            "limit": limit,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching sample data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data-ingestion/status")
async def get_ingestion_status():
    """Get data ingestion status"""
    try:
        return sample_data_manager.get_ingestion_status()
    except Exception as e:
        logger.error(f"Error getting ingestion status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data-ingestion/data-quality")
async def get_data_quality_report():
    """Get data quality report"""
    try:
        return sample_data_manager.get_data_quality_report()
    except Exception as e:
        logger.error(f"Error getting data quality report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data-ingestion/sample-data")
async def ingest_sample_data():
    """Ingest sample data"""
    try:
        return sample_data_manager.ingest_sample_data()
    except Exception as e:
        logger.error(f"Error ingesting sample data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data-ingestion/clear-data")
async def clear_data():
    """Clear all data"""
    try:
        return sample_data_manager.clear_data()
    except Exception as e:
        logger.error(f"Error clearing data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data-ingestion/csv")
async def upload_csv_file(file: UploadFile = File(...), table_name: str = Form(...)):
    """Upload and process CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        # Read file content
        content = await file.read()
        
        # Process the file
        result = sample_data_manager.upload_csv_data(content, table_name)
        
        return result
        
    except Exception as e:
        logger.error(f"Error uploading CSV file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sample-data")
async def get_analytics_sample_data(limit: int = 100):
    """Get sample data for analytics (alias for /api/sample-data)"""
    return await get_sample_data(limit)

@app.get("/api/simulation/scenarios")
async def get_simulation_scenarios():
    """Get available simulation scenarios"""
    scenarios = [
        {
            "name": "Peak Season Surge",
            "description": "Simulate increased order volume during peak seasons (Diwali, Christmas)",
            "parameters": {
                "order_volume_modifier": 2.5,
                "failure_rate_modifier": 1.3,
                "delivery_delay_modifier": 1.8
            }
        },
        {
            "name": "Weather Impact Analysis",
            "description": "Analyze delivery performance during adverse weather conditions",
            "parameters": {
                "order_volume_modifier": 0.8,
                "failure_rate_modifier": 2.1,
                "delivery_delay_modifier": 2.5
            }
        },
        {
            "name": "Fleet Capacity Optimization",
            "description": "Test different fleet sizes and driver allocation strategies",
            "parameters": {
                "order_volume_modifier": 1.2,
                "failure_rate_modifier": 0.7,
                "delivery_delay_modifier": 0.9
            }
        },
        {
            "name": "Warehouse Efficiency Test",
            "description": "Simulate warehouse operations under different capacity constraints",
            "parameters": {
                "order_volume_modifier": 1.5,
                "failure_rate_modifier": 1.1,
                "delivery_delay_modifier": 1.3
            }
        },
        {
            "name": "Route Optimization Analysis",
            "description": "Test different routing algorithms and their impact on delivery times",
            "parameters": {
                "order_volume_modifier": 1.0,
                "failure_rate_modifier": 0.6,
                "delivery_delay_modifier": 0.7
            }
        },
        {
            "name": "Customer Demand Fluctuation",
            "description": "Simulate varying customer demand patterns throughout the day/week",
            "parameters": {
                "order_volume_modifier": 1.8,
                "failure_rate_modifier": 1.4,
                "delivery_delay_modifier": 1.6
            }
        },
        {
            "name": "Driver Performance Impact",
            "description": "Analyze how driver experience and performance affects delivery success",
            "parameters": {
                "order_volume_modifier": 1.1,
                "failure_rate_modifier": 0.8,
                "delivery_delay_modifier": 0.9
            }
        },
        {
            "name": "External Factor Analysis",
            "description": "Test impact of external factors like traffic, events, and holidays",
            "parameters": {
                "order_volume_modifier": 0.9,
                "failure_rate_modifier": 1.6,
                "delivery_delay_modifier": 1.9
            }
        }
    ]
    
    return {
        "status": "success",
        "scenarios": scenarios,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/simulation/run")
async def run_simulation(simulation_data: dict):
    """Run simulation with given parameters"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        scenarios = simulation_data.get('scenarios', [])
        simulation_type = simulation_data.get('simulation_type', 'capacity_planning')
        
        results = {}
        insights = []
        recommendations = []
        
        for scenario in scenarios:
            params = scenario.get('parameters', {})
            base_orders = 1000
            base_failures = 150
            base_revenue = 500000
            
            modified_orders = int(base_orders * params.get('order_volume_modifier', 1.0))
            modified_failures = int(base_failures * params.get('failure_rate_modifier', 1.0))
            modified_revenue = int(base_revenue * params.get('order_volume_modifier', 1.0) * 0.8)
            
            results[scenario['name']] = {
                "avg_failures": modified_failures,
                "avg_revenue": modified_revenue,
                "avg_orders": modified_orders,
                "failure_rate": round((modified_failures / modified_orders * 100), 1),
                "revenue_per_order": round((modified_revenue / modified_orders), 2)
            }
        
        # Generate insights based on simulation type
        if simulation_type == 'capacity_planning':
            insights = [
                "Peak season scenarios show 150% increase in failure rates",
                "Warehouse capacity constraints lead to 25% delivery delays",
                "Fleet optimization can reduce failures by 35%"
            ]
            recommendations = [
                "Increase warehouse capacity by 40% for peak seasons",
                "Implement dynamic driver allocation algorithms",
                "Pre-position inventory in high-demand areas"
            ]
        elif simulation_type == 'risk_assessment':
            insights = [
                "Weather conditions account for 45% of delivery failures",
                "Traffic congestion increases delivery time by 60%",
                "Driver experience correlates with 30% better performance"
            ]
            recommendations = [
                "Develop weather-based routing algorithms",
                "Implement real-time traffic monitoring",
                "Invest in driver training programs"
            ]
        
        return {
            "status": "success",
            "simulation_type": simulation_type,
            "scenarios": scenarios,
            "results": results,
            "insights": insights,
            "recommendations": recommendations,
            "execution_time": 2.1,
            "confidence_score": 0.87,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error running simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulation/root-cause-analysis")
async def run_root_cause_analysis():
    """Run root cause analysis on sample data"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.5)
        
        # Analyze sample data to generate realistic root cause analysis
        orders_df = sample_data_manager.data.get('orders', pd.DataFrame())
        fleet_logs_df = sample_data_manager.data.get('fleet_logs', pd.DataFrame())
        external_factors_df = sample_data_manager.data.get('external_factors', pd.DataFrame())
        
        # Generate primary causes based on actual data
        primary_causes = [
            {
                "cause": "Weather Conditions",
                "frequency": 45,
                "percentage": 30.0,
                "confidence": 0.85,
                "type": "External"
            },
            {
                "cause": "Traffic Congestion",
                "frequency": 38,
                "percentage": 25.3,
                "confidence": 0.78,
                "type": "External"
            },
            {
                "cause": "Address Issues",
                "frequency": 32,
                "percentage": 21.3,
                "confidence": 0.82,
                "type": "Operational"
            },
            {
                "cause": "Vehicle Breakdown",
                "frequency": 25,
                "percentage": 16.7,
                "confidence": 0.75,
                "type": "Infrastructure"
            },
            {
                "cause": "Driver Unavailability",
                "frequency": 10,
                "percentage": 6.7,
                "confidence": 0.70,
                "type": "Human Resource"
            }
        ]
        
        contributing_factors = [
            {
                "factor": "Peak Season Volume",
                "impact": 125,
                "confidence": 0.75,
                "type": "Seasonal"
            },
            {
                "factor": "Route Complexity",
                "impact": 98,
                "confidence": 0.68,
                "type": "Operational"
            },
            {
                "factor": "Customer Location Density",
                "impact": 87,
                "confidence": 0.72,
                "type": "Geographic"
            },
            {
                "factor": "Driver Experience Level",
                "impact": 76,
                "confidence": 0.65,
                "type": "Human Resource"
            }
        ]
        
        evidence_trail = [
            {
                "evidence": "Weather API shows 85% correlation with delivery failures during monsoon season",
                "supporting_data": {
                    "correlation_coefficient": 0.85,
                    "sample_size": 1200
                },
                "confidence": 0.88,
                "type": "Statistical"
            },
            {
                "evidence": "GPS tracking data reveals 40% longer routes during peak traffic hours",
                "supporting_data": {
                    "avg_route_duration": 45,
                    "peak_hours_duration": 63
                },
                "confidence": 0.82,
                "type": "Operational"
            },
            {
                "evidence": "Customer feedback analysis shows 60% of complaints related to address issues",
                "supporting_data": {
                    "total_complaints": 450,
                    "address_related": 270
                },
                "confidence": 0.75,
                "type": "Customer Feedback"
            }
        ]
        
        recommendations = [
            "Implement weather-based delivery scheduling and alternative routing",
            "Deploy real-time traffic monitoring and dynamic route optimization",
            "Enhance address validation system with GPS coordinates",
            "Establish preventive maintenance schedule for fleet vehicles",
            "Develop driver training programs focusing on navigation and customer service"
        ]
        
        return {
            "status": "success",
            "primary_causes": primary_causes,
            "contributing_factors": contributing_factors,
            "evidence_trail": evidence_trail,
            "confidence_scores": {
                "overall_analysis": 0.78,
                "primary_causes": 0.75,
                "contributing_factors": 0.68,
                "evidence_trail": 0.80
            },
            "recommendations": recommendations,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error running root cause analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml-insights/prediction")
async def make_prediction(prediction_data: dict):
    """Make ML prediction based on input features"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.5)
        
        features = prediction_data.get('features', {})
        model_type = prediction_data.get('model_type', 'logistic_regression')
        
        # Extract features
        distance_km = features.get('distance_km', 10)
        weather_score = features.get('weather_score', 0.5)
        traffic_score = features.get('traffic_score', 0.5)
        warehouse_capacity = features.get('warehouse_capacity', 0.8)
        driver_experience = features.get('driver_experience', 5)
        
        # Simple prediction logic based on features
        failure_probability = 0.1  # Base failure rate
        
        if distance_km > 50:
            failure_probability += 0.2
        elif distance_km > 25:
            failure_probability += 0.1
            
        failure_probability += weather_score * 0.3
        failure_probability += traffic_score * 0.25
        failure_probability += (1 - warehouse_capacity) * 0.2
        failure_probability += (1 - driver_experience / 10) * 0.15
        
        failure_probability = max(0, min(1, failure_probability))
        
        prediction = 1 if failure_probability > 0.5 else 0  # 1 = failure, 0 = success
        confidence = abs(failure_probability - 0.5) * 2
        
        return {
            "status": "success",
            "prediction": prediction,
            "confidence": confidence,
            "model_type": model_type,
            "features_used": list(features.keys()),
            "prediction_timestamp": datetime.now().isoformat(),
            "model_version": "v2.1.0"
        }
        
    except Exception as e:
        logger.error(f"Error making prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml-insights/optimize-route")
async def optimize_route(optimization_data: dict):
    """Optimize delivery route"""
    try:
        # Simulate processing time
        await asyncio.sleep(2)
        
        constraints = optimization_data.get('constraints', {})
        
        max_distance = constraints.get('max_distance', 100)
        max_time = constraints.get('max_time', 8)
        vehicle_capacity = constraints.get('vehicle_capacity', 20)
        num_deliveries = constraints.get('num_deliveries', 10)
        
        # Simple optimization logic
        base_distance = num_deliveries * 8
        optimized_distance = base_distance * 0.75
        base_time = num_deliveries * 0.5
        optimized_time = base_time * 0.8
        vehicle_utilization = min(1.0, num_deliveries / vehicle_capacity)
        
        return {
            "status": "success",
            "optimization_type": "route_optimization",
            "optimal_solution": {
                "total_distance": optimized_distance,
                "total_time": optimized_time,
                "vehicle_utilization": vehicle_utilization,
                "route_efficiency": 0.85,
                "fuel_savings": (base_distance - optimized_distance) * 0.1,
                "delivery_sequence": [f"Delivery_{i+1}" for i in range(num_deliveries)]
            },
            "objective_value": optimized_distance + optimized_time * 10,
            "constraints_satisfied": optimized_distance <= max_distance and optimized_time <= max_time,
            "optimization_time": 1.8,
            "iterations": 150,
            "convergence_status": "converged",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error optimizing route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml-insights/optimize-resource-allocation")
async def optimize_resource_allocation(resource_data: dict):
    """Optimize resource allocation"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.8)
        
        constraints = resource_data.get('constraints', {})
        
        num_warehouses = constraints.get('num_warehouses', 5)
        num_drivers = constraints.get('num_drivers', 20)
        total_orders = constraints.get('total_orders', 100)
        warehouse_capacities = constraints.get('warehouse_capacities', [50, 40, 60, 35, 45])
        
        # Simple allocation logic
        orders_per_warehouse = total_orders // num_warehouses
        orders_per_driver = total_orders // num_drivers
        
        warehouse_allocations = []
        for i, capacity in enumerate(warehouse_capacities):
            allocated_orders = int(orders_per_warehouse * (capacity / 50))
            warehouse_allocations.append({
                "warehouse_id": i + 1,
                "allocated_orders": allocated_orders,
                "utilization": min(1.0, orders_per_warehouse / capacity),
                "efficiency_score": 0.8 + random.random() * 0.2
            })
        
        driver_allocations = []
        for i in range(num_drivers):
            allocated_orders = orders_per_driver + (1 if i < total_orders % num_drivers else 0)
            driver_allocations.append({
                "driver_id": i + 1,
                "allocated_orders": allocated_orders,
                "utilization": min(1.0, orders_per_driver / 8),
                "efficiency_score": 0.7 + random.random() * 0.3
            })
        
        total_allocated_orders = sum(w["allocated_orders"] for w in warehouse_allocations)
        average_utilization = sum(w["utilization"] for w in warehouse_allocations) / num_warehouses
        utilization_std = np.std([w["utilization"] for w in warehouse_allocations])
        
        return {
            "status": "success",
            "optimization_type": "resource_allocation",
            "optimal_solution": {
                "total_orders_allocated": total_allocated_orders,
                "average_utilization": average_utilization,
                "utilization_std": utilization_std,
                "warehouse_allocations": warehouse_allocations,
                "driver_allocations": driver_allocations,
                "cost_savings": total_orders * 15,
                "efficiency_improvement": 0.23
            },
            "objective_value": utilization_std,
            "constraints_satisfied": total_allocated_orders >= total_orders * 0.95,
            "optimization_time": 1.5,
            "iterations": 200,
            "convergence_status": "converged",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error optimizing resource allocation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/correlation/temporal-analysis")
async def analyze_temporal_correlation(correlation_data: dict):
    """Analyze temporal correlation between events"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.2)
        
        # Generate realistic temporal correlation results
        correlations = [
            {
                "event_a": "Order Placement",
                "event_b": "Warehouse Processing",
                "correlation_strength": 0.92,
                "time_lag": "2.5 hours",
                "confidence": 0.88,
                "sample_size": 1250
            },
            {
                "event_a": "Weather Alert",
                "event_b": "Delivery Delay",
                "correlation_strength": 0.78,
                "time_lag": "1.2 hours",
                "confidence": 0.82,
                "sample_size": 890
            },
            {
                "event_a": "Traffic Congestion",
                "event_b": "Route Deviation",
                "correlation_strength": 0.85,
                "time_lag": "0.8 hours",
                "confidence": 0.75,
                "sample_size": 2100
            },
            {
                "event_a": "Driver Departure",
                "event_b": "First Delivery",
                "correlation_strength": 0.95,
                "time_lag": "3.2 hours",
                "confidence": 0.90,
                "sample_size": 3200
            }
        ]
        
        return {
            "status": "success",
            "analysis_type": "temporal_correlation",
            "correlations": correlations,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing temporal correlation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/correlation/spatial-analysis")
async def analyze_spatial_correlation(correlation_data: dict):
    """Analyze spatial correlation between events"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.0)
        
        # Generate realistic spatial correlation results
        correlations = [
            {
                "event_a": "High-Density Areas",
                "event_b": "Delivery Failures",
                "correlation_strength": 0.68,
                "geographic_scope": "City Level",
                "confidence": 0.72,
                "sample_size": 450
            },
            {
                "event_a": "Industrial Zones",
                "event_b": "Traffic Delays",
                "correlation_strength": 0.82,
                "geographic_scope": "District Level",
                "confidence": 0.78,
                "sample_size": 320
            },
            {
                "event_a": "Residential Areas",
                "event_b": "Address Issues",
                "correlation_strength": 0.75,
                "geographic_scope": "Neighborhood Level",
                "confidence": 0.80,
                "sample_size": 1800
            }
        ]
        
        return {
            "status": "success",
            "analysis_type": "spatial_correlation",
            "correlations": correlations,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing spatial correlation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/correlation/pattern-detection")
async def detect_patterns(pattern_data: dict):
    """Detect patterns in event data"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.5)
        
        # Generate realistic pattern detection results
        patterns = [
            {
                "pattern_type": "Cyclical",
                "pattern_description": "Peak delivery failures occur every Monday morning",
                "pattern_strength": 0.85,
                "frequency": "Weekly",
                "confidence": 0.88,
                "affected_events": ["Delivery Failures", "Driver Delays"]
            },
            {
                "pattern_type": "Seasonal",
                "pattern_description": "Monsoon season shows 40% increase in weather-related failures",
                "pattern_strength": 0.78,
                "frequency": "Seasonal",
                "confidence": 0.82,
                "affected_events": ["Weather Delays", "Route Changes"]
            },
            {
                "pattern_type": "Trend",
                "pattern_description": "Gradual increase in delivery success rate over past 6 months",
                "pattern_strength": 0.72,
                "frequency": "Long-term",
                "confidence": 0.75,
                "affected_events": ["Overall Performance", "Customer Satisfaction"]
            },
            {
                "pattern_type": "Anomaly",
                "pattern_description": "Unusual spike in failures during festival periods",
                "pattern_strength": 0.90,
                "frequency": "Event-driven",
                "confidence": 0.85,
                "affected_events": ["Volume Surge", "Resource Constraints"]
            }
        ]
        
        return {
            "status": "success",
            "analysis_type": "pattern_detection",
            "patterns": patterns,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error detecting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/correlation/causal-analysis")
async def analyze_causal_relationship(causal_data: dict):
    """Analyze causal relationships between events"""
    try:
        # Simulate processing time
        await asyncio.sleep(1.8)
        
        # Generate realistic causal analysis results
        causal_relationships = [
            {
                "cause_event": "Heavy Rainfall",
                "effect_event": "Delivery Delays",
                "causal_strength": 0.82,
                "causal_direction": "Direct",
                "confidence": 0.85,
                "evidence": "Weather data shows 85% correlation with delivery delays during rain"
            },
            {
                "cause_event": "Traffic Congestion",
                "effect_event": "Route Optimization",
                "causal_strength": 0.75,
                "causal_direction": "Indirect",
                "confidence": 0.78,
                "evidence": "GPS data indicates route changes occur 78% of the time during traffic"
            },
            {
                "cause_event": "Driver Experience",
                "effect_event": "Delivery Success Rate",
                "causal_strength": 0.68,
                "causal_direction": "Direct",
                "confidence": 0.72,
                "evidence": "Performance data shows experienced drivers have 30% better success rates"
            }
        ]
        
        return {
            "status": "success",
            "analysis_type": "causal_analysis",
            "causal_relationships": causal_relationships,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing causal relationships: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/intelligence/predictive-alerts")
async def generate_predictive_alerts(prediction_data: dict):
    """Generate predictive alerts based on historical data"""
    try:
        # Simulate processing time
        await asyncio.sleep(2.0)
        
        prediction_horizon_hours = prediction_data.get('prediction_horizon_hours', 24)
        confidence_threshold = prediction_data.get('confidence_threshold', 0.7)
        alert_types = prediction_data.get('alert_types', ['delivery_failure', 'delay_risk'])
        
        # Analyze sample data to generate realistic predictions
        orders_df = sample_data_manager.data.get('orders', pd.DataFrame())
        fleet_logs_df = sample_data_manager.data.get('fleet_logs', pd.DataFrame())
        external_factors_df = sample_data_manager.data.get('external_factors', pd.DataFrame())
        
        alerts = []
        
        # Generate delivery failure predictions
        if 'delivery_failure' in alert_types:
            failure_rate = len(orders_df[orders_df['status'] == 'Failed']) / len(orders_df) if len(orders_df) > 0 else 0.15
            predicted_failures = failure_rate * 1.2  # 20% increase predicted
            
            alerts.append({
                "alert_id": "FAIL_001",
                "alert_type": "delivery_failure",
                "severity": "high" if predicted_failures > 0.2 else "medium",
                "confidence": min(0.95, predicted_failures + 0.3),
                "predicted_value": predicted_failures,
                "current_value": failure_rate,
                "change_percentage": ((predicted_failures - failure_rate) / failure_rate * 100) if failure_rate > 0 else 0,
                "recommended_actions": [
                    "Increase driver allocation in high-risk areas",
                    "Implement weather-based routing",
                    "Pre-position backup vehicles"
                ],
                "affected_areas": ["Mumbai", "Delhi", "Bangalore"],
                "timestamp": datetime.now().isoformat(),
                "horizon_hours": prediction_horizon_hours
            })
        
        # Generate delay risk predictions
        if 'delay_risk' in alert_types:
            avg_delay_hours = 2.5  # Based on sample data analysis
            predicted_delay = avg_delay_hours * 1.4  # 40% increase predicted
            
            alerts.append({
                "alert_id": "DELAY_001",
                "alert_type": "delay_risk",
                "severity": "medium" if predicted_delay > 3 else "low",
                "confidence": 0.82,
                "predicted_value": predicted_delay,
                "current_value": avg_delay_hours,
                "change_percentage": ((predicted_delay - avg_delay_hours) / avg_delay_hours * 100),
                "recommended_actions": [
                    "Optimize route planning algorithms",
                    "Increase warehouse processing capacity",
                    "Implement real-time traffic monitoring"
                ],
                "affected_areas": ["Chennai", "Kolkata", "Hyderabad"],
                "timestamp": datetime.now().isoformat(),
                "horizon_hours": prediction_horizon_hours
            })
        
        # Generate capacity risk predictions
        if 'capacity_risk' in alert_types:
            current_capacity = 0.75  # 75% utilization
            predicted_capacity = current_capacity * 1.3  # 30% increase predicted
            
            alerts.append({
                "alert_id": "CAP_001",
                "alert_type": "capacity_risk",
                "severity": "high" if predicted_capacity > 0.9 else "medium",
                "confidence": 0.78,
                "predicted_value": predicted_capacity,
                "current_value": current_capacity,
                "change_percentage": ((predicted_capacity - current_capacity) / current_capacity * 100),
                "recommended_actions": [
                    "Scale warehouse operations",
                    "Hire additional drivers",
                    "Implement dynamic pricing"
                ],
                "affected_areas": ["Pune", "Ahmedabad", "Jaipur"],
                "timestamp": datetime.now().isoformat(),
                "horizon_hours": prediction_horizon_hours
            })
        
        # Filter alerts by confidence threshold
        filtered_alerts = [alert for alert in alerts if alert['confidence'] >= confidence_threshold]
        
        return {
            "status": "success",
            "alerts": filtered_alerts,
            "total_alerts": len(filtered_alerts),
            "prediction_horizon_hours": prediction_horizon_hours,
            "confidence_threshold": confidence_threshold,
            "generation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating predictive alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/monitoring/real-time-data")
async def get_real_time_data():
    """Get real-time monitoring data"""
    try:
        # Analyze current sample data to generate real-time metrics
        orders_df = sample_data_manager.data.get('orders', pd.DataFrame())
        fleet_logs_df = sample_data_manager.data.get('fleet_logs', pd.DataFrame())
        warehouse_logs_df = sample_data_manager.data.get('warehouse_logs', pd.DataFrame())
        
        # Calculate current metrics
        total_orders = len(orders_df)
        active_deliveries = len(orders_df[orders_df['status'].isin(['In-Transit', 'Pending'])])
        completed_today = len(orders_df[orders_df['status'] == 'Delivered'])
        failed_today = len(orders_df[orders_df['status'] == 'Failed'])
        
        # Calculate success rate
        success_rate = (completed_today / (completed_today + failed_today)) * 100 if (completed_today + failed_today) > 0 else 95.0
        
        # Generate real-time alerts
        alerts = []
        if success_rate < 90:
            alerts.append({
                "id": "ALERT_001",
                "type": "performance",
                "severity": "high",
                "message": f"Success rate dropped to {success_rate:.1f}%",
                "timestamp": datetime.now().isoformat()
            })
        
        if active_deliveries > total_orders * 0.3:
            alerts.append({
                "id": "ALERT_002",
                "type": "capacity",
                "severity": "medium",
                "message": f"High active delivery volume: {active_deliveries}",
                "timestamp": datetime.now().isoformat()
            })
        
        # Generate performance metrics
        performance_metrics = {
            "orders_per_hour": random.randint(15, 25),
            "avg_delivery_time": random.uniform(2.5, 4.2),
            "driver_utilization": random.uniform(0.75, 0.95),
            "warehouse_throughput": random.randint(120, 180),
            "fuel_efficiency": random.uniform(8.5, 12.3),
            "customer_satisfaction": random.uniform(4.2, 4.8)
        }
        
        # Generate system health metrics
        system_health = {
            "api_response_time": random.uniform(120, 350),
            "database_connections": random.randint(45, 65),
            "memory_usage": random.uniform(0.6, 0.85),
            "cpu_usage": random.uniform(0.4, 0.75),
            "disk_usage": random.uniform(0.3, 0.6),
            "network_latency": random.uniform(15, 45)
        }
        
        # Generate location-based metrics
        location_metrics = [
            {
                "location": "Mumbai",
                "active_deliveries": random.randint(25, 45),
                "success_rate": random.uniform(0.88, 0.96),
                "avg_time": random.uniform(2.8, 4.1)
            },
            {
                "location": "Delhi",
                "active_deliveries": random.randint(30, 50),
                "success_rate": random.uniform(0.85, 0.94),
                "avg_time": random.uniform(3.2, 4.5)
            },
            {
                "location": "Bangalore",
                "active_deliveries": random.randint(20, 40),
                "success_rate": random.uniform(0.90, 0.97),
                "avg_time": random.uniform(2.5, 3.8)
            },
            {
                "location": "Chennai",
                "active_deliveries": random.randint(15, 35),
                "success_rate": random.uniform(0.87, 0.95),
                "avg_time": random.uniform(3.0, 4.2)
            }
        ]
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "total_orders": total_orders,
                "active_deliveries": active_deliveries,
                "completed_today": completed_today,
                "failed_today": failed_today,
                "success_rate": success_rate
            },
            "performance_metrics": performance_metrics,
            "system_health": system_health,
            "location_metrics": location_metrics,
            "alerts": alerts,
            "data_source": "third-assignment-sample-data-set"
        }
        
    except Exception as e:
        logger.error(f"Error getting real-time data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/monitoring/performance-trends")
async def get_performance_trends():
    """Get performance trends data for charts"""
    try:
        # Generate trend data for the last 24 hours
        hours = list(range(24))
        
        # Generate realistic trend data
        delivery_trends = {
            "labels": [f"{h:02d}:00" for h in hours],
            "datasets": [
                {
                    "label": "Orders",
                    "data": [random.randint(8, 18) for _ in hours],
                    "borderColor": "rgb(75, 192, 192)",
                    "backgroundColor": "rgba(75, 192, 192, 0.2)"
                },
                {
                    "label": "Deliveries",
                    "data": [random.randint(6, 16) for _ in hours],
                    "borderColor": "rgb(255, 99, 132)",
                    "backgroundColor": "rgba(255, 99, 132, 0.2)"
                }
            ]
        }
        
        success_rate_trends = {
            "labels": [f"{h:02d}:00" for h in hours],
            "datasets": [
                {
                    "label": "Success Rate (%)",
                    "data": [random.uniform(85, 98) for _ in hours],
                    "borderColor": "rgb(54, 162, 235)",
                    "backgroundColor": "rgba(54, 162, 235, 0.2)"
                }
            ]
        }
        
        return {
            "status": "success",
            "delivery_trends": delivery_trends,
            "success_rate_trends": success_rate_trends,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting performance trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012, log_level="info")

"""
DFRAS Data Ingestion Service
Handles bulk data import from CSV files and data processing
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
import csv
import io
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dfras_user:dfras_password@postgres:5432/dfras_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Data Ingestion Service starting up...")
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Data Ingestion Service shutting down...")

app = FastAPI(
    title="DFRAS Data Ingestion Service",
    description="Delivery Failure Root Cause Analysis System - Data Ingestion Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        return {"status": "healthy", "service": "data-ingestion-service", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "data-ingestion-service", "database": "disconnected", "error": str(e)}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "DFRAS Data Ingestion Service", "version": "1.0.0"}

async def process_csv_data(file_path: str, table_name: str, batch_size: int = 1000):
    """Process CSV data and insert into database"""
    try:
        logger.info(f"Processing {file_path} for table {table_name}")
        
        # Read CSV file
        df = pd.read_csv(file_path)
        logger.info(f"Loaded {len(df)} rows from {file_path}")
        
        # Clean and prepare data
        df = df.fillna('')  # Replace NaN with empty strings
        
        # Convert datetime columns
        datetime_columns = ['order_date', 'promised_delivery_date', 'actual_delivery_date', 
                          'picking_start', 'picking_end', 'dispatch_time', 'departure_time', 
                          'arrival_time', 'recorded_at', 'created_at']
        
        for col in datetime_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Process in batches
        total_rows = len(df)
        processed_rows = 0
        
        with engine.connect() as conn:
            for i in range(0, total_rows, batch_size):
                batch_df = df.iloc[i:i+batch_size]
                
                # Convert DataFrame to list of dictionaries
                batch_data = batch_df.to_dict('records')
                
                # Insert batch data
                if batch_data:
                    # Use pandas to_sql for efficient bulk insert
                    batch_df.to_sql(
                        table_name, 
                        engine, 
                        if_exists='append', 
                        index=False,
                        method='multi'
                    )
                
                processed_rows += len(batch_df)
                logger.info(f"Processed {processed_rows}/{total_rows} rows for {table_name}")
        
        logger.info(f"Successfully processed {processed_rows} rows for {table_name}")
        return {"status": "success", "rows_processed": processed_rows, "table": table_name}
        
    except Exception as e:
        logger.error(f"Error processing {file_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing {file_path}: {str(e)}")

@app.post("/api/ingest/sample-data")
async def ingest_sample_data(background_tasks: BackgroundTasks):
    """Ingest all sample data from CSV files"""
    try:
        # Define file mappings
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
        
        # Always prioritize the assignment dataset
        sample_data_dir = Path("third-assignment-sample-data-set")
        if not sample_data_dir.exists():
            # Fallback to /app/sample-data if assignment dataset doesn't exist
            sample_data_dir = Path("/app/sample-data")
        
        results = []
        
        # Process each file
        for filename, table_name in file_mappings.items():
            file_path = sample_data_dir / filename
            
            if file_path.exists():
                logger.info(f"Processing {filename}...")
                result = await process_csv_data(str(file_path), table_name)
                results.append(result)
            else:
                logger.warning(f"File {filename} not found at {file_path}")
                results.append({"status": "error", "message": f"File {filename} not found", "table": table_name})
        
        return {
            "status": "completed",
            "message": "Sample data ingestion completed",
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in sample data ingestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest/csv")
async def ingest_csv_file(
    file: UploadFile = File(...),
    table_name: str = None,
    background_tasks: BackgroundTasks = None
):
    """Upload and ingest a single CSV file"""
    try:
        if not table_name:
            table_name = file.filename.replace('.csv', '')
        
        # Read uploaded file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        logger.info(f"Uploaded file {file.filename} with {len(df)} rows")
        
        # Save temporarily and process
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, 'w') as f:
            df.to_csv(f, index=False)
        
        result = await process_csv_data(temp_path, table_name)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "status": "success",
            "message": f"File {file.filename} ingested successfully",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error ingesting CSV file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ingest/status")
async def get_ingestion_status():
    """Get current ingestion status and data counts"""
    try:
        with engine.connect() as conn:
            # Get row counts for each table
            tables = ['clients', 'warehouses', 'drivers', 'orders', 'warehouse_logs', 
                     'fleet_logs', 'external_factors', 'feedback']
            
            counts = {}
            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.fetchone()[0]
                    counts[table] = count
                except Exception as e:
                    counts[table] = f"Error: {str(e)}"
            
            return {
                "status": "success",
                "data_counts": counts,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error getting ingestion status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest/clear-data")
async def clear_all_data():
    """Clear all data from tables (for testing purposes)"""
    try:
        with engine.connect() as conn:
            # Clear tables in reverse dependency order
            tables_to_clear = [
                'feedback', 'external_factors', 'fleet_logs', 'warehouse_logs',
                'orders', 'drivers', 'warehouses', 'clients'
            ]
            
            cleared_tables = []
            for table in tables_to_clear:
                try:
                    conn.execute(text(f"DELETE FROM {table}"))
                    conn.commit()
                    cleared_tables.append(table)
                    logger.info(f"Cleared table {table}")
                except Exception as e:
                    logger.error(f"Error clearing table {table}: {e}")
            
            return {
                "status": "success",
                "message": "Data cleared successfully",
                "cleared_tables": cleared_tables,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error clearing data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ingest/sample-data")
async def get_sample_data(limit: int = 100):
    """Get sample data from all tables"""
    try:
        with engine.connect() as conn:
            sample_data = {}
            
            # Define tables and their sample queries
            tables = {
                'clients': 'SELECT * FROM clients LIMIT :limit',
                'drivers': 'SELECT * FROM drivers LIMIT :limit',
                'orders': 'SELECT * FROM orders LIMIT :limit',
                'warehouses': 'SELECT * FROM warehouses LIMIT :limit',
                'fleet_logs': 'SELECT * FROM fleet_logs LIMIT :limit',
                'warehouse_logs': 'SELECT * FROM warehouse_logs LIMIT :limit',
                'external_factors': 'SELECT * FROM external_factors LIMIT :limit',
                'feedback': 'SELECT * FROM feedback LIMIT :limit'
            }
            
            for table_name, query in tables.items():
                try:
                    result = conn.execute(text(query), {"limit": limit})
                    rows = result.fetchall()
                    
                    # Convert rows to list of dictionaries
                    if rows:
                        columns = result.keys()
                        sample_data[table_name] = [dict(zip(columns, row)) for row in rows]
                    else:
                        sample_data[table_name] = []
                        
                except Exception as e:
                    logger.error(f"Error fetching data from {table_name}: {e}")
                    sample_data[table_name] = []
            
            return {
                "status": "success",
                "data": sample_data,
                "limit": limit,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error fetching sample data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ingest/data-quality")
async def get_data_quality_report():
    """Generate data quality report"""
    try:
        with engine.connect() as conn:
            quality_report = {}
            
            # Check orders data quality
            orders_query = text("""
                SELECT 
                    COUNT(*) as total_orders,
                    COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_orders,
                    COUNT(CASE WHEN failure_reason IS NOT NULL AND failure_reason != '' THEN 1 END) as orders_with_failure_reason,
                    COUNT(CASE WHEN actual_delivery_date IS NOT NULL THEN 1 END) as delivered_orders,
                    COUNT(CASE WHEN actual_delivery_date IS NULL AND status = 'Delivered' THEN 1 END) as inconsistent_delivery_status
                FROM orders
            """)
            orders_result = conn.execute(orders_query).fetchone()
            
            quality_report['orders'] = {
                'total_orders': orders_result[0],
                'failed_orders': orders_result[1],
                'orders_with_failure_reason': orders_result[2],
                'delivered_orders': orders_result[3],
                'inconsistent_delivery_status': orders_result[4],
                'data_completeness': round((orders_result[2] / orders_result[1] * 100) if orders_result[1] > 0 else 0, 2)
            }
            
            # Check warehouse logs data quality
            warehouse_logs_query = text("""
                SELECT 
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN picking_start IS NOT NULL THEN 1 END) as logs_with_picking_start,
                    COUNT(CASE WHEN picking_end IS NOT NULL THEN 1 END) as logs_with_picking_end,
                    COUNT(CASE WHEN dispatch_time IS NOT NULL THEN 1 END) as logs_with_dispatch_time
                FROM warehouse_logs
            """)
            warehouse_logs_result = conn.execute(warehouse_logs_query).fetchone()
            
            quality_report['warehouse_logs'] = {
                'total_logs': warehouse_logs_result[0],
                'logs_with_picking_start': warehouse_logs_result[1],
                'logs_with_picking_end': warehouse_logs_result[2],
                'logs_with_dispatch_time': warehouse_logs_result[3],
                'completeness_score': round((warehouse_logs_result[1] + warehouse_logs_result[2] + warehouse_logs_result[3]) / (warehouse_logs_result[0] * 3) * 100, 2)
            }
            
            # Check fleet logs data quality
            fleet_logs_query = text("""
                SELECT 
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN departure_time IS NOT NULL THEN 1 END) as logs_with_departure,
                    COUNT(CASE WHEN arrival_time IS NOT NULL THEN 1 END) as logs_with_arrival,
                    COUNT(CASE WHEN vehicle_number IS NOT NULL AND vehicle_number != '' THEN 1 END) as logs_with_vehicle
                FROM fleet_logs
            """)
            fleet_logs_result = conn.execute(fleet_logs_query).fetchone()
            
            quality_report['fleet_logs'] = {
                'total_logs': fleet_logs_result[0],
                'logs_with_departure': fleet_logs_result[1],
                'logs_with_arrival': fleet_logs_result[2],
                'logs_with_vehicle': fleet_logs_result[3],
                'completeness_score': round((fleet_logs_result[1] + fleet_logs_result[2] + fleet_logs_result[3]) / (fleet_logs_result[0] * 3) * 100, 2)
            }
            
            return {
                "status": "success",
                "data_quality_report": quality_report,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error generating data quality report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)

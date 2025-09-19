"""
Assignment Data Loader for DFRAS AI Query Analysis
Loads and processes the third-assignment-sample-data-set as the primary data source
"""

import pandas as pd
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AssignmentDataLoader:
    """Loads and processes the third-assignment-sample-data-set"""
    
    def __init__(self):
        # Try multiple possible paths for the assignment dataset
        possible_paths = [
            "/app/third-assignment-sample-data-set",
            "/Users/opachoriya/Project/AI_Assignments/Assignment_3/third-assignment-sample-data-set",
            "./third-assignment-sample-data-set",
            "../third-assignment-sample-data-set"
        ]
        
        self.data_path = None
        for path in possible_paths:
            if os.path.exists(path):
                self.data_path = path
                break
        
        if not self.data_path:
            logger.warning("Assignment dataset not found in any expected location")
            self.data_path = possible_paths[0]  # Use default for error handling
        
        self.data = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all CSV files from the assignment dataset"""
        try:
            # Load orders data
            orders_df = pd.read_csv(f"{self.data_path}/orders.csv")
            self.data["orders"] = orders_df.to_dict('records')
            logger.info(f"Loaded {len(orders_df)} orders from assignment dataset")
            
            # Load warehouses data
            warehouses_df = pd.read_csv(f"{self.data_path}/warehouses.csv")
            self.data["warehouses"] = warehouses_df.to_dict('records')
            logger.info(f"Loaded {len(warehouses_df)} warehouses from assignment dataset")
            
            # Load fleet logs data
            fleet_logs_df = pd.read_csv(f"{self.data_path}/fleet_logs.csv")
            self.data["fleet_logs"] = fleet_logs_df.to_dict('records')
            logger.info(f"Loaded {len(fleet_logs_df)} fleet logs from assignment dataset")
            
            # Load external factors data
            external_factors_df = pd.read_csv(f"{self.data_path}/external_factors.csv")
            self.data["external_factors"] = external_factors_df.to_dict('records')
            logger.info(f"Loaded {len(external_factors_df)} external factors from assignment dataset")
            
            # Load clients data
            clients_df = pd.read_csv(f"{self.data_path}/clients.csv")
            self.data["clients"] = clients_df.to_dict('records')
            logger.info(f"Loaded {len(clients_df)} clients from assignment dataset")
            
            # Load drivers data
            drivers_df = pd.read_csv(f"{self.data_path}/drivers.csv")
            self.data["drivers"] = drivers_df.to_dict('records')
            logger.info(f"Loaded {len(drivers_df)} drivers from assignment dataset")
            
            # Load feedback data
            feedback_df = pd.read_csv(f"{self.data_path}/feedback.csv")
            self.data["feedback"] = feedback_df.to_dict('records')
            logger.info(f"Loaded {len(feedback_df)} feedback records from assignment dataset")
            
            # Load warehouse logs data
            warehouse_logs_df = pd.read_csv(f"{self.data_path}/warehouse_logs.csv")
            self.data["warehouse_logs"] = warehouse_logs_df.to_dict('records')
            logger.info(f"Loaded {len(warehouse_logs_df)} warehouse logs from assignment dataset")
            
            logger.info("Successfully loaded all assignment dataset files")
            
        except Exception as e:
            logger.error(f"Error loading assignment dataset: {e}")
            self.data = {}
    
    def get_filtered_data(self, query_entities: Dict[str, List[str]], analysis_type: str) -> Dict[str, Any]:
        """Filter data based on query entities and analysis type"""
        filtered_data = {}
        
        # Filter orders data
        if "orders" in self.data:
            orders_df = pd.DataFrame(self.data["orders"])
            filtered_orders = self._filter_orders(orders_df, query_entities)
            filtered_data["orders"] = filtered_orders.to_dict('records') if not filtered_orders.empty else []
        
        # Filter warehouses data
        if "warehouses" in self.data:
            warehouses_df = pd.DataFrame(self.data["warehouses"])
            filtered_warehouses = self._filter_warehouses(warehouses_df, query_entities)
            filtered_data["warehouses"] = filtered_warehouses.to_dict('records') if not filtered_warehouses.empty else []
        
        # Filter fleet logs data
        if "fleet_logs" in self.data:
            fleet_logs_df = pd.DataFrame(self.data["fleet_logs"])
            filtered_fleet = self._filter_fleet_logs(fleet_logs_df, query_entities)
            filtered_data["fleet_logs"] = filtered_fleet.to_dict('records') if not filtered_fleet.empty else []
        
        # Filter external factors data
        if "external_factors" in self.data:
            external_factors_df = pd.DataFrame(self.data["external_factors"])
            filtered_external = self._filter_external_factors(external_factors_df, query_entities)
            filtered_data["external_factors"] = filtered_external.to_dict('records') if not filtered_external.empty else []
        
        # Filter clients data
        if "clients" in self.data:
            clients_df = pd.DataFrame(self.data["clients"])
            filtered_clients = self._filter_clients(clients_df, query_entities)
            filtered_data["clients"] = filtered_clients.to_dict('records') if not filtered_clients.empty else []
        
        # Filter feedback data
        if "feedback" in self.data:
            feedback_df = pd.DataFrame(self.data["feedback"])
            filtered_feedback = self._filter_feedback(feedback_df, query_entities)
            filtered_data["feedback"] = filtered_feedback.to_dict('records') if not filtered_feedback.empty else []
        
        return filtered_data
    
    def _filter_orders(self, orders_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter orders based on query entities"""
        filtered_df = orders_df.copy()
        
        # Filter by locations
        if query_entities.get("locations"):
            location_filter = False
            for location in query_entities["locations"]:
                location_filter |= (
                    filtered_df["city"].str.contains(location, case=False, na=False) |
                    filtered_df["state"].str.contains(location, case=False, na=False)
                )
            filtered_df = filtered_df[location_filter]
        
        # Filter by time periods
        if query_entities.get("time_periods"):
            filtered_df = self._apply_time_filters(filtered_df, query_entities["time_periods"], "order_date")
        
        # Filter by clients
        if query_entities.get("clients"):
            client_filter = False
            for client in query_entities["clients"]:
                client_filter |= filtered_df["client_id"].astype(str).str.contains(client, case=False, na=False)
            filtered_df = filtered_df[client_filter]
        
        return filtered_df
    
    def _filter_warehouses(self, warehouses_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter warehouses based on query entities"""
        filtered_df = warehouses_df.copy()
        
        # Filter by locations
        if query_entities.get("locations"):
            location_filter = False
            for location in query_entities["locations"]:
                location_filter |= (
                    filtered_df["city"].str.contains(location, case=False, na=False) |
                    filtered_df["state"].str.contains(location, case=False, na=False)
                )
            filtered_df = filtered_df[location_filter]
        
        return filtered_df
    
    def _filter_fleet_logs(self, fleet_logs_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter fleet logs based on query entities"""
        filtered_df = fleet_logs_df.copy()
        
        # Filter by time periods
        if query_entities.get("time_periods"):
            filtered_df = self._apply_time_filters(filtered_df, query_entities["time_periods"], "departure_time")
        
        return filtered_df
    
    def _filter_external_factors(self, external_factors_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter external factors based on query entities"""
        filtered_df = external_factors_df.copy()
        
        # Filter by time periods
        if query_entities.get("time_periods"):
            filtered_df = self._apply_time_filters(filtered_df, query_entities["time_periods"], "recorded_at")
        
        return filtered_df
    
    def _filter_clients(self, clients_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter clients based on query entities"""
        filtered_df = clients_df.copy()
        
        # Filter by client names or IDs
        if query_entities.get("clients"):
            client_filter = False
            for client in query_entities["clients"]:
                client_filter |= (
                    filtered_df["client_name"].str.contains(client, case=False, na=False) |
                    filtered_df["client_id"].astype(str).str.contains(client, case=False, na=False)
                )
            filtered_df = filtered_df[client_filter]
        
        return filtered_df
    
    def _filter_feedback(self, feedback_df: pd.DataFrame, query_entities: Dict[str, List[str]]) -> pd.DataFrame:
        """Filter feedback based on query entities"""
        filtered_df = feedback_df.copy()
        
        # Filter by time periods
        if query_entities.get("time_periods"):
            filtered_df = self._apply_time_filters(filtered_df, query_entities["time_periods"], "created_at")
        
        return filtered_df
    
    def _apply_time_filters(self, df: pd.DataFrame, time_periods: List[str], date_column: str) -> pd.DataFrame:
        """Apply time-based filters to dataframe"""
        if df.empty or date_column not in df.columns:
            return df
        
        df[date_column] = pd.to_datetime(df[date_column], errors='coerce')
        now = datetime.now()
        
        filtered_df = df.copy()
        
        for period in time_periods:
            period_lower = period.lower()
            if "yesterday" in period_lower:
                yesterday = now.replace(hour=0, minute=0, second=0, microsecond=0) - pd.Timedelta(days=1)
                filtered_df = filtered_df[filtered_df[date_column].dt.date == yesterday.date()]
            elif "last week" in period_lower:
                week_ago = now - pd.Timedelta(weeks=1)
                filtered_df = filtered_df[filtered_df[date_column] >= week_ago]
            elif "last month" in period_lower:
                month_ago = now - pd.Timedelta(days=30)
                filtered_df = filtered_df[filtered_df[date_column] >= month_ago]
            elif "august" in period_lower:
                filtered_df = filtered_df[filtered_df[date_column].dt.month == 8]
            elif "festival" in period_lower or "holiday" in period_lower:
                # Filter for holiday periods (simplified)
                filtered_df = filtered_df[filtered_df[date_column].dt.month.isin([11, 12])]  # Nov-Dec holiday season
        
        return filtered_df
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get summary statistics of the loaded data"""
        summary = {}
        
        for data_type, records in self.data.items():
            if records:
                df = pd.DataFrame(records)
                summary[data_type] = {
                    "total_count": len(df),
                    "columns": list(df.columns),
                    "date_range": self._get_date_range(df),
                    "sample_records": df.head(3).to_dict('records')
                }
        
        return summary
    
    def _get_date_range(self, df: pd.DataFrame) -> Dict[str, str]:
        """Get date range for dataframe"""
        date_columns = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        if not date_columns:
            return {"earliest": "N/A", "latest": "N/A"}
        
        date_range = {"earliest": "N/A", "latest": "N/A"}
        
        for col in date_columns:
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                valid_dates = df[col].dropna()
                if not valid_dates.empty:
                    if date_range["earliest"] == "N/A" or valid_dates.min() < pd.to_datetime(date_range["earliest"]):
                        date_range["earliest"] = valid_dates.min().strftime("%Y-%m-%d")
                    if date_range["latest"] == "N/A" or valid_dates.max() > pd.to_datetime(date_range["latest"]):
                        date_range["latest"] = valid_dates.max().strftime("%Y-%m-%d")
            except:
                continue
        
        return date_range
    
    def get_comprehensive_data(self) -> Dict[str, Any]:
        """Get all data in a comprehensive format"""
        return {
            "data_source": "third-assignment-sample-data-set",
            "loaded_at": datetime.now().isoformat(),
            "data": self.data,
            "summary": self.get_data_summary(),
            "metadata": {
                "total_orders": len(self.data.get("orders", [])),
                "total_warehouses": len(self.data.get("warehouses", [])),
                "total_fleet_logs": len(self.data.get("fleet_logs", [])),
                "total_external_factors": len(self.data.get("external_factors", [])),
                "total_clients": len(self.data.get("clients", [])),
                "total_drivers": len(self.data.get("drivers", [])),
                "total_feedback": len(self.data.get("feedback", [])),
                "total_warehouse_logs": len(self.data.get("warehouse_logs", []))
            }
        }

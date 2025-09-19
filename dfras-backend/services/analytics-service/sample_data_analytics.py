"""
Sample Data Analytics Service
Provides real analytics based on third-assignment-sample-data-set CSV files
"""

import pandas as pd
import numpy as np
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class SampleDataAnalytics:
    """Analytics engine that works directly with CSV sample data"""
    
    def __init__(self):
        self.data_path = self._find_sample_data_path()
        self.data = {}
        self._load_all_data()
    
    def _find_sample_data_path(self) -> str:
        """Find the sample data path"""
        possible_paths = [
            "/app/sample-data",  # Docker volume mount path
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
        return possible_paths[0]  # Use default for error handling
    
    def _convert_numpy_types(self, obj):
        """Convert numpy types to native Python types for JSON serialization"""
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: self._convert_numpy_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_types(item) for item in obj]
        else:
            return obj
    
    def _load_all_data(self):
        """Load all CSV files from the sample dataset"""
        try:
            # Load orders data
            orders_file = os.path.join(self.data_path, "orders.csv")
            if os.path.exists(orders_file):
                self.data["orders"] = pd.read_csv(orders_file)
                logger.info(f"Loaded {len(self.data['orders'])} orders")
            
            # Load warehouses data
            warehouses_file = os.path.join(self.data_path, "warehouses.csv")
            if os.path.exists(warehouses_file):
                self.data["warehouses"] = pd.read_csv(warehouses_file)
                logger.info(f"Loaded {len(self.data['warehouses'])} warehouses")
            
            # Load fleet logs data
            fleet_logs_file = os.path.join(self.data_path, "fleet_logs.csv")
            if os.path.exists(fleet_logs_file):
                self.data["fleet_logs"] = pd.read_csv(fleet_logs_file)
                logger.info(f"Loaded {len(self.data['fleet_logs'])} fleet logs")
            
            # Load external factors data
            external_factors_file = os.path.join(self.data_path, "external_factors.csv")
            if os.path.exists(external_factors_file):
                self.data["external_factors"] = pd.read_csv(external_factors_file)
                logger.info(f"Loaded {len(self.data['external_factors'])} external factors")
            
            # Load clients data
            clients_file = os.path.join(self.data_path, "clients.csv")
            if os.path.exists(clients_file):
                self.data["clients"] = pd.read_csv(clients_file)
                logger.info(f"Loaded {len(self.data['clients'])} clients")
            
            # Load drivers data
            drivers_file = os.path.join(self.data_path, "drivers.csv")
            if os.path.exists(drivers_file):
                self.data["drivers"] = pd.read_csv(drivers_file)
                logger.info(f"Loaded {len(self.data['drivers'])} drivers")
            
            # Load feedback data
            feedback_file = os.path.join(self.data_path, "feedback.csv")
            if os.path.exists(feedback_file):
                self.data["feedback"] = pd.read_csv(feedback_file)
                logger.info(f"Loaded {len(self.data['feedback'])} feedback records")
            
            # Load warehouse logs data
            warehouse_logs_file = os.path.join(self.data_path, "warehouse_logs.csv")
            if os.path.exists(warehouse_logs_file):
                self.data["warehouse_logs"] = pd.read_csv(warehouse_logs_file)
                logger.info(f"Loaded {len(self.data['warehouse_logs'])} warehouse logs")
            
            logger.info("Successfully loaded all sample data files")
            
        except Exception as e:
            logger.error(f"Error loading sample data: {e}")
            self.data = {}
    
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get comprehensive dashboard metrics from sample data"""
        if "orders" not in self.data:
            return self._get_empty_metrics()
        
        orders_df = self.data["orders"]
        
        # Basic metrics
        total_orders = len(orders_df)
        successful_orders = len(orders_df[orders_df["status"] == "Delivered"])
        failed_orders = len(orders_df[orders_df["status"] == "Failed"])
        pending_orders = len(orders_df[orders_df["status"].isin(["Pending", "In-Transit"])])
        
        # Calculate success rate
        success_rate = (successful_orders / total_orders * 100) if total_orders > 0 else 0
        
        # Revenue calculations
        total_revenue = orders_df[orders_df["status"] == "Delivered"]["amount"].sum() if "amount" in orders_df.columns else 0
        lost_revenue = orders_df[orders_df["status"] == "Failed"]["amount"].sum() if "amount" in orders_df.columns else 0
        avg_order_value = orders_df[orders_df["status"] == "Delivered"]["amount"].mean() if "amount" in orders_df.columns else 0
        avg_failed_amount = orders_df[orders_df["status"] == "Failed"]["amount"].mean() if "amount" in orders_df.columns else 0
        
        # Top failure reasons
        top_failure_reasons = self._get_top_failure_reasons(orders_df, failed_orders)
        
        # Orders by status
        orders_by_status = self._get_orders_by_status(orders_df)
        
        # Orders by state
        orders_by_state = self._get_orders_by_state(orders_df)
        
        # Orders by city
        orders_by_city = self._get_orders_by_city(orders_df)
        
        # Daily trends
        daily_trends = self._get_daily_trends(orders_df)
        
        return {
            "total_orders": total_orders,
            "successful_orders": successful_orders,
            "failed_orders": failed_orders,
            "pending_orders": pending_orders,
            "success_rate": success_rate,
            "total_revenue": total_revenue,
            "lost_revenue": lost_revenue,
            "avg_order_value": avg_order_value,
            "avg_failed_amount": avg_failed_amount,
            "top_failure_reasons": top_failure_reasons,
            "orders_by_status": orders_by_status,
            "orders_by_state": orders_by_state,
            "orders_by_city": orders_by_city,
            "daily_trends": daily_trends,
            "data_source": "third-assignment-sample-data-set",
            "last_updated": datetime.now().isoformat()
        }
    
    def _get_top_failure_reasons(self, orders_df: pd.DataFrame, failed_orders: int) -> List[Dict[str, Any]]:
        """Get top failure reasons with percentages and amounts"""
        if "failure_reason" not in orders_df.columns or failed_orders == 0:
            return []
        
        failed_orders_df = orders_df[orders_df["status"] == "Failed"]
        failure_reasons = failed_orders_df["failure_reason"].value_counts().head(10)
        
        result = []
        for reason, count in failure_reasons.items():
            if pd.notna(reason) and str(reason).strip() and str(reason).strip() != '':
                percentage = (count / failed_orders * 100) if failed_orders > 0 else 0
                
                # Calculate total amount for this failure reason
                reason_orders = failed_orders_df[failed_orders_df["failure_reason"] == reason]
                if "amount" in reason_orders.columns:
                    try:
                        # Convert amount to numeric, handling any string values
                        amounts = pd.to_numeric(reason_orders["amount"], errors='coerce')
                        total_amount = amounts.sum() if not amounts.isna().all() else 0
                        avg_amount = amounts.mean() if not amounts.isna().all() else 0
                    except Exception:
                        total_amount = 0
                        avg_amount = 0
                else:
                    total_amount = 0
                    avg_amount = 0
                
                result.append({
                    "reason": str(reason).strip(),
                    "count": int(count),
                    "percentage": float(percentage),
                    "total_amount": float(total_amount),
                    "avg_amount": float(avg_amount)
                })
        
        return result
    
    def _get_orders_by_status(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get orders grouped by status"""
        if "status" not in orders_df.columns:
            return []
        
        status_counts = orders_df["status"].value_counts()
        
        result = []
        for status, count in status_counts.items():
            result.append({
                "status": status,
                "count": count
            })
        
        return result
    
    def _get_orders_by_state(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get orders grouped by state"""
        if "state" not in orders_df.columns:
            return []
        
        state_counts = orders_df["state"].value_counts().head(10)
        
        result = []
        for state, count in state_counts.items():
            result.append({
                "state": state,
                "count": count
            })
        
        return result
    
    def _get_orders_by_city(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get orders grouped by city"""
        if "city" not in orders_df.columns:
            return []
        
        city_counts = orders_df["city"].value_counts().head(10)
        
        result = []
        for city, count in city_counts.items():
            result.append({
                "city": city,
                "count": count
            })
        
        return result
    
    def _get_daily_trends(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get daily trends for the last 30 days"""
        if "order_date" not in orders_df.columns:
            return []
        
        # Convert order_date to datetime
        orders_df["order_date"] = pd.to_datetime(orders_df["order_date"], errors='coerce')
        
        # Filter last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_orders = orders_df[orders_df["order_date"] >= thirty_days_ago]
        
        if recent_orders.empty:
            return []
        
        # Group by date
        daily_stats = recent_orders.groupby(recent_orders["order_date"].dt.date).agg({
            "order_id": "count",
            "status": lambda x: (x == "Delivered").sum(),
            "status": lambda x: (x == "Failed").sum()
        }).rename(columns={"order_id": "total_orders"})
        
        # Fix the aggregation issue
        daily_stats = recent_orders.groupby(recent_orders["order_date"].dt.date).agg({
            "order_id": "count",
            "status": [
                lambda x: (x == "Delivered").sum(),
                lambda x: (x == "Failed").sum()
            ]
        })
        
        daily_stats.columns = ["total_orders", "successful_orders", "failed_orders"]
        
        result = []
        for date, row in daily_stats.iterrows():
            success_rate_daily = (row["successful_orders"] / row["total_orders"] * 100) if row["total_orders"] > 0 else 0
            result.append({
                "date": date.isoformat(),
                "total_orders": row["total_orders"],
                "successful_orders": row["successful_orders"],
                "failed_orders": row["failed_orders"],
                "success_rate": success_rate_daily
            })
        
        return sorted(result, key=lambda x: x["date"])
    
    def _get_empty_metrics(self) -> Dict[str, Any]:
        """Return empty metrics when no data is available"""
        return {
            "total_orders": 0,
            "successful_orders": 0,
            "failed_orders": 0,
            "pending_orders": 0,
            "success_rate": 0,
            "total_revenue": 0,
            "lost_revenue": 0,
            "avg_order_value": 0,
            "top_failure_reasons": [],
            "orders_by_status": [],
            "orders_by_state": [],
            "orders_by_city": [],
            "daily_trends": [],
            "data_source": "no-data",
            "last_updated": datetime.now().isoformat()
        }
    
    def get_failure_analysis(self) -> Dict[str, Any]:
        """Get detailed failure analysis from sample data"""
        if "orders" not in self.data:
            return {"error": "No orders data available"}
        
        orders_df = self.data["orders"]
        
        # Get basic statistics
        total_orders = len(orders_df)
        failed_orders = len(orders_df[orders_df["status"] == "Failed"])
        successful_orders = len(orders_df[orders_df["status"] == "Delivered"])
        failure_rate = (failed_orders / total_orders * 100) if total_orders > 0 else 0
        
        # Get failure reasons
        failure_reasons = orders_df[orders_df["status"] == "Failed"]["failure_reason"].value_counts().head(10)
        failure_reasons_list = []
        for reason, count in failure_reasons.items():
            if pd.notna(reason):  # Skip NaN values
                failure_reasons_list.append({
                    "reason": str(reason),
                    "count": int(count),
                    "percentage": round(count / failed_orders * 100, 2) if failed_orders > 0 else 0
                })
        
        # Get city-wise failures
        city_failures = orders_df[orders_df["status"] == "Failed"]["city"].value_counts().head(10)
        city_failures_list = []
        for city, count in city_failures.items():
            if pd.notna(city):  # Skip NaN values
                city_failures_list.append({
                    "city": str(city),
                    "count": int(count),
                    "percentage": round(count / failed_orders * 100, 2) if failed_orders > 0 else 0
                })
        
        return {
            "total_orders": total_orders,
            "failed_orders": failed_orders,
            "successful_orders": successful_orders,
            "failure_rate": round(failure_rate, 2),
            "failure_reasons": failure_reasons_list,
            "city_failures": city_failures_list,
            "data_source": "third-assignment-sample-data-set"
        }
    
    def _get_time_patterns(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get failure patterns by hour"""
        if "order_date" not in orders_df.columns:
            return []
        
        orders_df["order_date"] = pd.to_datetime(orders_df["order_date"], errors='coerce')
        orders_df["hour"] = orders_df["order_date"].dt.hour
        
        hourly_stats = orders_df.groupby("hour").agg({
            "order_id": "count",
            "status": [
                lambda x: (x == "Delivered").sum(),
                lambda x: (x == "Failed").sum()
            ]
        })
        
        hourly_stats.columns = ["total_orders", "successful_orders", "failed_orders"]
        
        result = []
        for hour, row in hourly_stats.iterrows():
            result.append({
                "hour": int(hour),
                "total_orders": int(row["total_orders"]),
                "failed_orders": int(row["failed_orders"])
            })
        
        return sorted(result, key=lambda x: x["hour"])
    
    def _get_day_patterns(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get failure patterns by day of week"""
        if "order_date" not in orders_df.columns:
            return []
        
        orders_df["order_date"] = pd.to_datetime(orders_df["order_date"], errors='coerce')
        orders_df["day_of_week"] = orders_df["order_date"].dt.dayofweek
        
        daily_stats = orders_df.groupby("day_of_week").agg({
            "order_id": "count",
            "status": [
                lambda x: (x == "Delivered").sum(),
                lambda x: (x == "Failed").sum()
            ]
        })
        
        daily_stats.columns = ["total_orders", "successful_orders", "failed_orders"]
        
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        result = []
        for day_num, row in daily_stats.iterrows():
            result.append({
                "day_of_week": int(day_num),
                "day_name": day_names[int(day_num)],
                "total_orders": int(row["total_orders"]),
                "failed_orders": int(row["failed_orders"])
            })
        
        return sorted(result, key=lambda x: x["day_of_week"])
    
    def _get_location_patterns(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get failure patterns by location"""
        if "city" not in orders_df.columns or "state" not in orders_df.columns:
            return []
        
        location_stats = orders_df.groupby(["city", "state"]).agg({
            "order_id": "count",
            "status": [
                lambda x: (x == "Delivered").sum(),
                lambda x: (x == "Failed").sum()
            ]
        })
        
        location_stats.columns = ["total_orders", "successful_orders", "failed_orders"]
        
        result = []
        for (city, state), row in location_stats.iterrows():
            result.append({
                "city": city,
                "state": state,
                "total_orders": int(row["total_orders"]),
                "failed_orders": int(row["failed_orders"])
            })
        
        return sorted(result, key=lambda x: x["failed_orders"], reverse=True)[:10]
    
    def _get_external_factors_correlation(self) -> List[Dict[str, Any]]:
        """Get external factors correlation with failures"""
        if "external_factors" not in self.data or "orders" not in self.data:
            return []
        
        external_df = self.data["external_factors"]
        orders_df = self.data["orders"]
        
        # Merge external factors with orders
        merged_df = external_df.merge(orders_df, on="order_id", how="inner")
        
        if merged_df.empty:
            return []
        
        # Group by traffic and weather conditions
        factor_stats = merged_df.groupby(["traffic_condition", "weather_condition"]).agg({
            "order_id": "count",
            "status": [
                lambda x: (x == "Delivered").sum(),
                lambda x: (x == "Failed").sum()
            ]
        })
        
        factor_stats.columns = ["total_orders", "successful_orders", "failed_orders"]
        
        result = []
        for (traffic, weather), row in factor_stats.iterrows():
            result.append({
                "traffic": traffic,
                "weather": weather,
                "total_orders": int(row["total_orders"]),
                "failed_orders": int(row["failed_orders"])
            })
        
        return sorted(result, key=lambda x: x["failed_orders"], reverse=True)
    
    def get_performance_analytics(self) -> Dict[str, Any]:
        """Get performance analytics from sample data"""
        if "orders" not in self.data:
            return {"error": "No orders data available"}
        
        orders_df = self.data["orders"]
        
        # Delivery time analysis
        delivery_times = self._get_delivery_times(orders_df)
        
        # Warehouse efficiency
        warehouse_efficiency = self._get_warehouse_efficiency()
        
        # Driver efficiency
        driver_efficiency = self._get_driver_efficiency()
        
        return {
            "delivery_times": delivery_times,
            "warehouse_efficiency": warehouse_efficiency,
            "driver_efficiency": driver_efficiency
        }
    
    def _get_delivery_times(self, orders_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get delivery time analysis"""
        if "promised_delivery_date" not in orders_df.columns or "actual_delivery_date" not in orders_df.columns:
            return []
        
        # Convert dates
        orders_df["promised_delivery_date"] = pd.to_datetime(orders_df["promised_delivery_date"], errors='coerce')
        orders_df["actual_delivery_date"] = pd.to_datetime(orders_df["actual_delivery_date"], errors='coerce')
        
        # Filter orders with actual delivery dates
        delivered_orders = orders_df[orders_df["actual_delivery_date"].notna()]
        
        if delivered_orders.empty:
            return []
        
        # Calculate delivery delays
        delivered_orders = delivered_orders.copy()  # Avoid SettingWithCopyWarning
        delivered_orders["delivery_delay_hours"] = (
            delivered_orders["actual_delivery_date"] - delivered_orders["promised_delivery_date"]
        ).dt.total_seconds() / 3600
        
        # Get top 100 delayed orders
        top_delays = delivered_orders.nlargest(100, "delivery_delay_hours")
        
        result = []
        for _, row in top_delays.iterrows():
            result.append({
                "order_id": row["order_id"],
                "promised_delivery_date": row["promised_delivery_date"].isoformat() if pd.notna(row["promised_delivery_date"]) else None,
                "actual_delivery_date": row["actual_delivery_date"].isoformat() if pd.notna(row["actual_delivery_date"]) else None,
                "status": row["status"],
                "delivery_delay_hours": float(row["delivery_delay_hours"]) if pd.notna(row["delivery_delay_hours"]) else None
            })
        
        return result
    
    def _get_warehouse_efficiency(self) -> List[Dict[str, Any]]:
        """Get warehouse efficiency metrics"""
        if "warehouse_logs" not in self.data or "warehouses" not in self.data:
            return []
        
        warehouse_logs_df = self.data["warehouse_logs"]
        warehouses_df = self.data["warehouses"]
        
        # Merge warehouse logs with warehouses
        merged_df = warehouse_logs_df.merge(warehouses_df, on="warehouse_id", how="inner")
        
        if merged_df.empty:
            return []
        
        # Calculate picking time (if columns exist)
        if "picking_start" in merged_df.columns and "dispatch_time" in merged_df.columns:
            merged_df["picking_start"] = pd.to_datetime(merged_df["picking_start"], errors='coerce')
            merged_df["dispatch_time"] = pd.to_datetime(merged_df["dispatch_time"], errors='coerce')
            
            merged_df["picking_time_hours"] = (
                merged_df["dispatch_time"] - merged_df["picking_start"]
            ).dt.total_seconds() / 3600
            
            # Group by warehouse
            warehouse_stats = merged_df.groupby("warehouse_name").agg({
                "picking_time_hours": "mean",
                "log_id": "count"
            }).rename(columns={"log_id": "total_pickings"})
            
            result = []
            for warehouse, row in warehouse_stats.iterrows():
                result.append({
                    "warehouse": warehouse,
                    "avg_picking_time_hours": float(row["picking_time_hours"]) if pd.notna(row["picking_time_hours"]) else 0,
                    "total_pickings": row["total_pickings"]
                })
            
            return sorted(result, key=lambda x: x["avg_picking_time_hours"])
        
        return []
    
    def _get_driver_efficiency(self) -> List[Dict[str, Any]]:
        """Get driver efficiency metrics"""
        if "fleet_logs" not in self.data or "drivers" not in self.data:
            return []
        
        fleet_logs_df = self.data["fleet_logs"]
        drivers_df = self.data["drivers"]
        
        # Merge fleet logs with drivers
        merged_df = fleet_logs_df.merge(drivers_df, on="driver_id", how="inner")
        
        if merged_df.empty:
            return []
        
        # Calculate delivery time (if columns exist)
        if "departure_time" in merged_df.columns and "arrival_time" in merged_df.columns:
            merged_df["departure_time"] = pd.to_datetime(merged_df["departure_time"], errors='coerce')
            merged_df["arrival_time"] = pd.to_datetime(merged_df["arrival_time"], errors='coerce')
            
            merged_df["delivery_time_hours"] = (
                merged_df["arrival_time"] - merged_df["departure_time"]
            ).dt.total_seconds() / 3600
            
            # Group by driver
            driver_stats = merged_df.groupby("driver_name").agg({
                "delivery_time_hours": "mean",
                "fleet_log_id": "count"
            }).rename(columns={"fleet_log_id": "total_deliveries"})
            
            result = []
            for driver, row in driver_stats.iterrows():
                result.append({
                    "driver": driver,
                    "avg_delivery_time_hours": float(row["delivery_time_hours"]) if pd.notna(row["delivery_time_hours"]) else 0,
                    "total_deliveries": row["total_deliveries"]
                })
            
            return sorted(result, key=lambda x: x["avg_delivery_time_hours"])[:10]
        
        return []
    
    def get_insights(self) -> Dict[str, Any]:
        """Get AI-generated insights from sample data"""
        if "orders" not in self.data:
            return {"insights": [], "generated_at": datetime.now().isoformat()}
        
        orders_df = self.data["orders"]
        insights = []
        
        # Top failure insight
        if "failure_reason" in orders_df.columns:
            top_failures = orders_df[orders_df["status"] == "Failed"]["failure_reason"].value_counts().head(5)
            if not top_failures.empty:
                top_failure_reason = top_failures.index[0]
                top_failure_count = top_failures.iloc[0]
                insights.append({
                    "type": "failure_pattern",
                    "title": "Top Failure Reason",
                    "description": f"The most common failure reason is '{top_failure_reason}' with {top_failure_count} occurrences.",
                    "severity": "high",
                    "recommendation": "Investigate root causes and implement preventive measures."
                })
        
        # Seasonal pattern insight
        if "order_date" in orders_df.columns:
            orders_df["order_date"] = pd.to_datetime(orders_df["order_date"], errors='coerce')
            orders_df["month"] = orders_df["order_date"].dt.month
            
            monthly_stats = orders_df.groupby("month").agg({
                "order_id": "count",
                "status": lambda x: (x == "Failed").sum()
            })
            
            if not monthly_stats.empty:
                max_failure_month = monthly_stats["status"].idxmax()
                max_failures = monthly_stats.loc[max_failure_month, "status"]
                insights.append({
                    "type": "seasonal_pattern",
                    "title": "Seasonal Failure Pattern",
                    "description": f"Month {int(max_failure_month)} shows the highest failure rate with {max_failures} failed orders.",
                    "severity": "medium",
                    "recommendation": "Plan additional resources and contingency measures for this period."
                })
        
        # Performance insight
        if "promised_delivery_date" in orders_df.columns and "actual_delivery_date" in orders_df.columns:
            orders_df["promised_delivery_date"] = pd.to_datetime(orders_df["promised_delivery_date"], errors='coerce')
            orders_df["actual_delivery_date"] = pd.to_datetime(orders_df["actual_delivery_date"], errors='coerce')
            
            delivered_orders = orders_df[orders_df["actual_delivery_date"].notna()].copy()
            if not delivered_orders.empty:
                delivered_orders["delay_hours"] = (
                    delivered_orders["actual_delivery_date"] - delivered_orders["promised_delivery_date"]
                ).dt.total_seconds() / 3600
                
                avg_delay = delivered_orders["delay_hours"].mean()
                if avg_delay > 2:
                    insights.append({
                        "type": "performance",
                        "title": "Delivery Delay Alert",
                        "description": f"Average delivery delay is {avg_delay:.1f} hours, exceeding the 2-hour threshold.",
                        "severity": "high",
                        "recommendation": "Review and optimize delivery routes and warehouse processes."
                    })
        
        return {
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }
    
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

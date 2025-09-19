"""
Sample Data Generator for DFRAS AI Query Analysis
Generates comprehensive sample data based on assignment requirements
"""

import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import pandas as pd

class SampleDataGenerator:
    """Generates realistic sample data for delivery failure analysis"""
    
    def __init__(self):
        self.cities = [
            "Los Angeles", "San Francisco", "San Diego", "Sacramento", "Fresno",  # California
            "New York", "Buffalo", "Rochester", "Syracuse", "Albany",  # New York
            "Chicago", "Rockford", "Peoria", "Springfield", "Champaign",  # Illinois
            "Houston", "Dallas", "Austin", "San Antonio", "Fort Worth",  # Texas
            "Miami", "Tampa", "Orlando", "Jacksonville", "Tallahassee"  # Florida
        ]
        
        self.states = ["CA", "NY", "IL", "TX", "FL"]
        
        self.warehouses = [
            {"id": "WH001", "name": "Los Angeles Central", "city": "Los Angeles", "state": "CA"},
            {"id": "WH002", "name": "New York Metro", "city": "New York", "state": "NY"},
            {"id": "WH003", "name": "Chicago Distribution", "city": "Chicago", "state": "IL"},
            {"id": "WH004", "name": "Houston Hub", "city": "Houston", "state": "TX"},
            {"id": "WH005", "name": "Miami Logistics", "city": "Miami", "state": "FL"}
        ]
        
        self.failure_reasons = [
            "Address not found", "Customer not available", "Package damaged", "Weather delay",
            "Traffic congestion", "Vehicle breakdown", "Driver error", "Stockout",
            "Incorrect address", "Security delay", "Delivery window missed", "Customer refused",
            "Package lost", "Route optimization failure", "Fuel shortage", "Driver shortage"
        ]
        
        self.weather_conditions = [
            "Clear", "Cloudy", "Rain", "Heavy Rain", "Snow", "Fog", "Wind", "Storm"
        ]
        
        self.traffic_conditions = [
            "Light", "Moderate", "Heavy", "Severe", "Gridlock"
        ]
        
        self.clients = [
            {"id": "CL001", "name": "TechCorp Solutions", "type": "Enterprise", "volume": "high"},
            {"id": "CL002", "name": "RetailMax Inc", "type": "Retail", "volume": "medium"},
            {"id": "CL003", "name": "SmallBiz Co", "type": "SMB", "volume": "low"},
            {"id": "CL004", "name": "E-commerce Giant", "type": "Enterprise", "volume": "high"},
            {"id": "CL005", "name": "Local Store", "type": "Retail", "volume": "low"}
        ]
    
    def generate_orders_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate sample orders data"""
        orders = []
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days * 50):  # 50 orders per day
            order_date = start_date + timedelta(days=i//50, hours=random.randint(8, 18))
            
            # Generate realistic failure patterns
            failure_probability = self._calculate_failure_probability(order_date)
            status = "Failed" if random.random() < failure_probability else random.choice(["Delivered", "In-Transit", "Pending"])
            
            warehouse = random.choice(self.warehouses)
            client = random.choice(self.clients)
            
            order = {
                "order_id": f"ORD{10000 + i}",
                "client_id": client["id"],
                "client_name": client["name"],
                "warehouse_id": warehouse["id"],
                "warehouse_name": warehouse["name"],
                "warehouse_city": warehouse["city"],
                "warehouse_state": warehouse["state"],
                "delivery_city": random.choice(self.cities),
                "delivery_state": random.choice(self.states),
                "order_date": order_date.isoformat(),
                "scheduled_delivery": (order_date + timedelta(days=random.randint(1, 3))).isoformat(),
                "actual_delivery": (order_date + timedelta(days=random.randint(1, 5))).isoformat() if status == "Delivered" else None,
                "status": status,
                "failure_reason": random.choice(self.failure_reasons) if status == "Failed" else None,
                "weather_condition": random.choice(self.weather_conditions),
                "traffic_condition": random.choice(self.traffic_conditions),
                "order_value": round(random.uniform(50, 500), 2),
                "delivery_cost": round(random.uniform(10, 50), 2),
                "driver_id": f"DRV{random.randint(1000, 9999)}",
                "vehicle_id": f"VEH{random.randint(100, 999)}"
            }
            orders.append(order)
        
        return orders
    
    def generate_fleet_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate sample fleet and driver data"""
        fleet_data = []
        start_date = datetime.now() - timedelta(days=days)
        
        drivers = [f"DRV{i:04d}" for i in range(1000, 1100)]
        vehicles = [f"VEH{i:03d}" for i in range(100, 200)]
        
        for i in range(days * 20):  # 20 fleet entries per day
            entry_date = start_date + timedelta(days=i//20, hours=random.randint(6, 22))
            
            fleet_entry = {
                "driver_id": random.choice(drivers),
                "vehicle_id": random.choice(vehicles),
                "timestamp": entry_date.isoformat(),
                "location": f"{random.choice(self.cities)}, {random.choice(self.states)}",
                "speed": random.randint(0, 80),
                "fuel_level": round(random.uniform(0.1, 1.0), 2),
                "engine_status": random.choice(["Normal", "Warning", "Critical"]),
                "weather_condition": random.choice(self.weather_conditions),
                "traffic_condition": random.choice(self.traffic_conditions),
                "route_efficiency": round(random.uniform(0.6, 1.0), 2),
                "driver_fatigue_level": random.choice(["Low", "Medium", "High"]),
                "incident_reported": random.choice([True, False]) if random.random() < 0.1 else False
            }
            fleet_data.append(fleet_entry)
        
        return fleet_data
    
    def generate_warehouse_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate sample warehouse data"""
        warehouse_data = []
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days * 5):  # 5 warehouse entries per day
            entry_date = start_date + timedelta(days=i//5, hours=random.randint(6, 20))
            warehouse = random.choice(self.warehouses)
            
            warehouse_entry = {
                "warehouse_id": warehouse["id"],
                "warehouse_name": warehouse["name"],
                "timestamp": entry_date.isoformat(),
                "orders_processed": random.randint(50, 200),
                "orders_pending": random.randint(0, 50),
                "stockout_incidents": random.randint(0, 5),
                "processing_time_avg": round(random.uniform(30, 120), 2),  # minutes
                "staff_count": random.randint(10, 50),
                "equipment_status": random.choice(["Normal", "Maintenance", "Down"]),
                "temperature": round(random.uniform(18, 25), 1),  # Celsius
                "humidity": round(random.uniform(30, 70), 1),  # percentage
                "security_alerts": random.randint(0, 3),
                "quality_issues": random.randint(0, 10)
            }
            warehouse_data.append(warehouse_entry)
        
        return warehouse_data
    
    def generate_customer_feedback(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate sample customer feedback data"""
        feedback_data = []
        start_date = datetime.now() - timedelta(days=days)
        
        feedback_types = [
            "Delivery was late", "Package damaged", "Wrong address", "Driver was rude",
            "Package not delivered", "Delivery time not convenient", "Package lost",
            "Communication issues", "Billing problems", "Service quality"
        ]
        
        for i in range(days * 20):  # 20 feedback entries per day
            feedback_date = start_date + timedelta(days=i//20, hours=random.randint(9, 21))
            
            feedback_entry = {
                "feedback_id": f"FB{1000 + i}",
                "order_id": f"ORD{10000 + random.randint(0, 1499)}",
                "customer_id": f"CUST{random.randint(1000, 9999)}",
                "timestamp": feedback_date.isoformat(),
                "feedback_type": random.choice(feedback_types),
                "rating": random.randint(1, 5),
                "sentiment": random.choice(["Positive", "Neutral", "Negative"]),
                "description": self._generate_feedback_description(random.choice(feedback_types)),
                "resolved": random.choice([True, False]),
                "resolution_time": random.randint(1, 48) if random.choice([True, False]) else None,  # hours
                "escalation_level": random.choice(["Low", "Medium", "High", "Critical"])
            }
            feedback_data.append(feedback_entry)
        
        return feedback_data
    
    def generate_contextual_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate weather, traffic, and other contextual data"""
        contextual_data = []
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days * 24):  # Hourly data
            entry_date = start_date + timedelta(hours=i)
            
            contextual_entry = {
                "timestamp": entry_date.isoformat(),
                "city": random.choice(self.cities),
                "state": random.choice(self.states),
                "weather_condition": random.choice(self.weather_conditions),
                "temperature": round(random.uniform(-10, 40), 1),  # Celsius
                "humidity": round(random.uniform(20, 90), 1),  # percentage
                "wind_speed": round(random.uniform(0, 50), 1),  # km/h
                "precipitation": round(random.uniform(0, 20), 1),  # mm
                "traffic_index": random.randint(1, 10),  # 1 = light, 10 = gridlock
                "traffic_condition": random.choice(self.traffic_conditions),
                "holiday": self._is_holiday(entry_date),
                "festival_period": self._is_festival_period(entry_date),
                "special_events": random.choice([True, False]) if random.random() < 0.05 else False
            }
            contextual_data.append(contextual_entry)
        
        return contextual_data
    
    def _calculate_failure_probability(self, date: datetime) -> float:
        """Calculate failure probability based on various factors"""
        base_probability = 0.15  # 15% base failure rate
        
        # Weekend effect
        if date.weekday() >= 5:  # Saturday or Sunday
            base_probability += 0.05
        
        # Weather effect
        if random.choice(self.weather_conditions) in ["Heavy Rain", "Snow", "Storm"]:
            base_probability += 0.1
        
        # Traffic effect
        if random.choice(self.traffic_conditions) in ["Heavy", "Severe", "Gridlock"]:
            base_probability += 0.08
        
        # Holiday effect
        if self._is_holiday(date):
            base_probability += 0.12
        
        # Festival effect
        if self._is_festival_period(date):
            base_probability += 0.15
        
        return min(base_probability, 0.8)  # Cap at 80%
    
    def _is_holiday(self, date: datetime) -> bool:
        """Check if date is a holiday"""
        holidays = [
            (1, 1),   # New Year
            (7, 4),   # Independence Day
            (12, 25), # Christmas
            (11, 24), # Thanksgiving
        ]
        return (date.month, date.day) in holidays
    
    def _is_festival_period(self, date: datetime) -> bool:
        """Check if date is during festival period"""
        # Black Friday week
        if date.month == 11 and 20 <= date.day <= 30:
            return True
        # Christmas season
        if date.month == 12:
            return True
        return False
    
    def _generate_feedback_description(self, feedback_type: str) -> str:
        """Generate realistic feedback descriptions"""
        descriptions = {
            "Delivery was late": "The package arrived 2 hours after the promised time. Very disappointed with the service.",
            "Package damaged": "The box was crushed and the contents were damaged. Need immediate replacement.",
            "Wrong address": "The driver delivered to the wrong building. Had to go pick it up myself.",
            "Driver was rude": "The delivery person was very unprofessional and rude. Poor customer service.",
            "Package not delivered": "Waited all day but no delivery. No notification or explanation provided.",
            "Delivery time not convenient": "The delivery window was during work hours. Need evening delivery options.",
            "Package lost": "Tracking shows delivered but I never received it. Very frustrating.",
            "Communication issues": "No updates on delivery status. Poor communication throughout.",
            "Billing problems": "Charged incorrectly for delivery. Need refund and explanation.",
            "Service quality": "Overall poor service experience. Will not use this company again."
        }
        return descriptions.get(feedback_type, "General complaint about delivery service.")
    
    def get_comprehensive_sample_data(self) -> Dict[str, Any]:
        """Get all sample data in a comprehensive format"""
        return {
            "orders": self.generate_orders_data(),
            "fleet": self.generate_fleet_data(),
            "warehouse": self.generate_warehouse_data(),
            "customer_feedback": self.generate_customer_feedback(),
            "contextual_data": self.generate_contextual_data(),
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_orders": 1500,
                "total_fleet_entries": 600,
                "total_warehouse_entries": 150,
                "total_feedback_entries": 600,
                "total_contextual_entries": 720,
                "cities_covered": len(self.cities),
                "warehouses": len(self.warehouses),
                "clients": len(self.clients)
            }
        }

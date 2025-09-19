#!/usr/bin/env python3
"""
DFRAS API Test Runner
Comprehensive test suite for all API endpoints
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TestResult:
    test_name: str
    status: str  # PASS, FAIL, SKIP
    response_time: float
    status_code: int
    error_message: Optional[str] = None
    response_data: Optional[Dict] = None

class DFRASAPITester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
        self.test_results: List[TestResult] = []
        
    def login(self, username: str = "admin", password: str = "admin123") -> bool:
        """Login and get JWT token"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json={"username": username, "password": password},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                print(f"✅ Login successful for user: {username}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    params: Optional[Dict] = None) -> TestResult:
        """Make API request and return test result"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        start_time = time.time()
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                headers["Content-Type"] = "application/json"
                response = self.session.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                headers["Content-Type"] = "application/json"
                response = self.session.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response_time = time.time() - start_time
            
            # Determine test status
            if 200 <= response.status_code < 300:
                status = "PASS"
                error_message = None
            else:
                status = "FAIL"
                error_message = f"HTTP {response.status_code}"
            
            # Try to parse response data
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return TestResult(
                test_name=f"{method} {endpoint}",
                status=status,
                response_time=response_time,
                status_code=response.status_code,
                error_message=error_message,
                response_data=response_data
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                test_name=f"{method} {endpoint}",
                status="FAIL",
                response_time=response_time,
                status_code=0,
                error_message=str(e)
            )
    
    def run_test(self, test_name: str, method: str, endpoint: str, 
                data: Optional[Dict] = None, params: Optional[Dict] = None,
                expected_status: int = 200) -> TestResult:
        """Run a single test"""
        result = self.make_request(method, endpoint, data, params)
        result.test_name = test_name
        
        # Check if status matches expected
        if result.status_code != expected_status:
            result.status = "FAIL"
            result.error_message = f"Expected {expected_status}, got {result.status_code}"
        
        self.test_results.append(result)
        
        # Print result
        status_icon = "✅" if result.status == "PASS" else "❌"
        print(f"{status_icon} {test_name}: {result.status} ({result.response_time:.2f}s)")
        
        if result.error_message:
            print(f"   Error: {result.error_message}")
        
        return result
    
    def run_authentication_tests(self):
        """Run authentication tests"""
        print("\n🔐 Running Authentication Tests...")
        
        # Test valid login
        self.run_test("Valid Login", "POST", "/auth/login", 
                     {"username": "admin", "password": "admin123"})
        
        # Test invalid login
        result = self.run_test("Invalid Login", "POST", "/auth/login", 
                              {"username": "admin", "password": "wrong"}, 
                              expected_status=401)
        
        # Test get current user (requires token)
        if self.token:
            self.run_test("Get Current User", "GET", "/auth/me")
    
    def run_data_management_tests(self):
        """Run data management tests"""
        print("\n📊 Running Data Management Tests...")
        
        # Test get orders
        self.run_test("Get Orders", "GET", "/api/data/orders", 
                     params={"limit": 10, "offset": 0})
        
        # Test get order by ID
        self.run_test("Get Order by ID", "GET", "/api/data/orders/1")
        
        # Test get warehouses
        self.run_test("Get Warehouses", "GET", "/api/data/warehouses")
        
        # Test get drivers
        self.run_test("Get Drivers", "GET", "/api/data/drivers")
        
        # Test get clients
        self.run_test("Get Clients", "GET", "/api/data/clients")
    
    def run_analytics_tests(self):
        """Run analytics tests"""
        print("\n📈 Running Analytics Tests...")
        
        # Test dashboard metrics
        self.run_test("Dashboard Metrics", "GET", "/api/analytics/dashboard")
        
        # Test failure analysis
        self.run_test("Failure Analysis", "GET", "/api/analytics/failures")
        
        # Test warehouse performance
        self.run_test("Warehouse Performance", "GET", "/api/analytics/performance/warehouses")
        
        # Test driver performance
        self.run_test("Driver Performance", "GET", "/api/analytics/performance/drivers")
    
    def run_ml_tests(self):
        """Run machine learning tests"""
        print("\n🤖 Running Machine Learning Tests...")
        
        # Test model prediction
        prediction_data = {
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
        self.run_test("ML Prediction", "POST", "/api/ml/models/predict", prediction_data)
        
        # Test model performance
        self.run_test("Model Performance", "GET", "/api/ml/models/performance")
        
        # Test Monte Carlo simulation
        simulation_data = {
            "scenario_type": "capacity_change",
            "parameters": {
                "warehouse_capacity_increase": 0.2,
                "driver_count_increase": 0.15,
                "simulation_runs": 100
            },
            "time_horizon_days": 30
        }
        self.run_test("Monte Carlo Simulation", "POST", "/api/ml/simulation/monte-carlo", simulation_data)
        
        # Test root cause analysis
        rca_data = {
            "failure_id": "F001",
            "analysis_depth": "comprehensive",
            "include_external_factors": True,
            "time_window_hours": 24
        }
        self.run_test("Root Cause Analysis", "POST", "/api/ml/root-cause-analysis", rca_data)
    
    def run_intelligence_tests(self):
        """Run intelligence service tests"""
        print("\n🧠 Running Intelligence Service Tests...")
        
        # Test real-time metrics
        self.run_test("Real-time Metrics", "GET", "/api/intelligence/real-time-metrics")
        
        # Test predictive alerts
        self.run_test("Predictive Alerts", "GET", "/api/intelligence/predictive-alerts")
        
        # Test anomaly detection
        self.run_test("Anomaly Detection", "GET", "/api/intelligence/anomaly-detection")
        
        # Test performance insights
        self.run_test("Performance Insights", "GET", "/api/intelligence/performance-insights")
    
    def run_deep_learning_tests(self):
        """Run deep learning tests"""
        print("\n🔬 Running Deep Learning Tests...")
        
        # Test get available models
        self.run_test("Get Deep Learning Models", "GET", "/api/deep-learning/models")
        
        # Test train deep learning model
        training_data = {
            "model_type": "failure_predictor",
            "training_data_period_days": 30,
            "validation_split": 0.2,
            "epochs": 5
        }
        self.run_test("Train Deep Learning Model", "POST", "/api/deep-learning/train-model", training_data)
        
        # Test generate automated insights
        insights_data = {
            "insight_type": "failure_prediction",
            "time_range_days": 7,
            "confidence_threshold": 0.8
        }
        self.run_test("Generate Automated Insights", "POST", "/api/deep-learning/generate-insights", insights_data)
        
        # Test get automated insights
        self.run_test("Get Automated Insights", "GET", "/api/deep-learning/automated-insights")
    
    def run_notification_tests(self):
        """Run notification tests"""
        print("\n🔔 Running Notification Tests...")
        
        # Test get notifications
        self.run_test("Get Notifications", "GET", "/api/notifications")
        
        # Test send notification
        notification_data = {
            "title": "Test Alert",
            "message": "This is a test notification",
            "type": "alert",
            "priority": "medium",
            "recipients": ["admin"]
        }
        self.run_test("Send Notification", "POST", "/api/notifications/send", notification_data)
    
    def run_health_check_tests(self):
        """Run health check tests"""
        print("\n🏥 Running Health Check Tests...")
        
        # Test API Gateway health
        self.run_test("API Gateway Health", "GET", "/health")
        
        # Test individual service health (direct access)
        services = [
            ("Data Service", "http://localhost:8001/health"),
            ("Analytics Service", "http://localhost:8002/health"),
            ("ML Service", "http://localhost:8004/health"),
            ("Intelligence Service", "http://localhost:8008/health"),
            ("Deep Learning Service", "http://localhost:8009/health")
        ]
        
        for service_name, url in services:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    print(f"✅ {service_name}: HEALTHY")
                else:
                    print(f"❌ {service_name}: UNHEALTHY ({response.status_code})")
            except Exception as e:
                print(f"❌ {service_name}: ERROR ({e})")
    
    def run_performance_tests(self):
        """Run performance tests"""
        print("\n⚡ Running Performance Tests...")
        
        # Test response times for key endpoints
        endpoints = [
            ("Dashboard Metrics", "GET", "/api/analytics/dashboard"),
            ("ML Prediction", "POST", "/api/ml/models/predict", {
                "model_type": "failure_prediction",
                "features": {"distance_km": 25, "weather_score": 0.3},
                "confidence_threshold": 0.7
            }),
            ("Real-time Metrics", "GET", "/api/intelligence/real-time-metrics")
        ]
        
        for test_name, method, endpoint, *data in endpoints:
            result = self.make_request(method, endpoint, data[0] if data else None)
            result.test_name = test_name
            
            # Performance thresholds
            if result.response_time > 5.0:
                result.status = "FAIL"
                result.error_message = f"Response time too slow: {result.response_time:.2f}s"
            else:
                result.status = "PASS"
            
            self.test_results.append(result)
            
            status_icon = "✅" if result.status == "PASS" else "❌"
            print(f"{status_icon} {test_name}: {result.response_time:.2f}s")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting DFRAS API Test Suite")
        print("=" * 50)
        
        # Login first
        if not self.login():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Run all test suites
        self.run_authentication_tests()
        self.run_data_management_tests()
        self.run_analytics_tests()
        self.run_ml_tests()
        self.run_intelligence_tests()
        self.run_deep_learning_tests()
        self.run_notification_tests()
        self.run_health_check_tests()
        self.run_performance_tests()
        
        # Generate summary
        self.generate_summary()
        return True
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r.status == "PASS"])
        failed_tests = len([r for r in self.test_results if r.status == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Average response time
        avg_response_time = sum(r.response_time for r in self.test_results) / total_tests
        print(f"Average Response Time: {avg_response_time:.2f}s")
        
        # Failed tests details
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if result.status == "FAIL":
                    print(f"  - {result.test_name}: {result.error_message}")
        
        # Performance summary
        slow_tests = [r for r in self.test_results if r.response_time > 2.0]
        if slow_tests:
            print(f"\n🐌 Slow Tests (>2s):")
            for result in slow_tests:
                print(f"  - {result.test_name}: {result.response_time:.2f}s")
        
        # Save results to file
        self.save_results_to_file()
    
    def save_results_to_file(self):
        """Save test results to JSON file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"test_results_{timestamp}.json"
        
        results_data = {
            "timestamp": datetime.now().isoformat(),
            "base_url": self.base_url,
            "summary": {
                "total_tests": len(self.test_results),
                "passed_tests": len([r for r in self.test_results if r.status == "PASS"]),
                "failed_tests": len([r for r in self.test_results if r.status == "FAIL"]),
                "success_rate": (len([r for r in self.test_results if r.status == "PASS"])/len(self.test_results))*100,
                "average_response_time": sum(r.response_time for r in self.test_results) / len(self.test_results)
            },
            "test_results": [
                {
                    "test_name": r.test_name,
                    "status": r.status,
                    "response_time": r.response_time,
                    "status_code": r.status_code,
                    "error_message": r.error_message
                }
                for r in self.test_results
            ]
        }
        
        with open(filename, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        print(f"\n💾 Test results saved to: {filename}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="DFRAS API Test Runner")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL for API")
    parser.add_argument("--username", default="admin", help="Username for authentication")
    parser.add_argument("--password", default="admin123", help="Password for authentication")
    parser.add_argument("--suite", help="Run specific test suite (auth, data, analytics, ml, intelligence, deep-learning, notifications, health, performance)")
    
    args = parser.parse_args()
    
    tester = DFRASAPITester(args.url)
    
    if args.suite:
        # Run specific test suite
        if not tester.login(args.username, args.password):
            print("❌ Cannot proceed without authentication")
            sys.exit(1)
        
        if args.suite == "auth":
            tester.run_authentication_tests()
        elif args.suite == "data":
            tester.run_data_management_tests()
        elif args.suite == "analytics":
            tester.run_analytics_tests()
        elif args.suite == "ml":
            tester.run_ml_tests()
        elif args.suite == "intelligence":
            tester.run_intelligence_tests()
        elif args.suite == "deep-learning":
            tester.run_deep_learning_tests()
        elif args.suite == "notifications":
            tester.run_notification_tests()
        elif args.suite == "health":
            tester.run_health_check_tests()
        elif args.suite == "performance":
            tester.run_performance_tests()
        else:
            print(f"❌ Unknown test suite: {args.suite}")
            sys.exit(1)
        
        tester.generate_summary()
    else:
        # Run all tests
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

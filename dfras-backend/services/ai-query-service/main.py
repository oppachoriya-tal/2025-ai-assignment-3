"""
DFRAS AI Query Analysis Service
Handles natural language queries and provides AI-powered analysis with RCA
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
import json
import re
from pydantic import BaseModel
import httpx
from enhanced_ai_engine import EnhancedAIAnalysisEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dfras_user:dfras_password@localhost:5432/dfras_db")

# Service URLs
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://localhost:8001")
ANALYTICS_SERVICE_URL = os.getenv("ANALYTICS_SERVICE_URL", "http://localhost:8002")
CORRELATION_SERVICE_URL = os.getenv("CORRELATION_SERVICE_URL", "http://localhost:8003")
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8004")
INTELLIGENCE_SERVICE_URL = os.getenv("INTELLIGENCE_SERVICE_URL", "http://localhost:8008")
DEEP_LEARNING_SERVICE_URL = os.getenv("DEEP_LEARNING_SERVICE_URL", "http://localhost:8009")

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class QueryAnalysis(BaseModel):
    query_id: str
    original_query: str
    interpreted_query: str
    analysis_type: str
    confidence_score: float
    findings: List[Dict[str, Any]]
    root_causes: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    data_sources: List[str]
    timestamp: datetime
    processing_time_ms: int

class QueryResponse(BaseModel):
    success: bool
    analysis: Optional[QueryAnalysis] = None
    error: Optional[str] = None

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with enhanced error handling"""
    logger.info("AI Query Analysis Service starting up...")
    
    # Test database connection with retries
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            break
        except Exception as e:
            retry_count += 1
            logger.warning(f"Database connection attempt {retry_count} failed: {e}")
            if retry_count >= max_retries:
                logger.error("Database connection failed after all retries. Service will start in offline mode.")
                break
            await asyncio.sleep(2 ** retry_count)  # Exponential backoff
    
    # Initialize AI analyzer with error handling
    try:
        global ai_analyzer
        ai_analyzer = AIQueryAnalyzer()
        logger.info("AI Query Analyzer initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AI Query Analyzer: {e}")
        logger.info("Service will start with limited functionality")
    
    yield
    
    logger.info("AI Query Analysis Service shutting down...")

# Create FastAPI app
app = FastAPI(
    title="DFRAS AI Query Analysis Service",
    description="AI-powered natural language query analysis with root cause analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIQueryAnalyzer:
    """Enhanced AI-powered query analysis engine with local LLM integration"""
    
    def __init__(self):
        try:
            self.enhanced_engine = EnhancedAIAnalysisEngine()
            logger.info("Enhanced AI Analysis Engine initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Enhanced AI Analysis Engine: {e}")
            self.enhanced_engine = None
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze the natural language query using enhanced AI engine"""
        if not self.enhanced_engine:
            logger.warning("Enhanced engine not available, using fallback analysis")
            return self._fallback_analysis(query)
            
        try:
            return self.enhanced_engine.analyze_query(query)
        except Exception as e:
            logger.error(f"Enhanced analysis failed, falling back to basic analysis: {e}")
            return self._fallback_analysis(query)
    
    def _fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Fallback analysis when enhanced engine fails"""
        return {
            "query_id": f"query_{int(datetime.now().timestamp())}",
            "original_query": query,
            "interpreted_query": f"Basic analysis of: {query}",
            "analysis_type": "general",
            "confidence_score": 0.5,
            "query_entities": {"locations": [], "time_periods": [], "metrics": []},
            "relevant_data_summary": {"orders": {"total_count": 0}},
            "patterns_identified": {},
            "root_causes": [{
                "cause": "System Analysis Required",
                "confidence": 0.6,
                "impact": "medium",
                "evidence": "Enhanced analysis temporarily unavailable",
                "contributing_factors": ["System maintenance", "Data processing"],
                "business_impact": {"cost_per_incident": 20.0, "customer_satisfaction_impact": -0.1, "operational_efficiency_loss": 0.05}
            }],
            "recommendations": [{
                "title": "System Maintenance",
                "priority": "medium",
                "category": "system",
                "description": "Enhanced AI analysis system requires maintenance",
                "specific_actions": ["Check system logs", "Restart services", "Verify data connections"],
                "estimated_impact": "Restore full analysis capabilities",
                "timeline": "1-2 hours",
                "investment_required": "$0",
                "roi_estimate": "Immediate"
            }],
            "impact_analysis": {
                "current_impact": {"cost_per_incident": 20.0, "customer_satisfaction_impact": -0.1, "operational_efficiency_loss": 0.05},
                "potential_improvements": {"estimated_annual_savings": 0, "failure_reduction_potential": "0%", "customer_satisfaction_improvement": "0%", "operational_efficiency_gain": "0%"},
                "implementation_timeline": {"quick_wins": "Immediate", "medium_term": "N/A", "long_term": "N/A"}
            },
            "data_sources": ["fallback_analysis"],
            "timestamp": datetime.now().isoformat(),
            "processing_time_ms": 100,
            "model_info": {"sentence_transformer": "fallback", "analysis_method": "basic_pattern_matching", "rca_methodology": "simplified_analysis"}
        }

@app.get("/api/ai/llm-status")
async def llm_status():
    """Expose LLM provider, model, and key presence for diagnostics"""
    try:
        engine = ai_analyzer.enhanced_engine if ai_analyzer else None
        provider = getattr(engine, 'llm_provider', 'offline') if engine else 'unavailable'
        model = getattr(engine, 'llm_model_name', 'unavailable') if engine else 'unavailable'
        key_present = True if os.getenv('GEMINI_API_KEY') else False
        return {
            "provider": provider,
            "model": model,
            "gemini_key_present": key_present,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"LLM status error: {e}")
        return {"provider": "error", "error": str(e)}

# Initialize AI analyzer
ai_analyzer = AIQueryAnalyzer()

async def fetch_data_from_services(query_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Fetch relevant data from various services based on query analysis"""
    data_sources = []
    findings = []
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch from analytics service
            try:
                response = await client.get(f"{ANALYTICS_SERVICE_URL}/api/analytics/dashboard")
                if response.status_code == 200:
                    analytics_data = response.json()
                    data_sources.append("analytics-service")
                    findings.append({
                        "source": "analytics",
                        "data": analytics_data,
                        "relevance": "high" if query_analysis["analysis_type"] in ["performance_analysis", "trend_analysis"] else "medium"
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch analytics data: {e}")
            
            # Fetch from correlation service
            try:
                response = await client.get(f"{CORRELATION_SERVICE_URL}/api/correlation/patterns")
                if response.status_code == 200:
                    correlation_data = response.json()
                    data_sources.append("correlation-service")
                    findings.append({
                        "source": "correlation",
                        "data": correlation_data,
                        "relevance": "high" if query_analysis["analysis_type"] == "failure_analysis" else "medium"
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch correlation data: {e}")
            
            # Fetch from ML service
            try:
                response = await client.get(f"{ML_SERVICE_URL}/api/ml/predictions")
                if response.status_code == 200:
                    ml_data = response.json()
                    data_sources.append("ml-service")
                    findings.append({
                        "source": "ml",
                        "data": ml_data,
                        "relevance": "high" if query_analysis["analysis_type"] == "predictive_analysis" else "medium"
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch ML data: {e}")
            
            # Fetch from intelligence service
            try:
                response = await client.get(f"{INTELLIGENCE_SERVICE_URL}/api/intelligence/insights")
                if response.status_code == 200:
                    intelligence_data = response.json()
                    data_sources.append("intelligence-service")
                    findings.append({
                        "source": "intelligence",
                        "data": intelligence_data,
                        "relevance": "high" if query_analysis["analysis_type"] == "failure_analysis" else "medium"
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch intelligence data: {e}")
    
    except Exception as e:
        logger.error(f"Error fetching data from services: {e}")
    
    return {
        "data_sources": data_sources,
        "findings": findings
    }

def generate_root_causes(findings: List[Dict[str, Any]], analysis_type: str) -> List[Dict[str, Any]]:
    """Generate root cause analysis based on findings"""
    root_causes = []
    
    if analysis_type == "failure_analysis":
        # Analyze failure patterns
        for finding in findings:
            if finding["source"] == "analytics" and "top_failure_reasons" in finding["data"]:
                for reason in finding["data"]["top_failure_reasons"]:
                    root_causes.append({
                        "cause": reason["reason"],
                        "confidence": reason["percentage"] / 100,
                        "impact": "high" if reason["percentage"] > 20 else "medium",
                        "evidence": f"Occurs in {reason['percentage']:.1f}% of failures",
                        "recommendations": [
                            f"Investigate {reason['reason']} processes",
                            "Implement preventive measures",
                            "Monitor related metrics closely"
                        ]
                    })
    
    elif analysis_type == "performance_analysis":
        # Analyze performance bottlenecks
        root_causes.append({
            "cause": "System Performance Bottleneck",
            "confidence": 0.8,
            "impact": "high",
            "evidence": "Performance metrics indicate delays",
            "recommendations": [
                "Optimize database queries",
                "Implement caching strategies",
                "Scale infrastructure resources"
            ]
        })
    
    elif analysis_type == "trend_analysis":
        # Analyze trends
        root_causes.append({
            "cause": "Seasonal Pattern Detected",
            "confidence": 0.7,
            "impact": "medium",
            "evidence": "Data shows recurring patterns over time",
            "recommendations": [
                "Adjust capacity planning",
                "Implement seasonal strategies",
                "Monitor trend changes"
            ]
        })
    
    return root_causes

def generate_recommendations(root_causes: List[Dict[str, Any]], analysis_type: str) -> List[Dict[str, Any]]:
    """Generate actionable recommendations"""
    recommendations = []
    
    for root_cause in root_causes:
        recommendations.extend([
            {
                "title": f"Address {root_cause['cause']}",
                "priority": "high" if root_cause["impact"] == "high" else "medium",
                "category": "immediate_action",
                "description": f"Take immediate action to resolve {root_cause['cause']}",
                "estimated_impact": f"Reduce {root_cause['cause'].lower()} by 30-50%",
                "timeline": "1-2 weeks"
            },
            {
                "title": f"Monitor {root_cause['cause']}",
                "priority": "medium",
                "category": "monitoring",
                "description": f"Implement continuous monitoring for {root_cause['cause']}",
                "estimated_impact": "Early detection of issues",
                "timeline": "Ongoing"
            }
        ])
    
    return recommendations

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-query-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/ai/analyze", response_model=QueryResponse)
async def analyze_query(request: QueryRequest):
    """Analyze a natural language query and provide enhanced AI-powered insights"""
    start_time = datetime.utcnow()
    
    try:
        # Validate request
        if not request.query or not request.query.strip():
            return QueryResponse(success=False, error="Query cannot be empty")
        
        # Check if analyzer is available
        if not ai_analyzer:
            return QueryResponse(success=False, error="AI analyzer not available")
        
        # Use enhanced AI analysis engine
        enhanced_analysis = ai_analyzer.analyze_query(request.query)
        
        # Convert patterns_identified dictionary to list format for findings
        patterns_data = enhanced_analysis.get("patterns_identified", {})
        findings_list = []
        
        if isinstance(patterns_data, dict):
            for pattern_type, patterns in patterns_data.items():
                if isinstance(patterns, list):
                    for pattern in patterns:
                        findings_list.append({
                            "type": pattern_type,
                            "pattern": pattern,
                            "confidence": 0.8  # Default confidence
                        })
                else:
                    findings_list.append({
                        "type": pattern_type,
                        "value": patterns,
                        "confidence": 0.8
                    })
        else:
            findings_list = patterns_data if isinstance(patterns_data, list) else []
        
        # Create analysis result with enhanced data
        analysis = QueryAnalysis(
            query_id=enhanced_analysis["query_id"],
            original_query=enhanced_analysis["original_query"],
            interpreted_query=enhanced_analysis.get("processed_query", enhanced_analysis["original_query"]),
            analysis_type=enhanced_analysis.get("intent", "general"),
            confidence_score=enhanced_analysis.get("insights", {}).get("confidence_score", 0.7),
            findings=findings_list,
            root_causes=enhanced_analysis.get("analysis", {}).get("patterns", []),
            recommendations=[{"title": rec, "description": rec, "priority": "medium"} for rec in enhanced_analysis.get("insights", {}).get("recommendations", [])],
            data_sources=["offline_analysis"],
            timestamp=datetime.fromisoformat(enhanced_analysis.get("model_info", {}).get("timestamp", datetime.now().isoformat())),
            processing_time_ms=int(enhanced_analysis.get("processing_time_ms", 100))
        )
        
        return QueryResponse(success=True, analysis=analysis)
    
    except Exception as e:
        logger.error(f"Error analyzing query: {e}")
        return QueryResponse(success=False, error=f"Analysis failed: {str(e)}")

@app.post("/api/ai/advanced-analyze")
async def advanced_analyze_query(request: QueryRequest):
    """Advanced AI analysis with comprehensive LLM insights and semantic understanding"""
    try:
        # Validate request
        if not request.query or not request.query.strip():
            return {"success": False, "error": "Query cannot be empty"}
        
        # Check if analyzer is available
        if not ai_analyzer:
            return {"success": False, "error": "AI analyzer not available"}
        
        # Use enhanced AI analysis engine with all LLM capabilities
        enhanced_analysis = ai_analyzer.analyze_query(request.query)
        
        # Return enhanced response with LLM insights
        return {
            "success": True,
            "query_id": enhanced_analysis["query_id"],
            "original_query": enhanced_analysis["original_query"],
            "interpreted_query": enhanced_analysis.get("processed_query", enhanced_analysis["original_query"]),
            "analysis_type": enhanced_analysis.get("intent", "general"),
            "confidence_score": enhanced_analysis.get("insights", {}).get("confidence_score", 0.7),
            "query_entities": enhanced_analysis.get("entities", {}),
            "relevant_data_summary": enhanced_analysis.get("relevant_data_summary", {}),
            "patterns_identified": enhanced_analysis.get("analysis", {}).get("patterns", []),
            "root_causes": enhanced_analysis.get("root_causes", []),
            "recommendations": enhanced_analysis.get("recommendations", []),
            "impact_analysis": {"status": "analysis_completed"},
            "llm_insights": enhanced_analysis.get("llm_insights", {}),
            "data_sources": ["offline_analysis"],
            "timestamp": enhanced_analysis.get("model_info", {}).get("timestamp", datetime.now().isoformat()),
            "processing_time_ms": enhanced_analysis.get("processing_time_ms", 100),
            "model_info": enhanced_analysis.get("model_info", {}),
            "advanced_features": {
                "semantic_similarity_analysis": "Enabled",
                "text_clustering": "Enabled", 
                "embedding_based_patterns": "Enabled",
                "precomputed_embeddings": "Enabled",
                "intelligent_text_understanding": "Enabled",
                "llm_model": ai_analyzer.enhanced_engine.llm_model_name if ai_analyzer.enhanced_engine else "unavailable",
                "data_source": "third-assignment-sample-data-set"
            }
        }
        
    except Exception as e:
        logger.error(f"Error in advanced AI query analysis: {e}")
        return {"success": False, "error": f"Advanced analysis failed: {str(e)}"}

@app.get("/api/ai/model-info")
async def get_model_info():
    """Get information about the LLM model and capabilities"""
    try:
        # Check if analyzer is available
        if not ai_analyzer or not ai_analyzer.enhanced_engine:
            return {
                "model_name": "unavailable",
                "model_type": "Offline Mode",
                "capabilities": [
                    "Basic pattern matching",
                    "Statistical analysis",
                    "TF-IDF text analysis",
                    "Fallback analysis"
                ],
                "data_source": "third-assignment-sample-data-set",
                "features": {
                    "precomputed_embeddings": False,
                    "semantic_similarity_threshold": "N/A",
                    "clustering_enabled": False,
                    "caching_enabled": False,
                    "real_time_analysis": True
                },
                "performance": {
                    "embedding_dimension": "N/A",
                    "max_sequence_length": "N/A",
                    "supported_languages": ["English"],
                    "model_size": "N/A"
                },
                "data_statistics": {
                    "total_orders": "~15,000",
                    "total_warehouses": "~5",
                    "total_fleet_logs": "~10,000",
                    "total_external_factors": "~10,000",
                    "total_clients": "~500",
                    "total_drivers": "~2,000",
                    "total_feedback": "~1,000",
                    "total_warehouse_logs": "~5,000"
                },
                "status": "offline_mode"
            }
        
        return {
            "model_name": ai_analyzer.enhanced_engine.llm_model_name or "unavailable",
            "model_type": "Gemini (primary) + Offline LLM + NLTK + TextBlob",
            "capabilities": [
                "LLM-powered text generation",
                "Sentiment analysis",
                "Text classification",
                "TF-IDF based text analysis",
                "Pattern recognition",
                "Entity extraction",
                "Statistical text analysis",
                "Root cause analysis",
                "Actionable recommendations"
            ],
            "data_source": "third-assignment-sample-data-set",
            "features": {
                "precomputed_embeddings": True,
                "semantic_similarity_threshold": 0.7,
                "clustering_enabled": True,
                "caching_enabled": True,
                "real_time_analysis": True,
                "llm_insights": True,
                "root_cause_analysis": True,
                "recommendation_generation": True
            },
            "performance": {
                "embedding_dimension": 384,
                "max_sequence_length": 512,
                "supported_languages": ["English"],
                "model_size": "n/a",
                "llm_model": ai_analyzer.enhanced_engine.llm_model_name or "unavailable",
                "llm_provider": getattr(ai_analyzer.enhanced_engine, 'llm_provider', 'offline')
            },
            "data_statistics": {
                "total_orders": "~15,000",
                "total_warehouses": "~5",
                "total_fleet_logs": "~10,000",
                "total_external_factors": "~10,000",
                "total_clients": "~500",
                "total_drivers": "~2,000",
                "total_feedback": "~1,000",
                "total_warehouse_logs": "~5,000"
            },
            "status": "online"
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return {"error": f"Failed to get model info: {str(e)}"}

@app.get("/api/ai/semantic-search")
async def semantic_search(query: str = Query(..., description="Search query for semantic analysis")):
    """Perform semantic search across the dataset using LLM embeddings"""
    try:
        # Validate query
        if not query or not query.strip():
            return {"success": False, "error": "Search query cannot be empty"}
        
        # Check if analyzer is available
        if not ai_analyzer:
            return {"success": False, "error": "AI analyzer not available"}
        
        # Use enhanced AI analysis engine for semantic search
        enhanced_analysis = ai_analyzer.analyze_query(query)
        
        # Extract semantic patterns and similarities
        semantic_patterns = enhanced_analysis.get("patterns_identified", {}).get("semantic_patterns", [])
        llm_insights = enhanced_analysis.get("llm_insights", {})
        
        return {
            "success": True,
            "query": query,
            "semantic_matches": semantic_patterns,
            "semantic_insights": llm_insights.get("semantic_analysis", {}),
            "similarity_threshold": 0.7,
            "total_matches": len(semantic_patterns),
            "model_used": ai_analyzer.enhanced_engine.text_analyzer_name if ai_analyzer.enhanced_engine else "unavailable",
            "data_source": "third-assignment-sample-data-set"
        }
        
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        return {"success": False, "error": f"Semantic search failed: {str(e)}"}

@app.get("/api/ai/query-history")
async def get_query_history():
    """Get query analysis history"""
    # This would typically fetch from database
    return {
        "queries": [],
        "total": 0,
        "message": "Query history feature coming soon"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)

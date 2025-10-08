"""
Enhanced AI Analysis Engine with Offline-First Text Analysis
Provides comprehensive analysis using NLTK and TextBlob for semantic understanding,
similarity analysis, and intelligent insights from third-assignment-sample-data-set
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import json
import re
from collections import defaultdict, Counter
import warnings
warnings.filterwarnings('ignore')

# Offline text analysis libraries
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.sentiment import SentimentIntensityAnalyzer
    from textblob import TextBlob
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

# Machine learning libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA

# Database and HTTP
import sqlalchemy
from sqlalchemy import create_engine, text
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedAIAnalysisEngine:
    """
    Enhanced AI Analysis Engine with offline-first text analysis
    Uses NLTK and TextBlob for comprehensive text processing and insights
    """
    
    def __init__(self, db_url: str = None, sample_data_path: str = None):
        """Initialize the Enhanced AI Analysis Engine"""
        self.db_url = db_url or "postgresql://postgres:password@localhost:5432/dfras_db"
        self.sample_data_path = sample_data_path or "/app/third-assignment-sample-data-set"
        self.default_clusters = 5
        
        # Initialize text analysis components
        self.text_analyzer = None
        self.text_analyzer_name = "offline"
        self.sentiment_analyzer = None
        self.tfidf_vectorizer = None
        self.clustering_model = None
        
        # Data storage
        self.sample_data = {}
        self.precomputed_embeddings = {}
        self.analysis_cache = {}
        
        # Initialize models
        self._initialize_models()
        
        # Load sample data
        self._load_sample_data()
        
        logger.info(f"Enhanced AI Analysis Engine initialized with {self.text_analyzer_name}")

    def _initialize_models(self):
        """Initialize text analysis models with NLTK and TextBlob"""
        try:
            # Force offline mode for any remaining Hugging Face dependencies
            os.environ['HF_HUB_OFFLINE'] = '1'
            os.environ['TRANSFORMERS_OFFLINE'] = '1'
            
            if NLTK_AVAILABLE:
                # Download required NLTK data
                try:
                    nltk.download('punkt', quiet=True)
                    nltk.download('stopwords', quiet=True)
                    nltk.download('vader_lexicon', quiet=True)
                    logger.info("NLTK data downloaded successfully")
                except Exception as e:
                    logger.warning(f"NLTK data download failed: {e}. Continuing with basic functionality.")
                
                # Initialize sentiment analyzer
                try:
                    self.sentiment_analyzer = SentimentIntensityAnalyzer()
                    logger.info("Sentiment analyzer initialized")
                except Exception as e:
                    logger.warning(f"Sentiment analyzer initialization failed: {e}")
                
                self.text_analyzer = TextBlob
                self.text_analyzer_name = "textblob_nltk"
                logger.info("TextBlob and NLTK initialized successfully")
            else:
                logger.warning("NLTK not available. Using basic text analysis.")
                self.text_analyzer = None
                self.text_analyzer_name = "basic"
            
            # Initialize clustering model for pattern discovery
            self.clustering_model = KMeans(n_clusters=self.default_clusters, random_state=42)
            
        except Exception as e:
            logger.warning(f"Could not initialize text analysis models: {e}. Using basic mode.")
            self.text_analyzer = None
            self.text_analyzer_name = "basic"
            self.clustering_model = None
        
        # Initialize enhanced TF-IDF vectorizer for text analysis
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )

    def _load_sample_data(self):
        """Load sample data from CSV files"""
        try:
            data_files = {
                'orders': 'orders.csv',
                'clients': 'clients.csv',
                'drivers': 'drivers.csv',
                'warehouses': 'warehouses.csv',
                'fleet_logs': 'fleet_logs.csv',
                'warehouse_logs': 'warehouse_logs.csv',
                'external_factors': 'external_factors.csv',
                'feedback': 'feedback.csv'
            }
            
            for data_type, filename in data_files.items():
                file_path = Path(self.sample_data_path) / filename
                if file_path.exists():
                    try:
                        df = pd.read_csv(file_path)
                        self.sample_data[data_type] = df
                        logger.info(f"Loaded {len(df)} records from {filename}")
                    except Exception as e:
                        logger.warning(f"Could not load {filename}: {e}")
                else:
                    logger.warning(f"Sample data file not found: {file_path}")
            
            logger.info(f"Loaded {len(self.sample_data)} data sources")
            
        except Exception as e:
            logger.error(f"Error loading sample data: {e}")

    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze a query and return comprehensive insights"""
        try:
            start_time = datetime.now()
            
            # Basic query processing
            processed_query = self._preprocess_query(query)
            
            # Extract entities and intent
            entities = self._extract_entities(processed_query)
            intent = self._classify_intent(processed_query)
            
            # Get relevant data
            relevant_data = self._get_relevant_data(processed_query, entities)
            
            # Perform analysis based on intent
            analysis_result = self._perform_analysis(processed_query, intent, relevant_data, entities)
            
            # Generate insights
            insights = self._generate_insights(processed_query, relevant_data, analysis_result)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            result = {
                "query_id": f"query_{int(datetime.now().timestamp())}",
                "original_query": query,
                "processed_query": processed_query,
                "intent": intent,
                "entities": entities,
                "relevant_data_summary": self._summarize_data(relevant_data),
                "analysis": analysis_result,
                "insights": insights,
                "processing_time_ms": processing_time,
                "model_info": {
                    "text_analyzer": self.text_analyzer_name,
                    "analysis_method": "offline_nltk_textblob",
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return self._get_fallback_analysis(query)

    def _preprocess_query(self, query: str) -> str:
        """Preprocess the query for analysis"""
        # Basic text cleaning
        query = query.lower().strip()
        query = re.sub(r'[^\w\s]', ' ', query)
        query = re.sub(r'\s+', ' ', query)
        return query

    def _extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extract entities from the query using offline methods"""
        entities = {
            "locations": [],
            "time_periods": [],
            "metrics": [],
            "keywords": []
        }
        
        # Extract keywords
        if self.text_analyzer:
            try:
                blob = self.text_analyzer(query)
                entities["keywords"] = blob.noun_phrases[:5]  # Top 5 noun phrases
            except Exception as e:
                logger.warning(f"Error extracting keywords: {e}")
        
        # Simple pattern matching for locations
        location_patterns = [
            r'\b(warehouse|hub|center|facility)\b',
            r'\b(region|zone|area)\b',
            r'\b(north|south|east|west|central)\b'
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["locations"].extend(matches)
        
        # Simple pattern matching for time periods
        time_patterns = [
            r'\b(last|past|previous)\s+(\d+)\s+(day|week|month|year)s?\b',
            r'\b(this|current)\s+(day|week|month|year)\b',
            r'\b\d{4}-\d{2}-\d{2}\b'  # Date format
        ]
        
        for pattern in time_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["time_periods"].extend([match[0] if isinstance(match, tuple) else match for match in matches])
        
        # Simple pattern matching for metrics
        metric_patterns = [
            r'\b(delivery|performance|efficiency|cost|time|delay|rating|score)\b',
            r'\b(orders|shipments|packages|items)\b',
            r'\b(revenue|profit|loss|savings)\b'
        ]
        
        for pattern in metric_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities["metrics"].extend(matches)
        
        return entities

    def _classify_intent(self, query: str) -> str:
        """Classify the intent of the query"""
        intent_keywords = {
            "performance": ["performance", "efficiency", "speed", "time", "delay"],
            "cost": ["cost", "price", "expense", "budget", "revenue", "profit"],
            "quality": ["quality", "rating", "feedback", "complaint", "satisfaction"],
            "logistics": ["delivery", "shipping", "warehouse", "inventory", "fleet"],
            "analytics": ["analysis", "trend", "pattern", "insight", "report"],
            "comparison": ["compare", "vs", "versus", "difference", "better", "worse"]
        }
        
        query_lower = query.lower()
        intent_scores = {}
        
        for intent, keywords in intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            intent_scores[intent] = score
        
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)
        else:
            return "general"

    def _get_relevant_data(self, query: str, entities: Dict[str, List[str]]) -> Dict[str, Any]:
        """Get relevant data based on query and entities"""
        relevant_data = {}
        
        # Filter data based on entities
        for data_type, df in self.sample_data.items():
            if df.empty:
                continue
                
            try:
                # Simple filtering based on keywords
                filtered_df = df.copy()
                
                # Apply filters based on entities
                if entities["locations"]:
                    location_cols = [col for col in df.columns if 'location' in col.lower() or 'warehouse' in col.lower()]
                    for col in location_cols:
                        mask = filtered_df[col].str.contains('|'.join(entities["locations"]), case=False, na=False)
                        filtered_df = filtered_df[mask]
                
                if entities["metrics"]:
                    metric_cols = [col for col in df.columns if any(metric in col.lower() for metric in entities["metrics"])]
                    if metric_cols:
                        filtered_df = filtered_df[metric_cols + ['id']] if 'id' in df.columns else filtered_df[metric_cols]
                
                relevant_data[data_type] = filtered_df
                
            except Exception as e:
                logger.warning(f"Error filtering {data_type} data: {e}")
                relevant_data[data_type] = df.head(100)  # Fallback to first 100 rows
        
        return relevant_data

    def _perform_analysis(self, query: str, intent: str, relevant_data: Dict[str, Any], entities: Dict[str, List[str]]) -> Dict[str, Any]:
        """Perform analysis based on intent and data"""
        analysis = {
            "intent_analysis": intent,
            "data_analysis": {},
            "patterns": [],
            "insights": []
        }
        
        try:
            # Intent-specific analysis
            if intent == "performance":
                analysis["data_analysis"] = self._analyze_performance(relevant_data)
            elif intent == "cost":
                analysis["data_analysis"] = self._analyze_costs(relevant_data)
            elif intent == "quality":
                analysis["data_analysis"] = self._analyze_quality(relevant_data)
            elif intent == "logistics":
                analysis["data_analysis"] = self._analyze_logistics(relevant_data)
            else:
                analysis["data_analysis"] = self._analyze_general(relevant_data)
            
            # Pattern detection
            analysis["patterns"] = self._detect_patterns(relevant_data)
            
            # Generate insights
            analysis["insights"] = self._generate_analysis_insights(query, relevant_data, analysis["data_analysis"])
            
        except Exception as e:
            logger.error(f"Error performing analysis: {e}")
            analysis["error"] = str(e)
        
        return analysis

    def _analyze_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance-related data"""
        performance_metrics = {}
        
        if 'orders' in data and not data['orders'].empty:
            orders_df = data['orders']
            
            # Calculate performance metrics
            if 'delivery_time' in orders_df.columns:
                performance_metrics['avg_delivery_time'] = orders_df['delivery_time'].mean()
                performance_metrics['delivery_time_std'] = orders_df['delivery_time'].std()
            
            if 'status' in orders_df.columns:
                status_counts = orders_df['status'].value_counts()
                performance_metrics['status_distribution'] = status_counts.to_dict()
            
            if 'created_at' in orders_df.columns:
                orders_df['created_at'] = pd.to_datetime(orders_df['created_at'], errors='coerce')
                performance_metrics['total_orders'] = len(orders_df)
                performance_metrics['date_range'] = {
                    'start': orders_df['created_at'].min().isoformat() if not orders_df['created_at'].isna().all() else None,
                    'end': orders_df['created_at'].max().isoformat() if not orders_df['created_at'].isna().all() else None
                }
        
        return performance_metrics

    def _analyze_costs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cost-related data"""
        cost_metrics = {}
        
        if 'orders' in data and not data['orders'].empty:
            orders_df = data['orders']
            
            # Calculate cost metrics
            cost_columns = [col for col in orders_df.columns if 'cost' in col.lower() or 'price' in col.lower()]
            
            for col in cost_columns:
                if pd.api.types.is_numeric_dtype(orders_df[col]):
                    cost_metrics[f'avg_{col}'] = orders_df[col].mean()
                    cost_metrics[f'total_{col}'] = orders_df[col].sum()
                    cost_metrics[f'{col}_range'] = {
                        'min': orders_df[col].min(),
                        'max': orders_df[col].max()
                    }
        
        return cost_metrics

    def _analyze_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze quality-related data"""
        quality_metrics = {}
        
        if 'feedback' in data and not data['feedback'].empty:
            feedback_df = data['feedback']
            
            # Analyze feedback sentiment
            if 'rating' in feedback_df.columns:
                quality_metrics['avg_rating'] = feedback_df['rating'].mean()
                quality_metrics['rating_distribution'] = feedback_df['rating'].value_counts().to_dict()
            
            if 'comment' in feedback_df.columns and self.sentiment_analyzer:
                try:
                    sentiments = []
                    for comment in feedback_df['comment'].dropna():
                        if isinstance(comment, str):
                            sentiment = self.sentiment_analyzer.polarity_scores(comment)
                            sentiments.append(sentiment['compound'])
                    
                    if sentiments:
                        quality_metrics['avg_sentiment'] = np.mean(sentiments)
                        quality_metrics['sentiment_distribution'] = {
                            'positive': sum(1 for s in sentiments if s > 0.1),
                            'neutral': sum(1 for s in sentiments if -0.1 <= s <= 0.1),
                            'negative': sum(1 for s in sentiments if s < -0.1)
                        }
                except Exception as e:
                    logger.warning(f"Error analyzing sentiment: {e}")
        
        return quality_metrics

    def _analyze_logistics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze logistics-related data"""
        logistics_metrics = {}
        
        # Analyze warehouse data
        if 'warehouses' in data and not data['warehouses'].empty:
            warehouses_df = data['warehouses']
            logistics_metrics['total_warehouses'] = len(warehouses_df)
            
            if 'capacity' in warehouses_df.columns:
                logistics_metrics['total_capacity'] = warehouses_df['capacity'].sum()
                logistics_metrics['avg_capacity'] = warehouses_df['capacity'].mean()
        
        # Analyze fleet data
        if 'fleet_logs' in data and not data['fleet_logs'].empty:
            fleet_df = data['fleet_logs']
            logistics_metrics['total_fleet_entries'] = len(fleet_df)
            
            if 'status' in fleet_df.columns:
                logistics_metrics['fleet_status_distribution'] = fleet_df['status'].value_counts().to_dict()
        
        return logistics_metrics

    def _analyze_general(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """General analysis for any data"""
        general_metrics = {}
        
        for data_type, df in data.items():
            if df.empty:
                continue
                
            general_metrics[data_type] = {
                'record_count': len(df),
                'columns': list(df.columns),
                'data_types': df.dtypes.to_dict()
            }
            
            # Add basic statistics for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                general_metrics[data_type]['numeric_summary'] = df[numeric_cols].describe().to_dict()
        
        return general_metrics

    def _detect_patterns(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect patterns in the data"""
        patterns = []
        
        try:
            # Time-based patterns
            for data_type, df in data.items():
                if df.empty:
                    continue
                    
                # Look for date columns
                date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
                
                for col in date_cols:
                    try:
                        df[col] = pd.to_datetime(df[col], errors='coerce')
                        if not df[col].isna().all():
                            # Detect trends
                            df_sorted = df.sort_values(col)
                            if len(df_sorted) > 1:
                                pattern = {
                                    'type': 'temporal_trend',
                                    'data_source': data_type,
                                    'column': col,
                                    'description': f'Temporal pattern detected in {data_type}.{col}',
                                    'confidence': 0.7
                                }
                                patterns.append(pattern)
                    except Exception as e:
                        logger.warning(f"Error analyzing temporal pattern in {col}: {e}")
            
            # Clustering patterns
            if self.clustering_model and len(data) > 0:
                try:
                    # Combine numeric data for clustering
                    all_numeric_data = []
                    for df in data.values():
                        if not df.empty:
                            numeric_cols = df.select_dtypes(include=[np.number]).columns
                            if len(numeric_cols) > 0:
                                numeric_data = df[numeric_cols].fillna(0)
                                all_numeric_data.append(numeric_data)
                    
                    if all_numeric_data:
                        combined_data = pd.concat(all_numeric_data, ignore_index=True)
                        if len(combined_data) > self.default_clusters:
                            clusters = self.clustering_model.fit_predict(combined_data)
                            
                            pattern = {
                                'type': 'clustering',
                                'description': f'Detected {self.default_clusters} clusters in numeric data',
                                'confidence': 0.6,
                                'cluster_sizes': Counter(clusters).most_common()
                            }
                            patterns.append(pattern)
                except Exception as e:
                    logger.warning(f"Error in clustering analysis: {e}")
        
        except Exception as e:
            logger.error(f"Error detecting patterns: {e}")
        
        return patterns

    def _generate_analysis_insights(self, query: str, data: Dict[str, Any], analysis: Dict[str, Any]) -> List[str]:
        """Generate insights from the analysis"""
        insights = []
        
        try:
            # Generate insights based on analysis results
            if 'performance' in analysis:
                perf_data = analysis['performance']
                if 'avg_delivery_time' in perf_data:
                    insights.append(f"Average delivery time: {perf_data['avg_delivery_time']:.2f} units")
                
                if 'status_distribution' in perf_data:
                    insights.append(f"Order status distribution: {perf_data['status_distribution']}")
            
            if 'cost' in analysis:
                cost_data = analysis['cost']
                for key, value in cost_data.items():
                    if isinstance(value, (int, float)):
                        insights.append(f"{key}: {value:.2f}")
            
            if 'quality' in analysis:
                quality_data = analysis['quality']
                if 'avg_rating' in quality_data:
                    insights.append(f"Average rating: {quality_data['avg_rating']:.2f}")
            
            # General insights
            total_records = sum(len(df) for df in data.values() if not df.empty)
            insights.append(f"Analyzed {total_records} total records across {len(data)} data sources")
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            insights.append("Analysis completed with basic insights")
        
        return insights

    def _summarize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize the relevant data"""
        summary = {}
        
        for data_type, df in data.items():
            if df.empty:
                summary[data_type] = {"count": 0, "status": "empty"}
            else:
                summary[data_type] = {
                    "count": len(df),
                    "columns": len(df.columns),
                    "status": "loaded"
                }
        
        return summary

    def _generate_insights(self, query: str, data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive insights"""
        insights = {
            "query_understanding": f"Query analyzed using {self.text_analyzer_name}",
            "data_coverage": f"Analyzed {len(data)} data sources",
            "key_findings": analysis.get("insights", []),
            "recommendations": self._generate_recommendations(query, analysis),
            "confidence_score": 0.7  # Default confidence for offline analysis
        }
        
        return insights

    def _generate_recommendations(self, query: str, analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Basic recommendations based on query content
        if 'performance' in query.lower():
            recommendations.append("Consider optimizing delivery routes to improve performance")
            recommendations.append("Monitor key performance indicators regularly")
        
        if 'cost' in query.lower():
            recommendations.append("Review cost structures and identify optimization opportunities")
            recommendations.append("Implement cost tracking and monitoring systems")
        
        if 'quality' in query.lower():
            recommendations.append("Implement quality control measures")
            recommendations.append("Monitor customer feedback and satisfaction metrics")
        
        # Default recommendations
        if not recommendations:
            recommendations.append("Continue monitoring key metrics")
            recommendations.append("Regular data analysis recommended")
        
        return recommendations

    def _get_fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Fallback analysis when main analysis fails"""
        return {
            "query_id": f"fallback_{int(datetime.now().timestamp())}",
            "original_query": query,
            "processed_query": query.lower().strip(),
            "intent": "general",
            "entities": {"keywords": [], "locations": [], "time_periods": [], "metrics": []},
            "relevant_data_summary": {},
            "analysis": {
                "intent_analysis": "general",
                "data_analysis": {},
                "patterns": [],
                "insights": ["Fallback analysis completed"]
            },
            "insights": {
                "query_understanding": "Basic query processing",
                "data_coverage": "Limited data access",
                "key_findings": ["Analysis completed in fallback mode"],
                "recommendations": ["System maintenance recommended"],
                "confidence_score": 0.3
            },
            "processing_time_ms": 50,
            "model_info": {
                "text_analyzer": "fallback",
                "analysis_method": "basic_fallback",
                "timestamp": datetime.now().isoformat()
            }
        }

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "model_name": self.text_analyzer_name,
            "model_type": "NLTK + TextBlob",
            "capabilities": [
                "text_preprocessing",
                "entity_extraction",
                "sentiment_analysis",
                "pattern_detection",
                "clustering_analysis",
                "offline_operation"
            ],
            "status": "operational",
            "offline_mode": True,
            "last_updated": datetime.now().isoformat()
        }

    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            # Check if models are loaded
            model_status = "healthy" if self.text_analyzer else "degraded"
            
            # Check data availability
            data_status = "available" if self.sample_data else "unavailable"
            
            return {
                "status": "healthy" if model_status == "healthy" and data_status == "available" else "degraded",
                "model_status": model_status,
                "data_status": data_status,
                "text_analyzer": self.text_analyzer_name,
                "sample_data_sources": len(self.sample_data),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
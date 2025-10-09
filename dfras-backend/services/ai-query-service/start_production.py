#!/usr/bin/env python3
"""
Production startup script for AI Query Service
Handles SSL configuration, environment setup, and graceful startup
"""

import os
import sys
import ssl
import logging
from typing import Optional
import asyncio
from pathlib import Path

# Create directories first
directories = ['/app/logs', '/app/data', '/app/models']
for directory in directories:
    Path(directory).mkdir(parents=True, exist_ok=True)

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/app/logs/ai-query-service.log', mode='a')
    ]
)

logger = logging.getLogger(__name__)

def setup_ssl_environment():
    """Configure SSL environment for production"""
    try:
        # Set SSL verification to False for production environments
        os.environ['SSL_VERIFY'] = 'false'
        os.environ['PYTHONHTTPSVERIFY'] = '0'
        
        # Configure certificate paths
        cert_path = '/etc/ssl/certs/ca-certificates.crt'
        if os.path.exists(cert_path):
            os.environ['CURL_CA_BUNDLE'] = cert_path
            os.environ['REQUESTS_CA_BUNDLE'] = cert_path
        
        # Disable SSL warnings
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        logger.info("SSL environment configured for production")
        
    except Exception as e:
        logger.warning(f"SSL configuration warning: {e}")

def setup_environment():
    """Setup production environment variables"""
    # Load .env if available
    try:
        from dotenv import load_dotenv
        # Try multiple common locations inside the container
        loaded_any = False
        for env_path in [Path('/app/.env'), Path('/app/config/.env')]:
            if env_path.exists():
                load_dotenv(dotenv_path=env_path, override=False)
                logger.info(f"Loaded environment variables from {env_path}")
                loaded_any = True
        if not loaded_any:
            # Fallback to default search in CWD
            load_dotenv()
            logger.info("Loaded environment variables from default .env search (if present)")
    except Exception as e:
        logger.info(f"dotenv not used or failed to load: {e}")
    # Set production environment variables
    os.environ.setdefault('PYTHONUNBUFFERED', '1')
    os.environ.setdefault('PYTHONDONTWRITEBYTECODE', '1')
    
    # Database configuration
    os.environ.setdefault('DATABASE_URL', 'postgresql://dfras_user:dfras_password@localhost:5432/dfras_db')
    
    # Service URLs
    os.environ.setdefault('DATA_SERVICE_URL', 'http://localhost:8001')
    os.environ.setdefault('ANALYTICS_SERVICE_URL', 'http://localhost:8002')
    os.environ.setdefault('CORRELATION_SERVICE_URL', 'http://localhost:8003')
    os.environ.setdefault('ML_SERVICE_URL', 'http://localhost:8004')
    os.environ.setdefault('INTELLIGENCE_SERVICE_URL', 'http://localhost:8008')
    os.environ.setdefault('DEEP_LEARNING_SERVICE_URL', 'http://localhost:8009')
    
    # AI Configuration
    os.environ.setdefault('AI_SIMILARITY_THRESHOLD', '0.7')
    os.environ.setdefault('AI_KMEANS_CLUSTERS', '5')
    os.environ.setdefault('BUSINESS_INR_RATE', '83.0')

    # Gemini Configuration (optional)
    # Expect GEMINI_API_KEY and optional GEMINI_MODEL (e.g., gemini-1.5-flash)
    if os.getenv('GEMINI_API_KEY'):
        logger.info("Gemini API key detected in environment")
    else:
        logger.info("Gemini API key not set; service will use offline LLM fallback")
    
    logger.info("Production environment variables configured")

def create_directories():
    """Create necessary directories"""
    directories = ['/app/logs', '/app/data', '/app/models']
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    logger.info("Production directories created")

def check_dependencies():
    """Check if all required dependencies are available"""
    try:
        import fastapi
        import uvicorn
        import pandas
        import numpy
        import sklearn
        import sqlalchemy
        import httpx
        import certifi
        import nltk
        import textblob
        # Optional dependencies
        try:
            import google.generativeai  # noqa: F401
        except Exception:
            logger.info("google-generativeai not available; Gemini will be disabled")
        try:
            import dotenv  # noqa: F401
        except Exception:
            logger.info("python-dotenv not available; skipping .env support")
        logger.info("All dependencies available")
        return True
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        return False

def main():
    """Main production startup function"""
    logger.info("Starting AI Query Service in production mode...")
    
    # Setup production environment
    setup_environment()
    setup_ssl_environment()
    create_directories()
    
    # Check dependencies
    if not check_dependencies():
        logger.error("Dependency check failed. Exiting.")
        sys.exit(1)
    
    # Import and start the application
    try:
        from main import app
        import uvicorn
        
        logger.info("Starting uvicorn server...")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8010,
            workers=1,
            log_level="info",
            access_log=True,
            loop="asyncio"
        )
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

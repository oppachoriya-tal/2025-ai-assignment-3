"""
DFRAS API Gateway Service
Handles authentication, routing, and request forwarding
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
from typing import Optional
import logging
import jwt
from datetime import datetime, timedelta
import secrets
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CORSHeadersMiddleware(BaseHTTPMiddleware):
    """Custom middleware to add additional CORS and security headers"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add additional CORS headers
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent, Cache-Control, Pragma, X-CSRFToken, X-Request-ID, X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host, X-Real-IP"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Type, Authorization, X-Request-ID, X-Total-Count, X-Page-Count"
        response.headers["Access-Control-Max-Age"] = "3600"
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Add cache control headers
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return response

app = FastAPI(
    title="DFRAS API Gateway",
    description="Delivery Failure Root Cause Analysis System - API Gateway",
    version="1.0.0"
)

# CORS middleware with COMPLETE DISABLE - ALLOW ALL ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # COMPLETE CORS DISABLE - ALLOW ALL ORIGINS
    allow_credentials=True,
    allow_methods=["*"],  # ALLOW ALL METHODS
    allow_headers=["*"],  # ALLOW ALL HEADERS
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

# Add custom CORS headers middleware
app.add_middleware(CORSHeadersMiddleware)

# Security
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Service URLs
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data-service:8001")
ANALYTICS_SERVICE_URL = os.getenv("ANALYTICS_SERVICE_URL", "http://analytics-service:8002")
DATA_INGESTION_SERVICE_URL = os.getenv("DATA_INGESTION_SERVICE_URL", "http://data-ingestion-service:8006")
ENHANCED_ANALYTICS_SERVICE_URL = os.getenv("ENHANCED_ANALYTICS_SERVICE_URL", "http://enhanced-analytics-service:8007")
AI_QUERY_SERVICE_URL = os.getenv("AI_QUERY_SERVICE_URL", "http://ai-query-service:8010")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://admin-service:8008")

# Mock user database (in production, use proper database)
USERS = {
    "admin": {"password": "admin123", "role": "admin", "permissions": ["*"]},
    "operations_manager": {"password": "ops123", "role": "operations_manager", "permissions": ["orders", "analytics"]},
    "fleet_manager": {"password": "fleet123", "role": "fleet_manager", "permissions": ["fleet", "analytics"]},
    "warehouse_manager": {"password": "warehouse123", "role": "warehouse_manager", "permissions": ["warehouse", "analytics"]},
    "data_analyst": {"password": "analyst123", "role": "data_analyst", "permissions": ["analytics"]},
    "customer_service": {"password": "cs123", "role": "customer_service", "permissions": ["orders", "feedback"]}
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in USERS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username, "role": USERS[username]["role"], "permissions": USERS[username]["permissions"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.exceptions.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api-gateway"}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/auth/login")
async def login(login_data: LoginRequest):
    """User login endpoint"""
    username = login_data.username
    password = login_data.password
    
    if username in USERS and USERS[username]["password"] == password:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": username,
                "role": USERS[username]["role"],
                "permissions": USERS[username]["permissions"]
            }
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

@app.get("/auth/me")
async def get_current_user(user: dict = Depends(verify_token)):
    """Get current user info"""
    return user

@app.get("/api/data/{path:path}")
async def proxy_data_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to data service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{DATA_SERVICE_URL}/api/data/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Data service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Data service unavailable")

@app.post("/api/data/{path:path}")
async def proxy_data_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to data service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{DATA_SERVICE_URL}/api/data/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Data service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Data service unavailable")

@app.get("/api/analytics/{path:path}")
async def proxy_analytics_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ANALYTICS_SERVICE_URL}/api/analytics/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Analytics service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Analytics service unavailable")

@app.post("/api/analytics/{path:path}")
async def proxy_analytics_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{ANALYTICS_SERVICE_URL}/api/analytics/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Analytics service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Analytics service unavailable")

@app.get("/api/data-ingestion/{path:path}")
async def proxy_data_ingestion_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to data ingestion service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{DATA_INGESTION_SERVICE_URL}/api/ingest/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Data ingestion service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Data ingestion service unavailable")

@app.post("/api/data-ingestion/sample-data")
async def proxy_sample_data_ingestion(user: dict = Depends(verify_token)):
    """Proxy sample data ingestion (no body required)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{DATA_INGESTION_SERVICE_URL}/api/ingest/sample-data")
            return response.json()
    except Exception as e:
        logger.error(f"Sample data ingestion proxy error: {e}")
        raise HTTPException(status_code=500, detail="Data ingestion service unavailable")

@app.post("/api/data-ingestion/{path:path}")
async def proxy_data_ingestion_service_post(path: str, request: Request, user: dict = Depends(verify_token)):
    """Proxy POST requests to data ingestion service"""
    try:
        # Get the request body
        body = await request.body()
        headers = dict(request.headers)
        
        # Remove host header to avoid conflicts
        headers.pop('host', None)
        
        async with httpx.AsyncClient() as client:
            # For endpoints that don't need a body, send empty content
            if body:
                response = await client.post(
                    f"{DATA_INGESTION_SERVICE_URL}/api/ingest/{path}",
                    content=body,
                    headers=headers
                )
            else:
                response = await client.post(
                    f"{DATA_INGESTION_SERVICE_URL}/api/ingest/{path}",
                    headers=headers
                )
            return response.json()
    except Exception as e:
        logger.error(f"Data ingestion service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Data ingestion service unavailable")

@app.get("/api/enhanced-analytics/{path:path}")
async def proxy_enhanced_analytics_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to enhanced analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ENHANCED_ANALYTICS_SERVICE_URL}/api/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Enhanced analytics service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Enhanced analytics service unavailable")

@app.post("/api/enhanced-analytics/{path:path}")
async def proxy_enhanced_analytics_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to enhanced analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{ENHANCED_ANALYTICS_SERVICE_URL}/api/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Enhanced analytics service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Enhanced analytics service unavailable")


# Additional routes for patterns and causal analysis
@app.get("/api/patterns/{path:path}")
async def proxy_patterns_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to patterns service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{CORRELATION_SERVICE_URL}/patterns/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Patterns service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Patterns service unavailable")

@app.post("/api/patterns/{path:path}")
async def proxy_patterns_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to patterns service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{CORRELATION_SERVICE_URL}/patterns/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Patterns service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Patterns service unavailable")

@app.get("/api/causal/{path:path}")
async def proxy_causal_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to causal analysis service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{CORRELATION_SERVICE_URL}/causal/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Causal service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Causal service unavailable")

@app.post("/api/causal/{path:path}")
async def proxy_causal_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to causal analysis service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{CORRELATION_SERVICE_URL}/causal/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Causal service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Causal service unavailable")

# Additional routes for alerts and templates
@app.get("/api/alerts/{path:path}")
async def proxy_alerts_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to alerts service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NOTIFICATION_SERVICE_URL}/alerts/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Alerts service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Alerts service unavailable")

@app.post("/api/alerts/{path:path}")
async def proxy_alerts_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to alerts service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{NOTIFICATION_SERVICE_URL}/alerts/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Alerts service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Alerts service unavailable")

@app.put("/api/alerts/{path:path}")
async def proxy_alerts_service_put(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy PUT requests to alerts service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{NOTIFICATION_SERVICE_URL}/alerts/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Alerts service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Alerts service unavailable")

@app.delete("/api/alerts/{path:path}")
async def proxy_alerts_service_delete(path: str, user: dict = Depends(verify_token)):
    """Proxy DELETE requests to alerts service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(f"{NOTIFICATION_SERVICE_URL}/alerts/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Alerts service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Alerts service unavailable")

@app.get("/api/templates/{path:path}")
async def proxy_templates_service(path: str, user: dict = Depends(verify_token)):
    """Proxy requests to templates service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NOTIFICATION_SERVICE_URL}/templates/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Templates service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Templates service unavailable")

@app.post("/api/templates/{path:path}")
async def proxy_templates_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to templates service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{NOTIFICATION_SERVICE_URL}/templates/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Templates service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Templates service unavailable")

# AI Query Analysis Service Routes
@app.get("/api/ai/{path:path}")
async def proxy_ai_query_service(path: str, user: dict = Depends(verify_token)):
    """Proxy GET requests to AI query service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AI_QUERY_SERVICE_URL}/api/ai/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"AI query service proxy error: {e}")
        raise HTTPException(status_code=500, detail="AI query service unavailable")

@app.post("/api/ai/{path:path}")
async def proxy_ai_query_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to AI query service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{AI_QUERY_SERVICE_URL}/api/ai/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"AI query service proxy error: {e}")
        raise HTTPException(status_code=500, detail="AI query service unavailable")

# Admin Service Routes (Admin only)
@app.get("/api/admin/{path:path}")
async def proxy_admin_service(path: str, user: dict = Depends(verify_token)):
    """Proxy GET requests to admin service (admin role required)"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ADMIN_SERVICE_URL}/api/admin/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Admin service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Admin service unavailable")

@app.post("/api/admin/{path:path}")
async def proxy_admin_service_post(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy POST requests to admin service (admin role required)"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{ADMIN_SERVICE_URL}/api/admin/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Admin service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Admin service unavailable")

@app.put("/api/admin/{path:path}")
async def proxy_admin_service_put(path: str, request: dict, user: dict = Depends(verify_token)):
    """Proxy PUT requests to admin service (admin role required)"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{ADMIN_SERVICE_URL}/api/admin/{path}", json=request)
            return response.json()
    except Exception as e:
        logger.error(f"Admin service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Admin service unavailable")

@app.delete("/api/admin/{path:path}")
async def proxy_admin_service_delete(path: str, user: dict = Depends(verify_token)):
    """Proxy DELETE requests to admin service (admin role required)"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(f"{ADMIN_SERVICE_URL}/api/admin/{path}")
            return response.json()
    except Exception as e:
        logger.error(f"Admin service proxy error: {e}")
        raise HTTPException(status_code=500, detail="Admin service unavailable")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

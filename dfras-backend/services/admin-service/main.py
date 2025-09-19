"""
Admin Service - User Management and System Configuration
Provides CRUD operations for admin users to manage users and system settings
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import secrets
import logging
import os
from passlib.context import CryptContext

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dfras_user:dfras_password@postgres:5432/dfras_db")

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str
    full_name: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

class SystemConfigCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    category: str = "general"
    is_encrypted: bool = False

class SystemConfigUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_encrypted: Optional[bool] = None

class SystemConfigResponse(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str]
    category: str
    is_encrypted: bool
    created_at: datetime
    updated_at: datetime

# Database models
class User(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)

class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String(50), default="general")
    is_encrypted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Simple admin authentication (in production, use proper JWT validation)
def verify_admin_token():
    # This is a simplified version - in production, validate JWT token
    # and check if user has admin role
    return {"user_id": 1, "role": "admin"}

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def encrypt_value(value: str) -> str:
    """Simple encryption for sensitive config values"""
    return hashlib.sha256(value.encode()).hexdigest()

def decrypt_value(encrypted_value: str) -> str:
    """Simple decryption - in production, use proper encryption"""
    return encrypted_value  # Simplified for demo

# FastAPI app
app = FastAPI(
    title="Admin Service",
    description="User Management and System Configuration Service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "admin-service"}

# User Management Endpoints
@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Get all users with optional filtering"""
    try:
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        users = query.offset(skip).limit(limit).all()
        
        return [
            UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                full_name=user.full_name,
                is_active=user.is_active,
                created_at=user.created_at,
                last_login=user.last_login
            )
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@app.get("/api/admin/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Get a specific user by ID"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user")

@app.post("/api/admin/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Create a new user"""
    try:
        # Check if username or email already exists
        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username or email already exists"
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role,
            full_name=user_data.full_name,
            is_active=user_data.is_active
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Created new user: {new_user.username} with role: {new_user.role}")
        
        return UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            role=new_user.role,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            last_login=new_user.last_login
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Update an existing user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields if provided
        if user_data.username is not None:
            # Check if new username already exists
            existing_user = db.query(User).filter(
                User.username == user_data.username,
                User.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already exists")
            user.username = user_data.username
        
        if user_data.email is not None:
            # Check if new email already exists
            existing_user = db.query(User).filter(
                User.email == user_data.email,
                User.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already exists")
            user.email = user_data.email
        
        if user_data.password is not None:
            user.password_hash = hash_password(user_data.password)
        
        if user_data.role is not None:
            user.role = user_data.role
        
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Updated user: {user.username}")
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user")

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Delete a user (soft delete by setting is_active to False)"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Soft delete - set is_active to False
        user.is_active = False
        db.commit()
        
        logger.info(f"Deactivated user: {user.username}")
        
        return {"message": "User deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")

# System Configuration Endpoints
@app.get("/api/admin/config", response_model=List[SystemConfigResponse])
async def get_system_configs(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Get all system configurations with optional filtering"""
    try:
        query = db.query(SystemConfig)
        
        if category:
            query = query.filter(SystemConfig.category == category)
        
        configs = query.offset(skip).limit(limit).all()
        
        return [
            SystemConfigResponse(
                id=config.id,
                key=config.key,
                value=config.value if not config.is_encrypted else "***ENCRYPTED***",
                description=config.description,
                category=config.category,
                is_encrypted=config.is_encrypted,
                created_at=config.created_at,
                updated_at=config.updated_at
            )
            for config in configs
        ]
    except Exception as e:
        logger.error(f"Error fetching system configs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch system configurations")

@app.get("/api/admin/config/{config_key}", response_model=SystemConfigResponse)
async def get_system_config(
    config_key: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Get a specific system configuration by key"""
    try:
        config = db.query(SystemConfig).filter(SystemConfig.key == config_key).first()
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        return SystemConfigResponse(
            id=config.id,
            key=config.key,
            value=config.value if not config.is_encrypted else "***ENCRYPTED***",
            description=config.description,
            category=config.category,
            is_encrypted=config.is_encrypted,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching config {config_key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch configuration")

@app.post("/api/admin/config", response_model=SystemConfigResponse)
async def create_system_config(
    config_data: SystemConfigCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Create a new system configuration"""
    try:
        # Check if key already exists
        existing_config = db.query(SystemConfig).filter(
            SystemConfig.key == config_data.key
        ).first()
        
        if existing_config:
            raise HTTPException(
                status_code=400,
                detail="Configuration key already exists"
            )
        
        # Encrypt value if needed
        value = config_data.value
        if config_data.is_encrypted:
            value = encrypt_value(config_data.value)
        
        # Create new configuration
        new_config = SystemConfig(
            key=config_data.key,
            value=value,
            description=config_data.description,
            category=config_data.category,
            is_encrypted=config_data.is_encrypted
        )
        
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        
        logger.info(f"Created new system config: {new_config.key}")
        
        return SystemConfigResponse(
            id=new_config.id,
            key=new_config.key,
            value=new_config.value if not new_config.is_encrypted else "***ENCRYPTED***",
            description=new_config.description,
            category=new_config.category,
            is_encrypted=new_config.is_encrypted,
            created_at=new_config.created_at,
            updated_at=new_config.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating system config: {e}")
        raise HTTPException(status_code=500, detail="Failed to create configuration")

@app.put("/api/admin/config/{config_key}", response_model=SystemConfigResponse)
async def update_system_config(
    config_key: str,
    config_data: SystemConfigUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Update an existing system configuration"""
    try:
        config = db.query(SystemConfig).filter(SystemConfig.key == config_key).first()
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # Update fields if provided
        if config_data.value is not None:
            if config.is_encrypted:
                config.value = encrypt_value(config_data.value)
            else:
                config.value = config_data.value
        
        if config_data.description is not None:
            config.description = config_data.description
        
        if config_data.category is not None:
            config.category = config_data.category
        
        if config_data.is_encrypted is not None:
            config.is_encrypted = config_data.is_encrypted
        
        config.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(config)
        
        logger.info(f"Updated system config: {config.key}")
        
        return SystemConfigResponse(
            id=config.id,
            key=config.key,
            value=config.value if not config.is_encrypted else "***ENCRYPTED***",
            description=config.description,
            category=config.category,
            is_encrypted=config.is_encrypted,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating config {config_key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update configuration")

@app.delete("/api/admin/config/{config_key}")
async def delete_system_config(
    config_key: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    """Delete a system configuration"""
    try:
        config = db.query(SystemConfig).filter(SystemConfig.key == config_key).first()
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        db.delete(config)
        db.commit()
        
        logger.info(f"Deleted system config: {config_key}")
        
        return {"message": "Configuration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting config {config_key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete configuration")

# Initialize default admin user and configurations
@app.on_event("startup")
async def startup_event():
    """Initialize default admin user and system configurations"""
    try:
        db = SessionLocal()
        
        # Create default admin user if not exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@dfras.com",
                password_hash=hash_password("admin123"),
                role="admin",
                full_name="System Administrator",
                is_active=True
            )
            db.add(admin_user)
            logger.info("Created default admin user")
        
        # Create default system configurations if not exist
        default_configs = [
            {
                "key": "max_file_upload_size",
                "value": "10485760",  # 10MB
                "description": "Maximum file upload size in bytes",
                "category": "upload"
            },
            {
                "key": "session_timeout",
                "value": "3600",  # 1 hour
                "description": "Session timeout in seconds",
                "category": "security"
            },
            {
                "key": "max_login_attempts",
                "value": "5",
                "description": "Maximum login attempts before lockout",
                "category": "security"
            },
            {
                "key": "data_retention_days",
                "value": "365",
                "description": "Data retention period in days",
                "category": "data"
            },
            {
                "key": "api_rate_limit",
                "value": "1000",
                "description": "API rate limit per hour",
                "category": "api"
            }
        ]
        
        for config_data in default_configs:
            existing_config = db.query(SystemConfig).filter(
                SystemConfig.key == config_data["key"]
            ).first()
            
            if not existing_config:
                config = SystemConfig(
                    key=config_data["key"],
                    value=config_data["value"],
                    description=config_data["description"],
                    category=config_data["category"],
                    is_encrypted=False
                )
                db.add(config)
        
        db.commit()
        logger.info("Initialized default system configurations")
        
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)

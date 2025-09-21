from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    # App settings
    app_name: str = "AI Supply Chain API"
    debug: bool = True
    version: str = "1.0.0"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str = "sqlite:///./supply_chain.db"
    database_test_url: str = "sqlite:///./supply_chain_test.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # External APIs
    gemini_api_key: str = ""
    
    # ML Models
    yolo_model_path: str = "models/best.pt"
    forecasting_model_path: str = "models/forecasting_model.pt"
    anomaly_model_path: str = "models/anomaly_model.joblib"
    
    # File upload settings
    max_upload_size: int = 10485760  # 10MB
    allowed_extensions: List[str] = [".csv", ".xlsx", ".xls"]
    
    # CORS settings
    cors_origins: Union[List[str], str] = "http://localhost:3000,http://localhost:5173"
    
    @field_validator('cors_origins')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
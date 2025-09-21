from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"

class AlertSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class AlertType(str, Enum):
    inventory_shortage = "inventory_shortage"
    demand_spike = "demand_spike"
    supply_delay = "supply_delay"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.manager
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# Product Schemas
class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Warehouse Schemas
class WarehouseBase(BaseModel):
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Inventory Schemas
class InventoryBase(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = 0
    reorder_point: int = 10
    max_stock: int = 1000

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    reorder_point: Optional[int] = None
    max_stock: Optional[int] = None

class InventoryResponse(InventoryBase):
    id: int
    last_updated: datetime
    product: ProductResponse
    warehouse: WarehouseResponse
    
    model_config = ConfigDict(from_attributes=True)

# Sales History Schemas
class SalesHistoryBase(BaseModel):
    product_id: int
    date: datetime
    quantity_sold: int
    revenue: Optional[float] = None

class SalesHistoryCreate(SalesHistoryBase):
    pass

class SalesHistoryResponse(SalesHistoryBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Demand Forecast Schemas
class DemandForecastBase(BaseModel):
    product_id: int
    forecast_date: datetime
    predicted_demand: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    model_version: Optional[str] = None

class ForecastRequest(BaseModel):
    product_id: int
    historical_data: List[Dict[str, Any]]
    forecast_horizon: int = 30
    include_confidence_intervals: bool = True

class DemandForecastResponse(DemandForecastBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Anomaly Alert Schemas
class AnomalyAlertBase(BaseModel):
    type: AlertType
    severity: AlertSeverity = AlertSeverity.medium
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AnomalyAlertCreate(AnomalyAlertBase):
    pass

class AnomalyAlertResponse(AnomalyAlertBase):
    id: int
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    is_resolved: bool = False
    
    model_config = ConfigDict(from_attributes=True)

# Data Upload Schemas
class DataUploadResponse(BaseModel):
    filename: str
    rows_processed: int
    errors: List[str] = []
    success: bool
    message: str

# Chat Schemas
class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# Pagination
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)

# API Response wrapper
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
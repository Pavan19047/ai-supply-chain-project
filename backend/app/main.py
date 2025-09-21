import os
import io
import cv2
import numpy as np
import pandas as pd
import google.generativeai as genai
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Body, Depends, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from ultralytics import YOLO

# Import our modules
from .config import settings
from .database import get_db, engine, Base
from .models import User, Product, Inventory, Warehouse, SalesHistory, DemandForecast, AnomalyAlert
from .schemas import (
    UserCreate, UserResponse, Token, ProductCreate, ProductUpdate, ProductResponse,
    InventoryCreate, InventoryUpdate, InventoryResponse, WarehouseCreate, WarehouseResponse,
    SalesHistoryCreate, DemandForecastResponse, AnomalyAlertResponse, ChatRequest,
    APIResponse, PaginationParams, ForecastRequest
)
from .services.auth import authenticate_user, create_user, create_access_token, get_user_by_email
from .api.deps import get_current_user, require_admin, require_manager_or_admin

# Create database tables
Base.metadata.create_all(bind=engine)

# --- App Initialization ---
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI-powered Supply Chain Management System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
model_path = os.path.join(os.path.dirname(__file__), f'../{settings.yolo_model_path}')
try:
    detection_model = YOLO(model_path)
    print("✅ Custom YOLOv8 model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading YOLOv8 model: {e}")
    detection_model = None

# --- Authentication Endpoints ---
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = create_user(db, user_data)
    return user

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": user
    }

@app.get("/auth/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

# --- Product Management Endpoints ---
@app.get("/products", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """List products with filtering and pagination."""
    query = db.query(Product)
    
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        query = query.filter(Product.name.contains(search))
    
    products = query.offset(skip).limit(limit).all()
    return products

@app.post("/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create a new product."""
    # Check if SKU already exists
    existing_product = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )
    
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

# --- Inventory Management Endpoints ---
@app.get("/inventory", response_model=List[InventoryResponse])
async def list_inventory(
    skip: int = 0,
    limit: int = 100,
    warehouse_id: Optional[int] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """List inventory with filtering."""
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    if low_stock:
        query = query.filter(Inventory.quantity <= Inventory.reorder_point)
    
    inventory = query.offset(skip).limit(limit).all()
    return inventory

@app.post("/inventory", response_model=InventoryResponse)
async def create_inventory(
    inventory_data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Add inventory item."""
    inventory = Inventory(**inventory_data.dict())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    return inventory

@app.put("/inventory/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update inventory."""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = inventory_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inventory, field, value)
    
    db.commit()
    db.refresh(inventory)
    return inventory

# --- Warehouse Management ---
@app.get("/warehouses", response_model=List[WarehouseResponse])
async def list_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """List all warehouses."""
    warehouses = db.query(Warehouse).all()
    return warehouses

@app.post("/warehouses", response_model=WarehouseResponse)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new warehouse."""
    warehouse = Warehouse(**warehouse_data.dict())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse

# --- Data Upload Endpoints ---
@app.post("/data/upload")
async def upload_data(
    file: UploadFile = File(...),
    data_type: str = Form(...),  # 'inventory', 'sales', 'products'
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Upload CSV/Excel data."""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        rows_processed = 0
        errors = []
        
        if data_type == "products":
            for _, row in df.iterrows():
                try:
                    product = Product(
                        sku=row.get('sku'),
                        name=row.get('name'),
                        description=row.get('description'),
                        category=row.get('category'),
                        unit_price=row.get('unit_price')
                    )
                    db.add(product)
                    rows_processed += 1
                except Exception as e:
                    errors.append(f"Row {rows_processed + 1}: {str(e)}")
        
        elif data_type == "sales":
            for _, row in df.iterrows():
                try:
                    sales = SalesHistory(
                        product_id=int(row.get('product_id')),
                        date=pd.to_datetime(row.get('date')),
                        quantity_sold=int(row.get('quantity_sold')),
                        revenue=float(row.get('revenue', 0))
                    )
                    db.add(sales)
                    rows_processed += 1
                except Exception as e:
                    errors.append(f"Row {rows_processed + 1}: {str(e)}")
        
        db.commit()
        
        return {
            "filename": file.filename,
            "rows_processed": rows_processed,
            "errors": errors,
            "success": True,
            "message": f"Successfully processed {rows_processed} rows"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

# --- Forecasting Endpoints ---
@app.post("/forecasting/demand", response_model=List[DemandForecastResponse])
async def generate_forecast(
    request: ForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Generate demand forecast for a product."""
    # This is a simplified mock implementation
    # In production, this would call your ML model
    forecasts = []
    
    for i in range(request.forecast_horizon):
        forecast_date = datetime.now() + timedelta(days=i+1)
        # Mock prediction (replace with actual ML model)
        predicted_demand = np.random.normal(100, 20)
        
        forecast = DemandForecast(
            product_id=request.product_id,
            forecast_date=forecast_date,
            predicted_demand=max(0, predicted_demand),
            confidence_lower=max(0, predicted_demand - 10),
            confidence_upper=predicted_demand + 10,
            model_version="v1.0"
        )
        db.add(forecast)
        forecasts.append(forecast)
    
    db.commit()
    return forecasts

# --- Anomaly Detection ---
@app.get("/anomalies", response_model=List[AnomalyAlertResponse])
async def list_anomalies(
    unresolved_only: bool = False,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """List anomaly alerts."""
    query = db.query(AnomalyAlert)
    
    if unresolved_only:
        query = query.filter(AnomalyAlert.is_resolved == False)
    
    if severity:
        query = query.filter(AnomalyAlert.severity == severity)
    
    alerts = query.order_by(AnomalyAlert.detected_at.desc()).all()
    return alerts

@app.post("/anomalies/{alert_id}/resolve")
async def resolve_anomaly(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Mark anomaly as resolved."""
    alert = db.query(AnomalyAlert).filter(AnomalyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.id
    
    db.commit()
    return {"message": "Alert resolved successfully"}

# --- Original Endpoints (maintained for compatibility) ---
@app.get("/")
def root():
    return {"message": "Welcome to the AI Supply Chain Management API", "version": settings.version}

@app.post("/chat")
async def stream_chat(request: ChatRequest, authorization: str = Header(None)):
    """Chat with AI assistant."""
    if not authorization or not authorization.startswith("Bearer "):
        if not settings.gemini_api_key:
            raise HTTPException(status_code=401, detail="Missing Gemini API key in configuration")
        api_key = settings.gemini_api_key
    else:
        api_key = authorization.split("Bearer ")[1]
    
    prompt = request.prompt
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        async def event_stream():
            stream = await model.generate_content_async(prompt, stream=True)
            async for chunk in stream:
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
        
        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the Gemini API: {e}")

@app.post("/detect")
async def detect_and_count(file: UploadFile = File(...)):
    """Object detection and counting (original functionality)."""
    if not detection_model:
        raise HTTPException(status_code=503, detail="Object detection model is not available.")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = detection_model(img)
    result = results[0]
    count = len(result.boxes)
    
    # Draw results on the image
    annotated_img = result.plot()
    text = f"Object Count: {count}"
    
    cv2.putText(annotated_img, text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 4, cv2.LINE_AA)
    cv2.putText(annotated_img, text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 200, 0), 2, cv2.LINE_AA)

    _, encoded_img = cv2.imencode('.jpg', annotated_img)
    return StreamingResponse(
        io.BytesIO(encoded_img.tobytes()), 
        media_type="image/jpeg", 
        headers={'X-Object-Count': str(count)}
    )

# AI Supply Chain MVP - System Architecture

## Overview
Comprehensive AI-powered supply chain management system with forecasting, anomaly detection, and optimization capabilities.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for modern, responsive UI
- **Chart.js/Recharts** for data visualizations
- **React Query** for API state management
- **React Hook Form** for form handling

### Backend
- **FastAPI** (Python) for high-performance API
- **PostgreSQL** as primary database
- **Redis** for caching and session management
- **SQLAlchemy** with Alembic for ORM and migrations
- **JWT** for authentication
- **Celery** for background tasks

### ML Pipeline
- **PyTorch** for deep learning models
- **Temporal Fusion Transformer (TFT)** for demand forecasting
- **LSTM/GRU** baseline models
- **Isolation Forest** for anomaly detection
- **scikit-learn** for preprocessing and baseline models
- **SHAP** for explainability

### Infrastructure
- **Docker & Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **PostgreSQL** + **Redis** containers
- **Nginx** reverse proxy (production)

## Database Schema

### Users & Authentication
```sql
users (id, email, password_hash, role, created_at, is_active)
user_sessions (id, user_id, token, expires_at)
```

### Inventory Management
```sql
products (id, sku, name, description, category, unit_price, created_at)
inventory (id, product_id, warehouse_id, quantity, reorder_point, max_stock)
warehouses (id, name, location, capacity)
```

### Orders & Transactions
```sql
orders (id, customer_id, status, order_date, expected_delivery, total_amount)
order_items (id, order_id, product_id, quantity, unit_price)
suppliers (id, name, contact_info, lead_time_days)
purchase_orders (id, supplier_id, status, order_date, expected_delivery)
```

### Forecasting & Analytics
```sql
sales_history (id, product_id, date, quantity_sold, revenue)
demand_forecasts (id, product_id, forecast_date, predicted_demand, confidence_interval)
anomaly_alerts (id, type, severity, description, detected_at, resolved_at)
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Inventory Management
- `GET /inventory` - List inventory with filters
- `POST /inventory` - Add inventory item
- `PUT /inventory/{id}` - Update inventory
- `DELETE /inventory/{id}` - Delete inventory
- `GET /inventory/low-stock` - Get low stock alerts

### Data Ingestion
- `POST /data/upload` - Upload CSV/Excel files
- `GET /data/sources` - List connected data sources
- `POST /data/schedule` - Schedule automatic imports

### Forecasting
- `POST /forecasting/demand` - Generate demand forecast
- `GET /forecasting/history` - Get forecast history
- `POST /forecasting/upload` - Upload historical data for forecasting

### Anomaly Detection
- `GET /anomalies` - List detected anomalies
- `POST /anomalies/resolve` - Mark anomaly as resolved
- `GET /anomalies/settings` - Get detection thresholds

### Reporting & Export
- `GET /reports/inventory` - Inventory reports
- `GET /reports/forecasts` - Forecast accuracy reports
- `POST /export/csv` - Export data as CSV
- `POST /export/pdf` - Export reports as PDF

## ML Model Architecture

### Demand Forecasting
1. **Temporal Fusion Transformer (TFT)**
   - Input: Historical sales, seasonality, external features
   - Output: Point forecasts + prediction intervals
   - Features: Attention mechanisms, interpretability

2. **LSTM Baseline**
   - Simpler alternative for comparison
   - Faster training and inference

### Anomaly Detection
1. **Isolation Forest**
   - Unsupervised anomaly detection
   - Features: Inventory levels, demand patterns, lead times

2. **Autoencoder (Optional)**
   - Deep learning approach for complex patterns

### Feature Engineering
- Time-based features (day of week, month, seasonality)
- Lag features (previous sales periods)
- External features (holidays, weather, economic indicators)
- Categorical encodings (product categories, suppliers)

## User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Supply Chain Manager
- Inventory management
- Order processing
- Forecasting access
- Report generation
- Limited user management

## Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration

## Deployment Strategy

### Development
```bash
docker-compose up
```

### Production
- Multi-stage Docker builds
- Environment-specific configurations
- Health checks and monitoring
- Automated backups
- SSL/TLS certificates

## Sample Datasets

### Retail Sales Data
- **Source**: Kaggle Store Sales forecasting datasets
- **Features**: Product sales, seasonality, promotions
- **Size**: 500K+ records

### Supply Chain Data
- **Source**: UCI Supply Chain datasets
- **Features**: Lead times, supplier performance, transit data
- **Size**: 100K+ records

### External Features
- **Source**: Economic indicators, weather APIs
- **Features**: GDP, inflation, weather patterns
- **Integration**: Scheduled API calls

## Monitoring & Maintenance

### Model Monitoring
- Prediction accuracy tracking
- Data drift detection
- Performance metrics logging
- Automated retraining triggers

### System Monitoring
- API response times
- Database performance
- Resource utilization
- Error tracking

## Development Timeline

### Week 1: Foundation
- Database setup and migrations
- Authentication system
- Basic inventory CRUD
- Docker containerization

### Week 2: Core Features
- Data ingestion pipeline
- Basic forecasting model
- Frontend authentication
- Inventory management UI

### Week 3: Advanced ML
- TFT model implementation
- Anomaly detection
- Model training pipeline
- Visualization dashboard

### Week 4: Polish & Deploy
- Export functionality
- CI/CD pipeline
- Documentation
- Production deployment
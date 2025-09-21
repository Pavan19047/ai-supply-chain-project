# 🚀 AI Supply Chain Project - Complete Startup Guide

This guide provides step-by-step instructions to get your AI Supply Chain application running locally or in production.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Python 3.8+** (Recommended: Python 3.11)
- **Node.js 18+** and npm
- **Git** for version control
- **Docker & Docker Compose** (for containerized deployment)

### Optional (for enhanced functionality)
- **PostgreSQL 15+** (if running without Docker)
- **Redis 7+** (if running without Docker)

## 🎯 Quick Start Options

Choose one of the following startup methods:

### Option 1: 🐳 Docker Compose (Recommended)
**Best for**: Complete production-like environment with all services

### Option 2: 🔧 Development Mode
**Best for**: Active development and debugging

### Option 3: ⚡ Simple Demo Mode
**Best for**: Quick testing with minimal setup

---

## 🐳 Option 1: Docker Compose Startup

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/Pavan19047/ai-supply-chain-project
cd ai-supply-chain-project

# Create environment file
cp .env.template .env
```

### Step 2: Configure Environment
Edit `.env` file with your settings:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password123@postgres:5432/supply_chain_db
REDIS_URL=redis://redis:6379

# Security (Change in production!)
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optional API Keys (for external data)
GEMINI_API_KEY=your-gemini-api-key
FRED_API_KEY=your-fred-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
```

### Step 3: Start All Services
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Step 4: Initialize Data
```bash
# Wait for services to be ready, then generate sample data
docker-compose exec backend python scripts/setup_data.py

# Or if running in background
python backend/scripts/setup_data.py
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (postgres/password123)
- **Redis**: localhost:6379

### Step 6: Create Admin User
```bash
# Access the backend container
docker-compose exec backend python -c "
from app.database import get_db
from app.services.auth import create_user
from app.schemas import UserCreate

db = next(get_db())
admin_user = UserCreate(
    email='admin@supply-chain.com',
    password='admin123',
    full_name='System Administrator',
    role='admin'
)
user = create_user(db, admin_user)
print(f'Admin user created: {user.email}')
"
```

---

## 🔧 Option 2: Development Mode

### Step 1: Environment Setup
```bash
# Clone the repository
git clone https://github.com/Pavan19047/ai-supply-chain-project
cd ai-supply-chain-project

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node.js dependencies
cd frontend
npm install
cd ..
```

### Step 3: Start Local Databases (Optional)
If you have PostgreSQL and Redis installed locally:
```bash
# Start PostgreSQL service
# Windows: net start postgresql
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql

# Start Redis service
# Windows: redis-server
# Linux: sudo systemctl start redis
# Mac: brew services start redis
```

Or use Docker for just the databases:
```bash
# Start only databases with Docker
docker-compose up postgres redis -d
```

### Step 4: Configure Environment
```bash
# Copy environment template
cp .env.template .env

# Edit .env with your local database URLs
# For local databases:
DATABASE_URL=postgresql://username:password@localhost:5432/supply_chain_db
REDIS_URL=redis://localhost:6379

# For Docker databases:
DATABASE_URL=postgresql://postgres:password123@localhost:5432/supply_chain_db
REDIS_URL=redis://localhost:6379
```

### Step 5: Initialize Database and Data
```bash
# Generate sample data
python backend/scripts/setup_data.py

# Initialize database tables (if using custom database)
cd backend
python -c "
from app.database import Base, engine
from app.models import *
Base.metadata.create_all(bind=engine)
print('Database tables created')
"
cd ..
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Celery Worker (Optional):**
```bash
cd backend
celery -A app.celery worker --loglevel=info
```

### Step 7: Access the Application
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## ⚡ Option 3: Simple Demo Mode

For a quick demo without databases:

### Step 1: Install Minimal Dependencies
```bash
git clone https://github.com/Pavan19047/ai-supply-chain-project
cd ai-supply-chain-project

# Install only essential packages
pip install fastapi uvicorn pandas numpy scikit-learn

cd frontend
npm install
cd ..
```

### Step 2: Generate Sample Data
```bash
python backend/scripts/setup_data.py
```

### Step 3: Start with SQLite (File Database)
```bash
# Modify backend/.env to use SQLite
echo "DATABASE_URL=sqlite:///./test.db" > backend/.env
echo "REDIS_URL=redis://localhost:6379" >> backend/.env

# Start backend
cd backend
uvicorn app.main:app --reload
```

### Step 4: Start Frontend
```bash
# New terminal
cd frontend
npm run dev
```

---

## 🔍 Verification & Testing

### Health Checks
```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000  # Docker
curl http://localhost:5173  # Development

# Check database connection
curl http://localhost:8000/api/v1/health/db
```

### Test the API
```bash
# Register a new user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different ports
uvicorn app.main:app --port 8001
npm run dev -- --port 5174
```

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**Module Import Error:**
```bash
# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall

# Check Python path
python -c "import sys; print('\n'.join(sys.path))"
```

**Frontend Build Error:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables
Ensure these are set in your `.env` file:
```env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/supply_chain_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📖 Usage Guide

### Default Login Credentials
After running the setup:
- **Email**: admin@supply-chain.com
- **Password**: admin123

### Key Features to Test
1. **Authentication**: Register/Login functionality
2. **Inventory Management**: View and manage inventory
3. **Demand Forecasting**: Upload data and get predictions
4. **Anomaly Detection**: Monitor supply chain anomalies
5. **Data Visualization**: Charts and dashboards

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation.

## 🔄 Development Workflow

### Making Changes
1. **Backend changes**: Server auto-reloads with `--reload` flag
2. **Frontend changes**: Hot reload automatically updates browser
3. **Database changes**: Restart Docker containers if needed

### Data Refresh
```bash
# Regenerate sample data
python backend/scripts/setup_data.py

# Reset database (Docker)
docker-compose down -v
docker-compose up --build
```

## 🌐 Production Deployment

### Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export DEBUG=False
export SECRET_KEY=your-production-secret-key
```

### Build for Production
```bash
# Build frontend
cd frontend
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build
```

### Security Checklist
- [ ] Change default passwords
- [ ] Set strong SECRET_KEY
- [ ] Configure HTTPS
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure backup strategy

---

## 📞 Support

If you encounter issues:

1. Check the [troubleshooting section](#🚨-troubleshooting)
2. Review logs: `docker-compose logs <service-name>`
3. Verify environment variables are set correctly
4. Ensure all ports are available

**Log Locations:**
- Backend logs: `docker-compose logs backend`
- Frontend logs: `docker-compose logs frontend`
- Database logs: `docker-compose logs postgres`

---

🎉 **Congratulations!** Your AI Supply Chain application should now be running successfully.

Visit the frontend URL to start exploring the features!
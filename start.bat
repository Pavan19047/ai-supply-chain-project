@echo off
REM Quick Start Script for AI Supply Chain Project (Windows)

echo 🚀 AI Supply Chain Project - Quick Start
echo ========================================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you're in the ai-supply-chain-project folder
    pause
    exit /b 1
)

REM Check prerequisites
echo 🔍 Checking prerequisites...

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    if exist ".env.template" (
        copy ".env.template" ".env" >nul
        echo ✅ .env file created from template
        echo 💡 You can edit .env to configure API keys and other settings
    ) else (
        echo ⚠️ .env.template not found, creating basic .env file...
        (
            echo # AI Supply Chain Project Environment Variables
            echo DATABASE_URL=postgresql://postgres:password123@postgres:5432/supply_chain_db
            echo REDIS_URL=redis://redis:6379
            echo SECRET_KEY=dev-secret-key-change-in-production-%RANDOM%
            echo ALGORITHM=HS256
            echo ACCESS_TOKEN_EXPIRE_MINUTES=30
            echo CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
            echo DEBUG=True
        ) > .env
        echo ✅ Basic .env file created
    )
) else (
    echo ✅ .env file already exists
)

REM Ask user which startup method they prefer
echo.
echo 🎯 Choose your startup method:
echo 1) 🐳 Docker Compose (Full stack - Recommended)
echo 2) 🔧 Development Mode (Manual setup)
echo 3) ⚡ Just generate sample data
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🐳 Starting with Docker Compose...
    echo This will:
    echo   - Start PostgreSQL database
    echo   - Start Redis cache
    echo   - Build and start backend API
    echo   - Build and start frontend
    echo   - Start Celery workers
    echo.
    set /p confirm="Continue? (y/N): "
    
    if /i "%confirm%"=="y" (
        echo 🔄 Building and starting all services...
        docker-compose up --build -d
        
        echo ⏳ Waiting for services to be ready...
        timeout /t 30 /nobreak >nul
        
        echo 📊 Generating sample data...
        docker-compose exec -T backend python scripts/setup_data.py
        
        echo.
        echo 🎉 SUCCESS! Your AI Supply Chain application is now running!
        echo.
        echo 📱 Access your application:
        echo    Frontend:  http://localhost:3000
        echo    Backend:   http://localhost:8000
        echo    API Docs:  http://localhost:8000/docs
        echo.
        echo 🔑 Default admin login:
        echo    Email:     admin@supply-chain.com
        echo    Password:  admin123
        echo.
        echo 📋 Useful commands:
        echo    View logs:     docker-compose logs -f
        echo    Stop services: docker-compose down
        echo    Restart:       docker-compose restart
    ) else (
        echo ❌ Startup cancelled
    )
) else if "%choice%"=="2" (
    echo.
    echo 🔧 Development Mode Setup...
    echo.
    
    REM Check Python
    where python >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Python is not installed. Please install Python 3.8+ first.
        echo    Visit: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    
    REM Check Node.js
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Node.js is not installed. Please install Node.js 18+ first.
        echo    Visit: https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo ✅ Python and Node.js are available
    
    echo 📦 Installing Python dependencies...
    python -m pip install -r backend/requirements.txt
    
    echo 📦 Installing Node.js dependencies...
    cd frontend && npm install && cd ..
    
    echo 📊 Generating sample data...
    python backend/scripts/setup_data.py
    
    echo.
    echo 🔄 To start the application, open 2 separate command prompts:
    echo.
    echo Command Prompt 1 (Backend):
    echo   cd backend
    echo   uvicorn app.main:app --reload
    echo.
    echo Command Prompt 2 (Frontend):
    echo   cd frontend
    echo   npm run dev
    echo.
    echo Then access:
    echo   Frontend: http://localhost:5173
    echo   Backend:  http://localhost:8000
    
) else if "%choice%"=="3" (
    echo.
    echo 📊 Generating sample data only...
    
    REM Check Python
    where python >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Python is not installed. Please install Python 3.8+ first.
        echo    Visit: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    
    echo 📦 Installing minimal dependencies...
    python -m pip install pandas numpy requests
    
    echo 📊 Generating sample data...
    python backend/scripts/setup_data.py
    
    echo.
    echo ✅ Sample data generated successfully!
    echo 📁 Data files are available in the ./data/ directory
    echo.
    echo To start the full application, run this script again and choose option 1 or 2.
    
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 📖 For detailed instructions, see: STARTUP_GUIDE.md
echo 🔧 For troubleshooting, check the logs or documentation
pause
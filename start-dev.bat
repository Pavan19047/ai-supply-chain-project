@echo off
echo 🚀 Starting AI Supply Chain App - Development Mode
echo ===================================================

echo 📝 Creating environment configuration...

REM Create a simple .env file for development mode
(
echo # Development Environment Configuration
echo DATABASE_URL=sqlite:///./supply_chain.db
echo SECRET_KEY=dev-secret-key-12345
echo ALGORITHM=HS256
echo ACCESS_TOKEN_EXPIRE_MINUTES=30
echo DEBUG=True
echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000
) > backend\.env

echo ✅ Environment configured for development mode

echo 📊 Ensuring sample data exists...
python backend\scripts\setup_data.py

echo 🔄 Starting backend server...
echo    Backend will be available at: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo ⚠️  Leave this window open - it's running the backend server
echo    Open a new command prompt to start the frontend
echo.
echo 🌐 To start the frontend, open another command prompt and run:
echo    cd "%cd%"
echo    cd frontend
echo    npm run dev
echo.

cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
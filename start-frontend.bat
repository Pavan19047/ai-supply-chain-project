@echo off
echo 🌐 Starting AI Supply Chain App - Frontend
echo ==========================================

echo 📂 Navigating to frontend directory...
cd frontend

echo 📦 Checking if dependencies are installed...
if not exist "node_modules" (
    echo 📥 Installing Node.js dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

echo 🚀 Starting development server...
echo    Frontend will be available at: http://localhost:5173
echo.
echo ⚠️  Make sure the backend is running in another window
echo    Backend should be at: http://localhost:8000
echo.

npm run dev
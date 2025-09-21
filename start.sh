#!/bin/bash
# Quick Start Script for AI Supply Chain Project

echo "🚀 AI Supply Chain Project - Quick Start"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you're in the ai-supply-chain-project folder"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ .env file created from template"
        echo "💡 You can edit .env to configure API keys and other settings"
    else
        echo "⚠️ .env.template not found, creating basic .env file..."
        cat > .env << EOF
# AI Supply Chain Project Environment Variables
DATABASE_URL=postgresql://postgres:password123@postgres:5432/supply_chain_db
REDIS_URL=redis://redis:6379
SECRET_KEY=dev-secret-key-change-in-production-$(date +%s)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
DEBUG=True
EOF
        echo "✅ Basic .env file created"
    fi
else
    echo "✅ .env file already exists"
fi

# Ask user which startup method they prefer
echo ""
echo "🎯 Choose your startup method:"
echo "1) 🐳 Docker Compose (Full stack - Recommended)"
echo "2) 🔧 Development Mode (Manual setup)"
echo "3) ⚡ Just generate sample data"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Starting with Docker Compose..."
        echo "This will:"
        echo "  - Start PostgreSQL database"
        echo "  - Start Redis cache"
        echo "  - Build and start backend API"
        echo "  - Build and start frontend"
        echo "  - Start Celery workers"
        echo ""
        read -p "Continue? (y/N): " confirm
        
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo "🔄 Building and starting all services..."
            docker-compose up --build -d
            
            echo "⏳ Waiting for services to be ready..."
            sleep 30
            
            echo "📊 Generating sample data..."
            docker-compose exec -T backend python scripts/setup_data.py
            
            echo ""
            echo "🎉 SUCCESS! Your AI Supply Chain application is now running!"
            echo ""
            echo "📱 Access your application:"
            echo "   Frontend:  http://localhost:3000"
            echo "   Backend:   http://localhost:8000"
            echo "   API Docs:  http://localhost:8000/docs"
            echo ""
            echo "🔑 Default admin login:"
            echo "   Email:     admin@supply-chain.com"
            echo "   Password:  admin123"
            echo ""
            echo "📋 Useful commands:"
            echo "   View logs:     docker-compose logs -f"
            echo "   Stop services: docker-compose down"
            echo "   Restart:       docker-compose restart"
        else
            echo "❌ Startup cancelled"
        fi
        ;;
        
    2)
        echo ""
        echo "🔧 Development Mode Setup..."
        echo ""
        
        # Check Python
        if ! command_exists python && ! command_exists python3; then
            echo "❌ Python is not installed. Please install Python 3.8+ first."
            exit 1
        fi
        
        # Use python3 if available, otherwise python
        PYTHON_CMD="python"
        if command_exists python3; then
            PYTHON_CMD="python3"
        fi
        
        # Check Node.js
        if ! command_exists node; then
            echo "❌ Node.js is not installed. Please install Node.js 18+ first."
            exit 1
        fi
        
        echo "✅ Python and Node.js are available"
        
        echo "📦 Installing Python dependencies..."
        $PYTHON_CMD -m pip install -r backend/requirements.txt
        
        echo "📦 Installing Node.js dependencies..."
        cd frontend && npm install && cd ..
        
        echo "📊 Generating sample data..."
        $PYTHON_CMD backend/scripts/setup_data.py
        
        echo ""
        echo "🔄 Starting development servers..."
        echo ""
        echo "To start the application:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend"
        echo "  uvicorn app.main:app --reload"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend"
        echo "  npm run dev"
        echo ""
        echo "Then access:"
        echo "  Frontend: http://localhost:5173"
        echo "  Backend:  http://localhost:8000"
        ;;
        
    3)
        echo ""
        echo "📊 Generating sample data only..."
        
        # Check Python
        if ! command_exists python && ! command_exists python3; then
            echo "❌ Python is not installed. Please install Python 3.8+ first."
            exit 1
        fi
        
        PYTHON_CMD="python"
        if command_exists python3; then
            PYTHON_CMD="python3"
        fi
        
        echo "📦 Installing minimal dependencies..."
        $PYTHON_CMD -m pip install pandas numpy requests
        
        echo "📊 Generating sample data..."
        $PYTHON_CMD backend/scripts/setup_data.py
        
        echo ""
        echo "✅ Sample data generated successfully!"
        echo "📁 Data files are available in the ./data/ directory"
        echo ""
        echo "To start the full application, run this script again and choose option 1 or 2."
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📖 For detailed instructions, see: STARTUP_GUIDE.md"
echo "🔧 For troubleshooting, check the logs or documentation"
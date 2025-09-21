#!/bin/bash
# Firebase Deployment Script for AI Supply Chain Management

echo "🔥 Firebase Deployment for AI Supply Chain Management"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔑 Checking Firebase authentication..."
firebase login:ci

# Install dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "📦 Installing functions dependencies..."
cd functions
npm install
cd ..

# Set up environment variables
echo "⚙️  Setting up environment variables..."
firebase functions:config:set auth.jwt_secret="your-super-secure-jwt-secret-key-change-this"

# Initialize Firestore data
echo "🗄️  Initializing Firestore with sample data..."
node scripts/firebase-init-data.js

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application is now live at:"
echo "   Frontend: https://your-project-id.web.app"
echo "   API: https://your-project-id.web.app/api"
echo ""
echo "📚 Next Steps:"
echo "   1. Update CORS origins in Firebase Functions"
echo "   2. Set up custom domain (optional)"
echo "   3. Configure monitoring and alerts"
echo "   4. Set up CI/CD pipeline"
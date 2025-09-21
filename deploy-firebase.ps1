# Firebase Deployment Script for AI Supply Chain Management (Windows)

Write-Host "🔥 Firebase Deployment for AI Supply Chain Management" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
    Write-Host "✅ Firebase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Login to Firebase
Write-Host "🔑 Firebase authentication..." -ForegroundColor Yellow
firebase login

# Install frontend dependencies and build
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# Install functions dependencies
Write-Host "📦 Installing functions dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install
Set-Location ..

# Set up environment variables
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow
firebase functions:config:set auth.jwt_secret="your-super-secure-jwt-secret-key-change-this"

# Initialize Firebase project (if not already done)
Write-Host "🔧 Initializing Firebase project..." -ForegroundColor Yellow
# firebase init

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now live at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://your-project-id.web.app" -ForegroundColor White
Write-Host "   API: https://your-project-id.web.app/api" -ForegroundColor White
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update CORS origins in Firebase Functions" -ForegroundColor White
Write-Host "   2. Set up custom domain (optional)" -ForegroundColor White
Write-Host "   3. Configure monitoring and alerts" -ForegroundColor White
Write-Host "   4. Set up CI/CD pipeline" -ForegroundColor White
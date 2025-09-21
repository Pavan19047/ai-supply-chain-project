#!/usr/bin/env python3
"""
Master Data Setup Script
Orchestrates the complete data collection process for the AI Supply Chain project.
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

def check_python_packages():
    """Check if required Python packages are installed."""
    required_packages = [
        'pandas', 'numpy', 'requests', 'scikit-learn', 
        'torch', 'fastapi', 'sqlalchemy', 'psycopg2-binary'
    ]
    
    optional_packages = {
        'kaggle': 'Kaggle dataset downloads',
        'yfinance': 'Financial data',
        'openpyxl': 'Excel file reading'
    }
    
    missing_required = []
    missing_optional = []
    
    print("🔍 Checking Python packages...")
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            missing_required.append(package)
            print(f"❌ {package} (required)")
    
    for package, description in optional_packages.items():
        try:
            __import__(package)
            print(f"✅ {package} ({description})")
        except ImportError:
            missing_optional.append(package)
            print(f"⚠️ {package} (optional - {description})")
    
    return missing_required, missing_optional

def install_missing_packages(packages):
    """Install missing Python packages."""
    if not packages:
        return True
    
    print(f"\n📦 Installing missing packages: {', '.join(packages)}")
    
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '--upgrade'
        ] + packages)
        print("✅ Packages installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False

def create_environment_template():
    """Create environment variable template file."""
    env_template = """# AI Supply Chain Project - Environment Variables
# Copy this file to .env and fill in your API keys

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/supply_chain_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External API Keys (Optional - for real-time data)
FRED_API_KEY=your-fred-api-key-here
OPENWEATHER_API_KEY=your-openweather-api-key-here
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here

# Kaggle API (Optional - for dataset downloads)
KAGGLE_USERNAME=your-kaggle-username
KAGGLE_KEY=your-kaggle-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
"""
    
    with open('.env.template', 'w', encoding='utf-8') as f:
        f.write(env_template)
    
    print("✅ Created .env.template file")

def setup_data_directories():
    """Create all necessary data directories."""
    directories = [
        'data',
        'data/raw',
        'data/processed',
        'data/sample',
        'data/external',
        'data/external/kaggle',
        'data/external/api',
        'data/external/manual',
        'data/models',
        'data/backups',
        'logs'
    ]
    
    print("📁 Creating data directories...")
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   📂 {directory}")
    
    print("✅ Data directories created")

def run_sample_data_generation():
    """Run the sample data generation script."""
    print("\n🔄 Generating sample data...")
    
    try:
        # Import and run the generation functions directly
        sys.path.append(str(Path(__file__).parent))
        
        # Simple inline data generation without external dependencies
        generate_basic_sample_data()
        print("✅ Sample data generated successfully")
        return True
        
    except Exception as e:
        print(f"❌ Sample data generation failed: {e}")
        return False

def generate_basic_sample_data():
    """Generate basic sample data without external dependencies."""
    import json
    import random
    from datetime import datetime, timedelta
    
    # Generate sales data
    sales_data = []
    products = ['Product_' + str(i).zfill(3) for i in range(1, 51)]
    categories = ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Books']
    
    start_date = datetime.now() - timedelta(days=365)
    
    for day in range(365):
        current_date = start_date + timedelta(days=day)
        
        for product in products[:10]:  # Use first 10 products for demo
            category = random.choice(categories)
            quantity = random.randint(1, 50)
            price = random.uniform(10, 200)
            
            sales_data.append({
                'product_id': product,
                'date': current_date.strftime('%Y-%m-%d'),
                'quantity_sold': quantity,
                'revenue': round(quantity * price, 2),
                'category': category,
                'unit_price': round(price, 2)
            })
    
    # Save as JSON (can be easily converted to CSV later)
    with open('data/sample/sales_data.json', 'w') as f:
        json.dump(sales_data, f, indent=2)
    
    # Generate inventory data
    inventory_data = []
    warehouses = ['WH001', 'WH002', 'WH003']
    
    for product in products[:10]:
        for warehouse in warehouses:
            inventory_data.append({
                'product_id': product,
                'warehouse_id': warehouse,
                'quantity': random.randint(10, 500),
                'reorder_point': random.randint(20, 50),
                'max_stock': random.randint(200, 1000),
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
    
    with open('data/sample/inventory_data.json', 'w') as f:
        json.dump(inventory_data, f, indent=2)
    
    # Create data summary
    summary = {
        'created_at': datetime.now().isoformat(),
        'datasets': {
            'sales_data': {
                'file': 'sample/sales_data.json',
                'records': len(sales_data),
                'format': 'JSON'
            },
            'inventory_data': {
                'file': 'sample/inventory_data.json',
                'records': len(inventory_data),
                'format': 'JSON'
            }
        },
        'note': 'Basic sample data generated without external dependencies'
    }
    
    with open('data/data_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

def check_api_keys():
    """Check if API keys are configured."""
    api_keys = {
        'FRED_API_KEY': 'Federal Reserve Economic Data',
        'OPENWEATHER_API_KEY': 'OpenWeatherMap',
        'ALPHA_VANTAGE_API_KEY': 'Alpha Vantage Financial Data',
        'KAGGLE_USERNAME': 'Kaggle Datasets',
        'KAGGLE_KEY': 'Kaggle API Key'
    }
    
    print("\n🔑 Checking API key configuration...")
    
    configured_apis = []
    missing_apis = []
    
    for key, description in api_keys.items():
        if os.getenv(key):
            configured_apis.append(description)
            print(f"✅ {description}")
        else:
            missing_apis.append(description)
            print(f"⚠️ {description} (not configured)")
    
    if missing_apis:
        print(f"\n💡 To enable external data sources, configure API keys in .env file")
        print(f"   Missing: {', '.join(missing_apis)}")
    
    return len(configured_apis) > 0

def create_readme():
    """Create a comprehensive README for the data setup."""
    readme_content = """# AI Supply Chain Project - Data Setup

## Overview
This directory contains all data-related scripts and datasets for the AI Supply Chain project.

## Directory Structure
```
data/
├── raw/              # Raw, unprocessed data
├── processed/        # Cleaned and processed data
├── sample/           # Generated sample data
├── external/         # External data sources
│   ├── kaggle/       # Kaggle datasets
│   ├── api/          # API-sourced data
│   └── manual/       # Manually added datasets
├── models/           # Trained ML models
└── backups/          # Data backups
```

## Setup Instructions

### 1. Install Required Packages
```bash
pip install -r ../requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.template .env
# Edit .env with your API keys
```

### 3. Generate Sample Data
```bash
python scripts/setup_data.py
```

### 4. Download External Datasets (Optional)
```bash
# Kaggle datasets (requires API key)
python scripts/kaggle_downloader.py

# External API data (requires API keys)
python scripts/api_connectors.py
```

## Data Sources

### Sample Data (Always Available)
- Sales transactions (generated)
- Inventory levels (generated)
- Supplier information (generated)
- Economic indicators (generated)

### External Datasets (Requires API Keys)
- **Kaggle**: Store sales, retail data, supply chain datasets
- **FRED**: Economic indicators from Federal Reserve
- **OpenWeather**: Weather data for supply chain hubs
- **Alpha Vantage**: Commodity and financial data
- **World Bank**: Global economic indicators

## API Key Setup

### Kaggle API
1. Create account at kaggle.com
2. Go to Account → Create New API Token
3. Download kaggle.json
4. Set KAGGLE_USERNAME and KAGGLE_KEY in .env

### FRED API
1. Register at research.stlouisfed.org/useraccount/register
2. Request API key
3. Set FRED_API_KEY in .env

### OpenWeather API
1. Register at openweathermap.org
2. Get free API key
3. Set OPENWEATHER_API_KEY in .env

### Alpha Vantage API
1. Register at alphavantage.co/support/#api-key
2. Get free API key
3. Set ALPHA_VANTAGE_API_KEY in .env

## Usage

### Training ML Models
```bash
python ../app/ml/train.py
```

### Running Data Updates
```bash
# Daily data refresh
python scripts/update_data.py
```

## Data Files

After setup, you'll have:
- `data/sample/` - Immediately usable sample data
- `data/external/` - Real-world datasets (if APIs configured)
- `data/processed/` - Cleaned data ready for ML training

## Notes
- Sample data is always generated and ready to use
- External data sources enhance the demo but are optional
- All scripts handle missing API keys gracefully
- Data is refreshed automatically when available
"""
    
    with open('data/README.md', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print("✅ Created data/README.md")

def main():
    """Main setup function."""
    print("🚀 AI Supply Chain Project - Data Setup")
    print("=" * 50)
    
    # Check current directory
    if not os.path.exists('backend'):
        print("❌ Please run this script from the project root directory")
        return
    
    # Create environment template
    create_environment_template()
    
    # Setup directories
    setup_data_directories()
    
    # Check packages
    missing_required, missing_optional = check_python_packages()
    
    # Install missing required packages
    if missing_required:
        success = install_missing_packages(missing_required)
        if not success:
            print("❌ Failed to install required packages. Please install manually:")
            print(f"   pip install {' '.join(missing_required)}")
            return
    
    # Generate sample data
    run_sample_data_generation()
    
    # Check API keys
    has_api_keys = check_api_keys()
    
    # Create documentation
    create_readme()
    
    print("\n" + "=" * 50)
    print("✅ Data setup completed successfully!")
    print("\n📋 Next Steps:")
    print("1. Sample data is ready to use immediately")
    print("2. Configure API keys in .env for external data (optional)")
    print("3. Run the ML training pipeline: python backend/app/ml/train.py")
    print("4. Start the application: python backend/app/main.py")
    
    if missing_optional:
        print(f"\n💡 Optional packages for enhanced functionality:")
        for package in missing_optional:
            print(f"   pip install {package}")
    
    if not has_api_keys:
        print(f"\n🔑 For real-time data, configure API keys in .env file")
    
    print("\n📖 See data/README.md for detailed instructions")

if __name__ == "__main__":
    main()
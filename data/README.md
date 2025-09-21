# AI Supply Chain Project - Data Setup

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

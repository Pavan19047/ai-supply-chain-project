# AI Supply Chain - Dataset Sources & Data Integration

## Overview
This document provides comprehensive information about data sources, datasets, and data integration methods for the AI Supply Chain project.

## 🗂️ Real Dataset Sources

### 1. **Retail & Sales Data**

#### **Kaggle Datasets**
- **Store Sales - Time Series Forecasting**
  - URL: `https://www.kaggle.com/competitions/store-sales-time-series-forecasting`
  - Features: Store sales by product family, promotions, holidays
  - Size: 3.7M+ records
  - Format: CSV
  - Use case: Demand forecasting

- **Online Retail Dataset**
  - URL: `https://www.kaggle.com/datasets/vijayuv/onlineretail`
  - Features: Invoice data, product descriptions, quantities
  - Size: 500K+ transactions
  - Format: CSV
  - Use case: Customer behavior, demand patterns

- **Sales Forecasting Dataset**
  - URL: `https://www.kaggle.com/datasets/chakradharmattapalli/sales-forecasting`
  - Features: Historical sales, seasonality, trends
  - Size: 100K+ records
  - Format: CSV
  - Use case: Time series forecasting

#### **UCI Machine Learning Repository**
- **Online Retail II**
  - URL: `https://archive.ics.uci.edu/ml/datasets/Online+Retail+II`
  - Features: Multi-national e-commerce transactions
  - Size: 1M+ records
  - Format: CSV/Excel
  - Use case: Global supply chain analysis

### 2. **Supply Chain & Logistics Data**

#### **Supply Chain Analytics Datasets**
- **DataCo Supply Chain Dataset**
  - URL: `https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-for-big-data-analysis`
  - Features: Orders, shipping, customer data, delivery performance
  - Size: 100K+ orders
  - Format: CSV
  - Use case: End-to-end supply chain optimization

- **Supply Chain Shipment Pricing Dataset**
  - URL: `https://www.kaggle.com/datasets/divyeshardeshana/supply-chain-shipment-pricing-dataset`
  - Features: Shipment costs, routes, delivery times
  - Size: 10K+ shipments
  - Format: CSV
  - Use case: Cost optimization, route planning

#### **Manufacturing & Inventory**
- **Manufacturing Production Dataset**
  - URL: `https://www.kaggle.com/datasets/supergus/manufacturing-production-dataset`
  - Features: Production schedules, inventory levels, quality metrics
  - Size: 50K+ records
  - Format: CSV
  - Use case: Production planning, inventory management

### 3. **Economic & External Data**

#### **Government & Public APIs**
- **FRED Economic Data**
  - URL: `https://fred.stlouisfed.org/`
  - API: `https://api.stlouisfed.org/`
  - Features: Economic indicators, inflation, GDP
  - Format: JSON/XML
  - Use case: Economic impact on demand

- **World Bank Open Data**
  - URL: `https://data.worldbank.org/`
  - API: `https://datahelpdesk.worldbank.org/knowledgebase/articles/889392`
  - Features: Trade data, commodity prices
  - Format: JSON/CSV
  - Use case: Global trade analysis

#### **Weather Data**
- **OpenWeatherMap API**
  - URL: `https://openweathermap.org/api`
  - Features: Historical weather, forecasts
  - Format: JSON
  - Use case: Weather impact on supply chain

### 4. **Financial & Commodity Data**

#### **Alpha Vantage**
- **Stock & Commodity Prices**
  - URL: `https://www.alphavantage.co/`
  - Features: Stock prices, commodity prices, forex
  - Format: JSON/CSV
  - Use case: Price volatility analysis

#### **Yahoo Finance**
- **Historical Financial Data**
  - URL: `https://finance.yahoo.com/`
  - Python Library: `yfinance`
  - Features: Stock prices, indices, commodities
  - Format: JSON/CSV
  - Use case: Market impact analysis

## 📁 Sample Dataset Files

### Pre-processed Sample Files (Included in Project)

1. **`data/sample_sales_data.csv`**
   - 10,000 synthetic sales records
   - Columns: product_id, date, quantity_sold, revenue, category

2. **`data/sample_inventory_data.csv`**
   - 1,000 inventory items
   - Columns: product_id, warehouse_id, quantity, reorder_point, max_stock

3. **`data/sample_suppliers_data.csv`**
   - 50 supplier records
   - Columns: supplier_id, name, lead_time_days, quality_rating

4. **`data/sample_economic_indicators.csv`**
   - Economic data for forecasting
   - Columns: date, gdp_growth, inflation_rate, unemployment_rate

## 🔌 Data Integration Methods

### 1. **CSV/Excel Upload**
```python
# Backend endpoint: /data/upload
# Supports: .csv, .xlsx, .xls files
# Max size: 10MB per file
```

### 2. **API Integration**
```python
# External API connectors
# Scheduled data fetching
# Real-time data streams
```

### 3. **Database Import**
```python
# Direct database connections
# SQL Server, MySQL, PostgreSQL
# Automated ETL pipelines
```

## 🚀 Quick Start - Download & Setup Datasets

### Method 1: Using Python Scripts

```bash
# Run the data download script
cd backend
python scripts/download_datasets.py

# This will download and process:
# - Kaggle datasets (requires API key)
# - Public APIs data
# - Generate sample data
```

### Method 2: Manual Download

1. **Kaggle Datasets** (Requires Kaggle account):
   ```bash
   pip install kaggle
   kaggle competitions download -c store-sales-time-series-forecasting
   kaggle datasets download -d vijayuv/onlineretail
   ```

2. **UCI Repository**:
   - Download directly from URLs provided above
   - Place in `data/external/` directory

3. **API Data**:
   - Sign up for API keys (Fred, OpenWeather, Alpha Vantage)
   - Configure in `.env` file
   - Run data fetching scripts

### Method 3: Use Generated Sample Data

```bash
# Generate sample datasets
cd backend
python train.py --generate-data

# This creates:
# - Synthetic sales data (1 year)
# - Inventory data
# - Supplier information
# - Economic indicators
```

## 📊 Data Schema & Integration

### Data Flow Architecture

```
External Sources → API Connectors → Data Validation → Database Storage → ML Models
     ↓                ↓                 ↓              ↓              ↓
  - Kaggle          - Python         - Schema       - PostgreSQL    - Forecasting
  - APIs            - Scripts        - Validation   - Redis Cache   - Anomaly Detection
  - Uploads         - Schedulers     - Cleaning     - File Storage  - Optimization
```

### Database Tables

1. **Raw Data Tables**:
   - `raw_sales_data`
   - `raw_inventory_data`
   - `raw_supplier_data`
   - `raw_economic_data`

2. **Processed Tables**:
   - `sales_history`
   - `inventory`
   - `suppliers`
   - `external_factors`

## 🔐 API Keys Required

### Free Tier APIs
- **FRED Economic Data**: Free, 120 calls/minute
- **World Bank**: Free, unlimited
- **OpenWeatherMap**: Free, 1000 calls/day
- **Yahoo Finance**: Free (via yfinance library)

### Paid APIs (Optional)
- **Alpha Vantage**: $49.99/month for 75 calls/minute
- **Kaggle**: Free with account

## 📝 Environment Setup

### Required API Keys in `.env`:
```bash
# Economic Data
FRED_API_KEY=your_fred_api_key_here

# Weather Data
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Financial Data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Kaggle (for dataset downloads)
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
```

## 🎯 Recommended Starting Datasets

For immediate project setup, I recommend starting with:

1. **Generated Sample Data** (Fastest setup)
2. **Online Retail Dataset** from UCI (Real e-commerce data)
3. **Store Sales Dataset** from Kaggle (Time series forecasting)
4. **DataCo Supply Chain** (Complete supply chain data)

## 📈 Data Quality & Validation

### Automated Data Quality Checks
- Missing value detection
- Outlier identification
- Schema validation
- Data type verification
- Duplicate detection

### Data Cleaning Pipeline
- Handle missing values
- Normalize data formats
- Remove outliers
- Feature engineering
- Data enrichment

## 🔄 Data Update Schedules

### Real-time Data
- API endpoints: Every 5 minutes
- Database triggers: Immediate

### Batch Updates
- Daily: Economic indicators, weather data
- Weekly: Supply chain metrics
- Monthly: Comprehensive data refresh
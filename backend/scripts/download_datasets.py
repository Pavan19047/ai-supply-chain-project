#!/usr/bin/env python3
"""
Dataset Download and Generation Script
Downloads real datasets from various sources and generates sample data for immediate use.
"""

import os
import sys
import pandas as pd
import numpy as np
import requests
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
import json

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

def create_directories():
    """Create necessary data directories."""
    directories = [
        'data',
        'data/raw',
        'data/processed',
        'data/sample',
        'data/external'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    print("✅ Created data directories")

def generate_sample_sales_data(n_products=50, n_days=365):
    """Generate realistic sample sales data."""
    np.random.seed(42)
    
    # Product categories and their characteristics
    categories = {
        'Electronics': {'base_price': 200, 'volatility': 0.3, 'seasonality': 0.2},
        'Clothing': {'base_price': 50, 'volatility': 0.4, 'seasonality': 0.5},
        'Food': {'base_price': 10, 'volatility': 0.1, 'seasonality': 0.1},
        'Home & Garden': {'base_price': 75, 'volatility': 0.3, 'seasonality': 0.3},
        'Books': {'base_price': 15, 'volatility': 0.2, 'seasonality': 0.2}
    }
    
    data = []
    start_date = datetime.now() - timedelta(days=n_days)
    
    for product_id in range(1, n_products + 1):
        category = np.random.choice(list(categories.keys()))
        cat_info = categories[category]
        
        # Product characteristics
        base_demand = np.random.uniform(20, 100)
        trend = np.random.uniform(-0.02, 0.03)
        
        for day in range(n_days):
            current_date = start_date + timedelta(days=day)
            
            # Seasonal patterns
            day_of_year = current_date.timetuple().tm_yday
            seasonal_factor = 1 + cat_info['seasonality'] * np.sin(2 * np.pi * day_of_year / 365)
            
            # Weekly patterns (weekends different)
            day_of_week = current_date.weekday()
            weekly_factor = 1.2 if day_of_week < 5 else 0.8  # Weekdays vs weekends
            
            # Trend component
            trend_factor = 1 + trend * (day / 365)
            
            # Random noise
            noise = np.random.normal(1, cat_info['volatility'] * 0.3)
            
            # Calculate demand
            demand = base_demand * seasonal_factor * weekly_factor * trend_factor * noise
            demand = max(0, int(demand))
            
            # Price with some variation
            price = cat_info['base_price'] * np.random.uniform(0.8, 1.2)
            revenue = demand * price
            
            data.append({
                'product_id': product_id,
                'date': current_date.strftime('%Y-%m-%d'),
                'quantity_sold': demand,
                'revenue': round(revenue, 2),
                'category': category,
                'unit_price': round(price, 2),
                'day_of_week': day_of_week,
                'month': current_date.month,
                'year': current_date.year,
                'is_weekend': day_of_week >= 5,
                'is_holiday': day_of_year in [1, 32, 90, 150, 180, 244, 300, 359]  # Sample holidays
            })
    
    df = pd.DataFrame(data)
    df.to_csv('data/sample/sales_data.csv', index=False)
    print(f"✅ Generated sample sales data: {len(df)} records")
    return df

def generate_sample_inventory_data(sales_df):
    """Generate sample inventory data based on sales patterns."""
    np.random.seed(42)
    
    # Get unique products from sales data
    products = sales_df['product_id'].unique()
    warehouses = ['WH001', 'WH002', 'WH003', 'WH004', 'WH005']
    
    inventory_data = []
    
    for product_id in products:
        product_sales = sales_df[sales_df['product_id'] == product_id]
        avg_daily_sales = product_sales['quantity_sold'].mean()
        category = product_sales['category'].iloc[0]
        
        # Assign products to random warehouses (some products in multiple warehouses)
        num_warehouses = np.random.choice([1, 2, 3], p=[0.6, 0.3, 0.1])
        product_warehouses = np.random.choice(warehouses, num_warehouses, replace=False)
        
        for warehouse_id in product_warehouses:
            # Inventory parameters based on sales velocity
            reorder_point = int(avg_daily_sales * np.random.uniform(5, 15))  # 5-15 days of stock
            max_stock = int(avg_daily_sales * np.random.uniform(30, 90))     # 30-90 days of stock
            current_stock = np.random.randint(reorder_point // 2, max_stock)
            
            inventory_data.append({
                'product_id': product_id,
                'warehouse_id': warehouse_id,
                'quantity': current_stock,
                'reorder_point': reorder_point,
                'max_stock': max_stock,
                'category': category,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'stock_status': 'low' if current_stock <= reorder_point else 'normal'
            })
    
    df = pd.DataFrame(inventory_data)
    df.to_csv('data/sample/inventory_data.csv', index=False)
    print(f"✅ Generated sample inventory data: {len(df)} records")
    return df

def generate_sample_suppliers_data():
    """Generate sample supplier data."""
    np.random.seed(42)
    
    supplier_names = [
        'Global Tech Supplies', 'Fashion Forward Inc', 'Fresh Foods Co', 
        'Home Essentials Ltd', 'Book World Distributors', 'Electronic Hub',
        'Style Central', 'Organic Farms', 'Garden Paradise', 'Learning Resources',
        'Tech Innovation', 'Trendy Apparel', 'Daily Fresh', 'Comfort Living',
        'Knowledge Publishers', 'Digital Solutions', 'Urban Fashion', 'Nature\'s Best',
        'Living Spaces', 'Academic Press', 'Smart Electronics', 'Chic Boutique',
        'Farm to Table', 'Designer Home', 'Educational Materials'
    ]
    
    locations = [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
        'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
        'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
        'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'Detroit, MI',
        'El Paso, TX', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
    ]
    
    suppliers_data = []
    
    for i, name in enumerate(supplier_names):
        suppliers_data.append({
            'supplier_id': f'SUP{i+1:03d}',
            'name': name,
            'contact_email': f'contact@{name.lower().replace(" ", "").replace("\'", "")}.com',
            'contact_phone': f'+1-{np.random.randint(200, 999)}-{np.random.randint(100, 999)}-{np.random.randint(1000, 9999)}',
            'address': np.random.choice(locations),
            'lead_time_days': np.random.randint(1, 14),
            'quality_rating': round(np.random.uniform(3.5, 5.0), 1),
            'on_time_delivery_rate': round(np.random.uniform(0.85, 0.99), 2),
            'cost_rating': np.random.choice(['Low', 'Medium', 'High'], p=[0.3, 0.5, 0.2]),
            'certification': np.random.choice(['ISO9001', 'ISO14001', 'None'], p=[0.4, 0.3, 0.3]),
            'established_year': np.random.randint(1990, 2020)
        })
    
    df = pd.DataFrame(suppliers_data)
    df.to_csv('data/sample/suppliers_data.csv', index=False)
    print(f"✅ Generated sample suppliers data: {len(df)} records")
    return df

def generate_economic_indicators():
    """Generate sample economic indicators."""
    np.random.seed(42)
    
    start_date = datetime.now() - timedelta(days=365)
    data = []
    
    # Base values
    base_gdp_growth = 2.5
    base_inflation = 2.0
    base_unemployment = 5.0
    base_consumer_confidence = 95.0
    
    for days in range(365):
        current_date = start_date + timedelta(days=days)
        
        # Add some realistic variation
        gdp_growth = base_gdp_growth + np.random.normal(0, 0.5)
        inflation_rate = max(0, base_inflation + np.random.normal(0, 0.3))
        unemployment_rate = max(0, base_unemployment + np.random.normal(0, 0.2))
        consumer_confidence = max(0, min(200, base_consumer_confidence + np.random.normal(0, 5)))
        
        # Interest rates influenced by inflation
        interest_rate = max(0, inflation_rate + np.random.uniform(0.5, 2.0))
        
        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'gdp_growth_rate': round(gdp_growth, 2),
            'inflation_rate': round(inflation_rate, 2),
            'unemployment_rate': round(unemployment_rate, 2),
            'consumer_confidence_index': round(consumer_confidence, 1),
            'interest_rate': round(interest_rate, 2),
            'oil_price': round(np.random.uniform(50, 100), 2),
            'usd_index': round(np.random.uniform(90, 110), 2)
        })
    
    df = pd.DataFrame(data)
    df.to_csv('data/sample/economic_indicators.csv', index=False)
    print(f"✅ Generated economic indicators: {len(df)} records")
    return df

def download_uci_online_retail():
    """Download UCI Online Retail dataset."""
    try:
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx"
        
        print("📥 Downloading UCI Online Retail dataset...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open('data/external/online_retail.xlsx', 'wb') as f:
            f.write(response.content)
        
        # Read and process the data
        df = pd.read_excel('data/external/online_retail.xlsx')
        
        # Clean and save as CSV
        df_clean = df.dropna()
        df_clean['InvoiceDate'] = pd.to_datetime(df_clean['InvoiceDate'])
        df_clean.to_csv('data/processed/online_retail_cleaned.csv', index=False)
        
        print(f"✅ Downloaded and processed UCI Online Retail: {len(df_clean)} records")
        return df_clean
        
    except Exception as e:
        print(f"❌ Failed to download UCI dataset: {e}")
        return None

def fetch_fred_economic_data():
    """Fetch economic data from FRED API (requires API key)."""
    try:
        api_key = os.getenv('FRED_API_KEY')
        if not api_key:
            print("⚠️ FRED_API_KEY not found in environment variables")
            return None
        
        base_url = "https://api.stlouisfed.org/fred/series/observations"
        
        # Economic indicators to fetch
        indicators = {
            'GDP': 'GDPC1',
            'Inflation': 'CPIAUCSL',
            'Unemployment': 'UNRATE',
            'Consumer_Confidence': 'UMCSENT'
        }
        
        economic_data = {}
        
        for name, series_id in indicators.items():
            print(f"📡 Fetching {name} data from FRED...")
            
            params = {
                'series_id': series_id,
                'api_key': api_key,
                'file_type': 'json',
                'limit': 1000
            }
            
            response = requests.get(base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            economic_data[name] = data['observations']
        
        # Save the data
        with open('data/external/fred_economic_data.json', 'w') as f:
            json.dump(economic_data, f, indent=2)
        
        print("✅ Downloaded FRED economic data")
        return economic_data
        
    except Exception as e:
        print(f"❌ Failed to fetch FRED data: {e}")
        return None

def create_sample_data_package():
    """Create a complete sample data package for immediate use."""
    print("🚀 Creating sample data package...")
    
    # Generate all sample datasets
    sales_df = generate_sample_sales_data(n_products=50, n_days=365)
    inventory_df = generate_sample_inventory_data(sales_df)
    suppliers_df = generate_sample_suppliers_data()
    economic_df = generate_economic_indicators()
    
    # Create a data summary
    summary = {
        'created_at': datetime.now().isoformat(),
        'datasets': {
            'sales_data': {
                'file': 'sample/sales_data.csv',
                'records': len(sales_df),
                'date_range': f"{sales_df['date'].min()} to {sales_df['date'].max()}",
                'products': sales_df['product_id'].nunique(),
                'categories': sales_df['category'].unique().tolist()
            },
            'inventory_data': {
                'file': 'sample/inventory_data.csv',
                'records': len(inventory_df),
                'warehouses': inventory_df['warehouse_id'].nunique(),
                'low_stock_items': len(inventory_df[inventory_df['stock_status'] == 'low'])
            },
            'suppliers_data': {
                'file': 'sample/suppliers_data.csv',
                'records': len(suppliers_df),
                'avg_lead_time': round(suppliers_df['lead_time_days'].mean(), 1),
                'avg_quality_rating': round(suppliers_df['quality_rating'].mean(), 1)
            },
            'economic_indicators': {
                'file': 'sample/economic_indicators.csv',
                'records': len(economic_df),
                'date_range': f"{economic_df['date'].min()} to {economic_df['date'].max()}"
            }
        }
    }
    
    with open('data/data_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("✅ Sample data package created successfully!")
    print(f"📊 Total records: {sum(len(df) for df in [sales_df, inventory_df, suppliers_df, economic_df])}")
    return summary

def main():
    """Main function to orchestrate data download and generation."""
    print("🔄 Starting dataset download and generation process...\n")
    
    # Create directory structure
    create_directories()
    
    # Generate sample data (always available)
    print("\n📊 Generating Sample Data...")
    sample_summary = create_sample_data_package()
    
    # Try to download external datasets
    print("\n🌐 Downloading External Datasets...")
    
    # UCI Online Retail
    uci_data = download_uci_online_retail()
    
    # FRED Economic Data (requires API key)
    fred_data = fetch_fred_economic_data()
    
    print("\n✅ Dataset generation and download completed!")
    print("\n📋 Summary:")
    print("- Sample data: Always available")
    print("- UCI Online Retail: " + ("✅ Downloaded" if uci_data is not None else "❌ Failed"))
    print("- FRED Economic Data: " + ("✅ Downloaded" if fred_data is not None else "❌ Failed (API key required)"))
    
    print("\n📁 Data files location: ./data/")
    print("📄 See DATASETS.md for more information")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Training script for AI Supply Chain ML models.
This script trains demand forecasting and anomaly detection models.
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
import yaml
from datetime import datetime, timedelta
from pathlib import Path

# Add the backend app to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.ml.forecasting import DemandForecaster, evaluate_forecast
from app.ml.anomaly_detection import AnomalyDetector
from app.config import settings

def load_config(config_path: str) -> dict:
    """Load training configuration."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def generate_sample_sales_data(n_products: int = 10, n_days: int = 365) -> pd.DataFrame:
    """Generate sample sales data for training."""
    np.random.seed(42)
    
    data = []
    product_ids = list(range(1, n_products + 1))
    start_date = datetime.now() - timedelta(days=n_days)
    
    for product_id in product_ids:
        # Base demand with trend and seasonality
        base_demand = np.random.uniform(20, 100)
        trend = np.random.uniform(-0.01, 0.02)
        seasonal_amplitude = np.random.uniform(0.1, 0.3)
        
        for day in range(n_days):
            current_date = start_date + timedelta(days=day)
            
            # Seasonal pattern (weekly and monthly)
            day_of_week = current_date.weekday()
            day_of_year = current_date.timetuple().tm_yday
            
            weekly_seasonal = 1 + seasonal_amplitude * np.sin(2 * np.pi * day_of_week / 7)
            yearly_seasonal = 1 + seasonal_amplitude * np.sin(2 * np.pi * day_of_year / 365)
            
            # Trend component
            trend_component = 1 + trend * day
            
            # Random noise
            noise = np.random.normal(1, 0.1)
            
            # Calculate demand
            demand = base_demand * weekly_seasonal * yearly_seasonal * trend_component * noise
            demand = max(0, int(demand))
            
            # Revenue
            unit_price = np.random.uniform(5, 20)
            revenue = demand * unit_price
            
            data.append({
                'product_id': product_id,
                'date': current_date,
                'quantity_sold': demand,
                'revenue': revenue,
                'day_of_week': day_of_week,
                'month': current_date.month,
                'year': current_date.year
            })
    
    return pd.DataFrame(data)

def generate_sample_inventory_data(sales_df: pd.DataFrame) -> pd.DataFrame:
    """Generate sample inventory data based on sales."""
    np.random.seed(42)
    
    inventory_data = []
    
    for product_id in sales_df['product_id'].unique():
        product_sales = sales_df[sales_df['product_id'] == product_id]
        avg_daily_sales = product_sales['quantity_sold'].mean()
        
        # Simulate inventory levels
        initial_stock = int(avg_daily_sales * np.random.uniform(30, 60))  # 30-60 days of stock
        reorder_point = int(avg_daily_sales * np.random.uniform(7, 14))   # 7-14 days
        max_stock = int(avg_daily_sales * np.random.uniform(90, 120))     # 90-120 days
        
        current_stock = initial_stock
        
        for _, sale_row in product_sales.iterrows():
            # Simulate stock depletion and restocking
            current_stock -= sale_row['quantity_sold']
            
            # Restock if below reorder point
            if current_stock <= reorder_point:
                restock_amount = max_stock - current_stock
                current_stock += restock_amount
            
            inventory_data.append({
                'product_id': product_id,
                'warehouse_id': 1,  # Single warehouse for simplicity
                'date': sale_row['date'],
                'quantity': max(0, current_stock),
                'quantity_sold': sale_row['quantity_sold'],
                'reorder_point': reorder_point,
                'max_stock': max_stock
            })
    
    return pd.DataFrame(inventory_data)

def train_forecasting_model(sales_df: pd.DataFrame, config: dict):
    """Train demand forecasting model."""
    print("Training demand forecasting model...")
    
    # Initialize forecaster
    forecaster = DemandForecaster(
        sequence_length=config['forecasting']['sequence_length'],
        hidden_size=config['forecasting']['hidden_size'],
        num_layers=config['forecasting']['num_layers'],
        learning_rate=config['forecasting']['learning_rate']
    )
    
    # Prepare data for a single product (can be extended for multiple products)
    product_id = sales_df['product_id'].iloc[0]
    product_data = sales_df[sales_df['product_id'] == product_id].sort_values('date')
    
    # Add time features
    product_data = forecaster.preprocessor.create_time_features(product_data, 'date')
    product_data = forecaster.preprocessor.create_lag_features(product_data, 'quantity_sold', [1, 7, 30])
    product_data = forecaster.preprocessor.create_rolling_features(product_data, 'quantity_sold', [7, 30])
    
    # Train model
    train_losses, val_losses = forecaster.train(
        product_data,
        target_col='quantity_sold',
        epochs=config['forecasting']['epochs'],
        batch_size=config['forecasting']['batch_size']
    )
    
    # Save model
    model_path = f"models/forecasting_model.pt"
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    forecaster.save_model(model_path)
    
    # Generate sample forecast
    forecast, confidence = forecaster.predict(product_data, horizon=30)
    
    print(f"Model saved to {model_path}")
    print(f"Sample forecast (next 30 days): {forecast[:5]}...")
    print(f"Training completed. Final validation loss: {val_losses[-1]:.4f}")
    
    return forecaster

def train_anomaly_detector(inventory_df: pd.DataFrame, sales_df: pd.DataFrame, config: dict):
    """Train anomaly detection models."""
    print("Training anomaly detection models...")
    
    # Initialize detector
    detector = AnomalyDetector(contamination=config['anomaly_detection']['contamination'])
    
    # Merge inventory and sales data
    merged_df = inventory_df.merge(
        sales_df[['product_id', 'date', 'quantity_sold']], 
        on=['product_id', 'date'], 
        how='left'
    )
    merged_df['quantity_sold'] = merged_df['quantity_sold'].fillna(0)
    
    # Train inventory anomaly detector
    try:
        detector.train_inventory_detector(merged_df)
        print("✅ Inventory anomaly detector trained successfully")
    except Exception as e:
        print(f"❌ Error training inventory detector: {e}")
    
    # Train demand anomaly detector
    try:
        detector.train_demand_detector(sales_df)
        print("✅ Demand anomaly detector trained successfully")
    except Exception as e:
        print(f"❌ Error training demand detector: {e}")
    
    # Save models
    model_path = "models/anomaly_detector.joblib"
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    detector.save_models(model_path)
    
    # Test detection
    try:
        inventory_anomalies = detector.detect_inventory_anomalies(merged_df.head(100))
        demand_anomalies = detector.detect_demand_anomalies(sales_df.head(100))
        
        print(f"Sample inventory anomalies detected: {inventory_anomalies['anomalies_detected']}")
        print(f"Sample demand anomalies detected: {demand_anomalies['anomalies_detected']}")
    except Exception as e:
        print(f"❌ Error testing anomaly detection: {e}")
    
    return detector

def main():
    parser = argparse.ArgumentParser(description="Train AI Supply Chain models")
    parser.add_argument("--config", default="config/training_config.yaml", help="Training configuration file")
    parser.add_argument("--data-dir", default="data", help="Data directory")
    parser.add_argument("--model-dir", default="models", help="Model output directory")
    parser.add_argument("--generate-data", action="store_true", help="Generate sample data")
    
    args = parser.parse_args()
    
    # Create directories
    os.makedirs(args.data_dir, exist_ok=True)
    os.makedirs(args.model_dir, exist_ok=True)
    
    # Load or generate data
    if args.generate_data or not os.path.exists(f"{args.data_dir}/sales_data.csv"):
        print("Generating sample data...")
        sales_df = generate_sample_sales_data(n_products=20, n_days=365)
        inventory_df = generate_sample_inventory_data(sales_df)
        
        # Save sample data
        sales_df.to_csv(f"{args.data_dir}/sales_data.csv", index=False)
        inventory_df.to_csv(f"{args.data_dir}/inventory_data.csv", index=False)
        print(f"Sample data saved to {args.data_dir}/")
    else:
        print("Loading existing data...")
        sales_df = pd.read_csv(f"{args.data_dir}/sales_data.csv")
        inventory_df = pd.read_csv(f"{args.data_dir}/inventory_data.csv")
    
    # Load configuration
    config_path = args.config
    if not os.path.exists(config_path):
        # Create default config
        default_config = {
            'forecasting': {
                'sequence_length': 30,
                'hidden_size': 64,
                'num_layers': 2,
                'learning_rate': 0.001,
                'epochs': 50,
                'batch_size': 32
            },
            'anomaly_detection': {
                'contamination': 0.1
            }
        }
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, 'w') as f:
            yaml.dump(default_config, f)
        print(f"Created default config at {config_path}")
    
    config = load_config(config_path)
    
    print(f"Loaded {len(sales_df)} sales records and {len(inventory_df)} inventory records")
    
    # Train models
    print("\n" + "="*50)
    print("TRAINING MACHINE LEARNING MODELS")
    print("="*50)
    
    try:
        forecaster = train_forecasting_model(sales_df, config)
        print("✅ Forecasting model training completed")
    except Exception as e:
        print(f"❌ Forecasting model training failed: {e}")
    
    try:
        detector = train_anomaly_detector(inventory_df, sales_df, config)
        print("✅ Anomaly detection training completed")
    except Exception as e:
        print(f"❌ Anomaly detection training failed: {e}")
    
    print("\n" + "="*50)
    print("TRAINING COMPLETED")
    print("="*50)
    print(f"Models saved to: {args.model_dir}/")
    print(f"Data saved to: {args.data_dir}/")
    print("Ready for inference and deployment!")

if __name__ == "__main__":
    main()
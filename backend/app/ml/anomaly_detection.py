import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
import joblib
from datetime import datetime, timedelta

class AnomalyDetector:
    """Supply chain anomaly detection system."""
    
    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.models = {}
        self.scalers = {}
        self.feature_names = {}
        
    def prepare_inventory_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for inventory anomaly detection."""
        features = df.copy()
        
        # Calculate key metrics
        features['stock_turnover'] = features['quantity_sold'] / (features['quantity'] + 1)
        features['days_of_supply'] = features['quantity'] / (features['quantity_sold'] / 30 + 1)
        features['reorder_ratio'] = features['quantity'] / features['reorder_point']
        features['capacity_utilization'] = features['quantity'] / features['max_stock']
        
        # Time-based features
        if 'date' in features.columns:
            features['day_of_week'] = pd.to_datetime(features['date']).dt.dayofweek
            features['month'] = pd.to_datetime(features['date']).dt.month
        
        return features
    
    def prepare_demand_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for demand anomaly detection."""
        features = df.copy()
        
        # Rolling statistics
        features['demand_rolling_mean_7'] = features['quantity_sold'].rolling(7).mean()
        features['demand_rolling_std_7'] = features['quantity_sold'].rolling(7).std()
        features['demand_rolling_mean_30'] = features['quantity_sold'].rolling(30).mean()
        
        # Demand patterns
        features['demand_zscore'] = (features['quantity_sold'] - features['demand_rolling_mean_30']) / (features['demand_rolling_std_7'] + 1e-8)
        features['demand_coefficient_variation'] = features['demand_rolling_std_7'] / (features['demand_rolling_mean_7'] + 1e-8)
        
        return features
    
    def prepare_supply_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for supply chain anomaly detection."""
        features = df.copy()
        
        # Lead time analysis
        if 'actual_delivery_date' in features.columns and 'expected_delivery_date' in features.columns:
            features['delivery_delay'] = (pd.to_datetime(features['actual_delivery_date']) - 
                                        pd.to_datetime(features['expected_delivery_date'])).dt.days
            features['delay_ratio'] = features['delivery_delay'] / features['lead_time_days']
        
        # Quality metrics
        if 'defect_rate' in features.columns:
            features['defect_zscore'] = (features['defect_rate'] - features['defect_rate'].mean()) / features['defect_rate'].std()
        
        return features
    
    def train_inventory_detector(self, df: pd.DataFrame):
        """Train anomaly detector for inventory data."""
        features = self.prepare_inventory_features(df)
        
        # Select relevant features
        feature_cols = ['stock_turnover', 'days_of_supply', 'reorder_ratio', 'capacity_utilization']
        if 'day_of_week' in features.columns:
            feature_cols.extend(['day_of_week', 'month'])
        
        # Remove rows with missing values
        features_clean = features[feature_cols].dropna()
        
        if len(features_clean) == 0:
            raise ValueError("No valid data for training inventory anomaly detector")
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features_clean)
        
        # Train isolation forest
        model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        model.fit(X_scaled)
        
        # Store model and scaler
        self.models['inventory'] = model
        self.scalers['inventory'] = scaler
        self.feature_names['inventory'] = feature_cols
        
        print(f"Inventory anomaly detector trained on {len(features_clean)} samples")
    
    def train_demand_detector(self, df: pd.DataFrame):
        """Train anomaly detector for demand patterns."""
        features = self.prepare_demand_features(df)
        
        # Select relevant features
        feature_cols = ['quantity_sold', 'demand_rolling_mean_7', 'demand_rolling_std_7', 
                       'demand_zscore', 'demand_coefficient_variation']
        
        # Remove rows with missing values
        features_clean = features[feature_cols].dropna()
        
        if len(features_clean) == 0:
            raise ValueError("No valid data for training demand anomaly detector")
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features_clean)
        
        # Train isolation forest
        model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        model.fit(X_scaled)
        
        # Store model and scaler
        self.models['demand'] = model
        self.scalers['demand'] = scaler
        self.feature_names['demand'] = feature_cols
        
        print(f"Demand anomaly detector trained on {len(features_clean)} samples")
    
    def detect_inventory_anomalies(self, df: pd.DataFrame) -> Dict:
        """Detect inventory anomalies."""
        if 'inventory' not in self.models:
            raise ValueError("Inventory anomaly detector not trained")
        
        features = self.prepare_inventory_features(df)
        feature_cols = self.feature_names['inventory']
        
        # Prepare features
        X = features[feature_cols].fillna(0)
        X_scaled = self.scalers['inventory'].transform(X)
        
        # Predict anomalies
        anomaly_scores = self.models['inventory'].decision_function(X_scaled)
        anomalies = self.models['inventory'].predict(X_scaled)
        
        # Generate alerts for anomalies
        alerts = []
        for i, (score, is_anomaly) in enumerate(zip(anomaly_scores, anomalies)):
            if is_anomaly == -1:  # Anomaly detected
                row = features.iloc[i]
                
                # Determine alert type and severity
                alert_type = "inventory_shortage"
                severity = "medium"
                description = f"Unusual inventory pattern detected"
                
                # Check specific conditions
                if row.get('reorder_ratio', 1) < 0.5:
                    alert_type = "inventory_shortage"
                    severity = "high"
                    description = f"Low stock alert: {row.get('product_name', 'Unknown')} below reorder point"
                elif row.get('capacity_utilization', 0) > 0.9:
                    alert_type = "inventory_excess"
                    severity = "medium"
                    description = f"Overstock alert: {row.get('product_name', 'Unknown')} near capacity"
                
                alerts.append({
                    'type': alert_type,
                    'severity': severity,
                    'title': f"Inventory Anomaly: {row.get('product_name', 'Unknown Product')}",
                    'description': description,
                    'anomaly_score': float(score),
                    'metadata': {
                        'product_id': row.get('product_id'),
                        'warehouse_id': row.get('warehouse_id'),
                        'current_quantity': row.get('quantity'),
                        'reorder_point': row.get('reorder_point'),
                        'features': {col: row.get(col) for col in feature_cols}
                    }
                })
        
        return {
            'anomalies_detected': len(alerts),
            'alerts': alerts,
            'anomaly_scores': anomaly_scores.tolist(),
            'total_records': len(df)
        }
    
    def detect_demand_anomalies(self, df: pd.DataFrame) -> Dict:
        """Detect demand pattern anomalies."""
        if 'demand' not in self.models:
            raise ValueError("Demand anomaly detector not trained")
        
        features = self.prepare_demand_features(df)
        feature_cols = self.feature_names['demand']
        
        # Prepare features
        X = features[feature_cols].fillna(0)
        X_scaled = self.scalers['demand'].transform(X)
        
        # Predict anomalies
        anomaly_scores = self.models['demand'].decision_function(X_scaled)
        anomalies = self.models['demand'].predict(X_scaled)
        
        # Generate alerts for anomalies
        alerts = []
        for i, (score, is_anomaly) in enumerate(zip(anomaly_scores, anomalies)):
            if is_anomaly == -1:  # Anomaly detected
                row = features.iloc[i]
                
                # Determine alert type and severity
                alert_type = "demand_spike"
                severity = "medium"
                
                # Check specific conditions
                demand_zscore = row.get('demand_zscore', 0)
                if demand_zscore > 3:
                    alert_type = "demand_spike"
                    severity = "high"
                    description = f"Unusual demand spike detected: {row.get('quantity_sold')} units"
                elif demand_zscore < -3:
                    alert_type = "demand_drop"
                    severity = "medium"
                    description = f"Unusual demand drop detected: {row.get('quantity_sold')} units"
                else:
                    description = f"Irregular demand pattern detected"
                
                alerts.append({
                    'type': alert_type,
                    'severity': severity,
                    'title': f"Demand Anomaly: {row.get('product_name', 'Unknown Product')}",
                    'description': description,
                    'anomaly_score': float(score),
                    'metadata': {
                        'product_id': row.get('product_id'),
                        'date': row.get('date'),
                        'quantity_sold': row.get('quantity_sold'),
                        'demand_zscore': demand_zscore,
                        'features': {col: row.get(col) for col in feature_cols}
                    }
                })
        
        return {
            'anomalies_detected': len(alerts),
            'alerts': alerts,
            'anomaly_scores': anomaly_scores.tolist(),
            'total_records': len(df)
        }
    
    def save_models(self, path: str):
        """Save trained anomaly detection models."""
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'feature_names': self.feature_names,
            'contamination': self.contamination
        }
        joblib.dump(model_data, path)
        print(f"Anomaly detection models saved to {path}")
    
    def load_models(self, path: str):
        """Load trained anomaly detection models."""
        model_data = joblib.load(path)
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.feature_names = model_data['feature_names']
        self.contamination = model_data['contamination']
        print(f"Anomaly detection models loaded from {path}")


def generate_sample_anomalies() -> List[Dict]:
    """Generate sample anomaly alerts for demo purposes."""
    sample_alerts = [
        {
            'type': 'inventory_shortage',
            'severity': 'high',
            'title': 'Critical Stock Alert: Milk Cartons',
            'description': 'Inventory level dropped below safety stock. Only 5 units remaining.',
            'detected_at': datetime.now() - timedelta(hours=2),
            'metadata': {
                'product_id': 1,
                'warehouse_id': 1,
                'current_quantity': 5,
                'reorder_point': 50,
                'recommended_action': 'Immediate reorder required'
            }
        },
        {
            'type': 'demand_spike',
            'severity': 'medium',
            'title': 'Unusual Demand Spike: Organic Yogurt',
            'description': 'Demand increased by 300% compared to historical average.',
            'detected_at': datetime.now() - timedelta(hours=6),
            'metadata': {
                'product_id': 15,
                'expected_demand': 20,
                'actual_demand': 80,
                'spike_percentage': 300
            }
        },
        {
            'type': 'supply_delay',
            'severity': 'medium',
            'title': 'Supplier Delay: Fresh Produce',
            'description': 'Delivery from Supplier ABC is 3 days overdue.',
            'detected_at': datetime.now() - timedelta(days=1),
            'metadata': {
                'supplier_id': 5,
                'expected_delivery': (datetime.now() - timedelta(days=3)).isoformat(),
                'delay_days': 3,
                'affected_products': ['Apples', 'Bananas', 'Carrots']
            }
        }
    ]
    
    return sample_alerts
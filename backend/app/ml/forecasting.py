import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import joblib
import os

class TimeSeriesPreprocessor:
    """Preprocessing pipeline for time series forecasting data."""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.feature_names = []
        
    def create_time_features(self, df: pd.DataFrame, date_col: str) -> pd.DataFrame:
        """Create time-based features from datetime column."""
        df = df.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Extract time features
        df['year'] = df[date_col].dt.year
        df['month'] = df[date_col].dt.month
        df['day'] = df[date_col].dt.day
        df['dayofweek'] = df[date_col].dt.dayofweek
        df['quarter'] = df[date_col].dt.quarter
        df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)
        
        # Cyclical encoding
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        df['day_sin'] = np.sin(2 * np.pi * df['day'] / 31)
        df['day_cos'] = np.cos(2 * np.pi * df['day'] / 31)
        
        return df
    
    def create_lag_features(self, df: pd.DataFrame, value_col: str, lags: List[int]) -> pd.DataFrame:
        """Create lag features for time series."""
        df = df.copy()
        for lag in lags:
            df[f'{value_col}_lag_{lag}'] = df[value_col].shift(lag)
        return df
    
    def create_rolling_features(self, df: pd.DataFrame, value_col: str, windows: List[int]) -> pd.DataFrame:
        """Create rolling window features."""
        df = df.copy()
        for window in windows:
            df[f'{value_col}_rolling_mean_{window}'] = df[value_col].rolling(window=window).mean()
            df[f'{value_col}_rolling_std_{window}'] = df[value_col].rolling(window=window).std()
        return df
    
    def fit_transform(self, df: pd.DataFrame, target_col: str) -> np.ndarray:
        """Fit preprocessor and transform data."""
        df_processed = df.copy()
        
        # Separate numeric and categorical columns
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df_processed.select_dtypes(include=['object']).columns.tolist()
        
        # Remove target from features
        if target_col in numeric_cols:
            numeric_cols.remove(target_col)
        
        # Scale numeric features
        if numeric_cols:
            self.scalers['numeric'] = StandardScaler()
            df_processed[numeric_cols] = self.scalers['numeric'].fit_transform(df_processed[numeric_cols])
        
        # Encode categorical features
        for col in categorical_cols:
            encoder = LabelEncoder()
            df_processed[col] = encoder.fit_transform(df_processed[col].astype(str))
            self.encoders[col] = encoder
        
        # Scale target
        if target_col:
            self.scalers['target'] = StandardScaler()
            df_processed[target_col] = self.scalers['target'].fit_transform(
                df_processed[target_col].values.reshape(-1, 1)
            ).flatten()
        
        self.feature_names = [col for col in df_processed.columns if col != target_col]
        return df_processed
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform new data using fitted preprocessor."""
        df_processed = df.copy()
        
        # Apply same transformations
        numeric_cols = [col for col in df_processed.columns if col in self.scalers.get('numeric', [])]
        if numeric_cols and 'numeric' in self.scalers:
            df_processed[numeric_cols] = self.scalers['numeric'].transform(df_processed[numeric_cols])
        
        # Encode categorical features
        for col, encoder in self.encoders.items():
            if col in df_processed.columns:
                df_processed[col] = encoder.transform(df_processed[col].astype(str))
        
        return df_processed[self.feature_names]
    
    def inverse_transform_target(self, y: np.ndarray) -> np.ndarray:
        """Inverse transform target values."""
        if 'target' in self.scalers:
            return self.scalers['target'].inverse_transform(y.reshape(-1, 1)).flatten()
        return y


class LSTMForecaster(nn.Module):
    """LSTM-based demand forecasting model."""
    
    def __init__(self, input_size: int, hidden_size: int = 64, num_layers: int = 2, 
                 output_size: int = 1, dropout: float = 0.2):
        super(LSTMForecaster, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        lstm_out, _ = self.lstm(x)
        
        # Take the last output
        out = lstm_out[:, -1, :]
        out = self.dropout(out)
        out = self.fc(out)
        
        return out


class DemandForecaster:
    """Complete demand forecasting pipeline."""
    
    def __init__(self, sequence_length: int = 30, hidden_size: int = 64, 
                 num_layers: int = 2, learning_rate: float = 0.001):
        self.sequence_length = sequence_length
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.learning_rate = learning_rate
        
        self.preprocessor = TimeSeriesPreprocessor()
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def prepare_sequences(self, data: np.ndarray, target: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Create sequences for LSTM training."""
        X, y = [], []
        
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:(i + self.sequence_length)])
            y.append(target[i + self.sequence_length])
        
        return np.array(X), np.array(y)
    
    def train(self, df: pd.DataFrame, target_col: str = 'quantity_sold', 
              epochs: int = 100, batch_size: int = 32, validation_split: float = 0.2):
        """Train the forecasting model."""
        
        # Preprocess data
        df_processed = self.preprocessor.fit_transform(df, target_col)
        
        # Prepare features and target
        feature_cols = [col for col in df_processed.columns if col != target_col]
        X = df_processed[feature_cols].values
        y = df_processed[target_col].values
        
        # Create sequences
        X_seq, y_seq = self.prepare_sequences(X, y)
        
        # Train-validation split
        X_train, X_val, y_train, y_val = train_test_split(
            X_seq, y_seq, test_size=validation_split, random_state=42
        )
        
        # Convert to tensors
        X_train = torch.FloatTensor(X_train).to(self.device)
        y_train = torch.FloatTensor(y_train).to(self.device)
        X_val = torch.FloatTensor(X_val).to(self.device)
        y_val = torch.FloatTensor(y_val).to(self.device)
        
        # Initialize model
        input_size = X_train.shape[2]
        self.model = LSTMForecaster(
            input_size=input_size,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers
        ).to(self.device)
        
        # Training setup
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=self.learning_rate)
        
        # Training loop
        train_losses = []
        val_losses = []
        
        for epoch in range(epochs):
            # Training
            self.model.train()
            train_loss = 0
            
            for i in range(0, len(X_train), batch_size):
                batch_X = X_train[i:i+batch_size]
                batch_y = y_train[i:i+batch_size]
                
                optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = criterion(outputs.squeeze(), batch_y)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item()
            
            # Validation
            self.model.eval()
            with torch.no_grad():
                val_outputs = self.model(X_val)
                val_loss = criterion(val_outputs.squeeze(), y_val).item()
            
            train_losses.append(train_loss / len(X_train) * batch_size)
            val_losses.append(val_loss)
            
            if epoch % 10 == 0:
                print(f'Epoch {epoch}/{epochs}, Train Loss: {train_losses[-1]:.4f}, Val Loss: {val_losses[-1]:.4f}')
        
        return train_losses, val_losses
    
    def predict(self, df: pd.DataFrame, horizon: int = 30) -> Tuple[np.ndarray, np.ndarray]:
        """Generate forecasts with confidence intervals."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Transform data
        X = self.preprocessor.transform(df)
        
        # Use last sequence for prediction
        if len(X) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} data points for prediction")
        
        last_sequence = X[-self.sequence_length:].reshape(1, self.sequence_length, -1)
        last_sequence = torch.FloatTensor(last_sequence).to(self.device)
        
        self.model.eval()
        predictions = []
        
        with torch.no_grad():
            for _ in range(horizon):
                pred = self.model(last_sequence)
                predictions.append(pred.cpu().numpy().flatten()[0])
                
                # Update sequence for next prediction
                # This is simplified - in practice, you'd want to update with actual features
                new_point = last_sequence[:, -1:, :].clone()
                new_point[:, 0, 0] = pred  # Update with prediction
                last_sequence = torch.cat([last_sequence[:, 1:, :], new_point], dim=1)
        
        predictions = np.array(predictions)
        
        # Inverse transform predictions
        predictions = self.preprocessor.inverse_transform_target(predictions)
        
        # Simple confidence intervals (normally distributed around prediction)
        confidence_intervals = np.column_stack([
            predictions - 1.96 * np.std(predictions),
            predictions + 1.96 * np.std(predictions)
        ])
        
        return predictions, confidence_intervals
    
    def save_model(self, path: str):
        """Save trained model and preprocessor."""
        if self.model is None:
            raise ValueError("No model to save")
        
        checkpoint = {
            'model_state_dict': self.model.state_dict(),
            'preprocessor': self.preprocessor,
            'sequence_length': self.sequence_length,
            'hidden_size': self.hidden_size,
            'num_layers': self.num_layers,
            'input_size': self.model.lstm.input_size
        }
        
        torch.save(checkpoint, path)
        print(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load trained model and preprocessor."""
        checkpoint = torch.load(path, map_location=self.device)
        
        self.preprocessor = checkpoint['preprocessor']
        self.sequence_length = checkpoint['sequence_length']
        self.hidden_size = checkpoint['hidden_size']
        self.num_layers = checkpoint['num_layers']
        
        input_size = checkpoint['input_size']
        self.model = LSTMForecaster(
            input_size=input_size,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers
        ).to(self.device)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
        print(f"Model loaded from {path}")


def evaluate_forecast(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate forecasting metrics."""
    mae = np.mean(np.abs(y_true - y_pred))
    mse = np.mean((y_true - y_pred) ** 2)
    rmse = np.sqrt(mse)
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100
    
    return {
        'MAE': mae,
        'MSE': mse,
        'RMSE': rmse,
        'MAPE': mape
    }
#!/usr/bin/env python3
"""
External API Data Connectors
Connects to external APIs to fetch real-time supply chain relevant data.
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

class FREDConnector:
    """Federal Reserve Economic Data API connector."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('FRED_API_KEY')
        self.base_url = "https://api.stlouisfed.org/fred"
        
    def get_series(self, series_id, limit=1000):
        """Fetch economic data series."""
        if not self.api_key:
            raise ValueError("FRED API key required")
        
        url = f"{self.base_url}/series/observations"
        params = {
            'series_id': series_id,
            'api_key': self.api_key,
            'file_type': 'json',
            'limit': limit
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    
    def fetch_supply_chain_indicators(self):
        """Fetch key economic indicators relevant to supply chains."""
        indicators = {
            'GDP': 'GDPC1',                    # Real GDP
            'Industrial_Production': 'INDPRO',  # Industrial Production Index
            'Consumer_Price_Index': 'CPIAUCSL', # CPI for All Urban Consumers
            'Producer_Price_Index': 'PPIACO',   # Producer Price Index
            'Unemployment_Rate': 'UNRATE',      # Unemployment Rate
            'Consumer_Confidence': 'UMCSENT',   # Consumer Sentiment
            'Oil_Price': 'DCOILWTICO',         # WTI Crude Oil Prices
            'Exchange_Rate_EUR': 'DEXUSEU',     # USD/EUR Exchange Rate
            'Manufacturing_PMI': 'NAPM',       # Manufacturing PMI
            'Retail_Sales': 'RSAFS'            # Retail Sales
        }
        
        economic_data = {}
        
        for name, series_id in indicators.items():
            try:
                print(f"📡 Fetching {name} data...")
                data = self.get_series(series_id)
                economic_data[name] = data['observations']
                print(f"✅ Downloaded {len(data['observations'])} observations for {name}")
            except Exception as e:
                print(f"❌ Failed to fetch {name}: {e}")
                economic_data[name] = []
        
        return economic_data

class OpenWeatherConnector:
    """OpenWeatherMap API connector for weather data affecting supply chains."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('OPENWEATHER_API_KEY')
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    def get_weather_for_cities(self, cities):
        """Get current weather for multiple cities."""
        if not self.api_key:
            raise ValueError("OpenWeather API key required")
        
        weather_data = []
        
        for city in cities:
            try:
                url = f"{self.base_url}/weather"
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric'
                }
                
                response = requests.get(url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                weather_data.append({
                    'city': city,
                    'timestamp': datetime.now().isoformat(),
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'weather_condition': data['weather'][0]['main'],
                    'weather_description': data['weather'][0]['description'],
                    'wind_speed': data['wind'].get('speed', 0),
                    'clouds': data['clouds']['all']
                })
                
                print(f"✅ Weather data for {city}: {data['weather'][0]['description']}")
                
            except Exception as e:
                print(f"❌ Failed to fetch weather for {city}: {e}")
        
        return weather_data

class AlphaVantageConnector:
    """Alpha Vantage API connector for financial and commodity data."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('ALPHA_VANTAGE_API_KEY')
        self.base_url = "https://www.alphavantage.co/query"
        
    def get_commodity_prices(self):
        """Fetch commodity prices relevant to supply chains."""
        if not self.api_key:
            raise ValueError("Alpha Vantage API key required")
        
        commodities = ['CRUDE_OIL_WTI', 'NATURAL_GAS', 'COPPER', 'ALUMINUM']
        commodity_data = {}
        
        for commodity in commodities:
            try:
                params = {
                    'function': commodity,
                    'apikey': self.api_key,
                    'datatype': 'json'
                }
                
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                commodity_data[commodity] = data
                print(f"✅ Downloaded {commodity} price data")
                
                # Rate limiting - Alpha Vantage has strict limits
                import time
                time.sleep(12)  # 5 calls per minute limit
                
            except Exception as e:
                print(f"❌ Failed to fetch {commodity}: {e}")
        
        return commodity_data

class WorldBankConnector:
    """World Bank API connector for global economic indicators."""
    
    def __init__(self):
        self.base_url = "https://api.worldbank.org/v2"
        
    def get_global_indicators(self, countries=['US', 'CN', 'DE', 'JP', 'GB'], indicators=['NY.GDP.MKTP.CD']):
        """Fetch global economic indicators."""
        global_data = {}
        
        for country in countries:
            country_data = {}
            
            for indicator in indicators:
                try:
                    url = f"{self.base_url}/country/{country}/indicator/{indicator}"
                    params = {
                        'format': 'json',
                        'per_page': 50,
                        'date': '2010:2023'
                    }
                    
                    response = requests.get(url, params=params, timeout=30)
                    response.raise_for_status()
                    data = response.json()
                    
                    if len(data) > 1:  # First element is metadata
                        country_data[indicator] = data[1]
                        print(f"✅ Downloaded {indicator} for {country}")
                    
                except Exception as e:
                    print(f"❌ Failed to fetch {indicator} for {country}: {e}")
            
            global_data[country] = country_data
        
        return global_data

def save_api_data():
    """Fetch and save data from all available APIs."""
    print("🌐 Starting API data collection...\n")
    
    # Create data directories
    os.makedirs('data/external/api', exist_ok=True)
    
    all_data = {}
    
    # FRED Economic Data
    try:
        print("📊 Fetching FRED Economic Data...")
        fred = FREDConnector()
        economic_data = fred.fetch_supply_chain_indicators()
        all_data['fred_economic'] = economic_data
        
        with open('data/external/api/fred_economic.json', 'w') as f:
            json.dump(economic_data, f, indent=2)
        print("✅ FRED data saved\n")
        
    except Exception as e:
        print(f"❌ FRED data collection failed: {e}\n")
    
    # Weather Data for major supply chain hubs
    try:
        print("🌤️ Fetching Weather Data...")
        weather = OpenWeatherConnector()
        major_cities = [
            'New York,US', 'Los Angeles,US', 'Chicago,US', 'Houston,US',
            'Shanghai,CN', 'London,GB', 'Tokyo,JP', 'Frankfurt,DE',
            'Singapore,SG', 'Dubai,AE', 'Mumbai,IN', 'São Paulo,BR'
        ]
        weather_data = weather.get_weather_for_cities(major_cities)
        all_data['weather'] = weather_data
        
        with open('data/external/api/weather_data.json', 'w') as f:
            json.dump(weather_data, f, indent=2)
        print("✅ Weather data saved\n")
        
    except Exception as e:
        print(f"❌ Weather data collection failed: {e}\n")
    
    # Commodity Prices
    try:
        print("💰 Fetching Commodity Prices...")
        alpha_vantage = AlphaVantageConnector()
        commodity_data = alpha_vantage.get_commodity_prices()
        all_data['commodities'] = commodity_data
        
        with open('data/external/api/commodity_prices.json', 'w') as f:
            json.dump(commodity_data, f, indent=2)
        print("✅ Commodity data saved\n")
        
    except Exception as e:
        print(f"❌ Commodity data collection failed: {e}\n")
    
    # World Bank Global Data
    try:
        print("🌍 Fetching World Bank Data...")
        wb = WorldBankConnector()
        global_indicators = [
            'NY.GDP.MKTP.CD',    # GDP
            'SL.UEM.TOTL.ZS',    # Unemployment
            'FP.CPI.TOTL.ZG',    # Inflation
            'NE.TRD.GNFS.ZS'     # Trade as % of GDP
        ]
        global_data = wb.get_global_indicators(indicators=global_indicators)
        all_data['world_bank'] = global_data
        
        with open('data/external/api/world_bank_data.json', 'w') as f:
            json.dump(global_data, f, indent=2)
        print("✅ World Bank data saved\n")
        
    except Exception as e:
        print(f"❌ World Bank data collection failed: {e}\n")
    
    # Save summary
    summary = {
        'collection_timestamp': datetime.now().isoformat(),
        'data_sources': list(all_data.keys()),
        'status': 'completed'
    }
    
    with open('data/external/api/collection_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("✅ API data collection completed!")
    return all_data

if __name__ == "__main__":
    save_api_data()
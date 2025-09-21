#!/usr/bin/env python3
"""
Kaggle Dataset Downloader
Downloads specific supply chain datasets from Kaggle using the Kaggle API.
"""

import os
import sys
import json
import zipfile
import shutil
from pathlib import Path

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

def setup_kaggle_api():
    """Setup and validate Kaggle API credentials."""
    try:
        import kaggle
        from kaggle.api.kaggle_api_extended import KaggleApi
        
        api = KaggleApi()
        api.authenticate()
        
        print("✅ Kaggle API authenticated successfully")
        return api
        
    except ImportError:
        print("❌ Kaggle package not installed. Install with: pip install kaggle")
        return None
    except Exception as e:
        print(f"❌ Kaggle API authentication failed: {e}")
        print("💡 Make sure you have:")
        print("   1. Created a Kaggle account")
        print("   2. Generated API token from https://www.kaggle.com/account")
        print("   3. Placed kaggle.json in ~/.kaggle/ or set KAGGLE_USERNAME/KAGGLE_KEY")
        return None

def download_kaggle_dataset(api, dataset_name, output_dir, extract=True):
    """Download a specific Kaggle dataset."""
    try:
        print(f"📥 Downloading {dataset_name}...")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Download dataset
        api.dataset_download_files(
            dataset_name,
            path=output_dir,
            unzip=extract
        )
        
        # If not extracted, extract manually
        if not extract:
            zip_file = os.path.join(output_dir, f"{dataset_name.split('/')[-1]}.zip")
            if os.path.exists(zip_file):
                with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                    zip_ref.extractall(output_dir)
                os.remove(zip_file)
        
        print(f"✅ Downloaded {dataset_name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {dataset_name}: {e}")
        return False

def download_supply_chain_datasets():
    """Download curated supply chain datasets from Kaggle."""
    print("🔽 Starting Kaggle dataset downloads...\n")
    
    # Setup Kaggle API
    api = setup_kaggle_api()
    if not api:
        return False
    
    # Create base directory
    base_dir = 'data/external/kaggle'
    os.makedirs(base_dir, exist_ok=True)
    
    # Curated list of supply chain relevant datasets
    datasets = {
        'store-sales-time-series-forecasting': {
            'name': 'c/store-sales-time-series-forecasting',
            'description': 'Store Sales Time Series Forecasting (3.7M records)',
            'dir': 'store-sales'
        },
        'online-retail-dataset': {
            'name': 'vijayuv/onlineretail',
            'description': 'Online Retail Dataset (500K transactions)',
            'dir': 'online-retail'
        },
        'supply-chain-data': {
            'name': 'laurinbrechter/supply-chain-data',
            'description': 'DataCo Supply Chain Dataset (100K orders)',
            'dir': 'dataco-supply-chain'
        },
        'walmart-sales-forecasting': {
            'name': 'm5-forecasting-accuracy',
            'description': 'Walmart M5 Forecasting Competition',
            'dir': 'walmart-m5'
        },
        'retail-demand-forecasting': {
            'name': 'chakradharmattapalli/retail-demand-forecasting',
            'description': 'Retail Demand Forecasting Dataset',
            'dir': 'retail-demand'
        },
        'supply-chain-shipment': {
            'name': 'divyeshardeshana/supply-chain-shipment-pricing-data',
            'description': 'Supply Chain Shipment Pricing Data',
            'dir': 'shipment-pricing'
        },
        'fashion-mnist': {
            'name': 'zalando-research/fashionmnist',
            'description': 'Fashion MNIST for product classification',
            'dir': 'fashion-mnist'
        },
        'supermarket-sales': {
            'name': 'aungpyaeap/supermarket-sales',
            'description': 'Supermarket Sales Dataset',
            'dir': 'supermarket-sales'
        }
    }
    
    downloaded_datasets = []
    failed_datasets = []
    
    for dataset_id, info in datasets.items():
        output_dir = os.path.join(base_dir, info['dir'])
        
        print(f"📦 {info['description']}")
        success = download_kaggle_dataset(api, info['name'], output_dir)
        
        if success:
            downloaded_datasets.append({
                'id': dataset_id,
                'name': info['name'],
                'description': info['description'],
                'local_path': output_dir,
                'files': os.listdir(output_dir) if os.path.exists(output_dir) else []
            })
        else:
            failed_datasets.append(dataset_id)
        
        print()  # Empty line for readability
    
    # Save download summary
    summary = {
        'download_timestamp': datetime.now().isoformat(),
        'total_datasets': len(datasets),
        'downloaded_successfully': len(downloaded_datasets),
        'failed_downloads': len(failed_datasets),
        'downloaded_datasets': downloaded_datasets,
        'failed_datasets': failed_datasets
    }
    
    with open(os.path.join(base_dir, 'download_summary.json'), 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("📊 Download Summary:")
    print(f"✅ Successfully downloaded: {len(downloaded_datasets)}")
    print(f"❌ Failed downloads: {len(failed_datasets)}")
    
    if failed_datasets:
        print(f"Failed datasets: {', '.join(failed_datasets)}")
    
    return len(downloaded_datasets) > 0

def list_dataset_contents():
    """List contents of downloaded datasets."""
    kaggle_dir = 'data/external/kaggle'
    
    if not os.path.exists(kaggle_dir):
        print("No Kaggle datasets found")
        return
    
    print("📁 Downloaded Kaggle Datasets:")
    print("=" * 50)
    
    for item in os.listdir(kaggle_dir):
        dataset_path = os.path.join(kaggle_dir, item)
        
        if os.path.isdir(dataset_path):
            print(f"\n📦 {item.upper()}")
            files = os.listdir(dataset_path)
            
            for file in files[:5]:  # Show first 5 files
                file_path = os.path.join(dataset_path, file)
                size = os.path.getsize(file_path) / (1024 * 1024)  # Size in MB
                print(f"   📄 {file} ({size:.1f} MB)")
            
            if len(files) > 5:
                print(f"   ... and {len(files) - 5} more files")

if __name__ == "__main__":
    from datetime import datetime
    
    # Download datasets
    success = download_supply_chain_datasets()
    
    if success:
        print("\n" + "="*50)
        list_dataset_contents()
        print("\n✅ Kaggle dataset download completed!")
    else:
        print("\n❌ Kaggle dataset download failed!")
        print("💡 Make sure you have Kaggle API configured correctly")
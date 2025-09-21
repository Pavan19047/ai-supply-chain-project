#!/usr/bin/env python3
"""
Script to create a demo user for testing the application.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User
from app.schemas import UserCreate
from app.services.auth import create_user

def create_demo_user():
    """Create a demo user for testing."""
    db: Session = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "admin@supply.com").first()
        if existing_user:
            print("Demo user already exists!")
            return existing_user
        
        # Create demo user
        user_data = UserCreate(
            email="admin@supply.com",
            password="admin123",
            full_name="Admin User",
            role="admin"
        )
        
        demo_user = create_user(db, user_data)
        print(f"Demo user created successfully!")
        print(f"Email: {demo_user.email}")
        print(f"Role: {demo_user.role}")
        print(f"Full Name: {demo_user.full_name}")
        
        return demo_user
        
    except Exception as e:
        print(f"Error creating demo user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user()
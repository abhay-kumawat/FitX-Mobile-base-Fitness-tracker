import os
from sqlalchemy import create_engine
from backend.core.config import settings
from backend.models.analytics import RawAnalyticsEvent, DailyAggregate, WeeklyAggregate, MonthlyAggregate, MetricExplanation
import backend.models.models # Import to register existing tables with Base
from backend.core.database import Base

def create_tables():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    
    print("Creating all missing tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Connect to PostgreSQL on port 12345
engine = None
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )
    # Test connection
    with engine.connect() as conn:
        logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Checking fallback configuration...")
    if settings.DB_FALLBACK_SQLITE:
        logger.info("Using SQLite fallback database.")
        engine = create_engine(
            "sqlite:///./benefit_govt.db",
            connect_args={"check_same_thread": False}
        )
    else:
        # Re-initialize PostgreSQL engine for subsequent retries
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

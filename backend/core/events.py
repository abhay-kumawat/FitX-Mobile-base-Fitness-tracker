import logging
from backend.core.database import engine, Base
import backend.models.models  # Register all models with Base.metadata

logger = logging.getLogger("fitx.events")

def startup_event_handler():
    logger.info("Initializing FitX AI database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("FitX AI system startup complete.")

def shutdown_event_handler():
    logger.info("Shutting down FitX AI services.")

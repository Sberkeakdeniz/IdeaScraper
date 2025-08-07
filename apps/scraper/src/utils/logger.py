import logging
import sys
from datetime import datetime
import os

def setup_logger(log_level: str = 'INFO'):
    """Setup logging configuration."""
    
    # Create logs directory if it doesn't exist
    logs_dir = 'logs'
    os.makedirs(logs_dir, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler
            logging.FileHandler(
                os.path.join(logs_dir, f'scraper_{datetime.now().strftime("%Y%m%d")}.log')
            )
        ]
    )
    
    # Set specific loggers to appropriate levels
    logging.getLogger('praw').setLevel(logging.WARNING)
    logging.getLogger('prawcore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('openai').setLevel(logging.WARNING)
    logging.getLogger('asyncpg').setLevel(logging.WARNING)
    
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized with level: {log_level}")
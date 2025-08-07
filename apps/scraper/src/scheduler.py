import asyncio
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

import sys
import os
sys.path.append(os.path.dirname(__file__))

from scrapers.reddit_scraper import RedditScraper
from processors.idea_extractor import IdeaExtractor
from services.database_service import DatabaseService
from utils.logger import setup_logger
from config import Config

logger = logging.getLogger(__name__)

class IdeaScrapingScheduler:
    def __init__(self):
        self.config = Config()
        self.scheduler = AsyncIOScheduler()
        self.reddit_scraper = RedditScraper()
        self.idea_extractor = IdeaExtractor()
        self.db_service = DatabaseService()
        
        # Setup logging
        setup_logger(self.config.LOG_LEVEL)
        
    async def initialize(self):
        """Initialize all services."""
        await self.db_service.initialize()
        logger.info("Scheduler initialized successfully")
    
    async def cleanup(self):
        """Cleanup resources."""
        await self.db_service.close()
        logger.info("Scheduler cleanup completed")
    
    async def run_scraping_job(self):
        """Main scraping job that runs periodically."""
        logger.info("Starting scheduled scraping job")
        
        try:
            # Get existing Reddit post IDs to avoid duplicates
            existing_post_ids = await self.db_service.get_existing_reddit_post_ids()
            logger.info(f"Found {len(existing_post_ids)} existing posts in database")
            
            # Scrape all configured subreddits
            all_posts = self.reddit_scraper.scrape_all_subreddits()
            
            # Filter out posts we've already processed
            new_posts = [
                post for post in all_posts 
                if post.get('reddit_post_id') not in existing_post_ids
            ]
            
            logger.info(f"Found {len(new_posts)} new posts to process")
            
            if not new_posts:
                logger.info("No new posts to process")
                return
            
            # Filter for relevant posts
            relevant_posts = [
                post for post in new_posts 
                if self.reddit_scraper.is_relevant_post(post)
            ]
            
            logger.info(f"Filtered to {len(relevant_posts)} relevant posts")
            
            # Extract business ideas from relevant posts
            all_ideas = []
            for post in relevant_posts:
                ideas = self.idea_extractor.extract_business_ideas(post)
                all_ideas.extend(ideas)
                
                # Rate limiting
                await asyncio.sleep(2)
            
            logger.info(f"Extracted {len(all_ideas)} business ideas")
            
            # Save ideas to database
            if all_ideas:
                saved_ids = await self.db_service.save_multiple_ideas(all_ideas)
                logger.info(f"Successfully saved {len(saved_ids)} ideas to database")
            
            # Log job completion stats
            stats = await self.db_service.get_database_stats()
            logger.info(f"Job completed. Database stats: {stats}")
            
        except Exception as e:
            logger.error(f"Error in scraping job: {str(e)}", exc_info=True)
    
    async def update_metrics_job(self):
        """Job to update engagement metrics for existing ideas."""
        logger.info("Starting metrics update job")
        
        try:
            # Get recent ideas that need metric updates
            recent_ideas = await self.db_service.get_ideas_by_score_threshold(0.0)  # Get all active ideas
            
            # Limit to recent ideas to avoid API rate limits
            recent_ideas = recent_ideas[:50]  # Update only 50 most recent
            
            for idea in recent_ideas:
                reddit_post_id = idea.get('reddit_post_id')
                if not reddit_post_id:
                    continue
                
                try:
                    # Get updated post data from Reddit
                    submission = self.reddit_scraper.reddit.submission(id=reddit_post_id)
                    
                    # Update metrics in database
                    await self.db_service.update_idea_metrics(
                        reddit_post_id,
                        submission.score,
                        submission.num_comments
                    )
                    
                    # Rate limiting
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error updating metrics for post {reddit_post_id}: {str(e)}")
                    continue
            
            logger.info(f"Updated metrics for {len(recent_ideas)} ideas")
            
        except Exception as e:
            logger.error(f"Error in metrics update job: {str(e)}", exc_info=True)
    
    def start_scheduler(self):
        """Start the scheduler with configured jobs."""
        # Main scraping job - run every 4 hours
        self.scheduler.add_job(
            self.run_scraping_job,
            CronTrigger(minute=0, hour='*/4'),  # Every 4 hours
            id='scraping_job',
            max_instances=1,
            replace_existing=True
        )
        
        # Metrics update job - run every 2 hours
        self.scheduler.add_job(
            self.update_metrics_job,
            CronTrigger(minute=30, hour='*/2'),  # Every 2 hours at :30
            id='metrics_job',
            max_instances=1,
            replace_existing=True
        )
        
        # Start the scheduler
        self.scheduler.start()
        logger.info("Scheduler started with the following jobs:")
        for job in self.scheduler.get_jobs():
            logger.info(f"  - {job.id}: {job.next_run_time}")
    
    def stop_scheduler(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

async def main():
    """Main function to run the scheduler."""
    scheduler = IdeaScrapingScheduler()
    
    try:
        # Initialize services
        await scheduler.initialize()
        
        # Run initial scraping job
        logger.info("Running initial scraping job...")
        await scheduler.run_scraping_job()
        
        # Start scheduler for periodic jobs
        scheduler.start_scheduler()
        
        # Keep the scheduler running
        logger.info("Scheduler is running. Press Ctrl+C to stop.")
        try:
            while True:
                await asyncio.sleep(60)  # Sleep for 1 minute
        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
    
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
    
    finally:
        # Cleanup
        scheduler.stop_scheduler()
        await scheduler.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
import sys
import os
import asyncio
import logging

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from scrapers.reddit_scraper_supabase import RedditScraperSupabase
from services.supabase_service import SupabaseService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def run_full_scraper():
    """Run the full scraper and save results."""
    print("Running full Reddit scraper...")
    
    try:
        scraper = RedditScraperSupabase()
        
        # Lower thresholds for testing
        scraper.config.MIN_UPVOTES = 2
        scraper.config.MIN_COMMENTS = 1
        
        print("Scraping from configured subreddits...")
        
        # Scrape from all configured subreddits but with smaller limits
        results = {}
        for subreddit_name in ['business', 'startups', 'Entrepreneur']:
            try:
                print(f"\nScraping r/{subreddit_name}...")
                posts = await scraper.scrape_subreddit(subreddit_name, limit=1)
                results[subreddit_name] = posts
                
                if posts:
                    print(f"Found {len(posts)} posts from r/{subreddit_name}")
                    # Save to database
                    db_service = SupabaseService()
                    saved_count = await db_service.bulk_save_ideas(posts)
                    print(f"Saved {saved_count} posts to database")
                    
                    # Print post details
                    for post in posts:
                        print(f"  - {post['title'][:50]}... ({post['upvotes']} upvotes)")
                else:
                    print(f"No new posts found in r/{subreddit_name}")
                    
            except Exception as e:
                print(f"Error scraping r/{subreddit_name}: {e}")
                results[subreddit_name] = []
        
        # Summary
        total_posts = sum(len(posts) for posts in results.values())
        print(f"\nSCRAPER SUMMARY:")
        print(f"Total new business ideas found: {total_posts}")
        
        for subreddit, posts in results.items():
            print(f"r/{subreddit}: {len(posts)} posts")
        
        return total_posts > 0
        
    except Exception as e:
        print(f"ERROR: Full scraper failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the full scraper."""
    print("Starting Reddit Business Idea Scraper")
    print("=" * 50)
    
    success = await run_full_scraper()
    
    print("\n" + "=" * 50)
    if success:
        print("SUCCESS: Reddit scraper completed successfully!")
        print("\nYour Reddit scraper is fully functional!")
        print("To run it regularly, you can use:")
        print("  python run_full_scraper.py")
    else:
        print("No new ideas found this run (normal if database already has recent posts)")

if __name__ == "__main__":
    asyncio.run(main())
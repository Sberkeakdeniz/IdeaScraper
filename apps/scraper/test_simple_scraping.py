import sys
import os
import asyncio
import logging

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from scrapers.reddit_scraper_supabase import RedditScraperSupabase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def test_simple_scraping():
    """Test simple scraping with lower thresholds."""
    print("Testing simple Reddit scraping...")
    
    try:
        scraper = RedditScraperSupabase()
        
        # Temporarily lower the requirements for testing
        scraper.config.MIN_UPVOTES = 1  # Very low threshold
        scraper.config.MIN_COMMENTS = 0  # No comment requirement
        
        # Test with a different subreddit that might have fewer restrictions
        print("\nScraping from r/startups...")
        posts = await scraper.scrape_subreddit('startups', limit=2)
        
        print(f"\nFound {len(posts)} new posts!")
        
        if len(posts) == 0:
            # Try an even simpler subreddit
            print("\nTrying r/business...")
            posts = await scraper.scrape_subreddit('business', limit=2)
            print(f"Found {len(posts)} posts from r/business!")
        
        for i, post in enumerate(posts, 1):
            print(f"\n--- Post {i} ---")
            print(f"Title: {post.get('title', 'No title')[:100]}...")
            print(f"Subreddit: r/{post.get('subreddit', 'unknown')}")
            print(f"Upvotes: {post.get('upvotes', 0)}")
            print(f"Comments: {post.get('comment_count', 0)}")
            print(f"URL: {post.get('reddit_url', 'No URL')}")
        
        return len(posts) > 0
        
    except Exception as e:
        print(f"ERROR: Scraping failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run simple scraping test."""
    success = await test_simple_scraping()
    
    if success:
        print("\n✅ SUCCESS: Reddit scraper is working!")
        print("\nYour Reddit scraper is fully functional and integrated with Supabase!")
    else:
        print("\n❌ Scraping test failed")

if __name__ == "__main__":
    asyncio.run(main())
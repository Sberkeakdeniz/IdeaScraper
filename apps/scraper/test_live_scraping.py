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

async def test_live_scraping():
    """Test live scraping from a subreddit."""
    print("Starting live Reddit scraping test...")
    
    try:
        scraper = RedditScraperSupabase()
        
        # Test scraping from r/Entrepreneur (should have lots of business ideas)
        print("\nScraping business ideas from r/Entrepreneur...")
        posts = await scraper.scrape_subreddit('Entrepreneur', limit=3)
        
        print(f"\nFound {len(posts)} business ideas!")
        
        for i, post in enumerate(posts, 1):
            print(f"\n--- Business Idea {i} ---")
            print(f"Title: {post.get('title', 'No title')}")
            print(f"Subreddit: r/{post.get('subreddit', 'unknown')}")
            print(f"Upvotes: {post.get('upvotes', 0)}")
            print(f"Comments: {post.get('comment_count', 0)}")
            print(f"URL: {post.get('reddit_url', 'No URL')}")
            print(f"Description (first 200 chars): {post.get('description', 'No description')[:200]}...")
        
        if posts:
            print(f"\nSUCCESS: Scraped {len(posts)} business ideas and saved them to Supabase!")
        else:
            print("\nNo new ideas found (they might already exist in database)")
            
        return len(posts) > 0
        
    except Exception as e:
        print(f"ERROR: Live scraping failed: {e}")
        return False

async def main():
    """Run live scraping test."""
    success = await test_live_scraping()
    
    if success:
        print("\nThe Reddit scraper is working perfectly!")
        print("You can now run the full scraper with:")
        print("python src/scheduler.py")
    else:
        print("\nScraping test failed. Please check the logs above.")

if __name__ == "__main__":
    asyncio.run(main())
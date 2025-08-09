import sys
import os
import asyncio
import logging

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.supabase_service import SupabaseService
from scrapers.reddit_scraper_supabase import RedditScraperSupabase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def test_supabase_connection():
    """Test Supabase connection."""
    print("Testing Supabase connection...")
    try:
        db_service = SupabaseService()
        success = db_service.test_connection()
        if success:
            print("SUCCESS: Supabase connection successful!")
            
            # Test getting recent ideas
            recent_ideas = await db_service.get_recent_ideas(limit=5)
            print(f"Found {len(recent_ideas)} recent ideas in database")
            
            return True
        else:
            print("FAILED: Supabase connection failed")
            return False
    except Exception as e:
        print(f"ERROR: Supabase connection error: {e}")
        return False

async def test_reddit_credentials():
    """Test Reddit API credentials."""
    print("\n🔄 Testing Reddit API credentials...")
    try:
        from config import Config
        
        if not Config.REDDIT_CLIENT_ID or Config.REDDIT_CLIENT_ID == "your-reddit-client-id":
            print("❌ Reddit credentials not configured")
            print("Please update REDDIT_CLIENT_ID in .env file")
            return False
        
        if not Config.REDDIT_CLIENT_SECRET or Config.REDDIT_CLIENT_SECRET == "your-reddit-client-secret":
            print("❌ Reddit credentials not configured")
            print("Please update REDDIT_CLIENT_SECRET in .env file")
            return False
        
        scraper = RedditScraperSupabase()
        success = scraper.test_reddit_connection()
        
        if success:
            print("✅ Reddit API connection successful!")
            return True
        else:
            print("❌ Reddit API connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Reddit API connection error: {e}")
        return False

async def test_scraper_functionality():
    """Test basic scraper functionality."""
    print("\n🔄 Testing scraper functionality...")
    try:
        scraper = RedditScraperSupabase()
        
        # Try to scrape a few posts from a test subreddit
        print("Attempting to scrape a few posts from r/test...")
        posts = await scraper.scrape_subreddit('test', limit=2)
        
        if posts:
            print(f"✅ Successfully scraped {len(posts)} posts!")
            for i, post in enumerate(posts[:2], 1):
                print(f"  {i}. {post.get('title', 'No title')[:50]}...")
        else:
            print("⚠️ No posts scraped (this might be normal)")
        
        return True
        
    except Exception as e:
        print(f"❌ Scraper functionality error: {e}")
        return False

async def main():
    """Run all tests."""
    print("🚀 Starting Reddit Scraper Tests\n")
    
    # Test Supabase connection
    supabase_ok = await test_supabase_connection()
    
    # Test Reddit credentials
    reddit_ok = await test_reddit_credentials()
    
    # Test scraper functionality (only if both above pass)
    scraper_ok = False
    if supabase_ok and reddit_ok:
        scraper_ok = await test_scraper_functionality()
    
    # Summary
    print("\n" + "="*50)
    print("📋 TEST SUMMARY")
    print("="*50)
    print(f"Supabase Connection: {'✅ PASS' if supabase_ok else '❌ FAIL'}")
    print(f"Reddit API: {'✅ PASS' if reddit_ok else '❌ FAIL'}")
    print(f"Scraper Functionality: {'✅ PASS' if scraper_ok else '❌ FAIL'}")
    
    if supabase_ok and reddit_ok and scraper_ok:
        print("\n🎉 All tests passed! The scraper is ready to use.")
    else:
        print(f"\n⚠️ Some tests failed. Please check the configuration.")
        
        if not reddit_ok:
            print("\n📝 To fix Reddit API issues:")
            print("1. Go to https://www.reddit.com/prefs/apps")
            print("2. Create a new app (script type)")
            print("3. Update REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env file")

if __name__ == "__main__":
    asyncio.run(main())
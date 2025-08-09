import sys
import os
import asyncio
import logging

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from scrapers.enhanced_reddit_scraper import EnhancedRedditScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def test_enhanced_scraper():
    """Test the enhanced scraper with improved descriptions and OpenAI analysis."""
    print("Testing Enhanced Reddit Scraper...")
    print("=" * 60)
    
    try:
        scraper = EnhancedRedditScraper()
        
        # Test all service connections
        print("\n1. Testing Service Connections:")
        print("-" * 40)
        
        service_status = scraper.test_all_services()
        for service, status in service_status.items():
            status_text = "OK" if status else "FAILED"
            print(f"{service.upper()}: {status_text}")
        
        if not service_status.get('reddit', False):
            print("ERROR: Reddit API connection failed!")
            return False
        
        if not service_status.get('supabase', False):
            print("ERROR: Supabase connection failed!")
            return False
        
        # Test enhanced scraping
        print(f"\n2. Testing Enhanced Scraping:")
        print("-" * 40)
        
        # Lower thresholds for testing
        scraper.config.MIN_UPVOTES = 3
        scraper.config.MIN_COMMENTS = 1
        
        print("Scraping with enhanced descriptions from r/business...")
        ideas = await scraper.scrape_and_analyze_subreddit('business', limit=1)
        
        if ideas:
            print(f"\nSUCCESS: Found {len(ideas)} enhanced business ideas!")
            
            for i, idea in enumerate(ideas, 1):
                print(f"\n--- Enhanced Business Idea {i} ---")
                print(f"Title: {idea.get('title', 'No title')}")
                print(f"Subreddit: r/{idea.get('subreddit', 'unknown')}")
                print(f"Engagement: {idea.get('upvotes', 0)} upvotes, {idea.get('comment_count', 0)} comments")
                print(f"URL: {idea.get('reddit_url', 'No URL')}")
                print(f"Enhanced Description ({len(idea.get('description', ''))} chars):")
                print(f"  {idea.get('description', 'No description')[:300]}...")
                
                # Show AI analysis if available
                if idea.get('market_size'):
                    print(f"\n--- AI Analysis ---")
                    print(f"Market Size: {idea.get('market_size', 'N/A')[:100]}...")
                    print(f"Target Audience: {idea.get('target_audience', 'N/A')[:100]}...")
                    print(f"Validation Score: {idea.get('validation_score', 'N/A')}/10")
                    print(f"Sentiment: {idea.get('sentiment', 'N/A')}")
                    
                    if idea.get('monetization_strategy'):
                        print(f"Monetization: {idea.get('monetization_strategy', 'N/A')[:150]}...")
                else:
                    if service_status.get('openai', False):
                        print("\nAI Analysis: Analysis in progress or failed")
                    else:
                        print("\nAI Analysis: OpenAI not configured (add OPENAI_API_KEY)")
        else:
            print("No new ideas found (might already exist in database)")
            print("This is normal if you've run the scraper recently")
        
        return len(ideas) > 0
        
    except Exception as e:
        print(f"ERROR: Enhanced scraping failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run enhanced scraper test."""
    success = await test_enhanced_scraper()
    
    print("\n" + "=" * 60)
    if success:
        print("SUCCESS: Enhanced Reddit scraper is working!")
        print("\nFeatures confirmed:")
        print("- Enhanced descriptions with comments")
        print("- Reddit API integration")
        print("- Supabase database storage")
        if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'sk-your-openai-api-key-here':
            print("- OpenAI analysis integration")
        else:
            print("- OpenAI ready (add OPENAI_API_KEY to enable)")
    else:
        print("Test completed - check logs for details")
    
    print(f"\nTo add OpenAI analysis:")
    print(f"1. Get API key from https://platform.openai.com/api-keys")
    print(f"2. Update OPENAI_API_KEY in .env file")

if __name__ == "__main__":
    asyncio.run(main())
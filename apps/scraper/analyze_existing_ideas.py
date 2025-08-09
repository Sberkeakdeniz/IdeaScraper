import sys
import os
import asyncio
import logging

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.supabase_service import SupabaseService
from services.openai_service import OpenAIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def analyze_existing_ideas():
    """Analyze existing business ideas in the database with AI."""
    print("Analyzing Existing Business Ideas with AI...")
    print("=" * 60)
    
    try:
        # Initialize services
        db_service = SupabaseService()
        ai_service = OpenAIService()
        
        # Get ideas that need analysis (where analysis fields are null)
        print("Fetching ideas that need analysis...")
        ideas = await db_service.get_ideas_for_analysis(limit=5)
        
        if not ideas:
            print("No ideas found that need analysis.")
            # Get recent ideas to analyze anyway
            print("Getting recent ideas to re-analyze...")
            ideas = await db_service.get_recent_ideas(limit=3)
        
        print(f"Found {len(ideas)} ideas to analyze")
        
        analyzed_count = 0
        
        for i, idea in enumerate(ideas, 1):
            try:
                print(f"\n--- Analyzing Idea {i}/{len(ideas)} ---")
                title = idea.get('title', '')[:60]
                print(f"Title: {title}...")
                
                # Prepare idea data for analysis
                idea_data = {
                    'title': idea.get('title', ''),
                    'description': idea.get('description', ''),
                    'subreddit': idea.get('subreddit', ''),
                    'upvotes': idea.get('upvotes', 0),
                    'comment_count': idea.get('comment_count', 0)
                }
                
                print("Sending to OpenAI for analysis...")
                analysis = await ai_service.analyze_business_idea(idea_data)
                
                if analysis:
                    print("SUCCESS: AI analysis completed!")
                    print(f"Market Size: {analysis.get('market_size', 'N/A')[:80]}...")
                    print(f"Target Audience: {analysis.get('target_audience', 'N/A')[:80]}...")
                    print(f"Validation Score: {analysis.get('validation_score', 'N/A')}/10")
                    print(f"Sentiment: {analysis.get('sentiment', 'N/A')}")
                    
                    # Update the database with analysis
                    print("Saving analysis to database...")
                    success = await db_service.update_idea_analysis(idea['id'], analysis)
                    
                    if success:
                        print("SUCCESS: Analysis saved to database!")
                        analyzed_count += 1
                    else:
                        print("WARNING: Failed to save analysis to database")
                else:
                    print("WARNING: AI analysis returned empty result")
                    
                # Small delay to be nice to the API
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"ERROR analyzing idea {i}: {e}")
                continue
        
        print(f"\n" + "=" * 60)
        print(f"ANALYSIS COMPLETE")
        print(f"Successfully analyzed: {analyzed_count}/{len(ideas)} ideas")
        print(f"Check your database - the fields should now be populated!")
        
        return analyzed_count > 0
        
    except Exception as e:
        print(f"ERROR: Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    success = await analyze_existing_ideas()
    
    if success:
        print("\nAI analysis completed! Check your Supabase database.")
        print("The following fields should now be populated:")
        print("- market_size")
        print("- target_audience")
        print("- monetization_strategy")
        print("- competitor_analysis")
        print("- validation_score")
        print("- sentiment")
    else:
        print("\nAnalysis failed or no ideas were processed.")

if __name__ == "__main__":
    asyncio.run(main())
import sys
import os
import asyncio

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.openai_service import OpenAIService

async def test_openai():
    """Test OpenAI service specifically."""
    print("Testing OpenAI Integration...")
    print("=" * 50)
    
    try:
        print("\n1. Initializing OpenAI service...")
        ai_service = OpenAIService()
        print("✅ OpenAI service initialized successfully")
        
        print("\n2. Testing OpenAI connection...")
        success = ai_service.test_connection()
        if success:
            print("✅ OpenAI connection successful")
        else:
            print("❌ OpenAI connection failed")
            return False
            
        print("\n3. Testing business idea analysis...")
        test_idea = {
            'title': 'AI-Powered Business Analytics Tool',
            'description': 'A SaaS platform that uses AI to analyze business data and provide insights for small businesses. Users upload their sales data, customer information, and financial records, and the AI generates reports and recommendations.',
            'subreddit': 'entrepreneur',
            'upvotes': 45,
            'comment_count': 12
        }
        
        print("Analyzing test business idea...")
        analysis = await ai_service.analyze_business_idea(test_idea)
        
        if analysis:
            print("✅ AI Analysis successful!")
            print(f"\n--- AI Analysis Results ---")
            print(f"Market Size: {analysis.get('market_size', 'N/A')[:100]}...")
            print(f"Target Audience: {analysis.get('target_audience', 'N/A')[:100]}...")
            print(f"Monetization Strategy: {analysis.get('monetization_strategy', 'N/A')[:150]}...")
            print(f"Validation Score: {analysis.get('validation_score', 'N/A')}/10")
            print(f"Sentiment: {analysis.get('sentiment', 'N/A')}")
            
            if analysis.get('implementation_plan'):
                print(f"Implementation Plan: {analysis.get('implementation_plan', 'N/A')[:100]}...")
                
            return True
        else:
            print("❌ AI Analysis failed")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    success = await test_openai()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 SUCCESS: OpenAI integration is working!")
        print("The AI will now analyze business ideas and populate:")
        print("- market_size")
        print("- target_audience") 
        print("- monetization_strategy")
        print("- competitor_analysis")
        print("- validation_score")
        print("- sentiment")
    else:
        print("❌ OpenAI integration failed - check API key and connection")

if __name__ == "__main__":
    asyncio.run(main())
import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_openai():
    try:
        print("Testing OpenAI integration...")
        
        # Import OpenAI service
        import sys
        sys.path.append('apps/scraper/src')
        from services.openai_service import OpenAIService
        
        # Initialize service
        openai_service = OpenAIService()
        print("OpenAI service initialized successfully")
        
        # Test simple analysis
        test_text = "This is a test business idea about AI-powered recipe suggestions."
        result = await openai_service.analyze_business_idea(test_text)
        
        print("Analysis completed successfully")
        print("Market size:", result.get('market_size', 'N/A'))
        print("Validation score:", result.get('validation_score', 'N/A'))
        
        return True
    except Exception as e:
        print(f"OpenAI test failed: {str(e)}")
        return False

async def main():
    success = await test_openai()
    if success:
        print("SUCCESS: OpenAI integration is working!")
    else:
        print("FAILED: OpenAI integration has issues")

if __name__ == "__main__":
    asyncio.run(main())
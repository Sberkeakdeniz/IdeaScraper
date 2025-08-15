import sys
import os
import asyncio

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from openai import OpenAI
    print("OpenAI imported successfully")
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('OPENAI_API_KEY')
    print(f"API Key loaded: {'YES' if api_key and len(api_key) > 10 else 'NO'}")
    
    if api_key and len(api_key) > 10:
        print("Initializing OpenAI client...")
        client = OpenAI(api_key=api_key)
        print("SUCCESS: OpenAI client initialized")
        
        print("Testing API call...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, this is a test. Please respond with 'OpenAI is working!'"}],
            max_tokens=20
        )
        
        result = response.choices[0].message.content
        print(f"API Response: {result}")
        print("SUCCESS: OpenAI API is working!")
        
    else:
        print("ERROR: No valid OpenAI API key found")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
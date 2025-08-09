import os
import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.api_key or self.api_key == "sk-your-openai-api-key-here":
            raise ValueError("Missing OpenAI API key. Check OPENAI_API_KEY in .env file.")
        
        self.client = OpenAI(
            api_key=self.api_key
        )
        logger.info("OpenAI service initialized")
    
    async def analyze_business_idea(self, idea_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a business idea and generate strategies, plans, and monetization."""
        try:
            title = idea_data.get('title', '')
            description = idea_data.get('description', '')
            subreddit = idea_data.get('subreddit', '')
            upvotes = idea_data.get('upvotes', 0)
            comment_count = idea_data.get('comment_count', 0)
            
            # Create comprehensive analysis prompt
            prompt = self._create_analysis_prompt(title, description, subreddit, upvotes, comment_count)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a business analyst and entrepreneur expert. Analyze business ideas and provide strategic insights."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            # Parse the response
            analysis_text = response.choices[0].message.content
            parsed_analysis = self._parse_analysis_response(analysis_text)
            
            logger.info(f"Successfully analyzed business idea: {title[:50]}...")
            return parsed_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing business idea with OpenAI: {e}")
            return {}
    
    def _create_analysis_prompt(self, title: str, description: str, subreddit: str, upvotes: int, comment_count: int) -> str:
        """Create a comprehensive analysis prompt for OpenAI."""
        prompt = f"""
Analyze this business idea found on Reddit and provide strategic insights:

**Business Idea:**
Title: {title}
Description: {description}
Source: r/{subreddit}
Community Engagement: {upvotes} upvotes, {comment_count} comments

**Please provide a comprehensive analysis in the following format:**

**MARKET_SIZE:**
[Estimate the market size and potential in 2-3 sentences]

**TARGET_AUDIENCE:**
[Identify the primary target audience and their characteristics in 2-3 sentences]

**MONETIZATION_STRATEGY:**
[Suggest 3-4 specific ways to monetize this business idea]

**COMPETITOR_ANALYSIS:**
[Identify potential competitors and market positioning in 2-3 sentences]

**VALIDATION_SCORE:**
[Rate the business idea viability from 1-10 with brief reasoning]

**SENTIMENT:**
[Classify as: Very Positive, Positive, Neutral, Negative, or Very Negative]

**IMPLEMENTATION_PLAN:**
[Provide 4-5 key steps to implement this business idea]

**CHALLENGES:**
[List 3-4 main challenges and how to overcome them]

Please be specific, actionable, and realistic in your analysis.
        """
        return prompt.strip()
    
    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the OpenAI response into structured data."""
        try:
            analysis = {}
            
            # Split response into sections
            sections = response_text.split('**')
            
            for i in range(1, len(sections), 2):
                if i + 1 < len(sections):
                    section_name = sections[i].strip().lower().replace(':', '')
                    section_content = sections[i + 1].strip()
                    
                    if section_name == 'market_size':
                        analysis['market_size'] = section_content[:500]
                    elif section_name == 'target_audience':
                        analysis['target_audience'] = section_content[:500]
                    elif section_name == 'monetization_strategy':
                        analysis['monetization_strategy'] = section_content[:800]
                    elif section_name == 'competitor_analysis':
                        analysis['competitor_analysis'] = section_content[:500]
                    elif section_name == 'validation_score':
                        # Extract numeric score
                        score_text = section_content
                        import re
                        score_match = re.search(r'(\d+(?:\.\d+)?)', score_text)
                        if score_match:
                            analysis['validation_score'] = float(score_match.group(1))
                        else:
                            analysis['validation_score'] = 5.0  # Default
                    elif section_name == 'sentiment':
                        sentiment = section_content.lower()
                        if 'very positive' in sentiment:
                            analysis['sentiment'] = 'Very Positive'
                        elif 'positive' in sentiment:
                            analysis['sentiment'] = 'Positive'
                        elif 'negative' in sentiment:
                            analysis['sentiment'] = 'Negative'
                        elif 'very negative' in sentiment:
                            analysis['sentiment'] = 'Very Negative'
                        else:
                            analysis['sentiment'] = 'Neutral'
                    elif section_name == 'implementation_plan':
                        analysis['implementation_plan'] = section_content[:800]
                    elif section_name == 'challenges':
                        analysis['challenges'] = section_content[:600]
            
            # Set defaults for missing fields
            analysis.setdefault('market_size', 'Market size analysis not available')
            analysis.setdefault('target_audience', 'Target audience analysis not available')
            analysis.setdefault('monetization_strategy', 'Monetization strategies not available')
            analysis.setdefault('competitor_analysis', 'Competitor analysis not available')
            analysis.setdefault('validation_score', 5.0)
            analysis.setdefault('sentiment', 'Neutral')
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error parsing OpenAI response: {e}")
            return {
                'market_size': 'Analysis failed',
                'target_audience': 'Analysis failed',
                'monetization_strategy': 'Analysis failed',
                'competitor_analysis': 'Analysis failed',
                'validation_score': 5.0,
                'sentiment': 'Neutral'
            }
    
    def test_connection(self) -> bool:
        """Test the OpenAI API connection."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello, this is a test."}],
                max_tokens=10
            )
            logger.info("OpenAI API connection test successful")
            return True
        except Exception as e:
            logger.error(f"OpenAI API connection test failed: {e}")
            return False
    
    async def quick_sentiment_analysis(self, text: str) -> str:
        """Quick sentiment analysis for a business idea."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a sentiment analyst. Classify business ideas as: Very Positive, Positive, Neutral, Negative, or Very Negative."},
                    {"role": "user", "content": f"Analyze the sentiment of this business idea: {text[:500]}"}
                ],
                max_tokens=50,
                temperature=0.3
            )
            
            sentiment = response.choices[0].message.content.strip()
            return sentiment if sentiment in ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'] else 'Neutral'
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return 'Neutral'
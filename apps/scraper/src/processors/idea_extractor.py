from openai import OpenAI
import json
import logging
from typing import List, Dict, Any, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import Config

logger = logging.getLogger(__name__)

class IdeaExtractor:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.config = Config()
    
    def extract_business_ideas(self, post_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract business ideas from a Reddit post using OpenAI."""
        try:
            prompt = self._build_extraction_prompt(post_data)
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.3
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                ideas_data = json.loads(content)
                return self._process_extracted_ideas(ideas_data, post_data)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON response: {content}")
                return []
                
        except Exception as e:
            logger.error(f"Error extracting ideas from post {post_data.get('reddit_post_id')}: {str(e)}")
            return []
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for idea extraction."""
        return """You are an expert business analyst specializing in identifying market opportunities from online discussions. 

        Your task is to analyze Reddit posts and comments to extract potential business ideas that solve real problems or address market gaps.

        Focus on:
        1. Pain points people are experiencing
        2. Problems that could be solved with software/services
        3. Inefficiencies in current solutions
        4. Market gaps or unmet needs
        5. Opportunities suitable for solopreneurs

        For each opportunity, provide:
        - A clear, concise title
        - A detailed description of the problem and solution
        - Market potential (1-5 scale)
        - Technical difficulty (1-5 scale)
        - Competition level (1-5 scale)
        - Suitable industry tags
        - Target audience

        Return your analysis as a JSON object with an "ideas" array."""
    
    IDEA_EXTRACTION_PROMPT = """
Analyze this Reddit post and comments for potential business opportunities.
Look for:
1. Pain points people are experiencing
2. Problems that could be solved with software/services
3. Inefficiencies in current solutions
4. Market gaps or unmet needs

Rate each opportunity on:
- Market potential (1-5)
- Technical difficulty (1-5)
- Competition level (1-5)
- Solopreneur suitability (1-5)

Return structured JSON with extracted opportunities.
"""

    def _build_extraction_prompt(self, post_data: Dict[str, Any]) -> str:
        """Build the extraction prompt for a specific post."""
        title = post_data.get('title', '')
        content = post_data.get('selftext', '')
        subreddit = post_data.get('subreddit', '')
        comments = post_data.get('comments', [])
        
        # Include top comments for context
        comments_text = ""
        if comments:
            comments_text = "\n\nTop Comments:\n"
            for i, comment in enumerate(comments[:3], 1):
                comments_text += f"{i}. {comment.get('body', '')[:200]}...\n"
        
        prompt = f"""
        Analyze this Reddit post from r/{subreddit} for potential business opportunities:

        **Title:** {title}

        **Content:** {content}
        {comments_text}

        **Instructions:**
        - Extract 1-3 distinct business ideas that address problems mentioned in the post
        - Only include ideas that solve real problems with clear market demand
        - Focus on opportunities suitable for solopreneurs or small teams
        - Rate each idea on market potential, difficulty, and competition (1-5 scale)
        - Provide relevant industry tags

        **Response Format (JSON):**
        {{
          "ideas": [
            {{
              "title": "Concise idea title",
              "description": "Detailed description of the problem and proposed solution",
              "market_potential": 4,
              "technical_difficulty": 3,
              "competition_level": 2,
              "industry_tags": ["SaaS", "Productivity"],
              "target_audience": "Description of target users",
              "problem_statement": "Clear statement of the problem being solved",
              "solution_approach": "High-level approach to solving the problem"
            }}
          ]
        }}

        Only return valid JSON. If no viable business ideas can be extracted, return {{"ideas": []}}.
        """
        
        return prompt
    
    def _process_extracted_ideas(self, ideas_data: Dict[str, Any], post_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process and enrich extracted ideas with additional metadata."""
        processed_ideas = []
        
        for idea in ideas_data.get('ideas', []):
            if not self._is_valid_idea(idea):
                continue
                
            # Calculate overall score
            market_potential = idea.get('market_potential', 3)
            technical_difficulty = idea.get('technical_difficulty', 3)
            competition_level = idea.get('competition_level', 3)
            
            # Weight the scores (lower difficulty and competition is better)
            overall_score = (
                market_potential * 0.4 + 
                (6 - technical_difficulty) * 0.3 + 
                (6 - competition_level) * 0.3
            )
            
            processed_idea = {
                'title': idea.get('title', ''),
                'description': idea.get('description', ''),
                'problem_statement': idea.get('problem_statement', ''),
                'solution_approach': idea.get('solution_approach', ''),
                'target_audience': idea.get('target_audience', ''),
                'industry_tags': idea.get('industry_tags', []),
                'market_potential_score': market_potential,
                'difficulty_score': technical_difficulty,
                'competition_score': competition_level,
                'overall_score': round(overall_score, 2),
                'source_url': post_data.get('permalink', ''),
                'source_subreddit': post_data.get('subreddit', ''),
                'reddit_post_id': post_data.get('reddit_post_id', ''),
                'upvotes': post_data.get('score', 0),
                'comments_count': post_data.get('num_comments', 0),
                'extracted_at': post_data.get('created_utc', 0),
            }
            
            processed_ideas.append(processed_idea)
        
        return processed_ideas
    
    def _is_valid_idea(self, idea: Dict[str, Any]) -> bool:
        """Validate that an extracted idea has required fields and quality."""
        required_fields = ['title', 'description', 'market_potential', 'technical_difficulty']
        
        # Check required fields
        for field in required_fields:
            if not idea.get(field):
                return False
        
        # Check minimum quality thresholds
        if len(idea.get('title', '')) < 10:
            return False
            
        if len(idea.get('description', '')) < 50:
            return False
        
        # Check score ranges
        for score_field in ['market_potential', 'technical_difficulty', 'competition_level']:
            score = idea.get(score_field, 0)
            if not isinstance(score, (int, float)) or score < 1 or score > 5:
                return False
        
        return True
    
    def batch_extract_ideas(self, posts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract ideas from multiple posts."""
        all_ideas = []
        
        for post_data in posts_data:
            logger.info(f"Extracting ideas from post: {post_data.get('reddit_post_id')}")
            ideas = self.extract_business_ideas(post_data)
            all_ideas.extend(ideas)
            
            # Rate limiting for OpenAI API
            import time
            time.sleep(1)
        
        logger.info(f"Extracted {len(all_ideas)} business ideas from {len(posts_data)} posts")
        return all_ideas
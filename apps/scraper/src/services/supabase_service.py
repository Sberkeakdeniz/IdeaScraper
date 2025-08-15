import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
import uuid
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("Connected to Supabase")
    
    async def save_business_idea(self, idea_data: Dict[str, Any]) -> str:
        """Save a business idea to Supabase and return the ID."""
        try:
            # Prepare data for insertion
            idea_record = {
                'title': idea_data.get('title'),
                'description': idea_data.get('description'),
                'reddit_url': idea_data.get('reddit_url'),
                'subreddit': idea_data.get('subreddit'),
                'upvotes': idea_data.get('upvotes', 0),
                'comment_count': idea_data.get('comment_count', 0),
                'market_size': idea_data.get('market_size'),
                'target_audience': idea_data.get('target_audience'),
                'monetization_strategy': idea_data.get('monetization_strategy'),
                'competitor_analysis': idea_data.get('competitor_analysis'),
                'validation_score': idea_data.get('validation_score'),
                'sentiment': idea_data.get('sentiment'),
            }
            
            # Insert into Supabase
            result = self.client.table('business_ideas').insert(idea_record).execute()
            
            if result.data:
                idea_id = result.data[0]['id']
                logger.info(f"Saved business idea: {idea_id}")
                return idea_id
            else:
                logger.error("Failed to save business idea - no data returned")
                return None
                
        except Exception as e:
            if "duplicate key value" in str(e).lower():
                logger.warning(f"Duplicate Reddit URL, skipping: {idea_data.get('reddit_url')}")
                return None
            else:
                logger.error(f"Error saving business idea: {e}")
                raise
    
    async def idea_exists(self, reddit_url: str) -> bool:
        """Check if a business idea with the given Reddit URL already exists."""
        try:
            result = self.client.table('business_ideas').select('id').eq('reddit_url', reddit_url).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking if idea exists: {e}")
            return False
    
    async def get_recent_ideas(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent business ideas from the database."""
        try:
            result = self.client.table('business_ideas').select('*').order('created_at', desc=True).limit(limit).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching recent ideas: {e}")
            return []
    
    async def update_idea_analysis(self, idea_id: str, analysis_data: Dict[str, Any]) -> bool:
        """Update a business idea with AI analysis results."""
        try:
            update_data = {}
            
            if 'market_size' in analysis_data:
                update_data['market_size'] = analysis_data['market_size']
            if 'target_audience' in analysis_data:
                update_data['target_audience'] = analysis_data['target_audience']
            if 'monetization_strategy' in analysis_data:
                update_data['monetization_strategy'] = analysis_data['monetization_strategy']
            if 'competitor_analysis' in analysis_data:
                update_data['competitor_analysis'] = analysis_data['competitor_analysis']
            if 'validation_score' in analysis_data:
                update_data['validation_score'] = analysis_data['validation_score']
            if 'sentiment' in analysis_data:
                update_data['sentiment'] = analysis_data['sentiment']
            
            if update_data:
                update_data['updated_at'] = datetime.utcnow().isoformat()
                result = self.client.table('business_ideas').update(update_data).eq('id', idea_id).execute()
                
                if result.data:
                    logger.info(f"Updated analysis for idea: {idea_id}")
                    return True
                else:
                    logger.warning(f"No idea found with ID: {idea_id}")
                    return False
            else:
                logger.warning("No analysis data provided for update")
                return False
                
        except Exception as e:
            logger.error(f"Error updating idea analysis: {e}")
            return False
    
    async def check_idea_exists(self, reddit_url: str) -> bool:
        """Check if a business idea with the given Reddit URL already exists."""
        try:
            result = self.client.table('business_ideas').select('id').eq('reddit_url', reddit_url).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking if idea exists: {e}")
            return False
    
    async def get_ideas_for_analysis(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get ideas that need AI analysis (missing analysis fields)."""
        try:
            result = self.client.table('business_ideas').select('*').is_('validation_score', 'null').limit(limit).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching ideas for analysis: {e}")
            return []
    
    async def bulk_save_ideas(self, ideas_list: List[Dict[str, Any]]) -> int:
        """Save multiple business ideas at once. Returns count of successfully saved ideas."""
        saved_count = 0
        
        for idea_data in ideas_list:
            try:
                idea_id = await self.save_business_idea(idea_data)
                if idea_id:
                    saved_count += 1
            except Exception as e:
                logger.error(f"Error in bulk save for idea {idea_data.get('reddit_url', 'unknown')}: {e}")
                continue
        
        logger.info(f"Bulk saved {saved_count} out of {len(ideas_list)} ideas")
        return saved_count
    
    def test_connection(self) -> bool:
        """Test the connection to Supabase."""
        try:
            result = self.client.table('business_ideas').select('id').limit(1).execute()
            logger.info("Supabase connection test successful")
            return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False
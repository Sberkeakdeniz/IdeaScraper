import asyncpg
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import Config

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.config = Config()
        self.pool = None
    
    async def initialize(self):
        """Initialize database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                self.config.DATABASE_URL,
                max_size=20,
                min_size=5
            )
            logger.info("Database connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise
    
    async def close(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def save_business_idea(self, idea_data: Dict[str, Any]) -> Optional[str]:
        """Save a business idea to the database."""
        try:
            async with self.pool.acquire() as connection:
                # Check if idea already exists
                existing_id = await self._check_existing_idea(connection, idea_data)
                if existing_id:
                    logger.info(f"Idea already exists with ID: {existing_id}")
                    return existing_id
                
                # Insert new idea
                insert_query = """
                    INSERT INTO business_ideas (
                        title, description, source_url, source_subreddit, reddit_post_id,
                        industry_tags, difficulty_score, market_potential_score, 
                        competition_score, overall_score, upvotes, comments_count,
                        created_at, processed_at, is_active
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                    ) RETURNING id
                """
                
                idea_id = await connection.fetchval(
                    insert_query,
                    idea_data.get('title'),
                    idea_data.get('description'),
                    idea_data.get('source_url'),
                    idea_data.get('source_subreddit'),
                    idea_data.get('reddit_post_id'),
                    idea_data.get('industry_tags', []),
                    idea_data.get('difficulty_score'),
                    idea_data.get('market_potential_score'),
                    idea_data.get('competition_score'),
                    idea_data.get('overall_score'),
                    idea_data.get('upvotes', 0),
                    idea_data.get('comments_count', 0),
                    datetime.fromtimestamp(idea_data.get('extracted_at', 0)) if idea_data.get('extracted_at') else datetime.now(),
                    datetime.now(),
                    True
                )
                
                logger.info(f"Saved business idea with ID: {idea_id}")
                return idea_id
                
        except Exception as e:
            logger.error(f"Error saving business idea: {str(e)}")
            return None
    
    async def _check_existing_idea(self, connection, idea_data: Dict[str, Any]) -> Optional[str]:
        """Check if a similar idea already exists."""
        query = """
            SELECT id FROM business_ideas 
            WHERE reddit_post_id = $1 AND title = $2
            LIMIT 1
        """
        
        return await connection.fetchval(
            query,
            idea_data.get('reddit_post_id'),
            idea_data.get('title')
        )
    
    async def save_multiple_ideas(self, ideas_data: List[Dict[str, Any]]) -> List[str]:
        """Save multiple business ideas to the database."""
        saved_ids = []
        
        for idea_data in ideas_data:
            idea_id = await self.save_business_idea(idea_data)
            if idea_id:
                saved_ids.append(idea_id)
        
        logger.info(f"Saved {len(saved_ids)} out of {len(ideas_data)} ideas to database")
        return saved_ids
    
    async def get_existing_reddit_post_ids(self) -> List[str]:
        """Get list of Reddit post IDs that have already been processed."""
        try:
            async with self.pool.acquire() as connection:
                query = "SELECT DISTINCT reddit_post_id FROM business_ideas WHERE reddit_post_id IS NOT NULL"
                rows = await connection.fetch(query)
                return [row['reddit_post_id'] for row in rows]
        except Exception as e:
            logger.error(f"Error fetching existing Reddit post IDs: {str(e)}")
            return []
    
    async def update_idea_metrics(self, reddit_post_id: str, upvotes: int, comments_count: int):
        """Update engagement metrics for an existing idea."""
        try:
            async with self.pool.acquire() as connection:
                query = """
                    UPDATE business_ideas 
                    SET upvotes = $2, comments_count = $3, updated_at = NOW()
                    WHERE reddit_post_id = $1
                """
                
                result = await connection.execute(query, reddit_post_id, upvotes, comments_count)
                logger.info(f"Updated metrics for Reddit post {reddit_post_id}")
                
        except Exception as e:
            logger.error(f"Error updating idea metrics: {str(e)}")
    
    async def get_ideas_by_score_threshold(self, min_score: float = 3.0) -> List[Dict[str, Any]]:
        """Get business ideas above a certain score threshold."""
        try:
            async with self.pool.acquire() as connection:
                query = """
                    SELECT * FROM business_ideas 
                    WHERE overall_score >= $1 AND is_active = true
                    ORDER BY overall_score DESC, created_at DESC
                """
                
                rows = await connection.fetch(query, min_score)
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error fetching ideas by score: {str(e)}")
            return []
    
    async def mark_ideas_inactive(self, idea_ids: List[str]):
        """Mark ideas as inactive (soft delete)."""
        try:
            async with self.pool.acquire() as connection:
                query = """
                    UPDATE business_ideas 
                    SET is_active = false, updated_at = NOW()
                    WHERE id = ANY($1)
                """
                
                await connection.execute(query, idea_ids)
                logger.info(f"Marked {len(idea_ids)} ideas as inactive")
                
        except Exception as e:
            logger.error(f"Error marking ideas inactive: {str(e)}")
    
    async def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            async with self.pool.acquire() as connection:
                stats = {}
                
                # Total ideas
                stats['total_ideas'] = await connection.fetchval(
                    "SELECT COUNT(*) FROM business_ideas WHERE is_active = true"
                )
                
                # Ideas by subreddit
                subreddit_stats = await connection.fetch("""
                    SELECT source_subreddit, COUNT(*) as count 
                    FROM business_ideas 
                    WHERE is_active = true AND source_subreddit IS NOT NULL
                    GROUP BY source_subreddit 
                    ORDER BY count DESC
                """)
                stats['by_subreddit'] = {row['source_subreddit']: row['count'] for row in subreddit_stats}
                
                # Average scores
                avg_scores = await connection.fetchrow("""
                    SELECT 
                        AVG(overall_score) as avg_overall,
                        AVG(market_potential_score) as avg_market,
                        AVG(difficulty_score) as avg_difficulty,
                        AVG(competition_score) as avg_competition
                    FROM business_ideas 
                    WHERE is_active = true
                """)
                stats['average_scores'] = dict(avg_scores) if avg_scores else {}
                
                # Ideas added in last 24 hours
                stats['recent_ideas'] = await connection.fetchval("""
                    SELECT COUNT(*) FROM business_ideas 
                    WHERE created_at >= NOW() - INTERVAL '24 hours' AND is_active = true
                """)
                
                return stats
                
        except Exception as e:
            logger.error(f"Error fetching database stats: {str(e)}")
            return {}
import praw
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
import time
import re
import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import Config
from services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)

class RedditScraperSupabase:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT
        )
        self.config = Config()
        self.db_service = SupabaseService()
        
    async def scrape_subreddit(self, subreddit_name: str, limit: int = None) -> List[Dict[str, Any]]:
        """Scrape posts from a specific subreddit based on configuration."""
        if limit is None:
            limit = self.config.MAX_POSTS_PER_SUBREDDIT
            
        subreddit_config = self.config.TARGET_SUBREDDITS.get(subreddit_name, {})
        keywords = subreddit_config.get('keywords', [])
        min_upvotes = subreddit_config.get('min_upvotes', self.config.MIN_UPVOTES)
        min_comments = subreddit_config.get('min_comments', self.config.MIN_COMMENTS)
        
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts_data = []
            
            logger.info(f"Starting to scrape r/{subreddit_name}")
            
            # Get hot posts from the subreddit
            processed_count = 0
            for submission in subreddit.hot(limit=limit * 2):  # Get more to filter
                if processed_count >= limit:
                    break
                    
                # Skip stickied posts
                if submission.stickied:
                    continue
                    
                # Check if post meets minimum criteria
                if submission.score < min_upvotes or submission.num_comments < min_comments:
                    continue
                    
                # Check if post contains relevant keywords
                if keywords and not self._contains_keywords(submission.title + ' ' + submission.selftext, keywords):
                    continue
                
                # Check if we already have this post
                reddit_url = f"https://reddit.com{submission.permalink}"
                if await self.db_service.idea_exists(reddit_url):
                    logger.info(f"Skipping existing post: {submission.title[:50]}...")
                    continue
                
                # Extract post data
                post_data = self._extract_post_data(submission, subreddit_name)
                if post_data:
                    posts_data.append(post_data)
                    processed_count += 1
                    logger.info(f"Extracted post: {submission.title[:50]}...")
                
                # Rate limiting
                time.sleep(60 / self.config.REQUESTS_PER_MINUTE)
            
            logger.info(f"Scraped {len(posts_data)} posts from r/{subreddit_name}")
            return posts_data
            
        except Exception as e:
            logger.error(f"Error scraping subreddit {subreddit_name}: {str(e)}")
            return []
    
    def _extract_post_data(self, submission, subreddit_name: str) -> Dict[str, Any]:
        """Extract relevant data from a Reddit submission."""
        try:
            # Clean and validate title and content
            title = self._clean_text(submission.title)
            
            # Get full description including comments for more context
            description = ""
            if submission.selftext:
                description = self._clean_text(submission.selftext)
            else:
                # If no self text, use title as description
                description = title
            
            # Get top comments for additional context (but limit length)
            try:
                submission.comments.replace_more(limit=0)  # Don't expand "more comments"
                top_comments = []
                for comment in submission.comments[:3]:  # Get top 3 comments
                    if hasattr(comment, 'body') and len(comment.body) > 20:
                        clean_comment = self._clean_text(comment.body)
                        if clean_comment and len(clean_comment) > 20:
                            top_comments.append(clean_comment[:200])  # Limit comment length
                
                # Add top comments to description if available
                if top_comments and len(description) < 300:
                    description += "\n\nTop discussion points:\n" + "\n".join(f"- {comment}" for comment in top_comments[:2])
                    
            except Exception as e:
                logger.debug(f"Could not fetch comments for post: {e}")
            
            if not title or len(title) < 10:
                logger.debug(f"Skipping post with invalid title: {title}")
                return None
            
            # Extract post data
            post_data = {
                'title': title[:500],  # Limit title length
                'description': description[:2000],  # Limit description length
                'reddit_url': f"https://reddit.com{submission.permalink}",
                'subreddit': subreddit_name,
                'upvotes': submission.score,
                'comment_count': submission.num_comments,
                'reddit_post_id': submission.id,
                'extracted_at': datetime.utcnow().timestamp(),
                'author': str(submission.author) if submission.author else '[deleted]',
                'created_utc': datetime.fromtimestamp(submission.created_utc),
            }
            
            return post_data
            
        except Exception as e:
            logger.error(f"Error extracting post data: {str(e)}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        if not text:
            return ""
        
        # Remove markdown formatting
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
        text = re.sub(r'~~(.*?)~~', r'\1', text)      # Strikethrough
        
        # Remove Reddit-specific formatting
        text = re.sub(r'/u/\w+', '', text)            # User mentions
        text = re.sub(r'/r/\w+', '', text)            # Subreddit mentions
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # Links
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text
    
    def _contains_keywords(self, text: str, keywords: List[str]) -> bool:
        """Check if text contains any of the specified keywords."""
        if not keywords:
            return True
        
        text_lower = text.lower()
        for keyword in keywords:
            if keyword.lower() in text_lower:
                return True
        return False
    
    async def scrape_all_subreddits(self) -> Dict[str, List[Dict[str, Any]]]:
        """Scrape all configured subreddits."""
        results = {}
        total_posts = 0
        
        logger.info(f"Starting to scrape {len(self.config.TARGET_SUBREDDITS)} subreddits")
        
        for subreddit_name in self.config.TARGET_SUBREDDITS.keys():
            try:
                logger.info(f"Scraping r/{subreddit_name}")
                posts = await self.scrape_subreddit(subreddit_name)
                results[subreddit_name] = posts
                total_posts += len(posts)
                
                # Save posts to database immediately
                if posts:
                    saved_count = await self.db_service.bulk_save_ideas(posts)
                    logger.info(f"Saved {saved_count} posts from r/{subreddit_name}")
                
                # Wait between subreddits to be respectful
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Failed to scrape r/{subreddit_name}: {str(e)}")
                results[subreddit_name] = []
        
        logger.info(f"Completed scraping. Total posts found: {total_posts}")
        return results
    
    async def update_existing_posts_metrics(self):
        """Update metrics for existing posts to get latest upvotes/comments."""
        logger.info("Starting to update existing posts metrics")
        
        try:
            # Get recent posts from database
            recent_ideas = await self.db_service.get_recent_ideas(limit=100)
            
            for idea in recent_ideas:
                try:
                    reddit_url = idea.get('reddit_url', '')
                    if not reddit_url:
                        continue
                    
                    # Extract post ID from URL
                    post_id_match = re.search(r'/comments/([a-zA-Z0-9]+)/', reddit_url)
                    if not post_id_match:
                        continue
                    
                    post_id = post_id_match.group(1)
                    
                    # Get updated submission data
                    submission = self.reddit.submission(id=post_id)
                    
                    # Update if metrics changed significantly
                    current_upvotes = idea.get('upvotes', 0)
                    current_comments = idea.get('comment_count', 0)
                    
                    if (abs(submission.score - current_upvotes) > 5 or 
                        abs(submission.num_comments - current_comments) > 2):
                        
                        analysis_data = {
                            'upvotes': submission.score,
                            'comment_count': submission.num_comments
                        }
                        
                        await self.db_service.update_idea_analysis(idea['id'], analysis_data)
                        logger.info(f"Updated metrics for post {post_id}")
                    
                    # Rate limiting
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error updating post metrics: {str(e)}")
                    continue
        
        except Exception as e:
            logger.error(f"Error in update_existing_posts_metrics: {str(e)}")
    
    def test_reddit_connection(self) -> bool:
        """Test Reddit API connection."""
        try:
            # Test by getting a few posts from a popular subreddit
            subreddit = self.reddit.subreddit('test')
            posts = list(subreddit.hot(limit=1))
            logger.info("Reddit API connection test successful")
            return True
        except Exception as e:
            logger.error(f"Reddit API connection test failed: {str(e)}")
            return False

# For backwards compatibility
class RedditScraper(RedditScraperSupabase):
    """Alias for backwards compatibility."""
    pass
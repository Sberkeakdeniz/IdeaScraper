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
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

class EnhancedRedditScraper:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT
        )
        self.config = Config()
        self.db_service = SupabaseService()
        self.ai_service = None
        
        # Try to initialize OpenAI service
        try:
            self.ai_service = OpenAIService()
            logger.info("OpenAI service initialized")
        except Exception as e:
            logger.warning(f"OpenAI service not available: {e}")
            self.ai_service = None
        
    async def scrape_and_analyze_subreddit(self, subreddit_name: str, limit: int = None) -> List[Dict[str, Any]]:
        """Scrape posts from a specific subreddit and analyze them with AI."""
        if limit is None:
            limit = self.config.MAX_POSTS_PER_SUBREDDIT
            
        subreddit_config = self.config.TARGET_SUBREDDITS.get(subreddit_name, {})
        keywords = subreddit_config.get('keywords', [])
        min_upvotes = subreddit_config.get('min_upvotes', self.config.MIN_UPVOTES)
        min_comments = subreddit_config.get('min_comments', self.config.MIN_COMMENTS)
        
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            processed_ideas = []
            
            logger.info(f"Starting enhanced scraping of r/{subreddit_name}")
            
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
                
                # Extract post data with enhanced description
                post_data = await self._extract_enhanced_post_data(submission, subreddit_name)
                if post_data:
                    # Save to database first
                    idea_id = await self.db_service.save_business_idea(post_data)
                    if idea_id:
                        logger.info(f"Saved post: {submission.title[:50]}...")
                        
                        # Analyze with OpenAI if available
                        if self.ai_service:
                            try:
                                logger.info(f"Analyzing with OpenAI: {submission.title[:50]}...")
                                analysis = await self.ai_service.analyze_business_idea(post_data)
                                
                                if analysis:
                                    # Update the idea with analysis
                                    await self.db_service.update_idea_analysis(idea_id, analysis)
                                    logger.info(f"Updated analysis for: {submission.title[:50]}...")
                                    
                                    # Add analysis to post_data for return
                                    post_data.update(analysis)
                                    post_data['id'] = idea_id
                                
                                # Rate limiting for OpenAI
                                time.sleep(1)
                                
                            except Exception as e:
                                logger.error(f"Error analyzing post with OpenAI: {e}")
                        
                        processed_ideas.append(post_data)
                        processed_count += 1
                
                # Rate limiting for Reddit
                time.sleep(60 / self.config.REQUESTS_PER_MINUTE)
            
            logger.info(f"Enhanced scraping completed: {len(processed_ideas)} ideas from r/{subreddit_name}")
            return processed_ideas
            
        except Exception as e:
            logger.error(f"Error in enhanced scraping of {subreddit_name}: {str(e)}")
            return []
    
    async def _extract_enhanced_post_data(self, submission, subreddit_name: str) -> Dict[str, Any]:
        """Extract comprehensive data from a Reddit submission."""
        try:
            # Clean and validate title and content
            title = self._clean_text(submission.title)
            
            # Get comprehensive description
            description = ""
            if submission.selftext:
                description = self._clean_text(submission.selftext)
            else:
                description = title
            
            # Get top comments for additional context
            try:
                submission.comments.replace_more(limit=0)
                top_comments = []
                
                for comment in submission.comments[:5]:  # Get top 5 comments
                    if hasattr(comment, 'body') and len(comment.body) > 30:
                        clean_comment = self._clean_text(comment.body)
                        if clean_comment and len(clean_comment) > 30:
                            top_comments.append(clean_comment[:300])
                
                # Add meaningful comments to description
                if top_comments:
                    meaningful_comments = [c for c in top_comments if len(c) > 50][:3]
                    if meaningful_comments:
                        description += "\n\nKey discussion points:\n"
                        for i, comment in enumerate(meaningful_comments, 1):
                            description += f"{i}. {comment}\n"
                            
            except Exception as e:
                logger.debug(f"Could not fetch comments for post: {e}")
            
            if not title or len(title) < 10:
                logger.debug(f"Skipping post with invalid title: {title}")
                return None
            
            # Extract comprehensive post data
            post_data = {
                'title': title[:500],
                'description': description[:3000],  # Increased description limit
                'reddit_url': f"https://reddit.com{submission.permalink}",
                'subreddit': subreddit_name,
                'upvotes': submission.score,
                'comment_count': submission.num_comments,
                'reddit_post_id': submission.id,
                'extracted_at': datetime.utcnow().timestamp(),
                'author': str(submission.author) if submission.author else '[deleted]',
                'created_utc': datetime.fromtimestamp(submission.created_utc),
                'post_flair': submission.link_flair_text if submission.link_flair_text else None,
                'is_self_post': submission.is_self,
                'domain': submission.domain if hasattr(submission, 'domain') else None,
            }
            
            return post_data
            
        except Exception as e:
            logger.error(f"Error extracting enhanced post data: {str(e)}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        if not text:
            return ""
        
        # Remove markdown formatting
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
        text = re.sub(r'~~(.*?)~~', r'\1', text)      # Strikethrough
        text = re.sub(r'`([^`]+)`', r'\1', text)      # Code
        
        # Remove Reddit-specific formatting
        text = re.sub(r'/u/\w+', '', text)            # User mentions
        text = re.sub(r'/r/\w+', '', text)            # Subreddit mentions
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # Links
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)  # URLs
        
        # Clean up whitespace and special characters
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\-.,!?;:()\[\]"]', '', text)
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
    
    async def scrape_all_subreddits_enhanced(self) -> Dict[str, List[Dict[str, Any]]]:
        """Scrape and analyze all configured subreddits."""
        results = {}
        total_ideas = 0
        
        logger.info(f"Starting enhanced scraping of {len(self.config.TARGET_SUBREDDITS)} subreddits")
        
        for subreddit_name in self.config.TARGET_SUBREDDITS.keys():
            try:
                logger.info(f"Enhanced scraping r/{subreddit_name}")
                ideas = await self.scrape_and_analyze_subreddit(subreddit_name)
                results[subreddit_name] = ideas
                total_ideas += len(ideas)
                
                if ideas:
                    logger.info(f"Completed r/{subreddit_name}: {len(ideas)} analyzed ideas")
                
                # Wait between subreddits
                time.sleep(3)
                
            except Exception as e:
                logger.error(f"Failed enhanced scraping of r/{subreddit_name}: {str(e)}")
                results[subreddit_name] = []
        
        logger.info(f"Enhanced scraping completed. Total analyzed ideas: {total_ideas}")
        return results
    
    def test_all_services(self) -> Dict[str, bool]:
        """Test all service connections."""
        results = {}
        
        # Test Reddit
        try:
            subreddit = self.reddit.subreddit('test')
            list(subreddit.hot(limit=1))
            results['reddit'] = True
            logger.info("Reddit API: OK")
        except Exception as e:
            results['reddit'] = False
            logger.error(f"Reddit API: FAILED - {e}")
        
        # Test Supabase
        try:
            results['supabase'] = self.db_service.test_connection()
            logger.info(f"Supabase: {'OK' if results['supabase'] else 'FAILED'}")
        except Exception as e:
            results['supabase'] = False
            logger.error(f"Supabase: FAILED - {e}")
        
        # Test OpenAI
        try:
            if self.ai_service:
                results['openai'] = self.ai_service.test_connection()
                logger.info(f"OpenAI: {'OK' if results['openai'] else 'FAILED'}")
            else:
                results['openai'] = False
                logger.info("OpenAI: NOT CONFIGURED")
        except Exception as e:
            results['openai'] = False
            logger.error(f"OpenAI: FAILED - {e}")
        
        return results
    
    async def scrape_subreddit_posts(self, subreddit: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Scrape posts from a subreddit without analysis - for targeted scraping."""
        try:
            subreddit_obj = self.reddit.subreddit(subreddit)
            posts = []
            
            logger.info(f"Scraping posts from r/{subreddit} (limit: {limit})")
            
            for submission in subreddit_obj.hot(limit=limit * 2):  # Get more to filter
                if len(posts) >= limit:
                    break
                    
                # Skip stickied posts
                if submission.stickied:
                    continue
                
                # Basic filters
                if submission.score < 5:  # Very low threshold for targeted scraping
                    continue
                
                # Extract basic post data
                post_data = {
                    'title': submission.title,
                    'description': await self._get_enhanced_description(submission),
                    'url': f"https://reddit.com{submission.permalink}",
                    'upvotes': submission.score,
                    'comment_count': submission.num_comments,
                    'created_utc': submission.created_utc
                }
                
                posts.append(post_data)
            
            logger.info(f"Found {len(posts)} posts from r/{subreddit}")
            return posts
            
        except Exception as e:
            logger.error(f"Error scraping posts from r/{subreddit}: {e}")
            return []
    
    async def _get_enhanced_description(self, submission) -> str:
        """Get enhanced description for a post."""
        description = ""
        
        # Start with post content
        if submission.selftext:
            description = self._clean_text(submission.selftext)
        else:
            description = submission.title
        
        # Add top comments for context
        try:
            submission.comments.replace_more(limit=0)
            top_comments = []
            
            for comment in submission.comments[:3]:  # Get top 3 comments
                if hasattr(comment, 'body') and len(comment.body) > 20:
                    clean_comment = self._clean_text(comment.body)
                    if len(clean_comment) > 20:
                        top_comments.append(clean_comment[:200])
            
            if top_comments:
                description += "\n\nKey discussion points:\n"
                for i, comment in enumerate(top_comments, 1):
                    description += f"{i}. {comment}\n"
        
        except Exception as e:
            logger.warning(f"Could not get comments: {e}")
        
        return description[:3000]  # Limit description length
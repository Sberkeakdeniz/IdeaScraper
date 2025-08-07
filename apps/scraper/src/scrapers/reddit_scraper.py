import praw
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
import time
import re
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import Config

logger = logging.getLogger(__name__)

class RedditScraper:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT
        )
        self.config = Config()
        
    def scrape_subreddit(self, subreddit_name: str, limit: int = None) -> List[Dict[str, Any]]:
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
            
            # Get hot posts from the subreddit
            for submission in subreddit.hot(limit=limit * 2):  # Get more to filter
                # Skip stickied posts
                if submission.stickied:
                    continue
                    
                # Check if post meets minimum criteria
                if submission.score < min_upvotes or submission.num_comments < min_comments:
                    continue
                    
                # Check if post contains relevant keywords
                if keywords and not self._contains_keywords(submission.title + ' ' + submission.selftext, keywords):
                    continue
                
                # Extract post data
                post_data = self._extract_post_data(submission, subreddit_name)
                if post_data:
                    posts_data.append(post_data)
                    
                # Stop if we have enough posts
                if len(posts_data) >= limit:
                    break
                    
                # Rate limiting
                time.sleep(1)  # 1 second between requests
                
            logger.info(f"Scraped {len(posts_data)} posts from r/{subreddit_name}")
            return posts_data
            
        except Exception as e:
            logger.error(f"Error scraping r/{subreddit_name}: {str(e)}")
            return []
    
    def _extract_post_data(self, submission, subreddit_name: str) -> Dict[str, Any]:
        """Extract relevant data from a Reddit submission."""
        try:
            # Get top comments for context
            submission.comments.replace_more(limit=0)
            top_comments = []
            
            for comment in submission.comments[:5]:  # Get top 5 comments
                if hasattr(comment, 'body') and len(comment.body) > 20:
                    top_comments.append({
                        'body': comment.body,
                        'score': comment.score,
                        'created_utc': comment.created_utc
                    })
            
            post_data = {
                'reddit_post_id': submission.id,
                'title': submission.title,
                'selftext': submission.selftext or '',
                'url': submission.url,
                'score': submission.score,
                'num_comments': submission.num_comments,
                'created_utc': submission.created_utc,
                'subreddit': subreddit_name,
                'author': str(submission.author) if submission.author else '[deleted]',
                'comments': top_comments,
                'flair': submission.link_flair_text or '',
                'is_self': submission.is_self,
                'permalink': f"https://reddit.com{submission.permalink}"
            }
            
            return post_data
            
        except Exception as e:
            logger.error(f"Error extracting post data: {str(e)}")
            return None
    
    def _contains_keywords(self, text: str, keywords: List[str]) -> bool:
        """Check if text contains any of the specified keywords."""
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in keywords)
    
    def scrape_all_subreddits(self) -> List[Dict[str, Any]]:
        """Scrape all configured subreddits."""
        all_posts = []
        
        for subreddit_name in self.config.TARGET_SUBREDDITS.keys():
            logger.info(f"Starting to scrape r/{subreddit_name}")
            posts = self.scrape_subreddit(subreddit_name)
            all_posts.extend(posts)
            
            # Rate limiting between subreddits
            time.sleep(2)
        
        logger.info(f"Total posts scraped: {len(all_posts)}")
        return all_posts
    
    def is_relevant_post(self, post_data: Dict[str, Any]) -> bool:
        """Determine if a post is relevant for business idea extraction."""
        title = post_data.get('title', '').lower()
        content = post_data.get('selftext', '').lower()
        full_text = f"{title} {content}"
        
        # Keywords that indicate potential business opportunities
        opportunity_keywords = [
            'problem', 'issue', 'challenge', 'difficulty', 'struggle',
            'annoying', 'frustrating', 'time consuming', 'tedious',
            'wish there was', 'need', 'missing', 'lack of', 'no solution',
            'manual', 'inefficient', 'expensive', 'complicated',
            'market gap', 'opportunity', 'business idea', 'startup idea'
        ]
        
        # Check if post contains opportunity indicators
        opportunity_score = sum(1 for keyword in opportunity_keywords if keyword in full_text)
        
        # Additional filters
        min_length = 50  # Minimum character count for meaningful content
        has_enough_engagement = post_data.get('score', 0) >= 5 and post_data.get('num_comments', 0) >= 3
        
        return (
            opportunity_score >= 2 and  # At least 2 opportunity keywords
            len(full_text) >= min_length and
            has_enough_engagement
        )
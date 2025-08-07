import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Reddit API credentials
    REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
    REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
    REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'IdeaFinder/1.0')
    
    # OpenAI API
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Scraping configuration
    MAX_POSTS_PER_SUBREDDIT = int(os.getenv('MAX_POSTS_PER_SUBREDDIT', '50'))
    MIN_UPVOTES = int(os.getenv('MIN_UPVOTES', '10'))
    MIN_COMMENTS = int(os.getenv('MIN_COMMENTS', '5'))
    
    # Rate limiting
    REQUESTS_PER_MINUTE = int(os.getenv('REQUESTS_PER_MINUTE', '60'))
    
    # Target subreddits with specific criteria
    TARGET_SUBREDDITS = {
        'Entrepreneur': {
            'keywords': ['problem', 'pain point', 'frustrating', 'wish there was', 'need help'],
            'min_upvotes': 10,
            'min_comments': 5,
            'focus_areas': ['SaaS', 'Business', 'Startup']
        },
        'solopreneur': {
            'keywords': ['struggling with', 'need help', 'automation', 'tool for'],
            'min_upvotes': 5,
            'min_comments': 3,
            'focus_areas': ['Solo Business', 'Productivity', 'Automation']
        },
        'startups': {
            'keywords': ['market gap', 'opportunity', 'problem', 'solution'],
            'min_upvotes': 15,
            'min_comments': 8,
            'focus_areas': ['Startup', 'Technology', 'Innovation']
        },
        'smallbusiness': {
            'keywords': ['challenge', 'difficult', 'time consuming', 'manual'],
            'min_upvotes': 8,
            'min_comments': 4,
            'focus_areas': ['Small Business', 'Operations', 'Management']
        },
        'SaaS': {
            'keywords': ['need', 'missing', 'wish', 'problem with'],
            'min_upvotes': 12,
            'min_comments': 6,
            'focus_areas': ['SaaS', 'Software', 'Technology']
        },
        'programming': {
            'keywords': ['annoying', 'tedious', 'time wasting', 'inefficient'],
            'min_upvotes': 20,
            'min_comments': 10,
            'focus_areas': ['Developer Tools', 'Programming', 'Software']
        }
    }
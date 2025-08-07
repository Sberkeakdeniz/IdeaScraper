import unittest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from scrapers.reddit_scraper import RedditScraper
from config import Config

class TestRedditScraper(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.scraper = RedditScraper()
        
    @patch('scrapers.reddit_scraper.praw.Reddit')
    def test_init_reddit_connection(self, mock_reddit):
        """Test Reddit connection initialization"""
        mock_reddit_instance = Mock()
        mock_reddit.return_value = mock_reddit_instance
        
        scraper = RedditScraper()
        
        mock_reddit.assert_called_once_with(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT
        )
        
    def test_contains_keywords(self):
        """Test keyword detection in text"""
        keywords = ['problem', 'issue', 'frustrating']
        
        # Test positive cases
        self.assertTrue(self.scraper._contains_keywords("This is a major problem", keywords))
        self.assertTrue(self.scraper._contains_keywords("Having an issue with this", keywords))
        self.assertTrue(self.scraper._contains_keywords("It's really FRUSTRATING", keywords))
        
        # Test negative cases
        self.assertFalse(self.scraper._contains_keywords("Everything is great", keywords))
        self.assertFalse(self.scraper._contains_keywords("No complaints here", keywords))
        
    def test_is_relevant_post(self):
        """Test post relevance detection"""
        # Relevant post
        relevant_post = {
            'title': 'Major problem with current tools',
            'selftext': 'I wish there was a better solution for this tedious manual process. It\'s so time consuming and inefficient.',
            'score': 25,
            'num_comments': 10
        }
        
        self.assertTrue(self.scraper.is_relevant_post(relevant_post))
        
        # Irrelevant post
        irrelevant_post = {
            'title': 'Great day today',
            'selftext': 'Everything is perfect.',
            'score': 5,
            'num_comments': 2
        }
        
        self.assertFalse(self.scraper.is_relevant_post(irrelevant_post))
        
        # Post with low engagement
        low_engagement_post = {
            'title': 'I have a problem with this tool',
            'selftext': 'It\'s really frustrating and time consuming.',
            'score': 2,
            'num_comments': 1
        }
        
        self.assertFalse(self.scraper.is_relevant_post(low_engagement_post))
        
    @patch('scrapers.reddit_scraper.time.sleep')
    def test_extract_post_data(self, mock_sleep):
        """Test post data extraction"""
        # Mock Reddit submission
        mock_submission = Mock()
        mock_submission.id = 'test123'
        mock_submission.title = 'Test Post'
        mock_submission.selftext = 'Test content'
        mock_submission.url = 'https://reddit.com/r/test/comments/test123'
        mock_submission.score = 100
        mock_submission.num_comments = 15
        mock_submission.created_utc = 1634567890
        mock_submission.author = Mock()
        mock_submission.author.__str__ = Mock(return_value='testuser')
        mock_submission.link_flair_text = 'Discussion'
        mock_submission.is_self = True
        mock_submission.permalink = '/r/test/comments/test123/test_post'
        
        # Mock comments
        mock_comment1 = Mock()
        mock_comment1.body = 'This is a great comment with useful insights'
        mock_comment1.score = 25
        mock_comment1.created_utc = 1634567900
        
        mock_comment2 = Mock()
        mock_comment2.body = 'Another helpful comment'
        mock_comment2.score = 10
        mock_comment2.created_utc = 1634567910
        
        mock_submission.comments = [mock_comment1, mock_comment2]
        mock_submission.comments.replace_more = Mock()
        
        result = self.scraper._extract_post_data(mock_submission, 'test')
        
        self.assertIsNotNone(result)
        self.assertEqual(result['reddit_post_id'], 'test123')
        self.assertEqual(result['title'], 'Test Post')
        self.assertEqual(result['selftext'], 'Test content')
        self.assertEqual(result['score'], 100)
        self.assertEqual(result['num_comments'], 15)
        self.assertEqual(result['subreddit'], 'test')
        self.assertEqual(result['author'], 'testuser')
        self.assertEqual(len(result['comments']), 2)
        
    @patch('scrapers.reddit_scraper.time.sleep')
    @patch('scrapers.reddit_scraper.praw.Reddit')
    def test_scrape_subreddit(self, mock_reddit, mock_sleep):
        """Test subreddit scraping"""
        # Mock Reddit and subreddit
        mock_reddit_instance = Mock()
        mock_reddit.return_value = mock_reddit_instance
        
        mock_subreddit = Mock()
        mock_reddit_instance.subreddit.return_value = mock_subreddit
        
        # Mock submissions
        mock_submission1 = Mock()
        mock_submission1.stickied = False
        mock_submission1.score = 50
        mock_submission1.num_comments = 10
        mock_submission1.title = 'I have a problem with productivity tools'
        mock_submission1.selftext = 'They are so frustrating to use'
        mock_submission1.id = 'post1'
        mock_submission1.url = 'https://reddit.com/r/test/post1'
        mock_submission1.created_utc = 1634567890
        mock_submission1.author = Mock()
        mock_submission1.author.__str__ = Mock(return_value='user1')
        mock_submission1.link_flair_text = None
        mock_submission1.is_self = True
        mock_submission1.permalink = '/r/test/comments/post1'
        mock_submission1.comments = []
        mock_submission1.comments.replace_more = Mock()
        
        mock_subreddit.hot.return_value = [mock_submission1]
        
        scraper = RedditScraper()
        result = scraper.scrape_subreddit('Entrepreneur', limit=1)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['reddit_post_id'], 'post1')
        self.assertEqual(result[0]['title'], 'I have a problem with productivity tools')
        
    def test_scrape_subreddit_with_filters(self):
        """Test subreddit scraping with keyword filters"""
        with patch.object(self.scraper, 'reddit') as mock_reddit:
            mock_subreddit = Mock()
            mock_reddit.subreddit.return_value = mock_subreddit
            
            # Mock submission that doesn't contain keywords
            mock_submission = Mock()
            mock_submission.stickied = False
            mock_submission.score = 50
            mock_submission.num_comments = 10
            mock_submission.title = 'Great news everyone!'
            mock_submission.selftext = 'Everything is working perfectly'
            
            mock_subreddit.hot.return_value = [mock_submission]
            
            result = self.scraper.scrape_subreddit('Entrepreneur', limit=1)
            
            # Should return empty list since post doesn't contain relevant keywords
            self.assertEqual(len(result), 0)

if __name__ == '__main__':
    unittest.main()
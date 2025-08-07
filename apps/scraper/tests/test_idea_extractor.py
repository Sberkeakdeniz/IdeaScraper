import unittest
from unittest.mock import Mock, patch, MagicMock
import json
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from processors.idea_extractor import IdeaExtractor

class TestIdeaExtractor(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.extractor = IdeaExtractor()
        
    def test_get_system_prompt(self):
        """Test system prompt generation"""
        prompt = self.extractor._get_system_prompt()
        
        self.assertIn('business analyst', prompt.lower())
        self.assertIn('market opportunities', prompt.lower())
        self.assertIn('json', prompt.lower())
        
    def test_build_extraction_prompt(self):
        """Test extraction prompt building"""
        post_data = {
            'title': 'Problem with current tools',
            'selftext': 'I wish there was a better solution',
            'subreddit': 'Entrepreneur',
            'comments': [
                {'body': 'I agree, this is frustrating', 'score': 10}
            ]
        }
        
        prompt = self.extractor._build_extraction_prompt(post_data)
        
        self.assertIn('Problem with current tools', prompt)
        self.assertIn('I wish there was a better solution', prompt)
        self.assertIn('r/Entrepreneur', prompt)
        self.assertIn('I agree, this is frustrating', prompt)
        
    def test_is_valid_idea(self):
        """Test idea validation"""
        # Valid idea
        valid_idea = {
            'title': 'AI-Powered Task Manager',
            'description': 'A smart task management tool that uses AI to prioritize tasks automatically',
            'market_potential': 4,
            'technical_difficulty': 3,
            'competition_level': 2
        }
        
        self.assertTrue(self.extractor._is_valid_idea(valid_idea))
        
        # Invalid idea - missing title
        invalid_idea1 = {
            'description': 'A smart task management tool',
            'market_potential': 4,
            'technical_difficulty': 3,
            'competition_level': 2
        }
        
        self.assertFalse(self.extractor._is_valid_idea(invalid_idea1))
        
        # Invalid idea - title too short
        invalid_idea2 = {
            'title': 'AI Tool',
            'description': 'A smart task management tool that uses AI to prioritize tasks automatically',
            'market_potential': 4,
            'technical_difficulty': 3,
            'competition_level': 2
        }
        
        self.assertFalse(self.extractor._is_valid_idea(invalid_idea2))
        
        # Invalid idea - description too short
        invalid_idea3 = {
            'title': 'AI-Powered Task Manager',
            'description': 'Short desc',
            'market_potential': 4,
            'technical_difficulty': 3,
            'competition_level': 2
        }
        
        self.assertFalse(self.extractor._is_valid_idea(invalid_idea3))
        
        # Invalid idea - score out of range
        invalid_idea4 = {
            'title': 'AI-Powered Task Manager',
            'description': 'A smart task management tool that uses AI to prioritize tasks automatically',
            'market_potential': 6,  # Out of range
            'technical_difficulty': 3,
            'competition_level': 2
        }
        
        self.assertFalse(self.extractor._is_valid_idea(invalid_idea4))
        
    def test_process_extracted_ideas(self):
        """Test processing of extracted ideas"""
        ideas_data = {
            'ideas': [
                {
                    'title': 'Smart Calendar Assistant',
                    'description': 'An AI assistant that automatically schedules meetings and manages calendar conflicts',
                    'problem_statement': 'Calendar management is time-consuming and error-prone',
                    'solution_approach': 'Use AI to analyze calendar patterns and preferences',
                    'target_audience': 'Busy professionals and entrepreneurs',
                    'industry_tags': ['SaaS', 'Productivity', 'AI'],
                    'market_potential': 4,
                    'technical_difficulty': 3,
                    'competition_level': 2
                }
            ]
        }
        
        post_data = {
            'reddit_post_id': 'post123',
            'subreddit': 'productivity',
            'permalink': 'https://reddit.com/r/productivity/comments/post123',
            'score': 150,
            'num_comments': 25,
            'created_utc': 1634567890
        }
        
        result = self.extractor._process_extracted_ideas(ideas_data, post_data)
        
        self.assertEqual(len(result), 1)
        idea = result[0]
        
        self.assertEqual(idea['title'], 'Smart Calendar Assistant')
        self.assertEqual(idea['reddit_post_id'], 'post123')
        self.assertEqual(idea['source_subreddit'], 'productivity')
        self.assertEqual(idea['upvotes'], 150)
        self.assertEqual(idea['comments_count'], 25)
        self.assertIn('overall_score', idea)
        
        # Check overall score calculation
        expected_score = (4 * 0.4 + (6 - 3) * 0.3 + (6 - 2) * 0.3)
        self.assertAlmostEqual(idea['overall_score'], expected_score, places=2)
        
    @patch('processors.idea_extractor.openai.ChatCompletion.create')
    def test_extract_business_ideas_success(self, mock_openai):
        """Test successful business idea extraction"""
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps({
            'ideas': [
                {
                    'title': 'Automated Email Sorter',
                    'description': 'A tool that automatically categorizes and prioritizes emails using machine learning',
                    'problem_statement': 'Email overload reduces productivity',
                    'solution_approach': 'ML-based email classification and prioritization',
                    'target_audience': 'Business professionals',
                    'industry_tags': ['SaaS', 'Productivity'],
                    'market_potential': 4,
                    'technical_difficulty': 3,
                    'competition_level': 2
                }
            ]
        })
        
        mock_openai.return_value = mock_response
        
        post_data = {
            'reddit_post_id': 'post123',
            'title': 'Email management is a nightmare',
            'selftext': 'I spend hours sorting through emails daily',
            'subreddit': 'productivity',
            'comments': [],
            'permalink': 'https://reddit.com/r/productivity/comments/post123',
            'score': 100,
            'num_comments': 15,
            'created_utc': 1634567890
        }
        
        result = self.extractor.extract_business_ideas(post_data)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['title'], 'Automated Email Sorter')
        
        # Verify OpenAI was called with correct parameters
        mock_openai.assert_called_once()
        call_args = mock_openai.call_args
        self.assertEqual(call_args[1]['model'], 'gpt-4')
        self.assertEqual(len(call_args[1]['messages']), 2)
        
    @patch('processors.idea_extractor.openai.ChatCompletion.create')
    def test_extract_business_ideas_invalid_json(self, mock_openai):
        """Test handling of invalid JSON response"""
        # Mock OpenAI response with invalid JSON
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = 'Invalid JSON response'
        
        mock_openai.return_value = mock_response
        
        post_data = {
            'reddit_post_id': 'post123',
            'title': 'Test post',
            'selftext': 'Test content',
            'subreddit': 'test',
            'comments': []
        }
        
        result = self.extractor.extract_business_ideas(post_data)
        
        # Should return empty list for invalid JSON
        self.assertEqual(len(result), 0)
        
    @patch('processors.idea_extractor.openai.ChatCompletion.create')
    def test_extract_business_ideas_openai_error(self, mock_openai):
        """Test handling of OpenAI API errors"""
        # Mock OpenAI to raise an exception
        mock_openai.side_effect = Exception('API Error')
        
        post_data = {
            'reddit_post_id': 'post123',
            'title': 'Test post',
            'selftext': 'Test content',
            'subreddit': 'test',
            'comments': []
        }
        
        result = self.extractor.extract_business_ideas(post_data)
        
        # Should return empty list on error
        self.assertEqual(len(result), 0)
        
    @patch('processors.idea_extractor.time.sleep')
    def test_batch_extract_ideas(self, mock_sleep):
        """Test batch processing of multiple posts"""
        with patch.object(self.extractor, 'extract_business_ideas') as mock_extract:
            mock_extract.return_value = [
                {
                    'title': 'Test Idea',
                    'description': 'Test description',
                    'overall_score': 3.5
                }
            ]
            
            posts_data = [
                {'reddit_post_id': 'post1'},
                {'reddit_post_id': 'post2'}
            ]
            
            result = self.extractor.batch_extract_ideas(posts_data)
            
            self.assertEqual(len(result), 2)
            self.assertEqual(mock_extract.call_count, 2)
            mock_sleep.assert_called()  # Rate limiting should be applied

if __name__ == '__main__':
    unittest.main()
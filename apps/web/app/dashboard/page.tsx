'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IdeaCard } from '@/components/dashboard/IdeaCard';
import { IdeaCardSkeleton } from '@/components/dashboard/IdeaCardSkeleton';
import { IdeaAnalysisModal } from '@/components/dashboard/IdeaAnalysisModal';
import { RefreshCw, Plus, TrendingUp, Lightbulb } from 'lucide-react';

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  reddit_url: string;
  subreddit: string;
  upvotes: number;
  comment_count: number;
  market_size?: string | null;
  target_audience?: string | null;
  monetization_strategy?: string | null;
  competitor_analysis?: string | null;
  validation_score?: number | null;
  sentiment?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: BusinessIdea[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ideas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      if (data.success) {
        setIdeas(data.data);
        setError(null);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      setError('Failed to fetch business ideas');
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIdeas();
  };

  const triggerScraping = async () => {
    try {
      setRefreshing(true);
      setIsScrapingActive(true);
      
      // Trigger the actual scraping process
      const response = await fetch('http://localhost:3001/api/ideas/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Scraping triggered:', result);
      
      // Stop the active state after 2 minutes (scraping should be done by then)
      setTimeout(() => {
        setIsScrapingActive(false);
        setRefreshing(false);
      }, 120000); // 2 minutes
      
    } catch (error) {
      console.error('Error triggering scraping:', error);
      setError('Failed to start scraping process');
      setRefreshing(false);
      setIsScrapingActive(false);
    }
  };

  const handleViewIdea = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (idea) {
      setSelectedIdea({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        sourceSubreddit: idea.subreddit,
        upvotes: idea.upvotes,
        commentsCount: idea.comment_count,
        validationScore: idea.validation_score || 0,
        marketSize: idea.market_size,
        targetAudience: idea.target_audience,
        monetizationStrategy: idea.monetization_strategy,
        competitorAnalysis: idea.competitor_analysis,
        sentiment: idea.sentiment,
        redditUrl: idea.reddit_url,
      });
      setModalOpen(true);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // Auto-refresh when scraping is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScrapingActive) {
      // Poll every 10 seconds for new ideas while scraping
      interval = setInterval(() => {
        fetchIdeas();
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScrapingActive]);

  const analysedIdeas = ideas.filter(idea => idea.validation_score !== null);
  const pendingIdeas = ideas.filter(idea => idea.validation_score === null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                Business Ideas Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-analyzed business opportunities from Reddit
                {isScrapingActive && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1"></div>
                    Live scraping in progress
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="glass border-white/20 hover:bg-white/5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={triggerScraping}
                disabled={refreshing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isScrapingActive ? 'Scraping Active...' : 'Scrape New Ideas'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ideas.length}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  From Reddit communities
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{analysedIdeas.length}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Complete analysis available
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Validation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {analysedIdeas.length > 0 
                    ? (analysedIdeas.reduce((sum, idea) => sum + (idea.validation_score || 0), 0) / analysedIdeas.length).toFixed(1)
                    : 'N/A'
                  }
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  Out of 10.0
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <IdeaCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="glass border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Ideas</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchIdeas} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ideas Grid */}
        {!loading && !error && ideas.length > 0 && (
          <div className="space-y-8">
            {/* AI Analyzed Ideas */}
            {analysedIdeas.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-400" />
                  AI Analyzed Ideas ({analysedIdeas.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysedIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <IdeaCard
                        idea={{
                          id: idea.id,
                          title: idea.title,
                          description: idea.description,
                          sourceSubreddit: idea.subreddit,
                          upvotes: idea.upvotes,
                          commentsCount: idea.comment_count,
                          validationScore: idea.validation_score || 0,
                          marketSize: idea.market_size,
                          targetAudience: idea.target_audience,
                          monetizationStrategy: idea.monetization_strategy,
                          competitorAnalysis: idea.competitor_analysis,
                          sentiment: idea.sentiment,
                          redditUrl: idea.reddit_url,
                        }}
                        onView={handleViewIdea}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Analysis Ideas */}
            {pendingIdeas.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-blue-400" />
                  Pending Analysis ({pendingIdeas.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass border-white/10 opacity-75">
                        <CardHeader>
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <CardDescription>r/{idea.subreddit}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {idea.description?.slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{idea.upvotes} upvotes</span>
                            <span>{idea.comment_count} comments</span>
                          </div>
                          <div className="mt-4 text-center">
                            <span className="text-sm text-yellow-400">⏳ Analysis pending...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ideas.length === 0 && (
          <Card className="glass border-white/10 text-center py-12">
            <CardHeader>
              <CardTitle>No Business Ideas Found</CardTitle>
              <CardDescription>
                Click "Scrape New Ideas" to find business opportunities from Reddit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={triggerScraping} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Start Scraping
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Modal */}
        <IdeaAnalysisModal
          idea={selectedIdea}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </div>
  );
}
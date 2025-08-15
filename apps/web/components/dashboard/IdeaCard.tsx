'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  ExternalLink,
  Target,
  BarChart3,
  DollarSign,
  Eye,
  Lightbulb
} from 'lucide-react';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    sourceSubreddit: string;
    upvotes: number;
    commentsCount: number;
    validationScore: number;
    marketSize?: string | null;
    targetAudience?: string | null;
    monetizationStrategy?: string | null;
    competitorAnalysis?: string | null;
    sentiment?: string | null;
    redditUrl?: string;
  };
  onView?: (id: string) => void;
}

export function IdeaCard({ idea, onView }: IdeaCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-400 to-emerald-500';
    if (score >= 6) return 'from-blue-400 to-indigo-500';
    if (score >= 4) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getSentimentColor = (sentiment: string | null | undefined) => {
    if (!sentiment) return 'bg-gray-500/10 text-gray-400';
    switch (sentiment.toLowerCase()) {
      case 'very positive': return 'bg-green-500/10 text-green-400';
      case 'positive': return 'bg-blue-500/10 text-blue-400';
      case 'neutral': return 'bg-gray-500/10 text-gray-400';
      case 'negative': return 'bg-orange-500/10 text-orange-400';
      case 'very negative': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string | null | undefined) => {
    if (!sentiment) return '😐';
    switch (sentiment.toLowerCase()) {
      case 'very positive': return '🚀';
      case 'positive': return '😊';
      case 'neutral': return '😐';
      case 'negative': return '😕';
      case 'very negative': return '😞';
      default: return '😐';
    }
  };

  const handleViewReddit = () => {
    if (idea.redditUrl) {
      window.open(idea.redditUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Card className="h-full transition-all duration-300 hover:shadow-glow-lg border-white/10 bg-card/80 backdrop-blur-xl">
        {/* Header with score indicator */}
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:gradient-text transition-all duration-300">
                {idea.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs px-2 py-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                  r/{idea.sourceSubreddit}
                </Badge>
                <Badge className={`text-xs px-2 py-1 ${getSentimentColor(idea.sentiment)}`}>
                  {getSentimentIcon(idea.sentiment)} {idea.sentiment || 'Unknown'}
                </Badge>
              </div>
            </div>
            
            {/* Validation Score */}
            <div className="flex-none ml-4">
              <div className="relative w-16 h-16">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getScoreColor(idea.validationScore)} flex items-center justify-center shadow-glow`}>
                    <span className="text-white font-bold text-sm">{idea.validationScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {idea.description}
          </p>

          {/* AI Analysis Highlights */}
          {idea.marketSize && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Market Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {idea.marketSize}
              </p>
            </div>
          )}

          {idea.targetAudience && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Target Audience</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {idea.targetAudience}
              </p>
            </div>
          )}

          {idea.monetizationStrategy && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Monetization</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {idea.monetizationStrategy}
              </p>
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{idea.upvotes} upvotes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{idea.commentsCount} comments</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 glass border-white/20 hover:bg-white/5"
              onClick={() => onView?.(idea.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Full Analysis
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="px-3 glass border-white/20 hover:bg-white/5"
              onClick={handleViewReddit}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
}
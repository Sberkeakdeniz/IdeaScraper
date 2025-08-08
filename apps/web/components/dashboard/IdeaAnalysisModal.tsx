'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  ExternalLink,
  Target,
  BarChart3,
  DollarSign,
  Lightbulb,
  Trophy,
  Zap,
  CheckCircle2,
  Copy,
  Share2
} from 'lucide-react';

interface BusinessIdea {
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
}

interface IdeaAnalysisModalProps {
  idea: BusinessIdea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeaAnalysisModal({ idea, open, onOpenChange }: IdeaAnalysisModalProps) {
  if (!idea) return null;

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

  const getScoreDescription = (score: number) => {
    if (score >= 8) return 'Excellent potential with strong market indicators';
    if (score >= 6) return 'Good potential with promising market signals';
    if (score >= 4) return 'Moderate potential with some market interest';
    return 'Lower potential requiring further validation';
  };

  const handleViewReddit = () => {
    if (idea.redditUrl) {
      window.open(idea.redditUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    if (idea.redditUrl) {
      try {
        await navigator.clipboard.writeText(idea.redditUrl);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass border-white/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent pr-8">
                {idea.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="px-3 py-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                  r/{idea.sourceSubreddit}
                </Badge>
                <Badge className={`px-3 py-1 ${getSentimentColor(idea.sentiment)}`}>
                  {getSentimentIcon(idea.sentiment)} {idea.sentiment || 'Unknown'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{idea.upvotes} upvotes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{idea.commentsCount} comments</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Validation Score */}
            <div className="flex-none ml-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getScoreColor(idea.validationScore)} flex items-center justify-center shadow-glow`}>
                    <span className="text-white font-bold text-lg">{idea.validationScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </motion.div>
              <p className="text-xs text-center text-muted-foreground mt-2 max-w-24">
                {getScoreDescription(idea.validationScore)}
              </p>
            </div>
          </div>
          
          <DialogDescription className="text-base leading-relaxed">
            {idea.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Analysis Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Size Analysis */}
            {idea.marketSize && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full glass border-white/10 bg-white/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Target className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="text-blue-400">Market Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {idea.marketSize}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Target Audience */}
            {idea.targetAudience && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full glass border-white/10 bg-white/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Users className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-purple-400">Target Audience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {idea.targetAudience}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Monetization Strategy */}
            {idea.monetizationStrategy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="h-full glass border-white/10 bg-white/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <DollarSign className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-green-400">Monetization Strategy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {idea.monetizationStrategy}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Competitor Analysis */}
            {idea.competitorAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="h-full glass border-white/10 bg-white/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <BarChart3 className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-orange-400">Competitive Landscape</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {idea.competitorAnalysis}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Key Insights Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass border-white/10 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                    <Lightbulb className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    AI Analysis Summary
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium">Validation Score</p>
                      <p className="text-xs text-muted-foreground">{idea.validationScore.toFixed(1)}/10.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">Market Sentiment</p>
                      <p className="text-xs text-muted-foreground">{idea.sentiment || 'Not analyzed'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium">Community Interest</p>
                      <p className="text-xs text-muted-foreground">{idea.upvotes + idea.commentsCount} interactions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20 hover:bg-white/5"
                onClick={handleViewReddit}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Reddit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20 hover:bg-white/5"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
            
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Close Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
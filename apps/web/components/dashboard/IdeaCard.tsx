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
  Bookmark, 
  ExternalLink,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    industryTags: string[];
    overallScore: number;
    marketPotentialScore: number;
    difficultyScore: number;
    competitionScore: number;
    upvotes: number;
    commentsCount: number;
    sourceSubreddit: string;
    isBookmarked?: boolean;
  };
  onBookmark?: (id: string) => void;
  onView?: (id: string) => void;
}

export function IdeaCard({ idea, onBookmark, onView }: IdeaCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'from-green-400 to-emerald-500';
    if (score >= 3) return 'from-blue-400 to-indigo-500';
    if (score >= 2) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getDifficultyLabel = (score: number) => {
    if (score <= 2) return 'Easy';
    if (score <= 3) return 'Medium';
    return 'Hard';
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
              </div>
            </div>
            
            {/* Overall Score */}
            <div className="flex-none ml-4">
              <div className="relative w-16 h-16">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getScoreColor(idea.overallScore)} flex items-center justify-center shadow-glow`}>
                    <span className="text-white font-bold text-sm">{idea.overallScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Industry tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {idea.industryTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {idea.industryTags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-white/5 border-white/10">
                +{idea.industryTags.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {idea.description}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Market</span>
              </div>
              <div className={`text-sm font-semibold bg-gradient-to-r ${getScoreColor(idea.marketPotentialScore)} bg-clip-text text-transparent`}>
                {idea.marketPotentialScore}/5
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-muted-foreground">Difficulty</span>
              </div>
              <div className="text-sm font-semibold">
                {getDifficultyLabel(idea.difficultyScore)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Competition</span>
              </div>
              <div className={`text-sm font-semibold bg-gradient-to-r ${getScoreColor(5 - idea.competitionScore)} bg-clip-text text-transparent`}>
                {idea.competitionScore}/5
              </div>
            </div>
          </div>

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
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            <Button
              variant={idea.isBookmarked ? "default" : "outline"}
              size="sm"
              className={`px-3 ${idea.isBookmarked 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'glass border-white/20 hover:bg-white/5'
              }`}
              onClick={() => onBookmark?.(idea.id)}
            >
              <Bookmark className={`h-4 w-4 ${idea.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
}
export interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  subscriptionEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  sourceUrl: string | null;
  sourceSubreddit: string | null;
  redditPostId: string | null;
  industryTags: string[];
  difficultyScore: number | null;
  marketPotentialScore: number | null;
  competitionScore: number | null;
  overallScore: number | null;
  sentimentScore: number | null;
  upvotes: number;
  commentsCount: number;
  createdAt: Date;
  processedAt: Date | null;
  isActive: boolean;
}

export interface UserIdeaInteraction {
  id: string;
  userId: string;
  ideaId: string;
  interactionType: 'bookmark' | 'like' | 'view' | 'dismiss';
  createdAt: Date;
}

export interface UserUsage {
  id: string;
  userId: string;
  monthYear: string;
  ideasViewed: number;
  apiCalls: number;
  createdAt: Date;
}

export interface IdeaFilters {
  page?: number;
  limit?: number;
  industry?: string[];
  difficulty?: number[];
  minScore?: number;
  search?: string;
  sortBy?: 'score' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'enterprise';
  isActive: boolean;
  endsAt: Date | null;
  features: string[];
}

export interface UsageStats {
  current: {
    ideasViewed: number;
    apiCalls: number;
  };
  limits: {
    ideasViewed: number;
    apiCalls: number;
  };
  resetDate: Date;
}
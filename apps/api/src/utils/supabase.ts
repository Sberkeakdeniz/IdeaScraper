import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin operations (use carefully)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  redditUrl: string;
  subreddit: string;
  upvotes: number;
  commentCount: number;
  marketSize?: string;
  targetAudience?: string;
  monetizationStrategy?: string;
  competitorAnalysis?: string;
  validationScore?: number;
  sentiment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserIdea {
  id: string;
  userId: string;
  ideaId: string;
  isFavorite: boolean;
  notes?: string;
  createdAt: Date;
}
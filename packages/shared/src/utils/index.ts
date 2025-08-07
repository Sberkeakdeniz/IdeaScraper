import { z } from 'zod';

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be less than 128 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: emailSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const ideaFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  industry: z.array(z.string()).optional(),
  difficulty: z.array(z.number().int().min(1).max(5)).optional(),
  minScore: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['score', 'date', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Utility functions
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatScore(score: number | null): string {
  if (score === null) return 'N/A';
  return score.toFixed(1);
}

export function getDifficultyLabel(score: number | null): string {
  if (score === null) return 'Unknown';
  if (score <= 1) return 'Very Easy';
  if (score <= 2) return 'Easy';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'Hard';
  return 'Very Hard';
}

export function getMarketPotentialLabel(score: number | null): string {
  if (score === null) return 'Unknown';
  if (score <= 1) return 'Very Low';
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'Very High';
}

export function getCompetitionLabel(score: number | null): string {
  if (score === null) return 'Unknown';
  if (score <= 1) return 'Very Low';
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'Very High';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
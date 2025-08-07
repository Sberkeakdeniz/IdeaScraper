export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export const INTERACTION_TYPES = {
  BOOKMARK: 'bookmark',
  LIKE: 'like',
  VIEW: 'view',
  DISMISS: 'dismiss',
} as const;

export const SORT_OPTIONS = {
  SCORE: 'score',
  DATE: 'date',
  POPULARITY: 'popularity',
} as const;

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const INDUSTRY_TAGS = [
  'SaaS',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'PropTech',
  'FoodTech',
  'AgriTech',
  'CleanTech',
  'AI/ML',
  'Blockchain',
  'IoT',
  'Mobile Apps',
  'Web Development',
  'DevTools',
  'Productivity',
  'Marketing',
  'Analytics',
  'Security',
  'Gaming',
  'Media',
  'Social',
  'Travel',
  'Fitness',
  'Fashion',
  'Beauty',
  'Pet Tech',
  'Automotive',
  'Real Estate',
  'Legal Tech',
  'HR Tech',
  'Supply Chain',
  'Logistics',
  'Manufacturing',
  'Consulting',
  'Services',
  'Other',
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: 'green' },
  { value: 2, label: 'Easy', color: 'lime' },
  { value: 3, label: 'Medium', color: 'yellow' },
  { value: 4, label: 'Hard', color: 'orange' },
  { value: 5, label: 'Very Hard', color: 'red' },
] as const;

export const MARKET_POTENTIAL_LEVELS = [
  { value: 1, label: 'Very Low', color: 'red' },
  { value: 2, label: 'Low', color: 'orange' },
  { value: 3, label: 'Medium', color: 'yellow' },
  { value: 4, label: 'High', color: 'lime' },
  { value: 5, label: 'Very High', color: 'green' },
] as const;

export const COMPETITION_LEVELS = [
  { value: 1, label: 'Very Low', color: 'green' },
  { value: 2, label: 'Low', color: 'lime' },
  { value: 3, label: 'Medium', color: 'yellow' },
  { value: 4, label: 'High', color: 'orange' },
  { value: 5, label: 'Very High', color: 'red' },
] as const;

export const SUBREDDIT_CATEGORIES = {
  ENTREPRENEURSHIP: ['Entrepreneur', 'startups', 'solopreneur', 'smallbusiness'],
  TECHNOLOGY: ['programming', 'webdev', 'SaaS', 'tech'],
  BUSINESS: ['business', 'marketing', 'sales', 'freelance'],
  PRODUCTIVITY: ['productivity', 'GetMotivated', 'selfimprovement'],
  FINANCE: ['personalfinance', 'investing', 'financialindependence'],
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  IDEAS: {
    LIST: '/api/ideas',
    DETAIL: '/api/ideas/:id',
    BOOKMARK: '/api/ideas/:id/bookmark',
    BOOKMARKED: '/api/ideas/bookmarked',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/password',
    DELETE_ACCOUNT: '/api/users/account',
  },
  SUBSCRIPTIONS: {
    STATUS: '/api/subscriptions/status',
    USAGE: '/api/subscriptions/usage',
    CHECKOUT: '/api/subscriptions/checkout',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  IDEA_NOT_FOUND: 'Business idea not found',
  SUBSCRIPTION_REQUIRED: 'Subscription upgrade required',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  IDEA_BOOKMARKED: 'Idea bookmarked successfully',
  IDEA_UNBOOKMARKED: 'Idea removed from bookmarks',
} as const;
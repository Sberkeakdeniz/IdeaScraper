import {
  SUBSCRIPTION_TIERS,
  INTERACTION_TYPES,
  SORT_OPTIONS,
  SORT_ORDERS,
  INDUSTRY_TAGS,
  DIFFICULTY_LEVELS,
  MARKET_POTENTIAL_LEVELS,
  COMPETITION_LEVELS,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants';

describe('Constants', () => {
  describe('SUBSCRIPTION_TIERS', () => {
    it('should have correct subscription tier values', () => {
      expect(SUBSCRIPTION_TIERS.FREE).toBe('free');
      expect(SUBSCRIPTION_TIERS.PREMIUM).toBe('premium');
      expect(SUBSCRIPTION_TIERS.ENTERPRISE).toBe('enterprise');
    });
  });

  describe('INTERACTION_TYPES', () => {
    it('should have correct interaction type values', () => {
      expect(INTERACTION_TYPES.BOOKMARK).toBe('bookmark');
      expect(INTERACTION_TYPES.LIKE).toBe('like');
      expect(INTERACTION_TYPES.VIEW).toBe('view');
      expect(INTERACTION_TYPES.DISMISS).toBe('dismiss');
    });
  });

  describe('SORT_OPTIONS', () => {
    it('should have correct sort option values', () => {
      expect(SORT_OPTIONS.SCORE).toBe('score');
      expect(SORT_OPTIONS.DATE).toBe('date');
      expect(SORT_OPTIONS.POPULARITY).toBe('popularity');
    });
  });

  describe('SORT_ORDERS', () => {
    it('should have correct sort order values', () => {
      expect(SORT_ORDERS.ASC).toBe('asc');
      expect(SORT_ORDERS.DESC).toBe('desc');
    });
  });

  describe('INDUSTRY_TAGS', () => {
    it('should contain expected industry tags', () => {
      expect(INDUSTRY_TAGS).toContain('SaaS');
      expect(INDUSTRY_TAGS).toContain('AI/ML');
      expect(INDUSTRY_TAGS).toContain('FinTech');
      expect(INDUSTRY_TAGS).toContain('Other');
    });

    it('should have a reasonable number of tags', () => {
      expect(INDUSTRY_TAGS.length).toBeGreaterThan(20);
      expect(INDUSTRY_TAGS.length).toBeLessThan(50);
    });
  });

  describe('DIFFICULTY_LEVELS', () => {
    it('should have 5 difficulty levels', () => {
      expect(DIFFICULTY_LEVELS).toHaveLength(5);
    });

    it('should have correct structure', () => {
      DIFFICULTY_LEVELS.forEach((level, index) => {
        expect(level.value).toBe(index + 1);
        expect(level.label).toBeDefined();
        expect(level.color).toBeDefined();
      });
    });
  });

  describe('MARKET_POTENTIAL_LEVELS', () => {
    it('should have 5 market potential levels', () => {
      expect(MARKET_POTENTIAL_LEVELS).toHaveLength(5);
    });

    it('should have correct structure', () => {
      MARKET_POTENTIAL_LEVELS.forEach((level, index) => {
        expect(level.value).toBe(index + 1);
        expect(level.label).toBeDefined();
        expect(level.color).toBeDefined();
      });
    });
  });

  describe('COMPETITION_LEVELS', () => {
    it('should have 5 competition levels', () => {
      expect(COMPETITION_LEVELS).toHaveLength(5);
    });

    it('should have correct structure', () => {
      COMPETITION_LEVELS.forEach((level, index) => {
        expect(level.value).toBe(index + 1);
        expect(level.label).toBeDefined();
        expect(level.color).toBeDefined();
      });
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have auth endpoints', () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/auth/login');
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/api/auth/register');
      expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/api/auth/refresh');
      expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/api/auth/logout');
    });

    it('should have ideas endpoints', () => {
      expect(API_ENDPOINTS.IDEAS.LIST).toBe('/api/ideas');
      expect(API_ENDPOINTS.IDEAS.DETAIL).toBe('/api/ideas/:id');
      expect(API_ENDPOINTS.IDEAS.BOOKMARK).toBe('/api/ideas/:id/bookmark');
      expect(API_ENDPOINTS.IDEAS.BOOKMARKED).toBe('/api/ideas/bookmarked');
    });

    it('should have users endpoints', () => {
      expect(API_ENDPOINTS.USERS.PROFILE).toBe('/api/users/profile');
      expect(API_ENDPOINTS.USERS.UPDATE_PROFILE).toBe('/api/users/profile');
      expect(API_ENDPOINTS.USERS.CHANGE_PASSWORD).toBe('/api/users/password');
      expect(API_ENDPOINTS.USERS.DELETE_ACCOUNT).toBe('/api/users/account');
    });

    it('should have subscriptions endpoints', () => {
      expect(API_ENDPOINTS.SUBSCRIPTIONS.STATUS).toBe('/api/subscriptions/status');
      expect(API_ENDPOINTS.SUBSCRIPTIONS.USAGE).toBe('/api/subscriptions/usage');
      expect(API_ENDPOINTS.SUBSCRIPTIONS.CHECKOUT).toBe('/api/subscriptions/checkout');
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have correct HTTP status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have descriptive error messages', () => {
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe('Invalid email or password');
      expect(ERROR_MESSAGES.USER_EXISTS).toBe('User already exists with this email');
      expect(ERROR_MESSAGES.USER_NOT_FOUND).toBe('User not found');
      expect(ERROR_MESSAGES.INVALID_TOKEN).toBe('Invalid or expired token');
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('Authentication required');
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('should have descriptive success messages', () => {
      expect(SUCCESS_MESSAGES.USER_CREATED).toBe('User created successfully');
      expect(SUCCESS_MESSAGES.LOGIN_SUCCESS).toBe('Login successful');
      expect(SUCCESS_MESSAGES.LOGOUT_SUCCESS).toBe('Logout successful');
      expect(SUCCESS_MESSAGES.PROFILE_UPDATED).toBe('Profile updated successfully');
      expect(SUCCESS_MESSAGES.PASSWORD_CHANGED).toBe('Password changed successfully');
      expect(SUCCESS_MESSAGES.ACCOUNT_DELETED).toBe('Account deleted successfully');
    });
  });
});
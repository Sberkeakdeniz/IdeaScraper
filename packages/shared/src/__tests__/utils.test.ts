import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatScore,
  getDifficultyLabel,
  getMarketPotentialLabel,
  getCompetitionLabel,
  truncateText,
  generateSlug,
  isValidUrl,
  debounce,
  cn,
} from '../utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-07-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('Jul 15, 2023');
    });

    it('should handle string dates', () => {
      const result = formatDate('2023-07-15T10:30:00Z');
      expect(result).toBe('Jul 15, 2023');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const date = new Date('2023-07-15T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('Jul 15, 2023');
      expect(result).toContain('10:30');
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers with K suffix', () => {
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(12000)).toBe('12.0K');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(2100000)).toBe('2.1M');
    });

    it('should return number as string for small numbers', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(999)).toBe('999');
    });
  });

  describe('formatScore', () => {
    it('should format score with one decimal place', () => {
      expect(formatScore(3.567)).toBe('3.6');
      expect(formatScore(4.1)).toBe('4.1');
    });

    it('should return N/A for null scores', () => {
      expect(formatScore(null)).toBe('N/A');
    });
  });

  describe('getDifficultyLabel', () => {
    it('should return correct difficulty labels', () => {
      expect(getDifficultyLabel(1)).toBe('Very Easy');
      expect(getDifficultyLabel(2)).toBe('Easy');
      expect(getDifficultyLabel(3)).toBe('Medium');
      expect(getDifficultyLabel(4)).toBe('Hard');
      expect(getDifficultyLabel(5)).toBe('Very Hard');
      expect(getDifficultyLabel(null)).toBe('Unknown');
    });
  });

  describe('getMarketPotentialLabel', () => {
    it('should return correct market potential labels', () => {
      expect(getMarketPotentialLabel(1)).toBe('Very Low');
      expect(getMarketPotentialLabel(2)).toBe('Low');
      expect(getMarketPotentialLabel(3)).toBe('Medium');
      expect(getMarketPotentialLabel(4)).toBe('High');
      expect(getMarketPotentialLabel(5)).toBe('Very High');
      expect(getMarketPotentialLabel(null)).toBe('Unknown');
    });
  });

  describe('getCompetitionLabel', () => {
    it('should return correct competition labels', () => {
      expect(getCompetitionLabel(1)).toBe('Very Low');
      expect(getCompetitionLabel(2)).toBe('Low');
      expect(getCompetitionLabel(3)).toBe('Medium');
      expect(getCompetitionLabel(4)).toBe('High');
      expect(getCompetitionLabel(5)).toBe('Very High');
      expect(getCompetitionLabel(null)).toBe('Unknown');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      expect(result).toBe('This is a very l...');
      expect(result.length).toBe(20);
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe('Short text');
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slugs', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('AI-Powered Task Manager!')).toBe('ai-powered-task-manager');
      expect(generateSlug('Test   Multiple   Spaces')).toBe('test-multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Test@#$%^&*()Text')).toBe('testttext');
      expect(generateSlug('--Start-End--')).toBe('start-end');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://sub.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', null, 'class2', false, undefined)).toBe('class1 class2');
    });
  });
});
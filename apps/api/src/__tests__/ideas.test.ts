import request from 'supertest';
import express from 'express';
import ideasRoutes from '../routes/ideas';
import { prisma } from '../../../../packages/database/src/index';
import { authenticateToken } from '../middleware/auth';

// Mock dependencies
jest.mock('../../../../packages/database/src/index', () => ({
  prisma: {
    businessIdea: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    userIdeaInteraction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 'user123', email: 'test@example.com', subscriptionTier: 'free' };
    next();
  }),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Ideas Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/ideas', ideasRoutes);
    jest.clearAllMocks();
  });

  describe('GET /ideas', () => {
    it('should return paginated ideas', async () => {
      const mockIdeas = [
        {
          id: 'idea1',
          title: 'Test Idea 1',
          description: 'Test description 1',
          sourceUrl: 'https://reddit.com/r/test/post1',
          sourceSubreddit: 'test',
          redditPostId: 'post1',
          industryTags: ['SaaS', 'Technology'],
          difficultyScore: 3,
          marketPotentialScore: 4,
          competitionScore: 2,
          overallScore: 3.5,
          sentimentScore: 0.8,
          upvotes: 150,
          commentsCount: 25,
          createdAt: new Date(),
          processedAt: new Date(),
          isActive: true,
          interactions: [],
        },
      ];

      mockedPrisma.businessIdea.findMany.mockResolvedValueOnce(mockIdeas);
      mockedPrisma.businessIdea.count.mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/ideas')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ideas');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.ideas).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      });
    });

    it('should filter ideas by industry', async () => {
      mockedPrisma.businessIdea.findMany.mockResolvedValueOnce([]);
      mockedPrisma.businessIdea.count.mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/ideas')
        .query({ industry: ['SaaS', 'Technology'] });

      expect(response.status).toBe(200);
      expect(mockedPrisma.businessIdea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            industryTags: { hasSome: ['SaaS', 'Technology'] },
          }),
        })
      );
    });

    it('should search ideas by title and description', async () => {
      mockedPrisma.businessIdea.findMany.mockResolvedValueOnce([]);
      mockedPrisma.businessIdea.count.mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/ideas')
        .query({ search: 'productivity' });

      expect(response.status).toBe(200);
      expect(mockedPrisma.businessIdea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'productivity', mode: 'insensitive' } },
              { description: { contains: 'productivity', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });
  });

  describe('GET /ideas/:id', () => {
    it('should return a single idea', async () => {
      const mockIdea = {
        id: 'idea1',
        title: 'Test Idea',
        description: 'Test description',
        sourceUrl: 'https://reddit.com/r/test/post1',
        sourceSubreddit: 'test',
        redditPostId: 'post1',
        industryTags: ['SaaS'],
        difficultyScore: 3,
        marketPotentialScore: 4,
        competitionScore: 2,
        overallScore: 3.5,
        sentimentScore: 0.8,
        upvotes: 150,
        commentsCount: 25,
        createdAt: new Date(),
        processedAt: new Date(),
        isActive: true,
        interactions: [],
      };

      mockedPrisma.businessIdea.findUnique.mockResolvedValueOnce(mockIdea);
      mockedPrisma.userIdeaInteraction.upsert.mockResolvedValueOnce({
        id: 'interaction1',
        userId: 'user123',
        ideaId: 'idea1',
        interactionType: 'view',
        createdAt: new Date(),
      });

      const response = await request(app)
        .get('/ideas/idea1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('idea1');
      expect(response.body.title).toBe('Test Idea');
      expect(mockedPrisma.userIdeaInteraction.upsert).toHaveBeenCalled();
    });

    it('should return 404 for non-existent idea', async () => {
      mockedPrisma.businessIdea.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/ideas/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Idea not found');
    });
  });

  describe('POST /ideas/:id/bookmark', () => {
    it('should bookmark an idea', async () => {
      const mockIdea = {
        id: 'idea1',
        title: 'Test Idea',
        description: 'Test description',
        sourceUrl: 'https://reddit.com/r/test/post1',
        sourceSubreddit: 'test',
        redditPostId: 'post1',
        industryTags: ['SaaS'],
        difficultyScore: 3,
        marketPotentialScore: 4,
        competitionScore: 2,
        overallScore: 3.5,
        sentimentScore: 0.8,
        upvotes: 150,
        commentsCount: 25,
        createdAt: new Date(),
        processedAt: new Date(),
        isActive: true,
      };

      mockedPrisma.businessIdea.findUnique.mockResolvedValueOnce(mockIdea);
      mockedPrisma.userIdeaInteraction.findUnique.mockResolvedValueOnce(null);
      mockedPrisma.userIdeaInteraction.create.mockResolvedValueOnce({
        id: 'bookmark1',
        userId: 'user123',
        ideaId: 'idea1',
        interactionType: 'bookmark',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/ideas/idea1/bookmark');

      expect(response.status).toBe(200);
      expect(response.body.bookmarked).toBe(true);
      expect(mockedPrisma.userIdeaInteraction.create).toHaveBeenCalled();
    });

    it('should unbookmark an idea', async () => {
      const mockIdea = {
        id: 'idea1',
        title: 'Test Idea',
        description: 'Test description',
        sourceUrl: 'https://reddit.com/r/test/post1',
        sourceSubreddit: 'test',
        redditPostId: 'post1',
        industryTags: ['SaaS'],
        difficultyScore: 3,
        marketPotentialScore: 4,
        competitionScore: 2,
        overallScore: 3.5,
        sentimentScore: 0.8,
        upvotes: 150,
        commentsCount: 25,
        createdAt: new Date(),
        processedAt: new Date(),
        isActive: true,
      };

      const existingBookmark = {
        id: 'bookmark1',
        userId: 'user123',
        ideaId: 'idea1',
        interactionType: 'bookmark',
        createdAt: new Date(),
      };

      mockedPrisma.businessIdea.findUnique.mockResolvedValueOnce(mockIdea);
      mockedPrisma.userIdeaInteraction.findUnique.mockResolvedValueOnce(existingBookmark);
      mockedPrisma.userIdeaInteraction.delete.mockResolvedValueOnce(existingBookmark);

      const response = await request(app)
        .post('/ideas/idea1/bookmark');

      expect(response.status).toBe(200);
      expect(response.body.bookmarked).toBe(false);
      expect(mockedPrisma.userIdeaInteraction.delete).toHaveBeenCalled();
    });
  });

  describe('GET /ideas/bookmarked', () => {
    it('should return bookmarked ideas', async () => {
      const mockBookmarkedIdeas = [
        {
          id: 'idea1',
          title: 'Bookmarked Idea',
          description: 'Test description',
          sourceUrl: 'https://reddit.com/r/test/post1',
          sourceSubreddit: 'test',
          redditPostId: 'post1',
          industryTags: ['SaaS'],
          difficultyScore: 3,
          marketPotentialScore: 4,
          competitionScore: 2,
          overallScore: 3.5,
          sentimentScore: 0.8,
          upvotes: 150,
          commentsCount: 25,
          createdAt: new Date(),
          processedAt: new Date(),
          isActive: true,
        },
      ];

      mockedPrisma.businessIdea.findMany.mockResolvedValueOnce(mockBookmarkedIdeas);

      const response = await request(app)
        .get('/ideas/bookmarked');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Bookmarked Idea');
    });
  });
});
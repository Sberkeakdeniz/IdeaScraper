import express, { Response, NextFunction } from 'express';
import { query, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const router = express.Router();

// Get ideas with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('industry').optional().isArray(),
  query('difficulty').optional().isArray(),
  query('minScore').optional().isFloat({ min: 0, max: 5 }),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['score', 'date', 'popularity']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      industry,
      difficulty,
      minScore,
      search,
      sortBy = 'score',
      sortOrder = 'desc'
    } = req.query as any;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      isActive: true,
    };

    if (industry && Array.isArray(industry)) {
      where.industryTags = {
        hasSome: industry,
      };
    }

    if (difficulty && Array.isArray(difficulty)) {
      where.difficultyScore = {
        in: difficulty.map(Number),
      };
    }

    if (minScore) {
      where.overallScore = {
        gte: parseFloat(minScore),
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'date':
        orderBy.createdAt = sortOrder;
        break;
      case 'popularity':
        orderBy.upvotes = sortOrder;
        break;
      default:
        orderBy.overallScore = sortOrder;
    }

    const [ideas, total] = await Promise.all([
      prisma.businessIdea.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          interactions: req.user ? {
            where: { userId: req.user.id },
          } : false,
        },
      }),
      prisma.businessIdea.count({ where }),
    ]);

    const ideasWithInteractions = ideas.map(idea => ({
      ...idea,
      isBookmarked: req.user ? idea.interactions?.some(i => i.interactionType === 'bookmark') : false,
      isLiked: req.user ? idea.interactions?.some(i => i.interactionType === 'like') : false,
      interactions: undefined,
    }));

    res.json({
      ideas: ideasWithInteractions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get bookmarked ideas (must be before /:id route)
router.get('/bookmarked', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const bookmarkedIdeas = await prisma.businessIdea.findMany({
      where: {
        isActive: true,
        interactions: {
          some: {
            userId,
            interactionType: 'bookmark',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookmarkedIdeas);
  } catch (error) {
    next(error);
  }
});

// Get single idea
router.get('/:id', [
  param('id').isString(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const idea = await prisma.businessIdea.findUnique({
      where: { id },
      include: {
        interactions: req.user ? {
          where: { userId: req.user.id },
        } : false,
      },
    });

    if (!idea || !idea.isActive) {
      throw createError('Idea not found', 404);
    }

    // Track view interaction
    if (req.user) {
      await prisma.userIdeaInteraction.upsert({
        where: {
          userId_ideaId_interactionType: {
            userId: req.user.id,
            ideaId: id,
            interactionType: 'view',
          },
        },
        update: {},
        create: {
          userId: req.user.id,
          ideaId: id,
          interactionType: 'view',
        },
      });
    }

    const ideaWithInteractions = {
      ...idea,
      isBookmarked: req.user ? idea.interactions?.some(i => i.interactionType === 'bookmark') : false,
      isLiked: req.user ? idea.interactions?.some(i => i.interactionType === 'like') : false,
      interactions: undefined,
    };

    res.json(ideaWithInteractions);
  } catch (error) {
    next(error);
  }
});

// Bookmark/unbookmark idea
router.post('/:id/bookmark', authenticateToken, [
  param('id').isString(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const idea = await prisma.businessIdea.findUnique({
      where: { id },
    });

    if (!idea || !idea.isActive) {
      throw createError('Idea not found', 404);
    }

    const existingBookmark = await prisma.userIdeaInteraction.findUnique({
      where: {
        userId_ideaId_interactionType: {
          userId,
          ideaId: id,
          interactionType: 'bookmark',
        },
      },
    });

    if (existingBookmark) {
      await prisma.userIdeaInteraction.delete({
        where: { id: existingBookmark.id },
      });
      res.json({ bookmarked: false });
    } else {
      await prisma.userIdeaInteraction.create({
        data: {
          userId,
          ideaId: id,
          interactionType: 'bookmark',
        },
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
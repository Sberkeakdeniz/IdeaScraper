import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../utils/supabase';
import { authenticateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Get all ideas with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('subreddit').optional().isString(),
  query('minScore').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['createdAt', 'validationScore', 'upvotes']),
  query('order').optional().isIn(['asc', 'desc']),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const subreddit = req.query.subreddit as string;
    const minScore = parseFloat(req.query.minScore as string);
    const sortBy = req.query.sortBy as string || 'created_at';
    const order = req.query.order as string || 'desc';

    // Build query
    let query = supabase
      .from('business_ideas')
      .select('*', { count: 'exact' });

    // Apply filters
    if (subreddit) {
      query = query.eq('subreddit', subreddit);
    }
    if (!isNaN(minScore)) {
      query = query.gte('validation_score', minScore);
    }

    // Apply sorting
    const sortColumn = sortBy === 'createdAt' ? 'created_at' : 
                       sortBy === 'validationScore' ? 'validation_score' : 
                       sortBy;
    query = query.order(sortColumn, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw createError('Failed to fetch ideas', 500);
    }

    res.json({
      success: true,
      data: ideas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single idea by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data: idea, error } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !idea) {
      throw createError('Idea not found', 404);
    }

    res.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    next(error);
  }
});

// Create new idea
router.post('/', [
  body('title').isString().isLength({ min: 1, max: 500 }),
  body('description').isString().isLength({ min: 1 }),
  body('redditUrl').isURL(),
  body('subreddit').isString(),
  body('upvotes').optional().isInt({ min: 0 }),
  body('commentCount').optional().isInt({ min: 0 }),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400);
    }

    const ideaData = {
      title: req.body.title,
      description: req.body.description,
      reddit_url: req.body.redditUrl,
      subreddit: req.body.subreddit,
      upvotes: req.body.upvotes || 0,
      comment_count: req.body.commentCount || 0,
      market_size: req.body.marketSize,
      target_audience: req.body.targetAudience,
      monetization_strategy: req.body.monetizationStrategy,
      competitor_analysis: req.body.competitorAnalysis,
      validation_score: req.body.validationScore,
      sentiment: req.body.sentiment,
    };

    const { data: idea, error } = await supabaseAdmin
      .from('business_ideas')
      .insert(ideaData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') { // Unique constraint violation
        throw createError('This Reddit URL already exists', 409);
      }
      throw createError('Failed to create idea', 500);
    }

    res.status(201).json({
      success: true,
      data: idea,
      message: 'Idea created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Trigger scraping endpoint
router.post('/scrape', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint triggers the Python scraper
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Get the scraper directory path
    const scraperDir = path.join(__dirname, '../../../scraper');
    const pythonPath = "C:\\Users\\PC\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";
    const scriptPath = path.join(scraperDir, 'run_full_scraper.py');
    
    // Start the scraping process
    const scraperProcess = spawn(pythonPath, [scriptPath], {
      cwd: scraperDir,
      detached: true,
      stdio: 'ignore'
    });
    
    // Don't wait for the process to finish
    scraperProcess.unref();
    
    res.json({
      success: true,
      message: 'Scraping process started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scraping trigger error:', error);
    next(createError('Failed to start scraping process', 500));
  }
});

export default router;
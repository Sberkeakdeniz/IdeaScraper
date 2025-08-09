import express, { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

const router = express.Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    // Expected to fail with table not found, but connection should work
    const supabaseStatus = error && error.message.includes('schema cache') ? 'connected' : 'error';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        supabase: supabaseStatus,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

export default router;
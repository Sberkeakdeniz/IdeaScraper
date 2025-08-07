import express from 'express';

/**
 * Middleware to capture raw body for webhook signature verification
 * This must be used before express.json() middleware for webhooks
 */
export const captureRawBody = (
  req: express.Request & { rawBody?: Buffer },
  res: express.Response,
  next: express.NextFunction
) => {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });

  req.on('error', (error) => {
    console.error('Error reading request body:', error);
    next(error);
  });
};
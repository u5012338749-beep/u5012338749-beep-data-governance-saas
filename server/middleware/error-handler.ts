import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details,
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
    });
  }

  if (err.code === '23503') {
    return res.status(404).json({
      error: 'Referenced resource not found',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

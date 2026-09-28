import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[API Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
}

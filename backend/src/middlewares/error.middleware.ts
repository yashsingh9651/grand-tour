import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Catch 404 and forward to error handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Error Handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If status is 200 but error occurred, set to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Prisma unique constraint violation error
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Duplicate field value entered: ${err.meta?.target?.join(', ')}`;
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (statusCode >= 500) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

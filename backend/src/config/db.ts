import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Only log warnings and errors to avoid extra DB connections per query log
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connection successfully established via Prisma');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

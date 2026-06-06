import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
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

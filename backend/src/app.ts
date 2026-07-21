import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { notFound, errorHandler } from './middlewares/error.middleware';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import applicationRoutes from './routes/application.routes';
import interviewRoutes from './routes/interview.routes';
import workflowRoutes from './routes/workflow.routes';
import activityRoutes from './routes/activity.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import permissionRoutes from './routes/permission.routes';
import documentRoutes from './routes/document.routes';
import paymentRoutes from './routes/payment.routes';
import hotelRoutes from './routes/hotel.routes';
import emailTemplateRoutes from './routes/emailTemplate.routes';
import applicationPageContentRoutes from './routes/applicationPageContent.routes';
import workpermitRoutes from './routes/workpermit.routes';
import visaRoutes from './routes/visa.routes';
import travelRoutes from './routes/travel.routes';
import documentTemplateRoutes from './routes/documentTemplate.routes';
import studentCategoryRoutes from './routes/studentCategory.routes';
import blogRoutes from './routes/blog.routes';





const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/application-page-content', applicationPageContentRoutes);
app.use('/api/workpermit', workpermitRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/document-templates', documentTemplateRoutes);
app.use('/api/student-categories', studentCategoryRoutes);
app.use('/api/blogs', blogRoutes);





// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is running successfully' });
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;

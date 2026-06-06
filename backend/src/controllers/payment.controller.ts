import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import activityService from '../services/activity.service';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../config/db';

export const submitPayment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { amount, description, utrNumber, screenshotUrl } = req.body;

  const application = await prisma.application.findUnique({
    where: { userId }
  });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const payment = await paymentService.createPayment({
    userId,
    applicationId: application.id,
    amount: parseFloat(amount),
    description,
    utrNumber,
    screenshotUrl,
  });

  // Log activity
  await activityService.log(
    `Payment submitted: ₹${amount} (UTR: ${utrNumber})`,
    'PAYMENT_SUBMITTED',
    undefined,
    userId
  );

  res.status(201).json({
    success: true,
    data: payment,
  });
};

export const getPayments = async (req: Request, res: Response) => {
  const payments = await paymentService.getAllPayments();
  res.status(200).json({
    success: true,
    data: payments,
  });
};

export const approvePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // COMPLETED or FAILED

  const payment = await paymentService.updatePaymentStatus(id, status as PaymentStatus);

  // Log activity
  await activityService.log(
    `Payment ${status.toLowerCase()}: ₹${payment.amount}`,
    'PAYMENT_UPDATE',
    undefined,
    (req as any).user?.id
  );

  // If payment is completed, move application to hotel step
  if (status === 'COMPLETED') {
    const application = await prisma.application.findFirst({
      where: { userId: payment.userId }
    });
    
    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { currentStepId: 'hotel' }
      });
      
      await activityService.log(
        'Application moved to Hotel Allocation step',
        'APPLICATION_MOVE',
        application.id,
        (req as any).user?.id
      );
    }
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
};

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

  // If payment is completed, move application to the correct next step
  if (status === 'COMPLETED') {
    const application = await prisma.application.findFirst({
      where: { userId: payment.userId }
    });
    
    if (application) {
      // Determine next step and update relation IDs based on payment description
      const desc = (payment.description || '').toLowerCase();
      let nextStep = 'hotel'; // default (payment1)
      let updateData: any = { currentStepId: nextStep };

      if (desc.includes('payment2') || desc.includes('2nd installment') || desc.includes('hotel')) {
        nextStep = 'contract';
        updateData = {
          currentStepId: nextStep,
          payment2Id: payment.id
        };
      } else if (desc.includes('payment3') || desc.includes('3rd installment') || desc.includes('contract')) {
        nextStep = 'workpermit';
        updateData = {
          currentStepId: nextStep,
          payment3Id: payment.id
        };
      } else {
        // Default to payment1
        updateData = {
          currentStepId: nextStep,
          payment1Id: payment.id
        };
      }

      await prisma.application.update({
        where: { id: application.id },
        data: updateData
      });
      
      await activityService.log(
        `Application moved to ${nextStep} step`,
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


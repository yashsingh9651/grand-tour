import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import activityService from '../services/activity.service';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../config/db';

export const submitPayment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { amount, description, utrNumber, screenshotUrl } = req.body;

  const finalUtr = (utrNumber && typeof utrNumber === 'string' && utrNumber.trim() !== '') 
    ? utrNumber.trim() 
    : 'N/A';

  const application = await prisma.application.findUnique({
    where: { userId }
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  const payment = await paymentService.createPayment({
    userId,
    applicationId: application.id,
    amount: parseFloat(amount),
    description,
    utrNumber: finalUtr,
    screenshotUrl,
  });

  // Log activity
  await activityService.log(
    `Payment submitted: ₹${amount}${finalUtr !== 'N/A' ? ` (UTR: ${finalUtr})` : ''}`,
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

  // If payment is completed, move application to the correct next step in active workflow
  if (status === 'COMPLETED') {
    const application = await prisma.application.findFirst({
      where: { userId: payment.userId }
    });
    
    if (application) {
      const workflowService = (await import('../services/workflow.service')).default;
      const activeWorkflow = await workflowService.getWorkflow();
      const rawSteps = (activeWorkflow?.steps as any[]) || [];
      const steps = [...rawSteps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

      const desc = (payment.description || '').toLowerCase();
      let stepKey = 'payment1';

      if (desc.includes('payment2') || desc.includes('2nd installment')) {
        stepKey = 'payment2';
      } else if (desc.includes('payment3') || desc.includes('3rd installment')) {
        stepKey = 'payment3';
      }

      const currentIdx = steps.findIndex((s: any) => s.id === stepKey);
      const nextStepObj = currentIdx >= 0 && currentIdx < steps.length - 1 ? steps[currentIdx + 1] : null;
      let nextStep = nextStepObj ? nextStepObj.id : (stepKey === 'payment1' ? 'hotel' : stepKey === 'payment2' ? 'contract' : 'visapayments');

      let updateData: any = { currentStepId: nextStep };

      if (stepKey === 'payment2') {
        updateData = { currentStepId: nextStep, payment2Id: payment.id };
      } else if (stepKey === 'payment3') {
        updateData = { currentStepId: nextStep, payment3Id: payment.id };
      } else {
        const visaStep = steps.find((s: any) => s.id === 'visapayments');
        const amounts = visaStep?.amounts || {};

        const visaName = (amounts.visaFeeName || 'visa fee').toLowerCase();
        const sevisName = (amounts.sevisFeeName || 'sevis fee').toLowerCase();
        const miscName = (amounts.miscFeeName || 'misc fee').toLowerCase();

        const isVisaPayment = 
          desc.includes('visa fee') || desc.includes(visaName) ||
          desc.includes('sevis fee') || desc.includes(sevisName) ||
          desc.includes('misc fee') || desc.includes('miscellaneous fee') || desc.includes(miscName) ||
          desc.includes('visapayments');

        if (isVisaPayment) {
          const allCompletedPayments = await prisma.payment.findMany({
            where: { 
              userId: payment.userId,
              status: 'COMPLETED'
            }
          });
          
          const visaFeePaid = allCompletedPayments.some(p => {
            const pDesc = (p.description || '').toLowerCase();
            return pDesc.includes('visa fee') || pDesc.includes(visaName);
          });
          const sevisFeePaid = allCompletedPayments.some(p => {
            const pDesc = (p.description || '').toLowerCase();
            return pDesc.includes('sevis fee') || pDesc.includes(sevisName);
          });
          const miscFeePaid = allCompletedPayments.some(p => {
            const pDesc = (p.description || '').toLowerCase();
            return pDesc.includes('misc fee') || pDesc.includes('miscellaneous fee') || pDesc.includes(miscName);
          });

          if (visaFeePaid && sevisFeePaid && miscFeePaid) {
            const visaPaymentsIdx = steps.findIndex((s: any) => s.id === 'visapayments');
            const stepAfterVisa = visaPaymentsIdx >= 0 && visaPaymentsIdx < steps.length - 1 ? steps[visaPaymentsIdx + 1].id : 'visa';
            
            await prisma.application.update({
              where: { id: application.id },
              data: { currentStepId: stepAfterVisa }
            });
            
            await activityService.log(
              `Application moved to ${stepAfterVisa} step (all visa payments approved)`,
              'APPLICATION_MOVE',
              application.id,
              (req as any).user?.id
            );
          }
          
          return res.status(200).json({
            success: true,
            data: payment,
          });
        } else {
          updateData = {
            currentStepId: nextStep,
            payment1Id: payment.id
          };
        }
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


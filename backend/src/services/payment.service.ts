import { prisma } from '../config/db';
import { PaymentStatus } from '@prisma/client';
import emailService from './email.service';
import notificationService from './notification.service';


class PaymentService {
  async createPayment(data: {
    userId: string;
    applicationId: string;
    amount: number;
    description?: string;
    utrNumber: string;
    screenshotUrl: string;
  }) {
    const payment = await prisma.payment.create({
      data: {
        userId: data.userId,
        applicationId: data.applicationId,
        amount: data.amount,
        description: data.description,
        utrNumber: data.utrNumber,
        screenshotUrl: data.screenshotUrl,
        status: PaymentStatus.PENDING,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    if (user) {
      try {
        await emailService.sendPaymentSubmittedEmail(user.email, {
          studentName: `${user.firstName} ${user.lastName}`.trim(),
          amount: payment.amount.toString(),
          paymentType: payment.description || 'Application Fee',
          applicationId: payment.applicationId
        });

        await notificationService.notify(
          data.userId,
          'Payment Submitted',
          'Your payment has been submitted and is awaiting review.',
          'INFO'
        );
      } catch (error) {
        console.error('Failed to send payment submitted email or notification:', error);
      }
    }

    return payment;
  }

  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        user: true,
      },
    });

    if (status === PaymentStatus.COMPLETED) {
      try {
        await emailService.sendPaymentConfirmationEmail(payment.user.email, {
          studentName: `${payment.user.firstName} ${payment.user.lastName}`,
          amount: payment.amount.toString(),
          paymentType: payment.description || 'Application Fee',
          applicationId: payment.applicationId
        });

        await notificationService.notify(
          payment.userId,
          'Payment Confirmed',
          `Your payment of ₹${payment.amount} has been approved.`,
          'SUCCESS'
        );
      } catch (error) {
        console.error('Failed to send payment confirmation email or notification:', error);
      }
    }

    return payment;

  }
}

export default new PaymentService();

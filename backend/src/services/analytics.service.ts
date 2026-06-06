import { prisma } from '../config/db';

class AnalyticsService {
  async getDashboardStats() {
    const [
      totalCandidates,
      pendingApplications,
      acceptedApplications,
      totalRevenue,
      recentApplications
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      })
    ]);

    // Conversion rate (Acceptance rate)
    const conversionRate = totalCandidates > 0 
      ? Math.round((acceptedApplications / totalCandidates) * 100) 
      : 0;

    return {
      stats: {
        totalCandidates,
        pendingApplications,
        acceptedApplications,
        totalRevenue: totalRevenue._sum.amount || 0,
        conversionRate
      },
      recentApplications
    };
  }

  async getWorkflowStats() {
    // Count applications per status
    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    return stats.map(s => ({
      status: s.status,
      count: s._count.id
    }));
  }
}

export default new AnalyticsService();

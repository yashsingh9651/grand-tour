import { prisma } from '../config/db';

class AnalyticsService {
  async getDashboardStats() {
    // Use a single groupBy to count all statuses in one DB round-trip
    // instead of 3 separate count() calls
    const [statusCounts, totalRevenue, recentApplications] = await Promise.all([
      prisma.application.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
    ]);

    // Derive counts from the groupBy result
    const countMap = statusCounts.reduce((acc: Record<string, number>, s) => {
      acc[s.status] = s._count.id;
      return acc;
    }, {});

    const totalCandidates = statusCounts.reduce((sum, s) => sum + s._count.id, 0);
    const pendingApplications = countMap['PENDING'] || 0;
    const acceptedApplications = countMap['ACCEPTED'] || 0;

    const conversionRate = totalCandidates > 0
      ? Math.round((acceptedApplications / totalCandidates) * 100)
      : 0;

    return {
      stats: {
        totalCandidates,
        pendingApplications,
        acceptedApplications,
        totalRevenue: totalRevenue._sum.amount || 0,
        conversionRate,
      },
      recentApplications,
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

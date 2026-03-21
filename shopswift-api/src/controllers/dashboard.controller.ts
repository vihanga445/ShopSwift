import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueByDayRaw,
      revenueByCategoryRaw,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'Delivered' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'Customer' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'Cancelled' } },
        _sum: { totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: { not: 'Cancelled' } } },
        include: { product: { include: { category: true } } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const revenueByDay = revenueByDayRaw.map((r) => ({
      date: r.createdAt.toISOString().slice(0, 10),
      revenue: Number(r._sum.totalAmount || 0),
    }));

    const categoryMap: Record<string, number> = {};
    for (const item of revenueByCategoryRaw) {
      const cat = item.product.category.name;
      categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity * Number(item.unitPrice);
    }

    const revenueByCategory = Object.entries(categoryMap)
      .map(([categoryName, revenue]) => ({ categoryName, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueByDay,
      revenueByCategory,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: `${o.user.firstName} ${o.user.lastName}`,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}
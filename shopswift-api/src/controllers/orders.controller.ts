import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

// 1. POST /api/orders/create-payment-intent
export async function createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { shippingAddress, shippingCity, shippingCountry, shippingPostalCode } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return next(createError('Cart is empty', 400));
    }

    // Check if products are still in stock before asking for money
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return next(createError(`${item.product.name} is no longer available`, 400));
      }
      if (item.product.stock < item.quantity) {
        return next(createError(`Insufficient stock for ${item.product.name}`, 400));
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.priceAtAdding), 0
    );

    // Stripe expects amount in cents ($10.50 = 1050)
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(userId),
        shippingAddress: shippingAddress || '',
        shippingCity: shippingCity || '',
        shippingCountry: shippingCountry || '',
        shippingPostalCode: shippingPostalCode || '',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
    });
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/orders (Current User's History)
export async function getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(formatOrder));
  } catch (error) { next(error); }
}

// 3. GET /api/orders/:id
export async function getOrderById(req: AuthRequest<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user!.userId },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!order) return next(createError('Order not found', 404));
    res.json(formatOrder(order));
  } catch (error) { next(error); }
}

// 4. ADMIN: GET /api/admin/orders
export async function getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const [totalCount, orders] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
    ]);
    res.json({
      items: orders.map(formatOrder),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) { next(error); }
}

// 5. ADMIN: PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req: AuthRequest<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return next(createError(`Invalid status: ${status}`, 400));
    }
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json(formatOrder(order));
  } catch (error) { next(error); }
}

// Helper function to format order response
function formatOrder(order: any) {
  return {
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    stripePaymentIntentId: order.stripePaymentIntentId,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingCountry: order.shippingCountry,
    shippingPostalCode: order.shippingPostalCode,
    createdAt: order.createdAt,
    customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : '',
    customerEmail: order.user?.email || '',
    items: (order.items || []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      subtotal: i.quantity * Number(i.unitPrice),
    })),
  };
}
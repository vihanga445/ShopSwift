import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-04-10' as any 
});

export async function stripeWebhook(req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // CRITICAL: req.body must be the raw Buffer here (not parsed JSON)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    try {
      await createOrderFromPaymentIntent(paymentIntent);
    } catch (err) {
      console.error('Order creation failed:', err);
      // We still return 200 so Stripe doesn't keep retrying a broken order
    }
  }

  res.json({ received: true });
}

async function createOrderFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  // 1. Idempotency: Don't create the same order twice if Stripe sends two notifications
  const existing = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
  if (existing) return;

  const userId = parseInt(paymentIntent.metadata.userId);
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) throw new Error('Cart not found or empty');

  const total = cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.priceAtAdding), 0
  );

  // 2. The Transaction: Everything below must happen TOGETHER or not at all
  await prisma.$transaction(async (tx) => {
    // A. Create the Order and OrderItems
    const order = await tx.order.create({
      data: {
        userId,
        status: 'Pending',
        totalAmount: total,
        stripePaymentIntentId: paymentIntent.id,
        shippingAddress: paymentIntent.metadata.shippingAddress || '',
        shippingCity: paymentIntent.metadata.shippingCity || '',
        shippingCountry: paymentIntent.metadata.shippingCountry || '',
        shippingPostalCode: paymentIntent.metadata.shippingPostalCode || '',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            productName: item.product.name, // We save the name now in case it changes later
            quantity: item.quantity,
            unitPrice: item.priceAtAdding, // We save the price now in case it changes later
          })),
        },
      },
    });

    // B. Reduce stock for each product
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // C. Clear the customer's cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

    console.log(`Order ${order.id} created for PaymentIntent ${paymentIntent.id}`);
  });
}
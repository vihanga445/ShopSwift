import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

// Helper: get or create cart for user
async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: { include: { product: true }, orderBy: { id: 'asc' } },
      },
    });
  }
  return cart;
}

// Helper: format cart for response
function formatCart(cart: any) {
  const items = cart.items.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImageUrl: item.product.imageUrl,
    productPrice: Number(item.product.price),
    productStock: item.product.stock,
    quantity: item.quantity,
    priceAtAdding: Number(item.priceAtAdding),
    subtotal: item.quantity * Number(item.priceAtAdding),
  }));

  return {
    id: cart.id,
    updatedAt: cart.updatedAt,
    items,
    totalItems: items.reduce((s: number, i: any) => s + i.quantity, 0),
    totalAmount: items.reduce((s: number, i: any) => s + i.subtotal, 0),
  };
}

// GET /api/cart
export async function getCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cart = await getOrCreateCart(req.user!.userId);
    res.json(formatCart(cart));
  } catch (error) { next(error); }
}

// POST /api/cart/items
export async function addItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user!.userId;

    const product = await prisma.product.findUnique({ 
      where: { id: parseInt(productId), isActive: true } 
    });
    
    if (!product) return next(createError('Product not found', 404));
    if (product.stock < quantity) {
      return next(createError(`Only ${product.stock} units available`, 400));
    }

    const cart = await getOrCreateCart(userId);
    const existingItem = cart.items.find((i: any) => i.productId === parseInt(productId));

    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return next(createError(`Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} available`, 400));
      }
      await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQty } });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          priceAtAdding: product.price,
        },
      });
    }

    await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
    const updatedCart = await getOrCreateCart(userId);
    res.json(formatCart(updatedCart));
  } catch (error) { next(error); }
}

// PATCH /api/cart/items/:itemId
export async function updateItem(req: AuthRequest<{ itemId: string }>, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;
    const userId = req.user!.userId;

    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) return next(createError('Cart item not found', 404));

    if (parseInt(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product && parseInt(quantity) > product.stock) {
        return next(createError(`Only ${product.stock} units available`, 400));
      }
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: parseInt(quantity) } });
    }

    await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
    const updatedCart = await getOrCreateCart(userId);
    res.json(formatCart(updatedCart));
  } catch (error) { next(error); }
}

// DELETE /api/cart/items/:itemId
export async function removeItem(req: AuthRequest<{ itemId: string }>, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    const userId = req.user!.userId;

    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) return next(createError('Cart item not found', 404));

    await prisma.cartItem.delete({ where: { id: itemId } });
    await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

    const updatedCart = await getOrCreateCart(userId);
    res.json(formatCart(updatedCart));
  } catch (error) { next(error); }
}

// DELETE /api/cart
export async function clearCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
    }
    res.status(204).send();
  } catch (error) { next(error); }
}
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, categoryId, minPrice, maxPrice, sort = 'newest', page = '1', pageSize = '12' } = req.query as any;

    const pageNum = Math.max(1, parseInt(page));
    const pageSz = Math.min(48, Math.max(1, parseInt(pageSize)));
    const skip = (pageNum - 1) * pageSz;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any =
      sort === 'price_asc' ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
      sort === 'name_asc' ? { name: 'asc' } :
      { createdAt: 'desc' };

    const [totalCount, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where, orderBy, skip, take: pageSz,
        include: { category: { select: { name: true } } },
      }),
    ]);

    const mapped = items.map(p => ({
      ...p,
      price: Number(p.price),
      categoryName: p.category.name,
    }));

    res.json({
      items: mapped,
      totalCount,
      page: pageNum,
      pageSize: pageSz,
      totalPages: Math.ceil(totalCount / pageSz),
      hasNextPage: pageNum < Math.ceil(totalCount / pageSz),
      hasPreviousPage: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: { select: { name: true } } },
    });
    res.json(products.map(p => ({
      ...p, price: Number(p.price), categoryName: p.category.name,
    })));
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id), isActive: true },
      include: { category: { select: { name: true } } },
    });
    if (!product) return next(createError('Product not found', 404));
    res.json({ ...product, price: Number(product.price), categoryName: product.category.name });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    res.json(categories.map(c => ({
      id: c.id, name: c.name, slug: c.slug,
      description: c.description,
      productCount: c._count.products,
    })));
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, price, stock, categoryId, isFeatured } = req.body;
    const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });
    if (!category) return next(createError('Category not found', 404));

    const product = await prisma.product.create({
      data: {
        name, description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        isFeatured: Boolean(isFeatured),
        imageUrl: 'https://via.placeholder.com/400?text=No+Image',
      },
      include: { category: { select: { name: true } } },
    });

    res.status(201).json({ ...product, price: Number(product.price), categoryName: product.category.name });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, stock, categoryId, isFeatured, isActive } = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return next(createError('Product not found', 404));

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId !== undefined && { categoryId: parseInt(categoryId) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: { category: { select: { name: true } } },
    });

    res.json({ ...product, price: Number(product.price), categoryName: product.category.name });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function uploadProductImage(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return next(createError('Product not found', 404));
    if (!req.file) return next(createError('No file uploaded', 400));

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'shopswift/products', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file!.buffer);
    });

    const updated = await prisma.product.update({
      where: { id },
      data: { imageUrl: result.secure_url, imagePublicId: result.public_id },
    });

    res.json({ imageUrl: updated.imageUrl });
  } catch (error) {
    next(error);
  }
}
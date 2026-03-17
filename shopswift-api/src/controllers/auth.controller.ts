import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import {
  generateAccessToken, generateRefreshToken,
  hashToken, getRefreshTokenExpiry
} from '../utils/jwt';
import { AuthRequest } from '../types';
import { createError } from '../middleware/errorHandler';

async function buildAuthResponse(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  const accessToken = generateAccessToken({
    userId: user.id, email: user.email, role: user.role,
  });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user.id, email: user.email,
      firstName: user.firstName, lastName: user.lastName, role: user.role,
    },
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return next(createError('Email already in use', 409));

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, firstName, lastName },
    });

    const result = await buildAuthResponse(user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return next(createError('Invalid email or password', 401));
    }
    if (!user.isActive) return next(createError('Account is disabled', 401));

    const result = await buildAuthResponse(user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('Refresh token required', 400));

    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: {
        token: tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored) return next(createError('Invalid or expired refresh token', 401));

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const result = await buildAuthResponse(stored.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: hashToken(refreshToken) },
        data: { isRevoked: true },
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!user) return next(createError('User not found', 404));
    res.json(user);
  } catch (error) {
    next(error);
  }
}
import { Request } from 'express';

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest<P = any> extends Request<P> {
  user?: AuthPayload;
}

export interface ApiError extends Error {
  statusCode?: number;
}
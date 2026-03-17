import { Request } from 'express';

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiError extends Error {
  statusCode?: number;
}
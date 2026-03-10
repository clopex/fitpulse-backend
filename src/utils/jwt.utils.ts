import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;

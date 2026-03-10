import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Unauthorized', 401);
    return;
  }
  try {
    req.user = verifyToken(authHeader.split(' ')[1]);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};

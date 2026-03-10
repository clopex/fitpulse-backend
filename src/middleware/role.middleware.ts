import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { sendError } from '../utils/response.utils';

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) { sendError(res, 'Forbidden', 403); return; }
    next();
  };

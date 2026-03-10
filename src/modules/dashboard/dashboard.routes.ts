import { Router } from 'express';
import { stats } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const dashboardRoutes = Router();

dashboardRoutes.get('/stats', authMiddleware, requireRole('admin'), stats);
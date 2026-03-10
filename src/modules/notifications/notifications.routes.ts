import { Router } from 'express';
import { getNotifications, readNotification, readAll, sendNotification, removeNotification } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const notificationsRoutes = Router();

// Authenticated user
notificationsRoutes.get('/',              authMiddleware, getNotifications);
notificationsRoutes.patch('/:id/read',    authMiddleware, readNotification);
notificationsRoutes.patch('/read-all',    authMiddleware, readAll);
notificationsRoutes.delete('/:id',        authMiddleware, removeNotification);

// Admin only
notificationsRoutes.post('/send',         authMiddleware, requireRole('admin'), sendNotification);
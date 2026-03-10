import { Router } from 'express';
import { getMySubscription, getSubscriptions, subscribe, cancel, stats } from './subscriptions.controller';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const subscriptionsRoutes = Router();

const subscribeValidator = [
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['free', 'basic', 'pro']).withMessage('Plan must be free, basic or pro'),
];

// Authenticated user
subscriptionsRoutes.get('/me',     authMiddleware, getMySubscription);
subscriptionsRoutes.post('/',      authMiddleware, subscribeValidator, validate, subscribe);
subscriptionsRoutes.delete('/me',  authMiddleware, cancel);

// Admin only
subscriptionsRoutes.get('/',       authMiddleware, requireRole('admin'), getSubscriptions);
subscriptionsRoutes.get('/stats',  authMiddleware, requireRole('admin'), stats);
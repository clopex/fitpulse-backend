import { Router } from 'express';
import { createPaymentIntent, confirmPayment } from './payment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.post('/create-intent', authMiddleware, createPaymentIntent);
router.post('/confirm',       authMiddleware, confirmPayment);
export default router;
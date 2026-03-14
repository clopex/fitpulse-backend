import { Router } from 'express';
import { createPaymentIntent, confirmPayment } from './payment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm',       authenticate, confirmPayment);
export default router;
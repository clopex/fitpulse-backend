import { Request, Response } from 'express';
import Stripe from 'stripe';
import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';
import { sendSuccess, sendError } from '../../utils/response.utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_PRICES: Record<string, number> = {
  basic: 900,   // $9.00
  pro:   1900,  // $19.00
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const userId   = (req as any).user.userId;

    if (!PLAN_PRICES[plan]) return sendError(res, 'Invalid plan', 400);

    const intent = await stripe.paymentIntents.create({
      amount:   PLAN_PRICES[plan],
      currency: 'usd',
      metadata: { userId, plan },
    });

    return sendSuccess(res, { clientSecret: intent.client_secret, amount: PLAN_PRICES[plan] });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, plan } = req.body;
    const userId = (req as any).user.userId;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') return sendError(res, 'Payment not completed', 400);

    const existing = await sequelize.query(
      'SELECT id FROM subscriptions WHERE user_id = $1',
      { bind: [userId], type: QueryTypes.SELECT }
    ) as any[];

    const now     = new Date();
    const endDate = new Date(now.setMonth(now.getMonth() + 1));

    if (existing.length > 0) {
      await sequelize.query(
        'UPDATE subscriptions SET plan = $1, status = $2, current_period_end = $3, updated_at = NOW() WHERE user_id = $4',
        { bind: [plan, 'active', endDate, userId], type: QueryTypes.UPDATE }
      );
    } else {
      await sequelize.query(
        'INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end) VALUES ($1, $2, $3, NOW(), $4)',
        { bind: [userId, plan, 'active', endDate], type: QueryTypes.INSERT }
      );
    }

    return sendSuccess(res, { plan, status: 'active' }, 'Subscription activated');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};
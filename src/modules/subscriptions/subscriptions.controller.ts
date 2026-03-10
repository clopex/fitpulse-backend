import { Request, Response } from 'express';
import { getUserSubscription, getAllSubscriptions, createOrUpdateSubscription, cancelSubscription, getSubscriptionStats } from './subscriptions.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscription = await getUserSubscription(req.user!.userId);
    sendSuccess(res, subscription);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getAllSubscriptions(page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    if (!['free', 'basic', 'pro'].includes(plan)) {
      sendError(res, 'Invalid plan', 400);
      return;
    }
    const subscription = await createOrUpdateSubscription(req.user!.userId, { plan });
    sendSuccess(res, subscription, 'Subscription updated', 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscription = await cancelSubscription(req.user!.userId);
    sendSuccess(res, subscription, 'Subscription cancelled');
  } catch (err: any) {
    const status = err.message === 'Subscription not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};

export const stats = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getSubscriptionStats();
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};
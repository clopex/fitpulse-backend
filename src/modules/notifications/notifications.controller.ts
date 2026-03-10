import { Request, Response } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead, createNotification, sendBulkNotification, deleteNotification } from './notifications.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getUserNotifications(req.user!.userId, page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const readNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await markAsRead(req.params.id, req.user!.userId);
    sendSuccess(res, notification, 'Marked as read');
  } catch (err: any) {
    const status = err.message === 'Notification not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};

export const readAll = async (req: Request, res: Response): Promise<void> => {
  try {
    await markAllAsRead(req.user!.userId);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const sendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, user_ids, type, title, body, payload } = req.body;

    if (user_ids && Array.isArray(user_ids)) {
      const result = await sendBulkNotification({ user_ids, type, title, body, payload });
      sendSuccess(res, result, 'Notifications sent', 201);
    } else {
      const notification = await createNotification({ user_id, type, title, body, payload });
      sendSuccess(res, notification, 'Notification sent', 201);
    }
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteNotification(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Notification deleted');
  } catch (err: any) {
    const status = err.message === 'Notification not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};
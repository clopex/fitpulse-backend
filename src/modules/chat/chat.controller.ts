import { Request, Response } from 'express';
import { getConversations, getMessages, sendMessage, markMessagesAsRead, deleteMessage } from './chat.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const conversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getConversations(req.user!.userId);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const messages = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const data  = await getMessages(req.user!.userId, req.params.userId, page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const send = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver_id, content } = req.body;
    const message = await sendMessage(req.user!.userId, receiver_id, content);
    sendSuccess(res, message, 'Message sent', 201);
  } catch (err: any) {
    const status = err.message === 'Receiver not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};

export const readMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    await markMessagesAsRead(req.params.userId, req.user!.userId);
    sendSuccess(res, null, 'Messages marked as read');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteMessage(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Message deleted');
  } catch (err: any) {
    const status = err.message === 'Message not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};
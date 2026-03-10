import { Request, Response } from 'express';
import { getDashboardStats } from './dashboard.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const stats = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getDashboardStats();
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};
import { Request, Response } from 'express';
import { getAllUsers, getUserById, updateUser, toggleUserActive, deleteUser } from './users.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getAllUsers(page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, avatar_url } = req.body;
    const user = await updateUser(req.user!.userId, { name, avatar_url });
    sendSuccess(res, user, 'Profile updated');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const toggleActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { is_active } = req.body;
    const user = await toggleUserActive(req.params.id, is_active);
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user, `User ${is_active ? 'activated' : 'deactivated'}`);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteUser(req.params.id);
    sendSuccess(res, null, 'User deleted');
  } catch (err: any) {
    sendError(res, err.message);
  }
};
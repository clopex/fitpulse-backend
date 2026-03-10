import { Request, Response } from 'express';
import { registerUser, loginUser, getMe } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const data = await registerUser(name, email, password);
    sendSuccess(res, data, 'Registration successful', 201);
  } catch (err: any) {
    const status = err.message === 'Email already in use' ? 409 : 500;
    sendError(res, err.message, status);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    sendSuccess(res, data, 'Login successful');
  } catch (err: any) {
    const status = err.message === 'Invalid credentials' ? 401 : 
                   err.message === 'Account is deactivated' ? 403 : 500;
    sendError(res, err.message, status);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getMe(req.user!.userId);
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch (err: any) {
    sendError(res, err.message);
  }
};
import { Request, Response } from 'express';
import { getAllTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer, getTrainerByUserId } from './trainers.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getTrainers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getAllTrainers(page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const trainer = await getTrainerById(req.params.id);
    if (!trainer) { sendError(res, 'Trainer not found', 404); return; }
    sendSuccess(res, trainer);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getMyTrainerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const trainer = await getTrainerByUserId(req.user!.userId);
    if (!trainer) { sendError(res, 'Trainer profile not found', 404); return; }
    sendSuccess(res, trainer);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const addTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, bio, specialization } = req.body;
    const trainer = await createTrainer(user_id, { bio, specialization });
    sendSuccess(res, trainer, 'Trainer created', 201);
  } catch (err: any) {
    const status = err.message === 'User is already a trainer' ? 409 : 500;
    sendError(res, err.message, status);
  }
};

export const editTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bio, specialization } = req.body;
    const trainer = await updateTrainer(req.params.id, { bio, specialization });
    if (!trainer) { sendError(res, 'Trainer not found', 404); return; }
    sendSuccess(res, trainer, 'Trainer updated');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteTrainer(req.params.id);
    sendSuccess(res, null, 'Trainer deleted');
  } catch (err: any) {
    sendError(res, err.message);
  }
};
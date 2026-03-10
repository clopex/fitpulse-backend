import { Request, Response } from 'express';
import { getUserWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout } from './workout.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getUserWorkouts(req.user!.userId, page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await getWorkoutById(req.params.id, req.user!.userId);
    if (!workout) { sendError(res, 'Workout not found', 404); return; }
    sendSuccess(res, workout);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const addWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await createWorkout(req.user!.userId, req.body);
    sendSuccess(res, workout, 'Workout logged', 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const editWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await updateWorkout(req.params.id, req.user!.userId, req.body);
    if (!workout) { sendError(res, 'Workout not found', 404); return; }
    sendSuccess(res, workout, 'Workout updated');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteWorkout(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Workout deleted');
  } catch (err: any) {
    const status = err.message === 'Workout not found' ? 404 : 500;
    sendError(res, err.message, status);
  }
};
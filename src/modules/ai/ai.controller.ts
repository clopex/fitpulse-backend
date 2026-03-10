import { Request, Response } from 'express';
import { chatWithAI, generateWorkoutPlan, generateNutritionAdvice } from './ai.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;
    if (!message) { sendError(res, 'Message is required', 400); return; }
    const data = await chatWithAI(req.user!.userId, message, history);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const workoutPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, level, days_per_week, equipment } = req.body;
    if (!goal || !level || !days_per_week) {
      sendError(res, 'goal, level and days_per_week are required', 400);
      return;
    }
    const data = await generateWorkoutPlan(req.user!.userId, { goal, level, days_per_week, equipment });
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const nutritionAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, weight_kg, height_cm, age, activity_level } = req.body;
    if (!goal || !weight_kg || !height_cm || !age || !activity_level) {
      sendError(res, 'All fields are required', 400);
      return;
    }
    const data = await generateNutritionAdvice({ goal, weight_kg, height_cm, age, activity_level });
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};
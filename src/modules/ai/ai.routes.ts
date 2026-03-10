import { Router } from 'express';
import { chat, workoutPlan, nutritionAdvice } from './ai.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const aiRoutes = Router();

aiRoutes.post('/chat',      authMiddleware, chat);
aiRoutes.post('/workout-plan',    authMiddleware, workoutPlan);
aiRoutes.post('/nutrition', authMiddleware, nutritionAdvice);
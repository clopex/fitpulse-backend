import { Router } from 'express';
import { getTrainers, getTrainer, getMyTrainerProfile, addTrainer, editTrainer, removeTrainer } from './trainers.controller';
import { createTrainerValidator, updateTrainerValidator } from './trainers.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const trainersRoutes = Router();

// Public
trainersRoutes.get('/',    getTrainers);
trainersRoutes.get('/:id', getTrainer);

// Trainer — vlastiti profil
trainersRoutes.get('/me/profile', authMiddleware, requireRole('trainer'), getMyTrainerProfile);
trainersRoutes.patch('/:id',      authMiddleware, requireRole('trainer', 'admin'), updateTrainerValidator, validate, editTrainer);

// Admin only
trainersRoutes.post('/',      authMiddleware, requireRole('admin'), createTrainerValidator, validate, addTrainer);
trainersRoutes.delete('/:id', authMiddleware, requireRole('admin'), removeTrainer);
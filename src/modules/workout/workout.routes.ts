import { Router } from 'express';
import { getWorkouts, getWorkout, addWorkout, editWorkout, removeWorkout } from './workout.controller';
import { createWorkoutValidator, updateWorkoutValidator } from './workout.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

export const workoutRoutes = Router();

workoutRoutes.get('/',      authMiddleware, getWorkouts);
workoutRoutes.get('/:id',   authMiddleware, getWorkout);
workoutRoutes.post('/',     authMiddleware, createWorkoutValidator, validate, addWorkout);
workoutRoutes.patch('/:id', authMiddleware, updateWorkoutValidator, validate, editWorkout);
workoutRoutes.delete('/:id',authMiddleware, removeWorkout);
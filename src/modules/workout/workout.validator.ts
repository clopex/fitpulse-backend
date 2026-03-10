import { body } from 'express-validator';

export const createWorkoutValidator = [
  body('exercises')
    .notEmpty().withMessage('exercises is required')
    .isArray().withMessage('exercises must be an array'),

  body('exercises.*.name')
    .notEmpty().withMessage('Exercise name is required'),

  body('title').optional().trim(),
  body('duration_min').optional().isInt({ min: 1 }),
  body('notes').optional().trim(),
  body('logged_at').optional().isISO8601().withMessage('Invalid date format'),
];

export const updateWorkoutValidator = [
  body('exercises').optional().isArray(),
  body('title').optional().trim(),
  body('duration_min').optional().isInt({ min: 1 }),
  body('notes').optional().trim(),
];
import { body } from 'express-validator';

export const createClassValidator = [
  body('trainer_id')
    .notEmpty().withMessage('trainer_id is required')
    .isUUID().withMessage('Invalid trainer_id'),

  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title max 100 characters'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),

  body('duration_min')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),

  body('scheduled_at')
    .notEmpty().withMessage('scheduled_at is required')
    .isISO8601().withMessage('Invalid date format'),

  body('description').optional().trim(),
  body('location').optional().trim(),
];

export const updateClassValidator = [
  body('title').optional().trim().isLength({ max: 100 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('duration_min').optional().isInt({ min: 1 }),
  body('scheduled_at').optional().isISO8601(),
  body('description').optional().trim(),
  body('location').optional().trim(),
];
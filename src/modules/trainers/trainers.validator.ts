import { body } from 'express-validator';

export const createTrainerValidator = [
  body('user_id')
    .notEmpty().withMessage('user_id is required')
    .isUUID().withMessage('Invalid user_id format'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio max 500 characters'),

  body('specialization')
    .optional()
    .isArray().withMessage('Specialization must be an array'),
];

export const updateTrainerValidator = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio max 500 characters'),

  body('specialization')
    .optional()
    .isArray().withMessage('Specialization must be an array'),
];
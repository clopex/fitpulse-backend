import { body } from 'express-validator';

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

  body('avatar_url')
    .optional()
    .isURL().withMessage('Invalid avatar URL'),
];
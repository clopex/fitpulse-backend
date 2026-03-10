import { body } from 'express-validator';

export const createBookingValidator = [
  body('class_id')
    .notEmpty().withMessage('class_id is required')
    .isUUID().withMessage('Invalid class_id'),
];

export const checkInValidator = [
  body('qr_token')
    .notEmpty().withMessage('qr_token is required'),
];
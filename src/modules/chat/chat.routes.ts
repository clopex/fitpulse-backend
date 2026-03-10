import { Router } from 'express';
import { conversations, messages, send, readMessages, removeMessage } from './chat.controller';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

export const chatRoutes = Router();

const sendValidator = [
  body('receiver_id').notEmpty().isUUID().withMessage('Invalid receiver_id'),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 1000 }),
];

chatRoutes.get('/conversations',        authMiddleware, conversations);
chatRoutes.get('/:userId',              authMiddleware, messages);
chatRoutes.post('/',                    authMiddleware, sendValidator, validate, send);
chatRoutes.patch('/:userId/read',       authMiddleware, readMessages);
chatRoutes.delete('/:id',              authMiddleware, removeMessage);
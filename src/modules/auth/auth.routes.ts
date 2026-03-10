import { Router } from 'express';
import { register, login, me } from './auth.controller';
import { registerValidator, loginValidator } from './auth.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

export const authRoutes = Router();

authRoutes.post('/register', registerValidator, validate, register);
authRoutes.post('/login',    loginValidator,    validate, login);
authRoutes.get('/me',        authMiddleware,              me);
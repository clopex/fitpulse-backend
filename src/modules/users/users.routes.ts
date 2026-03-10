import { Router } from 'express';
import { getUsers, getUser, updateMe, toggleActive, removeUser } from './users.controller';
import { updateUserValidator } from './users.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const usersRoutes = Router();

// Authenticated user
usersRoutes.patch('/me', authMiddleware, updateUserValidator, validate, updateMe);

// Admin only
usersRoutes.get('/',           authMiddleware, requireRole('admin'), getUsers);
usersRoutes.get('/:id',        authMiddleware, requireRole('admin'), getUser);
usersRoutes.patch('/:id/toggle', authMiddleware, requireRole('admin'), toggleActive);
usersRoutes.delete('/:id',     authMiddleware, requireRole('admin'), removeUser);
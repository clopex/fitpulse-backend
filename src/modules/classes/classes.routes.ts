import { Router } from 'express';
import { getClasses, getClass, addClass, editClass, cancelClassHandler, removeClass } from './classes.controller';
import { createClassValidator, updateClassValidator } from './classes.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const classesRoutes = Router();

// Public
classesRoutes.get('/',    getClasses);
classesRoutes.get('/:id', getClass);

// Trainer + Admin
classesRoutes.post('/',             authMiddleware, requireRole('trainer', 'admin'), createClassValidator, validate, addClass);
classesRoutes.patch('/:id',         authMiddleware, requireRole('trainer', 'admin'), updateClassValidator, validate, editClass);
classesRoutes.patch('/:id/cancel',  authMiddleware, requireRole('trainer', 'admin'), cancelClassHandler);

// Admin only
classesRoutes.delete('/:id', authMiddleware, requireRole('admin'), removeClass);
import { Router } from 'express';
import { getMyBookings, getBookings, getBooking, book, cancel, checkIn } from './bookings.controller';
import { createBookingValidator, checkInValidator } from './bookings.validator';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const bookingsRoutes = Router();

// Authenticated user
bookingsRoutes.get('/me',         authMiddleware, getMyBookings);
bookingsRoutes.post('/',          authMiddleware, createBookingValidator, validate, book);
bookingsRoutes.delete('/:id',     authMiddleware, cancel);

// Trainer + Admin — QR check-in
bookingsRoutes.post('/checkin',   authMiddleware, requireRole('trainer', 'admin'), checkInValidator, validate, checkIn);

// Admin only
bookingsRoutes.get('/',           authMiddleware, requireRole('admin'), getBookings);
bookingsRoutes.get('/:id',        authMiddleware, requireRole('admin'), getBooking);
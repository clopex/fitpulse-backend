import { Request, Response } from 'express';
import { getUserBookings, getAllBookings, getBookingById, createBooking, cancelBooking, checkInBooking } from './bookings.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getUserBookings(req.user!.userId, page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await getAllBookings(page, limit);
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) { sendError(res, 'Booking not found', 404); return; }
    sendSuccess(res, booking);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const book = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class_id } = req.body;
    const booking = await createBooking(req.user!.userId, class_id);
    sendSuccess(res, booking, 'Booking confirmed', 201);
  } catch (err: any) {
    const status = ['Class not found'].includes(err.message) ? 404
      : ['Class is full', 'Already booked this class', 'Class is cancelled'].includes(err.message) ? 400
      : 500;
    sendError(res, err.message, status);
  }
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await cancelBooking(req.params.id, req.user!.userId);
    sendSuccess(res, booking, 'Booking cancelled');
  } catch (err: any) {
    const status = err.message === 'Booking not found' ? 404
      : err.message === 'Unauthorized' ? 403
      : 400;
    sendError(res, err.message, status);
  }
};

export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qr_token } = req.body;
    const booking = await checkInBooking(qr_token);
    sendSuccess(res, booking, 'Check-in successful');
  } catch (err: any) {
    const status = err.message === 'Invalid QR token' ? 404 : 400;
    sendError(res, err.message, status);
  }
};
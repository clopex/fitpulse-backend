import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getUserBookings = async (userId: string, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const bookings = await sequelize.query(
    `SELECT b.id, b.status, b.qr_token, b.checked_in, b.created_at,
            c.id as class_id, c.title, c.scheduled_at, c.duration_min, c.location,
            u.name as trainer_name, u.avatar_url as trainer_avatar
     FROM bookings b
     JOIN classes c ON c.id = b.class_id
     JOIN trainers t ON t.id = c.trainer_id
     JOIN users u ON u.id = t.user_id
     WHERE b.user_id = $1
     ORDER BY c.scheduled_at DESC
     LIMIT $2 OFFSET $3`,
    { bind: [userId, limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM bookings WHERE user_id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  return { bookings, total: parseInt(count[0].total), page, limit };
};

export const getAllBookings = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const bookings = await sequelize.query(
    `SELECT b.id, b.status, b.checked_in, b.created_at,
            b.user_id, u.name as user_name, u.email as user_email,
            c.id as class_id, c.title, c.scheduled_at
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN classes c ON c.id = b.class_id
     ORDER BY b.created_at DESC
     LIMIT $1 OFFSET $2`,
    { bind: [limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM bookings',
    { type: QueryTypes.SELECT }
  ) as any[];

  return { bookings, total: parseInt(count[0].total), page, limit };
};

export const getBookingById = async (id: string) => {
  const result = await sequelize.query(
    `SELECT b.id, b.status, b.qr_token, b.checked_in, b.created_at,
            b.user_id, u.name as user_name,
            c.id as class_id, c.title, c.scheduled_at, c.duration_min, c.location,
            c.capacity,
            (SELECT COUNT(*) FROM bookings b2 WHERE b2.class_id = c.id AND b2.status != 'cancelled') as booked_count
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN classes c ON c.id = b.class_id
     WHERE b.id = $1`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const createBooking = async (userId: string, classId: string) => {
  // Provjeri da li klasa postoji i nije cancelled
  const cls = await sequelize.query(
    `SELECT id, capacity, is_cancelled,
            (SELECT COUNT(*) FROM bookings b WHERE b.class_id = $1 AND b.status != 'cancelled') as booked_count
     FROM classes WHERE id = $1`,
    { bind: [classId], type: QueryTypes.SELECT }
  ) as any[];

  if (!cls[0])              throw new Error('Class not found');
  if (cls[0].is_cancelled)  throw new Error('Class is cancelled');
  if (parseInt(cls[0].booked_count) >= cls[0].capacity) throw new Error('Class is full');

  // Provjeri da li user već ima booking za ovu klasu
  const existing = await sequelize.query(
    `SELECT id FROM bookings WHERE user_id = $1 AND class_id = $2 AND status != 'cancelled'`,
    { bind: [userId, classId], type: QueryTypes.SELECT }
  ) as any[];

  if (existing.length > 0) throw new Error('Already booked this class');

  const result = await sequelize.query(
    `INSERT INTO bookings (user_id, class_id, status)
     VALUES ($1, $2, 'confirmed')
     RETURNING *`,
    { bind: [userId, classId], type: QueryTypes.SELECT }
  ) as any[];

  return result[0];
};

export const cancelBooking = async (id: string, userId: string) => {
  // Provjeri da li booking pripada useru
  const booking = await sequelize.query(
    'SELECT id, user_id, status FROM bookings WHERE id = $1',
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  if (!booking[0])                        throw new Error('Booking not found');
  if (booking[0].user_id !== userId)      throw new Error('Unauthorized');
  if (booking[0].status === 'cancelled')  throw new Error('Booking already cancelled');

  const result = await sequelize.query(
    `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0];
};

export const checkInBooking = async (qrToken: string) => {
  const booking = await sequelize.query(
    `SELECT b.id, b.status, b.checked_in, b.user_id,
            c.scheduled_at
     FROM bookings b
     JOIN classes c ON c.id = b.class_id
     WHERE b.qr_token = $1`,
    { bind: [qrToken], type: QueryTypes.SELECT }
  ) as any[];

  if (!booking[0])                          throw new Error('Invalid QR token');
  if (booking[0].status === 'cancelled')    throw new Error('Booking is cancelled');
  if (booking[0].checked_in)                throw new Error('Already checked in');

  const result = await sequelize.query(
    `UPDATE bookings SET checked_in = true, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    { bind: [booking[0].id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0];
};
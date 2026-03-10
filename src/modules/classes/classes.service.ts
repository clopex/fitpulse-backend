import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getAllClasses = async (filters: {
  trainer_id?: string;
  date?: string;
  page?: number;
  limit?: number;
}) => {
  const page   = filters.page  ?? 1;
  const limit  = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['c.is_cancelled = false'];
  const values: any[] = [];
  let i = 1;

  if (filters.trainer_id) { conditions.push(`c.trainer_id = $${i++}`); values.push(filters.trainer_id); }
  if (filters.date)        { conditions.push(`DATE(c.scheduled_at) = $${i++}`); values.push(filters.date); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  values.push(limit, offset);

  const classes = await sequelize.query(
    `SELECT c.id, c.title, c.description, c.capacity, c.duration_min,
            c.scheduled_at, c.location, c.is_cancelled, c.created_at,
            t.id as trainer_id, u.name as trainer_name, u.avatar_url as trainer_avatar,
            (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status != 'cancelled') as booked_count
     FROM classes c
     JOIN trainers t ON t.id = c.trainer_id
     JOIN users u ON u.id = t.user_id
     ${where}
     ORDER BY c.scheduled_at ASC
     LIMIT $${i++} OFFSET $${i++}`,
    { bind: values, type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    `SELECT COUNT(*) as total FROM classes c ${where}`,
    { bind: values.slice(0, -2), type: QueryTypes.SELECT }
  ) as any[];

  return { classes, total: parseInt(count[0].total), page, limit };
};

export const getClassById = async (id: string) => {
  const result = await sequelize.query(
    `SELECT c.id, c.title, c.description, c.capacity, c.duration_min,
            c.scheduled_at, c.location, c.is_cancelled, c.created_at,
            t.id as trainer_id, u.name as trainer_name, u.avatar_url as trainer_avatar,
            (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status != 'cancelled') as booked_count
     FROM classes c
     JOIN trainers t ON t.id = c.trainer_id
     JOIN users u ON u.id = t.user_id
     WHERE c.id = $1`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const createClass = async (data: {
  trainer_id: string;
  title: string;
  description?: string;
  capacity: number;
  duration_min: number;
  scheduled_at: string;
  location?: string;
}) => {
  const result = await sequelize.query(
    `INSERT INTO classes (trainer_id, title, description, capacity, duration_min, scheduled_at, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    {
      bind: [
        data.trainer_id,
        data.title,
        data.description ?? null,
        data.capacity,
        data.duration_min,
        data.scheduled_at,
        data.location ?? null,
      ],
      type: QueryTypes.SELECT,
    }
  ) as any[];

  return result[0];
};

export const updateClass = async (id: string, data: {
  title?: string;
  description?: string;
  capacity?: number;
  duration_min?: number;
  scheduled_at?: string;
  location?: string;
}) => {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (data.title        !== undefined) { fields.push(`title = $${i++}`);        values.push(data.title); }
  if (data.description  !== undefined) { fields.push(`description = $${i++}`);  values.push(data.description); }
  if (data.capacity     !== undefined) { fields.push(`capacity = $${i++}`);     values.push(data.capacity); }
  if (data.duration_min !== undefined) { fields.push(`duration_min = $${i++}`); values.push(data.duration_min); }
  if (data.scheduled_at !== undefined) { fields.push(`scheduled_at = $${i++}`); values.push(data.scheduled_at); }
  if (data.location     !== undefined) { fields.push(`location = $${i++}`);     values.push(data.location); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);

  const result = await sequelize.query(
    `UPDATE classes SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING *`,
    { bind: values, type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const cancelClass = async (id: string) => {
  const result = await sequelize.query(
    `UPDATE classes SET is_cancelled = true, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const deleteClass = async (id: string) => {
  await sequelize.query(
    'DELETE FROM classes WHERE id = $1',
    { bind: [id], type: QueryTypes.SELECT }
  );
};
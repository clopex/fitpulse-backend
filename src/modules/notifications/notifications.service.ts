import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getUserNotifications = async (userId: string, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const notifications = await sequelize.query(
    `SELECT id, type, title, body, payload, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    { bind: [userId, limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  const unread = await sequelize.query(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = false',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  return {
    notifications,
    total: parseInt(count[0].total),
    unread: parseInt(unread[0].total),
    page,
    limit,
  };
};

export const markAsRead = async (id: string, userId: string) => {
  const result = await sequelize.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    { bind: [id, userId], type: QueryTypes.SELECT }
  ) as any[];

  if (!result[0]) throw new Error('Notification not found');
  return result[0];
};

export const markAllAsRead = async (userId: string) => {
  await sequelize.query(
    `UPDATE notifications SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    { bind: [userId], type: QueryTypes.SELECT }
  );
};

export const createNotification = async (data: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  payload?: object;
}) => {
  const result = await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, body, payload)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    {
      bind: [
        data.user_id,
        data.type,
        data.title,
        data.body ?? null,
        JSON.stringify(data.payload ?? {}),
      ],
      type: QueryTypes.SELECT,
    }
  ) as any[];

  return result[0];
};

export const sendBulkNotification = async (data: {
  user_ids: string[];
  type: string;
  title: string;
  body?: string;
  payload?: object;
}) => {
  const values = data.user_ids.map((_, i) => {
    const base = i * 5;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
  }).join(', ');

  const binds = data.user_ids.flatMap(userId => [
    userId,
    data.type,
    data.title,
    data.body ?? null,
    JSON.stringify(data.payload ?? {}),
  ]);

  await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, body, payload) VALUES ${values}`,
    { bind: binds, type: QueryTypes.SELECT }
  );

  return { sent: data.user_ids.length };
};

export const deleteNotification = async (id: string, userId: string) => {
  const result = await sequelize.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    { bind: [id, userId], type: QueryTypes.SELECT }
  ) as any[];

  if (!result[0]) throw new Error('Notification not found');
};
import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';
import { hashPassword } from '../../utils/hash.utils';

export const getAllUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const users = await sequelize.query(
    `SELECT id, name, email, role, avatar_url, is_active, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    { bind: [limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM users',
    { type: QueryTypes.SELECT }
  ) as any[];

  return { users, total: parseInt(count[0].total), page, limit };
};

export const getUserById = async (id: string) => {
  const result = await sequelize.query(
    `SELECT id, name, email, role, avatar_url, is_active, created_at
     FROM users WHERE id = $1`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const updateUser = async (id: string, data: {
  name?: string;
  avatar_url?: string;
}) => {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (data.name)       { fields.push(`name = $${i++}`);       values.push(data.name); }
  if (data.avatar_url) { fields.push(`avatar_url = $${i++}`); values.push(data.avatar_url); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);

  const result = await sequelize.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, name, email, role, avatar_url, is_active, created_at`,
    { bind: values, type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const toggleUserActive = async (id: string, is_active: boolean) => {
  const result = await sequelize.query(
    `UPDATE users SET is_active = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, is_active`,
    { bind: [is_active, id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const deleteUser = async (id: string) => {
  await sequelize.query(
    'DELETE FROM users WHERE id = $1',
    { bind: [id], type: QueryTypes.SELECT }
  );
};
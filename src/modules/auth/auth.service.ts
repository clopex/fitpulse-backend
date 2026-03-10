import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';
import { hashPassword, comparePassword } from '../../utils/hash.utils';
import { signToken } from '../../utils/jwt.utils';

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await sequelize.query(
    'SELECT id FROM users WHERE email = $1',
    { bind: [email], type: QueryTypes.SELECT }
  );

  if (existing.length > 0) {
    throw new Error('Email already in use');
  }

  const password_hash = await hashPassword(password);

  const result = await sequelize.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    { bind: [name, email, password_hash], type: QueryTypes.SELECT }
  ) as any[];

  const user = result[0];
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const result = await sequelize.query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
    { bind: [email], type: QueryTypes.SELECT }
  ) as any[];

  const user = result[0];

  if (!user) throw new Error('Invalid credentials');
  if (!user.is_active) throw new Error('Account is deactivated');

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  const { password_hash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const getMe = async (userId: string) => {
  const result = await sequelize.query(
    'SELECT id, name, email, role, avatar_url, is_active, created_at FROM users WHERE id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};
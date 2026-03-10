import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getAllTrainers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const trainers = await sequelize.query(
    `SELECT t.id, t.bio, t.specialization, t.rating, t.total_reviews, t.created_at,
            u.id as user_id, u.name, u.email, u.avatar_url
     FROM trainers t
     JOIN users u ON u.id = t.user_id
     ORDER BY t.rating DESC
     LIMIT $1 OFFSET $2`,
    { bind: [limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM trainers',
    { type: QueryTypes.SELECT }
  ) as any[];

  return { trainers, total: parseInt(count[0].total), page, limit };
};

export const getTrainerById = async (id: string) => {
  const result = await sequelize.query(
    `SELECT t.id, t.bio, t.specialization, t.rating, t.total_reviews, t.created_at,
            u.id as user_id, u.name, u.email, u.avatar_url
     FROM trainers t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = $1`,
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const getTrainerByUserId = async (userId: string) => {
  const result = await sequelize.query(
    `SELECT t.id, t.bio, t.specialization, t.rating, t.total_reviews, t.created_at,
            u.id as user_id, u.name, u.email, u.avatar_url
     FROM trainers t
     JOIN users u ON u.id = t.user_id
     WHERE t.user_id = $1`,
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const createTrainer = async (userId: string, data: {
  bio?: string;
  specialization?: string[];
}) => {
  // Provjeri da li user postoji i nije vec trainer
  const existing = await sequelize.query(
    'SELECT id FROM trainers WHERE user_id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  if (existing.length > 0) throw new Error('User is already a trainer');

  // Kreiraj trainer profil
  await sequelize.query(
    `INSERT INTO trainers (user_id, bio, specialization)
     VALUES ($1, $2, $3)`,
    { bind: [userId, data.bio ?? null, data.specialization ?? []], type: QueryTypes.SELECT }
  );

  // Promijeni role u trainer
  await sequelize.query(
    `UPDATE users SET role = 'trainer', updated_at = NOW() WHERE id = $1`,
    { bind: [userId], type: QueryTypes.SELECT }
  );

  return getTrainerByUserId(userId);
};

export const updateTrainer = async (id: string, data: {
  bio?: string;
  specialization?: string[];
}) => {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (data.bio !== undefined)            { fields.push(`bio = $${i++}`);            values.push(data.bio); }
  if (data.specialization !== undefined) { fields.push(`specialization = $${i++}`); values.push(data.specialization); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);

  const result = await sequelize.query(
    `UPDATE trainers SET ${fields.join(', ')}
     WHERE id = $${i}
     RETURNING *`,
    { bind: values, type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const deleteTrainer = async (id: string) => {
  // Dohvati user_id
  const trainer = await sequelize.query(
    'SELECT user_id FROM trainers WHERE id = $1',
    { bind: [id], type: QueryTypes.SELECT }
  ) as any[];

  if (!trainer[0]) throw new Error('Trainer not found');

  // Obrisi trainer profil
  await sequelize.query(
    'DELETE FROM trainers WHERE id = $1',
    { bind: [id], type: QueryTypes.SELECT }
  );

  // Vrati role na user
  await sequelize.query(
    `UPDATE users SET role = 'user', updated_at = NOW() WHERE id = $1`,
    { bind: [trainer[0].user_id], type: QueryTypes.SELECT }
  );
};
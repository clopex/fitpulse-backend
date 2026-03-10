import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getUserWorkouts = async (userId: string, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const workouts = await sequelize.query(
    `SELECT id, title, exercises, duration_min, notes, logged_at, created_at
     FROM workout_logs
     WHERE user_id = $1
     ORDER BY logged_at DESC
     LIMIT $2 OFFSET $3`,
    { bind: [userId, limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM workout_logs WHERE user_id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  // Streak calculation
  const streak = await getUserStreak(userId);

  return { workouts, total: parseInt(count[0].total), streak, page, limit };
};

export const getWorkoutById = async (id: string, userId: string) => {
  const result = await sequelize.query(
    `SELECT id, title, exercises, duration_min, notes, logged_at, created_at
     FROM workout_logs
     WHERE id = $1 AND user_id = $2`,
    { bind: [id, userId], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const createWorkout = async (userId: string, data: {
  title?: string;
  exercises: object[];
  duration_min?: number;
  notes?: string;
  logged_at?: string;
}) => {
  const result = await sequelize.query(
    `INSERT INTO workout_logs (user_id, title, exercises, duration_min, notes, logged_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    {
      bind: [
        userId,
        data.title ?? null,
        JSON.stringify(data.exercises),
        data.duration_min ?? null,
        data.notes ?? null,
        data.logged_at ?? new Date().toISOString(),
      ],
      type: QueryTypes.SELECT,
    }
  ) as any[];

  return result[0];
};

export const updateWorkout = async (id: string, userId: string, data: {
  title?: string;
  exercises?: object[];
  duration_min?: number;
  notes?: string;
}) => {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (data.title        !== undefined) { fields.push(`title = $${i++}`);        values.push(data.title); }
  if (data.exercises    !== undefined) { fields.push(`exercises = $${i++}`);     values.push(JSON.stringify(data.exercises)); }
  if (data.duration_min !== undefined) { fields.push(`duration_min = $${i++}`); values.push(data.duration_min); }
  if (data.notes        !== undefined) { fields.push(`notes = $${i++}`);        values.push(data.notes); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id, userId);

  const result = await sequelize.query(
    `UPDATE workout_logs SET ${fields.join(', ')}
     WHERE id = $${i++} AND user_id = $${i++}
     RETURNING *`,
    { bind: values, type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const deleteWorkout = async (id: string, userId: string) => {
  const result = await sequelize.query(
    'DELETE FROM workout_logs WHERE id = $1 AND user_id = $2 RETURNING id',
    { bind: [id, userId], type: QueryTypes.SELECT }
  ) as any[];

  if (!result[0]) throw new Error('Workout not found');
};

export const getUserStreak = async (userId: string): Promise<number> => {
  const result = await sequelize.query(
    `SELECT DATE(logged_at) as workout_date
     FROM workout_logs
     WHERE user_id = $1
     GROUP BY DATE(logged_at)
     ORDER BY workout_date DESC`,
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  if (result.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < result.length; i++) {
    const workoutDate = new Date(result[i].workout_date);
    workoutDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (workoutDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
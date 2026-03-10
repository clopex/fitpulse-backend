import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getUserSubscription = async (userId: string) => {
  const result = await sequelize.query(
    `SELECT id, plan, status, stripe_sub_id, stripe_customer_id,
            current_period_start, current_period_end, created_at, updated_at
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  return result[0] ?? null;
};

export const getAllSubscriptions = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const subscriptions = await sequelize.query(
    `SELECT s.id, s.plan, s.status, s.stripe_sub_id, s.current_period_end, s.created_at,
            u.id as user_id, u.name, u.email
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC
     LIMIT $1 OFFSET $2`,
    { bind: [limit, offset], type: QueryTypes.SELECT }
  );

  const count = await sequelize.query(
    'SELECT COUNT(*) as total FROM subscriptions',
    { type: QueryTypes.SELECT }
  ) as any[];

  return { subscriptions, total: parseInt(count[0].total), page, limit };
};

export const createOrUpdateSubscription = async (userId: string, data: {
  plan: string;
  status?: string;
  stripe_sub_id?: string;
  stripe_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
}) => {
  // Provjeri da li vec postoji subscription
  const existing = await sequelize.query(
    'SELECT id FROM subscriptions WHERE user_id = $1',
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  if (existing.length > 0) {
    // Update
    const result = await sequelize.query(
      `UPDATE subscriptions
       SET plan = $1, status = $2, stripe_sub_id = $3, stripe_customer_id = $4,
           current_period_start = $5, current_period_end = $6, updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      {
        bind: [
          data.plan,
          data.status ?? 'active',
          data.stripe_sub_id ?? null,
          data.stripe_customer_id ?? null,
          data.current_period_start ?? null,
          data.current_period_end ?? null,
          userId,
        ],
        type: QueryTypes.SELECT,
      }
    ) as any[];

    return result[0];
  } else {
    // Insert
    const result = await sequelize.query(
      `INSERT INTO subscriptions (user_id, plan, status, stripe_sub_id, stripe_customer_id, current_period_start, current_period_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      {
        bind: [
          userId,
          data.plan,
          data.status ?? 'active',
          data.stripe_sub_id ?? null,
          data.stripe_customer_id ?? null,
          data.current_period_start ?? null,
          data.current_period_end ?? null,
        ],
        type: QueryTypes.SELECT,
      }
    ) as any[];

    return result[0];
  }
};

export const cancelSubscription = async (userId: string) => {
  const result = await sequelize.query(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  if (!result[0]) throw new Error('Subscription not found');
  return result[0];
};

export const getSubscriptionStats = async () => {
  const result = await sequelize.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'active') as active,
       COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
       COUNT(*) FILTER (WHERE status = 'expired') as expired,
       COUNT(*) FILTER (WHERE plan = 'free') as free,
       COUNT(*) FILTER (WHERE plan = 'basic') as basic,
       COUNT(*) FILTER (WHERE plan = 'pro') as pro
     FROM subscriptions`,
    { type: QueryTypes.SELECT }
  ) as any[];

  return result[0];
};
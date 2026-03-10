import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

export const getDashboardStats = async () => {
  const [users, trainers, classes, bookings, subscriptions, recentBookings, userGrowth, subPlans] =
    await Promise.all([
      sequelize.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = true) as active,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
         FROM users`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT COUNT(*) as total FROM trainers`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE DATE(scheduled_at) = CURRENT_DATE) as today
         FROM classes WHERE is_cancelled = false`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as this_month
         FROM bookings`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT COUNT(*) FILTER (WHERE plan = 'free') as free,
                COUNT(*) FILTER (WHERE plan = 'basic') as basic,
                COUNT(*) FILTER (WHERE plan = 'pro') as pro,
                COUNT(*) FILTER (WHERE status = 'active') as active
         FROM subscriptions`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT b.id, b.status, b.created_at,
                u.name as user_name, u.email as user_email,
                c.title as class_title
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN classes c ON c.id = b.class_id
         ORDER BY b.created_at DESC
         LIMIT 5`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM users
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,

      sequelize.query(
        `SELECT plan, COUNT(*) as count
         FROM subscriptions
         WHERE status = 'active'
         GROUP BY plan`,
        { type: QueryTypes.SELECT }
      ) as Promise<any[]>,
    ]);

  return {
    users: users[0],
    trainers: trainers[0],
    classes: classes[0],
    bookings: bookings[0],
    subscriptions: subscriptions[0],
    recentBookings,
    userGrowth,
    subPlans,
  };
};
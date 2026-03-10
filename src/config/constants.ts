export const ROLES = {
  USER:    'user',
  TRAINER: 'trainer',
  ADMIN:   'admin',
} as const;

export const BOOKING_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const SUBSCRIPTION_PLAN = {
  FREE:  'free',
  BASIC: 'basic',
  PRO:   'pro',
} as const;

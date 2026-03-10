import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

export const env = {
  PORT:                  parseInt(process.env.PORT || '3000'),
  NODE_ENV:              process.env.NODE_ENV || 'development',
  DATABASE_URL:          required('DATABASE_URL'),
  JWT_SECRET:            required('JWT_SECRET'),
  JWT_EXPIRES_IN:        process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS:         parseInt(process.env.BCRYPT_ROUNDS || '12'),
  IMAGEKIT_PUBLIC_KEY:   process.env.IMAGEKIT_PUBLIC_KEY || '',
  IMAGEKIT_PRIVATE_KEY:  process.env.IMAGEKIT_PRIVATE_KEY || '',
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || '',
  STRIPE_SECRET_KEY:     process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  GROQ_API_KEY:          process.env.GROQ_API_KEY || '',
  FIREBASE_PROJECT_ID:   process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_PRIVATE_KEY:  process.env.FIREBASE_PRIVATE_KEY || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
};
